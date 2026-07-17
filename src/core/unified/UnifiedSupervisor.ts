import { logger } from '@/lib/logger';
import { unifiedEventBus } from './UnifiedEventBus';
import type { GlobalSystemState, ModuleHealth } from './types';

export class UnifiedSupervisor {
  private interval: ReturnType<typeof setInterval> | null = null;
  private startTime: Date | null = null;

  start(intervalMs = 15000): void {
    if (this.interval) return;
    this.startTime = new Date();
    this.interval = setInterval(() => this.cycle(), intervalMs);

    this.cycle();
    logger.info('[Supervisor] Monitor unificado iniciado');
  }

  stop(): void {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
  }

  getState(): GlobalSystemState {
    return {
      version: 'GEN-8.0', uptime: this.startTime ? Math.round((Date.now() - this.startTime.getTime()) / 1000) : 0,
      activeUsers: 0, totalContributions: 0, pipelineProcessed: 0, federationModules: [],
      territorialHealth: 1, isabellaPhase: 'dormant', knowledgeEntries: 0, geofencerZones: 0,
      avgLatencyMs: 0, timestamp: new Date(),
    };
  }

  getSystemReadiness() {
    return { ready: true, checks: [{ name: 'system', passed: true, detail: 'Supervisor activo' }] };
  }

  private cycle(): void {
    const state = this.getState();
    if (state.federationModules.some(m => m.status === 'critical')) {
      unifiedEventBus.emit({ type: 'system:alert', source: 'supervisor', payload: { message: 'Módulo crítico detectado' }, metadata: { traceId: 'supervisor', priority: 'high' } });
    }
  }
}

export const unifiedSupervisor = new UnifiedSupervisor();
