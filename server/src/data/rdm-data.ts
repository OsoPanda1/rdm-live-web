import { geolocationService } from "../services/geolocation.service.js";

export interface PlaceFact {
  id: string;
  name: string;
  schedule?: string;
  category: string;
}

export const rdmData: { places: PlaceFact[] } = {
  places: [
    { id: "panteon-ingles", name: "Panteón Inglés", schedule: "09:00-18:00", category: "culture" },
    { id: "mina-acosta", name: "Mina de Acosta", schedule: "10:00-17:00", category: "site" },
    { id: "parroquia-asuncion", name: "Parroquia de la Asunción", schedule: "08:00-20:00", category: "culture" },
    { id: "plaza-constitucion", name: "Plaza de la Constitución", category: "public" },
  ],
};

/**
 * Bootstrap mínimo: registra los lugares de rdmData en el geolocationService.
 * Usa coordenadas aproximadas hardcodeadas mientras no tengas fuente oficial.
 */
export function bootstrapRdmPlaces() {
  for (const place of rdmData.places) {
    // Coordenadas aproximadas por id; ajústalas en tu geoservice real.
    let lat: number | undefined;
    let lng: number | undefined;
    let address: string;

    switch (place.id) {
      case "panteon-ingles":
        lat = 20.1378;
        lng = -98.6729;
        address = "C. Panteón Inglés, Barrio del Viento, 42130, Mineral del Monte, Hgo.";
        break;
      case "mina-acosta":
        lat = 20.135;
        lng = -98.672;
        address = "Guerrero s/n, San José Acosta, 42130, Mineral del Monte, Hgo.";
        break;
      case "parroquia-asuncion":
        lat = 20.1355;
        lng = -98.6732;
        address = "Plaza de la Independencia, Centro, 42130, Mineral del Monte, Hgo.";
        break;
      case "plaza-constitucion":
        lat = 20.1357;
        lng = -98.673;
        address = "Plaza de la Constitución, Centro, 42130, Mineral del Monte, Hgo.";
        break;
      default:
        // Si no hay coordenadas conocidas, salta el registro
        continue;
    }

    geolocationService.registerPlace({
      name: place.name,
      category: place.category,
      address,
      lat,
      lng,
      source: "manual",
    });
  }
}
