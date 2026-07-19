export { loadManifest, getManifest, validateManifest } from "./manifest/loader.js";
export type * from "./manifest/types.js";

export { SessionManager, SessionError } from "./session/manager.js";
export type * from "./session/types.js";

export { validateIdentity, validateExecution, decodeToken, decodeBase64Url } from "./security/validator.js";
export type * from "./security/types.js";

export { SandboxManager, Capability, WitHostAdapter } from "./sandbox/manager.js";
export type * from "./sandbox/types.js";

export { Batcher } from "./router/batch.js";
export type { BatchConfig } from "./router/batch.js";
export { RuntimeRouter } from "./router/router.js";

export { QuotaManager, QuotaExceededError } from "./quota/manager.js";

export { TelemetryCollector } from "./telemetry/metrics.js";
export type { MetricSample, LogEntry, MetricLabels } from "./telemetry/metrics.js";

export { GovernanceController, getEffectiveRoles, isFederationAllowed } from "./governance/policies.js";
export type { PolicyChange } from "./governance/policies.js";

// Repository / DAO layer (S-NDTM abstraction)
export { createSupabaseRegistry } from "./repository/supabase-impl.js";
export type {
  SNDTMRegistry, IIdentityRepository, ICommerceRepository,
  IKnowledgeRepository, ITelemetryRepository, IGameplayRepository,
  ITerritorialRepository, Repository, TransactionalRepository,
  UserProfile, MerchantProfile, KnowledgeEntry, TerritorialPOI,
} from "./repository/types.js";

// Service facades (clean frontend boundary)
export { TerritorialService } from "./services/territorial-service.js";
export type { GeoBounds, Coordinate, POIQuery, ContributionInput, TerritorialSummary } from "./services/territorial-service.js";

// WIT interface types
export type { WitHostImports, WitKernelExports } from "./sandbox/wit-host-adapter.js";

const RUNTIME_VERSION = "0.1.0";
export { RUNTIME_VERSION };

export function createRuntime(config: {
  signingKey: Buffer;
  sessionTTLMs?: number;
  maxSessions?: number;
}): RuntimeRouter {
  return new RuntimeRouter({
    signingKey: config.signingKey,
    sessionTTLMs: config.sessionTTLMs ?? 300_000,
    maxSessions: config.maxSessions ?? 10000,
  });
}
