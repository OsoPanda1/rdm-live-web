// api/tts-isabella.js — Vercel Edge Function
// Cloud TTS endpoint for Isabella Voice Engine
// Pipeline: cache lookup → (TODO: Cloud TTS) → store → return signed URL

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const DEFENSIVE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "X-Content-Type-Options": "nosniff",
};

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      ...DEFENSIVE_HEADERS,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

/**
 * Vercel Edge handler
 * @param {Request} request
 */
export default async function handler(request) {
  // Preflight CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { ...CORS_HEADERS, ...DEFENSIVE_HEADERS },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const text = body.text;
    const ctx = body.context || {};
    const federation = ctx.federation || "F6";
    const useCase = ctx.useCase || "general";
    const language = ctx.language || "es-MX";

    if (!text || typeof text !== "string") {
      return jsonResponse({ error: "text is required and must be a string" }, 400);
    }

    // Deterministic hash for cache key
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(`${text}|${federation}|${useCase}|${language}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", textBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const fileName = `${hashHex}.mp3`;

    // Server-side env vars (no VITE_ en Edge)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.ISABELLA_VOICE_BUCKET || "isabella-voice-cache";

    // Si Supabase no está configurado, devolvemos fallback consistente
    if (!supabaseUrl || !supabaseKey) {
      return jsonResponse({
        audioUrl: null,
        mode: "local",
        cacheHit: false,
        message: "Supabase Storage not configured — falling back to Web Speech",
      });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1) Cache lookup usando list() (no existe .exists en Storage) [web:106][web:110]
    const { data: objects, error: listError } = await supabase.storage
      .from(bucketName)
      .list("", { search: fileName, limit: 1 });

    if (listError) {
      // No rompemos el pipeline; reportamos y seguimos
      console.warn("Supabase Storage list error:", listError.message);
    }

    const cacheHit = Array.isArray(objects) && objects.some((obj) => obj.name === fileName);

    if (cacheHit) {
      const { data: signed, error: signedError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 3600);

      if (signedError) {
        console.warn("Supabase Storage signed URL error:", signedError.message);
        // Aunque falle el signed, mantenemos fallback
        return jsonResponse({
          audioUrl: null,
          mode: "local",
          cacheHit: true,
          message: "Cached audio found but signed URL generation failed — falling back to Web Speech",
        });
      }

      return jsonResponse({
        audioUrl: signed?.signedUrl ?? null,
        mode: "cloud",
        cacheHit: true,
      });
    }

    // 2) TODO: Integración con proveedor Cloud TTS (Google, ElevenLabs, modelo abierto, etc.) [web:83][web:112]
    // Aquí iría la llamada al servicio TTS, el upload a Supabase Storage y la creación del signed URL.
    // De momento, devolvemos respuesta neutra para probar el pipeline end-to-end.

    return jsonResponse({
      audioUrl: null,
      mode: "local",
      cacheHit: false,
      message: "Cloud TTS provider not configured — falling back to Web Speech",
    });
  } catch (err) {
    console.error("tts-isabella error:", err);
    return jsonResponse(
      {
        error: err instanceof Error ? err.message : "TTS failed",
        mode: "local",
      },
      500
    );
  }
}

export const config = {
  runtime: "edge",
};
