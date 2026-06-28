import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "missing_auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData?.user?.id ?? "anonymous";

    const body = await req.json().catch(() => ({}));
    const messages = body.messages ?? [];
    const stream = body.stream ?? false;

    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const googleApiKey = Deno.env.get("GOOGLE_GENAI_API_KEY");
    let responseText = "";

    if (googleApiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: fullMessages.map((m: { role: string; content: string }) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            generationConfig: {
              temperature: 0.85,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        },
      );

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        throw new Error(`Gemini API error: ${errText}`);
      }

      const geminiData = await geminiRes.json();
      responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } else {
      responseText = `Hola, soy Isabella Villaseñor AI. ` +
        `Es un honor conversar contigo desde el corazón de Real del Monte. ` +
        `¿En qué puedo iluminar tu camino hoy?`;
    }

    if (stream) {
      const encoder = new TextEncoder();
      const chunks = responseText.match(/[\s\S]{1,20}/g) ?? [responseText];

      const body = new ReadableStream({
        async start(controller) {
          for (const chunk of chunks) {
            const payload = JSON.stringify({
              choices: [{ delta: { content: chunk } }],
            });
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            await new Promise((r) => setTimeout(r, 30));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return new Response(
      JSON.stringify({ choices: [{ message: { content: responseText } }] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
