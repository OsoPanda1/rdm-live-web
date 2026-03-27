/**
 * RDM Core Service — Controlador central de modo antifrágil
 * Integra reglas determinísticas + IA Isabella Guardian
 */

import { SystemMode, SystemMetrics, decideMode } from "./modes";
import { isabellaGuardian } from "../ai/isabella-guardian";
import { auditEvent } from "../audit/logger";

let currentMode: SystemMode = "NORMAL";
const modeListeners: Array<(mode: SystemMode, metrics: SystemMetrics) => void> = [];

export function updateSystemMode(metrics: SystemMetrics) {
  const aiDecision = isabellaGuardian(metrics);
  const ruleDecision = decideMode(metrics);

  const newMode: SystemMode =
    aiDecision.mode === "EMERGENCY" ? "EMERGENCY" : ruleDecision;

  if (newMode !== currentMode) {
    auditEvent(
      "SYSTEM_MODE_CHANGE",
      { from: currentMode, to: newMode, metrics, aiDecision },
      "system"
    );
    currentMode = newMode;
    modeListeners.forEach(fn => fn(currentMode, metrics));
  }

  return { currentMode, aiDecision };
}

export function getSystemMode(): SystemMode {
  return currentMode;
}

export function onModeChange(fn: (mode: SystemMode, metrics: SystemMetrics) => void): () => void {
  modeListeners.push(fn);
  return () => {
    const idx = modeListeners.indexOf(fn);
    if (idx >= 0) modeListeners.splice(idx, 1);
  };
}
