import { ThresholdRule, type ScoreRule } from "@/core/rules/scoring.rule";
import type { ScoreBreakdown } from "@/core/models";

export interface ScoreInput {
  distanceToExit: number;
  stayTimeHours: number;
  inactivityMinutes: number;
  speedMps: number;
}

/**
 * V2 simplificada - Mantenida para compatibilidad con el facade territorial-twin.
 * La implementacion canonica es ScoringEngine en ScoringEngine.ts (V1).
 */
export class ScoringEngine {
  constructor(private rules: ScoreRule[] = defaultRules()) {}

  evaluar(input: ScoreInput): ScoreBreakdown {
    let total = 0;
    const factors: Record<string, number> = {};

    for (const rule of this.rules) {
      const value = rule.evaluate(input);
      if (value <= 0) continue;

      total += value;
      factors[rule.name] = value;
    }

    return { total, factors, confidence: 0 };
  }
}

function defaultRules() {
  return [
    new ThresholdRule("distance", 50, (i) => i.distanceToExit < 150),
    new ThresholdRule("time", 20, (i) => i.stayTimeHours < 3),
    new ThresholdRule("inactive", 20, (i) => i.inactivityMinutes > 30),
    new ThresholdRule("speed", 10, (i) => i.speedMps > 1.2),
  ];
}
