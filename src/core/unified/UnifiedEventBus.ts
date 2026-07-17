import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import type { UnifiedEvent, UnifiedEventType, UnifiedEventHandler } from './types';

export class UnifiedEventBus {
  private handlers: Map<UnifiedEventType, Set<UnifiedEventHandler>> = new Map();
  private wildcardHandlers: Set<UnifiedEventHandler> = new Set();
  private eventLog: UnifiedEvent[] = [];
  private maxLogSize = 1000;
  private eventCounts: Map<UnifiedEventType, number> = new Map();

  start(): void {
    logger.info('[UnifiedEventBus] Bridge activo');
  }

  stop(): void {}

  emit(event: Omit<UnifiedEvent, 'id' | 'timestamp'>): UnifiedEvent {
    const full: UnifiedEvent = { ...event, id: uuidv4(), timestamp: new Date() };
    this.eventLog.push(full);
    if (this.eventLog.length > this.maxLogSize) this.eventLog.shift();
    this.eventCounts.set(full.type, (this.eventCounts.get(full.type) ?? 0) + 1);
    const handlers = this.handlers.get(full.type);
    if (handlers) {
      for (const handler of handlers) {
        try { handler(full); } catch (e) { logger.error('[UnifiedEventBus] Error en handler', { type: full.type, error: e }); }
      }
    }
    for (const handler of this.wildcardHandlers) {
      try { handler(full); } catch (e) { logger.error('[UnifiedEventBus] Error en wildcard', { type: full.type, error: e }); }
    }
    return full;
  }

  on(type: UnifiedEventType, handler: UnifiedEventHandler): () => void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
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

  getRecentEvents(limit = 50): UnifiedEvent[] { return this.eventLog.slice(-limit); }
  getEventsByType(type: UnifiedEventType): UnifiedEvent[] { return this.eventLog.filter(e => e.type === type); }
  getEventStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const [type, count] of this.eventCounts) stats[type] = count;
    return stats;
  }
  clearLog(): void { this.eventLog = []; }
}

export const unifiedEventBus = new UnifiedEventBus();
