import type { FederationId, Coordenadas } from '@/core/models';

export interface GlobalSystemState {
  version: string; uptime: number; activeUsers: number; totalContributions: number;
  pipelineProcessed: number; federationModules: ModuleHealth[]; territorialHealth: number;
  isabellaPhase: string; knowledgeEntries: number; geofencerZones: number;
  avgLatencyMs: number; timestamp: Date;
}

export interface ModuleHealth {
  name: string; status: 'healthy' | 'degraded' | 'critical' | 'offline';
  score: number; lastHeartbeat: Date; metrics: Record<string, number>;
}

export type UnifiedEventType =
  | 'territorial:contribution' | 'territorial:zone_enter' | 'territorial:zone_exit'
  | 'territorial:heat_update' | 'isabella:emotion' | 'isabella:consciousness'
  | 'isabella:awakening' | 'isabella:knowledge' | 'federation:routed'
  | 'federation:health_change' | 'federation:sovereignty' | 'pipeline:result'
  | 'pipeline:error' | 'guardian:decision' | 'system:tick' | 'system:alert';

export interface UnifiedEvent {
  id: string; type: UnifiedEventType; source: string; payload: unknown;
  metadata: { federationId?: FederationId; traceId: string; userId?: string; territory?: string; priority: 'low' | 'normal' | 'high' | 'critical'; };
  timestamp: Date;
}

export type UnifiedEventHandler = (event: UnifiedEvent) => void;

export interface PersistableContribution {
  id: string; userId: string; type: string; status: string; coords: Coordenadas;
  territorio: string; poiId?: string; payload: Record<string, unknown>;
  verificationMethod: string; verificationScore: number; reputationWeight: number;
  createdAt: Date; updatedAt: Date; syncedAt?: Date; syncStatus: 'pending' | 'synced' | 'failed';
}

export interface PersistablePipelineResult {
  traceId: string; inputType: string; emotionalState: string; emotionalValence: number;
  consciousnessLayers: string[]; federationActions: number; territorialActions: number;
  guardianAction: string; durationMs: number; timestamp: Date;
}

export interface PersistableTerritorialSnapshot {
  id: string; timestamp: Date; stats: { totalContributions: number; uniqueContributors: number; territoryHealth: number; activePOIs: number; };
  heatPoints: Array<{ lat: number; lng: number; intensity: number }>;
  activeZones: Array<{ zoneId: string; userCount: number }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean; data?: T; error?: string; traceId: string; timestamp: Date; durationMs: number;
}

export interface ReputationScore {
  userId: string; overall: number; contributionScore: number; verificationScore: number;
  communityScore: number; consistencyScore: number; trend: 'rising' | 'stable' | 'declining'; lastUpdated: Date;
}

export interface UnifiedConfig {
  version: string; environment: 'development' | 'staging' | 'production';
  enablePersistence: boolean; enableRealTimeSync: boolean; supervisorIntervalMs: number;
  persistenceIntervalMs: number; snapshotIntervalMs: number; maxConcurrentPipelines: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const DEFAULT_UNIFIED_CONFIG: UnifiedConfig = {
  version: 'GEN-8.0', environment: 'development', enablePersistence: true,
  enableRealTimeSync: true, supervisorIntervalMs: 15000, persistenceIntervalMs: 60000,
  snapshotIntervalMs: 300000, maxConcurrentPipelines: 10, logLevel: 'info',
};
