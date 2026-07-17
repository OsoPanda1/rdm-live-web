// ============================================================================
// 9 Sentinel Pantheon — runtime registry with deterministic seeded telemetry.
// Anubis · Horus · Dekateotl · Aztek Gods · Ojo de Ra · Ojo de Quetzalcoatl ·
// MOS Gemelos (A/B) · Tenochtitlan · Laberinto Infinito.
// ============================================================================

import { randomUUID } from "node:crypto";
import type { RadarSweep, SentinelHeartbeat } from "./tenochtitlan.types.js";

const bootedAt = Date.now();
const counters = new Map<string, number>();
const inc = (id: string, by = 1) => {
  const next = (counters.get(id) ?? 0) + by;
  counters.set(id, next);
  return next;
};

function pulse(seed: number, range = 12, base = 78) {
  const t = Date.now() / 1000;
  return Math.round(base + Math.sin(t / 7 + seed) * range);
}

export const SENTINELS: Omit<
  SentinelHeartbeat,
  "load" | "uptimeSeconds" | "lastBeatAt" | "signalsHandled" | "status" | "metrics"
>[] = [
  {
    id: "anubis",
    glyph: "𓁢",
    name: "Anubis Sentinel System",
    mission:
      "Gatekeeper de identidad soberana ID-NVIDA. Custodia el acceso, sella DIDs y protege la dignidad ciudadana.",
    powers: ["LOGICAL", "EXECUTIVE", "OBSERVER"],
  },
  {
    id: "horus",
    glyph: "𓅃",
    name: "Horus Sentinel System",
    mission:
      "Vigilancia perimetral aérea: telemetría territorial, antifraude geoespacial y vigilancia de comercios verificados.",
    powers: ["OBSERVER", "EXECUTIVE"],
  },
  {
    id: "dekateotl",
    glyph: "✶",
    name: "Dekateotl Ethics Engine",
    mission:
      "Tribunal ético del kernel: audita cada decisión IA con SHA-256 y bloquea acciones que rompan la Constitución TAMV.",
    powers: ["LOGICAL", "HUMAN"],
  },
  {
    id: "aztek-gods",
    glyph: "☼",
    name: "Aztek Gods Cluster",
    mission:
      "Panteón de microservicios soberanos: Quetzalcoatl-net, Tláloc-stream, Huitzilopochtli-fire, balanceo y resiliencia.",
    powers: ["EXECUTIVE", "OBSERVER"],
  },
  {
    id: "ojo-ra",
    glyph: "𓂀",
    name: "Radar Ojo de Ra",
    mission:
      "Radar semántico solar: barre wikis, narrativas, leyendas y rutas turísticas para detectar incoherencias.",
    powers: ["OBSERVER", "LOGICAL"],
  },
  {
    id: "ojo-quetzalcoatl",
    glyph: "𓆑",
    name: "Radar Ojo de Quetzalcóatl",
    mission:
      "Radar territorial serpiente: rastrea aforo, flujos y eventos en el polígono de Real del Monte en tiempo real.",
    powers: ["OBSERVER", "EXECUTIVE"],
  },
  {
    id: "mos-twins",
    glyph: "⊡⊡",
    name: "MOS Gemelos en Paralelo",
    mission:
      "Pipeline doble hexagonal: cada petición se ejecuta en MOS-A y MOS-B; un consensor compara hashes antes de servir.",
    powers: ["EXECUTIVE", "LOGICAL"],
  },
  {
    id: "tenochtitlan",
    glyph: "🜂",
    name: "System Tenochtitlán",
    mission:
      "Capital lógica del kernel: orquesta los 48 nodos, BookPI, EOCT y el render MD-X4 sobre el doble pipeline hexagonal.",
    powers: ["LOGICAL", "EXECUTIVE", "OBSERVER", "HUMAN"],
  },
  {
    id: "laberinto",
    glyph: "⌬",
    name: "Laberinto Infinito",
    mission:
      "Honeypot adaptativo: redirige tráfico hostil a salas espejo cuántico y registra firmas para Anubis y Horus.",
    powers: ["OBSERVER"],
  },
];

export const RADARS: RadarSweep[] = [
  { id: "radar-ra", codename: "Ojo de Ra", scope: "semantic", detections: 0, anomalies: 0, coverage: 92, lastSweepAt: new Date().toISOString() },
  { id: "radar-quetzalcoatl", codename: "Ojo de Quetzalcóatl", scope: "territorial", detections: 0, anomalies: 0, coverage: 88, lastSweepAt: new Date().toISOString() },
  { id: "radar-mos-a", codename: "MOS Gemelo A", scope: "perimeter", detections: 0, anomalies: 0, coverage: 96, lastSweepAt: new Date().toISOString() },
  { id: "radar-mos-b", codename: "MOS Gemelo B", scope: "perimeter", detections: 0, anomalies: 0, coverage: 96, lastSweepAt: new Date().toISOString() },
  { id: "radar-dekateotl", codename: "Dekateotl Ethics", scope: "ethical", detections: 0, anomalies: 0, coverage: 99, lastSweepAt: new Date().toISOString() },
  { id: "radar-laberinto", codename: "Laberinto Infinito", scope: "quantum", detections: 0, anomalies: 0, coverage: 74, lastSweepAt: new Date().toISOString() },
];

export function readSentinels(): SentinelHeartbeat[] {
  const now = Date.now();
  return SENTINELS.map((s, idx) => {
    const load = pulse(idx, 14, 62);
    const status: SentinelHeartbeat["status"] =
      load > 90 ? "alert" : load > 80 ? "degraded" : "online";
    return {
      ...s,
      status,
      load,
      uptimeSeconds: Math.round((now - bootedAt) / 1000),
      lastBeatAt: new Date(now).toISOString(),
      signalsHandled: counters.get(s.id) ?? 0,
      metrics: {
        threatsBlocked: counters.get(`${s.id}:threats`) ?? 0,
        consensusOk: counters.get(`${s.id}:consensus`) ?? 0,
      },
    };
  });
}

export function readRadars(): RadarSweep[] {
  return RADARS.map((r, idx) => ({
    ...r,
    detections: pulse(idx + 11, 25, 40),
    anomalies: Math.max(0, pulse(idx + 23, 4, 2)),
    lastSweepAt: new Date().toISOString(),
  }));
}

export function pingSentinel(id: string, kind: "signal" | "threat" | "consensus" = "signal") {
  const exists = SENTINELS.find((s) => s.id === id);
  if (!exists) throw new Error(`SENTINEL_NOT_FOUND:${id}`);
  inc(id);
  if (kind === "threat") inc(`${id}:threats`);
  if (kind === "consensus") inc(`${id}:consensus`);
  return {
    pingId: randomUUID(),
    sentinelId: id,
    kind,
    at: new Date().toISOString(),
  };
}
