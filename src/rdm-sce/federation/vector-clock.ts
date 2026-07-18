import type { VectorClock } from "../types"

export class VectorClockManager {
  private clock: VectorClock = {}
  private nodeId: string

  constructor(nodeId: string, initialNodes: string[] = []) {
    this.nodeId = nodeId
    for (const n of initialNodes) this.clock[n] = 0
  }

  tick(): VectorClock {
    this.clock[this.nodeId] = (this.clock[this.nodeId] || 0) + 1
    return { ...this.clock }
  }

  get(): VectorClock {
    return { ...this.clock }
  }

  merge(remote: VectorClock): { clock: VectorClock; conflict: boolean } {
    let conflict = false
    const merged: VectorClock = { ...this.clock }
    for (const [node, ts] of Object.entries(remote)) {
      const local = merged[node] ?? 0
      merged[node] = Math.max(local, ts)
      if (ts > 0 && local > ts) conflict = true
    }
    this.clock = merged
    return { clock: { ...this.clock }, conflict }
  }

  compare(remote: VectorClock): "before" | "after" | "concurrent" {
    let aLtB = true, bLtA = true
    const allNodes = new Set([...Object.keys(this.clock), ...Object.keys(remote)])
    for (const node of allNodes) {
      const va = this.clock[node] || 0
      const vb = remote[node] || 0
      if (va > vb) bLtA = false
      if (vb > va) aLtB = false
    }
    if (aLtB && !bLtA) return "before"
    if (bLtA && !aLtB) return "after"
    return "concurrent"
  }

  reset(nodes: string[]): void {
    this.clock = {}
    for (const n of nodes) this.clock[n] = 0
  }

  toJSON(): VectorClock {
    return this.clock
  }
}
