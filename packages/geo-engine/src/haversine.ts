export type GeoPoint = { lat: number; lon: number };

const EARTH_RADIUS_KM = 6371;
const TO_RAD = Math.PI / 180;

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = (b.lat - a.lat) * TO_RAD;
  const dLon = (b.lon - a.lon) * TO_RAD;
  const lat1 = a.lat * TO_RAD;
  const lat2 = b.lat * TO_RAD;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
