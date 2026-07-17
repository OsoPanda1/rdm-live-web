/**
 * INFRA METRICS — Re-export from core Prometheus (single source of truth).
 *
 * This file exists ONLY for backward compatibility with existing imports.
 * All metric definitions live in src/core/metrics/prometheus.ts.
 *
 * DO NOT add new metrics here. Add them to src/core/metrics/prometheus.ts
 * and re-export from this file if needed.
 */

export {
  Counter,
  Gauge,
  Histogram,
  Registry,
  register,
  isabellaTerritorialDecisionLatencyMs,
  decisionScore,
  reviews,
  consentEvents,
  reviewsScore,
  streamConnections,
  isabellaGeoLruSize,
  isabellaGeoLruCapacity,
  isabellaMovementFilterAlpha,
  eventsDroppedTotal,
  decisionLatency,
} from "@/core/metrics/prometheus";
