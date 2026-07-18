import type { MotionType, ConnectionType, ThreatLevel } from "../types"

export interface SamplingProfile {
  name: string
  activationBounds: string
  stationary: SamplingConfig
  activeMovement: SamplingConfig
}

export interface SamplingConfig {
  updateIntervalMs: number
  distanceFilterMeters: number
  desiredAccuracy: string
  batchUpload?: {
    enabled: boolean
    maxSize: number
    flushIntervalMs: number
  }
  motionDetectionSource?: string
}

export const MOBILITY_PROFILES: Record<string, SamplingProfile> = {
  smart_tourism_twin: {
    name: "smart_tourism_twin",
    activationBounds: "MX-HGO-RDM-CENTRO",
    stationary: {
      updateIntervalMs: 600000,
      distanceFilterMeters: 25,
      desiredAccuracy: "approximate_city_block",
      motionDetectionSource: "accelerometer",
    },
    activeMovement: {
      updateIntervalMs: 15000,
      distanceFilterMeters: 3,
      desiredAccuracy: "high_precision_gps",
      batchUpload: {
        enabled: true,
        maxSize: 10,
        flushIntervalMs: 180000,
      },
    },
  },
  critical_infrastructure_and_security_twin: {
    name: "critical_infrastructure_and_security_twin",
    activationBounds: "MX-HGO-RDM-MINAS",
    stationary: {
      updateIntervalMs: 30000,
      distanceFilterMeters: 2,
      desiredAccuracy: "high_precision",
    },
    activeMovement: {
      updateIntervalMs: 2000,
      distanceFilterMeters: 1,
      desiredAccuracy: "cm_rtk_assisted",
      batchUpload: {
        enabled: false,
        maxSize: 0,
        flushIntervalMs: 0,
      },
    },
  },
  local_merchant_node: {
    name: "local_merchant_node",
    activationBounds: "MX-HGO-RDM-CORREDOR-TURISTICO",
    stationary: {
      updateIntervalMs: 3600000,
      distanceFilterMeters: 100,
      desiredAccuracy: "approximate_neighborhood",
    },
    activeMovement: {
      updateIntervalMs: 60000,
      distanceFilterMeters: 10,
      desiredAccuracy: "high_precision",
    },
  },
}

export function getProfileForTwin(
  twinType: string,
  threatLevel: ThreatLevel,
  connectionType: ConnectionType,
): SamplingProfile {
  if (threatLevel === "high" || threatLevel === "critical") {
    return MOBILITY_PROFILES.critical_infrastructure_and_security_twin
  }

  if (twinType.includes("merchant") || twinType.includes("commerce")) {
    return MOBILITY_PROFILES.local_merchant_node
  }

  return MOBILITY_PROFILES.smart_tourism_twin
}
