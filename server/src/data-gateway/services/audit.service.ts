import { randomUUID } from "node:crypto";
import { db } from "../../lib/store.js";
import type { GatewayContext, SensitivityLevel } from "../types.js";

interface AuditRecord {
  id: string;
  userId?: string;
  serviceId?: string;
  endpoint: string;
  method: string;
  params: Record<string, unknown>;
  statusCode: number;
  durationMs: number;
  sourceIp?: string;
  sensitivityLevel: SensitivityLevel;
  federationId?: string;
  createdAt: string;
}

const auditMap = db as unknown as Record<string, Map<string, AuditRecord>>;
if (!auditMap.dgAuditLogs) {
  (auditMap as any).dgAuditLogs = new Map<string, AuditRecord>();
}

function getAuditMap(): Map<string, AuditRecord> {
  return (auditMap as any).dgAuditLogs as Map<string, AuditRecord>;
}

export const auditService = {
  async log(entry: {
    endpoint: string;
    method: string;
    params?: Record<string, unknown>;
    statusCode: number;
    durationMs: number;
    sensitivityLevel?: SensitivityLevel;
    context?: GatewayContext;
  }): Promise<AuditRecord> {
    const record: AuditRecord = {
      id: randomUUID(),
      userId: entry.context?.userId,
      serviceId: entry.context?.serviceId,
      endpoint: entry.endpoint,
      method: entry.method,
      params: entry.params ?? {},
      statusCode: entry.statusCode,
      durationMs: entry.durationMs,
      sourceIp: entry.context?.sourceIp,
      sensitivityLevel: entry.sensitivityLevel ?? "low",
      federationId: entry.context?.federationId,
      createdAt: new Date().toISOString(),
    };

    getAuditMap().set(record.id, record);
    return record;
  },

  async query(filters?: {
    userId?: string;
    endpoint?: string;
    sensitivityLevel?: SensitivityLevel;
    limit?: number;
  }): Promise<AuditRecord[]> {
    let records = Array.from(getAuditMap().values());

    if (filters?.userId) records = records.filter((r) => r.userId === filters.userId);
    if (filters?.endpoint) records = records.filter((r) => r.endpoint.startsWith(filters.endpoint!));
    if (filters?.sensitivityLevel) records = records.filter((r) => r.sensitivityLevel === filters.sensitivityLevel);

    records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const limit = filters?.limit ?? 100;
    return records.slice(0, limit);
  },
};
