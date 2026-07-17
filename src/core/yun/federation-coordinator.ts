import type { YunFederation, YunDomain, YunFederationHealth } from './types';
import { FEDERATION_DOMAINS, YUN_FEDERATIONS } from './types';
import { publish, createEvent, subscribe } from './event-bus';
import { yunLogger, recordMetric, incrementCounter } from './observability';

interface FederationState { health: YunFederationHealth; lastHeartbeat: string; errorCount: number; requestCount: number; avgLatencyMs: number; }

const federationStates: Map<YunFederation, FederationState> = new Map();
for (const fed of YUN_FEDERATIONS) {
  federationStates.set(fed, {
    health: { federation: fed, status: 'healthy', health_score: 1.0, last_heartbeat: new Date().toISOString(), active_domains: FEDERATION_DOMAINS[fed] ?? [], error_rate: 0, p99_latency_ms: 0 },
    lastHeartbeat: new Date().toISOString(), errorCount: 0, requestCount: 0, avgLatencyMs: 0,
  });
}

export class YunFederationCoordinator {
  private federation: YunFederation;
  constructor(federation: YunFederation) { this.federation = federation; this.setupEventHandlers(); }

  recordRequest(latencyMs: number, success: boolean): void {
    const state = federationStates.get(this.federation); if (!state) return;
    state.requestCount++;
    state.avgLatencyMs = (state.avgLatencyMs * (state.requestCount - 1) + latencyMs) / state.requestCount;
    if (!success) state.errorCount++;
    const errorRate = state.errorCount / Math.max(state.requestCount, 1);
    state.health.error_rate = errorRate; state.health.p99_latency_ms = state.avgLatencyMs * 1.5;
    if (errorRate > 0.1 || state.avgLatencyMs > 5000) { state.health.status = 'critical'; state.health.health_score = Math.max(0, 1 - errorRate * 2); }
    else if (errorRate > 0.05 || state.avgLatencyMs > 2000) { state.health.status = 'degraded'; state.health.health_score = Math.max(0.5, 1 - errorRate); }
    else { state.health.status = 'healthy'; state.health.health_score = Math.min(1, 1 - errorRate * 0.5); }
    incrementCounter('yun_federation_requests_total', { federation: this.federation, success: String(success) });
    recordMetric('yun_federation_latency_ms', latencyMs, { federation: this.federation });
    if (state.health.status === 'critical' || state.health.status === 'degraded')
      publish(createEvent('yun.federation.degraded', 'federation-coordinator', { federation: this.federation, status: state.health.status, error_rate: errorRate, avg_latency_ms: state.avgLatencyMs }, { federation: this.federation }));
  }

  heartbeat(): void {
    const state = federationStates.get(this.federation); if (!state) return;
    state.lastHeartbeat = new Date().toISOString(); state.health.last_heartbeat = state.lastHeartbeat;
    if (state.health.status === 'degraded' && state.health.health_score < 1) {
      state.health.health_score = Math.min(1, state.health.health_score + 0.01);
      if (state.health.health_score >= 0.9) { state.health.status = 'healthy'; publish(createEvent('yun.federation.recovered', 'federation-coordinator', { federation: this.federation, health_score: state.health.health_score }, { federation: this.federation })); }
    }
    incrementCounter('yun_federation_heartbeats_total', { federation: this.federation });
  }

  getHealth(): YunFederationHealth { return federationStates.get(this.federation)?.health ?? { federation: this.federation, status: 'offline', health_score: 0, last_heartbeat: new Date().toISOString(), active_domains: [], error_rate: 1, p99_latency_ms: 0 }; }
  getDomains(): YunDomain[] { return FEDERATION_DOMAINS[this.federation] ?? []; }

  setStatus(status: YunFederationHealth['status'], score?: number): void {
    const state = federationStates.get(this.federation); if (!state) return;
    state.health.status = status; if (score !== undefined) state.health.health_score = score;
    yunLogger.info(`Federation ${this.federation} status set to ${status}`, { federation: this.federation, health_score: state.health.health_score });
  }

  private setupEventHandlers(): void {
    subscribe('yun.federation.degraded', (event) => {
      const data = event.data as { federation: YunFederation };
      if (data.federation !== this.federation) yunLogger.warn(`Federation ${this.federation} detected degradation in ${data.federation}`, { source_federation: data.federation, target_federation: this.federation });
    });
  }
}

export class YunFederationManager {
  private coordinators: Map<YunFederation, YunFederationCoordinator> = new Map();
  constructor() { for (const fed of YUN_FEDERATIONS) this.coordinators.set(fed, new YunFederationCoordinator(fed)); }
  getCoordinator(federation: YunFederation): YunFederationCoordinator { return this.coordinators.get(federation)!; }
  getAllHealth(): YunFederationHealth[] { return Array.from(this.coordinators.values()).map((c) => c.getHealth()); }
  getSystemHealth(): { status: 'healthy' | 'degraded' | 'critical'; score: number; federations: YunFederationHealth[] } {
    const healths = this.getAllHealth();
    const avgScore = healths.reduce((sum, h) => sum + h.health_score, 0) / healths.length;
    const criticalCount = healths.filter((h) => h.status === 'critical').length;
    const degradedCount = healths.filter((h) => h.status === 'degraded').length;
    let status: 'healthy' | 'degraded' | 'critical';
    if (criticalCount > 0 || avgScore < 0.5) status = 'critical';
    else if (degradedCount > 0 || avgScore < 0.8) status = 'degraded';
    else status = 'healthy';
    return { status, score: avgScore, federations: healths };
  }
  heartbeatAll(): void { for (const coordinator of this.coordinators.values()) coordinator.heartbeat(); }
}

export const federationManager = new YunFederationManager();
