import { unifiedSupervisor } from '@/core/unified/UnifiedSupervisor';
import { unifiedEventBus } from '@/core/unified/UnifiedEventBus';
import { unifiedPersistence } from '@/core/unified/UnifiedPersistence';
import { fusionEngine } from '@/core/territorial/TerritorialFusionEngine';

export async function GET() {
  const state = unifiedSupervisor.getState();
  const readiness = unifiedSupervisor.getSystemReadiness();
  const eventStats = unifiedEventBus.getEventStats();
  const fusionState = fusionEngine.getState();
  const persistenceStats = unifiedPersistence.getStats();

  return Response.json({
    success: true,
    data: {
      system: state,
      readiness,
      events: eventStats,
      fusion: fusionState,
      persistence: persistenceStats,
    },
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'restart':
        fusionEngine.stop();
        fusionEngine.start();
        return Response.json({ success: true, message: 'FusionEngine reiniciado' });

      case 'stop':
        fusionEngine.stop();
        return Response.json({ success: true, message: 'FusionEngine detenido' });

      case 'clear_events':
        unifiedEventBus.clearLog();
        return Response.json({ success: true, message: 'Eventos limpiados' });

      default:
        return Response.json(
          { success: false, error: `Accion desconocida: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
