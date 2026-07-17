import { neon } from "@neondatabase/serverless";
import { logger } from "@/lib/logger";
import type {
  YunBeEvent,
  YunBeJournalEntry,
  YunBeJournalStatus,
  YunBeNotifier,
  YunBeRecoveryReport,
  YunBeState,
  YunBeStorageAdapter,
} from "./types";

const memoryEvents: YunBeEvent[] = [];
const memoryJournal = new Map<string, YunBeJournalEntry>();
const memoryReports: YunBeRecoveryReport[] = [];

function env(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[name];
}

function serialize(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export class InMemoryYunBeStorage implements YunBeStorageAdapter {
  async appendEvent(event: YunBeEvent): Promise<void> {
    memoryEvents.push(event);
  }

  async upsertJournal(entry: YunBeJournalEntry): Promise<void> {
    memoryJournal.set(entry.journalId, entry);
  }

  async listReplayable(now: Date, limit: number): Promise<YunBeJournalEntry[]> {
    return Array.from(memoryJournal.values())
      .filter((entry) => {
        const statusReady = entry.status === "pending" || entry.status === "replay_ready";
        const due = !entry.nextReplayAt || new Date(entry.nextReplayAt).getTime() <= now.getTime();
        return statusReady && due;
      })
      .slice(0, limit);
  }

  async markJournal(journalId: string, patch: Partial<YunBeJournalEntry>): Promise<void> {
    const current = memoryJournal.get(journalId);
    if (!current) return;
    memoryJournal.set(journalId, {
      ...current,
      ...patch,
      metadata: { ...current.metadata, ...patch.metadata },
    });
  }

  async saveReport(report: YunBeRecoveryReport): Promise<void> {
    memoryReports.push(report);
  }

  async snapshot(key: string, payload: unknown): Promise<void> {
    memoryJournal.set(`snapshot:${key}`, {
      journalId: `snapshot:${key}`,
      eventId: `snapshot:${key}`,
      sourceSystem: "vercel-storage-fallback",
      payload,
      timestamp: new Date().toISOString(),
      riskClass: "low",
      idempotencyKey: `snapshot:${key}`,
      operationType: "storage_snapshot",
      status: "completed",
      attempts: 0,
      metadata: { snapshot: true },
    });
  }
}

export class NeonYunBeStorage implements YunBeStorageAdapter {
  private readonly sql;
  private readonly fallback = new InMemoryYunBeStorage();

  constructor(private readonly connectionString: string) {
    this.sql = neon(connectionString);
  }

  async appendEvent(event: YunBeEvent): Promise<void> {
    try {
      await this.sql`
        insert into yunbe_events (event_id, user_id, source_system, payload, risk_class, yun_event_type, federation, idempotency_key, created_at)
        values (${event.eventId}, ${event.userId ?? null}, ${event.sourceSystem}, ${serialize(event.payload)}::jsonb, ${event.riskClass}, ${event.yunEventType ?? null}, ${event.federation ?? null}, ${event.idempotencyKey}, ${event.timestamp}::timestamptz)
        on conflict (event_id) do nothing
      `;
    } catch (error) {
      logger.warn("[YUN-BE] Neon appendEvent failed; using memory fallback", { error });
      await this.fallback.appendEvent(event);
    }
  }

  async upsertJournal(entry: YunBeJournalEntry): Promise<void> {
    try {
      await this.sql`
        insert into yunbe_journal (
          journal_id, event_id, user_id, source_system, operation_type, payload, risk_class, status,
          attempts, next_replay_at, completed_at, last_error, eoct_score, idempotency_key, metadata, created_at, updated_at
        ) values (
          ${entry.journalId}, ${entry.eventId}, ${entry.userId ?? null}, ${entry.sourceSystem}, ${entry.operationType},
          ${serialize(entry.payload)}::jsonb, ${entry.riskClass}, ${entry.status}, ${entry.attempts},
          ${entry.nextReplayAt ?? null}::timestamptz, ${entry.completedAt ?? null}::timestamptz, ${entry.lastError ?? null},
          ${entry.eoctScore ?? null}, ${entry.idempotencyKey}, ${serialize(entry.metadata)}::jsonb, ${entry.timestamp}::timestamptz, now()
        )
        on conflict (journal_id) do update set
          status = excluded.status,
          attempts = excluded.attempts,
          next_replay_at = excluded.next_replay_at,
          completed_at = excluded.completed_at,
          last_error = excluded.last_error,
          eoct_score = excluded.eoct_score,
          metadata = excluded.metadata,
          updated_at = now()
      `;
    } catch (error) {
      logger.warn("[YUN-BE] Neon upsertJournal failed; using memory fallback", { error });
      await this.fallback.upsertJournal(entry);
    }
  }

  async listReplayable(now: Date, limit: number): Promise<YunBeJournalEntry[]> {
    try {
      const rows = await this.sql`
        select * from yunbe_journal
        where status in ('pending', 'replay_ready')
          and (next_replay_at is null or next_replay_at <= ${now.toISOString()}::timestamptz)
        order by created_at asc
        limit ${limit}
      `;
      return rows.map((row) => ({
        journalId: row.journal_id,
        eventId: row.event_id,
        userId: row.user_id ?? undefined,
        sourceSystem: row.source_system,
        operationType: row.operation_type,
        payload: row.payload,
        timestamp: new Date(row.created_at).toISOString(),
        riskClass: row.risk_class,
        status: row.status,
        attempts: row.attempts,
        nextReplayAt: row.next_replay_at ? new Date(row.next_replay_at).toISOString() : undefined,
        completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
        lastError: row.last_error ?? undefined,
        eoctScore: row.eoct_score ?? undefined,
        idempotencyKey: row.idempotency_key,
        metadata: row.metadata ?? {},
      }));
    } catch (error) {
      logger.warn("[YUN-BE] Neon listReplayable failed; using memory fallback", { error });
      return this.fallback.listReplayable(now, limit);
    }
  }

  async markJournal(journalId: string, patch: Partial<YunBeJournalEntry>): Promise<void> {
    const status = patch.status as YunBeJournalStatus | undefined;
    try {
      await this.sql`
        update yunbe_journal set
          status = coalesce(${status ?? null}, status),
          attempts = coalesce(${patch.attempts ?? null}, attempts),
          next_replay_at = ${patch.nextReplayAt ?? null}::timestamptz,
          completed_at = coalesce(${patch.completedAt ?? null}::timestamptz, completed_at),
          last_error = ${patch.lastError ?? null},
          eoct_score = coalesce(${patch.eoctScore ?? null}, eoct_score),
          metadata = metadata || ${serialize(patch.metadata ?? {})}::jsonb,
          updated_at = now()
        where journal_id = ${journalId}
      `;
    } catch (error) {
      logger.warn("[YUN-BE] Neon markJournal failed; using memory fallback", { error });
      await this.fallback.markJournal(journalId, patch);
    }
  }

  async saveReport(report: YunBeRecoveryReport): Promise<void> {
    try {
      await this.sql`
        insert into yunbe_recovery_reports (report_id, started_at, finished_at, previous_state, final_state, replayed, blocked, failed, completed, degraded_federations, summary)
        values (${report.reportId}, ${report.startedAt}::timestamptz, ${report.finishedAt}::timestamptz, ${report.previousState}, ${report.finalState}, ${report.replayed}, ${report.blocked}, ${report.failed}, ${report.completed}, ${serialize(report.degradedFederations)}::jsonb, ${report.summary})
        on conflict (report_id) do nothing
      `;
    } catch (error) {
      logger.warn("[YUN-BE] Neon saveReport failed; using memory fallback", { error });
      await this.fallback.saveReport(report);
    }
  }

  async snapshot(key: string, payload: unknown): Promise<void> {
    await snapshotToVercelStorage(key, payload);
  }
}

async function snapshotToVercelStorage(key: string, payload: unknown): Promise<void> {
  const blobToken = env("BLOB_READ_WRITE_TOKEN");
  const kvUrl = env("KV_REST_API_URL");
  const kvToken = env("KV_REST_API_TOKEN");

  if (kvUrl && kvToken) {
    await fetch(`${kvUrl}/set/${encodeURIComponent(`yunbe:${key}`)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" },
      body: serialize(payload),
    });
    return;
  }

  if (blobToken) {
    await fetch(`https://blob.vercel-storage.com/${encodeURIComponent(`yunbe/${key}.json`)}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${blobToken}`, "Content-Type": "application/json" },
      body: serialize(payload),
    });
  }
}

export class SlackYunBeNotifier implements YunBeNotifier {
  constructor(private readonly webhookUrl = env("SLACK_WEBHOOK_URL")) {}

  async notifyStateChange(
    state: YunBeState,
    reason: string,
    context: Record<string, unknown> = {},
  ): Promise<void> {
    await this.post(`YUN BE → ${state}: ${reason}`, context);
  }

  async notifyIncident(message: string, context: Record<string, unknown> = {}): Promise<void> {
    await this.post(`YUN BE incident: ${message}`, context);
  }

  async notifyReport(report: YunBeRecoveryReport): Promise<void> {
    await this.post(
      `YUN BE recovery report: ${report.summary}`,
      report as unknown as Record<string, unknown>,
    );
  }

  private async post(text: string, context: Record<string, unknown>): Promise<void> {
    logger.info("[YUN-BE] notification", { text, ...context });
    if (!this.webhookUrl) return;
    try {
      await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: serialize({ text, blocks: [{ type: "section", text: { type: "mrkdwn", text } }] }),
      });
    } catch (error) {
      logger.warn("[YUN-BE] Slack notification failed", { error });
    }
  }
}

export function createDefaultYunBeStorage(): YunBeStorageAdapter {
  const connection = env("DATABASE_URL") ?? env("POSTGRES_URL") ?? env("NEON_DATABASE_URL");
  return connection ? new NeonYunBeStorage(connection) : new InMemoryYunBeStorage();
}
