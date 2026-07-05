-- YUN Federation Tables — RDM Digital Hub
-- Migration: 20260704000001_federation_tables.sql
-- Adds federation health tracking, event log, and Isabella AI voice logs

-- ============================================================================
-- FEDERATION HEALTH HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS yun_federation_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  federation_id TEXT NOT NULL CHECK (federation_id IN (
    'DEKATEOTL', 'ANUBIS', 'BOOKPI_DATAGIT', 'PHOENIX',
    'MDD_TAMV', 'KAOS_HYPERRENDER', 'CHRONOS'
  )),
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'critical', 'offline')),
  health_score NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (health_score >= 0 AND health_score <= 1),
  error_rate NUMERIC(5,4) DEFAULT 0,
  p99_latency_ms INTEGER DEFAULT 0,
  active_domains JSONB DEFAULT '[]'::jsonb,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yun_federation_health_federation ON yun_federation_health(federation_id);
CREATE INDEX IF NOT EXISTS idx_yun_federation_health_timestamp ON yun_federation_health(created_at DESC);

-- ============================================================================
-- YUN EVENT LOG (persistent event store)
-- ============================================================================

CREATE TABLE IF NOT EXISTS yun_event_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  domain TEXT,
  federation_id TEXT,
  classification TEXT DEFAULT 'internal',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  correlation_id TEXT,
  causation_id TEXT,
  trace_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yun_event_log_type ON yun_event_log(event_type);
CREATE INDEX IF NOT EXISTS idx_yun_event_log_domain ON yun_event_log(domain);
CREATE INDEX IF NOT EXISTS idx_yun_event_log_federation ON yun_event_log(federation_id);
CREATE INDEX IF NOT EXISTS idx_yun_event_log_timestamp ON yun_event_log(created_at DESC);

-- ============================================================================
-- ISABELLA AI VOICE LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS isabella_voice_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  emotion TEXT,
  emotion_intensity NUMERIC(3,2),
  voice_config JSONB DEFAULT '{}'::jsonb,
  duration_ms INTEGER,
  pipeline_trace_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_isabella_voice_logs_user ON isabella_voice_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_isabella_voice_logs_timestamp ON isabella_voice_logs(created_at DESC);

-- ============================================================================
-- YUN DATA CATALOG (persistent data catalog)
-- ============================================================================

CREATE TABLE IF NOT EXISTS yun_data_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL CHECK (domain IN ('identity', 'commerce', 'knowledge', 'telemetry', 'gameplay')),
  entity TEXT NOT NULL,
  federation_scope TEXT,
  database_name TEXT NOT NULL,
  table_or_key TEXT NOT NULL,
  owner TEXT,
  purpose TEXT,
  retention_policy TEXT DEFAULT 'indefinido',
  sensitivity TEXT NOT NULL CHECK (sensitivity IN ('P0', 'P1', 'P2')),
  encryption_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_yun_data_catalog_domain ON yun_data_catalog(domain);
CREATE INDEX IF NOT EXISTS idx_yun_data_catalog_federation ON yun_data_catalog(federation_scope);

-- ============================================================================
-- YUN ADRs (persistent Architecture Decision Records)
-- ============================================================================

CREATE TABLE IF NOT EXISTS yun_adrs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  adr_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('proposed', 'accepted', 'deprecated', 'superseded', 'excepcion')),
  authors JSONB DEFAULT '[]'::jsonb,
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  consequences JSONB DEFAULT '[]'::jsonb,
  superseded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE yun_federation_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE yun_event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE isabella_voice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE yun_data_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE yun_adrs ENABLE ROW LEVEL SECURITY;

-- Federation health: readable by authenticated, writable by service role
CREATE POLICY "yun_federation_health_read" ON yun_federation_health
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "yun_federation_health_write" ON yun_federation_health
  FOR ALL USING (auth.role() = 'service_role');

-- Event log: readable by authenticated, writable by service role
CREATE POLICY "yun_event_log_read" ON yun_event_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "yun_event_log_write" ON yun_event_log
  FOR ALL USING (auth.role() = 'service_role');

-- Voice logs: users can read their own, service role writes
CREATE POLICY "isabella_voice_logs_own_read" ON isabella_voice_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "isabella_voice_logs_service_write" ON isabella_voice_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Data catalog: readable by authenticated, writable by service role
CREATE POLICY "yun_data_catalog_read" ON yun_data_catalog
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "yun_data_catalog_write" ON yun_data_catalog
  FOR ALL USING (auth.role() = 'service_role');

-- ADRs: readable by authenticated, writable by service role
CREATE POLICY "yun_adrs_read" ON yun_adrs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "yun_adrs_write" ON yun_adrs
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- SEED: Initial federation health records
-- ============================================================================

INSERT INTO yun_federation_health (federation_id, status, health_score, active_domains)
VALUES
  ('DEKATEOTL', 'healthy', 1.0, '["identity", "commerce"]'::jsonb),
  ('ANUBIS', 'healthy', 1.0, '["knowledge"]'::jsonb),
  ('BOOKPI_DATAGIT', 'healthy', 1.0, '["identity", "telemetry"]'::jsonb),
  ('PHOENIX', 'healthy', 1.0, '["identity", "telemetry"]'::jsonb),
  ('MDD_TAMV', 'healthy', 1.0, '["commerce"]'::jsonb),
  ('KAOS_HYPERRENDER', 'healthy', 1.0, '["gameplay"]'::jsonb),
  ('CHRONOS', 'healthy', 1.0, '["telemetry", "gameplay"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED: Initial ADRs
-- ============================================================================

INSERT INTO yun_adrs (adr_id, title, status, context, decision, consequences)
VALUES
  ('ADR-001', 'Supabase para Identity', 'accepted',
   'Necesidad de auth integrada, RLS y APIs rápidas para el dominio Identity.',
   'Usar Supabase Postgres como base de identidad.',
   '["Dependencia gestionada de Supabase", "Separación clara de identidad", "RLS nativo"]'::jsonb),
  ('ADR-002', 'Arquitectura event-driven', 'accepted',
   'Necesidad de desacoplar dominios y federaciones.',
   'Adoptar bus de eventos como sistema nervioso de YUN.',
   '["Mayor complejidad inicial", "Mayor resiliencia futura", "Trazabilidad completa"]'::jsonb),
  ('ADR-003', 'YUN como base fundacional', 'accepted',
   'Necesidad de una arquitectura que pueda reaparecer, recuperarse y sostener operación.',
   'Definir YUN como familia de documentos y arquitectura madre.',
   '["Marco único de gobernanza", "Documentación completa", "Versionado de decisiones"]'::jsonb),
  ('ADR-004', 'Modelo heptafederado', 'accepted',
   'Necesidad de representar gobierno, academia, industria, ciudadanía, infra, comunidad y metaverso.',
   'Organizar el sistema en 7 federaciones coordinadas.',
   '["Claridad de responsabilidad", "Escalabilidad orgánica", "Degradación por federación"]'::jsonb)
ON CONFLICT (adr_id) DO NOTHING;
