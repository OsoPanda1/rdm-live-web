import type { FederationId, FederationState, SyncMode, VectorClock } from "../types"
import { VectorClockManager } from "./vector-clock"
import { FEDERATION_MATRIX, type FederationMatrixEntry } from "./matrix"
import { SyncModeMachine } from "./sync-modes"

export interface FederationNodeHealth {
  node_id: string
  federation_id: FederationId
  online: boolean
  latency_ms: number
  last_seen: number
  sync_mode: SyncMode
  vector_clock: VectorClock
  error_count: number
}

export class FederationStateManager {
  private clocks: Map<FederationId, VectorClockManager> = new Map()
  private syncMachines: Map<FederationId, SyncModeMachine> = new Map()
  private nodeHealth: Map<string, FederationNodeHealth> = new Map()
  private listeners: Array<(event: FederationEvent) => void> = []

  constructor(private nodeId: string) {
    for (const fid of Object.keys(FEDERATION_MATRIX).map(Number) as FederationId[]) {
      this.clocks.set(fid, new VectorClockManager(`${nodeId}-f${fid}`))
      this.syncMachines.set(fid, new SyncModeMachine())
    }
  }

  getClock(federationId: FederationId): VectorClockManager {
    const clock = this.clocks.get(federationId)
    if (!clock) throw new Error(`Federación ${federationId} no registrada`)
    return clock
  }

  getSyncMachine(federationId: FederationId): SyncModeMachine {
    const machine = this.syncMachines.get(federationId)
    if (!machine) throw new Error(`Máquina de sincronización F${federationId} no encontrada`)
    return machine
  }

  tick(federationId: FederationId): VectorClock {
    return this.getClock(federationId).tick()
  }

  mergeClock(federationId: FederationId, remote: VectorClock): { clock: VectorClock; conflict: boolean } {
    return this.getClock(federationId).merge(remote)
  }

  buildFederationState(federationId: FederationId): FederationState {
    const clock = this.getClock(federationId)
    const machine = this.getSyncMachine(federationId)
    return {
      federation_id: federationId,
      node_id: this.nodeId,
      sync_mode: machine.mode,
      vector_clock: clock.get(),
    }
  }

  registerNodeHealth(
    nodeId: string,
    federationId: FederationId,
    latencyMs: number,
  ): void {
    const existing = this.nodeHealth.get(nodeId)
    this.nodeHealth.set(nodeId, {
      node_id: nodeId,
      federation_id: federationId,
      online: true,
      latency_ms: latencyMs,
      last_seen: Date.now(),
      sync_mode: this.getSyncMachine(federationId).mode,
      vector_clock: this.getClock(federationId).get(),
      error_count: existing?.error_count ?? 0,
    })
  }

  reportNodeError(nodeId: string): void {
    const node = this.nodeHealth.get(nodeId)
    if (node) {
      node.error_count++
      node.last_seen = Date.now()
      if (node.error_count >= 5) {
        node.online = false
        this.emit({ type: "node_disconnected", node_id: nodeId, federation_id: node.federation_id })
      }
    }
  }

  transitionSync(federationId: FederationId, to: SyncMode, reason: string): boolean {
    const result = this.getSyncMachine(federationId).transition(to, reason)
    if (result.success) {
      this.emit({
        type: "sync_mode_changed",
        federation_id: federationId,
        from: result.from,
        to: result.to,
        reason,
      })
    }
    return result.success
  }

  getGlobalSyncMode(): SyncMode {
    const modes = Object.values(FEDERATION_MATRIX).map(f =>
      this.getSyncMachine(f.id).mode
    )
    if (modes.every(m => m === "online_synchronized")) return "online_synchronized"
    if (modes.some(m => m === "degraded_isolation")) return "degraded_isolation"
    return "offline_autonomous"
  }

  getOperationalFederations(): FederationMatrixEntry[] {
    return Object.values(FEDERATION_MATRIX).filter(f =>
      this.getSyncMachine(f.id).mode !== "degraded_isolation"
    )
  }

  getHealthSummary(): { total: number; online: number; degraded: number; offline: number } {
    let online = 0, degraded = 0, offline = 0
    for (const node of this.nodeHealth.values()) {
      if (!node.online) offline++
      else if (node.sync_mode === "degraded_isolation") degraded++
      else online++
    }
    return { total: this.nodeHealth.size, online, degraded, offline }
  }

  subscribe(listener: (event: FederationEvent) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const idx = this.listeners.indexOf(listener)
      if (idx >= 0) this.listeners.splice(idx, 1)
    }
  }

  private emit(event: FederationEvent): void {
    for (const listener of this.listeners) listener(event)
  }
}

export type FederationEvent =
  | { type: "sync_mode_changed"; federation_id: FederationId; from: SyncMode; to: SyncMode; reason: string }
  | { type: "node_disconnected"; node_id: string; federation_id: FederationId }
  | { type: "node_reconnected"; node_id: string; federation_id: FederationId }
