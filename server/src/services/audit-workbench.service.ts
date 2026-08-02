import {
  db,
  type AuditChecklistItemRecord,
  type AuditEvidenceRecord,
  type FreezeDecisionRecord,
} from "../lib/store.js";
import { appendBookpiNarrative, emitMsrEvent } from "./audit.service.js";

export type AuditLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type AuditPriority = "P0" | "P1" | "P2" | "P3";
export type AuditStatus = "pending" | "in_review" | "blocked" | "approved" | "requires_remediation";

export interface MasterAuditChecklistSeed {
  id: string;
  level: AuditLevel;
  modulePath: string;
  description: string;
  risk: string;
  priority: AuditPriority;
  owner: string;
  notes: string;
}

export interface AuditEvidenceInput {
  itemId: string;
  actorId: string;
  status: AuditStatus;
  command?: string;
  result?: "pass" | "warning" | "fail";
  notes: string;
  sourceUrl?: string;
}

export interface FreezeReadiness {
  ready: boolean;
  blockers: Array<{ itemId: string; modulePath: string; reason: string }>;
  totals: Record<AuditPriority, { total: number; closed: number }>;
}

export const MASTER_AUDIT_CHECKLIST: MasterAuditChecklistSeed[] = [
  {
    id: "L1-security",
    level: 1,
    modulePath: "runtime/pkg/security/",
    description: "Validación de doble zero-trust, identidad y ejecución.",
    risk: "Bypass de identidad, ejecución no autorizada o degradación del perímetro.",
    priority: "P0",
    owner: "Seguridad / Runtime",
    notes: "Confirmar equivalencia con runtime/src/security/ si el runtime sigue en TypeScript.",
  },
  {
    id: "L1-session",
    level: 1,
    modulePath: "runtime/pkg/session/",
    description: "Session Tickets con HMAC-SHA256, LRU cache y TTL.",
    risk: "Secuestro o replay de sesión por expiración inconsistente.",
    priority: "P0",
    owner: "Seguridad / Runtime",
    notes: "Validar HMAC, TTL, rotación y limpieza LRU.",
  },
  {
    id: "L1-sandbox",
    level: 1,
    modulePath: "runtime/pkg/sandbox/",
    description: "Pool Manager de instancias WASM, warm/cold/release.",
    risk: "Fuga de aislamiento entre plugins o agotamiento WASM.",
    priority: "P0",
    owner: "Runtime / Platform",
    notes: "Revisar ciclos warm/cold/release y límites de pool.",
  },
  {
    id: "L1-router",
    level: 1,
    modulePath: "runtime/pkg/router/",
    description: "Micro-batching con ventana de 10ms y enrutamiento.",
    risk: "Latencia, pérdida de orden, batching inseguro o rutas incorrectas.",
    priority: "P0",
    owner: "Runtime / Platform",
    notes: "Verificar backpressure, errores parciales y concurrencia.",
  },
  {
    id: "L1-quota",
    level: 1,
    modulePath: "runtime/pkg/quota/",
    description: "Rate limiting concurrente por plugin.",
    risk: "Saturación, abuso DoS o throttling injusto entre plugins.",
    priority: "P0",
    owner: "Seguridad / Runtime",
    notes: "Validar límites por plugin, ventana, burst y métricas.",
  },
  {
    id: "L1-telemetry",
    level: 1,
    modulePath: "runtime/pkg/telemetry/",
    description: "Métricas estructuradas y redacción de campos sensibles.",
    risk: "Exposición de PII/secretos en logs o métricas insuficientes.",
    priority: "P0",
    owner: "Observabilidad / Seguridad",
    notes: "Revisar redacción y cobertura de eventos críticos.",
  },
  {
    id: "L1-runtime-manifest",
    level: 1,
    modulePath: "runtime/config/rdm-runtime-manifest.json",
    description: "Manifiesto de configuración de plugins territoriales.",
    risk: "Capacidades excesivas o permisos divergentes del contrato runtime.",
    priority: "P0",
    owner: "Arquitectura / Runtime",
    notes: "Validar schema, capacidades declaradas y defaults seguros.",
  },
  {
    id: "L4-api",
    level: 4,
    modulePath: "api/",
    description: "Funciones serverless de Vercel, cron y webhooks.",
    risk: "Endpoints públicos inseguros o webhooks sin verificación.",
    priority: "P0",
    owner: "Backend / DevOps",
    notes: "Revisar auth, rate limits, secrets y cron.",
  },
  {
    id: "L4-server",
    level: 4,
    modulePath: "server/",
    description: "Backend Express de Data Gateway y servicios core.",
    risk: "Fallos de validación, autorización o acoplamiento de servicios core.",
    priority: "P0",
    owner: "Backend / Data",
    notes: "Prioridad después del runtime por impacto en datos.",
  },
  {
    id: "L4-supabase-migrations",
    level: 4,
    modulePath: "supabase/migrations/",
    description: "Migraciones SQL en Supabase.",
    risk: "RLS débil, migraciones no reversibles o datos sensibles expuestos.",
    priority: "P0",
    owner: "Data / Seguridad",
    notes: "Inventariar tablas, políticas y funciones.",
  },
  {
    id: "L2-yun-governance",
    level: 2,
    modulePath: "docs/yun/",
    description: "Manifiesto, constitución, gobernanza, estándares y operación YUN.",
    risk: "Cambios críticos sin trazabilidad doctrinal, RFC/ADR o runbooks vigentes.",
    priority: "P1",
    owner: "Board de Arquitectura",
    notes: "Cruzar 00–07 con despliegue, datos y seguridad reales.",
  },
  {
    id: "L3-isabella",
    level: 3,
    modulePath: "isabella/ y src/isabella/",
    description: "Núcleo cognitivo, chat, células de conocimiento y skills Isabella.",
    risk: "Pipeline cognitivo opaco o habilidades con permisos ambiguos.",
    priority: "P1",
    owner: "Isabella / AI Governance",
    notes: "Revisar Orion, Sophia, Argus, Mnemos y Lumen.",
  },
  {
    id: "L5-frontend-territorial",
    level: 5,
    modulePath: "src/AppShell.tsx y src/components/music/",
    description: "Shell visual, música territorial, mapas, metaverso y federación cliente.",
    risk: "Regresiones de performance, navegación, accesibilidad o experiencia territorial.",
    priority: "P2",
    owner: "Frontend / UX",
    notes: "Incluir RDMHeroPlayer.tsx en la revisión operativa.",
  },
  {
    id: "L6-devops-tests",
    level: 6,
    modulePath: "infra/terraform/, k8s/, docker-compose.yml, vitest.*, e2e/",
    description: "Infraestructura, despliegue local, pruebas modulares y reportes.",
    risk: "Drift de infraestructura o suites críticas fuera de CI.",
    priority: "P3",
    owner: "DevOps / QA",
    notes: "Validar health checks, Playwright y reportes de auditoría.",
  },
];

const closedStatuses = new Set<AuditStatus>(["approved"]);

function isoNow(): string {
  return new Date().toISOString();
}

function toChecklistRecord(seed: MasterAuditChecklistSeed): AuditChecklistItemRecord {
  const existing = db.auditChecklistItems.get(seed.id);
  return {
    ...seed,
    status: existing?.status ?? "pending",
    evidenceIds: existing?.evidenceIds ?? [],
    createdAt: existing?.createdAt ?? isoNow(),
    updatedAt: isoNow(),
  };
}

export function seedMasterAuditChecklist(): AuditChecklistItemRecord[] {
  const records = MASTER_AUDIT_CHECKLIST.map(toChecklistRecord);
  records.forEach((record) => db.auditChecklistItems.set(record.id, record));
  return records;
}

export function listAuditChecklist(filters?: {
  level?: AuditLevel;
  priority?: AuditPriority;
  status?: AuditStatus;
}) {
  seedMasterAuditChecklist();
  return [...db.auditChecklistItems.values()]
    .filter((item) => (filters?.level ? item.level === filters.level : true))
    .filter((item) => (filters?.priority ? item.priority === filters.priority : true))
    .filter((item) => (filters?.status ? item.status === filters.status : true))
    .sort(
      (a, b) =>
        a.level - b.level || a.priority.localeCompare(b.priority) || a.id.localeCompare(b.id),
    );
}

export function attachAuditEvidence(input: AuditEvidenceInput): AuditEvidenceRecord {
  seedMasterAuditChecklist();
  const item = db.auditChecklistItems.get(input.itemId);
  if (!item) throw new Error(`AUDIT_ITEM_NOT_FOUND:${input.itemId}`);

  const evidence: AuditEvidenceRecord = {
    id: crypto.randomUUID(),
    itemId: input.itemId,
    actorId: input.actorId,
    command: input.command,
    result: input.result,
    notes: input.notes,
    sourceUrl: input.sourceUrl,
    createdAt: isoNow(),
  };

  db.auditEvidence.set(evidence.id, evidence);
  item.evidenceIds.push(evidence.id);
  item.status = input.status;
  item.updatedAt = evidence.createdAt;
  db.auditChecklistItems.set(item.id, item);

  emitMsrEvent({
    layer: item.level === 1 ? "L3" : item.level === 2 ? "L0" : "L1",
    category: "audit.evidence.attached",
    summary: `Evidencia adjunta para ${item.modulePath}`,
    payload: { itemId: item.id, level: item.level, priority: item.priority, status: item.status },
  });

  appendBookpiNarrative({
    title: `Auditoría ${item.id}`,
    narrative: `Se registró evidencia para ${item.modulePath}: ${input.notes}`,
    tags: ["audit", item.priority, `L${item.level}`],
  });

  return evidence;
}

export function evaluateFreezeReadiness(): FreezeReadiness {
  const items = listAuditChecklist();
  const priorities: AuditPriority[] = ["P0", "P1", "P2", "P3"];
  const totals = priorities.reduce<FreezeReadiness["totals"]>(
    (acc, priority) => {
      const priorityItems = items.filter((item) => item.priority === priority);
      acc[priority] = {
        total: priorityItems.length,
        closed: priorityItems.filter((item) => closedStatuses.has(item.status)).length,
      };
      return acc;
    },
    {
      P0: { total: 0, closed: 0 },
      P1: { total: 0, closed: 0 },
      P2: { total: 0, closed: 0 },
      P3: { total: 0, closed: 0 },
    },
  );

  const blockers = items
    .filter((item) => item.priority === "P0" && !closedStatuses.has(item.status))
    .map((item) => ({ itemId: item.id, modulePath: item.modulePath, reason: `P0 ${item.status}` }));

  return { ready: blockers.length === 0, blockers, totals };
}

export function requestFreezeDecision(actorId: string): FreezeDecisionRecord {
  const readiness = evaluateFreezeReadiness();
  const decision: FreezeDecisionRecord = {
    id: crypto.randomUUID(),
    actorId,
    ready: readiness.ready,
    blockers: readiness.blockers,
    totals: readiness.totals,
    createdAt: isoNow(),
  };
  db.freezeDecisions.set(decision.id, decision);

  emitMsrEvent({
    layer: "L2",
    category: readiness.ready ? "freeze.ready" : "freeze.blocked",
    summary: readiness.ready
      ? "Congelamiento habilitado"
      : "Congelamiento bloqueado por P0 abiertos",
    payload: {
      decisionId: decision.id,
      ready: readiness.ready,
      blockers: readiness.blockers.length,
    },
  });

  appendBookpiNarrative({
    title: readiness.ready ? "Freeze listo" : "Freeze bloqueado",
    narrative: readiness.ready
      ? "Todos los P0 del checklist maestro cuentan con cierre verificable."
      : `Quedan ${readiness.blockers.length} bloqueadores P0 antes del congelamiento.`,
    tags: ["freeze", readiness.ready ? "ready" : "blocked"],
  });

  return decision;
}
