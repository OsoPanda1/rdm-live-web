export interface HealthComponent {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  components: HealthComponent[];
}

export class HealthService {
  private readonly startTime = Date.now();

  private async checkComponent(
    name: string,
    check: () => Promise<boolean>,
    timeout = 3000,
  ): Promise<HealthComponent> {
    const start = Date.now();
    try {
      const result = await Promise.race([
        check(),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeout),
        ),
      ]);
      return {
        name,
        status: result ? 'healthy' : 'degraded',
        latency: Date.now() - start,
      };
    } catch (err) {
      return {
        name,
        status: 'unhealthy',
        latency: Date.now() - start,
        error: err instanceof Error ? err.message : 'unknown',
      };
    }
  }

  async getReport(
    customChecks?: Array<{ name: string; check: () => Promise<boolean> }>,
  ): Promise<HealthReport> {
    const checks = customChecks ?? [];

    const results = await Promise.all(
      checks.map((c) => this.checkComponent(c.name, c.check)),
    );

    const status: HealthReport['status'] = results.some((r) => r.status === 'unhealthy')
      ? 'unhealthy'
      : results.some((r) => r.status === 'degraded')
        ? 'degraded'
        : 'healthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      components: results,
    };
  }
}

export const healthService = new HealthService();
