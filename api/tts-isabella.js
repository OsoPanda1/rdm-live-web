// api/tts-isabella.js — Vercel Edge Function
// Cloud TTS endpoint for Isabella Voice Engine
// Dual pipeline: cache lookup → Google Cloud TTS → store → return URL

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const DEFENSIVE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

/**
 * @param {Request} request
 */
export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...CORS_HEADERS, ...DEFENSIVE_HEADERS } });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, ...DEFENSIVE_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const text = body.text;
    const ctx = body.context || {};
    const federation = ctx.federation || "F6";
    const useCase = ctx.useCase || "general";
    const language = ctx.language || "es-MX";

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, ...DEFENSIVE_HEADERS, "Content-Type": "application/json" },
      });
    }

    const encoder = new TextEncoder();
    const textBytes = encoder.encode(text + federation + useCase + language);
    const hashBuffer = await crypto.subtle.digest("SHA-256", textBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const fileName = `${hashHex}.mp3`;

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check cache
      const { data: existing } = await supabase.storage
        .from("isabella-voice-cache")
        .exists(fileName);

      if (existing) {
        const { data: urlData } = await supabase.storage
          .from("isabella-voice-cache")
          .createSignedUrl(fileName, 3600);

        return new Response(JSON.stringify({
          audioUrl: urlData?.signedUrl || null,
          mode: "cloud",
          cacheHit: true,
        }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      // TODO: Integrate Google Cloud TTS or ElevenLabs here
      // For now, return a placeholder so the pipeline is testable end-to-end
      return new Response(JSON.stringify({
        audioUrl: null,
        mode: "local",
        cacheHit: false,
        message: "Cloud TTS provider not configured — falling back to Web Speech",
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      audioUrl: null,
      mode: "local",
      message: "Supabase not configured — falling back to Web Speech",
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : "TTS failed",
      mode: "local",
    }), {
      status: 500,
      headers: { ...CORS_HEADERS, ...DEFENSIVE_HEADERS, "Content-Type": "application/json" },
    });
  }
}

export const config = {
  runtime: "edge",
};
