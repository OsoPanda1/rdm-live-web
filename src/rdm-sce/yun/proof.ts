import type { MerkleProof, SndtSnapshot } from "../types"
import { hashSnapshot, generateMerkleProof, verifyMerkleProof } from "./merkle-tree"

export function proveInclusion(
  snapshot: SndtSnapshot,
  allSnapshots: SndtSnapshot[],
): MerkleProof | null {
  const idx = allSnapshots.findIndex(
    s => s.state.twin_id === snapshot.state.twin_id && s.sequence === snapshot.sequence,
  )
  if (idx < 0) return null

  const proof = generateMerkleProof(allSnapshots, idx)
  if (!proof) return null

  return {
    leaf_hash: proof.leafHash,
    root_hash: proof.rootHash,
    siblings: proof.siblings,
    path_indices: proof.pathIndices,
  }
}

export function verifyInclusion(proof: MerkleProof): boolean {
  return verifyMerkleProof(proof.leaf_hash, proof.root_hash, proof.siblings, proof.path_indices)
}

export function verifyFederatedInclusion(
  proof: MerkleProof,
  knownRoot: string,
): boolean {
  if (proof.root_hash !== knownRoot) return false
  return verifyInclusion(proof)
}
