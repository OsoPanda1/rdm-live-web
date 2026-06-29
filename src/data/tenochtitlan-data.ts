// Mirror data of /api/tenochtitlan so the dashboard renders without a live backend.

export interface SentinelMirror {
  id: string;
  glyph: string;
  name: string;
  mission: string;
  powers: string[];
  status: "online" | "degraded" | "offline" | "alert";
  load: number;
}

export interface RadarMirror {
  id: string;
  codename: string;
  scope: string;
  detections: number;
  anomalies: number;
  coverage: number;
}

export interface NodeMirror {
  index: number;
  code: string;
  name: string;
  cluster: string;
  health: number;
  description: string;
}

export const SENTINELS_MIRROR: SentinelMirror[] = [
  { id: "anubis", glyph: "𓁢", name: "Anubis Sentinel System", mission: "Gatekeeper de identidad soberana ID-NVIDA. Custodia accesos, sella DIDs y protege la dignidad ciudadana.", powers: ["LOGICAL", "EXECUTIVE", "OBSERVER"], status: "online", load: 64 },
  { id: "horus", glyph: "𓅃", name: "Horus Sentinel System", mission: "Vigilancia perimetral aérea: telemetría territorial, antifraude geoespacial, comercios verificados.", powers: ["OBSERVER", "EXECUTIVE"], status: "online", load: 58 },
  { id: "dekateotl", glyph: "✶", name: "Dekateotl Ethics Engine", mission: "Tribunal ético del kernel: audita cada decisión IA con SHA-256 y bloquea acciones contra la Constitución TAMV.", powers: ["LOGICAL", "HUMAN"], status: "online", load: 72 },
  { id: "aztek-gods", glyph: "☼", name: "Aztek Gods Cluster", mission: "Panteón de microservicios soberanos: Quetzalcóatl-net, Tláloc-stream, Huitzilopochtli-fire.", powers: ["EXECUTIVE", "OBSERVER"], status: "online", load: 67 },
  { id: "ojo-ra", glyph: "𓂀", name: "Radar Ojo de Ra", mission: "Radar semántico solar: barre wikis, narrativas y rutas turísticas detectando incoherencias.", powers: ["OBSERVER", "LOGICAL"], status: "online", load: 51 },
  { id: "ojo-quetzalcoatl", glyph: "𓆑", name: "Radar Ojo de Quetzalcóatl", mission: "Radar territorial serpiente: rastrea aforo, flujos y eventos en el polígono de Real del Monte.", powers: ["OBSERVER", "EXECUTIVE"], status: "degraded", load: 81 },
  { id: "mos-twins", glyph: "⊡⊡", name: "MOS Gemelos en Paralelo", mission: "Pipeline doble hexagonal: cada petición corre en MOS-A y MOS-B; consensor compara hashes antes de servir.", powers: ["EXECUTIVE", "LOGICAL"], status: "online", load: 60 },
  { id: "tenochtitlan", glyph: "🜂", name: "System Tenochtitlán", mission: "Capital lógica del kernel: orquesta los 48 nodos, BookPI, EOCT y el render MD-X4 sobre el doble pipeline hexagonal.", powers: ["LOGICAL", "EXECUTIVE", "OBSERVER", "HUMAN"], status: "online", load: 70 },
  { id: "laberinto", glyph: "⌬", name: "Laberinto Infinito", mission: "Honeypot adaptativo: redirige tráfico hostil a salas espejo cuántico y registra firmas para Anubis y Horus.", powers: ["OBSERVER"], status: "online", load: 44 },
];

export const RADARS_MIRROR: RadarMirror[] = [
  { id: "radar-ra", codename: "Ojo de Ra", scope: "semantic", detections: 412, anomalies: 3, coverage: 92 },
  { id: "radar-quetzalcoatl", codename: "Ojo de Quetzalcóatl", scope: "territorial", detections: 287, anomalies: 5, coverage: 88 },
  { id: "radar-mos-a", codename: "MOS Gemelo A", scope: "perimeter", detections: 1184, anomalies: 0, coverage: 96 },
  { id: "radar-mos-b", codename: "MOS Gemelo B", scope: "perimeter", detections: 1182, anomalies: 0, coverage: 96 },
  { id: "radar-dekateotl", codename: "Dekateotl Ethics", scope: "ethical", detections: 64, anomalies: 1, coverage: 99 },
  { id: "radar-laberinto", codename: "Laberinto Infinito", scope: "quantum", detections: 18, anomalies: 0, coverage: 74 },
];

export const NODES_MIRROR: NodeMirror[] = [
  { index: 1, code: "N01-ISABELLA", name: "Isabella DMX4 Kernel", cluster: "core", health: 94, description: "Orquestador multi-agente con shutdown preventivo." },
  { index: 2, code: "N02-TAMVAI", name: "TAMVAI Multi-Agente", cluster: "core", health: 91, description: "Federación de agentes (turismo, cultura, comercio)." },
  { index: 3, code: "N03-CHRONUS", name: "ChronusEngine", cluster: "core", health: 89, description: "Sincronización temporal de tráfico, clima y aforo." },
  { index: 4, code: "N04-DECISION", name: "Decision Engine", cluster: "core", health: 96, description: "Registro auditable SHA-256 de decisiones IA." },
  { index: 5, code: "N05-PROTOCOL", name: "Protocol Engine", cluster: "core", health: 88, description: "Hoyo Negro · Fénix · Futuros." },
  { index: 6, code: "N06-GENETIC", name: "Genetic Optimizer", cluster: "core", health: 90, description: "Rutas antifrágiles multi-objetivo." },
  { index: 7, code: "N07-IDNVIDA", name: "ID-NVIDA Sovereign Identity", cluster: "identity", health: 97, description: "DIDs, dignity, reputación inmutable." },
  { index: 8, code: "N08-EOCT", name: "EOCT Registro Civil", cluster: "identity", health: 92, description: "Estado · Origen · Conducta · Trayectoria." },
  { index: 9, code: "N09-DIGNITY", name: "Dignity Decay Job", cluster: "identity", health: 99, description: "Job 24h reduciendo dignity 1pt." },
  { index: 10, code: "N10-CITEMESH", name: "CITEMESH Governance", cluster: "governance", health: 87, description: "Powers/Roles + powerGuard middleware." },
  { index: 11, code: "N11-DAO", name: "DAO Phoenix", cluster: "governance", health: 84, description: "Propuestas y votación distribuida." },
  { index: 12, code: "N12-CONSTITUTION", name: "Constitución TAMV", cluster: "governance", health: 100, description: "Reglas inviolables del kernel." },
  { index: 13, code: "N13-ANUBIS", name: "Anubis Sentinel", cluster: "perimeter", health: 95, description: "Identity gatekeeper + JWT + revocation list." },
  { index: 14, code: "N14-HORUS", name: "Horus Sentinel", cluster: "perimeter", health: 93, description: "Vigilancia geoespacial + antifraude." },
  { index: 15, code: "N15-DEKATEOTL", name: "Dekateotl Ethics", cluster: "perimeter", health: 98, description: "Tribunal ético en línea." },
  { index: 16, code: "N16-AZTEK", name: "Aztek Gods Cluster", cluster: "perimeter", health: 90, description: "Quetzalcóatl/Tláloc/Huitzilopochtli." },
  { index: 17, code: "N17-OJO-RA", name: "Radar Ojo de Ra", cluster: "perimeter", health: 92, description: "Radar semántico solar." },
  { index: 18, code: "N18-OJO-QUETZ", name: "Radar Ojo de Quetzalcóatl", cluster: "perimeter", health: 78, description: "Radar territorial." },
  { index: 19, code: "N19-MOS-A", name: "MOS Gemelo A", cluster: "perimeter", health: 96, description: "Pipeline hexagonal A." },
  { index: 20, code: "N20-MOS-B", name: "MOS Gemelo B", cluster: "perimeter", health: 96, description: "Pipeline hexagonal B." },
  { index: 21, code: "N21-CONSENSOR", name: "Consensor MOS", cluster: "perimeter", health: 99, description: "Comparador SHA-256 de respuestas paralelas." },
  { index: 22, code: "N22-LABERINTO", name: "Laberinto Infinito", cluster: "perimeter", health: 81, description: "Honeypot adaptativo." },
  { index: 23, code: "N23-FENIX-REX", name: "Fénix Rex Protocol", cluster: "perimeter", health: 94, description: "Auto-recuperación tras incidente." },
  { index: 24, code: "N24-BABAS", name: "BABAS Audit Chain", cluster: "perimeter", health: 92, description: "Cadena de auditoría blockchain interna." },
  { index: 25, code: "N25-BOOKPI", name: "BookPI Evidence Registry", cluster: "memory", health: 99, description: "Registro inmutable hash-encadenado." },
  { index: 26, code: "N26-DIGYTAMV", name: "DIGYTAMV Conceptual Memory", cluster: "memory", health: 88, description: "Memoria conceptual vectorial." },
  { index: 27, code: "N27-MSR", name: "MSR Sovereign Registry", cluster: "memory", health: 93, description: "Eventos del metaverso firmados." },
  { index: 28, code: "N28-PGVECTOR", name: "PGVector Memory Bank", cluster: "memory", health: 86, description: "Embeddings episódicos." },
  { index: 29, code: "N29-LEDGER", name: "Phoenix Ledger", cluster: "economy", health: 91, description: "Libro mayor del token TAMV." },
  { index: 30, code: "N30-PHOENIX", name: "Phoenix 20·30·50", cluster: "economy", health: 95, description: "Distribución soberana 20/30/50." },
  { index: 31, code: "N31-TCEP", name: "TCEP Engine", cluster: "economy", health: 90, description: "Economy engine 75/25 fondo de impacto." },
  { index: 32, code: "N32-MERCHANT", name: "Merchant Catalog", cluster: "economy", health: 89, description: "Comercios verificados." },
  { index: 33, code: "N33-DONATIONS", name: "Donations Service", cluster: "economy", health: 93, description: "Pasarela de donativos territoriales." },
  { index: 34, code: "N34-MEMBERSHIP", name: "Membership Tiers", cluster: "economy", health: 92, description: "free · creator · guardian · institutional." },
  { index: 35, code: "N35-MDX4", name: "MD-X4 Render Engine", cluster: "render", health: 90, description: "Render volumétrico 4D." },
  { index: 36, code: "N36-XR-GATEWAY", name: "XR Gateway", cluster: "render", health: 88, description: "WebXR / Meta / Apple Vision." },
  { index: 37, code: "N37-DREAMSPACE", name: "DreamSpaces", cluster: "metaverse", health: 85, description: "Salas inmersivas colaborativas." },
  { index: 38, code: "N38-SPATIAL", name: "Spatial Pod", cluster: "metaverse", health: 84, description: "Render espacial con polytopes." },
  { index: 39, code: "N39-TWIN", name: "Digital Twin Service", cluster: "render", health: 91, description: "DTDL v3 sitios y comercios." },
  { index: 40, code: "N40-TELEMETRY", name: "Twin Telemetry", cluster: "render", health: 88, description: "Telemetría IoT del polígono." },
  { index: 41, code: "N41-CITEMESH-WIKI", name: "Citemesh Wiki", cluster: "memory", health: 86, description: "Wiki semántica territorial." },
  { index: 42, code: "N42-REALITO", name: "Realito Orb", cluster: "core", health: 94, description: "Asistente conversacional turístico." },
  { index: 43, code: "N43-STREAMS", name: "Streams Service", cluster: "metaverse", health: 87, description: "Salas live + videocall soberanas." },
  { index: 44, code: "N44-SOCIAL", name: "Social Mesh", cluster: "metaverse", health: 88, description: "Posts, likes, comentarios federados." },
  { index: 45, code: "N45-TAP", name: "TAP Protocol", cluster: "core", health: 92, description: "WebSocket TAP MessagePack." },
  { index: 46, code: "N46-GEMINI", name: "Geolocation IA", cluster: "core", health: 91, description: "Geolocalización + recomendaciones." },
  { index: 47, code: "N47-WEATHER", name: "Weather Bridge", cluster: "core", health: 95, description: "Tema visual reactivo al clima." },
  { index: 48, code: "N48-RDMX-STATUS", name: "RDMX Status Beacon", cluster: "core", health: 99, description: "Telemetría /api/rdmx/status." },
];

export const CLUSTER_LABEL: Record<string, string> = {
  core: "Núcleo",
  identity: "Identidad",
  perimeter: "Perímetro",
  memory: "Memoria",
  economy: "Economía",
  render: "Render",
  metaverse: "Metaverso",
  governance: "Gobernanza",
};
