import type { FederationId, SyncMode, SndtState } from "../types"
import { FederationStateManager } from "../federation/state-manager"

export interface RdmSceFederationBridgeConfig {
  nodeId: string
  federationCount: number
}

export class RdmSceFederationBridge {
  private stateManager: FederationStateManager
  private config: RdmSceFederationBridgeConfig

  constructor(config: RdmSceFederationBridgeConfig) {
    this.config = config
    this.stateManager = new FederationStateManager(config.nodeId)
  }

  getStateManager(): FederationStateManager {
    return this.stateManager
  }

  feedSndtToFederation(state: SndtState): void {
    const fid = state.federation_state.federation_id

    this.stateManager.tick(fid)
    this.stateManager.buildFederationState(fid)
    this.stateManager.registerNodeHealth(
      state.federation_state.node_id,
      fid,
      0,
    )
  }

  handleNodeDisconnect(nodeId: string, federationId: FederationId): void {
    this.stateManager.reportNodeError(nodeId)
    if (this.shouldDegrade(federationId)) {
      this.stateManager.transitionSync(
        federationId,
        "degraded_isolation",
        `Pérdida de conectividad del nodo ${nodeId} en F${federationId}`,
      )
    }
  }

  getStatus(): {
    globalSyncMode: SyncMode
    operationalFederations: number
    healthSummary: ReturnType<FederationStateManager["getHealthSummary"]>
  } {
    return {
      globalSyncMode: this.stateManager.getGlobalSyncMode(),
      operationalFederations: this.stateManager.getOperationalFederations().length,
      healthSummary: this.stateManager.getHealthSummary(),
    }
  }

  private shouldDegrade(federationId: FederationId): boolean {
    const machine = this.stateManager.getSyncMachine(federationId)
    const health = this.stateManager.getHealthSummary()
    return (
      machine.mode === "online_synchronized" &&
      (health.offline / Math.max(health.total, 1)) > 0.5
    )
  }
}
