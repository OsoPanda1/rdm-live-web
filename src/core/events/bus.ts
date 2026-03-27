/**
 * RDM Core Service — Event Bus territorial tipado
 */

export type EventName =
  | "rdm.system.overload.v1"
  | "rdm.system.mode-changed.v1"
  | "rdm.commerce.created.v1"
  | "rdm.isabella.decision.v1"
  | "rdm.tourist.checkin.v1"
  | "rdm.audit.event.v1";

export interface RDMEvent<T = unknown> {
  name: EventName;
  payload: T;
  timestamp: string;
}

const listeners: Partial<Record<EventName, Array<(e: RDMEvent) => void>>> = {};

export function publish<T>(event: RDMEvent<T>) {
  const ls = listeners[event.name] || [];
  ls.forEach(fn => fn(event as RDMEvent));
}

export function subscribe(name: EventName, fn: (e: RDMEvent) => void): () => void {
  if (!listeners[name]) listeners[name] = [];
  listeners[name]!.push(fn);
  return () => {
    const arr = listeners[name];
    if (arr) {
      const idx = arr.indexOf(fn);
      if (idx >= 0) arr.splice(idx, 1);
    }
  };
}
