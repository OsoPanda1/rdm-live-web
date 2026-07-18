export type ConnectionType =
  | "cellular_2g" | "cellular_3g" | "cellular_4g"
  | "cellular_5g" | "wifi_local" | "ethernet_mesh"
  | "satellite" | "unknown"

export type ThreatLevel = "low" | "medium" | "high" | "critical"

export type MotionType =
  | "stationary" | "walking" | "running" | "cycling"
  | "automotive" | "aerial" | "unknown"

export type ZoneType =
  | "urban" | "rural" | "heritage" | "mining_zone"
  | "touristic_corridor" | "ecological_reserve" | "unknown"

export type LocationSource =
  | "ip_core_resolver" | "hardware_gps" | "wifi_triangulation"
  | "cell_tower_proximity" | "rfid_mesh" | "manual_assertion"

export type SyncMode = "online_synchronized" | "offline_autonomous" | "degraded_isolation"

export type FederationId = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface GeoPoint {
  type: "Point"
  coordinates: [number, number] | [number, number, number]
}

export interface VectorClock {
  [nodeId: string]: number
}

export interface FederationState {
  federation_id: FederationId
  node_id: string
  sync_mode: SyncMode
  vector_clock: VectorClock
}

export interface SpatialState {
  current_position: GeoPoint
  accuracy_radius_meters: number
  altitude_meters: number
  current_geofences: string[]
}

export interface NetworkState {
  resolved_ip: string
  asn: number
  isp: string
  connection_type: ConnectionType
  threat_level: ThreatLevel
  proxy_detected: boolean
}

export interface MobilityState {
  motion_type: MotionType
  velocity_mps: number
  heading_degrees: number
  trajectory_id: string
}

export interface TerritorialState {
  country_code: "MX"
  state_code: string
  municipality_code: string
  locality_code: string
  neighborhood: string
  zone_type: ZoneType
}

export interface DataOrigin {
  location_source: LocationSource
  confidence_score: number
  isabella_policy_id: string
  cryptographic_signature: string
}

export interface SndtState {
  twin_id: string
  timestamp: number
  spatial_state: SpatialState
  network_state: NetworkState
  mobility_state: MobilityState
  territorial_state: TerritorialState
  federation_state: FederationState
  data_origin: DataOrigin
}

export interface SndtSnapshot {
  state: SndtState
  merkle_hash: string
  previous_hash: string | null
  sequence: number
}

export interface GeofenceEvent {
  twin_id: string
  geofence_id: string
  event_type: "enter" | "exit" | "dwell"
  timestamp: number
  position: GeoPoint
}

export interface MerkleProof {
  leaf_hash: string
  root_hash: string
  siblings: string[]
  path_indices: number[]
}

export interface SovereigntyPolicy {
  node_id: string
  federation_id: FederationId
  governance_mode: "strict_sovereignty" | "flexible_partner" | "open_relay"
  enforce_local_encryption: boolean
  provider_selection_rules: SovereigntyRule[]
  allowed_data_export: {
    telemetry_rollups: "allowed" | "forbidden"
    raw_coordinates: "allowed" | "forbidden_without_hardware_signature"
  }
}

export interface SovereigntyRule {
  condition: string
  action: string
  target_providers?: string[]
  force_obfuscation_mask?: string
}
