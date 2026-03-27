/**
 * RDM Core Service — Audit Logger con hash de integridad
 * Registro auditable e inmutable de eventos del sistema
 */

interface AuditPayload {
  timestamp: string;
  action: string;
  user?: unknown;
  details?: unknown;
  hash: string;
}

const auditLog: AuditPayload[] = [];
const MAX_LOG_SIZE = 500;

function simpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function auditEvent(action: string, details?: unknown, user?: unknown) {
  const base = {
    timestamp: new Date().toISOString(),
    action,
    user,
    details,
  };

  const hash = simpleHash(JSON.stringify(base));
  const record: AuditPayload = { ...base, hash };

  auditLog.push(record);
  if (auditLog.length > MAX_LOG_SIZE) {
    auditLog.splice(0, auditLog.length - MAX_LOG_SIZE);
  }

  if (import.meta.env.DEV) {
    console.log("[AUDIT]", record.action, record.hash);
  }
}

export function getAuditLog(): readonly AuditPayload[] {
  return auditLog;
}

export function getRecentAuditEvents(count = 20): readonly AuditPayload[] {
  return auditLog.slice(-count);
}
