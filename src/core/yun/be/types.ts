import type { YunEventEnvelope, YunFederation } from "../types";

export const YUN_BE_STATES = ["SLEEPING", "ARMED_STANDBY", "AWAKENED", "COOLDOWN"] as const;
export type YunBeState = (typeof YUN_BE_STATES)[number];

export const YUN_BE_RISK_CLASSES = ["low", "medium", "high", "critical"] as const;
export type YunBeRiskClass = (typeof YUN_BE_RISK_CLASSES)[number];

export const YUN_BE_JOURNAL_STATUSES = [
  "pending",
  "completed",
  "replay_ready",
  "replaying",
  "blocked",
  "discarded",
  "failed",
] as const;
export type YunBeJournalStatus = (typeof YUN_BE_JOURNAL_STATUSES)[number];

export type YunBeOperationType =
  | "gateway_message"
  | "stripe_cattleya_payment"
  | "federation_command"
  | "agent_decision"
  | "storage_snapshot"
  | "kernel_signal";

export interface YunBeEvent<TPayload = unknown> {
  eventId: string;
  userId?: string;
  sourceSystem: string;
  payload: TPayload;
  timestamp: string;
  riskClass: YunBeRiskClass;
  yunEventType?: YunEventEnvelope["type"] | string;
  federation?: YunFederation;
  idempotencyKey: string;
}

export interface YunBeJournalEntry<TPayload = unknown> extends YunBeEvent<TPayload> {
  journalId: string;
  operationType: YunBeOperationType;
  status: YunBeJournalStatus;
  attempts: number;
  nextReplayAt?: string;
  completedAt?: string;
  lastError?: string;
  eoctScore?: number;
  metadata: Record<string, unknown>;
}

export interface YunBeRecoveryReport {
  reportId: string;
  startedAt: string;
  finishedAt: string;
  previousState: YunBeState;
  finalState: YunBeState;
  replayed: number;
  blocked: number;
  failed: number;
  completed: number;
  degradedFederations: YunFederation[];
  summary: string;
}

export interface YunBeHealthSignal {
  source: string;
  ok: boolean;
  latencyMs?: number;
  errorRate?: number;
  federation?: YunFederation;
  message?: string;
  timestamp?: string;
}

export interface YunBePolicy {
  enabled: boolean;
  eoctThreshold: number;
  aggressiveMode: boolean;
  maxReplayAttempts: number;
  armedRiskScore: number;
  awakenedRiskScore: number;
  journalGranularity: "coarse" | "fine";
}

export interface YunBeRuntimeStatus {
  state: YunBeState;
  policy: YunBePolicy;
  pendingCount: number;
  replayReadyCount: number;
  lastReport?: YunBeRecoveryReport;
}

export interface YunBeStorageAdapter {
  appendEvent(event: YunBeEvent): Promise<void>;
  upsertJournal(entry: YunBeJournalEntry): Promise<void>;
  listReplayable(now: Date, limit: number): Promise<YunBeJournalEntry[]>;
  markJournal(journalId: string, patch: Partial<YunBeJournalEntry>): Promise<void>;
  saveReport(report: YunBeRecoveryReport): Promise<void>;
  snapshot(key: string, payload: unknown): Promise<void>;
}

export interface YunBeNotifier {
  notifyStateChange(
    state: YunBeState,
    reason: string,
    context?: Record<string, unknown>,
  ): Promise<void>;
  notifyIncident(message: string, context?: Record<string, unknown>): Promise<void>;
  notifyReport(report: YunBeRecoveryReport): Promise<void>;
}

export interface YunBeReplayHandler {
  canHandle(entry: YunBeJournalEntry): boolean;
  replay(
    entry: YunBeJournalEntry,
  ): Promise<{ completed: boolean; metadata?: Record<string, unknown> }>;
}
