import { federationBus, type CivicEvent } from "@/lib/tamv-kernel";

export function useCivicEvent() {
  return async function emit(event: Omit<CivicEvent, "id" | "occurredAt"> & Partial<Pick<CivicEvent, "id" | "occurredAt">>) {
    try {
      await federationBus.publish({
        ...event,
        id: event.id ?? crypto.randomUUID(),
        occurredAt: event.occurredAt ?? new Date().toISOString(),
      });
    } catch (error) {
      console.error("Event failed", error);
    }
  };
}
