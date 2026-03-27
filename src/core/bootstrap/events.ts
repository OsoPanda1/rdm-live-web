/**
 * RDM Core Service — Bootstrap de eventos del sistema
 * Conecta el bus de eventos con el controlador de modos
 */

import { subscribe, publish } from "../events/bus";
import { updateSystemMode } from "../system/controller";
import type { SystemMetrics } from "../system/modes";
import { auditEvent } from "../audit/logger";

let initialized = false;

export function bootstrapCoreEvents() {
  if (initialized) return;
  initialized = true;

  subscribe("rdm.system.overload.v1", event => {
    const metrics = event.payload as { metrics: SystemMetrics };
    const result = updateSystemMode(metrics.metrics);

    auditEvent(
      "SYSTEM_OVERLOAD_HANDLED",
      { metrics: metrics.metrics, newMode: result.currentMode, aiDecision: result.aiDecision },
      "system"
    );

    publish({
      name: "rdm.system.mode-changed.v1",
      payload: {
        mode: result.currentMode,
        aiDecision: result.aiDecision,
      },
      timestamp: new Date().toISOString(),
    });
  });
}
