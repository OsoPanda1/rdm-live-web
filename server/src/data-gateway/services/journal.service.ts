import { randomUUID } from "node:crypto";
import { db } from "../../lib/store.js";
import type { GatewayContext, JournalEntry, JournalOperationType, JournalStatus } from "../types.js";

interface JournalRecord {
  id: string;
  operationType: JournalOperationType;
  entityType: string;
  entityId?: string;
  payload: Record<string, unknown>;
  status: JournalStatus;
  idempotencyKey: string;
  supabaseUserId?: string;
  stripeId?: string;
  metadata: Record<string, unknown>;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

const journalMap = db as unknown as Record<string, Map<string, JournalRecord>>;
if (!journalMap.yunBeJournals) {
  (journalMap as any).yunBeJournals = new Map<string, JournalRecord>();
}

function getJournalMap(): Map<string, JournalRecord> {
  return (journalMap as any).yunBeJournals as Map<string, JournalRecord>;
}

export const journalService = {
  async write(entry: {
    operationType: JournalOperationType;
    entityType: string;
    entityId?: string;
    payload: Record<string, unknown>;
    idempotencyKey?: string;
    supabaseUserId?: string;
    stripeId?: string;
    metadata?: Record<string, unknown>;
  }, _context?: GatewayContext): Promise<JournalRecord> {
    const now = new Date().toISOString();
    const idempotencyKey = entry.idempotencyKey ?? `${entry.operationType}_${randomUUID()}`;
    const journal = getJournalMap();

    const existing = Array.from(journal.values()).find((j) => j.idempotencyKey === idempotencyKey);
    if (existing) return existing;

    const record: JournalRecord = {
      id: randomUUID(),
      operationType: entry.operationType,
      entityType: entry.entityType,
      entityId: entry.entityId,
      payload: entry.payload,
      status: "PENDING",
      idempotencyKey,
      supabaseUserId: entry.supabaseUserId,
      stripeId: entry.stripeId,
      metadata: entry.metadata ?? {},
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    journal.set(record.id, record);
    return record;
  },

  async resolve(idempotencyKey: string, status: JournalStatus, result?: Record<string, unknown>): Promise<JournalRecord | null> {
    const journal = getJournalMap();
    const record = Array.from(journal.values()).find((j) => j.idempotencyKey === idempotencyKey);
    if (!record) return null;

    record.status = status;
    record.updatedAt = new Date().toISOString();
    if (result) record.metadata = { ...record.metadata, result };
    journal.set(record.id, record);
    return record;
  },

  async incrementRetry(idempotencyKey: string): Promise<JournalRecord | null> {
    const journal = getJournalMap();
    const record = Array.from(journal.values()).find((j) => j.idempotencyKey === idempotencyKey);
    if (!record) return null;

    record.retryCount++;
    record.updatedAt = new Date().toISOString();
    return record;
  },

  async getPending(): Promise<JournalRecord[]> {
    const journal = getJournalMap();
    return Array.from(journal.values()).filter((j) => j.status === "PENDING");
  },

  async getByIdempotencyKey(key: string): Promise<JournalRecord | null> {
    const journal = getJournalMap();
    return Array.from(journal.values()).find((j) => j.idempotencyKey === key) ?? null;
  },

  async generateRecoveryReport(context: { environment: string }): Promise<{
    id: string;
    startedAt: string;
    endedAt: string;
    operationsReplayed: number;
    incidentsCount: number;
    details: Record<string, unknown>;
  }> {
    const pending = await this.getPending();
    const now = new Date().toISOString();

    const report = {
      id: randomUUID(),
      startedAt: now,
      endedAt: now,
      operationsReplayed: pending.length,
      incidentsCount: pending.filter((j) => j.retryCount > 3).length,
      details: {
        environment: context.environment,
        pendingOperations: pending.map((j) => ({
          operationType: j.operationType,
          entityType: j.entityType,
          idempotencyKey: j.idempotencyKey,
          retryCount: j.retryCount,
          createdAt: j.createdAt,
        })),
        timestamp: now,
      },
    };

    const reports = (db as any).yunBeRecoveryReports as Map<string, unknown> ?? new Map();
    reports.set(report.id, report);

    return report;
  },

  async reconcileWithStripe(stripeIds: string[]): Promise<JournalRecord[]> {
    const journal = getJournalMap();
    const reconciled: JournalRecord[] = [];

    for (const sid of stripeIds) {
      const record = Array.from(journal.values()).find(
        (j) => j.stripeId === sid && j.status !== "RECONCILED"
      );
      if (record) {
        record.status = "RECONCILED";
        record.updatedAt = new Date().toISOString();
        journal.set(record.id, record);
        reconciled.push(record);
      }
    }

    return reconciled;
  },
};
