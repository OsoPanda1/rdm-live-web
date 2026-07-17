import { safeBus as safeEventBus } from '@/core/infra/event-bus';
import { publish, subscribe } from '@/core/events/bus';
import { logger } from '@/lib/logger';

let connected = false;

export function connectEventBuses(): void {
  if (connected) return;
  connected = true;

  safeEventBus.on('rdm:core:decision', (payload: unknown) => {
    const { decision, traceId } = payload as { decision: unknown; traceId: string };
    publish({
      name: 'rdm.isabella.decision.v1',
      payload: { decision, traceId },
      timestamp: new Date().toISOString(),
    });
  });

  safeEventBus.on('rdm:core:telemetry', (payload: unknown) => {
    publish({
      name: 'rdm.system.overload.v1',
      payload: { metrics: payload },
      timestamp: new Date().toISOString(),
    });
  });

  subscribe('rdm.audit.event.v1', (event) => {
    safeEventBus.emit('rdm:audit:event', event.payload);
  });

  subscribe('rdm.tourist.checkin.v1', (event) => {
    safeEventBus.emit('rdm:tourist:checkin', event.payload);
  });

  logger.info('[BRIDGE:BUS] Buses de eventos puenteados');
}
