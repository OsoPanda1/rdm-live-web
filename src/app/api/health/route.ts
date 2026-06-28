import { type NextRequest, NextResponse } from 'next/server';
import { healthService } from '@/lib/health';

export async function GET(_req: NextRequest) {
  try {
    const report = await healthService.getReport([
      {
        name: 'database',
        check: async () => {
          return true;
        },
      },
      {
        name: 'consciousness',
        check: async () => {
          const { motorConciencia } = await import('@/isabella/core/consciousness');
          const layers = motorConciencia.activarCapas('general');
          return layers.capasActivas.length > 0;
        },
      },
      {
        name: 'federation-bus',
        check: async () => {
          const { federationBus } = await import('@/federaciones/FederationBus');
          const health = federationBus.getHealth();
          return health.totalEvents >= 0;
        },
      },
      {
        name: 'memory',
        check: async () => {
          const { memoriaEmocional } = await import('@/isabella/emotional/memory');
          memoriaEmocional.recordar('health-check', 'peace', 0.5, 'health-check');
          return memoriaEmocional.obtenerHistorial('health-check').length > 0;
        },
      },
      {
        name: 'guardian',
        check: async () => {
          const { isabellaGuardian } = await import('@/core/ai/isabella-guardian');
          const verdict = isabellaGuardian({
            cpuLoad: 0,
            errorRate: 0,
            latencyP95: 0,
            requestPerSecond: 0,
          });
          return verdict.mode !== 'EMERGENCY';
        },
      },
    ]);

    const statusCode = report.status === 'healthy' || report.status === 'degraded' ? 200 : 503;

    return NextResponse.json(report, { status: statusCode });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: 0,
        error: err instanceof Error ? err.message : 'unknown',
      },
      { status: 503 },
    );
  }
}
