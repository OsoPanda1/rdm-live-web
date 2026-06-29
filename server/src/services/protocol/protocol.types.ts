export type FederatedLayer = "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";

export type ProtocolMode = "hoyo-negro" | "fenix" | "futuros";

export type ProtocolRunState = "draft" | "running" | "completed" | "halted";

export interface ProtocolSignal {
  id: string;
  createdAt: string;
  source: string;
  severity: "low" | "medium" | "high";
  summary: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ProtocolCommand {
  type: "START" | "TRANSITION" | "HALT";
  mode: ProtocolMode;
  context: string;
  actorId: string;
  tags?: string[];
}

export interface ProtocolConstitutionCheck {
  allowed: boolean;
  riskLevel: "green" | "amber" | "red";
  reasons: string[];
}

export interface ProtocolDecisionPath {
  id: string;
  label: string;
  ethicalScore: number;
  utilityScore: number;
  selected: boolean;
}

export interface ProtocolExecutionResult {
  runId: string;
  mode: ProtocolMode;
  state: ProtocolRunState;
  constitution: ProtocolConstitutionCheck;
  decisionPaths: ProtocolDecisionPath[];
  xrDirective: {
    profile: "heritage" | "festival" | "nature";
    threatLevel: "low" | "medium" | "high";
    overlays: string[];
  };
}
