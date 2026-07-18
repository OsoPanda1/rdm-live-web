import type { SndtSnapshot } from "../types"
import { getMerkleRoot, hashSnapshot, generateMerkleProof, verifyMerkleProof } from "./merkle-tree"

export interface ReconciliationResult {
  localOnly: SndtSnapshot[]
  remoteOnly: string[]
  conflicts: Array<{ twinId: string; localSeq: number; remoteSeq: number }>
  resolved: boolean
}

export class YunReconciliator {
  reconcile(
    localSnapshots: SndtSnapshot[],
    remoteHashes: Map<string, { hash: string; sequence: number }>,
  ): ReconciliationResult {
    const localOnly: SndtSnapshot[] = []
    const remoteOnly: string[] = []
    const conflicts: ReconciliationResult["conflicts"] = []

    for (const snap of localSnapshots) {
      const hash = hashSnapshot(snap)
      const remote = remoteHashes.get(snap.state.twin_id)

      if (!remote) {
        localOnly.push(snap)
      } else if (remote.hash !== hash) {
        conflicts.push({
          twinId: snap.state.twin_id,
          localSeq: snap.sequence,
          remoteSeq: remote.sequence,
        })
      }
    }

    for (const [twinId] of remoteHashes) {
      if (!localSnapshots.find(s => s.state.twin_id === twinId)) {
        remoteOnly.push(twinId)
      }
    }

    return { localOnly, remoteOnly, conflicts, resolved: conflicts.length === 0 }
  }

  resolveConflict(
    local: SndtSnapshot,
    remoteHash: string,
  ): { winner: SndtSnapshot; strategy: "timestamp" | "sequence" } {
    if (local.sequence > remoteHash.length) {
      return { winner: local, strategy: "sequence" }
    }
    return { winner: local, strategy: "timestamp" }
  }

  verifyRemoteInclusion(
    localSnapshots: SndtSnapshot[],
    remoteRoot: string,
    targetTwinId: string,
  ): boolean {
    const idx = localSnapshots.findIndex(s => s.state.twin_id === targetTwinId)
    if (idx < 0) return false

    const proof = generateMerkleProof(localSnapshots, idx)
    if (!proof) return false

    return verifyMerkleProof(proof.leafHash, remoteRoot, proof.siblings, proof.pathIndices)
  }
}

export function computeMerkleRoot(snapshots: SndtSnapshot[]): string {
  return getMerkleRoot(snapshots)
}
