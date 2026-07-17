import { logger } from "@/lib/logger";

interface DecisionRecord {
  id: string;
  type: string;
  input: unknown;
  output: unknown;
  sovereignty: string;
  timestamp: Date;
  duration: number;
}

export class DecisionStore {
  private history: DecisionRecord[] = [];
  private lastDecision: DecisionRecord | null = null;
  private readonly maxEntries = 1000;

  save(type: string, input: unknown, output: unknown, sovereignty: string, duration: number): DecisionRecord {
    const record: DecisionRecord = {
      id: crypto.randomUUID(),
      type,
      input,
      output,
      sovereignty,
      timestamp: new Date(),
      duration,
    };
    this.history.push(record);
    this.lastDecision = record;
    if (this.history.length > this.maxEntries) this.history.shift();
    logger.debug("[DECISION_STORE] Registro guardado", { id: record.id, type, sovereignty });
    return record;
  }

  getLastDecision<T = DecisionRecord>(): T | null { return this.lastDecision as T | null; }

  getHistory(type?: string): DecisionRecord[] {
    if (type) return this.history.filter(r => r.type === type);
    return [...this.history];
  }

  getStats() {
    const total = this.history.length;
    const byType = this.history.reduce<Record<string, number>>((acc, r) => { acc[r.type] = (acc[r.type] ?? 0) + 1; return acc; }, {});
    const avgDuration = total > 0 ? this.history.reduce((s, r) => s + r.duration, 0) / total : 0;
    return { total, byType, avgDurationMs: Math.round(avgDuration) };
  }

  clear() { this.history = []; this.lastDecision = null; }
}

export const decisionStore = new DecisionStore();