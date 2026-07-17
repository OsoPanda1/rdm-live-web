/**
 * YUN Event Bus — Constitutional Event System
 * Per YUN Constitution Principle #1 (Truth as Service) and Principle #2 (No Orphans)
 *
 * Every state change MUST flow through this bus.
 * Every event MUST have a trace. No silent mutations.
 */

import type {
  YunEventEnvelope,
  YunEventType,
  YunDomain,
  YunFederation,
  DataClassification,
} from './types';

// ============================================================================
// EVENT BUS STATE
// ============================================================================

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
const MAX_EVENT_LOG = 10000;
const MAX_DEAD_LETTER = 500;

// ============================================================================
// EVENT CREATION
// ============================================================================

/**
 * Creates a YUN-compliant event envelope.
 * Every event gets a unique ID, timestamp, and metadata.
 */
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
  const event: YunEventEnvelope<T> = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    type,
    source,
    timestamp: new Date().toISOString(),
    data,
    metadata: {
      version: '1.0.0',
      correlationId: options.correlationId,
      causationId: options.causationId,
      federation: options.federation,
      domain: options.domain,
      classification: options.classification ?? 'internal',
    },
  };

  return event;
}

// ============================================================================
// PUBLISH
// ============================================================================

/**
 * Publishes an event to all matching subscribers.
 * Per YUN Principle #1: All state changes are observable.
 *
 * @param event - The event envelope to publish
 * @returns Promise that resolves when all handlers have been called
 */
export async function publish<T>(event: YunEventEnvelope<T>): Promise<void> {
  // Log the event (per YUN Principle #1: Truth as Service)
  eventLog.push(event as YunEventEnvelope);
  if (eventLog.length > MAX_EVENT_LOG) {
    eventLog.shift();
  }

  // Find matching handlers
  const handlers = getMatchingHandlers(event.type);

  if (handlers.length === 0) {
    // No handlers — check if this is a critical event
    if (isCriticalEvent(event.type)) {
      deadLetterQueue.push(event as YunEventEnvelope);
      if (deadLetterQueue.length > MAX_DEAD_LETTER) {
        deadLetterQueue.shift();
      }
    }
    return;
  }

  // Execute handlers
  const results = await Promise.allSettled(
    handlers.map(async (sub) => {
      try {
        await sub.handler(event);
      } catch (error) {
        // Per YUN Principle #8: Progressive Autonomy
        // Log error but don't crash the bus
        console.error(`[YUN EventBus] Handler error for ${event.type}:`, error);
        throw error;
      }
    }),
  );

  // Check for failures
  const failures = results.filter((r) => r.status === 'rejected');
  if (failures.length > 0) {
    console.warn(
      `[YUN EventBus] ${failures.length}/${results.length} handlers failed for ${event.type}`,
    );
  }
}

// ============================================================================
// SUBSCRIBE
// ============================================================================

/**
 * Subscribes to events matching a pattern.
 * Supports exact types and wildcard patterns.
 *
 * @param eventType - Event type or pattern (e.g., 'yun.commerce.*' for all commerce events)
 * @param handler - The handler function
 * @param once - If true, automatically unsubscribe after first call
 * @returns Unsubscribe function
 */
export function subscribe(
  eventType: string,
  handler: EventHandler,
  once = false,
): () => void {
  const id = `sub_${++subscriptionCounter}`;

  const subscription: Subscription = {
    id,
    eventType,
    handler,
    once,
  };

  const existing = subscriptions.get(eventType) ?? [];
  existing.push(subscription);
  subscriptions.set(eventType, existing);

  return () => {
    const subs = subscriptions.get(eventType);
    if (subs) {
      const idx = subs.findIndex((s) => s.id === id);
      if (idx >= 0) subs.splice(idx, 1);
    }
  };
}

/**
 * Subscribes to an event type, automatically unsubscribing after first invocation.
 */
export function subscribeOnce(
  eventType: string,
  handler: EventHandler,
): () => void {
  return subscribe(eventType, handler, true);
}

// ============================================================================
// QUERY
// ============================================================================

/**
 * Returns the event log (last N events).
 * Per YUN Principle #1: Truth is queryable.
 */
export function getEventLog(limit = 100): YunEventEnvelope[] {
  return eventLog.slice(-limit);
}

/**
 * Returns the dead letter queue.
 * Per YUN Principle #4: Reversible by Default — failed events are preserved.
 */
export function getDeadLetterQueue(): YunEventEnvelope[] {
  return [...deadLetterQueue];
}

/**
 * Returns subscription count for a given event type.
 */
export function getSubscriptionCount(eventType?: string): number {
  if (eventType) {
    return subscriptions.get(eventType)?.length ?? 0;
  }
  let total = 0;
  for (const subs of subscriptions.values()) {
    total += subs.length;
  }
  return total;
}

/**
 * Clears the dead letter queue.
 */
export function clearDeadLetterQueue(): void {
  deadLetterQueue.length = 0;
}

// ============================================================================
// INTERNALS
// ============================================================================

function getMatchingHandlers(eventType: string): Subscription[] {
  const handlers: Subscription[] = [];

  // Exact match
  const exact = subscriptions.get(eventType);
  if (exact) handlers.push(...exact);

  // Wildcard match (e.g., 'yun.commerce.*' matches 'yun.commerce.business.created')
  for (const [pattern, subs] of subscriptions.entries()) {
    if (pattern === eventType) continue; // Already included exact matches
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '[^.]+') + '$');
      if (regex.test(eventType)) {
        handlers.push(...subs);
      }
    }
  }

  // Remove one-shot subscriptions that have already fired
  for (const sub of handlers) {
    if (sub.once) {
      const subs = subscriptions.get(sub.eventType);
      if (subs) {
        const idx = subs.findIndex((s) => s.id === sub.id);
        if (idx >= 0) subs.splice(idx, 1);
      }
    }
  }

  return handlers;
}

function isCriticalEvent(type: YunEventType): boolean {
  return (
    type.includes('system.overload') ||
    type.includes('system.mode-changed') ||
    type.includes('federation.degraded') ||
    type.includes('federation.recovered')
  );
}

// ============================================================================
// CONVENIENCE PUBLISHERS
// ============================================================================

export const YunEvents = {
  /**
   * Publish a domain entity created event
   */
  created<T>(domain: YunDomain, entity: string, data: T, source: string) {
    return publish(
      createEvent(`yun.${domain}.${entity}.created` as YunEventType, source, data, { domain }),
    );
  },

  /**
   * Publish a domain entity updated event
   */
  updated<T>(domain: YunDomain, entity: string, data: T, source: string) {
    return publish(
      createEvent(`yun.${domain}.${entity}.updated` as YunEventType, source, data, { domain }),
    );
  },

  /**
   * Publish a domain entity deleted event
   */
  deleted<T>(domain: YunDomain, entity: string, data: T, source: string) {
    return publish(
      createEvent(`yun.${domain}.${entity}.deleted` as YunEventType, source, data, { domain }),
    );
  },

  /**
   * Publish a system health event
   */
  health(data: { status: string; score: number; details?: string }, source: string) {
    return publish(
      createEvent('yun.system.health', source, data, { domain: 'telemetry' }),
    );
  },

  /**
   * Publish a federation degraded event
   */
  federationDegraded(federation: YunFederation, data: unknown, source: string) {
    return publish(
      createEvent('yun.federation.degraded', source, data, { federation }),
    );
  },

  /**
   * Publish a federation recovered event
   */
  federationRecovered(federation: YunFederation, data: unknown, source: string) {
    return publish(
      createEvent('yun.federation.recovered', source, data, { federation }),
    );
  },
};
