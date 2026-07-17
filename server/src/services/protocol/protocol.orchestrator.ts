import { db } from "../../lib/store.js";
import { publishProtocolToBookpi } from "./protocol.bookpi.adapter.js";
import { protocolCommandSchema } from "./protocol.command.js";
import { executeProtocolCommand } from "./protocol.engine.js";
import { transitionState } from "./protocol.lifecycle.js";
import { publishProtocolToMsr } from "./protocol.msr.adapter.js";

export function runProtocolOrchestration(rawInput: unknown) {
  const parsed = protocolCommandSchema.safeParse(rawInput);
  if (!parsed.success) {
    const fields = parsed.error.issues
      .map((issue) => issue.path.join(".") || "(root)")
      .join(",");
    throw new Error(`INVALID_PROTOCOL_COMMAND:${fields}`);
  }

  const { result, guardianSignal } = executeProtocolCommand(parsed.data);

  const now = new Date().toISOString();
  const existing = db.protocolRuns.get(result.runId);

  const finalState = existing
    ? transitionState(
        existing.state,
        result.state === "running" ? "completed" : "halted",
      )
    : result.state;

  db.protocolRuns.set(result.runId, {
    id: result.runId,
    protocolType: result.mode,
    state: finalState,
    ethicalCheck: result.constitution.allowed ? "pass" : "review",
    context: parsed.data.context,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });

  if (guardianSignal) {
    db.guardianAlerts.set(guardianSignal.id, {
      id: guardianSignal.id,
      level: guardianSignal.severity,
      source: guardianSignal.source,
      message: guardianSignal.summary,
      createdAt: guardianSignal.createdAt ?? now,
    });
  }

  publishProtocolToMsr(result);
  publishProtocolToBookpi(result);

  return { result, guardianSignal };
}
