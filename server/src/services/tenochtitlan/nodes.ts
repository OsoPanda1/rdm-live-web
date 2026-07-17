// ============================================================================
// 48 Functional Nodes — registry of every operational subsystem absorbed
// from OsoPanda1 ecosystem (TAMV, RDM, CITEMESH, civilizational-core).
// ============================================================================

import type { NodeRecord, SentinelStatus } from "./tenochtitlan.types.js";

const RAW: Omit<NodeRecord, "status" | "health">[] = [
  // Core kernel
  { index: 1, code: "N01-ISABELLA", name: "Isabella DMX4 Kernel", cluster: "core", description: "Orquestador multi-agente con shutdown preventivo." },
  { index: 2, code: "N02-TAMVAI", name: "TAMVAI Multi-Agente", cluster: "core", description: "Federación de agentes especializados (turismo, cultura, comercio)." },
  { index: 3, code: "N03-CHRONUS", name: "ChronusEngine", cluster: "core", description: "Sincronización temporal de tráfico, clima y aforo." },
  { index: 4, code: "N04-DECISION", name: "Decision Engine", cluster: "core", description: "Registro auditable SHA-256 de decisiones IA." },
  { index: 5, code: "N05-PROTOCOL", name: "Protocol Engine", cluster: "core", description: "Hoyo Negro · Fénix · Futuros." },
  { index: 6, code: "N06-GENETIC", name: "Genetic Optimizer", cluster: "core", description: "Rutas antifrágiles multi-objetivo." },

  // Identity & governance
  { index: 7, code: "N07-IDNVIDA", name: "ID-NVIDA Sovereign Identity", cluster: "identity", description: "DIDs, dignity score, reputación inmutable." },
  { index: 8, code: "N08-EOCT", name: "EOCT Registro Civil", cluster: "identity", description: "Estado, Origen, Conducta, Trayectoria." },
  { index: 9, code: "N09-DIGNITY", name: "Dignity Decay Job", cluster: "identity", description: "Job 24h reduciendo dignity 1pt." },
  { index: 10, code: "N10-CITEMESH", name: "CITEMESH Governance", cluster: "governance", description: "Powers/Roles + powerGuard middleware." },
  { index: 11, code: "N11-DAO", name: "DAO Phoenix", cluster: "governance", description: "Propuestas y votación distribuida." },
  { index: 12, code: "N12-CONSTITUTION", name: "Constitución TAMV", cluster: "governance", description: "Reglas inviolables del kernel." },

  // Perimeter (sentinels & radars)
  { index: 13, code: "N13-ANUBIS", name: "Anubis Sentinel", cluster: "perimeter", description: "Identity gatekeeper + JWT + revocation list." },
  { index: 14, code: "N14-HORUS", name: "Horus Sentinel", cluster: "perimeter", description: "Vigilancia geoespacial + antifraude." },
  { index: 15, code: "N15-DEKATEOTL", name: "Dekateotl Ethics", cluster: "perimeter", description: "Tribunal ético en línea." },
  { index: 16, code: "N16-AZTEK", name: "Aztek Gods Cluster", cluster: "perimeter", description: "Microservicios resilientes Quetzalcoatl/Tláloc/Huitzilopochtli." },
  { index: 17, code: "N17-OJO-RA", name: "Radar Ojo de Ra", cluster: "perimeter", description: "Radar semántico solar." },
  { index: 18, code: "N18-OJO-QUETZ", name: "Radar Ojo de Quetzalcóatl", cluster: "perimeter", description: "Radar territorial." },
  { index: 19, code: "N19-MOS-A", name: "MOS Gemelo A", cluster: "perimeter", description: "Pipeline hexagonal A." },
  { index: 20, code: "N20-MOS-B", name: "MOS Gemelo B", cluster: "perimeter", description: "Pipeline hexagonal B." },
  { index: 21, code: "N21-CONSENSOR", name: "Consensor MOS", cluster: "perimeter", description: "Comparador SHA-256 de respuestas paralelas." },
  { index: 22, code: "N22-LABERINTO", name: "Laberinto Infinito", cluster: "perimeter", description: "Honeypot adaptativo." },
  { index: 23, code: "N23-FENIX-REX", name: "Fénix Rex Protocol", cluster: "perimeter", description: "Auto-recuperación tras incidente." },
  { index: 24, code: "N24-BABAS", name: "BABAS Audit Chain", cluster: "perimeter", description: "Cadena de auditoría blockchain interna." },

  // Memory
  { index: 25, code: "N25-BOOKPI", name: "BookPI Evidence Registry", cluster: "memory", description: "Registro inmutable hash-encadenado." },
  { index: 26, code: "N26-DIGYTAMV", name: "DIGYTAMV Conceptual Memory", cluster: "memory", description: "Memoria conceptual semántica vectorial." },
  { index: 27, code: "N27-MSR", name: "MSR Sovereign Registry", cluster: "memory", description: "Eventos del metaverso firmados." },
  { index: 28, code: "N28-PGVECTOR", name: "PGVector Memory Bank", cluster: "memory", description: "Embeddings episódicos." },
  { index: 29, code: "N29-LEDGER", name: "Phoenix Ledger", cluster: "economy", description: "Libro mayor del token TAMV." },

  // Economy
  { index: 30, code: "N30-PHOENIX", name: "Phoenix 20·30·50", cluster: "economy", description: "Distribución soberana 20 creador / 30 ecosistema / 50 reserva." },
  { index: 31, code: "N31-TCEP", name: "TCEP Engine", cluster: "economy", description: "Economy engine con allocation 75/25 al fondo de impacto." },
  { index: 32, code: "N32-MERCHANT", name: "Merchant Catalog", cluster: "economy", description: "Catálogo de comercios verificados." },
  { index: 33, code: "N33-DONATIONS", name: "Donations Service", cluster: "economy", description: "Pasarela de donativos territoriales." },
  { index: 34, code: "N34-MEMBERSHIP", name: "Membership Tiers", cluster: "economy", description: "free/creator/guardian/institutional." },

  // Render & metaverse
  { index: 35, code: "N35-MDX4", name: "MD-X4 Render Engine", cluster: "render", description: "Render volumétrico 4D para gemelos." },
  { index: 36, code: "N36-XR-GATEWAY", name: "XR Gateway", cluster: "render", description: "Pasarela WebXR / Meta / Apple Vision." },
  { index: 37, code: "N37-DREAMSPACE", name: "DreamSpaces", cluster: "metaverse", description: "Salas inmersivas colaborativas." },
  { index: 38, code: "N38-SPATIAL", name: "Spatial Pod", cluster: "metaverse", description: "Render espacial con polytopes." },
  { index: 39, code: "N39-TWIN", name: "Digital Twin Service", cluster: "render", description: "DTDL v3 para sitios y comercios." },
  { index: 40, code: "N40-TELEMETRY", name: "Twin Telemetry", cluster: "render", description: "Telemetría IoT del polígono." },

  // Communications & content
  { index: 41, code: "N41-CITEMESH-WIKI", name: "Citemesh Wiki", cluster: "memory", description: "Wiki semántica territorial." },
  { index: 42, code: "N42-REALITO", name: "Realito Orb", cluster: "core", description: "Asistente conversacional turístico." },
  { index: 43, code: "N43-STREAMS", name: "Streams Service", cluster: "metaverse", description: "Salas live + videocall soberanas." },
  { index: 44, code: "N44-SOCIAL", name: "Social Mesh", cluster: "metaverse", description: "Posts, likes, comentarios federados." },
  { index: 45, code: "N45-TAP", name: "TAP Protocol", cluster: "core", description: "WebSocket TAP MessagePack." },
  { index: 46, code: "N46-GEMINI", name: "Geolocation IA", cluster: "core", description: "Geolocalización + recomendaciones cercanas." },
  { index: 47, code: "N47-WEATHER", name: "Weather Bridge", cluster: "core", description: "Tema visual reactivo al clima." },
  { index: 48, code: "N48-RDMX-STATUS", name: "RDMX Status Beacon", cluster: "core", description: "Telemetría /api/rdmx/status." },
];

function statusFor(idx: number): { status: SentinelStatus; health: number } {
  const t = Date.now() / 1000;
  const h = Math.round(80 + Math.sin(t / 9 + idx) * 14);
  const status: SentinelStatus = h > 90 ? "online" : h > 70 ? "online" : h > 55 ? "degraded" : "alert";
  return { status, health: h };
}

export function readNodes(): NodeRecord[] {
  return RAW.map((n) => ({ ...n, ...statusFor(n.index) }));
}

export function getNode(code: string) {
  const found = readNodes().find((n) => n.code === code);
  if (!found) throw new Error(`NODE_NOT_FOUND:${code}`);
  return found;
}
