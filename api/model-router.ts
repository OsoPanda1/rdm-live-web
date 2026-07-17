// api/model-router.ts — Vercel Serverless Function
// Unified entry point for open-source models (Hugging Face, OpenLLM, etc.)
// Auth + Rate limiting + CORS unified

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "./_shared/auth.js";
import { checkRateLimit, RATE_LIMITS } from "./_shared/rate-limit.js";
import { sendWebResponse, vercelRequestToWebRequest } from "./_edge-adapter";

type ModelProvider = "huggingface" | "openllm" | "fallback";

interface FederationContext {
  nodeId: string;
  federation: string;
  useCase: string;
  environment: "dev" | "staging" | "prod";
  userId?: string | null;
}

interface ModelRouterRequest {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  context?: {
    federation?: string;
    useCase?: string;
    userId?: string | null;
  };
}

interface ModelRouterResponse {
  provider: ModelProvider;
  model: string;
  output: string;
  meta: {
    tokens?: number;
    latencyMs: number;
    traceId: string;
    federation: FederationContext;
  };
}

function buildFederationContext(
  ctx?: ModelRouterRequest["context"],
  userId?: string,
): FederationContext {
  const env = (process.env.NODE_ENV as "dev" | "staging" | "prod") || "dev";

  return {
    nodeId: process.env.NODE_ID || "nodo-cero-model-router",
    federation: ctx?.federation || "F5",
    useCase: ctx?.useCase || "model-router",
    environment: env,
    userId: ctx?.userId ?? userId ?? null,
  };
}

function emitTelemetry(
  level: "info" | "warn" | "error",
  message: string,
  federation: FederationContext,
  traceId: string,
  data?: Record<string, unknown>,
) {
  const payload = {
    level,
    message,
    traceId,
    timestamp: new Date().toISOString(),
    federation,
    data,
  };
  // eslint-disable-next-line no-console
  console.log("[model-router]", JSON.stringify(payload));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webRequest = vercelRequestToWebRequest(req);

  // Auth check
  const auth = await requireAuth(webRequest);
  if (auth.errorResponse) {
    return sendWebResponse(res, auth.errorResponse);
  }

  // Rate limit
  const rateLimit = checkRateLimit(webRequest, RATE_LIMITS.model);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: rateLimit.retryAfter,
    });
  }

  const start = Date.now();
  const traceId = `${start}-${Math.random().toString(36).slice(2, 10)}`;

  const body = req.body as ModelRouterRequest;
  const federation = buildFederationContext(body.context, auth.userId);

  try {
    const { model, prompt, max_tokens = 512, temperature = 0.7 } = body;

    if (!model || !prompt) {
      emitTelemetry("warn", "Missing model or prompt", federation, traceId, {
        model,
        promptLength: prompt?.length ?? 0,
      });
      return res.status(400).json({ error: "Missing model or prompt" });
    }

    let provider: ModelProvider = "fallback";
    let output = "";
    let tokens: number | undefined;

    emitTelemetry("info", "Model router request received", federation, traceId, {
      model,
      max_tokens,
      temperature,
    });

    // Hugging Face provider
    if (
      model.startsWith("Qwen/") ||
      model.startsWith("mistralai/") ||
      model.startsWith("meta-llama/") ||
      model.startsWith("google/")
    ) {
      provider = "huggingface";
      const hfToken = process.env.HUGGINGFACE_API_TOKEN;

      if (!hfToken) {
        emitTelemetry("error", "HUGGINGFACE_API_TOKEN not configured", federation, traceId, { model });
        return res.status(500).json({
          error: "HF provider not configured",
          meta: { traceId, federation },
        });
      }

      const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: max_tokens, temperature },
        }),
      });

      if (!hfRes.ok) {
        const errText = await hfRes.text();
        emitTelemetry("error", "HF API error", federation, traceId, {
          status: hfRes.status,
          snippet: errText.slice(0, 200),
        });
        return res.status(502).json({
          error: "HF API error",
          meta: { traceId, federation },
        });
      }

      const hfData = await hfRes.json();
      const candidate = Array.isArray(hfData) ? hfData[0] : hfData;

      output = candidate?.generated_text ?? JSON.stringify(hfData);
      tokens = typeof candidate?.tokens === "number" ? candidate.tokens : undefined;
    } else {
      // OpenLLM / future provider
      const openllmUrl = process.env.OPENLLM_API_URL;

      if (openllmUrl) {
        provider = "openllm";

        const ollmRes = await fetch(`${openllmUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENLLM_API_TOKEN || ""}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            max_tokens,
            temperature,
          }),
        });

        if (!ollmRes.ok) {
          const text = await ollmRes.text();
          emitTelemetry("error", "OpenLLM API error", federation, traceId, {
            status: ollmRes.status,
            snippet: text.slice(0, 200),
          });
          output = `Model ${model} unavailable via OpenLLM.`;
        } else {
          const ollmData = await ollmRes.json();
          output = ollmData?.choices?.[0]?.message?.content ?? JSON.stringify(ollmData);
          tokens =
            typeof ollmData?.usage?.total_tokens === "number"
              ? ollmData.usage.total_tokens
              : undefined;
        }
      } else {
        emitTelemetry("warn", "No provider configured for model", federation, traceId, { model });
        output = `No provider configured for model: ${model}`;
      }
    }

    const latencyMs = Date.now() - start;

    const response: ModelRouterResponse = {
      provider,
      model,
      output,
      meta: {
        tokens,
        latencyMs,
        traceId,
        federation,
      },
    };

    emitTelemetry("info", "Model router response ready", federation, traceId, {
      provider,
      latencyMs,
      tokens,
    });

    return res.status(200).json(response);
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : "unknown error";
    emitTelemetry("error", "Model router fatal error", federation, traceId, { error: errMsg });
    // eslint-disable-next-line no-console
    console.error("Model router error:", e);
    return res.status(500).json({
      error: "Model router error",
      detail: process.env.NODE_ENV === "development" ? errMsg : undefined,
      meta: { traceId, federation },
    });
  }
}
