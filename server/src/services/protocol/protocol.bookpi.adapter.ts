import { appendBookpiNarrative } from "../audit.service.js";
import type { ProtocolExecutionResult } from "./protocol.types.js";

export function publishProtocolToBookpi(result: ProtocolExecutionResult) {
  const selectedPath = result.decisionPaths.find((entry) => entry.selected);

  const runId = result.runId ?? "unknown-run";
  const riskLevel = result.constitution?.riskLevel ?? "unknown";
  const xrOverlays = Array.isArray(result.xrDirective?.overlays)
    ? result.xrDirective.overlays.join(", ")
    : "none";
  const threatLevel = result.xrDirective?.threatLevel ?? "unknown";

  appendBookpiNarrative({
    title: `Protocolo ${result.mode} en estado ${result.state}`,
    narrative: [
      `Run: ${runId}`,
      `Riesgo constitucional: ${riskLevel}`,
      `Ruta seleccionada: ${selectedPath?.label ?? "N/A"}`,
      `Overlay XR: ${xrOverlays}`,
    ].join(" | "),
    tags: ["protocol", "bookpi", result.mode, threatLevel],
  });
}
