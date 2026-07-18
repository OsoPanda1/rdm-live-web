import type { GeoPoint, ZoneType } from "../types"

export interface SemanticZone {
  id: string
  name: string
  zoneType: ZoneType
  boundary: GeoJSONPolygon
  federationIds: number[]
  minAltitude?: number
  maxAltitude?: number
}

interface GeoJSONPolygon {
  type: "Polygon"
  coordinates: number[][][]
}

export const SEMANTIC_ZONES: Record<string, SemanticZone> = {
  "MX-HGO-RDM-CENTRO": {
    id: "MX-HGO-RDM-CENTRO",
    name: "Centro Histórico y de Alta Densidad Comercial",
    zoneType: "heritage",
    boundary: {
      type: "Polygon",
      coordinates: [[
        [-98.678, 20.142],
        [-98.670, 20.142],
        [-98.670, 20.136],
        [-98.678, 20.136],
        [-98.678, 20.142],
      ]],
    },
    federationIds: [1, 2, 3, 4],
  },
  "MX-HGO-RDM-MINAS": {
    id: "MX-HGO-RDM-MINAS",
    name: "Distrito de Infraestructura de Antiguas Minas y Socavones",
    zoneType: "mining_zone",
    boundary: {
      type: "Polygon",
      coordinates: [[
        [-98.685, 20.148],
        [-98.665, 20.148],
        [-98.665, 20.130],
        [-98.685, 20.130],
        [-98.685, 20.148],
      ]],
    },
    federationIds: [1, 5, 6],
    minAltitude: 2500,
  },
  "MX-HGO-RDM-CORREDOR-TURISTICO": {
    id: "MX-HGO-RDM-CORREDOR-TURISTICO",
    name: "Eje Vial Turístico Real del Monte - Pachuca - Huasca",
    zoneType: "touristic_corridor",
    boundary: {
      type: "Polygon",
      coordinates: [[
        [-98.700, 20.155],
        [-98.650, 20.155],
        [-98.650, 20.125],
        [-98.700, 20.125],
        [-98.700, 20.155],
      ]],
    },
    federationIds: [1, 3, 4, 7],
  },
  "MX-HGO-RDM-ECOLOGICA": {
    id: "MX-HGO-RDM-ECOLOGICA",
    name: "Reserva Ecológica de la Comarca Minera",
    zoneType: "ecological_reserve",
    boundary: {
      type: "Polygon",
      coordinates: [[
        [-98.720, 20.170],
        [-98.640, 20.170],
        [-98.640, 20.120],
        [-98.720, 20.120],
        [-98.720, 20.170],
      ]],
    },
    federationIds: [1, 5, 7],
  },
}

export function pointInZone(lon: number, lat: number, zone: SemanticZone): boolean {
  const poly = zone.boundary.coordinates[0]
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1]
    const xj = poly[j][0], yj = poly[j][1]
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

export function resolveZone(lon: number, lat: number, alt?: number): SemanticZone[] {
  const activeZones: SemanticZone[] = []
  for (const zone of Object.values(SEMANTIC_ZONES)) {
    if (pointInZone(lon, lat, zone)) {
      if (alt !== undefined && zone.minAltitude !== undefined && alt < zone.minAltitude) continue
      if (alt !== undefined && zone.maxAltitude !== undefined && alt > zone.maxAltitude) continue
      activeZones.push(zone)
    }
  }
  return activeZones
}

export function getFederationsForPosition(lon: number, lat: number, alt?: number): number[] {
  const zones = resolveZone(lon, lat, alt)
  const fedSet = new Set<number>()
  for (const z of zones) {
    for (const fid of z.federationIds) fedSet.add(fid)
  }
  return Array.from(fedSet).sort()
}
