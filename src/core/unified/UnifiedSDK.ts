import { logger } from '@/lib/logger';
import { unifiedEventBus } from './UnifiedEventBus';
import { unifiedSupervisor } from './UnifiedSupervisor';
import { unifiedPersistence } from './UnifiedPersistence';
import type { Coordenadas, FederationId } from '@/core/models';
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
    if (this.config.enableRealTimeSync) unifiedEventBus.start();
    logger.info('[UNIFIED-SDK] Sistemas unificados listos', { version: this.config.version, environment: this.config.environment });
  }

  async startFusionEngine(): Promise<void> {
    unifiedSupervisor.start(this.config.supervisorIntervalMs);
    if (this.config.enablePersistence) unifiedPersistence.start(this.config.persistenceIntervalMs);
    logger.info('[UNIFIED-SDK] Supervisor + Persistence activados');
  }

  stop(): void {
    unifiedSupervisor.stop(); unifiedPersistence.stop(); unifiedEventBus.stop();
    this.initialized = false;
    logger.info('[UNIFIED-SDK] Todos los sistemas detenidos');
  }

  getSystemState(): ApiResponse<GlobalSystemState> {
    const start = Date.now();
    return { success: true, data: unifiedSupervisor.getState(), traceId: crypto.randomUUID(), timestamp: new Date(), durationMs: Date.now() - start };
  }

  getReadiness() { return unifiedSupervisor.getSystemReadiness(); }
  getEventStats() { return unifiedEventBus.getEventStats(); }
  subscribeToEvents(type: UnifiedEventType, handler: (event: unknown) => void) { return unifiedEventBus.on(type, handler); }
  getPersistenceStats() { return unifiedPersistence.getStats(); }
}

export const unifiedSDK = new UnifiedSDK();
