import type { YunBeHealthSignal, YunBePolicy } from "./types";

const truthy = new Set(["1", "true", "yes", "on"]);

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  return process.env[name];
}

function readBool(name: string, fallback: boolean): boolean {
  const value = readEnv(name);
  if (value === undefined) return fallback;
  return truthy.has(value.toLowerCase());
}

function readNumber(name: string, fallback: number): number {
  const value = readEnv(name);
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function resolveYunBePolicy(): YunBePolicy {
  const retriesPolicy =
    readEnv("GROWTHBOOK_YUNBE_RETRIES_POLICY") ?? readEnv("YUNBE_RETRIES_POLICY");
  return {
    enabled: readBool("GROWTHBOOK_YUNBE_ENABLED", readBool("YUNBE_ENABLED", true)),
    eoctThreshold: readNumber(
      "GROWTHBOOK_YUNBE_EOCT_THRESHOLD",
      readNumber("YUNBE_EOCT_THRESHOLD", 0.72),
    ),
    aggressiveMode: retriesPolicy === "aggressive" || readBool("YUNBE_AGGRESSIVE_MODE", false),
    maxReplayAttempts: readNumber("YUNBE_MAX_REPLAY_ATTEMPTS", 5),
    armedRiskScore: readNumber("YUNBE_ARMED_RISK_SCORE", 0.45),
    awakenedRiskScore: readNumber("YUNBE_AWAKENED_RISK_SCORE", 0.7),
    journalGranularity:
      (readEnv("GROWTHBOOK_YUNBE_JOURNAL_GRANULARITY") as "coarse" | "fine" | undefined) ?? "fine",
  };
}

export function scoreHealthSignals(signals: YunBeHealthSignal[]): number {
  if (signals.length === 0) return 0;
  const total = signals.reduce((sum, signal) => {
    const availabilityRisk = signal.ok ? 0 : 0.65;
    const latencyRisk = signal.latencyMs ? Math.min(signal.latencyMs / 10_000, 0.25) : 0;
    const errorRisk = signal.errorRate ? Math.min(signal.errorRate, 1) * 0.5 : 0;
    return sum + Math.min(1, availabilityRisk + latencyRisk + errorRisk);
  }, 0);
  return total / signals.length;
}
