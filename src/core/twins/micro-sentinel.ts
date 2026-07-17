import { logger } from "@/lib/logger";
import { buildTerritorySecurityTopic } from "./topics";
import type { TwinState } from "./types";

export interface TelemetryPayload { nodeId: string; timestamp: string; lat: number; lng: number; alt: number; signalStrength?: number; packetLossRate?: number; latencyMs?: number; signature: string; certId: string; }
export interface SentinelVerdict { passed: boolean; reasons: { signature: boolean; physics: boolean; policy: boolean; }; }

function validatePhysics(payload: TelemetryPayload): boolean {
  return payload.lat >= -90 && payload.lat <= 90 && payload.lng >= -180 && payload.lng <= 180 && payload.alt >= 0 && payload.alt <= 9000 && (payload.latencyMs === undefined || payload.latencyMs >= 0);
}

function validatePolicy(payload: TelemetryPayload): boolean { return payload.nodeId.startsWith("rdm-"); }

function transformToTwinState(payload: TelemetryPayload): TwinState {
  return { nodeId: payload.nodeId, type: "MeshNode", health: 0.9, adoptionIndex: 0.5, lastSeen: payload.timestamp, status: "HEALTHY", coords: { lat: payload.lat, lng: payload.lng, alt: payload.alt }, telemetry: { packetLossRate: payload.packetLossRate ?? 0, latencyMs: payload.latencyMs ?? 0 } };
}

export class MicroSentinel {
  process(payload: TelemetryPayload): SentinelVerdict {
    const sigOk = payload.signature.length > 0 && payload.certId.length > 0;
    const physicsOk = validatePhysics(payload);
    const policyOk = validatePolicy(payload);
    const verdict: SentinelVerdict = { passed: sigOk && physicsOk && policyOk, reasons: { signature: sigOk, physics: physicsOk, policy: policyOk } };
    if (verdict.passed) {
      logger.info("[SENTINEL] Nodo validado", { nodeId: payload.nodeId });
    } else {
      const alert = { type: "SECURITY_ALERT" as const, nodeId: payload.nodeId, reasons: verdict.reasons, timestamp: payload.timestamp };
      logger.warn("[SENTINEL] Nodo comprometido", { nodeId: payload.nodeId, reasons: verdict.reasons });
    }
    return verdict;
  }
}
