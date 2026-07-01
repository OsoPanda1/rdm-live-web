// Lightweight analytics façade — no-op unless a real provider is wired.
import { logger } from "@/lib/logger";

export function trackPerfMetric(name: string, value: number, meta?: Record<string, unknown>): void {
  logger.debug(`perf: ${name}`, { value, ...(meta ?? {}) });
}

export function trackEvent(name: string, props?: Record<string, unknown>): void {
  logger.debug(`event: ${name}`, props);
}
