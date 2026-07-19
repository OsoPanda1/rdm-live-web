import type { TriggerDestination, TriggerEvent } from './types';
import { logger } from '@/lib/logger';

class TriggerRouter {
  private destinations = new Map<string, TriggerDestination>();

  register(dest: TriggerDestination): void {
    this.destinations.set(dest.id, dest);
    logger.info("[TRIGGER] Destino registrado", { id: dest.id, project: dest.project });
  }

  unregister(id: string): boolean {
    return this.destinations.delete(id);
  }

  /**
   * Envío robusto con concurrencia, reintentos y timeouts.
   */
  async forward(event: TriggerEvent): Promise<void> {
    const tasks = Array.from(this.destinations.values()).map(dest => 
      this.deliverWithRetry(dest, event)
    );

    const results = await Promise.allSettled(tasks);
    
    // Logging de errores post-mortem
    results.forEach((res, index) => {
      if (res.status === 'rejected') {
        const destIds = Array.from(this.destinations.keys());
        logger.error("[TRIGGER] Fallo crítico tras reintentos", { 
          destId: destIds[index], 
          eventId: event.id, 
          error: res.reason.message 
        });
      }
    });
  }

  private async deliverWithRetry(
    dest: TriggerDestination, 
    event: TriggerEvent, 
    retries = 3, 
    delay = 1000
  ): Promise<void> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // Timeout de 5s

      const response = await fetch(dest.path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Event-ID': event.id },
        body: JSON.stringify({ ...event, deliveredAt: new Date().toISOString() }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) throw new Error(`Status ${response.status}`);
      
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.deliverWithRetry(dest, event, retries - 1, delay * 2); // Backoff exponencial
      }
      throw err;
    }
  }

  list(): TriggerDestination[] {
    return Array.from(this.destinations.values());
  }
}

export const triggerRouter = new TriggerRouter();
