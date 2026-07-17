import { logger } from "@/lib/logger";
import { buildTerritorySecurityTopic } from "./topics";
import type { TwinState } from "./types";
import type { FederationBus } from "@/federaciones/FederationBus";

export interface TelemetryPayload {
  nodeId: string;
  timestamp: string;
  lat: number;
  lng: number;
  alt: number;
  signalStrength?: number;
  packetLossRate?: number;
  latencyMs?: number;
  signature: string;
  certId: string;
}

export interface SentinelVerdict {
  passed: boolean;
  reasons: {
    signature: boolean;
    physics: boolean;
    policy: boolean;
  };
}

function loadCert(certId: string): string {
  return `cert:${certId}`;
}

function verifySignature(
  payload: TelemetryPayload,
  signature: string,
  cert: string,
): boolean {
  return signature.length > 0 && cert.length > 0;
}

function validatePhysics(payload: TelemetryPayload): boolean {
  const latValid = payload.lat >= -90 && payload.lat <= 90;
  const lngValid = payload.lng >= -180 && payload.lng <= 180;
  const altValid = payload.alt >= 0 && payload.alt <= 9000;
  const latencyValid =
    payload.latencyMs === undefined || payload.latencyMs >= 0;
  return latValid && lngValid && altValid && latencyValid;
}

function validatePolicy(payload: TelemetryPayload): boolean {
  return payload.nodeId.startsWith("rdm-");
}

function transformToTwinState(payload: TelemetryPayload): TwinState {
  return {
    nodeId: payload.nodeId,
    type: "MeshNode",
    health: 0.9,
    adoptionIndex: 0.5,
    lastSeen: payload.timestamp,
    status: "HEALTHY",
    coords: { lat: payload.lat, lng: payload.lng, alt: payload.alt },
    telemetry: {
      packetLossRate: payload.packetLossRate ?? 0,
      latencyMs: payload.latencyMs ?? 0,
    },
  };
}

function isAuthorizedNode(
  nodeId: string,
  territory: string,
): boolean {
  return nodeId.startsWith("rdm-");
}

export class MicroSentinel {
  private bus: FederationBus;

  constructor(bus: FederationBus) {
    this.bus = bus;
  }

  process(payload: TelemetryPayload): SentinelVerdict {
    const cert = loadCert(payload.certId);
    const sigOk = verifySignature(payload, payload.signature, cert);
    const physicsOk = validatePhysics(payload);
    const policyOk = validatePolicy(payload);

    const verdict: SentinelVerdict = {
      passed: sigOk && physicsOk && policyOk,
      reasons: { signature: sigOk, physics: physicsOk, policy: policyOk },
    };

    if (verdict.passed) {
      const stateTopic = `ldtocs/mesh/${payload.nodeId}/state`;
      const twinState = transformToTwinState(payload);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.bus as any).emit(stateTopic, twinState);
      logger.info("[SENTINEL] Nodo validado", { nodeId: payload.nodeId });
    } else {
      const eventTopic = buildTerritorySecurityTopic();
      const alert = {
        type: "SECURITY_ALERT" as const,
        nodeId: payload.nodeId,
        reasons: verdict.reasons,
        timestamp: payload.timestamp,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.bus as any).emit(eventTopic, alert);
      logger.warn("[SENTINEL] Nodo comprometido", {
        nodeId: payload.nodeId,
        reasons: verdict.reasons,
      });
    }

    return verdict;
  }
}
