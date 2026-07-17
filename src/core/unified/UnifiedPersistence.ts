import { logger } from '@/lib/logger';
import type { PersistableContribution, PersistablePipelineResult } from './types';

type SyncCallback = (result: { success: boolean; type: string; error?: string }) => void;

export class UnifiedPersistence {
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private snapshotInterval: ReturnType<typeof setInterval> | null = null;
  private pendingContributions: PersistableContribution[] = [];
  private pendingPipelineResults: PersistablePipelineResult[] = [];
  private listeners: Set<SyncCallback> = new Set();
  private totalSynced = 0;
  private totalFailed = 0;

  start(intervalMs = 60000, _snapshotIntervalMs = 300000): void {
    if (this.syncInterval) return;
    this.syncInterval = setInterval(() => this.syncCycle(), intervalMs);
    logger.info('[Persistence] Persistencia unificada iniciada');
  }

  stop(): void {
    if (this.syncInterval) { clearInterval(this.syncInterval); this.syncInterval = null; }
  }

  subscribe(callback: SyncCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getStats() {
    return { totalSynced: this.totalSynced, totalFailed: this.totalFailed };
  }

  private async syncCycle(): Promise<void> {
    logger.info('[Persistence] Ciclo de sincronización');
  }
}

export const unifiedPersistence = new UnifiedPersistence();
