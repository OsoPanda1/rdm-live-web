import type {
  SndtState, ConnectionType, ThreatLevel, MotionType,
  ZoneType, LocationSource, FederationId, SyncMode,
} from "../types"
import { buildSndtState } from "../model/s-ndtm"
import { SpatialRulesEngine } from "../spatial-rules/policies"
import { resolveZone } from "../spatial-rules/semantic-zones"
import { RdmSceFederationBridge } from "./federation-bus"
import { TerritorialBridge } from "./territorial-bridge"
import { IsolationModeManager } from "../degradation/isolation-mode"
import { YunReconciliator } from "../yun/reconciliation"

export interface IngestTelemetryInput {
  twin_id: string
  lon: number
  lat: number
  altitude?: number
  accuracy?: number
  ip: string
  asn?: number
  isp?: string
  connection_type: ConnectionType
  threat_level?: ThreatLevel
  proxy?: boolean
  motion_type: MotionType
  velocity?: number
  heading?: number
  trajectory_id: string
  neighborhood?: string
  zone_type?: ZoneType
  federation_id?: FederationId
  location_source?: LocationSource
  confidence?: number
}

export interface IngestTelemetryOutput {
  state: SndtState
  rules: ReturnType<SpatialRulesEngine["evaluate"]>
  zones: string[]
  federations: FederationId[]
  syncMode: SyncMode
  alerts: string[]
}

export class RdmSceApiBridge {
  private rulesEngine: SpatialRulesEngine
  private federationBridge: RdmSceFederationBridge
  private territorialBridge: TerritorialBridge
  private isolationManager: IsolationModeManager
  private reconciliator: YunReconciliator

  constructor(config: { nodeId: string }) {
    this.rulesEngine = new SpatialRulesEngine()
    this.federationBridge = new RdmSceFederationBridge({
      nodeId: config.nodeId,
      federationCount: 7,
    })
    this.territorialBridge = new TerritorialBridge()
    this.isolationManager = new IsolationModeManager()
    this.reconciliator = new YunReconciliator()
  }

  getFederationBridge(): RdmSceFederationBridge { return this.federationBridge }
  getTerritorialBridge(): TerritorialBridge { return this.territorialBridge }
  getRulesEngine(): SpatialRulesEngine { return this.rulesEngine }
  getIsolationManager(): IsolationModeManager { return this.isolationManager }
  getReconciliator(): YunReconciliator { return this.reconciliator }

  ingestTelemetry(input: IngestTelemetryInput): IngestTelemetryOutput {
    const fid = input.federation_id ?? this.resolveFederation(input.lon, input.lat)

    const zones = resolveZone(input.lon, input.lat, input.altitude)
      .map(z => z.id)

    const state = buildSndtState({
      twin_id: input.twin_id,
      lon: input.lon,
      lat: input.lat,
      altitude: input.altitude ?? 0,
      accuracy: input.accuracy ?? 50,
      geofences: zones,
      ip: input.ip,
      asn: input.asn ?? 0,
      isp: input.isp ?? "desconocido",
      connection_type: input.connection_type,
      threat_level: input.threat_level ?? "low",
      proxy: input.proxy ?? false,
      motion_type: input.motion_type,
      velocity: input.velocity ?? 0,
      heading: input.heading ?? 0,
      trajectory_id: input.trajectory_id,
      neighborhood: input.neighborhood ?? "No especificado",
      zone_type: input.zone_type ?? "urban",
      federation_id: fid,
      node_id: `rdm-sce-${fid}`,
      sync_mode: this.isolationManager.currentMode,
      federation_nodes: [`rdm-sce-1`, `rdm-sce-2`, `rdm-sce-3`, `rdm-sce-4`, `rdm-sce-5`, `rdm-sce-6`, `rdm-sce-7`],
      location_source: input.location_source ?? "ip_core_resolver",
      confidence: input.confidence ?? 0.5,
      isabella_policy_id: "isabella-policy-v1alpha",
      signature: `rdm-sce-${Date.now()}`,
    })

    const ruleInput = {
      twin_type: input.twin_type ?? "smart_tourism_twin",
      spatial_state: state.spatial_state,
      network_state: state.network_state,
      data_origin: state.data_origin,
      timestamp: state.timestamp,
      previous_state: undefined,
    }

    const ruleOutput = this.rulesEngine.evaluate(ruleInput)

    this.federationBridge.feedSndtToFederation(state)
    this.territorialBridge.processSndtState(state)

    const alerts: string[] = []
    if (ruleOutput.alarm_triggered) {
      alerts.push(...ruleOutput.violations)
    }

    return {
      state,
      rules: ruleOutput,
      zones,
      federations: zones.length > 0
        ? (resolveZone(input.lon, input.lat, input.altitude)
            .flatMap(z => z.federationIds) as FederationId[])
        : [fid],
      syncMode: this.isolationManager.currentMode,
      alerts,
    }
  }

  private resolveFederation(lon: number, lat: number): FederationId {
    const zones = resolveZone(lon, lat)
    if (zones.length > 0) {
      const primaryFed = zones[0].federationIds[0]
      return (primaryFed >= 1 && primaryFed <= 7 ? primaryFed : 3) as FederationId
    }
    return 3 as FederationId
  }
}
