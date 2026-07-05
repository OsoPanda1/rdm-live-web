// ============================================================================
// RDM Digital OS + TAMV — YUN-native Sovereign Module Manifest
// Fundado sobre: YUN Manifesto, Constitución, Blueprint, ADR, Heptafederación
// ============================================================================

export type ModuleType =
  | "ui"
  | "backend"
  | "infra"
  | "ai"
  | "content"
  | "bridge"
  | "protocol";

export type ModuleStatus =
  | "integrated"
  | "partial"
  | "planned"
  | "deprecated";

export type CriticalityLevel = "core" | "high" | "medium" | "low";

export type SovereignDomain =
  | "territorial"
  | "civilizational"
  | "economic"
  | "cultural"
  | "tourism"
  | "governance"
  | "ai";

export type YunDomain =
  | "identity"
  | "commerce"
  | "knowledge"
  | "telemetry"
  | "gameplay";

export type FederationId =
  | "fed1_commerce_local"
  | "fed2_tourism_culture"
  | "fed3_academia_science"
  | "fed4_local_government"
  | "fed5_tech_infra"
  | "fed6_community_orgs"
  | "fed7_metaverse_xr";

export type ResilienceMode =
  | "normal"
  | "degraded-domain"
  | "degraded-federation";

export interface YunBinding {
  domain: YunDomain | null;
  federation: FederationId | null;
  events: {
    produces: string[];
    consumes: string[];
  };
  sensitivity: "P0" | "P1" | "P2";
  resilience: {
    supportedModes: ResilienceMode[];
    degradedBehavior: string;
  };
  governance: {
    constitutionVersion: string;
    adrRefs: string[];
  };
}

export interface RepoModule {
  id: string;
  repo: string;
  path: string;
  type: ModuleType;
  description: string;
  entryPoints: string[];
  status: ModuleStatus;
  criticality: CriticalityLevel;
  domain: SovereignDomain;
  hardening: {
    threatModel: string[];
    hasZeroTrustLayer: boolean;
    hasSignedArtifacts: boolean;
    hasRuntimeGuards: boolean;
  };
  dependencies: string[];
  tags: string[];
  yun: YunBinding;
}

const normalizePath = (p: string): string =>
  p.replace(/\\/g, "/").replace(/\/+/g, "/");

// ============================================================================
// Manifiesto de módulos — población basada en la lista original + YUN
// ============================================================================

export const RDMX_MODULES: RepoModule[] = [
  {
    id: "real-del-monte-explorer",
    repo: "https://github.com/OsoPanda1/real-del-monte-explorer.git",
    path: normalizePath("packages/real-del-monte-explorer"),
    type: "ui",
    description:
      "Frontend React + backend Express del ecosistema RDM Digital OS (nodo interactivo territorial).",
    entryPoints: ["src/App.tsx", "server/src/index.ts"],
    status: "integrated",
    criticality: "core",
    domain: "territorial",
    hardening: {
      threatModel: ["supply-chain", "api-abuse", "session-hijack"],
      hasZeroTrustLayer: true,
      hasSignedArtifacts: true,
      hasRuntimeGuards: true,
    },
    dependencies: [
      "real-del-monte-twin",
      "rdm-digital-2dbd42b0",
      "rdm-smart-city-os",
      "tenochtitlan-kernel",
    ],
    tags: ["Explorer", "Tourism", "TerritorialGraph", "PublicPortal"],
    yun: {
      domain: "knowledge",
      federation: "fed2_tourism_culture",
      events: {
        produces: [
          "knowledge.events.explorer_viewed",
          "knowledge.events.route_selected",
        ],
        consumes: [
          "telemetry.events.incident_reported",
          "commerce.events.offer_published",
        ],
      },
      sensitivity: "P2",
      resilience: {
        supportedModes: ["normal", "degraded-federation"],
        degradedBehavior:
          "Modo lectura con indicación de estado degradado de Fed2; sin nuevas operaciones críticas de comercio.",
      },
      governance: {
        constitutionVersion: "YUN Constitution – v1.0",
        adrRefs: ["ADR-003-yun-architecture", "ADR-004-heptafederation"],
      },
    },
  },
  {
    id: "real-del-monte-twin",
    repo: "https://github.com/OsoPanda1/real-del-monte-twin.git",
    path: normalizePath("packages/real-del-monte-twin"),
    type: "backend",
    description:
      "Gemelo digital de Real del Monte: telemetría, grafo territorial, modelos de flujo de visitantes.",
    entryPoints: ["src/models/index.ts", "src/services/twinTelemetry.ts"],
    status: "integrated",
    criticality: "core",
    domain: "territorial",
    hardening: {
      threatModel: ["data-integrity", "telemetry-fraud", "dos"],
      hasZeroTrustLayer: true,
      hasSignedArtifacts: true,
      hasRuntimeGuards: true,
    },
    dependencies: ["rdm-digital-2dbd42b0", "rdm-smart-city-os"],
    tags: ["DigitalTwin", "Telemetry", "GraphEngine"],
    yun: {
      domain: "telemetry",
      federation: "fed2_tourism_culture",
      events: {
        produces: [
          "telemetry.events.twin_telemetry",
          "telemetry.events.territorial_graph_updated",
        ],
        consumes: [
          "federations.events.policy_updated",
          "security.events.telemetry_rule_changed",
        ],
      },
      sensitivity: "P1",
      resilience: {
        supportedModes: ["normal", "degraded-domain", "degraded-federation"],
        degradedBehavior:
          "Mantiene telemetría agregada; suspende cálculos complejos de flujo hasta recuperación.",
      },
      governance: {
        constitutionVersion: "YUN Constitution – v1.0",
        adrRefs: ["ADR-003-yun-architecture"],
      },
    },
  },
  {
    id: "rdm-digital-2dbd42b0",
    repo: "https://github.com/OsoPanda1/rdm-digital-2dbd42b0.git",
    path: normalizePath("packages/rdm-digital-core"),
    type: "backend",
    description:
      "Servicios base y APIs legacy de RDM Digital — autenticación, donaciones, economía local.",
    entryPoints: ["src/routes/index.ts"],
    status: "integrated",
    criticality: "high",
    domain: "economic",
    hardening: {
      threatModel: ["auth-bypass", "financial-fraud", "supply-chain"],
      hasZeroTrustLayer: true,
      hasSignedArtifacts: true,
      hasRuntimeGuards: true,
    },
    dependencies: ["tenochtitlan-kernel", "civilizational-core"],
    tags: ["Auth", "Donations", "Payments", "LegacyAPI"],
    yun: {
      domain: "commerce",
      federation: "fed1_commerce_local",
      events: {
        produces: [
          "commerce.events.payment_initiated",
          "commerce.events.payment_settled",
        ],
        consumes: [
          "identity.events.user_created",
          "telemetry.events.security_alert",
        ],
      },
      sensitivity: "P0",
      resilience: {
        supportedModes: ["normal", "degraded-domain"],
        degradedBehavior:
          "Suspende nuevas transacciones; mantiene lectura de historial y estados consolidados.",
      },
      governance: {
        constitutionVersion: "YUN Constitution – v1.0",
        adrRefs: ["ADR-001-supabase", "ADR-002-event-driven"],
      },
    },
  },
  {
    id: "rdm-smart-city-os",
    repo: "https://github.com/OsoPanda1/rdm-smart-city-os.git",
    path: normalizePath("packages/rdm-smart-city-os"),
    type: "infra",
    description:
      "Capa Smart City: sensores urbanos, dashboards de gobierno, gestión inteligente de destino.",
    entryPoints: ["src/index.ts"],
    status: "partial",
    criticality: "high",
    domain: "governance",
    hardening: {
      threatModel: ["iot-takeover", "data-integrity", "dos"],
      hasZeroTrustLayer: true,
      hasSignedArtifacts: false,
      hasRuntimeGuards: true,
    },
    dependencies: ["civilizational-core", "tenochtitlan-kernel"],
    tags: ["SmartCity", "GovernmentDashboard", "SensorMesh"],
    yun: {
      domain: "telemetry",
      federation: "fed4_local_government",
      events: {
        produces: [
          "telemetry.events.smartcity_sensor",
          "telemetry.events.governance_dashboard_viewed",
        ],
        consumes: [
          "federations.events.kernel_alert",
          "security.events.governance_violation",
        ],
      },
      sensitivity: "P1",
      resilience: {
        supportedModes: ["normal", "degraded-federation"],
        degradedBehavior:
          "Paneles en modo lectura; suspensión de controles automatizados al territorio hasta estabilización.",
      },
      governance: {
        constitutionVersion: "YUN Constitution – v1.0",
        adrRefs: ["ADR-003-yun-architecture", "ADR-004-heptafederation"],
      },
    },
  },
  {
    id: "isabella-villaseñor-ai",
    repo: "https://github.com/OsoPanda1/rdm-digital-hub-ldtocs.git",
    path: normalizePath("src/isabella"),
    type: "ai",
    description:
      "Isabella Villaseñor AI — sistema operativo cognitivo territorial con doble hexágono de seguridad, pipeline de conciencia hexagonal y 5 skills (ORION, SOPHIA, ARGUS, MNEMOS, LUMEN).",
    entryPoints: ["src/isabella/index.ts", "src/isabella/api/router.ts"],
    status: "integrated",
    criticality: "core",
    domain: "ai",
    hardening: {
      threatModel: ["prompt-injection", "data-exfiltration", "identity-spoofing"],
      hasZeroTrustLayer: true,
      hasSignedArtifacts: true,
      hasRuntimeGuards: true,
    },
    dependencies: [],
    tags: ["Isabella", "AI", "Consciousness", "Heptafederation", "DoubleHexagon"],
    yun: {
      domain: "identity",
      federation: "fed5_tech_infra",
      events: {
        produces: [
          "identity.events.isabella_consciousness_activated",
          "governance.events.constitution_evaluated",
          "knowledge.events.artifact_discovered",
        ],
        consumes: [
          "telemetry.events.twin_telemetry",
          "federations.events.policy_updated",
        ],
      },
      sensitivity: "P0",
      resilience: {
        supportedModes: ["normal", "degraded-domain", "degraded-federation"],
        degradedBehavior:
          "Isabella opera en modo seguro con skills críticos (LUMEN, MNEMOS) y desactiva skills no esenciales.",
      },
      governance: {
        constitutionVersion: "YUN Constitution – v1.0",
        adrRefs: [
          "ADR-001-supabase",
          "ADR-002-event-driven",
          "ADR-003-yun-architecture",
          "ADR-004-heptafederation",
        ],
      },
    },
  },
  {
    id: "yun-data-fabric",
    repo: "https://github.com/OsoPanda1/rdm-digital-hub-ldtocs.git",
    path: normalizePath("src/core/yun"),
    type: "protocol",
    description:
      "YUN Data Fabric — orquestador central de 5 dominios de almacenamiento con adaptables por dominio (Supabase, Neon, Turso, D1, Redis).",
    entryPoints: ["src/core/yun/index.ts", "src/core/yun/data-fabric.ts"],
    status: "integrated",
    criticality: "core",
    domain: "governance",
    hardening: {
      threatModel: ["data-leak", "cross-domain-contamination", "storage-failure"],
      hasZeroTrustLayer: true,
      hasSignedArtifacts: true,
      hasRuntimeGuards: true,
    },
    dependencies: [],
    tags: ["YUN", "DataFabric", "Storage", "DomainIsolation"],
    yun: {
      domain: null,
      federation: null,
      events: {
        produces: [
          "yun.events.domain_operation_completed",
          "yun.events.storage_fallback_activated",
        ],
        consumes: [
          "yun.events.domain_operation_requested",
        ],
      },
      sensitivity: "P0",
      resilience: {
        supportedModes: ["normal", "degraded-domain"],
        degradedBehavior:
          "Fallback automático a Supabase cuando el backend primario del dominio falla.",
      },
      governance: {
        constitutionVersion: "YUN Constitution – v1.0",
        adrRefs: ["ADR-001-supabase", "ADR-005-commerce-neon-migration"],
      },
    },
  },
  {
    id: "yun-event-bus",
    repo: "https://github.com/OsoPanda1/rdm-digital-hub-ldtocs.git",
    path: normalizePath("src/core/yun/event-bus.ts"),
    type: "protocol",
    description:
      "YUN Constitutional Event Bus — bus central de eventos con validación de dominio, trazabilidad y resiliencia.",
    entryPoints: ["src/core/yun/event-bus.ts"],
    status: "integrated",
    criticality: "core",
    domain: "governance",
    hardening: {
      threatModel: ["event-spoofing", "bus-flooding", "cross-domain-leak"],
      hasZeroTrustLayer: true,
      hasSignedArtifacts: true,
      hasRuntimeGuards: true,
    },
    dependencies: [],
    tags: ["YUN", "EventBus", "Constitutional", "Observable"],
    yun: {
      domain: null,
      federation: null,
      events: {
        produces: [
          "yun.events.event_published",
          "yun.events.event_validated",
        ],
        consumes: [
          "yun.events.event_requested",
        ],
      },
      sensitivity: "P0",
      resilience: {
        supportedModes: ["normal"],
        degradedBehavior:
          "El event bus opera in-memory; si falla, los productores reintentican con backoff exponencial.",
      },
      governance: {
        constitutionVersion: "YUN Constitution – v1.0",
        adrRefs: ["ADR-002-event-driven", "ADR-003-yun-architecture"],
      },
    },
  },
  {
    id: "yun-gateway",
    repo: "https://github.com/OsoPanda1/rdm-digital-hub-ldtocs.git",
    path: normalizePath("src/core/yun/gateway.ts"),
    type: "infra",
    description:
      "Gateway YUN — punto de entrada único con rate limiting, circuit breaker y validación de dominio.",
    entryPoints: ["src/core/yun/gateway.ts"],
    status: "integrated",
    criticality: "core",
    domain: "governance",
    hardening: {
      threatModel: ["ddos", "credential-stuffing", "domain-escalation"],
      hasZeroTrustLayer: true,
      hasSignedArtifacts: true,
      hasRuntimeGuards: true,
    },
    dependencies: [],
    tags: ["YUN", "Gateway", "RateLimit", "CircuitBreaker"],
    yun: {
      domain: null,
      federation: null,
      events: {
        produces: [
          "yun.events.request_validated",
          "yun.events.request_rejected",
        ],
        consumes: [
          "yun.events.request_received",
        ],
      },
      sensitivity: "P0",
      resilience: {
        supportedModes: ["normal"],
        degradedBehavior:
          "Si el gateway falla, todos los requests son rechazados con 503 (fail-closed).",
      },
      governance: {
        constitutionVersion: "YUN Constitution – v1.0",
        adrRefs: ["ADR-003-yun-architecture"],
      },
    },
  },
];

// Aliases para bundlers / TS
export const MODULE_ALIASES: Record<string, string> = {
  "@rdm/core": "packages/rdm-digital-core/src",
  "@rdm/twin": "packages/real-del-monte-twin/src",
  "@rdm/explorer": "packages/real-del-monte-explorer/src",
  "@rdm/smartcity": "packages/rdm-smart-city-os/src",
  "@rdm/isabella": "src/isabella",
  "@rdm/yun": "src/core/yun",
  "@rdm/yun-data-fabric": "src/core/yun/data-fabric",
  "@rdm/yun-event-bus": "src/core/yun/event-bus",
  "@rdm/yun-gateway": "src/core/yun/gateway",
};
