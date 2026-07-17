import type { YunBeJournalEntry } from "./types";

const CRITICAL_OPERATION_WEIGHT: Record<string, number> = {
  stripe_cattleya_payment: 0.18,
  gateway_message: 0.08,
  federation_command: 0.12,
  agent_decision: 0.16,
  storage_snapshot: 0.04,
  kernel_signal: 0.14,
};

export function calculateEoctScore(entry: YunBeJournalEntry): number {
  const riskPenalty = entry.riskClass === "critical" ? 0.08 : entry.riskClass === "high" ? 0.04 : 0;
  const retryPenalty = Math.min(entry.attempts * 0.05, 0.2);
  const operationBonus = CRITICAL_OPERATION_WEIGHT[entry.operationType] ?? 0.05;
  const explicitConsent = entry.metadata.consent === true ? 0.08 : 0;
  const userProtection = entry.metadata.protectsUser === true ? 0.12 : 0;
  const financialSafety = entry.operationType === "stripe_cattleya_payment" ? 0.08 : 0;

  return Math.max(
    0,
    Math.min(
      1,
      0.72 +
        operationBonus +
        explicitConsent +
        userProtection +
        financialSafety -
        riskPenalty -
        retryPenalty,
    ),
  );
}

export function explainEoctBlock(
  entry: YunBeJournalEntry,
  score: number,
  threshold: number,
): string {
  return `EOCT ${score.toFixed(2)} below threshold ${threshold.toFixed(2)} for ${entry.operationType}/${entry.journalId}`;
}
