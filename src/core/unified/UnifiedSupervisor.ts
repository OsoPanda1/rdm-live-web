import { logger } from '@/lib/logger';
import { federationBus } from '@/federaciones/FederationBus';
import { fusionEngine } from '@/core/territorial/TerritorialFusionEngine';
import { territorialCollector } from '@/core/territorial/TerritorialDataCollector';
import { territorialGeofencer } from '@/core/territorial/TerritorialGeofencer';
import { consciousnessPipeline } from '@/isabella/pipeline/IsabellaConsciousnessPipeline';
import { knowledgeEngine } from '@/isabella/knowledge/KnowledgeAbsorptionEngine';
import { awakeningProtocol } from '@/isabella/protocols/IsabellaAwakeningProtocol';
import { unifiedEventBus } from './UnifiedEventBus';
import type { GlobalSystemState, ModuleHealth } from './types';

interface AlertRule {
  name: string;
  check: () => { triggered: boolean; message: string; severity: 'info' | 'warning' | 'critical' };
}

export class UnifiedSupervisor {
  private interval: ReturnType<typeof setInterval> | null = null;
  private startTime: Date | null = null;
  private alertHistory: Array<{ rule: string; message: string; severity: string; timestamp: Date }> = [];
  private alertRules: AlertRule[] = [];
  private healthHistory: ModuleHealth[][] = [];

  constructor() {
    this.registerDefaultAlerts();
  }

  start(intervalMs = 15000): void {
    if (this.interval) return;
    this.startTime = new Date();
    this.interval = setInterval(() => this.cycle(), intervalMs);

    this.cycle();
    logger.info('[Supervisor] Monitor unificado iniciado');
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getState(): GlobalSystemState {
    const pipelineStats = consciousnessPipeline.getStats();
    const stats = territorialCollector.getStats();
    const awakeningState = awakeningProtocol.getState();
    const feds = federationBus.getAllFederations();

    return {
      version: 'GEN-8.0',
      uptime: this.startTime ? Math.round((Date.now() - this.startTime.getTime()) / 1000) : 0,
      activeUsers: stats.uniqueContributors,
      totalContributions: stats.totalContributions,
      pipelineProcessed: pipelineStats.totalProcessed,
      federationModules: feds.map(f => ({
        name: f.name,
        status: f.health > 0.8 ? 'healthy' : f.health > 0.5 ? 'degraded' : 'critical',
        score: f.operationalScore,
        lastHeartbeat: f.lastHeartbeat ?? new Date(),
        metrics: { health: f.health, ops: f.operationalScore },
      })),
      territorialHealth: stats.territoryHealth,
      isabellaPhase: awakeningState.currentPhase,
      knowledgeEntries: knowledgeEngine.getStats().totalEntries,
      geofencerZones: territorialGeofencer.getAllZones().length,
      avgLatencyMs: Math.round(pipelineStats.avgLatencyMs),
      timestamp: new Date(),
    };
  }

  getModuleHealth(name: string): ModuleHealth | undefined {
    return this.getState().federationModules.find(m => m.name === name);
  }

  getAlertHistory(limit = 50): Array<{ rule: string; message: string; severity: string; timestamp: Date }> {
    return this.alertHistory.slice(-limit);
  }

  getHealthHistory(): ModuleHealth[][] {
    return this.healthHistory;
  }

  registerAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  getSystemReadiness(): { ready: boolean; checks: Array<{ name: string; passed: boolean; detail: string }> } {
    const checks: Array<{ name: string; passed: boolean; detail: string }> = [];

    try {
      const state = this.getState();
      checks.push({ name: 'fusion_engine', passed: fusionEngine.getState().active, detail: 'FusionEngine activo' });
      checks.push({ name: 'federation_bus', passed: state.federationModules.length === 7, detail: `${state.federationModules.length}/7 federaciones` });
      checks.push({ name: 'geofencer', passed: state.geofencerZones > 0, detail: `${state.geofencerZones} zonas` });
      checks.push({ name: 'pipeline', passed: state.pipelineProcessed >= 0, detail: `${state.pipelineProcessed} procesados` });
      checks.push({ name: 'collector', passed: state.totalContributions >= 0, detail: `${state.totalContributions} contribuciones` });
      checks.push({ name: 'knowledge', passed: state.knowledgeEntries >= 0, detail: `${state.knowledgeEntries} entradas` });
      checks.push({ name: 'territorial_health', passed: state.territorialHealth > 0, detail: `${state.territorialHealth.toFixed(2)}` });
      checks.push({ name: 'event_bus', passed: unifiedEventBus.getEventCount() >= 0, detail: `${unifiedEventBus.getEventCount()} eventos` });
    } catch (error) {
      checks.push({ name: 'system_check', passed: false, detail: `Error: ${error}` });
    }

    return {
      ready: checks.every(c => c.passed),
      checks,
    };
  }

  private registerDefaultAlerts(): void {
    this.alertRules = [
      {
        name: 'federation_health',
        check: () => {
          const feds = federationBus.getAllFederations();
          const critical = feds.filter(f => f.health < 0.5);
          if (critical.length > 0) {
            return {
              triggered: true,
              message: `${critical.length} federacion(es) en estado critico: ${critical.map(f => f.name).join(', ')}`,
              severity: 'critical',
            };
          }
          return { triggered: false, message: '', severity: 'info' };
        },
      },
      {
        name: 'pipeline_latency',
        check: () => {
          const stats = consciousnessPipeline.getStats();
          if (stats.avgLatencyMs > 1000) {
            return { triggered: true, message: `Latencia alta en pipeline: ${Math.round(stats.avgLatencyMs)}ms`, severity: 'warning' };
          }
          return { triggered: false, message: '', severity: 'info' };
        },
      },
      {
        name: 'territorial_heat',
        check: () => {
          const stats = territorialCollector.getStats();
          if (stats.territoryHealth < 0.2) {
            return { triggered: true, message: 'Salud territorial baja: necesita mas contribuciones', severity: 'warning' };
          }
          return { triggered: false, message: '', severity: 'info' };
        },
      },
      {
        name: 'event_backlog',
        check: () => {
          const count = unifiedEventBus.getEventCount();
          if (count > 100) {
            return { triggered: true, message: `${count} eventos acumulados en el bus`, severity: 'info' };
          }
          return { triggered: false, message: '', severity: 'info' };
        },
      },
    ];
  }

  private cycle(): void {
    const state = this.getState();
    this.healthHistory.push(state.federationModules);
    if (this.healthHistory.length > 100) this.healthHistory.shift();

    for (const rule of this.alertRules) {
      try {
        const result = rule.check();
        if (result.triggered) {
          this.alertHistory.push({
            rule: rule.name,
            message: result.message,
            severity: result.severity,
            timestamp: new Date(),
          });

          if (result.severity === 'critical') {
            unifiedEventBus.emit({
              type: 'system:alert',
              source: 'supervisor',
              payload: { rule: rule.name, message: result.message },
              metadata: { traceId: crypto.randomUUID(), priority: 'critical' },
            });
          }
        }
      } catch (error) {
        logger.error('[Supervisor] Error evaluando regla', { rule: rule.name, error });
      }
    }

    if (this.alertHistory.length > 200) {
      this.alertHistory.splice(0, this.alertHistory.length - 200);
    }
  }
}

export const unifiedSupervisor = new UnifiedSupervisor();
