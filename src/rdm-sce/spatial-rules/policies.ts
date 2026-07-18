import type { SndtState, GeoPoint, ThreatLevel, ConnectionType } from "../types"

export interface RegoRule {
  name: string
  description: string
  evaluate(input: RuleInput): boolean
}

export interface RuleInput {
  twin_type: string
  spatial_state: {
    current_position: GeoPoint
    accuracy_radius_meters: number
    altitude_meters: number
    current_geofences: string[]
  }
  network_state: {
    connection_type: ConnectionType
    threat_level: ThreatLevel
    proxy_detected: boolean
  }
  data_origin: {
    confidence_score: number
    location_source: string
  }
  previous_state?: SndtState["spatial_state"]
  timestamp: number
}

export interface RuleOutput {
  allow: boolean
  alarm_triggered: boolean
  enforce_anonymization: boolean
  violations: string[]
  matched_rules: string[]
}

export const DEFAULT_RULES: RegoRule[] = [
  {
    name: "permitir_comercio_fijo_centro",
    description: "Permitir operación regular de nodos comerciales fijos dentro del perímetro urbano validado",
    evaluate: (input) =>
      input.twin_type === "merchant_node" &&
      input.spatial_state.current_geofences.includes("MX-HGO-RDM-CENTRO") &&
      input.network_state.threat_level === "low" &&
      !input.network_state.proxy_detected,
  },
  {
    name: "permitir_infraestructura_alta_fidelidad",
    description: "Permitir transmisión de alta fidelidad para infraestructura crítica en zonas de resguardo",
    evaluate: (input) =>
      input.twin_type === "critical_infrastructure" &&
      input.spatial_state.current_geofences.includes("MX-HGO-RDM-MINAS") &&
      input.data_origin.confidence_score >= 0.95,
  },
  {
    name: "alerta_violacion_geofencing_critico",
    description: "Disparar alertas por violación de Geofencing Crítico (escape de activos de minas)",
    evaluate: (input) =>
      input.twin_type === "critical_infrastructure" &&
      input.spatial_state.current_geofences.length > 0 &&
      !input.spatial_state.current_geofences.includes("MX-HGO-RDM-MINAS"),
  },
  {
    name: "anomalia_cinetica_teletransportacion",
    description: "Detección de velocidad imposible mediante cálculo diferencial entre muestras",
    evaluate: (input) => {
      if (!input.previous_state) return false
      const dist = haversineDistance(
        input.previous_state.current_position.coordinates,
        input.spatial_state.current_position.coordinates,
      )
      const timeDelta = (input.timestamp - (input as any).previous_timestamp) / 1000
      if (timeDelta <= 0) return false
      return (dist / timeDelta) > 42
    },
  },
  {
    name: "anonimizacion_obligatoria_isabella",
    description: "Determinación ética de anonimización obligatoria por Isabella AI",
    evaluate: (input) =>
      input.twin_type === "smart_tourism_twin" &&
      ["wifi_local", "cellular_4g", "cellular_5g"].includes(input.network_state.connection_type) &&
      input.spatial_state.current_geofences.includes("MX-HGO-RDM-CENTRO") &&
      input.data_origin.confidence_score < 0.70,
  },
]

export class SpatialRulesEngine {
  private rules: RegoRule[] = []

  constructor(rules: RegoRule[] = DEFAULT_RULES) {
    this.rules = rules
  }

  evaluate(input: RuleInput): RuleOutput {
    const output: RuleOutput = {
      allow: false,
      alarm_triggered: false,
      enforce_anonymization: true,
      violations: [],
      matched_rules: [],
    }

    for (const rule of this.rules) {
      try {
        const matched = rule.evaluate(input)
        if (matched) {
          output.matched_rules.push(rule.name)

          if (rule.name.includes("permitir") || rule.name.includes("allow")) {
            output.allow = true
          }
          if (rule.name.includes("alerta") || rule.name.includes("alarm") || rule.name.includes("anomalia")) {
            output.alarm_triggered = true
            output.violations.push(`Regla "${rule.name}" activada: ${rule.description}`)
          }
          if (rule.name.includes("anonimizacion") || rule.name.includes("anonymization")) {
            output.enforce_anonymization = true
          }
        }
      } catch {
        continue
      }
    }

    return output
  }

  addRule(rule: RegoRule): void {
    this.rules.push(rule)
  }

  removeRule(name: string): void {
    this.rules = this.rules.filter(r => r.name !== name)
  }

  getRules(): RegoRule[] {
    return [...this.rules]
  }
}

function haversineDistance(a: number[], b: number[]): number {
  const R = 6371000
  const dLat = toRad(b[1] - a[1])
  const dLon = toRad(b[0] - a[0])
  const lat1 = toRad(a[1])
  const lat2 = toRad(b[1])
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const aVal = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
  return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}
