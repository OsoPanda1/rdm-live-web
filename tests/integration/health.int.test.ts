import { describe, it, expect } from 'vitest';
import { HealthService } from '@/lib/health';

describe('Health Service Integration', () => {
  it('debe reportar healthy cuando todos los checks pasan', async () => {
    const service = new HealthService();
    const report = await service.getReport([
      { name: 'passing-check', check: async () => true },
      { name: 'another-passing', check: async () => true },
    ]);

    expect(report.status).toBe('healthy');
    expect(report.components).toHaveLength(2);
    expect(report.components.every((c) => c.status === 'healthy')).toBe(true);
  });

  it('debe reportar degraded cuando algún check falla', async () => {
    const service = new HealthService();
    const report = await service.getReport([
      { name: 'pass', check: async () => true },
      { name: 'fail', check: async () => false },
    ]);

    expect(report.status).toBe('degraded');
  });

  it('debe reportar unhealthy cuando un check lanza error', async () => {
    const service = new HealthService();
    const report = await service.getReport([
      { name: 'pass', check: async () => true },
      {
        name: 'error',
        check: async () => {
          throw new Error('connection failed');
        },
      },
    ]);

    expect(report.status).toBe('unhealthy');
    expect(report.components.find((c) => c.name === 'error')?.error).toBe('connection failed');
  });

  it('debe incluir timestamp y uptime', async () => {
    const service = new HealthService();
    const report = await service.getReport([]);

    expect(report.timestamp).toBeDefined();
    expect(report.uptime).toBeGreaterThanOrEqual(0);
    expect(() => new Date(report.timestamp)).not.toThrow();
  });
});
