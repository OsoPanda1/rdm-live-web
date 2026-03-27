/**
 * RDM Core Service — Sistema de modos adaptativos antifrágil
 * Modos: NORMAL | SAFE | EMERGENCY
 */

export type SystemMode = "NORMAL" | "SAFE" | "EMERGENCY";

export interface SystemMetrics {
  cpuLoad: number;
  errorRate: number;
  latencyP95: number;
  requestPerSecond: number;
}

export function decideMode(m: SystemMetrics): SystemMode {
  if (m.errorRate > 0.1 || m.latencyP95 > 2000) return "EMERGENCY";
  if (m.cpuLoad > 0.8 || m.requestPerSecond > 1000) return "SAFE";
  return "NORMAL";
}
