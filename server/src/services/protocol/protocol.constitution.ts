import type { ProtocolCommand, ProtocolConstitutionCheck } from "./protocol.types.js";

const BLOCKED_PATTERNS = ["coercion", "fear", "surveillance", "harm", "manipulacion"];

export function evaluateConstitution(command: ProtocolCommand): ProtocolConstitutionCheck {
  const loweredContext = command.context.toLowerCase();
  const reasons: string[] = [];

  for (const token of BLOCKED_PATTERNS) {
    if (loweredContext.includes(token)) {
      reasons.push(`blocked_pattern:${token}`);
    }
  }

  if (!loweredContext.includes("transpar")) {
    reasons.push("missing_transparency_signal");
  }

  if (!loweredContext.includes("civil")) {
    reasons.push("missing_civilian_readability_signal");
  }

  const allowed = reasons.every((reason) => !reason.startsWith("blocked_pattern"));
  const riskLevel = !allowed ? "red" : reasons.length > 0 ? "amber" : "green";

  return { allowed, riskLevel, reasons };
}
