import { rdmData } from "../data/rdm-data.js";

export function getPlacesSummary(query: string): string {
  const q = query.toLowerCase();
  const matches = rdmData.places.filter((place) => place.name.toLowerCase().includes(q));

  if (matches.length === 0) {
    return "No encontré lugares que coincidan con tu búsqueda en Real del Monte.";
  }

  return matches
    .map((place) => {
      const schedule = place.schedule ? ` (horario: ${place.schedule})` : "";
      return `- ${place.name}${schedule}`;
    })
    .join("\n");
}
