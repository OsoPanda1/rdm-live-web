// ============================================================================
// Tenochtitlan System — Core type definitions
// Absorbed from OsoPanda1/* repos: civilizational-core, quantum-system-tamv,
// genesis-digytamv-nexus, citemesh-roots, real-del-monte-twin.
// Implements the 9 sentinel pantheon + dual hexagonal pipeline + 48 nodes.
// ============================================================================

export type SentinelStatus = "online" | "degraded" | "offline" | "alert";
export type Power = "LOGICAL" | "EXECUTIVE" | "OBSERVER" | "HUMAN";
export type Role = "CITIZEN" | "CUSTODIAN" | "SYSTEM" | "ARCHITECT";

export interface SentinelHeartbeat {
  id: string;
  glyph: string;
  name: string;
  mission: string;
  powers: Power[];
  status: SentinelStatus;
  load: number; // 0-100
  uptimeSeconds: number;
  lastBeatAt: string;
  signalsHandled: number;
  metrics: Record<string, number | string>;
}

export interface RadarSweep {
  id: string;
  codename: string;
  scope: "territorial" | "semantic" | "ethical" | "perimeter" | "quantum";
  detections: number;
  anomalies: number;
  coverage: number; // %
  lastSweepAt: string;
}

export interface NodeRecord {
  index: number;
  code: string;
  name: string;
  cluster:
    | "core"
    | "identity"
    | "economy"
    | "perimeter"
    | "memory"
    | "render"
    | "metaverse"
    | "governance";
  status: SentinelStatus;
  health: number; // 0-100
  description: string;
}

export interface IdentityRecord {
  id: string;
  did: string;
  username: string;
  role: Role;
  dignity: number; // 0-100
  reputation: number;
  immutableUsername: boolean;
  createdAt: string;
}

export interface MsrEntry {
  id: string;
  actor: string;
  action: string;
  payload: Record<string, string | number | boolean>;
  prevHash: string;
  hash: string;
  createdAt: string;
}

export interface RenderJob {
  id: string;
  pipeline: "hex-A" | "hex-B";
  scene: string;
  resolution: string;
  fps: number;
  status: "queued" | "rendering" | "done" | "error";
  startedAt: string;
  completedAt?: string;
}
