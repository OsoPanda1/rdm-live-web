export type GovernanceLayer = "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";
export type FindingDisposition = "active" | "consolidate" | "quarantine" | "watch";

export interface ModuleOwnershipRecord {
  id: string;
  layer: GovernanceLayer;
  modulePath: string;
  owner: string;
  purpose: string;
  canonical?: string;
  disposition: FindingDisposition;
  rationale: string;
}

export interface CardinalityControl {
  scope: string;
  maxActiveImplementations: number;
  canonicalPath: string;
  alternates: string[];
  action: "route-to-canonical" | "document-only" | "quarantine-before-delete";
}

const MODULE_OWNERSHIP: ModuleOwnershipRecord[] = [
  {
    id: "chronus-domain-canonical",
    layer: "L5",
    modulePath: "server/src/domain/chronus-engine.ts",
    owner: "Domain Services / Digital Twins",
    purpose: "Contrato estable de saturación zonal consumido por gemelos digitales.",
    disposition: "active",
    rationale:
      "Es la API actualmente importada por digital-twins.service.ts; se conserva como punto canónico runtime.",
  },
  {
    id: "chronus-legacy-service",
    layer: "L5",
    modulePath: "server/src/services/chronus.engine.ts",
    owner: "Domain Services / Migration",
    purpose: "Motor Chronus v2 previo con presión normalizada y consola de alerta.",
    canonical: "server/src/domain/chronus-engine.ts",
    disposition: "consolidate",
    rationale:
      "Duplicación funcional parcial detectada; no se borra para cumplir do-no-harm, queda marcada para adaptación gradual.",
  },
  {
    id: "audit-msr-bookpi",
    layer: "L1",
    modulePath: "server/src/services/audit.service.ts",
    owner: "Memory & Audit",
    purpose: "Emisión MSR y narrativa BookPI para acciones relevantes.",
    disposition: "active",
    rationale:
      "Servicio transversal usado por identidad, economía, protocolos, social, XR y geolocalización.",
  },
  {
    id: "vercel-telemetry-ingest",
    layer: "L1",
    modulePath: "api/_shared/telemetry-service.ts",
    owner: "Observability / Edge",
    purpose: "Ingreso federado de telemetría serverless hacia Netflow DB cuando está configurado.",
    disposition: "active",
    rationale:
      "Separado del backend Express por boundary de despliegue Vercel; no debe fusionarse con MSR.",
  },
  {
    id: "audit-workbench",
    layer: "L3",
    modulePath: "server/src/services/audit-workbench.service.ts",
    owner: "Guardianía / Freeze Protocol",
    purpose: "Checklist maestro, evidencias y decisiones de congelamiento.",
    disposition: "active",
    rationale: "Gobierna readiness operacional y registra evidencia auditable.",
  },
];

const CARDINALITY_CONTROLS: CardinalityControl[] = [
  {
    scope: "chronus-saturation-engine",
    maxActiveImplementations: 1,
    canonicalPath: "server/src/domain/chronus-engine.ts",
    alternates: ["server/src/services/chronus.engine.ts"],
    action: "route-to-canonical",
  },
  {
    scope: "audit-memory-plane",
    maxActiveImplementations: 2,
    canonicalPath: "server/src/services/audit.service.ts",
    alternates: ["server/src/data-gateway/services/audit.service.ts"],
    action: "document-only",
  },
  {
    scope: "telemetry-ingest-plane",
    maxActiveImplementations: 2,
    canonicalPath: "api/_shared/telemetry-service.ts",
    alternates: ["server/src/services/geolocation.service.ts"],
    action: "document-only",
  },
];

export function listGovernanceOwnership(): ModuleOwnershipRecord[] {
  return MODULE_OWNERSHIP.map((item) => ({ ...item }));
}

export function listCardinalityControls(): CardinalityControl[] {
  return CARDINALITY_CONTROLS.map((item) => ({ ...item, alternates: [...item.alternates] }));
}

export function buildOperationalGovernanceReport() {
  const ownership = listGovernanceOwnership();
  const controls = listCardinalityControls();
  const dispositions = ownership.reduce<Record<FindingDisposition, number>>(
    (acc, item) => {
      acc[item.disposition] += 1;
      return acc;
    },
    { active: 0, consolidate: 0, quarantine: 0, watch: 0 },
  );

  return {
    generatedAt: new Date().toISOString(),
    doctrine: {
      deletionPolicy: "no-delete-without-quarantine",
      auditability: "MSR + BookPI for operational decisions",
      civilianReadability: true,
    },
    affectedLayers: ["L1", "L3", "L5", "L6"] as GovernanceLayer[],
    summary: {
      modulesTracked: ownership.length,
      cardinalityControls: controls.length,
      dispositions,
    },
    ownership,
    cardinalityControls: controls,
  };
}
