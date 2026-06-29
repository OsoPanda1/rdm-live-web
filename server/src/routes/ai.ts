import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { recommendBusinesses } from "../services/recommendations.service.js";
import { emitMsrEvent } from "../services/audit.service.js";
import { db } from "../lib/store.js";

const aiSchema = z.object({
  text: z
    .string()
    .trim()
    .min(2, "La consulta debe tener al menos 2 caracteres")
    .max(config.aiMaxPromptChars, `La consulta no puede exceder ${config.aiMaxPromptChars} caracteres`),
  consentToPersonalize: z.boolean().optional().default(false),
});

const aiRouter = Router();

let consecutiveFailures = 0;
let circuitOpenUntil = 0;

const inferIntent = (text: string): string => {
  const value = text.toLowerCase();
  if (value.includes("comer") || value.includes("restaurante") || value.includes("paste")) return "comer";
  if (value.includes("aventura") || value.includes("sendero") || value.includes("naturaleza")) return "aventura";
  if (value.includes("hotel") || value.includes("hosped")) return "hospedaje";
  return "cultura";
};

const withTimeout = async <T>(operation: () => Promise<T> | T, timeoutMs: number): Promise<T> => {
  const timeout = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => reject(new Error("AI_TIMEOUT")), timeoutMs);
    timeoutId.unref?.();
  });
  return Promise.race([Promise.resolve().then(operation), timeout]);
};

function assertCircuitClosed() {
  if (Date.now() < circuitOpenUntil) {
    throw new Error("AI_CIRCUIT_OPEN");
  }
}

function recordAiSuccess() {
  consecutiveFailures = 0;
  circuitOpenUntil = 0;
}

function recordAiFailure() {
  consecutiveFailures += 1;
  if (consecutiveFailures >= config.aiCircuitBreakerThreshold) {
    circuitOpenUntil = Date.now() + config.aiCircuitBreakerCooldownMs;
  }
}

aiRouter.post("/realito", async (req, res) => {
  const parsed = aiSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "INVALID_AI_REQUEST", details: parsed.error.flatten() });
  }

  const startedAt = Date.now();

  try {
    assertCircuitClosed();

    const response = await withTimeout(() => {
      const intent = inferIntent(parsed.data.text);
      const businesses = recommendBusinesses({ intent });

      businesses.forEach((business) => {
        const id = crypto.randomUUID();
        db.interactions.set(id, {
          id,
          kind: "recommendation_view",
          businessId: business.id,
          context: intent,
          createdAt: new Date().toISOString(),
        });
      });

      const top = businesses.slice(0, 3).map((business) => business.name).join(", ");
      const reply = top
        ? `Con base en tu intención (${intent}), te recomiendo: ${top}. Priorizo relevancia local, seguridad turística y visibilidad activa sin inferir atributos sensibles.`
        : "Aún no tengo negocios suficientes para recomendarte. Prueba en unos minutos.";

      return { reply, intent, businesses: businesses.slice(0, 3) };
    }, config.aiRequestTimeoutMs);

    recordAiSuccess();
    emitMsrEvent({
      layer: "L4",
      category: "ai.realito.success",
      summary: "Realito generó recomendación contextual endurecida",
      payload: {
        requestId: req.id ?? "unknown",
        intent: response.intent,
        latencyMs: Date.now() - startedAt,
        personalized: parsed.data.consentToPersonalize,
      },
    });

    return res.json({ ...response, requestId: req.id });
  } catch (error) {
    recordAiFailure();
    emitMsrEvent({
      layer: "L4",
      category: "ai.realito.failure",
      summary: "Realito rechazó o interrumpió una solicitud",
      payload: {
        requestId: req.id ?? "unknown",
        latencyMs: Date.now() - startedAt,
        reason: error instanceof Error ? error.message : "UNKNOWN",
      },
    });

    const code = error instanceof Error && error.message === "AI_CIRCUIT_OPEN" ? "AI_CIRCUIT_OPEN" : "AI_UNAVAILABLE";
    const status = code === "AI_CIRCUIT_OPEN" ? 503 : 504;
    return res.status(status).json({ error: code, requestId: req.id });
  }
});

export default aiRouter;
