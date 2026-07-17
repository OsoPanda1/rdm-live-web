export const LDTOCS_DOMAIN = "ldtocs";
export const ISABELLA_DOMAIN = "isabella";

export const TOPIC_NAMESPACE = {
  MESH_TELEMETRY: "ldtocs/mesh/{nodeId}/telemetry",
  MESH_STATE: "ldtocs/mesh/{nodeId}/state",
  COMMERCE_TELEMETRY: "ldtocs/comercio/{commerceId}/telemetry",
  COMMERCE_STATE: "ldtocs/comercio/{commerceId}/state",
  SENSOR_TELEMETRY: "ldtocs/sensor/{sensorId}/telemetry",
  SENSOR_STATE: "ldtocs/sensor/{sensorId}/state",
  TERRITORY_EVENT_SECURITY: "ldtocs/territory/events/security",
  TERRITORY_EVENT_OPERATIONAL: "ldtocs/territory/events/operational",
  ISABELLA_LUMEN_DECISIONS: "isabella/control/lumen/decisions",
  ISABELLA_MNEMOS_RECORDS: "isabella/control/mnemos/records",
} as const;

export function buildMeshTelemetryTopic(nodeId: string): string {
  return `ldtocs/mesh/${nodeId}/telemetry`;
}

export function buildMeshStateTopic(nodeId: string): string {
  return `ldtocs/mesh/${nodeId}/state`;
}

export function buildCommerceTelemetryTopic(commerceId: string): string {
  return `ldtocs/comercio/${commerceId}/telemetry`;
}

export function buildCommerceStateTopic(commerceId: string): string {
  return `ldtocs/comercio/${commerceId}/state`;
}

export function buildSensorTelemetryTopic(sensorId: string): string {
  return `ldtocs/sensor/${sensorId}/telemetry`;
}

export function buildSensorStateTopic(sensorId: string): string {
  return `ldtocs/sensor/${sensorId}/state`;
}

export function buildTerritorySecurityTopic(): string {
  return "ldtocs/territory/events/security";
}

export function buildTerritoryOperationalTopic(): string {
  return "ldtocs/territory/events/operational";
}

export function buildLumenDecisionTopic(): string {
  return "isabella/control/lumen/decisions";
}

export function buildMnemosRecordTopic(): string {
  return "isabella/control/mnemos/records";
}

export type TopicNamespace = keyof typeof TOPIC_NAMESPACE;
