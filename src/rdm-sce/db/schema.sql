-- =============================================================
-- RDM-SCE: Esquema de Persistencia Geoespacial
-- PostGIS + TimescaleDB para el Ecosistema Georreferenciado RDM
-- =============================================================

-- Extensiones obligatorias del motor
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================
-- TABLA MAESTRA: Snapshots de estado S-NDTM (Digital Twins)
-- =============================================================
CREATE TABLE rdm_spatial_network_twin_states (
    twin_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    current_position GEOMETRY(Point, 4326) NOT NULL,
    accuracy_radius_meters DOUBLE PRECISION NOT NULL,
    altitude_meters DOUBLE PRECISION NOT NULL,
    resolved_ip INET NOT NULL,
    asn INT NOT NULL,
    isp VARCHAR(255) NOT NULL,
    connection_type VARCHAR(50) NOT NULL,
    threat_level VARCHAR(20) NOT NULL,
    motion_type VARCHAR(30) NOT NULL,
    velocity_mps DOUBLE PRECISION NOT NULL,
    heading_degrees DOUBLE PRECISION NOT NULL,
    municipality_code CHAR(3) NOT NULL DEFAULT '039',
    neighborhood VARCHAR(100) NOT NULL,
    federation_id INT NOT NULL CHECK (federation_id BETWEEN 1 AND 7),
    node_id VARCHAR(100) NOT NULL,
    sync_mode VARCHAR(50) NOT NULL,
    confidence_score REAL NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    isabella_policy_id VARCHAR(100) NOT NULL,
    data_origin_source VARCHAR(50) NOT NULL,
    cryptographic_signature VARCHAR(512) NOT NULL,
    merkle_hash VARCHAR(64),
    previous_hash VARCHAR(64),
    sequence BIGINT NOT NULL DEFAULT 1,

    PRIMARY KEY (twin_id, timestamp)
);

-- Hypertable con particionamiento temporal
SELECT create_hypertable(
    'rdm_spatial_network_twin_states',
    'timestamp',
    chunk_time_interval => INTERVAL '24 hours'
);

-- Índice espacial GIST para búsquedas topológicas
CREATE INDEX idx_rdm_states_spatial
    ON rdm_spatial_network_twin_states
    USING GIST (current_position);

-- Índice compuesto federado para análisis de red
CREATE INDEX idx_rdm_states_network_fed
    ON rdm_spatial_network_twin_states (federation_id, node_id, timestamp DESC);

-- Índice para búsquedas por twin_id
CREATE INDEX idx_rdm_states_twin_id
    ON rdm_spatial_network_twin_states (twin_id, timestamp DESC);

-- Índice de zonificación INEGI
CREATE INDEX idx_rdm_states_territorial
    ON rdm_spatial_network_twin_states (municipality_code, neighborhood);

-- =============================================================
-- TABLA: Perímetros de Geocercas (Geofences) Semánticas
-- =============================================================
CREATE TABLE rdm_geofences (
    geofence_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    zone_type VARCHAR(50) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    federation_ids INT[] NOT NULL DEFAULT '{1}',
    min_altitude_meters DOUBLE PRECISION,
    max_altitude_meters DOUBLE PRECISION,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rdm_geofences_spatial
    ON rdm_geofences USING GIST (boundary);

-- =============================================================
-- TABLA: Eventos de Geocerca (enter/exit/dwell)
-- =============================================================
CREATE TABLE rdm_geofence_events (
    event_id BIGSERIAL,
    twin_id UUID NOT NULL,
    geofence_id VARCHAR(100) NOT NULL REFERENCES rdm_geofences(geofence_id),
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('enter', 'exit', 'dwell')),
    position GEOMETRY(Point, 4326) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    federation_id INT NOT NULL,
    metadata JSONB
);

SELECT create_hypertable('rdm_geofence_events', 'timestamp');

CREATE INDEX idx_rdm_geofence_events_twin
    ON rdm_geofence_events (twin_id, timestamp DESC);

-- =============================================================
-- TABLA: Relojes Vectoriales de las Federaciones
-- =============================================================
CREATE TABLE rdm_vector_clocks (
    federation_id INT NOT NULL CHECK (federation_id BETWEEN 1 AND 7),
    node_id VARCHAR(100) NOT NULL,
    vector_clock JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (federation_id, node_id)
);

-- =============================================================
-- TABLA: Árbol Merkle de Gestión Yun
-- =============================================================
CREATE TABLE rdm_yun_merkle_snapshots (
    snapshot_id BIGSERIAL PRIMARY KEY,
    merkle_root VARCHAR(64) NOT NULL,
    block_start TIMESTAMPTZ NOT NULL,
    block_end TIMESTAMPTZ NOT NULL,
    snapshot_count INT NOT NULL,
    federation_id INT NOT NULL,
    node_id VARCHAR(100) NOT NULL,
    signed_hash VARCHAR(512),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rdm_yun_merkle_block
    ON rdm_yun_merkle_snapshots (block_start, block_end);

-- =============================================================
-- TABLA: Políticas de Soberanía Activas
-- =============================================================
CREATE TABLE rdm_sovereignty_policies (
    policy_id VARCHAR(100) PRIMARY KEY,
    node_id VARCHAR(100) NOT NULL,
    federation_id INT NOT NULL,
    governance_mode VARCHAR(50) NOT NULL
        CHECK (governance_mode IN ('strict_sovereignty', 'flexible_partner', 'open_relay')),
    enforce_local_encryption BOOLEAN NOT NULL DEFAULT true,
    policy_manifest JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- FUNCIONES DE CONSULTA GEOESPACIAL
-- =============================================================

-- Obtener twins dentro de un radio determinado
CREATE OR REPLACE FUNCTION rdm_find_twins_within_radius(
    center_lon DOUBLE PRECISION,
    center_lat DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION,
    max_age_minutes INT DEFAULT 5
)
RETURNS TABLE(
    twin_id UUID,
    timestamp TIMESTAMPTZ,
    distance_meters DOUBLE PRECISION,
    federation_id INT,
    motion_type VARCHAR(30)
)
LANGUAGE SQL STABLE
AS $$
    SELECT DISTINCT ON (twin_id)
        twin_id,
        timestamp,
        ST_Distance(
            current_position,
            ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::GEOGRAPHY
        ) AS distance_meters,
        federation_id,
        motion_type
    FROM rdm_spatial_network_twin_states
    WHERE timestamp > NOW() - (max_age_minutes || ' minutes')::INTERVAL
      AND ST_DWithin(
            current_position::GEOGRAPHY,
            ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::GEOGRAPHY,
            radius_meters
          )
    ORDER BY twin_id, timestamp DESC
$$;

-- Obtener heatmap de densidad federada
CREATE OR REPLACE FUNCTION rdm_federation_heatmap(
    grid_size_meters DOUBLE PRECISION DEFAULT 100,
    max_age_minutes INT DEFAULT 10
)
RETURNS TABLE(
    federation_id INT,
    cell_center GEOMETRY(Point, 4326),
    twin_count BIGINT,
    avg_confidence REAL
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        federation_id,
        ST_SetSRID(ST_MakePoint(
            floor(ST_X(current_position) / grid_size_meters * 1000) * grid_size_meters / 1000,
            floor(ST_Y(current_position) / grid_size_meters * 1000) * grid_size_meters / 1000
        ), 4326) AS cell_center,
        COUNT(DISTINCT twin_id) AS twin_count,
        AVG(confidence_score)::REAL AS avg_confidence
    FROM rdm_spatial_network_twin_states
    WHERE timestamp > NOW() - (max_age_minutes || ' minutes')::INTERVAL
    GROUP BY federation_id, cell_center
    ORDER BY twin_count DESC
$$;

-- =============================================================
-- POLÍTICAS DE RETENCIÓN (TimescaleDB)
-- =============================================================
SELECT add_retention_policy('rdm_spatial_network_twin_states', INTERVAL '90 days');
SELECT add_retention_policy('rdm_geofence_events', INTERVAL '30 days');
SELECT add_retention_policy('rdm_yun_merkle_snapshots', INTERVAL '365 days');

-- Política de compresión para datos mayores a 7 días
SELECT add_compression_policy('rdm_spatial_network_twin_states', INTERVAL '7 days');
