import { logger } from "@core-kernel/log";
import { incCounter } from "@core-kernel/metrics";

const blockedPatterns = [
  /tarjeta de crédito|credit card/i,
  /\bcurp\b/i,
  /número de pasaporte|pasaporte/i,
  /contraseña|password/i,
  /enfermedad|diagnóstico|historial clínico/i,
  /\bcvv\b|código de seguridad/i,
];

export type GuardianDecision =
  | { allow: true }
  | { allow: false; reason: "SensitiveData"; safeMessage: string };

export function guardIsabellaPrompt(prompt: string): GuardianDecision {
  for (const pattern of blockedPatterns) {
    if (pattern.test(prompt)) {
      incCounter("ai.guard.blocked");
      logger.warn("Prompt bloqueado por guardian", {
        module: "ai-core",
        federation: "identity",
      });

      return {
        allow: false,
        reason: "SensitiveData",
        safeMessage:
          "Por seguridad y respeto a tu privacidad, no puedo procesar ese tipo de información. " +
          "Puedo ayudarte con recomendaciones sobre Real del Monte, lugares, rutas e historias.",
      };
    }
  }

  incCounter("ai.guard.allowed");
  return { allow: true };
}
