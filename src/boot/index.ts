import { logger } from '@/lib/logger';
import { container } from './container';
import { orchestrator } from '@/core/orchestrator/ExperienceOrchestrator';
import { bootstrapCoreEvents } from '@/core/bootstrap/events';
import { connectEventBuses, connectSystemSecurity, connectIsabellaPipeline } from '@/bridge';
import { consciousnessPipeline } from '@/isabella/pipeline/IsabellaConsciousnessPipeline';
import { shutdownProtocol } from '@/security';

let initialized = false;

export async function bootSystem(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const start = performance.now();

  logger.info('[BOOT] Iniciando sistema RDM Digital Hub v4');

  container.register('orchestrator', orchestrator);
  container.register('consciousnessPipeline', consciousnessPipeline);
  container.register('shutdownProtocol', shutdownProtocol);
  container.register('eventBus', orchestrator.getEventBus());

  try {
    connectEventBuses();
    connectSystemSecurity();
    connectIsabellaPipeline();

    bootstrapCoreEvents();

    const { default: kernel } = await import('@/kernel/index');
    if (kernel && typeof kernel.start === 'function') {
      kernel.start();
    }

    const elapsed = performance.now() - start;
    logger.info('[BOOT] Sistema inicializado correctamente', { elapsedMs: Math.round(elapsed) });
  } catch (error) {
    logger.error('[BOOT] Error en inicializacion del sistema', { error });
    shutdownProtocol.engage({ level: 'SYSTEM', reason: 'Error critico en boot' });
    throw error;
  }
}

export function getContainer() {
  return container;
}
