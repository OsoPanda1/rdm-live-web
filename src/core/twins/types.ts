export interface GeoPoint {
  lat: number;
  lng: number;
  alt: number;
}

export type TwinSecurity = {
  signature: string;
  certId: string;
};

export type TelemetryBase = Record<string, string | number | boolean>;

// ─── Mesh Node ────────────────────────────────────────────────

export interface MeshNodeProperties {
  name: string;
  lat: number;
  lng: number;
  alt: number;
  signalStrength: number;
  meshHealth: number;
  adoptionIndex: number;
}

export interface MeshNodeTelemetry {
  packetLossRate: number;
  latencyMs: number;
}

export interface MeshNodeRelationships {
  connectedTo: string[];
  locatedIn: string;
}

export interface MeshNodeTwin {
  "@context": string;
  "@id": string;
  "@type": ["MeshNode", "TerritorialAsset"];
  properties: MeshNodeProperties;
  telemetry: MeshNodeTelemetry;
  relationships: MeshNodeRelationships;
  security: TwinSecurity;
}

// ─── Commerce ─────────────────────────────────────────────────

export interface CommerceProperties {
  name: string;
  category: string;
  lat: number;
  lng: number;
  alt: number;
  adoptionIndex: number;
  visitorCountDaily: number;
  avgTicketAmount: number;
}

export interface CommerceTelemetry {
  isOpen: boolean;
  queueLength: number;
}

export interface CommerceRelationships {
  servedByMeshNode: string;
  locatedIn: string;
  nearPOI: string[];
}

export interface CommerceTwin {
  "@context": string;
  "@id": string;
  "@type": ["Commerce", "TourismAsset"];
  properties: CommerceProperties;
  telemetry: CommerceTelemetry;
  relationships: CommerceRelationships;
  security: TwinSecurity;
}

// ─── Environmental Sensor ─────────────────────────────────────

export interface SensorProperties {
  name: string;
  lat: number;
  lng: number;
  alt: number;
  sensorType: string;
  meshHealth: number;
}

export interface SensorTelemetry {
  pm25: number;
  temperature: number;
  humidity: number;
}

export interface SensorRelationships {
  connectedTo: string[];
  locatedIn: string;
}

export interface EnvironmentalSensorTwin {
  "@context": string;
  "@id": string;
  "@type": ["EnvironmentalSensor", "TerritorialAsset"];
  properties: SensorProperties;
  telemetry: SensorTelemetry;
  relationships: SensorRelationships;
  security: TwinSecurity;
}

// ─── Union ────────────────────────────────────────────────────

export type TerritorialTwin = MeshNodeTwin | CommerceTwin | EnvironmentalSensorTwin;

export type TwinType = TerritorialTwin["@type"][number];

export type TwinTelemetry =
  | MeshNodeTelemetry
  | CommerceTelemetry
  | SensorTelemetry;

// ─── Twin State (post Micro-Sentinel) ─────────────────────────

export interface TwinState {
  nodeId: string;
  type: TwinType;
  health: number;
  adoptionIndex: number;
  lastSeen: string;
  status: "HEALTHY" | "DEGRADED" | "COMPROMISED" | "OFFLINE";
  coords: GeoPoint;
  telemetry: TwinTelemetry;
}

// ─── Ditto Thing ──────────────────────────────────────────────

export interface DittoThing {
  thingId: string;
  policyId: string;
  attributes: Record<string, string>;
  features: Record<string, {
    properties: Record<string, string | number | boolean>;
  }>;
}
