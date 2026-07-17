import type { TriggerDestination, TriggerEvent } from './types';
<<<<<<< Updated upstream
import { federationBus } from '@/federaciones/FederationBus';
=======
import { logger } from '@/lib/logger';
>>>>>>> Stashed changes

class TriggerRouter {
  private destinations = new Map<string, TriggerDestination>();

  register(dest: TriggerDestination): void {
    this.destinations.set(dest.id, dest);
<<<<<<< Updated upstream

    federationBus.emit({
      type: 'TRIGGER_DESTINATION_REGISTERED',
      source: 'PHOENIX',
      payload: { id: dest.id, project: dest.project, path: dest.path },
      traceId: `trig-reg-${dest.id}`,
    });
=======
    logger.info("[TRIGGER] Destino registrado", { id: dest.id, project: dest.project, path: dest.path });
>>>>>>> Stashed changes
  }

  unregister(id: string): boolean {
    return this.destinations.delete(id);
  }

  async forward(event: TriggerEvent): Promise<void> {
    const failures: Array<{ destId: string; error: string }> = [];

    for (const [id, dest] of this.destinations) {
      try {
<<<<<<< Updated upstream
        federationBus.emit({
          type: 'TRIGGER_FORWARDED',
          source: 'PHOENIX',
          payload: {
            destinationId: id,
            eventId: event.id,
            eventType: event.type,
            url: `/${dest.project}/${dest.branch}${dest.path}`,
          },
          traceId: event.id,
        });
=======
        logger.info("[TRIGGER] Reenviando evento", { destinationId: id, eventId: event.id, eventType: event.type });
>>>>>>> Stashed changes
      } catch (err) {
        failures.push({ destId: id, error: err instanceof Error ? err.message : 'unknown' });
      }
    }

    if (failures.length > 0) {
<<<<<<< Updated upstream
      federationBus.emit({
        type: 'TRIGGER_DELIVERY_FAILED',
        source: 'PHOENIX',
        payload: { eventId: event.id, failures },
        traceId: `fail-${event.id}`,
      });
=======
      logger.error("[TRIGGER] Fallos en entrega", { eventId: event.id, failures });
>>>>>>> Stashed changes
    }
  }

  list(): TriggerDestination[] {
    return Array.from(this.destinations.values());
  }
}

export const triggerRouter = new TriggerRouter();
