import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import { federationBus } from '@/federaciones/FederationBus';
import type { FederationEvent } from '@/federaciones/FederationBus';
import type { FederationId } from '@/core/models';
import type {
  UnifiedEvent,
  UnifiedEventType,
  UnifiedEventHandler,
} from './types';

export class UnifiedEventBus {
  private handlers: Map<UnifiedEventType, Set<UnifiedEventHandler>> = new Map();
  private wildcardHandlers: Set<UnifiedEventHandler> = new Set();
  private eventLog: UnifiedEvent[] = [];
  private maxLogSize = 1000;
  private eventCounts: Map<UnifiedEventType, number> = new Map();
  private federationUnsubscribe: (() => void) | null = null;

  start(): void {
    // Bridge FederationBus events into UnifiedEventBus
    this.federationUnsubscribe = federationBus.on('*', (fedEvent: FederationEvent) => {
      this.emitFromFederation(fedEvent);
    });

    // Also subscribe to specific federation event types
    const fedTypes = ['TERRITORIAL_EVENT', 'FEDERATION_INTENT', 'SOVEREIGNTY_ALERT', 'GUARDIAN_ACTION',
      'EMOTIONAL_INSIGHT', 'TERRITORIAL_DATA_INGEST', 'TERRITORIAL_HEARTBEAT',
      'ZONE_UPDATE', 'PHYGITAL_OPPORTUNITY', 'HEATMAP_UPDATE', 'TERRITORIAL_STATS_UPDATE'];

    for (const type of fedTypes) {
      federationBus.on(type, (event: FederationEvent) => {
        this.emitFromFederation(event);
      });
    }

    logger.info('[UnifiedEventBus] Bridge FederationBus -> UnifiedEventBus activo');
  }

  stop(): void {
    if (this.federationUnsubscribe) {
      this.federationUnsubscribe();
      this.federationUnsubscribe = null;
    }
  }

  emit(event: Omit<UnifiedEvent, 'id' | 'timestamp'>): UnifiedEvent {
    const full: UnifiedEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date(),
    };

    this.eventLog.push(full);
    if (this.eventLog.length > this.maxLogSize) this.eventLog.shift();

    this.eventCounts.set(full.type, (this.eventCounts.get(full.type) ?? 0) + 1);

    const handlers = this.handlers.get(full.type);
    if (handlers) {
      for (const handler of handlers) {
        try { handler(full); } catch (e) {
          logger.error('[UnifiedEventBus] Error en handler', { type: full.type, error: e });
        }
      }
    }

    for (const handler of this.wildcardHandlers) {
      try { handler(full); } catch (e) {
        logger.error('[UnifiedEventBus] Error en wildcard handler', { type: full.type, error: e });
      }
    }

    return full;
  }

  on(type: UnifiedEventType, handler: UnifiedEventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  onAny(handler: UnifiedEventHandler): () => void {
    this.wildcardHandlers.add(handler);
    return () => this.wildcardHandlers.delete(handler);
  }

  getEventCount(type?: UnifiedEventType): number {
    if (type) return this.eventCounts.get(type) ?? 0;
    return this.eventLog.length;
  }

  getRecentEvents(limit = 50): UnifiedEvent[] {
    return this.eventLog.slice(-limit);
  }

  getEventsByType(type: UnifiedEventType): UnifiedEvent[] {
    return this.eventLog.filter(e => e.type === type);
  }

  getEventStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [type, count] of this.eventCounts) {
      stats[type] = count;
    }
    return stats;
  }

  clearLog(): void {
    this.eventLog = [];
  }

  private emitFromFederation(fedEvent: FederationEvent): void {
    const mappedType = this.mapFederationType(fedEvent.type);
    this.emit({
      type: mappedType,
      source: `federation:${fedEvent.source}`,
      payload: fedEvent.payload,
      metadata: {
        federationId: fedEvent.source,
        traceId: fedEvent.traceId,
        priority: 'normal',
      },
    });
  }

  private mapFederationType(fedType: string): UnifiedEventType {
    const map: Record<string, UnifiedEventType> = {
      TERRITORIAL_EVENT: 'territorial:contribution',
      TERRITORIAL_CHECKIN: 'territorial:contribution',
      TERRITORIAL_REVIEW: 'territorial:contribution',
      TERRITORIAL_PHOTO: 'territorial:contribution',
      TERRITORIAL_RATING: 'territorial:contribution',
      TERRITORIAL_TIP: 'territorial:contribution',
      TERRITORIAL_ROUTE: 'territorial:contribution',
      TERRITORIAL_POI_SUGGESTION: 'territorial:contribution',
      HEATMAP_UPDATE: 'territorial:heat_update',
      TERRITORIAL_STATS_UPDATE: 'territorial:heat_update',
      FEDERATION_INTENT: 'federation:routed',
      SOVEREIGNTY_ALERT: 'federation:sovereignty',
      GUARDIAN_ACTION: 'guardian:decision',
      EMOTIONAL_INSIGHT: 'isabella:emotion',
    };
    return map[fedType] ?? 'system:tick';
  }
}

export const unifiedEventBus = new UnifiedEventBus();
