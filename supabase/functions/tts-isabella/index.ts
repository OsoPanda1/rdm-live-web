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

const SSML_PROFILES: Record<string, { rate: string; pitch: string; break_: string }> = {
  F1: { rate: "slow", pitch: "-2%", break_: "400ms" },
  F2: { rate: "medium", pitch: "0%", break_: "300ms" },
  F3: { rate: "medium", pitch: "+1%", break_: "300ms" },
  F4: { rate: "fast", pitch: "+2%", break_: "200ms" },
  F5: { rate: "medium", pitch: "+1%", break_: "300ms" },
  F6: { rate: "slow", pitch: "-1%", break_: "500ms" },
  F7: { rate: "slow", pitch: "-2%", break_: "400ms" },
};

function buildSsml(text: string, federation: string, language: string): string {
  const p = SSML_PROFILES[federation] || SSML_PROFILES.F6;
  return `<?xml version="1.0"?>
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
  <prosody rate="${p.rate}" pitch="${p.pitch}">${text}<break time="${p.break_}"/></prosody>
</speak>`;
}

async function sha256(input: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") return new Response("ok", { headers });

  try {
    await verifyAuth(req.headers.get("Authorization"));

    const body = await req.json();
    const text: string = body.text;
    const context = body.context || {};
    const federation: string = context.federation || "F6";
    const useCase: string = context.useCase || "general";
    const language: string = context.language || "es-MX";

    if (!text) {
      return new Response(JSON.stringify({ error: "text is required" }), { status: 400, headers });
    }

    const ssml = buildSsml(text, federation, language);
    const cacheKey = await sha256(text + federation + language);
    const fileName = `${cacheKey}.mp3`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const { data: existingFiles } = await supabase.storage.from("isabella-voice-cache").list("", { search: fileName });

    if (existingFiles && existingFiles.length > 0) {
      const { data: urlData } = await supabase.storage.from("isabella-voice-cache").createSignedUrl(fileName, 3600);
      await supabase.from("isabella_voice_logs").insert({
        text_hash: cacheKey, raw_text: text, ssml_applied: ssml, tts_provider: "cache",
        voice_model: "cached", ssml_profile: federation, audio_url: urlData?.signedUrl,
        cache_hit: true, latency_ms: 0, status: "success", federation_id: federation, use_case: useCase,
      }).catch(() => {});
      return new Response(JSON.stringify({ audioUrl: urlData?.signedUrl, mode: "cloud", cacheHit: true }), { headers });
    }

    const googleTtsKey = Deno.env.get("GOOGLE_TTS_API_KEY");
    if (googleTtsKey) {
      const start = Date.now();
      const ttsRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTtsKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { ssml },
          voice: { languageCode: "es-MX", name: "es-MX-Wavenet-B" },
          audioConfig: { audioEncoding: "MP3" },
        }),
      });
      if (ttsRes.ok) {
        const ttsData = await ttsRes.json();
        const audioContent = ttsData.audioContent;
        if (audioContent) {
          const audioBuffer = Uint8Array.from(atob(audioContent), (c) => c.charCodeAt(0));
          const { error: uploadError } = await supabase.storage.from("isabella-voice-cache").upload(fileName, audioBuffer, {
            contentType: "audio/mpeg", upsert: true,
          });
          if (!uploadError) {
            const { data: urlData } = await supabase.storage.from("isabella-voice-cache").createSignedUrl(fileName, 3600);
            const latencyMs = Date.now() - start;
            await supabase.from("isabella_voice_logs").insert({
              text_hash: cacheKey, raw_text: text, ssml_applied: ssml, tts_provider: "google",
              voice_model: "es-MX-Wavenet-B", ssml_profile: federation, audio_url: urlData?.signedUrl,
              cache_hit: false, latency_ms: latencyMs, status: "success", federation_id: federation, use_case: useCase,
            }).catch(() => {});
            return new Response(JSON.stringify({ audioUrl: urlData?.signedUrl, mode: "cloud", cacheHit: false }), { headers });
          }
        }
      }
    }

    // Fallback: tell client to use Web Speech
    return new Response(JSON.stringify({ audioUrl: null, mode: "local", cacheHit: false, message: "Cloud TTS unavailable" }), { headers });

  } catch (e) {
    const status = e instanceof Error && (e.message === "missing_auth" || e.message === "invalid_token") ? 401 : 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown", mode: "local" }), { status, headers });
  }
});
