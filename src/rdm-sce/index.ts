export * from "./types"

// Modelo S-NDTM
export {
  createGeoPoint,
  createVectorClock,
  tickVectorClock,
  mergeVectorClocks,
  compareVectorClocks,
  validateCoordinates,
  validateConfidence,
  validateFederationId,
  validateHeading,
  buildTerritorialState,
  buildFederationState,
  buildSndtState,
  serializeSndtToJson,
  deserializeSndtFromJson,
  cloneSndtState,
} from "./model/s-ndtm"

// IP Context
export { globalProviderRegistry, ProviderRegistry } from "./ip-context/registry"
export { buildSovereigntyJurisdiction, filterProvidersByPolicy, obfuscateIp } from "./ip-context/jurisdiction"
export { LocalMmdbProvider } from "./ip-context/providers/local-mmdb"
export { RdmMeshProvider } from "./ip-context/providers/rdm-mesh"
export type { IPContext, Jurisdiction, GeolocationProvider } from "./ip-context/provider"

// Mobility
export { MobilityStreamService } from "./mobility/stream-service"
export { MOBILITY_PROFILES, getProfileForTwin } from "./mobility/profiles"
export type { MobilitySample, SamplingConfig, SamplingProfile } from "./mobility/stream-service"

// Federación
export { FederationStateManager } from "./federation/state-manager"
export { VectorClockManager } from "./federation/vector-clock"
export { FEDERATION_MATRIX, getFederationForZone, getFederationById, getFederationsBySyncMode } from "./federation/matrix"
export { SyncModeMachine, SYNC_MODE_PRIORITY, ALLOWED_TRANSITIONS, canTransition } from "./federation/sync-modes"
export type { FederationMatrixEntry, FederationEvent, FederationNodeHealth } from "./federation/state-manager"
export type { SyncModeTransition } from "./federation/sync-modes"

// Gestión Yun
export {
  hashSnapshot,
  hashSnapshots,
  buildMerkleTree,
  getMerkleRoot,
  generateMerkleProof,
  verifyMerkleProof,
} from "./yun/merkle-tree"
export { YunReconciliator, computeMerkleRoot } from "./yun/reconciliation"
export { proveInclusion, verifyInclusion, verifyFederatedInclusion } from "./yun/proof"
export type { MerkleNode } from "./yun/merkle-tree"
export type { ReconciliationResult } from "./yun/reconciliation"

// Spatial Rules
export { SpatialRulesEngine, DEFAULT_RULES } from "./spatial-rules/policies"
export {
  SEMANTIC_ZONES,
  pointInZone,
  resolveZone,
  getFederationsForPosition,
} from "./spatial-rules/semantic-zones"
export type { SemanticZone } from "./spatial-rules/semantic-zones"
export type { RegoRule, RuleInput, RuleOutput } from "./spatial-rules/policies"

// NATS
export { NATS_TOPICS, TOPIC_FEDERATION_MAP, getFederationForTopic, getFederatedTopic } from "./nats/topics"
export type { NatsTopic } from "./nats/topics"

// Degradación
export { IsolationModeManager } from "./degradation/isolation-mode"
export type { IsolationEvent, DegradationCause } from "./degradation/isolation-mode"

// Integración
export { RdmSceFederationBridge } from "./integration/federation-bus"
export { TerritorialBridge } from "./integration/territorial-bridge"
export { RdmSceApiBridge } from "./integration/api-bridge"
export type { TerritorialBridgeEvent } from "./integration/territorial-bridge"
export type { IngestTelemetryInput, IngestTelemetryOutput } from "./integration/api-bridge"
