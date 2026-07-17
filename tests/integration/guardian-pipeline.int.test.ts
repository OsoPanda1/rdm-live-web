import { describe, it, expect } from 'vitest';
import { isabellaGuardian } from '@/core/ai/isabella-guardian';
import { federationBus } from '@/federaciones/FederationBus';

describe('Guardian → Federation Integration', () => {
  it('debe permitir modo NORMAL con métricas saludables', () => {
    const decision = isabellaGuardian({
      errorRate: 0.01,
      latencyP95: 200,
      cpuLoad: 0.4,
      requestPerSecond: 500,
      timestamp: Date.now(),
    });
    expect(decision.mode).toBe('NORMAL');
    expect(decision.actions).toHaveLength(0);
  });

  it('debe activar modo SAFE con alta carga', () => {
    const decision = isabellaGuardian({
      errorRate: 0.02,
      latencyP95: 500,
      cpuLoad: 0.85,
      requestPerSecond: 1200,
      timestamp: Date.now(),
    });
    expect(decision.mode).toBe('SAFE');
    expect(decision.actions.length).toBeGreaterThan(0);
  });

  it('debe activar modo EMERGENCY con error alto', () => {
    const decision = isabellaGuardian({
      errorRate: 0.15,
      latencyP95: 3000,
      cpuLoad: 0.9,
      requestPerSecond: 1500,
      timestamp: Date.now(),
    });
    expect(decision.mode).toBe('EMERGENCY');
    expect(decision.actions).toContain('limit_requests');
  });

  it('debe emitir eventos de federación', () => {
    federationBus.emit({
      type: 'FEDERATION_SYNC',
      source: 'ANUBIS',
      payload: { mode: 'NORMAL' },
      traceId: 'trace-guardian-test',
    });
    const health = federationBus.getHealth();
    expect(health.totalEvents).toBeGreaterThan(0);
  });
});
