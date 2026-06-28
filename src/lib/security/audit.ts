import { createHash } from 'crypto';
import { logger } from '@/lib/logger';

export interface AuditEntry {
  actionType: string;
  actorId: string;
  targetType?: string;
  targetId?: string;
  federationId?: string;
  skillId?: string;
  decision?: string;
  rationale?: string;
  metadata?: Record<string, unknown>;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
}

const localAuditLog: AuditEntry[] = [];

function computeHash(entry: AuditEntry, index: number): string {
  return createHash('sha256')
    .update(`${index}:${entry.actionType}:${entry.actorId}:${Date.now()}:${JSON.stringify(entry.metadata)}`)
    .digest('hex');
}

export function writeAudit(entry: AuditEntry): { logId: string; hash: string } {
  const index = localAuditLog.length;
  const hash = computeHash(entry, index);
  localAuditLog.push(entry);

  if (entry.severity === 'critical') {
    logger.error(`[AUDIT:CRITICAL] ${entry.actionType} por ${entry.actorId} — ${entry.rationale ?? ''}`);
  }

  return { logId: `audit-${index}`, hash };
}

export function getAuditLog(limit = 100): AuditEntry[] {
  return localAuditLog.slice(-limit);
}

export function clearAuditLog(): void {
  localAuditLog.length = 0;
}
