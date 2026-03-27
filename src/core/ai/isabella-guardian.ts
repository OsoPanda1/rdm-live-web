/**
 * RDM Core Service — Isabella Guardian (IA policy engine antifrágil)
 * Evalúa métricas del sistema y decide acciones adaptativas
 */

import type { SystemMetrics } from "../system/modes";

export type IsabellaAction =
  | "reduce_images"
  | "prioritize_text"
  | "limit_requests"
  | "enable_cache_boost"
  | "disable_animations"
  | "degrade_map_quality";

export interface IsabellaGuardianDecision {
  mode: "NORMAL" | "SAFE" | "EMERGENCY";
  actions: IsabellaAction[];
  confidence: number;
  reasoning: string;
}

export function isabellaGuardian(metrics: SystemMetrics): IsabellaGuardianDecision {
  if (metrics.errorRate > 0.1 || metrics.latencyP95 > 2000) {
    return {
      mode: "EMERGENCY",
      actions: ["limit_requests", "prioritize_text", "enable_cache_boost", "disable_animations"],
      confidence: 0.95,
      reasoning: `Error rate ${(metrics.errorRate * 100).toFixed(1)}% o latencia P95 ${metrics.latencyP95.toFixed(0)}ms superan umbrales críticos`,
    };
  }

  if (metrics.cpuLoad > 0.8 || metrics.requestPerSecond > 1000) {
    return {
      mode: "SAFE",
      actions: ["reduce_images", "enable_cache_boost", "degrade_map_quality"],
      confidence: 0.85,
      reasoning: `CPU ${(metrics.cpuLoad * 100).toFixed(0)}% o ${metrics.requestPerSecond.toFixed(0)} req/s indican alta carga`,
    };
  }

  return {
    mode: "NORMAL",
    actions: [],
    confidence: 1.0,
    reasoning: "Todos los indicadores dentro de parámetros nominales",
  };
}
