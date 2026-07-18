import type { SyncMode } from "../types"

export interface SyncModeTransition {
  from: SyncMode
  to: SyncMode
  reason: string
  timestamp: number
}

export const SYNC_MODE_PRIORITY: Record<SyncMode, number> = {
  online_synchronized: 3,
  offline_autonomous: 2,
  degraded_isolation: 1,
}

export const ALLOWED_TRANSITIONS: Record<SyncMode, SyncMode[]> = {
  online_synchronized: ["offline_autonomous", "degraded_isolation"],
  offline_autonomous: ["online_synchronized", "degraded_isolation"],
  degraded_isolation: ["offline_autonomous"],
}

export function canTransition(from: SyncMode, to: SyncMode): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

export class SyncModeMachine {
  private current: SyncMode
  private history: SyncModeTransition[] = []

  constructor(initial: SyncMode = "online_synchronized") {
    this.current = initial
  }

  get mode(): SyncMode {
    return this.current
  }

  transition(to: SyncMode, reason: string): { success: boolean; from: SyncMode; to: SyncMode } {
    if (!canTransition(this.current, to)) {
      return { success: false, from: this.current, to }
    }
    const transition: SyncModeTransition = {
      from: this.current,
      to,
      reason,
      timestamp: Date.now(),
    }
    this.history.push(transition)
    this.current = to
    return { success: true, from: transition.from, to }
  }

  canTransitionTo(to: SyncMode): boolean {
    return canTransition(this.current, to)
  }

  getHistory(): SyncModeTransition[] {
    return [...this.history]
  }

  getCurrentModeReason(): string | null {
    if (this.history.length === 0) return null
    return this.history[this.history.length - 1].reason
  }

  reset(mode: SyncMode): void {
    this.current = mode
    this.history = []
  }
}
