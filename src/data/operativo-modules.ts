// @ts-nocheck
import type { ModuleState, DomainSummary } from "@/lib/types/operativo";

/**
 * Catálogo operativo derivado de docs/*.md y del estado real del código.
 * Esto permite que /operativo refleje qué módulos están listos para producción.
 */
export const OPERATIVE_MODULES: ModuleState[] = [
  {
    id: "backend-operativo",
    name: "Backend operativo (social/economy/protocols/xr)",
    domain: "backend",
    status: "done",
    completion: 90,
    spec: "docs/backend-operativo-api.md",
    notes: "Rutas Express activas en server/src/routes/*",
    route: "",
  },
  {
    id: "fusion-ecosystem",
    name: "Fusión funcional del ecosistema",
    domain: "frontend",
    status: "done",
    completion: 95,
    spec: "docs/fusion-funcional-rdmx.md",
    route: "/fusion",
    notes: "",
  },
  {
    id: "ecosystem-repos",
    name: "Índice vivo de repositorios OsoPanda1",
    domain: "frontend",
    status: "done",
    completion: 100,
    spec: "docs/osopanda-related-repos.json",
    route: "/fusion",
    notes: "",
  },
  {
    id: "geointel-ai",
    name: "Geolocalización + IA geoespacial",
    domain: "geointel",
    status: "in-progress",
    completion: 60,
    spec: "docs/geolocalizacion-ia-rdm-implementacion.md",
    notes: "Endpoints /api/geolocation activos, recomendación IA pendiente",
    route: "",
  },
  {
    id: "digital-twins",
    name: "Gemelos digitales (modelo + viewer)",
    domain: "twins",
    status: "in-progress",
    completion: 70,
    spec: "docs/integracion-gemelos-digitales-rdmx.md",
    route: "/tenochtitlan",
    notes: "",
  },
  {
    id: "merchant-payments",
    name: "Cobro y publicación de comercios",
    domain: "economy",
    status: "in-progress",
    completion: 75,
    route: "/comercios/registro",
    notes: "Webhooks listos, falta proveedor real (Stripe propio o Paddle)",
    spec: "docs/merchant-payments.md",
  },
  {
    id: "realito-cloud",
    name: "Realito AI vía Lovable Cloud (Gemini)",
    domain: "ai",
    status: "done",
    completion: 90,
    notes: "Edge function realito-chat operativa con fallback heurístico",
    route: "",
    spec: "",
  },
  {
    id: "operativo-dashboard",
    name: "Documento maestro operativo",
    domain: "frontend",
    status: "done",
    completion: 100,
    spec: "docs/rdm-documento-maestro-operativo.md",
    route: "/operativo",
    notes: "",
  },
  {
    id: "evolucion-dashboard",
    name: "Mega-análisis de evolución",
    domain: "frontend",
    status: "done",
    completion: 100,
    spec: "docs/rdmx-evolucion-mega-analisis.md",
    route: "/evolucion",
    notes: "",
  },
  {
    id: "roadmap-executable",
    name: "Roadmap as code (YAML → issues)",
    domain: "platform",
    status: "in-progress",
    completion: 50,
    spec: "docs/roadmap-rdmx-executable.yaml",
    notes: "Script tools/rdmx-roadmap.ts genera resumen JSON; sync de issues opcional",
    route: "",
  },
  {
    id: "deployment-baseline",
    name: "Baseline de despliegue (CI + systemd)",
    domain: "platform",
    status: "in-progress",
    completion: 65,
    spec: "docs/backlog-operativo-rdmx.md",
    route: "",
    notes: "",
  },
];

export function summarizeByDomain(modules: ModuleState[] = OPERATIVE_MODULES): DomainSummary[] {
  const map = new Map<string, DomainSummary>();
  for (const m of modules) {
    const cur = map.get(m.domain) ?? {
      domain: m.domain,
      total: 0,
      done: 0,
      inProgress: 0,
      design: 0,
      completion: 0,
    };
    cur.total += 1;
    if (m.status === "done") cur.done += 1;
    if (m.status === "in-progress") cur.inProgress += 1;
    if (m.status === "design") cur.design += 1;
    cur.completion += m.completion;
    map.set(m.domain, cur);
  }
  return Array.from(map.values()).map((d) => ({
    ...d,
    completion: Math.round(d.completion / Math.max(1, d.total)),
  }));
}

export function overallCompletion(modules: ModuleState[] = OPERATIVE_MODULES): number {
  if (!modules.length) return 0;
  const sum = modules.reduce((acc, m) => acc + m.completion, 0);
  return Math.round(sum / modules.length);
}