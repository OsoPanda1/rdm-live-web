// Shared protocol domain contracts

export type ProtocolMode = "hoyo-negro" | "fenix" | "futuros";
export type ProtocolRunState = "draft" | "running" | "completed" | "halted";

export interface ProtocolEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  source: string;
  createdAt: string;
}

export interface HealthStatus {
  service: string;
  status: "up" | "degraded" | "down";
  lastCheck: string;
  details?: string;
}
