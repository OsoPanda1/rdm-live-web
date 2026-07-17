import { shutdownProtocol, contextIsolation } from '@/security';
import { safeBus as eventBus } from '@/core/infra/event-bus';
import { publish, subscribe } from '@/core/events/bus';
import { logger } from '@/lib/logger';

let connected = false;

export function connectSystemSecurity(): void {
  if (connected) return;
  connected = true;

  subscribe('rdm.system.mode-changed.v1', (event) => {
    const { mode } = event.payload as { mode: string };
    if (mode === 'EMERGENCY') {
      shutdownProtocol.engage({ level: 'SYSTEM', reason: 'Modo EMERGENCY activado por core' });
      logger.warn('[BRIDGE:SECURITY] Shutdown engage por modo EMERGENCY');
    }
  });

  eventBus.on('rdm:security:isolate', async (payload: unknown) => {
    const { contextId } = payload as { contextId: string };
    contextIsolation.isolate(contextId);
    logger.info('[BRIDGE:SECURITY] Contexto aislado por evento', { contextId });
  });

  logger.info('[BRIDGE:SECURITY] Bridge conectado');
}
