import type { SndtSnapshot } from "../types"

function sha256(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(8, "0")
}

export function hashSnapshot(snapshot: SndtSnapshot): string {
  const data = JSON.stringify({
    twin_id: snapshot.state.twin_id,
    timestamp: snapshot.state.timestamp,
    position: snapshot.state.spatial_state.current_position.coordinates,
    federation_id: snapshot.state.federation_state.federation_id,
    node_id: snapshot.state.federation_state.node_id,
    sequence: snapshot.sequence,
    previous_hash: snapshot.previous_hash,
  })
  return sha256(data)
}

export function hashSnapshots(snapshots: SndtSnapshot[]): string[] {
  return snapshots.map(s => hashSnapshot(s))
}

export interface MerkleNode {
  hash: string
  left?: MerkleNode
  right?: MerkleNode
}

export function buildMerkleTree(hashes: string[]): MerkleNode | null {
  if (hashes.length === 0) return null

  let nodes: MerkleNode[] = hashes.map(h => ({ hash: h }))

  while (nodes.length > 1) {
    const nextLevel: MerkleNode[] = []
    for (let i = 0; i < nodes.length; i += 2) {
      if (i + 1 < nodes.length) {
        const combined = sha256(nodes[i].hash + nodes[i + 1].hash)
        nextLevel.push({
          hash: combined,
          left: nodes[i],
          right: nodes[i + 1],
        })
      } else {
        nextLevel.push(nodes[i])
      }
    }
    nodes = nextLevel
  }

  return nodes[0]
}

export function getMerkleRoot(snapshots: SndtSnapshot[]): string {
  if (snapshots.length === 0) return "0"
  const hashes = hashSnapshots(snapshots)
  const tree = buildMerkleTree(hashes)
  return tree?.hash ?? "0"
}

export function generateMerkleProof(
  snapshots: SndtSnapshot[],
  targetIndex: number,
): { leafHash: string; rootHash: string; siblings: string[]; pathIndices: number[] } | null {
  if (targetIndex < 0 || targetIndex >= snapshots.length) return null

  const hashes = hashSnapshots(snapshots)
  const leafHash = hashes[targetIndex]
  const rootHash = getMerkleRoot(snapshots)

  const siblings: string[] = []
  const pathIndices: number[] = []

  let levelHashes = [...hashes]
  let idx = targetIndex

  while (levelHashes.length > 1) {
    const nextLevel: string[] = []
    for (let i = 0; i < levelHashes.length; i += 2) {
      if (i + 1 < levelHashes.length) {
        nextLevel.push(sha256(levelHashes[i] + levelHashes[i + 1]))
        if (i === idx || i + 1 === idx) {
          siblings.push(i === idx ? levelHashes[i + 1] : levelHashes[i])
          pathIndices.push(i === idx ? 1 : 0)
          idx = Math.floor(idx / 2)
        }
      } else {
        nextLevel.push(levelHashes[i])
        if (i === idx) {
          idx = Math.floor(idx / 2)
        }
      }
    }
    levelHashes = nextLevel
  }

  return { leafHash, rootHash, siblings, pathIndices }
}

export function verifyMerkleProof(
  leafHash: string,
  rootHash: string,
  siblings: string[],
  pathIndices: number[],
): boolean {
  let current = leafHash
  for (let i = 0; i < siblings.length; i++) {
    current = pathIndices[i] === 0
      ? sha256(current + siblings[i])
      : sha256(siblings[i] + current)
  }
  return current === rootHash
}
