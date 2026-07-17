import { logger } from '@/lib/logger';
import { federationBus } from '@/federaciones/FederationBus';
import { territorialFederationBridge } from '@/federaciones/territorial-federation-bridge';
import { territorialCollector } from '@/core/territorial/TerritorialDataCollector';
import { territorialGeofencer } from '@/core/territorial/TerritorialGeofencer';
import { fusionEngine } from '@/core/territorial/TerritorialFusionEngine';
import { consciousnessPipeline } from '@/isabella/pipeline/IsabellaConsciousnessPipeline';
import { isabellaAPI } from '@/isabella/api';
import { knowledgeEngine } from '@/isabella/knowledge/KnowledgeAbsorptionEngine';
import { awakeningProtocol } from '@/isabella/protocols/IsabellaAwakeningProtocol';
import { motorConciencia } from '@/isabella/core/consciousness';
import { unifiedEventBus } from './UnifiedEventBus';
import { unifiedSupervisor } from './UnifiedSupervisor';
import { unifiedPersistence } from './UnifiedPersistence';
import type { Coordenadas, FederationId, PointOfInterest } from '@/core/models';
import type { ContributionType, ContributionPayload, UserContribution, TerritorialStats } from '@/core/territorial/types';
import type { PipelineResult, PipelineInput } from '@/isabella/pipeline/pipeline.types';
import type { ApiResponse, GlobalSystemState, UnifiedConfig, UnifiedEventType } from './types';
import { DEFAULT_UNIFIED_CONFIG } from './types';

export class UnifiedSDK {
  private config: UnifiedConfig;
  private initialized = false;

  constructor(config: Partial<UnifiedConfig> = {}) {
    this.config = { ...DEFAULT_UNIFIED_CONFIG, ...config };
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (this.config.enableRealTimeSync) {
      unifiedEventBus.start();
    }

    logger.info('[UNIFIED-SDK] Sistemas unificados listos', {
      version: this.config.version,
      environment: this.config.environment,
    });
  }

  async startFusionEngine(): Promise<void> {
    fusionEngine.start();
    unifiedSupervisor.start(this.config.supervisorIntervalMs);

    if (this.config.enablePersistence) {
      unifiedPersistence.start(this.config.persistenceIntervalMs);
    }

    logger.info('[UNIFIED-SDK] Fusion Engine + Supervisor + Persistence activados');
  }

  stop(): void {
    fusionEngine.stop();
    unifiedSupervisor.stop();
    unifiedPersistence.stop();
    unifiedEventBus.stop();
    this.initialized = false;
    logger.info('[UNIFIED-SDK] Todos los sistemas detenidos');
  }

  // ==========================================================================
  // TERRITORIAL OPERATIONS
  // ==========================================================================

  recordContribution(
    userId: string,
    type: ContributionType,
    coords: Coordenadas,
    territorio: string,
    payload: ContributionPayload,
    poiId?: string,
  ): ApiResponse<UserContribution> {
    const start = Date.now();
    try {
      const contribution = territorialCollector.recordContribution(userId, type, coords, territorio, payload, poiId);
      territorialFederationBridge.routeContribution(contribution);

      unifiedEventBus.emit({
        type: 'territorial:contribution',
        source: 'sdk',
        payload: { contributionId: contribution.id, type, territorio },
        metadata: { traceId: contribution.id, userId, territory: territorio, priority: 'normal' },
      });

      return {
        success: true,
        data: contribution,
        traceId: contribution.id,
        timestamp: new Date(),
        durationMs: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
        traceId: crypto.randomUUID(),
        timestamp: new Date(),
        durationMs: Date.now() - start,
      };
    }
  }

  queryTerritory(text: string, userId: string, coords?: Coordenadas): Promise<ApiResponse<PipelineResult>> {
    const start = Date.now();
    return consciousnessPipeline.processInput({
      type: 'user_query',
      query: text,
      userId,
      coords,
    }).then(result => ({
      success: true,
      data: result,
      traceId: result.traceId,
      timestamp: new Date(),
      durationMs: Date.now() - start,
    })).catch(error => ({
      success: false,
      error: String(error),
      traceId: crypto.randomUUID(),
      timestamp: new Date(),
      durationMs: Date.now() - start,
    }));
  }

  getTerritorialStats(): TerritorialStats {
    return territorialCollector.getStats();
  }

  getTerritorialProfile(userId: string) {
    return territorialCollector.getUserProfile(userId);
  }

  getHeatMap() {
    return territorialCollector.getHeatMap();
  }

  getZones() {
    return territorialGeofencer.getAllZones();
  }

  // ==========================================================================
  // ISABELLA OPERATIONS
  // ==========================================================================

  async chatWithIsabella(message: string, userId: string, coords?: Coordenadas): Promise<ApiResponse<PipelineResult>> {
    return this.queryTerritory(message, userId, coords);
  }

  getIsabellaIdentity() {
    return isabellaAPI.identidad();
  }

  getIsabellaConsciousnessLayers() {
    return motorConciencia.getCapas();
  }

  triggerAwakening() {
    return awakeningProtocol.activate(['TWITTER', 'DISCORD', 'TELEGRAM']);
  }

  // ==========================================================================
  // FEDERATION OPERATIONS
  // ==========================================================================

  getFederationModules() {
    return federationBus.getAllFederations();
  }

  getFederation(id: FederationId) {
    return federationBus.getFederation(id);
  }

  routeToFederation(intent: Parameters<typeof federationBus.ruteToFederation>[0], target: FederationId) {
    return federationBus.ruteToFederation(intent, target);
  }

  // ==========================================================================
  // SYSTEM OPERATIONS
  // ==========================================================================

  getSystemState(): ApiResponse<GlobalSystemState> {
    const start = Date.now();
    return {
      success: true,
      data: unifiedSupervisor.getState(),
      traceId: crypto.randomUUID(),
      timestamp: new Date(),
      durationMs: Date.now() - start,
    };
  }

  getReadiness() {
    return unifiedSupervisor.getSystemReadiness();
  }

  getEventStats() {
    return unifiedEventBus.getEventStats();
  }

  subscribeToEvents(type: UnifiedEventType, handler: (event: unknown) => void) {
    return unifiedEventBus.on(type, handler);
  }

  getPersistenceStats() {
    return unifiedPersistence.getStats();
  }
}

export const unifiedSDK = new UnifiedSDK();
