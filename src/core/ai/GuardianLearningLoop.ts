import { logger } from "@/lib/logger";
import type { SystemMetrics } from "@/core/system/modes";
import type { IsabellaGuardianDecision } from "@/core/ai/isabella-guardian";

interface FeedbackSample {
  metrics: SystemMetrics;
  decision: IsabellaGuardianDecision;
  outcome: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  userFeedback?: number;
  timestamp: Date;
}

interface LearnedPattern {
  condition: string;
  action: string;
  confidence: number;
  occurrences: number;
}

export class GuardianLearningLoop {
  private feedbackHistory: FeedbackSample[] = [];
  private patterns: LearnedPattern[] = [];
  private readonly maxHistory = 500;
  private readonly learningRate = 0.1;

  recordOutcome(metrics: SystemMetrics, decision: IsabellaGuardianDecision, outcome: FeedbackSample["outcome"]): void {
    const sample: FeedbackSample = {
      metrics,
      decision,
      outcome,
      timestamp: new Date(),
    };

    this.feedbackHistory.push(sample);
    if (this.feedbackHistory.length > this.maxHistory) {
      this.feedbackHistory.shift();
    }

    this.learn(sample);
  }

  getAdaptedThreshold(baseThreshold: number): number {
    const recent = this.feedbackHistory.slice(-50);
    const negativeOutcomes = recent.filter(r => r.outcome === "NEGATIVE").length;
    const total = recent.length || 1;
    const failureRate = negativeOutcomes / total;

    if (failureRate > 0.3) {
      return baseThreshold * 1.2;
    }
    if (failureRate < 0.05) {
      return baseThreshold * 0.9;
    }
    return baseThreshold;
  }

  getPatterns(): LearnedPattern[] {
    return [...this.patterns];
  }

  getStats(): { totalSamples: number; patternsLearned: number; positiveRate: number; negativeRate: number } {
    const total = this.feedbackHistory.length || 1;
    const positive = this.feedbackHistory.filter(f => f.outcome === "POSITIVE").length;
    const negative = this.feedbackHistory.filter(f => f.outcome === "NEGATIVE").length;
    return {
      totalSamples: this.feedbackHistory.length,
      patternsLearned: this.patterns.length,
      positiveRate: positive / total,
      negativeRate: negative / total,
    };
  }

  private learn(sample: FeedbackSample): void {
    const condition = this.extractCondition(sample.metrics);
    const action = sample.decision.actions.join(",");

    const existing = this.patterns.find(p => p.condition === condition && p.action === action);
    if (existing) {
      if (sample.outcome === "POSITIVE") {
        existing.confidence = Math.min(1, existing.confidence + this.learningRate);
      } else if (sample.outcome === "NEGATIVE") {
        existing.confidence = Math.max(0, existing.confidence - this.learningRate);
      }
      existing.occurrences++;
    } else {
      this.patterns.push({
        condition,
        action,
        confidence: sample.outcome === "POSITIVE" ? 0.6 : 0.3,
        occurrences: 1,
      });
    }

    if (this.patterns.length > 100) {
      this.patterns = this.patterns
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 100);
    }

    logger.debug("[GUARDIAN_LEARN] Patrón registrado", {
      condition,
      action,
      outcome: sample.outcome,
    });
  }

  private extractCondition(metrics: SystemMetrics): string {
    if (metrics.errorRate > 0.1 || metrics.latencyP95 > 2000) return "CRITICAL";
    if (metrics.cpuLoad > 0.8 || metrics.requestPerSecond > 1000) return "HIGH_LOAD";
    if (metrics.cpuLoad > 0.5) return "MODERATE_LOAD";
    return "NORMAL";
  }
}

export const guardianLearningLoop = new GuardianLearningLoop();
