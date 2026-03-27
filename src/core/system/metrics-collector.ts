/**
 * RDM Core Service — Recolector de métricas internas del sistema
 */

import type { SystemMetrics } from "./modes";

let requestCount = 0;
let errorCount = 0;
let latencySamples: number[] = [];

export function trackRequest() {
  requestCount += 1;
}

export function trackError() {
  errorCount += 1;
}

export function trackLatency(ms: number) {
  latencySamples.push(ms);
  if (latencySamples.length > 200) latencySamples = latencySamples.slice(-100);
}

function percentile95(samples: number[]): number {
  if (samples.length === 0) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.95);
  return sorted[Math.min(idx, sorted.length - 1)];
}

export function collectSystemMetrics(): SystemMetrics {
  const cpuLoad = Math.min(1, requestCount / 5000); // proxy
  const errorRate = requestCount === 0 ? 0 : errorCount / requestCount;
  const latencyP95 = percentile95(latencySamples) || 250;
  const requestPerSecond = requestCount / 60;

  return { cpuLoad, errorRate, latencyP95, requestPerSecond };
}

export function resetMetrics() {
  requestCount = 0;
  errorCount = 0;
  latencySamples = [];
}
