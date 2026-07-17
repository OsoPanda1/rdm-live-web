import type { SovereignContext } from "../services/protocol/sovereign.engine.js";
import { rdmData } from "../data/rdm-data.js";

export function culturalGuardian(text: string, _context: SovereignContext): string {
  let output = text;

  output = output.replace(/\bt[íi]pico\b/gi, "auténtico");
  output = output.replace(/\bpintoresco\b/gi, "territorial");

  for (const place of rdmData.places) {
    if (!place.name || !place.schedule) {
      continue;
    }

    if (output.includes(place.name) && !output.includes(place.schedule)) {
      const pattern = new RegExp(place.name, "g");
      output = output.replace(pattern, `${place.name} (horario: ${place.schedule})`);
    }
  }

  return output;
}
