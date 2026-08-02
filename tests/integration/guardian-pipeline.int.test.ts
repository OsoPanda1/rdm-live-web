/**
 * ============================================================================
 * RDM Digital OS — Guardian & Federation Integration Tests
 * Pruebas de integración para el pipeline del Guardián Isabella y el Bus de Eventos.
 * ============================================================================
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isabellaGuardian, GuardianMetrics } from '@/core/ai/isabella-guardian';
import { federationBus } from '@/federaciones/FederationBus';

describe('Guardian → Federation Integration Pipeline', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Limpiar o restablecer estado del bus de federación si expone método de limpieza
    if (typeof federationBus.reset === 'function') {
      federationBus.reset();
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debe permitir modo NORMAL cuando las métricas del sistema son saludables', () => {
    const metrics: GuardianMetrics = {
      errorRate: 0.01,
      latencyP95: 200,
      cpuLoad: 0.4,
      requestPerSecond: 500,
      timestamp: Date.now(),
    };

    const decision = isabellaGuardian(metrics);

    expect(decision.mode).toBe('NORMAL');
    expect(decision.actions).toHaveLength(0);
  });

  it('debe activar modo SAFE de forma preventiva ante alta carga operativa', () => {
    const metrics: GuardianMetrics = {
      errorRate: 0.02,
      latencyP95: 500,
      cpuLoad: 0.85,
      requestPerSecond: 1200,
      timestamp: Date.now(),
    };

    const decision = isabellaGuardian(metrics);

    expect(decision.mode).toBe('SAFE');
    expect(decision.actions.length).toBeGreaterThan(0);
  });

  it('debe activar modo EMERGENCY y aplicar limitaciones ante tasas críticas de error', () => {
    const metrics: GuardianMetrics = {
      errorRate: 0.15,
      latencyP95: 3000,
      cpuLoad: 0.9,
      requestPerSecond: 1500,
      timestamp: Date.now(),
    };

    const decision = isabellaGuardian(metrics);

    expect(decision.mode).toBe('EMERGENCY');
    expect(decision.actions).toContain('limit_requests');
  });

  it('debe emitir y registrar correctamente eventos de federación en el bus', () => {
    federationBus.emit({
      type: 'FEDERATION_SYNC',
      source: 'ANUBIS',
      payload: { mode: 'NORMAL' },
      traceId: 'trace-guardian-test',
    });

    const health = federationBus.getHealth();

    expect(health).toBeDefined();
    expect(health.totalEvents).toBeGreaterThan(0);
  });
});
