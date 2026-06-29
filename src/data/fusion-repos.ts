import {
  Activity,
  Bot,
  Boxes,
  Database,
  Globe2,
  type LucideIcon,
  Map,
  Network,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export type FusionStatus = "integrado" | "orquestado" | "pendiente-remoto";

export interface FusionCapability {
  id: string;
  label: string;
  description: string;
  route?: string;
  icon: LucideIcon;
}

export interface FusionRepository {
  id: string;
  name: string;
  url: string;
  status: FusionStatus;
  role: string;
  summary: string;
  stack: string[];
  capabilities: FusionCapability[];
  contracts: string[];
}

export const fusionRepositories: FusionRepository[] = [
  {
    id: "rdm-digital-nodo-cero",
    name: "RDM Digital Nodo Cero",
    url: "https://github.com/OsoPanda1/rdm-digital-nodo-cero.git",
    status: "integrado",
    role: "Shell soberano y contratos MD-X5",
    summary:
      "Orquesta identidad, turismo inteligente, geointeligencia, protocolos auditables, economía creativa e IA contextual para Real del Monte.",
    stack: ["Next.js", "Supabase", "Prisma", "Stripe", "SSE", "IA"],
    capabilities: [
      {
        id: "identity",
        label: "ID-NVIDA / Identidad",
        description: "Base de sesión ciudadana-comercial para unificar perfiles, membresías y acceso a servicios.",
        route: "/comercios/registro",
        icon: ShieldCheck,
      },
      {
        id: "protocols",
        label: "Protocol Engine",
        description: "Contratos de ejecución para decisiones trazables BABAS, EOCT, MSR y BookPI.",
        route: "/tamv/api",
        icon: Activity,
      },
    ],
    contracts: ["/api/auth/register", "/api/protocols/execute", "/api/github/repos"],
  },
  {
    id: "rdm-turismodigital",
    name: "RDM Turismo Digital",
    url: "https://github.com/OsoPanda1/rdm-turismodigital.git",
    status: "orquestado",
    role: "Experiencias turísticas y catálogo territorial",
    summary:
      "Absorbe rutas, sitios, eventos, comercios y narrativas de visitantes dentro de una experiencia navegable de Real del Monte.",
    stack: ["React", "Vite", "Tailwind", "Mapas", "Catálogo"],
    capabilities: [
      {
        id: "routes",
        label: "Rutas experienciales",
        description: "Conecta historia, gastronomía, ecoturismo y cultura con llamadas a acción operativas.",
        route: "/rutas",
        icon: Map,
      },
      {
        id: "commerce",
        label: "Comercios vivos",
        description: "Activa directorio, registro y checkout para negocios locales dentro del portal.",
        route: "/catalogo",
        icon: Globe2,
      },
    ],
    contracts: ["places", "businesses", "events", "tourismContent"],
  },
  {
    id: "real-del-monte-twin",
    name: "Real del Monte Twin",
    url: "https://github.com/OsoPanda1/real-del-monte-twin.git",
    status: "integrado",
    role: "Gemelo digital geoespacial",
    summary:
      "Representa lugares, sensores, telemetría y capas visuales del territorio para operar un mapa vivo y auditable.",
    stack: ["TypeScript", "Supabase", "PLpgSQL", "Playwright", "Telemetry"],
    capabilities: [
      {
        id: "telemetry",
        label: "Telemetría territorial",
        description: "Modelo para ingestión, lectura y transmisión viva de señales territoriales.",
        route: "/tamv/status",
        icon: Radar,
      },
      {
        id: "digital-twin",
        label: "Mapa vivo",
        description: "Hace visible la relación entre puntos patrimoniales, comercios, rutas y saturación zonal.",
        route: "/#mapa",
        icon: Network,
      },
    ],
    contracts: ["/api/places/register", "/api/places/:id", "/api/telemetry/ingest", "/api/telemetry/live"],
  },
  {
    id: "citemesh-roots",
    name: "CiteMesh Roots",
    url: "https://github.com/OsoPanda1/citemesh-roots.git",
    status: "integrado",
    role: "Raíz autopoiética y malla federada",
    summary:
      "Aporta principios de identidad soberana, infraestructura federada, IA auditada y economía ética antifrágil al núcleo TAMV.",
    stack: ["React", "TypeScript", "Vite", "Prisma", "Supabase", "Observabilidad"],
    capabilities: [
      {
        id: "autopoiesis",
        label: "Autopoiesis continua",
        description: "Capa de mejora, sincronización CRDT y resiliencia civilizatoria entre nodos autónomos.",
        route: "/tamv/thesis",
        icon: Boxes,
      },
      {
        id: "isabella",
        label: "Isabella AI auditada",
        description: "Asistente territorial con memoria, guardianía y explicabilidad para servicios ciudadanos.",
        route: "/tamv",
        icon: Bot,
      },
    ],
    contracts: ["OPA", "EOCT-Ledger", "CRDT Sync", "Isabella AI", "Grafana/Prometheus"],
  },
];

export const fusionPillars = [
  {
    id: "sovereign-shell",
    title: "Shell ciudadano-comercial",
    description: "Un solo portal de entrada para visitantes, comercios, comunidad, donativos y exploración cultural.",
    icon: Sparkles,
    routes: ["/", "/catalogo", "/comercios/registro", "/donar"],
  },
  {
    id: "territorial-twin",
    title: "Gemelo territorial operativo",
    description: "Mapa vivo con sitios, rutas, comercios y telemetría preparada para decisiones de saturación y cuidado patrimonial.",
    icon: Radar,
    routes: ["/#mapa", "/rutas", "/tamv/status"],
  },
  {
    id: "federated-memory",
    title: "Memoria federada auditable",
    description: "Protocolos, tesis, BookPI, MSR y contratos de integración para dejar rastro verificable de cada módulo.",
    icon: Database,
    routes: ["/tamv", "/tamv/api", "/tamv/thesis", "/tenochtitlan"],
  },
];

export const fusionIntegrationFlow = [
  "Normalizar rutas y datos turísticos en el shell Vite actual.",
  "Exponer capacidades federadas como contratos navegables, no como repos aislados.",
  "Conectar mapa, catálogo, telemetría y guardianía TAMV desde una página de mando común.",
  "Documentar trazabilidad remota y estado de absorción para futuras sincronizaciones GitHub.",
];

export const getFusionReadiness = () => {
  const integrated = fusionRepositories.filter((repo) => repo.status === "integrado").length;
  const orchestrated = fusionRepositories.filter((repo) => repo.status === "orquestado").length;
  return Math.round(((integrated + orchestrated * 0.75) / fusionRepositories.length) * 100);
};
