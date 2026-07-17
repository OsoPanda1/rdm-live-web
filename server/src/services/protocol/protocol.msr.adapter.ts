import { emitMsrEvent } from "../audit.service.js";
import type { ProtocolExecutionResult } from "./protocol.types.js";

export function publishProtocolToMsr(result: ProtocolExecutionResult) {
  emitMsrEvent({
    layer: "L2",
    category: "protocol.execution",
    summary: `Protocol ${result.mode} -> ${result.state}`,
    payload: {
      runId: result.runId,
      allowed: result.constitution.allowed,
      riskLevel: result.constitution.riskLevel,
      selectedPath: result.decisionPaths.find((path) => path.selected)?.label ?? "none",
    },
  });
}
