import type { SyncMode, FederationId } from "../types"
import { SyncModeMachine } from "../federation/sync-modes"
import { YunReconciliator } from "../yun/reconciliation"
import type { SndtSnapshot } from "../types"

export type DegradationCause =
  | "wan_backbone_failure"
  | "power_outage"
  | "extreme_weather"
  | "cyber_attack"
  | "hardware_failure"
  | "manual_intervention"

export interface IsolationEvent {
  cause: DegradationCause
  enteredAt: number
  federationsAffected: FederationId[]
  expectedRecoveryStrategy: "auto_heal" | "manual_recovery" | "assisted_reconnect"
}

export class IsolationModeManager {
  private syncMachine: SyncModeMachine
  private currentEvent: IsolationEvent | null = null
  private listeners: Array<(event: IsolationEvent) => void> = []
  private bufferedSnapshots: SndtSnapshot[] = []

  constructor() {
    this.syncMachine = new SyncModeMachine("online_synchronized")
  }

  get currentMode(): SyncMode {
    return this.syncMachine.mode
  }

  get isIsolated(): boolean {
    return this.syncMachine.mode === "degraded_isolation"
  }

  enterIsolation(
    cause: DegradationCause,
    federationsAffected: FederationId[],
  ): IsolationEvent {
    const event: IsolationEvent = {
      cause,
      enteredAt: Date.now(),
      federationsAffected,
      expectedRecoveryStrategy: cause === "extreme_weather" || cause === "wan_backbone_failure"
        ? "auto_heal"
        : cause === "cyber_attack"
        ? "manual_recovery"
        : "assisted_reconnect",
    }

    this.syncMachine.transition("degraded_isolation",
      `Aislamiento por ${cause}: F${federationsAffected.join(", F")}`
    )
    this.currentEvent = event
    this.emit(event)

    return event
  }

  bufferSnapshot(snapshot: SndtSnapshot): void {
    this.bufferedSnapshots.push(snapshot)
  }

  getBufferedSnapshots(): SndtSnapshot[] {
    return [...this.bufferedSnapshots]
  }

  attemptRecovery(
    reconciliator: YunReconciliator,
    remoteHashes: Map<string, { hash: string; sequence: number }>,
  ): { recovered: boolean; result: ReturnType<YunReconciliator["reconcile"]> } {
    if (this.currentMode !== "degraded_isolation") {
      return { recovered: false, result: { localOnly: [], remoteOnly: [], conflicts: [], resolved: true } }
    }

    const result = reconciliator.reconcile(this.bufferedSnapshots, remoteHashes)

    if (result.resolved) {
      this.syncMachine.transition("offline_autonomous",
        "Recuperación post-aislamiento: datos reconciliados"
      )
      this.currentEvent = null
    }

    return { recovered: result.resolved, result }
  }

  completeRecovery(): void {
    if (this.syncMachine.mode === "offline_autonomous") {
      this.syncMachine.transition("online_synchronized",
        "Recuperación completa: restauración de enlace WAN"
      )
      this.bufferedSnapshots = []
    }
  }

  getIsolationDuration(): number | null {
    if (!this.currentEvent) return null
    return Date.now() - this.currentEvent.enteredAt
  }

  subscribe(listener: (event: IsolationEvent) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const idx = this.listeners.indexOf(listener)
      if (idx >= 0) this.listeners.splice(idx, 1)
    }
  }

  private emit(event: IsolationEvent): void {
    for (const listener of this.listeners) listener(event)
  }
}
