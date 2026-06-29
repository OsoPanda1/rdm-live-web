import type { SovereignContext } from "./sovereign.engine.js";
import { getEconomySummary } from "../economy.skills.js";
import { getPlacesSummary } from "../places.skills.js";
import { getRouteForQuery } from "../routes.skills.js";

type SkillOnlyPlan =
  | { kind: "skill-only"; skill: "places"; args: { query: string } }
  | { kind: "skill-only"; skill: "routes"; args: { query: string } }
  | { kind: "skill-only"; skill: "economy"; args: Record<string, never> };

type ModelPlan = {
  kind: "model";
  promptForModel: string;
};

export type SovereignPlan = SkillOnlyPlan | ModelPlan;

export async function planFromPrompt(prompt: string, _context: SovereignContext): Promise<SovereignPlan> {
  const lower = prompt.toLowerCase();

  if (/(horario|abre|cierra|lugar|museo)/i.test(lower)) {
    return { kind: "skill-only", skill: "places", args: { query: prompt } };
  }

  if (/(ruta|itinerario|recorrido)/i.test(lower)) {
    return { kind: "skill-only", skill: "routes", args: { query: prompt } };
  }

  if (/(donaci[oó]n|econom[ií]a|membres[ií]a)/i.test(lower)) {
    return { kind: "skill-only", skill: "economy", args: {} };
  }

  return { kind: "model", promptForModel: prompt };
}

export async function executeSkillPlan(plan: SkillOnlyPlan, _context: SovereignContext): Promise<string> {
  switch (plan.skill) {
    case "places":
      return getPlacesSummary(plan.args.query);
    case "routes":
      return getRouteForQuery(plan.args.query);
    case "economy":
      return getEconomySummary();
    default:
      return "Skill no reconocida.";
  }
}
