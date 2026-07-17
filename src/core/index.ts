/**
 * RDM Digital - Core GEN-7+ Index
 * Exportaciones centralizadas del nucleo de inteligencia territorial
 */

// ============================================================================
// MODELOS Y TIPOS
// ============================================================================

export * from './models';

// ============================================================================
// UTILIDADES GEOESPACIALES
// ============================================================================

export {
  withinBBox,
  fastDistance,
  createBBox,
  calculateBearing,
  calculateSpeed,
  findNearestPoint,
  filterPointsInRadius,
  GeoLRUCache,
  MovementFilter,
} from './geo';

// ============================================================================
// SISTEMA DE METRICAS
// ============================================================================

export {
  Counter,
  Gauge,
  Histogram,
  Registry,
  register,
  // Metricas predefinidas
  isabellaTerritorialDecisionLatencyMs,
  decisionScore,
  decisionsEmittedTotal,
  reviews,
  consentEvents,
  reviewsScore,
  streamConnections,
  activeUsers,
  isabellaGeoLruSize,
  isabellaGeoLruCapacity,
  geoLruHits,
  geoLruMisses,
  isabellaMovementFilterAlpha,
  eventsDroppedTotal,
  eventsProcessedTotal,
  eventQueueSize,
  federationHealth,
  federationModuleStatus,
  kernelLatency,
  intentsProcessed,
  decisionLatency,
  // Utilidades
  ALLOWED_TERRITORIES,
  sanitizeTerritory,
} from './metrics/prometheus';

export type { AllowedTerritory } from './metrics/prometheus';

// ============================================================================
// MOTOR DE SCORING
// ============================================================================

export {
  ScoringEngine,
  defaultScoringEngine,
  // Reglas predefinidas
  proximityToExitRule,
  movementSpeedRule,
  inactivityRule,
  shortVisitRule,
  nearbyPOIsRule,
  zoneSaturationRule,
  DEFAULT_RULES,
} from './engine/ScoringEngine';

// ============================================================================
// ORQUESTADOR DE EXPERIENCIAS
// ============================================================================

export {
  ExperienceOrchestrator,
  EventBus,
  SystemClock,
  FixedClock,
  orchestrator,
} from './orchestrator/ExperienceOrchestrator';

export type { Clock } from './orchestrator/ExperienceOrchestrator';

// ============================================================================
// GUARDIAN AI
// ============================================================================

export { GuardianLearningLoop, guardianLearningLoop } from './ai/GuardianLearningLoop';

// ============================================================================
// SISTEMA TERRITORIAL
// ============================================================================

export {
  territorialCollector,
  TerritorialDataCollector,
  territorialGeofencer,
  TerritorialGeofencer,
  initializeRDMZones,
  fusionEngine,
  TerritorialFusionEngine,
} from './territorial';

export type {
  UserContribution,
  ContributionPayload,
  ContributionType,
  ContributionStatus,
  TerritorialStats,
  UserTerritorialProfile,
  TerritorialHeatPoint,
  TerritorialZone,
  ZoneEvent,
  ZoneAlert,
} from './territorial/types';

// ============================================================================
// SISTEMA UNIFICADO (GEN-8.0)
// ============================================================================

export {
  unifiedEventBus,
  UnifiedEventBus,
  unifiedSupervisor,
  UnifiedSupervisor,
  unifiedPersistence,
  UnifiedPersistence,
  unifiedSDK,
  UnifiedSDK,
} from './unified';

export type {
  GlobalSystemState,
  ModuleHealth,
  UnifiedEvent,
  UnifiedEventType,
  ApiResponse,
  UnifiedConfig,
} from './unified';
