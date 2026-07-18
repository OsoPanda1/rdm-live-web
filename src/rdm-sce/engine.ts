import { RdmSceApiBridge } from "./integration/api-bridge"
import { FederationStateManager } from "./federation/state-manager"
import { SpatialRulesEngine } from "./spatial-rules/policies"
import { MobilityStreamService } from "./mobility/stream-service"
import { ProviderRegistry, globalProviderRegistry } from "./ip-context/registry"
import { LocalMmdbProvider } from "./ip-context/providers/local-mmdb"
import { RdmMeshProvider } from "./ip-context/providers/rdm-mesh"
import { IsolationModeManager } from "./degradation/isolation-mode"
import { YunReconciliator } from "./yun/reconciliation"
import { TerritorialBridge } from "./integration/territorial-bridge"
import { FEDERATION_MATRIX } from "./federation/matrix"

export class RdmSceEngine {
  public readonly api: RdmSceApiBridge
  public readonly federation: FederationStateManager
  public readonly rules: SpatialRulesEngine
  public readonly mobility: MobilityStreamService
  public readonly ipProviders: ProviderRegistry
  public readonly isolation: IsolationModeManager
  public readonly yun: YunReconciliator
  public readonly territorial: TerritorialBridge
  public readonly nodeId: string

  private started = false

  constructor(nodeId = "rdm-sce-node-001") {
    this.nodeId = nodeId
    this.api = new RdmSceApiBridge({ nodeId })
    this.federation = this.api.getFederationBridge().getStateManager()
    this.rules = this.api.getRulesEngine()
    this.mobility = new MobilityStreamService()
    this.ipProviders = globalProviderRegistry
    this.isolation = this.api.getIsolationManager()
    this.yun = this.api.getReconciliator()
    this.territorial = this.api.getTerritorialBridge()
  }

  start(): void {
    if (this.started) return
    this.started = true

    const localMmdb = new LocalMmdbProvider("maxmind_local_offline", "/data/geoip/rdm.mmdb", {
      "192.168.1.0": { countryCode: "MX", regionCode: "HGO", city: "Mineral del Monte", latitude: 20.1398, longitude: -98.6727, asn: 0, isp: "Red TAMV Local" },
    })
    const rdmMesh = new RdmMeshProvider("rdm_internal_ip_mesh", "http://mesh.rdm.local:8400")
    rdmMesh.loadMesh([
      { ipRange: "10.0.0.0/8", location: { lat: 20.1398, lng: -98.6727 }, nodeId: "RDM-CORE-NODE-001", federationId: 1 },
      { ipRange: "172.16.0.0/12", location: { lat: 20.1398, lng: -98.6727 }, nodeId: "RDM-EDGE-NODE-003", federationId: 3 },
    ])

    this.ipProviders.register(localMmdb)
    this.ipProviders.register(rdmMesh)
  }

  health(): {
    engine: string
    started: boolean
    syncMode: string
    federations: { id: number; name: string; mode: string }[]
    ipProviders: { name: string; healthy: boolean }[]
    isolationActive: boolean
  } {
    return {
      engine: "RDM-SCE v1alpha",
      started: this.started,
      syncMode: this.federation.getGlobalSyncMode(),
      federations: Object.values(FEDERATION_MATRIX).map(f => ({
        id: f.id,
        name: f.name,
        mode: this.federation.getSyncMachine(f.id).mode,
      })),
      ipProviders: this.ipProviders.getAllProviders().map(p => ({
        name: p.name(),
        healthy: p.isHealthy(),
      })),
      isolationActive: this.isolation.isIsolated,
    }
  }
}

export const globalRdmSceEngine = new RdmSceEngine()
