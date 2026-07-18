import type { FederationId, ZoneType, SyncMode } from "../types"

export interface FederationMatrixEntry {
  id: FederationId
  name: string
  specialty: string
  permittedTelemetry: string
  persistence: string
  priority: number
  zones: ZoneType[]
}

export const FEDERATION_MATRIX: Record<FederationId, FederationMatrixEntry> = {
  1: {
    id: 1,
    name: "Infraestructura Core",
    specialty: "Topología de nodos físicos, gateways, antenas mesh",
    permittedTelemetry: "coordenadas de infraestructura, estado de enlaces",
    persistence: "SQLite embebida + replicación LiteFS",
    priority: 1,
    zones: ["urban", "rural", "heritage", "mining_zone", "touristic_corridor", "ecological_reserve"],
  },
  2: {
    id: 2,
    name: "Identidad y Acceso",
    specialty: "Hashes criptográficos de consentimiento, claves públicas, firmas",
    permittedTelemetry: "ninguna — solo metadatos de consentimiento",
    persistence: "Ledger inmutable distribuido BFT local",
    priority: 2,
    zones: ["urban", "heritage", "touristic_corridor"],
  },
  3: {
    id: 3,
    name: "Turismo Inteligente",
    specialty: "Centroides de flujo peatonal, densidad por manzana, estados de comercios",
    permittedTelemetry: "centroides aproximados, densidad de calor, estados",
    persistence: "PostGIS + índices R-Tree",
    priority: 4,
    zones: ["urban", "heritage", "touristic_corridor", "ecological_reserve"],
  },
  4: {
    id: 4,
    name: "Comercio y Servicios",
    specialty: "Trazabilidad origen-destino de materias primas, logística última milla",
    permittedTelemetry: "trazas origen-destino anonimizadas",
    persistence: "Ledger cronológico de series de tiempo",
    priority: 5,
    zones: ["urban", "heritage", "touristic_corridor"],
  },
  5: {
    id: 5,
    name: "Seguridad y Protección Civil",
    specialty: "Monitoreo estructural de minas, incidentes, alertas",
    permittedTelemetry: "trazas exactas en tiempo real de infraestructura crítica",
    persistence: "TimescaleDB + compresión nativa + retención agresiva",
    priority: 3,
    zones: ["urban", "mining_zone", "rural", "heritage", "ecological_reserve"],
  },
  6: {
    id: 6,
    name: "OSINT y Análisis Contextual",
    specialty: "IP mapping, vectores de amenaza externa, bordes de red",
    permittedTelemetry: "direcciones IP + vectores de amenaza",
    persistence: "ClickHouse para análisis masivo de logs",
    priority: 6,
    zones: ["urban", "rural", "mining_zone"],
  },
  7: {
    id: 7,
    name: "Investigación y Desarrollo",
    specialty: "Coordenadas sintéticas anonimizadas, simulación matemática",
    permittedTelemetry: "coordenadas sintéticas desvinculadas",
    persistence: "Almacenamiento plano en archivos estructurados Sandbox",
    priority: 7,
    zones: ["urban", "heritage", "ecological_reserve"],
  },
}

export function getFederationForZone(zone: ZoneType): FederationId[] {
  const result: FederationId[] = []
  for (const [id, entry] of Object.entries(FEDERATION_MATRIX)) {
    if (entry.zones.includes(zone)) result.push(entry.id)
  }
  return result.sort((a, b) => FEDERATION_MATRIX[a].priority - FEDERATION_MATRIX[b].priority)
}

export function getFederationById(id: FederationId): FederationMatrixEntry {
  return FEDERATION_MATRIX[id]
}

export function getFederationsBySyncMode(mode: SyncMode): FederationMatrixEntry[] {
  return Object.values(FEDERATION_MATRIX).filter(f => {
    if (mode === "online_synchronized") return f.priority <= 3
    if (mode === "offline_autonomous") return f.priority <= 5
    return true
  })
}
