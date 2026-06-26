import { federationBus, type CivicEvent } from "@/lib/tamv-kernel";
import { logger } from "@/lib/logger";

export function useCivicEvent() {
  return async function emit(event: Omit<CivicEvent, "id" | "occurredAt"> & Partial<Pick<CivicEvent, "id" | "occurredAt">>) {
    try {
      await federationBus.publish({
        ...event,
        id: event.id ?? crypto.randomUUID(),
        occurredAt: event.occurredAt ?? new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Event failed", error);
    }
  };
}
