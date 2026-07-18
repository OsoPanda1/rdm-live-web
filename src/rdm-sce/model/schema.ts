export const SNDTM_JSON_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "RDMSpatialNetworkTwinState",
  description: "Estado canónico inmutable de un Digital Twin en el Ecosistema RDM",
  type: "object" as const,
  required: [
    "twin_id", "timestamp", "spatial_state", "network_state",
    "mobility_state", "territorial_state", "federation_state", "data_origin",
  ] as const,
  properties: {
    twin_id: { type: "string", format: "uuid" },
    timestamp: { type: "integer", description: "Epoch Unix en milisegundos" },
    spatial_state: {
      type: "object",
      required: ["current_position", "accuracy_radius_meters", "altitude_meters", "current_geofences"],
      properties: {
        current_position: {
          type: "object",
          required: ["type", "coordinates"],
          properties: {
            type: { type: "string", enum: ["Point"] },
            coordinates: {
              type: "array",
              minItems: 2, maxItems: 3,
              description: "[Longitud, Latitud, Altitud] WGS84",
              items: { type: "number" },
            },
          },
        },
        accuracy_radius_meters: { type: "number" },
        altitude_meters: { type: "number" },
        current_geofences: { type: "array", items: { type: "string" } },
      },
    },
    network_state: {
      type: "object",
      required: ["resolved_ip", "asn", "isp", "connection_type", "threat_level", "proxy_detected"],
      properties: {
        resolved_ip: { type: "string", oneOf: [{ format: "ipv4" }, { format: "ipv6" }] },
        asn: { type: "integer" },
        isp: { type: "string" },
        connection_type: {
          type: "string",
          enum: ["cellular_2g", "cellular_3g", "cellular_4g", "cellular_5g", "wifi_local", "ethernet_mesh", "satellite", "unknown"],
        },
        threat_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
        proxy_detected: { type: "boolean" },
      },
    },
    mobility_state: {
      type: "object",
      required: ["motion_type", "velocity_mps", "heading_degrees", "trajectory_id"],
      properties: {
        motion_type: {
          type: "string",
          enum: ["stationary", "walking", "running", "cycling", "automotive", "aerial", "unknown"],
        },
        velocity_mps: { type: "number" },
        heading_degrees: { type: "number", minimum: 0, maximum: 360 },
        trajectory_id: { type: "string", format: "uuid" },
      },
    },
    territorial_state: {
      type: "object",
      required: ["country_code", "state_code", "municipality_code", "locality_code", "neighborhood", "zone_type"],
      properties: {
        country_code: { type: "string", enum: ["MX"] },
        state_code: { type: "string", maxLength: 3 },
        municipality_code: { type: "string", maxLength: 3 },
        locality_code: { type: "string", maxLength: 4 },
        neighborhood: { type: "string" },
        zone_type: {
          type: "string",
          enum: ["urban", "rural", "heritage", "mining_zone", "touristic_corridor", "ecological_reserve", "unknown"],
        },
      },
    },
    federation_state: {
      type: "object",
      required: ["federation_id", "node_id", "sync_mode", "vector_clock"],
      properties: {
        federation_id: { type: "integer", minimum: 1, maximum: 7 },
        node_id: { type: "string" },
        sync_mode: {
          type: "string",
          enum: ["online_synchronized", "offline_autonomous", "degraded_isolation"],
        },
        vector_clock: {
          type: "object",
          additionalProperties: { type: "integer" },
        },
      },
    },
    data_origin: {
      type: "object",
      required: ["location_source", "confidence_score", "isabella_policy_id", "cryptographic_signature"],
      properties: {
        location_source: {
          type: "string",
          enum: ["ip_core_resolver", "hardware_gps", "wifi_triangulation", "cell_tower_proximity", "rfid_mesh", "manual_assertion"],
        },
        confidence_score: { type: "number", minimum: 0, maximum: 1 },
        isabella_policy_id: { type: "string" },
        cryptographic_signature: { type: "string" },
      },
    },
  },
}
