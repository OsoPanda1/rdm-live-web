import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";
import { federationManager } from "../federation-coordinator";
import { YunEvents } from "../event-bus";
import { recordGauge, incrementCounter } from "../observability";
import { createDefaultYunBeStorage, SlackYunBeNotifier } from "./adapters";
import { calculateEoctScore, explainEoctBlock } from "./eoct";
import { resolveYunBePolicy, scoreHealthSignals } from "./policy";
import { createDefaultReplayHandlers } from "./replay-handlers";
import type {
  YunBeEvent,
  YunBeHealthSignal,
  YunBeJournalEntry,
  YunBeNotifier,
  YunBeOperationType,
  YunBePolicy,
  YunBeRecoveryReport,
  YunBeReplayHandler,
  YunBeRiskClass,
  YunBeRuntimeStatus,
  YunBeState,
  YunBeStorageAdapter,
} from "./types";

interface YunBeAgentOptions {
  storage?: YunBeStorageAdapter;
  notifier?: YunBeNotifier;
  replayHandlers?: YunBeReplayHandler[];
  policy?: YunBePolicy;
}

function nextReplayDelayMs(attempts: number, aggressive: boolean): number {
  const base = aggressive ? 5_000 : 30_000;
  return Math.min(base * 2 ** Math.max(0, attempts - 1), 15 * 60_000);
}

export class YunBeAgent {
  private state: YunBeState = "SLEEPING";
  private policy: YunBePolicy;
  private readonly storage: YunBeStorageAdapter;
  private readonly notifier: YunBeNotifier;
  private readonly replayHandlers: YunBeReplayHandler[];
  private lastReport: YunBeRecoveryReport | undefined;
  private pendingCount = 0;
  private replayReadyCount = 0;

  constructor(options: YunBeAgentOptions = {}) {
    this.policy = options.policy ?? resolveYunBePolicy();
    this.storage = options.storage ?? createDefaultYunBeStorage();
    this.notifier = options.notifier ?? new SlackYunBeNotifier();
    this.replayHandlers = options.replayHandlers ?? createDefaultReplayHandlers();
  }

  getStatus(): YunBeRuntimeStatus {
    return {
      state: this.state,
      policy: this.policy,
      pendingCount: this.pendingCount,
      replayReadyCount: this.replayReadyCount,
      lastReport: this.lastReport,
    };
  }

  updatePolicy(policy: Partial<YunBePolicy>): void {
    this.policy = { ...this.policy, ...policy };
  }

  async observe<TPayload>(
    event: Omit<YunBeEvent<TPayload>, "eventId" | "timestamp" | "idempotencyKey"> & {
      eventId?: string;
      timestamp?: string;
      idempotencyKey?: string;
    },
  ): Promise<YunBeEvent<TPayload>> {
    const normalized: YunBeEvent<TPayload> = {
      ...event,
      eventId: event.eventId ?? uuidv4(),
      timestamp: event.timestamp ?? new Date().toISOString(),
      idempotencyKey: event.idempotencyKey ?? `${event.sourceSystem}:${event.eventId ?? uuidv4()}`,
    };

    await this.storage.appendEvent(normalized);
    incrementCounter("yunbe_events_total", {
      risk: normalized.riskClass,
      source: normalized.sourceSystem,
    });
    return normalized;
  }

  async journal<TPayload>(
    operationType: YunBeOperationType,
    event: Omit<YunBeEvent<TPayload>, "eventId" | "timestamp" | "idempotencyKey"> & {
      eventId?: string;
      timestamp?: string;
      idempotencyKey?: string;
    },
    metadata: Record<string, unknown> = {},
  ): Promise<YunBeJournalEntry<TPayload>> {
    const observed = await this.observe(event);
    const entry: YunBeJournalEntry<TPayload> = {
      ...observed,
      journalId: uuidv4(),
      operationType,
      status: "pending",
      attempts: 0,
      metadata,
    };

    await this.storage.upsertJournal(entry);
    this.pendingCount++;
    incrementCounter("yunbe_journal_total", { operationType, risk: observed.riskClass });
    return entry;
  }

  async complete(journalId: string, metadata: Record<string, unknown> = {}): Promise<void> {
    await this.storage.markJournal(journalId, {
      status: "completed",
      completedAt: new Date().toISOString(),
      metadata,
    });
    this.pendingCount = Math.max(0, this.pendingCount - 1);
  }

  async ingestHealthSignals(signals: YunBeHealthSignal[]): Promise<YunBeState> {
    const score = scoreHealthSignals(signals);
    recordGauge("yunbe_risk_score", score);
    const previous = this.state;

    if (!this.policy.enabled) {
      await this.transition("SLEEPING", "disabled by GrowthBook/YUNBE policy", { score });
      return this.state;
    }

    if (score >= this.policy.awakenedRiskScore) {
      await this.transition("AWAKENED", "health risk threshold breached", { score, signals });
    } else if (score >= this.policy.armedRiskScore) {
      await this.transition("ARMED_STANDBY", "elevated health risk", { score, signals });
    } else if (previous === "AWAKENED") {
      await this.transition("COOLDOWN", "health risk normalized", { score });
    } else if (previous === "COOLDOWN") {
      await this.transition("SLEEPING", "cooldown complete", { score });
    }

    return this.state;
  }

  async runRecoveryCycle(limit = 25): Promise<YunBeRecoveryReport> {
    const previousState = this.state;
    if (this.state !== "AWAKENED") {
      await this.transition("AWAKENED", "manual recovery cycle requested");
    }

    const startedAt = new Date().toISOString();
    let replayed = 0;
    let blocked = 0;
    let failed = 0;
    let completed = 0;
    const replayable = await this.storage.listReplayable(new Date(), limit);
    this.replayReadyCount = replayable.length;

    for (const entry of replayable) {
      const eoctScore = calculateEoctScore(entry);
      if (eoctScore < this.policy.eoctThreshold) {
        const reason = explainEoctBlock(entry, eoctScore, this.policy.eoctThreshold);
        await this.storage.markJournal(entry.journalId, {
          status: "blocked",
          eoctScore,
          lastError: reason,
        });
        await this.notifier.notifyIncident(reason, { journalId: entry.journalId });
        blocked++;
        continue;
      }

      const handler = this.replayHandlers.find((candidate) => candidate.canHandle(entry));
      if (!handler) {
        await this.storage.markJournal(entry.journalId, {
          status: "blocked",
          eoctScore,
          lastError: "no replay handler registered",
        });
        blocked++;
        continue;
      }

      try {
        await this.storage.markJournal(entry.journalId, {
          status: "replaying",
          attempts: entry.attempts + 1,
          eoctScore,
        });
        const result = await handler.replay(entry);
        replayed++;
        if (result.completed) {
          await this.complete(entry.journalId, { replay: result.metadata, eoctScore });
          completed++;
        } else {
          await this.deferReplay(entry, "handler returned incomplete", result.metadata);
          failed++;
        }
      } catch (error) {
        await this.deferReplay(entry, error instanceof Error ? error.message : String(error));
        failed++;
      }
    }

    const degradedFederations = federationManager
      .getAllHealth()
      .filter((fed) => fed.status !== "healthy")
      .map((fed) => fed.federation);

    const report: YunBeRecoveryReport = {
      reportId: uuidv4(),
      startedAt,
      finishedAt: new Date().toISOString(),
      previousState,
      finalState: failed > 0 || blocked > 0 ? "COOLDOWN" : "SLEEPING",
      replayed,
      blocked,
      failed,
      completed,
      degradedFederations,
      summary: `YUN BE replayed=${replayed}, completed=${completed}, blocked=${blocked}, failed=${failed}`,
    };

    await this.storage.saveReport(report);
    try {
      await this.storage.snapshot(`recovery-${report.reportId}`, report);
    } catch (error) {
      logger.warn("[YUN-BE] recovery snapshot failed", { error, reportId: report.reportId });
    }
    await this.notifier.notifyReport(report);
    await YunEvents.health(
      {
        status: report.finalState.toLowerCase(),
        score: completed - failed,
        details: report.summary,
      },
      "yun-be",
    );
    this.lastReport = report;
    await this.transition(report.finalState, "recovery cycle finished", {
      reportId: report.reportId,
    });
    return report;
  }

  private async deferReplay(
    entry: YunBeJournalEntry,
    reason: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    const attempts = entry.attempts + 1;
    const terminal = attempts >= this.policy.maxReplayAttempts;
    await this.storage.markJournal(entry.journalId, {
      status: terminal ? "failed" : "replay_ready",
      attempts,
      lastError: reason,
      nextReplayAt: terminal
        ? undefined
        : new Date(
            Date.now() + nextReplayDelayMs(attempts, this.policy.aggressiveMode),
          ).toISOString(),
      metadata,
    });
  }

  private async transition(
    next: YunBeState,
    reason: string,
    context: Record<string, unknown> = {},
  ): Promise<void> {
    if (this.state === next) return;
    const previous = this.state;
    this.state = next;
    recordGauge("yunbe_state", ["SLEEPING", "ARMED_STANDBY", "AWAKENED", "COOLDOWN"].indexOf(next));
    logger.warn("[YUN-BE] state transition", { previous, next, reason, ...context });
    await this.notifier.notifyStateChange(next, reason, { previous, ...context });
  }
}

export const yunBeAgent = new YunBeAgent();
