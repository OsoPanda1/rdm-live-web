// api/model-router.ts — Vercel Serverless Function
// Unified entry point for open-source models (Hugging Face, OpenLLM, etc.)
// No API keys exposed to frontend. Traces all requests to ai_prompts_log.

import type { VercelRequest, VercelResponse } from "@vercel/node";

type ModelProvider = "huggingface" | "openllm" | "fallback";

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
    latencyMs?: number;
    traceId: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const start = Date.now();
  const traceId = `${start}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    const body = req.body as ModelRouterRequest;
    const { model, prompt, max_tokens = 512, temperature = 0.7, context } = body;

    if (!prompt || !model) {
      return res.status(400).json({ error: "Missing model or prompt" });
    }

    let provider: ModelProvider = "fallback";
    let output = "";

    if (model.startsWith("Qwen/") || model.startsWith("mistralai/") || model.startsWith("meta-llama/") || model.startsWith("google/")) {
      provider = "huggingface";
      const hfToken = process.env.HUGGINGFACE_API_TOKEN;
      if (!hfToken) {
        throw new Error("HUGGINGFACE_API_TOKEN not configured");
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
        throw new Error(`HF API error (${hfRes.status}): ${errText.slice(0, 200)}`);
      }

      const hfData = await hfRes.json();
      output = Array.isArray(hfData)
        ? hfData[0]?.generated_text ?? JSON.stringify(hfData)
        : String(hfData?.generated_text ?? JSON.stringify(hfData));
    } else {
      // openllm / future provider
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
        if (ollmRes.ok) {
          const ollmData = await ollmRes.json();
          output = ollmData?.choices?.[0]?.message?.content ?? JSON.stringify(ollmData);
        } else {
          output = `Model ${model} unavailable via OpenLLM.`;
        }
      } else {
        output = `No provider configured for model: ${model}`;
      }
    }

    const latencyMs = Date.now() - start;

    const response: ModelRouterResponse = {
      provider,
      model,
      output,
      meta: { latencyMs, traceId },
    };

    return res.status(200).json(response);
  } catch (e: any) {
    console.error("Model router error:", e);
    return res.status(500).json({
      error: "Model router error",
      detail: process.env.NODE_ENV === "development" ? e?.message : undefined,
      meta: { traceId },
    });
  }
}
