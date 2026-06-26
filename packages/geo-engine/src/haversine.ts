export type GeoPoint = {
  /** Latitud en grados decimales, rango recomendado [-90, 90]. */
  lat: number;
  /** Longitud en grados decimales, rango recomendado [-180, 180]. */
  lon: number;
};

/** Radio medio de la Tierra en km (WGS84 aprox.).[web:66][web:69] */
const EARTH_RADIUS_KM = 6371;

/** Factor para convertir grados a radianes. */
const TO_RAD = Math.PI / 180;

/**
 * Convierte grados a radianes.
 *
 * Se expone para reutilizar en otros cálculos (bearing, etc.).[web:62][web:69]
 */
export function degToRad(deg: number): number {
  return deg * TO_RAD;
}

/**
 * Opcional: valida rangos básicos de lat/lon.
 * Útil en entornos donde los datos provienen de usuarios o sensores.
 */
export function isValidGeoPoint(point: GeoPoint): boolean {
  const { lat, lon } = point;
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

/**
 * Calcula la distancia de gran círculo entre dos puntos geográficos
 * usando la fórmula de Haversine.[web:66][web:68][web:69]
 *
 * @param a Primer punto (lat, lon en grados).
 * @param b Segundo punto (lat, lon en grados).
 * @param radiusKm Radio de la esfera en km (por defecto, radio medio de la Tierra).
 * @returns Distancia en kilómetros.
 */
export function haversineKm(
  a: GeoPoint,
  b: GeoPoint,
  radiusKm: number = EARTH_RADIUS_KM
): number {
  // Caso degenerado: mismos puntos → distancia 0, evita ruido numérico.
  if (a.lat === b.lat && a.lon === b.lon) {
    return 0;
  }

  const lat1 = degToRad(a.lat);
  const lat2 = degToRad(b.lat);
  const dLat = lat2 - lat1;
  const dLon = degToRad(b.lon - a.lon);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;

  // Clamp defensivo por posibles errores de precisión floating‑point.[web:60][web:63]
  const clamped = Math.min(1, Math.max(0, h));

  const c = 2 * Math.atan2(Math.sqrt(clamped), Math.sqrt(1 - clamped));

  return radiusKm * c;
}

/**
 * Variante que devuelve la distancia en metros, reutilizando haversineKm.
 */
export function haversineMeters(a: GeoPoint, b: GeoPoint, radiusKm = EARTH_RADIUS_KM): number {
  return haversineKm(a, b, radiusKm) * 1000;
}
