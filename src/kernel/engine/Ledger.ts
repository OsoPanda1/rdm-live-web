import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";
import type { LedgerEntry, MDX5Decision, FederationId } from "@/core/models";

class Ledger {
  private entries: LedgerEntry[] = [];
  private readonly maxEntries = 10000;

  record(
    action: string,
    intentId: string,
    federation: FederationId,
    decision: MDX5Decision,
  ): LedgerEntry {
    const prevHash = this.entries.length > 0 ? this.entries[this.entries.length - 1].hash : "GENESIS";

    const entry: LedgerEntry = {
      id: uuidv4(),
      action,
      intentId,
      federation,
      decision,
      timestamp: new Date(),
      traceId: decision.traceId,
      hash: "",
      prevHash,
    };

    entry.hash = this.computeHash(entry);

    if (this.entries.length >= this.maxEntries) {
      this.entries.shift();
    }

    this.entries.push(entry);

    logger.info("[LEDGER] Entrada registrada", {
      id: entry.id,
      action,
      intentId,
      federation,
      verdict: decision.timeupVerdict,
    });

    return entry;
  }

  getByIntentId(intentId: string): LedgerEntry[] {
    return this.entries.filter(e => e.intentId === intentId);
  }

  getByFederation(federation: FederationId): LedgerEntry[] {
    return this.entries.filter(e => e.federation === federation);
  }

  getByTraceId(traceId: string): LedgerEntry[] {
    return this.entries.filter(e => e.traceId === traceId);
  }

  getAll(): LedgerEntry[] {
    return [...this.entries];
  }

  private computeHash(entry: { id: string; action: string; intentId: string; federation: FederationId; timestamp: Date; traceId: string; prevHash: string }): string {
    const data = `${entry.id}:${entry.action}:${entry.intentId}:${entry.federation}:${entry.timestamp.toISOString()}:${entry.traceId}:${entry.prevHash}`;
    return createHash("sha256").update(data).digest("hex");
  }

  verifyChain(): boolean {
    for (let i = 1; i < this.entries.length; i++) {
      const prev = this.entries[i - 1];
      const curr = this.entries[i];
      if (curr.prevHash !== prev.hash) {
        logger.error("[LEDGER] Cadena corrupta en entrada", { id: curr.id, expected: prev.hash, got: curr.prevHash });
        return false;
      }
    }
    return true;
  }
}

export const ledger = new Ledger();
