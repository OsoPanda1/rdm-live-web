import type { TriggerDestination, TriggerEvent } from './types';
import { federationBus } from '@/federaciones/FederationBus';

class TriggerRouter {
  private destinations = new Map<string, TriggerDestination>();

  register(dest: TriggerDestination): void {
    this.destinations.set(dest.id, dest);

    federationBus.emit({
      type: 'TRIGGER_DESTINATION_REGISTERED',
      source: 'PHOENIX',
      payload: { id: dest.id, project: dest.project, path: dest.path },
      traceId: `trig-reg-${dest.id}`,
    });
  }

  unregister(id: string): boolean {
    return this.destinations.delete(id);
  }

  async forward(event: TriggerEvent): Promise<void> {
    const failures: Array<{ destId: string; error: string }> = [];

    for (const [id, dest] of this.destinations) {
      try {
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
      } catch (err) {
        failures.push({ destId: id, error: err instanceof Error ? err.message : 'unknown' });
      }
    }

    if (failures.length > 0) {
      federationBus.emit({
        type: 'TRIGGER_DELIVERY_FAILED',
        source: 'PHOENIX',
        payload: { eventId: event.id, failures },
        traceId: `fail-${event.id}`,
      });
    }
  }

  list(): TriggerDestination[] {
    return Array.from(this.destinations.values());
  }
}

export const triggerRouter = new TriggerRouter();
