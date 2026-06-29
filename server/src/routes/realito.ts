// ============================================================================
// RDM Digital OS — Realito Cognitive Router v1.0
// Router HTTP para el núcleo conversacional territorial
// ============================================================================

import { Router } from "express";
import { z } from "zod";
import { performance } from "perf_hooks";
import crypto from "crypto";
import { db } from "../lib/store.js";
import { handleRealitoChat } from "../experience/realitoController.js";
import { config } from "../config.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import { SovereignEngine } from "../services/protocol/sovereign.engine.js";

// ============================================================================
// Esquema de validación de entrada
// ============================================================================

const realitoChatSchema = z.object({
  message: z.string().min(1),
  userPreferences: z.record(z.any()).optional(),
  geo: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .nullable()
    .optional(),
  contextHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      }),
    )
    .optional(),
});

// ============================================================================
// Router
// ============================================================================

const realitoRouter = Router();

realitoRouter.use(createRateLimiter(config.rateLimitMaxRequests, config.rateLimitWindowMs));

realitoRouter.post("/chat", async (req, res) => {
  const startedAt = performance.now();
  const interactionId = crypto.randomUUID();

  const parsed = realitoChatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Protocol Violation",
      details: parsed.error.flatten(),
      traceId: interactionId,
    });
  }

  // Dejamos que el controller maneje la lógica y la respuesta final
  // pero registramos trazas alrededor de la llamada.
  try {
    // Guardamos trazabilidad mínima de entrada
    db.interactions.set(interactionId, {
      id: interactionId,
      kind: "realito_chat_http_v1",
      status: "RECEIVED",
      createdAt: new Date().toISOString(),
      meta: {
        latencyMs: 0,
        rawPreview: parsed.data.message.slice(0, 100),
      },
    });

    // Reinyectamos la request validada al controller
    req.body = parsed.data;

    await handleRealitoChat(req, res);

    // Nota: si quieres registrar SUCCESS aquí, tendrías que envolver `res.json`
    // o migrar la lógica a un servicio puro (runRealitoKernel).
  } catch (err) {
    console.error(`[REALITO ROUTER ERROR - ${interactionId}]:`, err);

    db.interactions.set(interactionId, {
      id: interactionId,
      kind: "realito_chat_http_v1",
      status: "ERROR",
      createdAt: new Date().toISOString(),
      meta: {
        error: (err as Error).message,
        latencyMs: performance.now() - startedAt,
      },
    });

    return res.status(500).json({
      error: "Fallo en el router de Realito.",
      traceId: interactionId,
    });
  } finally {
    const entry = db.interactions.get(interactionId);
    if (entry?.meta) {
      entry.meta.latencyMs = performance.now() - startedAt;
      db.interactions.set(interactionId, entry);
    }
  }
});


realitoRouter.post("/sovereign", async (req, res) => {
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";

  if (!prompt) {
    return res.status(400).json({ error: "prompt is required" });
  }

  const answer = await SovereignEngine.processRequest(
    {
      channel: "realito",
      userId: req.body?.userId,
      locale: req.body?.locale,
      twin: req.body?.twin,
    },
    prompt,
  );

  return res.json({ answer });
});

export default realitoRouter;
