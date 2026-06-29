// ============================================================================
// TAMV — Network Store: nodos federados, MSR Bridge y cifrado cuántico
// ============================================================================
import { create } from "zustand";

export type NetworkStatus = "online" | "offline" | "syncing" | "maintenance";
export type NodeStatus = "active" | "idle" | "error";

export interface NetworkNode {
  id: string;
  name: string;
  status: NodeStatus;
  latency: number; // ms
  region: string;
  layer: "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";
}

export interface NetworkState {
  status: NetworkStatus;
  nodes: NetworkNode[];
  quantumEncryptionActive: boolean;
  msrBridgeConnected: boolean;
  bookpiAnchorActive: boolean;
  lastSync: Date | null;

  setStatus: (status: NetworkStatus) => void;
  addNode: (node: NetworkNode) => void;
  removeNode: (id: string) => void;
  updateNodeStatus: (id: string, status: NodeStatus) => void;
  toggleQuantumEncryption: () => void;
  setMsrBridgeStatus: (connected: boolean) => void;
  setBookpiAnchor: (active: boolean) => void;
  recordSync: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  status: "online",
  nodes: [
    { id: "nexus-rdm", name: "Nexus-RDM (Nodo Cero)", status: "active", latency: 6, region: "Real del Monte, MX", layer: "L0" },
    { id: "nexus-alpha", name: "Nexus-Alpha", status: "active", latency: 12, region: "LATAM", layer: "L1" },
    { id: "nexus-beta", name: "Nexus-Beta", status: "active", latency: 8, region: "NA", layer: "L2" },
    { id: "nexus-gamma", name: "Nexus-Gamma", status: "idle", latency: 23, region: "EU", layer: "L3" },
    { id: "phoenix-swarm", name: "Phoenix Swarm", status: "active", latency: 14, region: "P2P libp2p", layer: "L4" },
    { id: "anubis-zk", name: "ANUBIS ZK Layer", status: "active", latency: 11, region: "ZK Mesh", layer: "L5" },
    { id: "bookpi-vault", name: "BookPI Vault (IPFS)", status: "active", latency: 19, region: "Filebase / IPFS", layer: "L6" },
    { id: "msr-bridge", name: "MSR Blockchain Bridge", status: "active", latency: 27, region: "EVM Sidechain", layer: "L7" },
  ],
  quantumEncryptionActive: true,
  msrBridgeConnected: true,
  bookpiAnchorActive: true,
  lastSync: new Date(),

  setStatus: (status) => set({ status }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  removeNode: (id) => set((s) => ({ nodes: s.nodes.filter((n) => n.id !== id) })),
  updateNodeStatus: (id, status) =>
    set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, status } : n)) })),
  toggleQuantumEncryption: () =>
    set((s) => ({ quantumEncryptionActive: !s.quantumEncryptionActive })),
  setMsrBridgeStatus: (msrBridgeConnected) => set({ msrBridgeConnected }),
  setBookpiAnchor: (bookpiAnchorActive) => set({ bookpiAnchorActive }),
  recordSync: () => set({ lastSync: new Date() }),
}));
