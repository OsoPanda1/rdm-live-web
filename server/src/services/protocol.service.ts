import { db } from "../lib/store.js";
import { appendBookpiNarrative, emitMsrEvent } from "./audit.service.js";

export type ProtocolType = "hoyo-negro" | "fenix" | "futuros";

export function startProtocol(input: { protocolType: ProtocolType; context: string }) {
  const id = crypto.randomUUID();
  const run = {
    id,
    protocolType: input.protocolType,
    state: "running" as const,
    ethicalCheck: input.context.toLowerCase().includes("riesgo") ? ("review" as const) : ("pass" as const),
    context: input.context,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.protocolRuns.set(id, run);

  emitMsrEvent({
    layer: "L2",
    category: "protocol.started",
    summary: `Protocolo ${input.protocolType} iniciado`,
    payload: { protocolId: id, ethicalCheck: run.ethicalCheck },
  });

  appendBookpiNarrative({
    title: "Inicio de protocolo controlado",
    narrative: `Se inicia ${input.protocolType} con contexto: ${input.context}.`,
    tags: ["protocol", "governance"],
  });

  return run;
}

export function updateProtocolState(input: { protocolId: string; state: "completed" | "halted" }) {
  const run = db.protocolRuns.get(input.protocolId);
  if (!run) return null;
  run.state = input.state;
  run.updatedAt = new Date().toISOString();
  emitMsrEvent({ layer: "L2", category: "protocol.updated", summary: `Protocolo ${run.protocolType} ${input.state}`, payload: { protocolId: run.id } });
  return run;
}

export function raiseGuardianAlert(input: { source: string; level: "low" | "medium" | "high"; message: string }) {
  const id = crypto.randomUUID();
  const alert = { id, ...input, createdAt: new Date().toISOString() };
  db.guardianAlerts.set(id, alert);
  emitMsrEvent({ layer: "L3", category: "guardian.alert", summary: input.message, payload: { level: input.level } });
  return alert;
}

export function listProtocols() {
  return {
    runs: [...db.protocolRuns.values()],
    alerts: [...db.guardianAlerts.values()],
  };
}
