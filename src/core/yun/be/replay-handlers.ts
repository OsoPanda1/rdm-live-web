import type { YunBeJournalEntry, YunBeReplayHandler } from "./types";

export class HttpReplayHandler implements YunBeReplayHandler {
  canHandle(entry: YunBeJournalEntry): boolean {
    return typeof entry.metadata.replayUrl === "string";
  }

  async replay(
    entry: YunBeJournalEntry,
  ): Promise<{ completed: boolean; metadata?: Record<string, unknown> }> {
    const response = await fetch(String(entry.metadata.replayUrl), {
      method: String(entry.metadata.replayMethod ?? "POST"),
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": entry.idempotencyKey,
        ...(entry.metadata.replayHeaders as Record<string, string> | undefined),
      },
      body: JSON.stringify({ journalId: entry.journalId, payload: entry.payload }),
    });

    return {
      completed: response.ok,
      metadata: { status: response.status, statusText: response.statusText },
    };
  }
}

export class StripeCattleyaReplayHandler implements YunBeReplayHandler {
  canHandle(entry: YunBeJournalEntry): boolean {
    return entry.operationType === "stripe_cattleya_payment";
  }

  async replay(
    entry: YunBeJournalEntry,
  ): Promise<{ completed: boolean; metadata?: Record<string, unknown> }> {
    const reconcileUrl =
      entry.metadata.stripeReconcileUrl ?? process.env.YUNBE_STRIPE_RECONCILE_URL;
    if (!reconcileUrl) {
      return { completed: false, metadata: { reason: "missing_stripe_reconcile_url" } };
    }

    const response = await fetch(String(reconcileUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": entry.idempotencyKey,
        Authorization: process.env.YUNBE_INTERNAL_TOKEN
          ? `Bearer ${process.env.YUNBE_INTERNAL_TOKEN}`
          : "",
      },
      body: JSON.stringify({ journalId: entry.journalId, payload: entry.payload }),
    });

    return {
      completed: response.ok,
      metadata: { status: response.status, reconciler: "stripe-cattleya" },
    };
  }
}

export class FederationReplayHandler implements YunBeReplayHandler {
  canHandle(entry: YunBeJournalEntry): boolean {
    return (
      entry.operationType === "federation_command" &&
      typeof entry.metadata.federationEndpoint === "string"
    );
  }

  async replay(
    entry: YunBeJournalEntry,
  ): Promise<{ completed: boolean; metadata?: Record<string, unknown> }> {
    const response = await fetch(String(entry.metadata.federationEndpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": entry.idempotencyKey,
      },
      body: JSON.stringify({ federation: entry.federation, command: entry.payload }),
    });

    return {
      completed: response.ok,
      metadata: { status: response.status, federation: entry.federation },
    };
  }
}

export function createDefaultReplayHandlers(): YunBeReplayHandler[] {
  return [
    new StripeCattleyaReplayHandler(),
    new FederationReplayHandler(),
    new HttpReplayHandler(),
  ];
}
