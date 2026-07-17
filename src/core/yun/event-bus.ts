import type {
  YunEventEnvelope,
  YunEventType,
  YunDomain,
  YunFederation,
  DataClassification,
} from "./types";

type EventHandler<T = unknown> = (event: YunEventEnvelope<T>) => void | Promise<void>;

interface Subscription {
  id: string;
  eventType: string;
  handler: EventHandler;
  once: boolean;
}

let subscriptionCounter = 0;
const subscriptions: Map<string, Subscription[]> = new Map();
const deadLetterQueue: YunEventEnvelope[] = [];
const eventLog: YunEventEnvelope[] = [];
const wildcardRegexCache: Map<string, RegExp> = new Map();
const MAX_EVENT_LOG = 10000;
const MAX_DEAD_LETTER = 500;

export function createEvent<T>(
  type: YunEventType,
  source: string,
  data: T,
  options: {
    correlationId?: string;
    causationId?: string;
    federation?: YunFederation;
    domain?: YunDomain;
    classification?: DataClassification;
  } = {},
): YunEventEnvelope<T> {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    type,
    source,
    timestamp: new Date().toISOString(),
    data,
    metadata: {
      version: "1.0.0",
      correlationId: options.correlationId,
      causationId: options.causationId,
      federation: options.federation,
      domain: options.domain,
      classification: options.classification ?? "internal",
    },
  };
}

export async function publish<T>(event: YunEventEnvelope<T>): Promise<void> {
  eventLog.push(event as YunEventEnvelope);
  if (eventLog.length > MAX_EVENT_LOG) eventLog.shift();
  const handlers = getMatchingHandlers(event.type);
  if (handlers.length === 0) {
    if (isCriticalEvent(event.type)) {
      enqueueDeadLetter(event as YunEventEnvelope, "critical_without_handler");
    }
    return;
  }
  await Promise.allSettled(
    handlers.map(async (sub) => {
      try {
        await sub.handler(event);
      } catch (error) {
        console.error(`[YUN EventBus] Error:`, error);
        enqueueDeadLetter(event as YunEventEnvelope, "handler_error");
      } finally {
        if (sub.once) unsubscribeById(sub.eventType, sub.id);
      }
    }),
  );
}

export function subscribe(eventType: string, handler: EventHandler, once = false): () => void {
  const id = `sub_${++subscriptionCounter}`;
  const sub: Subscription = { id, eventType, handler, once };
  const existing = subscriptions.get(eventType) ?? [];
  existing.push(sub);
  subscriptions.set(eventType, existing);
  return () => unsubscribeById(eventType, id);
}

export function subscribeOnce(eventType: string, handler: EventHandler): () => void {
  return subscribe(eventType, handler, true);
}

export function getEventLog(limit = 100): YunEventEnvelope[] {
  return eventLog.slice(-limit);
}

export function getDeadLetterQueue(): YunEventEnvelope[] {
  return [...deadLetterQueue];
}

export function getSubscriptionCount(eventType?: string): number {
  if (eventType) return getMatchingHandlers(eventType).length;
  let total = 0;
  for (const subs of subscriptions.values()) total += subs.length;
  return total;
}

export function clearDeadLetterQueue(): void {
  deadLetterQueue.length = 0;
}

function getMatchingHandlers(eventType: string): Subscription[] {
  const handlers: Subscription[] = [];
  const exact = subscriptions.get(eventType);
  if (exact) handlers.push(...exact);
  for (const [pattern, subs] of subscriptions.entries()) {
    if (pattern === eventType) continue;
    if (pattern.includes("*")) {
      const regex = getWildcardRegex(pattern);
      if (regex.test(eventType)) handlers.push(...subs);
    }
  }
  return handlers;
}

function getWildcardRegex(pattern: string): RegExp {
  const cached = wildcardRegexCache.get(pattern);
  if (cached) return cached;
  const regex = new RegExp(
    "^" +
      pattern
        .split("*")
        .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*") +
      "$",
  );
  wildcardRegexCache.set(pattern, regex);
  return regex;
}

function unsubscribeById(eventType: string, id: string): void {
  const subs = subscriptions.get(eventType);
  if (!subs) return;
  const idx = subs.findIndex((s) => s.id === id);
  if (idx >= 0) subs.splice(idx, 1);
  if (subs.length === 0) subscriptions.delete(eventType);
}

function enqueueDeadLetter(event: YunEventEnvelope, reason: string): void {
  deadLetterQueue.push({
    ...event,
    metadata: { ...event.metadata, deadLetterReason: reason },
  });
  if (deadLetterQueue.length > MAX_DEAD_LETTER) deadLetterQueue.shift();
}

function isCriticalEvent(type: YunEventType): boolean {
  return (
    type.includes("system.overload") ||
    type.includes("system.mode-changed") ||
    type.includes("federation.degraded") ||
    type.includes("federation.recovered")
  );
}

export const YunEvents = {
  created<T>(domain: YunDomain, entity: string, data: T, source: string) {
    return publish(
      createEvent(`yun.${domain}.${entity}.created` as YunEventType, source, data, { domain }),
    );
  },
  updated<T>(domain: YunDomain, entity: string, data: T, source: string) {
    return publish(
      createEvent(`yun.${domain}.${entity}.updated` as YunEventType, source, data, { domain }),
    );
  },
  deleted<T>(domain: YunDomain, entity: string, data: T, source: string) {
    return publish(
      createEvent(`yun.${domain}.${entity}.deleted` as YunEventType, source, data, { domain }),
    );
  },
  health(data: { status: string; score: number; details?: string }, source: string) {
    return publish(createEvent("yun.system.health", source, data, { domain: "telemetry" }));
  },
  federationDegraded(federation: YunFederation, data: unknown, source: string) {
    return publish(createEvent("yun.federation.degraded", source, data, { federation }));
  },
  federationRecovered(federation: YunFederation, data: unknown, source: string) {
    return publish(createEvent("yun.federation.recovered", source, data, { federation }));
  },
};
