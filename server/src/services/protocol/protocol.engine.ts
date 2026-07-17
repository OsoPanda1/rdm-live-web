import { buildGuardianSignal } from "./protocol.monitoring.guardian.js";
import { evaluateConstitution } from "./protocol.constitution.js";
import { toXrDirective } from "./protocol.visual.xr.js";
import type { ProtocolCommand, ProtocolDecisionPath, ProtocolExecutionResult } from "./protocol.types.js";

export function executeProtocolCommand(command: ProtocolCommand): {
  result: ProtocolExecutionResult;
  guardianSignal: ReturnType<typeof buildGuardianSignal>;
} {
  const constitution = evaluateConstitution(command);

  const paths: ProtocolDecisionPath[] = [
    { id: crypto.randomUUID(), label: "conservative", ethicalScore: 0.95, utilityScore: 0.55, selected: false },
    { id: crypto.randomUUID(), label: "balanced", ethicalScore: 0.85, utilityScore: 0.75, selected: false },
    { id: crypto.randomUUID(), label: "exploratory", ethicalScore: 0.65, utilityScore: 0.9, selected: false },
  ];

  const ranked = paths
    .map((path) => ({
      ...path,
      total: path.ethicalScore * 0.7 + path.utilityScore * 0.3,
    }))
    .sort((a, b) => b.total - a.total);

  const selected = ranked[0];
  paths.forEach((path) => {
    path.selected = path.id === selected.id;
  });

  const result: ProtocolExecutionResult = {
    runId: crypto.randomUUID(),
    mode: command.mode,
    state: constitution.allowed ? "running" : "halted",
    constitution,
    decisionPaths: paths,
    xrDirective: toXrDirective({ mode: command.mode, constitution }),
  };

  const guardianSignal = buildGuardianSignal({
    runId: result.runId,
    constitution,
    source: "protocol.engine",
  });

  return { result, guardianSignal };
}
