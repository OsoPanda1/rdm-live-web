export const NATS_PREFIX = "rdm.sce"

export const NATS_TOPICS = {
  F1_CORE_NETWORK_IP_RESOLVED: `${NATS_PREFIX}.f1.core.network.ip_resolved`,
  F1_CORE_NETWORK_NODE_STATUS: `${NATS_PREFIX}.f1.core.network.node_status`,
  F2_IDENTITY_CONSENT: `${NATS_PREFIX}.f2.identity.consent`,
  F2_IDENTITY_ACCESS: `${NATS_PREFIX}.f2.identity.access`,
  F3_TOURISM_TELEMETRY_RAW: `${NATS_PREFIX}.f3.tourism.telemetry.raw`,
  F3_TOURISM_HEATMAP: `${NATS_PREFIX}.f3.tourism.heatmap`,
  F4_COMMERCE_TRACE: `${NATS_PREFIX}.f4.commerce.trace`,
  F4_COMMERCE_LOGISTICS: `${NATS_PREFIX}.f4.commerce.logistics`,
  F5_CIVIL_PROTECTION_SPATIAL_TWIN_UPDATED: `${NATS_PREFIX}.f5.civil_protection.spatial.twin_updated`,
  F5_CIVIL_PROTECTION_ALERTS_GEOFENCE_VIOLATION: `${NATS_PREFIX}.f5.civil_protection.alerts.geofence_violation`,
  F6_OSINT_THREAT_VECTOR: `${NATS_PREFIX}.f6.osint.threat_vector`,
  F6_OSINT_IP_MAPPING: `${NATS_PREFIX}.f6.osint.ip_mapping`,
  F7_RESEARCH_SYNTHETIC_DATA: `${NATS_PREFIX}.f7.research.synthetic_data`,

  SYSTEM_HEALTH: `${NATS_PREFIX}.system.health`,
  SYSTEM_SYNC_YUN: `${NATS_PREFIX}.system.sync.yun`,
  SYSTEM_DEGRADATION: `${NATS_PREFIX}.system.degradation`,
  SYSTEM_RECOVERY: `${NATS_PREFIX}.system.recovery`,
} as const

export type NatsTopic = (typeof NATS_TOPICS)[keyof typeof NATS_TOPICS]

export const TOPIC_FEDERATION_MAP: Record<NatsTopic, number> = {
  [NATS_TOPICS.F1_CORE_NETWORK_IP_RESOLVED]: 1,
  [NATS_TOPICS.F1_CORE_NETWORK_NODE_STATUS]: 1,
  [NATS_TOPICS.F2_IDENTITY_CONSENT]: 2,
  [NATS_TOPICS.F2_IDENTITY_ACCESS]: 2,
  [NATS_TOPICS.F3_TOURISM_TELEMETRY_RAW]: 3,
  [NATS_TOPICS.F3_TOURISM_HEATMAP]: 3,
  [NATS_TOPICS.F4_COMMERCE_TRACE]: 4,
  [NATS_TOPICS.F4_COMMERCE_LOGISTICS]: 4,
  [NATS_TOPICS.F5_CIVIL_PROTECTION_SPATIAL_TWIN_UPDATED]: 5,
  [NATS_TOPICS.F5_CIVIL_PROTECTION_ALERTS_GEOFENCE_VIOLATION]: 5,
  [NATS_TOPICS.F6_OSINT_THREAT_VECTOR]: 6,
  [NATS_TOPICS.F6_OSINT_IP_MAPPING]: 6,
  [NATS_TOPICS.F7_RESEARCH_SYNTHETIC_DATA]: 7,
  [NATS_TOPICS.SYSTEM_HEALTH]: 1,
  [NATS_TOPICS.SYSTEM_SYNC_YUN]: 1,
  [NATS_TOPICS.SYSTEM_DEGRADATION]: 1,
  [NATS_TOPICS.SYSTEM_RECOVERY]: 1,
}

export function getFederationForTopic(topic: string): number | undefined {
  return TOPIC_FEDERATION_MAP[topic as NatsTopic]
}

export function getFederatedTopic(federationId: number, subject: string): string {
  return `${NATS_PREFIX}.f${federationId}.${subject}`
}
