import type { ProtocolConstitutionCheck, ProtocolSignal } from "./protocol.types.js";

export function buildGuardianSignal(input: {
  runId: string;
  constitution: ProtocolConstitutionCheck;
  source: string;
}): ProtocolSignal {
  const severity =
    input.constitution.riskLevel === "red"
      ? "high"
      : input.constitution.riskLevel === "amber"
        ? "medium"
        : "low";

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source: input.source,
    severity,
    summary: `Guardian risk=${input.constitution.riskLevel} run=${input.runId}`,
    metadata: {
      runId: input.runId,
      reasons: input.constitution.reasons.join(";"),
    },
  };
}
