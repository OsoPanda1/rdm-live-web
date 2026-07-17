// ============================================================================
// RDM Digital OS — Module Manifest
// Registry of all ecosystem repositories and their integration points
// ============================================================================

export interface RepoModule {
  id: string;
  repo: string;
  path: string;
  type: "ui" | "backend" | "infra" | "ai" | "content";
  description: string;
  entryPoints: string[];
  status: "integrated" | "partial" | "planned";
}

export const RDMX_MODULES: RepoModule[] = [
  {
    id: "real-del-monte-explorer",
    repo: "https://github.com/OsoPanda1/real-del-monte-explorer.git",
    path: "packages/real-del-monte-explorer",
    type: "ui",
    description: "Repositorio principal: frontend React + backend Express del ecosistema RDM Digital OS",
    entryPoints: ["src/App.tsx", "server/src/index.ts"],
    status: "integrated",
  },
  {
    id: "real-del-monte-twin",
    repo: "https://github.com/OsoPanda1/real-del-monte-twin.git",
    path: "packages/real-del-monte-twin",
    type: "backend",
    description: "Modelos y lógica específica de gemelo digital de Real del Monte (telemetría, grafo territorial)",
    entryPoints: ["src/models/index.ts", "src/services/twinTelemetry.ts"],
    status: "integrated",
  },
  {
    id: "rdm-digital-2dbd42b0",
    repo: "https://github.com/OsoPanda1/rdm-digital-2dbd42b0.git",
    path: "packages/rdm-digital-core",
    type: "backend",
    description: "Servicios base y APIs legacy de RDM Digital — autenticación, donaciones, economía",
    entryPoints: ["src/routes/index.ts"],
    status: "integrated",
  },
  {
    id: "rdm-smart-city-os",
    repo: "https://github.com/OsoPanda1/rdm-smart-city-os.git",
    path: "packages/rdm-smart-city-os",
    type: "infra",
    description: "Capa de smart city: sensores urbanos, dashboards de gobierno, gestión de destino",
    entryPoints: ["src/index.ts"],
    status: "partial",
  },
  {
    id: "real-del-monte-elevated",
    repo: "https://github.com/OsoPanda1/real-del-monte-elevated.git",
    path: "packages/real-del-monte-elevated",
    type: "ui",
    description: "Sistema de diseño cinematográfico elevated — CinematicIntro, VisualEffects, SectionHeader",
    entryPoints: ["src/components/CinematicIntro.tsx", "src/components/VisualEffects.tsx"],
    status: "integrated",
  },
  {
    id: "citemesh-roots",
    repo: "https://github.com/OsoPanda1/citemesh-roots.git",
    path: "packages/citemesh-roots",
    type: "content",
    description: "Wiki semántica y malla de contenidos territoriales — WikiLayout, WikiSearch, IsabellaChat",
    entryPoints: ["src/components/WikiLayout.tsx", "src/services/wikiSearch.ts"],
    status: "partial",
  },
  {
    id: "genesis-digytamv-nexus",
    repo: "https://github.com/OsoPanda1/genesis-digytamv-nexus.git",
    path: "packages/genesis-digytamv-nexus",
    type: "ai",
    description: "Módulos avanzados TAMV — IsabellaOrb, BancoTAMV, Marketplace, Universidad Digital",
    entryPoints: ["src/modules/isabella/index.ts", "src/modules/banco/index.ts"],
    status: "partial",
  },
  {
    id: "civilizational-core",
    repo: "https://github.com/OsoPanda1/civilizational-core.git",
    path: "packages/civilizational-core",
    type: "infra",
    description: "Núcleo civilizacional — protocolos éticos, BookPI, módulos de gobernanza digital",
    entryPoints: ["src/protocols/index.ts"],
    status: "partial",
  },
  {
    id: "quantum-system-tamv",
    repo: "https://github.com/OsoPanda1/quantum-system-tamv.git",
    path: "packages/quantum-system-tamv",
    type: "ai",
    description: "Sistema quantum TAMV — Isabella AI, ChronusEngine, DecisionStore, agentes de turismo/cultura/comercio",
    entryPoints: ["src/main.py", "lib/isabella.ts"],
    status: "integrated",
  },
  {
    id: "tamv-online-nextgen",
    repo: "lovable://projects/e7d6549a-68e6-44f5-b5af-c602adada6bc",
    path: "packages/tamv-online-nextgen",
    type: "ai",
    description: "TAMV Online NextGen™ — Civilization Hub, Isabella AI emocional, MSR Bridge, DreamSpaces, Phoenix 20·30·50, BABAS, Fénix Rex, ANUBIS-ZK",
    entryPoints: ["src/pages/TAMVHub.tsx", "src/stores/tamv/isabellaStore.ts", "server/src/routes/tamv.ts"],
    status: "integrated",
  },
  {
    id: "rdm-digital-nodo-cero",
    repo: "https://github.com/OsoPanda1/rdm-digital-nodo-cero.git",
    path: "packages/rdm-digital-nodo-cero",
    type: "infra",
    description: "Nodo Cero — manifiesto soberano de RDM Digital, anclajes BookPI y constitución civilizacional (absorbido en server/src/services/tenochtitlan + /tamv/thesis).",
    entryPoints: ["src/pages/TAMVThesis.tsx", "server/src/routes/tamv-thesis.ts"],
    status: "integrated",
  },
  {
    id: "real-del-monte-explorer-11b3982a",
    repo: "https://github.com/OsoPanda1/real-del-monte-explorer-11b3982a.git",
    path: "packages/real-del-monte-explorer-11b3982a",
    type: "ui",
    description: "Variante elevated del explorer (fork 11b3982a) — fusionada en src/pages + components principales.",
    entryPoints: ["src/pages/Index.tsx"],
    status: "integrated",
  },
  {
    id: "rdm-digital-2026",
    repo: "https://github.com/OsoPanda1/RDM-DIGITAL2026.git",
    path: "packages/rdm-digital-2026",
    type: "ui",
    description: "Roadmap visual 2026 de RDM Digital — absorbido como hoja de ruta operativa en docs/roadmap-rdmx-executable.yaml y NavBar.",
    entryPoints: ["docs/roadmap-rdmx-executable.yaml"],
    status: "integrated",
  },
  {
    id: "tenochtitlan-kernel",
    repo: "rdm-digital://core/tenochtitlan",
    path: "server/src/services/tenochtitlan",
    type: "backend",
    description: "Kernel soberano Tenochtitlán: panteón centinela (Anubis, Horus, Dekateotl, Aztek Gods, Ojo de Ra, Ojo de Quetzalcóatl, MOS gemelos, Laberinto), radares paralelos, ID-NVIDA, EOCT, BookPI hash-chained, MD-X4 dual hexagonal pipeline y los 48 nodos funcionales del ecosistema OsoPanda1.",
    entryPoints: ["server/src/routes/tenochtitlan.ts", "src/pages/Tenochtitlan.tsx"],
    status: "integrated",
  },
];

export const MODULE_ALIASES: Record<string, string> = {
  "@rdm/core": "packages/rdm-digital-core/src",
  "@rdm/twin": "packages/real-del-monte-twin/src",
  "@rdm/elevated": "packages/real-del-monte-elevated/src",
  "@rdm/citemesh": "packages/citemesh-roots/src",
  "@rdm/nexus": "packages/genesis-digytamv-nexus/src",
  "@rdm/smartcity": "packages/rdm-smart-city-os/src",
  "@rdm/civilizational": "packages/civilizational-core/src",
  "@rdm/quantum": "packages/quantum-system-tamv/src",
  "@rdm/tamv": "packages/tamv-online-nextgen/src",
  "@rdm/tenochtitlan": "server/src/services/tenochtitlan",
};
