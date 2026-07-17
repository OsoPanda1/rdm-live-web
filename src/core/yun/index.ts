/**
 * YUN Architecture — Core Module
 * Real del Monte Digital Hub
 *
 * Central export point for all YUN infrastructure.
 */

// Types
export * from './types';

// Event Bus
export {
  createEvent,
  publish,
  subscribe,
  subscribeOnce,
  getEventLog,
  getDeadLetterQueue,
  getSubscriptionCount,
  clearDeadLetterQueue,
  YunEvents,
} from './event-bus';

// Gateway
export {
  checkRateLimit,
  getRateLimitHeaders,
  recordFailure,
  recordSuccess,
  checkCircuit,
  getCircuitStates,
  resetCircuit,
  validateRequest,
  processRequest,
} from './gateway';

// Data Fabric
export { dataFabric, YunDataFabric, executeSaga } from './data-fabric';
export type { SagaStep, SagaResult, DataHandler, DataAccessRequest } from './data-fabric';

// Observability
export {
  recordMetric,
  incrementCounter,
  recordHistogram,
  recordGauge,
  getMetrics,
  getMetricsJson,
  yunLogger,
  getLogs,
  startSpan,
  finishSpan,
  traced,
  getTrace,
  getRecentTraces,
  runHealthCheck,
} from './observability';

// Federation Coordinators
export {
  YunFederationCoordinator,
  YunFederationManager,
  federationManager,
} from './federation-coordinator';

// Event Bus Bridge (unified TAMV ↔ YUN ↔ Core)
export {
  publishUnified,
  subscribeUnified,
  getUnifiedFederationHealth,
  initEventBusBridge,
} from './event-bus-bridge';

// YUN-native Sovereign Module Manifest
export {
  RDMX_MODULES,
  MODULE_ALIASES,
} from './rdmxManifest';
export type {
  ModuleType,
  ModuleStatus,
  CriticalityLevel,
  SovereignDomain,
  YunDomain,
  FederationId,
  ResilienceMode,
  YunBinding,
  RepoModule,
} from './rdmxManifest';

// YUN Manifest Validator
export {
  validateYunManifest,
} from './manifestValidator';
export type {
  Severity,
  ValidationIssue,
} from './manifestValidator';

// YUN Manifest Artifacts
export {
  buildYunAccessMatrix,
  buildYunEventsMap,
  buildFederationResilience,
  buildYunModuleSummary,
  generateAllArtifacts,
} from './manifestArtifacts';
