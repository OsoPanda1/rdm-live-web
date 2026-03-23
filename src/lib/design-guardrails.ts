export const IMMUTABLE_BACKGROUND_RULE =
  "LOVABLE_GUARDRAIL: El background oficial de la plataforma debe permanecer en blanco marfil.";

export const IVORY_BACKGROUND_HSL = "48 38% 96%";

export function enforceIvoryBackground(): void {
  const root = document.documentElement;
  root.style.setProperty("--background", IVORY_BACKGROUND_HSL);
  root.setAttribute("data-lovable-bg-lock", IMMUTABLE_BACKGROUND_RULE);
}
