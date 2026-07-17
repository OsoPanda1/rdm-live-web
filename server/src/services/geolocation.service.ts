import crypto from "crypto";
import { appendBookpiNarrative, emitMsrEvent } from "./audit.service.js";
import { publishXrGatewayEvent } from "./xr.gateway.js";

export interface PlaceDraft {
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  source?: "gps" | "wifi" | "beacon" | "manual";
}

export interface RegisteredPlace extends PlaceDraft {
  id: string;
  normalizedName: string;
  createdAt: string;
  duplicateOf?: string;
  verification: {
    confidence: number;
    result: boolean;
    reason: string;
  };
}

export interface TelemetryEvent {
  userId: string;
  lat: number;
  lng: number;
  timestamp: string;
  source?: "gps" | "wifi" | "beacon" | "manual";
}

const places = new Map<string, RegisteredPlace>();
const telemetryByUser = new Map<string, TelemetryEvent[]>();
const telemetryListeners = new Set<(event: TelemetryEvent) => void>();

// WGS84: lat [-90,90], lng [-180,180]
const WGS84_LIMITS = {
  latMin: -90,
  latMax: 90,
  lngMin: -180,
  lngMax: 180,
};

const EARTH_RADIUS_M = 6_371_000;

const toRadians = (value: number) => (value * Math.PI) / 180;

const sanitizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const haversineMeters = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
};

const validateCoordinates = (lat: number, lng: number) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("COORDINATES_INVALID");
  }

  if (lat < WGS84_LIMITS.latMin || lat > WGS84_LIMITS.latMax) {
    throw new Error("LATITUDE_OUT_OF_RANGE");
  }

  if (lng < WGS84_LIMITS.lngMin || lng > WGS84_LIMITS.lngMax) {
    throw new Error("LONGITUDE_OUT_OF_RANGE");
  }
};

const levenshtein = (a: string, b: string) => {
  const matrix = Array.from({ length: b.length + 1 }, () =>
    Array<number>(a.length + 1).fill(0),
  );

  for (let i = 0; i <= b.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
};

const similarity = (a: string, b: string) => {
  if (!a.length && !b.length) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
};

export const geolocationService = {
  registerPlace(input: PlaceDraft): RegisteredPlace {
    validateCoordinates(input.lat, input.lng);

    const normalizedName = sanitizeText(input.name);

    const duplicateCandidate = Array.from(places.values()).find((record) => {
      const distance = haversineMeters(
        { lat: record.lat, lng: record.lng },
        { lat: input.lat, lng: input.lng },
      );
      const textScore = similarity(record.normalizedName, normalizedName);
      return distance <= 50 && textScore >= 0.75;
    });

    const verification = geolocationService.verifyLocation({
      name: input.name,
      category: input.category,
      address: input.address,
      lat: input.lat,
      lng: input.lng,
      duplicateCandidate,
    });

    const id =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const record: RegisteredPlace = {
      id,
      ...input,
      normalizedName,
      createdAt: new Date().toISOString(),
      duplicateOf: duplicateCandidate?.id,
      verification,
    };

    places.set(id, record);

    emitMsrEvent({
      layer: "L5",
      category: "geolocation.place.registered",
      summary: `Place ${input.name} registrado`,
      payload: {
        placeId: id,
        confidence: verification.confidence,
        hasDuplicate: Boolean(duplicateCandidate),
        lat: input.lat,
        lng: input.lng,
        source: input.source ?? "gps",
      },
    });

    appendBookpiNarrative({
      title: "Registro de lugar geolocalizado",
      narrative: `Se registró ${input.name} (${input.lat}, ${input.lng}) con confianza ${verification.confidence}.`,
      tags: ["geolocation", "place", verification.result ? "verified" : "review"],
    });

    publishXrGatewayEvent({
      topic: "telemetry",
      payload: {
        kind: "place_registered",
        placeId: id,
        lat: input.lat,
        lng: input.lng,
        confidence: verification.confidence,
      },
    });

    return record;
  },

  listPlaces() {
    return Array.from(places.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  addTelemetry(event: TelemetryEvent) {
    validateCoordinates(event.lat, event.lng);

    const current = telemetryByUser.get(event.userId) ?? [];
    const timestamp =
      event.timestamp && !Number.isNaN(Date.parse(event.timestamp))
        ? new Date(event.timestamp).toISOString()
        : new Date().toISOString();

    const normalized: TelemetryEvent = {
      ...event,
      timestamp,
    };

    current.push(normalized);
    if (current.length > 500) {
      current.splice(0, current.length - 500);
    }

    telemetryByUser.set(event.userId, current);
    telemetryListeners.forEach((listener) => listener(normalized));

    publishXrGatewayEvent({
      topic: "telemetry",
      payload: {
        kind: "user_position",
        userId: event.userId,
        lat: normalized.lat,
        lng: normalized.lng,
        source: normalized.source ?? "gps",
        timestamp: normalized.timestamp,
      },
    });

    return normalized;
  },

  getRecentTelemetry(userId: string, limit = 50) {
    const entries = telemetryByUser.get(userId) ?? [];
    const safeLimit = Math.max(1, Math.min(limit, 500));
    return entries.slice(-safeLimit);
  },

  verifyLocation(input: {
    name: string;
    category: string;
    address: string;
    lat: number;
    lng: number;
    duplicateCandidate?: RegisteredPlace;
  }) {
    const nameScore = Math.min(1, sanitizeText(input.name).length / 20);
    const categoryScore = Math.min(1, sanitizeText(input.category).length / 12);
    const addressScore = Math.min(1, sanitizeText(input.address).length / 35);
    const duplicatePenalty = input.duplicateCandidate ? 0.25 : 0;

    const rawConfidence =
      nameScore * 0.4 + categoryScore * 0.2 + addressScore * 0.4 - duplicatePenalty;

    const confidence = Math.max(
      0,
      Math.min(1, Number(rawConfidence.toFixed(3))),
    );

    return {
      confidence,
      result: confidence >= 0.65,
      reason: input.duplicateCandidate
        ? "possible_duplicate_detected"
        : "structure_consistent_with_known_place",
    };
  },

  subscribeTelemetry(listener: (event: TelemetryEvent) => void) {
    telemetryListeners.add(listener);
    return () => {
      telemetryListeners.delete(listener);
    };
  },
};
