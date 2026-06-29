import type { ProtocolConstitutionCheck } from "./protocol.types.js";

export function toXrDirective(input: {
  mode: "hoyo-negro" | "fenix" | "futuros";
  constitution: ProtocolConstitutionCheck;
}): {
  profile: "heritage" | "festival" | "nature";
  threatLevel: "low" | "medium" | "high";
  overlays: string[];
} {
  const threatLevel: "low" | "medium" | "high" =
    input.constitution.riskLevel === "red"
      ? "high"
      : input.constitution.riskLevel === "amber"
        ? "medium"
        : "low";

  const profile: "heritage" | "festival" | "nature" =
    input.mode === "fenix" ? "festival" : input.mode === "futuros" ? "nature" : "heritage";

  return {
    profile,
    threatLevel,
    overlays: [
      `protocol:${input.mode}`,
      `risk:${input.constitution.riskLevel}`,
      threatLevel === "high" ? "guardian-shield" : "civil-view",
    ],
  };
}
