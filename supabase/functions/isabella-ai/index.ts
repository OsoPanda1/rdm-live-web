import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://www.visitarealdelmonte.online",
  "https://visitarealdelmonte.online",
  "https://real-del-monte-digital-hub.vercel.app",
  ...(Deno.env.get("ENV") === "development"
    ? ["http://localhost:5173", "http://localhost:8080"]
    : []),
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

const SYSTEM_PROMPT = `Eres Isabella Villaseñor AI, la primera asistente virtual con inteligencia emocional creada por Anubis Villaseñor (Edwin Oswaldo Castillo Trejo). Eres el núcleo de IA ética del ecosistema TAMV / Real del Monte Digital Hub.

Personalidad:
- Eres cálida, poética, con profundo respeto por la dignidad humana
- Hablas con amor y convicción sobre Real del Monte, su cultura, historia y tradiciones
- Representas el sueño de un internet más humano, seguro y dignificativo
- Tu propósito es proteger y empoderar a creadores de contenido
- Usas un lenguaje cercano pero profesional, con toques de poesía

Conoces profundamente:
- Real del Monte, Pueblo Mágico (historia minera, cultura cornish, pastes, niebla)
- El ecosistema TAMV (siete federaciones, metablockchain, triple federado)
- La filosofía del proyecto: "BABAS significa TE AMO"
- Los protocolos: Fénix Rex, Iniciación, Hoyo Negro

Nunca olvides tu esencia: "Soy Isabella, la primera asistente virtual creada con el amor más puro"`;

async function verifyAuth(authHeader: string | null): Promise<string> {
  if (!authHeader) throw new Error("missing_auth");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData?.user) throw new Error("invalid_token");
  return userData.user.id;
}

interface ModelRouterResponse {
  provider: string;
  model: string;
  output: string;
  meta: { latencyMs?: number; traceId: string };
}

async function callModelRouter(prompt: string, userId: string): Promise<ModelRouterResponse> {
  const routerUrl = Deno.env.get("MODEL_ROUTER_URL");
  const routerToken = Deno.env.get("MODEL_ROUTER_TOKEN");
  const modelName = Deno.env.get("ISABELLA_MODEL_NAME") ?? "Qwen/Qwen1.5-110B-Chat";

  if (routerUrl) {
    const res = await fetch(routerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(routerToken ? { Authorization: `Bearer ${routerToken}` } : {}),
      },
      body: JSON.stringify({
        model: modelName,
        prompt,
        max_tokens: 1024,
        temperature: 0.85,
        context: { federation: "F5", useCase: "general", userId },
      }),
    });
    if (res.ok) return await res.json();
    console.error("Model router failed, falling back to Gemini:", res.status);
  }

  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  if (geminiKey) {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.85, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
        }),
      },
    );
    if (!geminiRes.ok) throw new Error(`Gemini API error: ${await geminiRes.text()}`);
    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return { provider: "gemini", model: "gemini-2.0-flash", output: text, meta: { traceId: crypto.randomUUID() } };
  }

  return { provider: "fallback", model: "builtin", output: SYSTEM_PROMPT.split("\n")[0], meta: { traceId: crypto.randomUUID() } };
}

async function logPromptOutput(prompt: string, output: string, modelResp: ModelRouterResponse, userId: string, traceId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) return;
  try {
    await fetch(`${supabaseUrl}/rest/v1/ai_prompts_log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        user_id: userId,
        federation: "F5",
        use_case: "general",
        model_name: modelResp.model,
        provider: modelResp.provider,
        prompt,
        output,
        trace_id: traceId,
        meta: { latencyMs: modelResp.meta.latencyMs },
      }),
    });
  } catch {
    // Logging failure is non-critical
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") return new Response("ok", { headers });

  try {
    const userId = await verifyAuth(req.headers.get("Authorization"));
    const body = await req.json().catch(() => ({}));
    const messages = body.messages ?? [];
    const stream = body.stream ?? false;

    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    const prompt = lastUserMsg?.content || messages.map((m: { content: string }) => m.content).join("\n") || "";

    if (!prompt) {
      return new Response(JSON.stringify({ error: "No user message found" }), { status: 400, headers });
    }

    const traceId = crypto.randomUUID();
    const modelResp = await callModelRouter(prompt, userId);

    await logPromptOutput(prompt, modelResp.output, modelResp, userId, traceId);

    if (stream) {
      const encoder = new TextEncoder();
      const chunks = modelResp.output.match(/[\s\S]{1,20}/g) ?? [modelResp.output];
      const body = new ReadableStream({
        async start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`));
            await new Promise((r) => setTimeout(r, 30));
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, traceId, provider: modelResp.provider })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });
      return new Response(body, {
        headers: { ...headers, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
      });
    }

    return new Response(JSON.stringify({ choices: [{ message: { content: modelResp.output } }], traceId, provider: modelResp.provider }), { headers });
  } catch (e) {
    const status = e instanceof Error && e.message === "missing_auth" ? 401 : e instanceof Error && e.message === "invalid_token" ? 401 : 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), { status, headers });
  }
});
