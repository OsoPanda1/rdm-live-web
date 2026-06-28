import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import { territorialCollector } from '@/core/territorial/TerritorialDataCollector';
import { isabellaTerritorialMind } from '@/isabella/territorial/IsabellaTerritorialMind';
import { consciousnessPipeline } from '@/isabella/pipeline/IsabellaConsciousnessPipeline';
import { unifiedEventBus } from './UnifiedEventBus';
import { unifiedSupervisor } from './UnifiedSupervisor';
import type { UserContribution, TerritorialStats } from '@/core/territorial/types';
import type { PipelineResult } from '@/isabella/pipeline/pipeline.types';
import type { PersistableContribution, PersistablePipelineResult, PersistableTerritorialSnapshot } from './types';

type SyncCallback = (result: { success: boolean; type: string; error?: string }) => void;

export class UnifiedPersistence {
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private snapshotInterval: ReturnType<typeof setInterval> | null = null;
  private pendingContributions: PersistableContribution[] = [];
  private pendingPipelineResults: PersistablePipelineResult[] = [];
  private listeners: Set<SyncCallback> = new Set();
  private totalSynced = 0;
  private totalFailed = 0;

  start(intervalMs = 60000, snapshotIntervalMs = 300000): void {
    if (this.syncInterval) return;

    // Subscribe to collector for auto-queuing contributions
    territorialCollector.subscribe((contribution: UserContribution) => {
      this.pendingContributions.push({
        ...contribution,
        syncStatus: 'pending',
      });
      if (this.pendingContributions.length > 500) this.pendingContributions.shift();
    });

    // Subscribe to pipeline results
    this.syncInterval = setInterval(() => this.syncCycle(), intervalMs);
    this.snapshotInterval = setInterval(() => this.takeSnapshot(), snapshotIntervalMs);

    logger.info('[Persistence] Persistencia unificada iniciada');
  }

  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.snapshotInterval = null;
    }
  }

  queuePipelineResult(result: PipelineResult): void {
    this.pendingPipelineResults.push({
      traceId: result.traceId,
      inputType: result.input.type,
      emotionalState: result.emotional.emotion,
      emotionalValence: result.emotional.valence,
      consciousnessLayers: result.consciousness.layerIds,
      federationActions: result.federationActions.length,
      territorialActions: result.territorialActions.length,
      guardianAction: result.guardian.action,
      durationMs: result.durationMs,
      timestamp: new Date(),
    });
    if (this.pendingPipelineResults.length > 200) this.pendingPipelineResults.shift();
  }

  subscribe(callback: SyncCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getStats(): { totalSynced: number; totalFailed: number; pendingContributions: number; pendingPipeline: number } {
    return {
      totalSynced: this.totalSynced,
      totalFailed: this.totalFailed,
      pendingContributions: this.pendingContributions.length,
      pendingPipeline: this.pendingPipelineResults.length,
    };
  }

  private async syncCycle(): Promise<void> {
    const toSync = [...this.pendingContributions.filter(c => c.syncStatus === 'pending')];
    const toSyncPipeline = [...this.pendingPipelineResults];

    for (const contribution of toSync) {
      try {
        await this.syncContribution(contribution);
        contribution.syncStatus = 'synced';
        contribution.syncedAt = new Date();
        this.totalSynced++;
      } catch (error) {
        contribution.syncStatus = 'failed';
        this.totalFailed++;
        logger.warn('[Persistence] Error syncing contribution', { id: contribution.id, error });
      }
    }

    if (toSyncPipeline.length > 0) {
      try {
        await this.syncPipelineResults(toSyncPipeline);
      } catch (error) {
        logger.warn('[Persistence] Error syncing pipeline results', { error });
      }
    }

    this.pendingContributions = this.pendingContributions.filter(c => c.syncStatus !== 'synced');
    this.pendingPipelineResults = [];
  }

  private async syncContribution(contribution: PersistableContribution): Promise<void> {
    const supabase = await this.getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('territorial_contributions').upsert({
      id: contribution.id,
      user_id: contribution.userId,
      type: contribution.type,
      status: contribution.status,
      lat: contribution.coords.lat,
      lng: contribution.coords.lng,
      territorio: contribution.territorio,
      poi_id: contribution.poiId,
      payload: contribution.payload,
      verification_method: contribution.verificationMethod,
      verification_score: contribution.verificationScore,
      reputation_weight: contribution.reputationWeight,
      created_at: contribution.createdAt.toISOString(),
      updated_at: contribution.updatedAt.toISOString(),
    }, { onConflict: 'id' });

    if (error) throw error;
  }

  private async syncPipelineResults(results: PersistablePipelineResult[]): Promise<void> {
    const supabase = await this.getSupabase();
    if (!supabase) return;

    const { error } = await supabase.from('pipeline_results').insert(
      results.map(r => ({
        trace_id: r.traceId,
        input_type: r.inputType,
        emotional_state: r.emotionalState,
        emotional_valence: r.emotionalValence,
        consciousness_layers: r.consciousnessLayers,
        federation_actions: r.federationActions,
        territorial_actions: r.territorialActions,
        guardian_action: r.guardianAction,
        duration_ms: r.durationMs,
        timestamp: r.timestamp.toISOString(),
      }))
    );

    if (error) throw error;
  }

  private async takeSnapshot(): Promise<void> {
    try {
      const state = unifiedSupervisor.getState();
      const snapshotId = uuidv4();

      const snapshot: PersistableTerritorialSnapshot = {
        id: snapshotId,
        timestamp: new Date(),
        stats: territorialCollector.getStats(),
        heatPoints: territorialCollector.getHeatMap().map(h => ({
          lat: h.coords.lat,
          lng: h.coords.lng,
          intensity: h.intensity,
        })),
        activeZones: territorialCollector.getStats().activePOIs > 0
          ? [{ zoneId: 'rdm', userCount: state.activeUsers }]
          : [],
      };

      unifiedEventBus.emit({
        type: 'territorial:heat_update',
        source: 'persistence',
        payload: { snapshotId, stats: snapshot.stats },
        metadata: { traceId: snapshotId, priority: 'low' },
      });

      logger.info('[Persistence] Snapshot tomada', {
        id: snapshotId,
        contributions: snapshot.stats.totalContributions,
        heatPoints: snapshot.heatPoints.length,
      });
    } catch (error) {
      logger.warn('[Persistence] Error tomando snapshot', { error });
    }
  }

  private async getSupabase(): Promise<{ from: (table: string) => { upsert: (data: unknown, opts?: unknown) => Promise<{ error: unknown }>; insert: (data: unknown) => Promise<{ error: unknown }> } } | null> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      return supabase;
    } catch {
      logger.warn('[Persistence] Supabase no disponible, usando solo memoria');
      return null;
    }
  }
}

export const unifiedPersistence = new UnifiedPersistence();
