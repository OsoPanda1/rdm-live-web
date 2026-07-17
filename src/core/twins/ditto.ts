import type { MeshNodeTwin, CommerceTwin, EnvironmentalSensorTwin, DittoThing } from "./types";

export const RDM_TERRITORY_POLICY = { policyId: "policy:rdm-territory", entries: { acl: { subjects: { "role:isabella-kernel": { type: "role" as const } }, resources: { "thing:/": { grant: ["READ", "WRITE", "ADMINISTRATE"] as const }, "message:/": { grant: ["READ", "WRITE"] as const }, "policy:/": { grant: ["READ"] as const } } } } };

export function buildMeshThing(twin: MeshNodeTwin): DittoThing {
  return { thingId: twin["@id"], policyId: "policy:rdm-territory", attributes: { type: "MeshNode", territory: twin.properties.name }, features: { meshState: { properties: { lat: twin.properties.lat, lng: twin.properties.lng, alt: twin.properties.alt, signalStrength: twin.properties.signalStrength, meshHealth: twin.properties.meshHealth, adoptionIndex: twin.properties.adoptionIndex, packetLossRate: twin.telemetry.packetLossRate, latencyMs: twin.telemetry.latencyMs } } } };
}

export function buildCommerceThing(twin: CommerceTwin): DittoThing {
  return { thingId: twin["@id"], policyId: "policy:rdm-territory", attributes: { type: "Commerce", territory: twin.properties.name }, features: { commerceState: { properties: { lat: twin.properties.lat, lng: twin.properties.lng, alt: twin.properties.alt, adoptionIndex: twin.properties.adoptionIndex, visitorCountDaily: twin.properties.visitorCountDaily, avgTicketAmount: twin.properties.avgTicketAmount, isOpen: twin.telemetry.isOpen ? 1 : 0, queueLength: twin.telemetry.queueLength } } } };
}

export function buildSensorThing(twin: EnvironmentalSensorTwin): DittoThing {
  return { thingId: twin["@id"], policyId: "policy:rdm-territory", attributes: { type: "EnvironmentalSensor", territory: twin.properties.name }, features: { sensorState: { properties: { lat: twin.properties.lat, lng: twin.properties.lng, alt: twin.properties.alt, sensorType: twin.properties.sensorType, meshHealth: twin.properties.meshHealth, pm25: twin.telemetry.pm25, temperature: twin.telemetry.temperature, humidity: twin.telemetry.humidity } } } };
}

export interface DittoSource { addresses: string[]; consumer: { type: string }; mapping: { topicToThing: string; payloadMapping: string; }; }
export interface DittoConnection { connectionId: string; connectionType: string; uri: string; sources: DittoSource[]; targets: []; }

export const MESH_CONNECTION: DittoConnection = { connectionId: "conn:ldtocs-mesh", connectionType: "mqtt", uri: "tcp://broker.ldtocs.local:1883", sources: [{ addresses: ["ldtocs/mesh/+/telemetry"], consumer: { type: "mqtt" }, mapping: { topicToThing: "mesh-node:${mqtt.topic[2]}", payloadMapping: "js:meshTelemetryToDitto" } }], targets: [] };

export interface DittoProtocolMessage { topic: string; path: string; value: Record<string, string | number | boolean>; }

export function meshTelemetryToDitto(mqttTopic: string, payload: string): DittoProtocolMessage {
  const parts = mqttTopic.split("/"); const nodeId = parts[2]; const data = JSON.parse(payload);
  return { topic: `mesh-node:${nodeId}/features/meshState/properties`, path: "/", value: { lat: data.lat, lng: data.lng, alt: data.alt, signalStrength: data.signalStrength, meshHealth: data.meshHealth, adoptionIndex: data.adoptionIndex, packetLossRate: data.packetLossRate, latencyMs: data.latencyMs } };
}
