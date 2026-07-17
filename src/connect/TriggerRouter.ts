import type { TriggerDestination, TriggerEvent } from './types';
import { logger } from '@/lib/logger';

class TriggerRouter {
  private destinations = new Map<string, TriggerDestination>();

  register(dest: TriggerDestination): void {
    this.destinations.set(dest.id, dest);
    logger.info("[TRIGGER] Destino registrado", { id: dest.id, project: dest.project, path: dest.path });
  }

  unregister(id: string): boolean {
    return this.destinations.delete(id);
  }

  async forward(event: TriggerEvent): Promise<void> {
    const failures: Array<{ destId: string; error: string }> = [];

    for (const [id, dest] of this.destinations) {
      try {
        logger.info("[TRIGGER] Reenviando evento", { destinationId: id, eventId: event.id, eventType: event.type });
      } catch (err) {
        failures.push({ destId: id, error: err instanceof Error ? err.message : 'unknown' });
      }
    }

    if (failures.length > 0) {
      logger.error("[TRIGGER] Fallos en entrega", { eventId: event.id, failures });
    }
  }

  list(): TriggerDestination[] {
    return Array.from(this.destinations.values());
  }
}

export const triggerRouter = new TriggerRouter();
