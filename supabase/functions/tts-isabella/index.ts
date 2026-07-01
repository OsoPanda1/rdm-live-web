// supabase/functions/tts-isabella/index.ts
// Cloud TTS Edge Function — Isabella Voice Engine
// Cache lookup → SSML builder → Cloud TTS → Storage → Signed URL

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SSML_PROFILES: Record<string, { rate: string; pitch: string; break_: string }> = {
  F1: { rate: "slow", pitch: "-2%", break_: "400ms" },
  F2: { rate: "medium", pitch: "0%", break_: "300ms" },
  F3: { rate: "medium", pitch: "+1%", break_: "300ms" },
  F4: { rate: "fast", pitch: "+2%", break_: "200ms" },
  F5: { rate: "medium", pitch: "+1%", break_: "300ms" },
  F6: { rate: "slow", pitch: "-1%", break_: "500ms" },
  F7: { rate: "slow", pitch: "-2%", break_: "400ms" },
};

function buildSsml(text: string, federation: string): string {
  const profile = SSML_PROFILES[federation] || SSML_PROFILES.F6;
  return `<?xml version="1.0"?>
<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-MX">
  <prosody rate="${profile.rate}" pitch="${profile.pitch}">
    ${text}
    <break time="${profile.break_}"/>
  </prosody>
</speak>`;
}

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const text: string = body.text;
    const context = body.context || {};
    const federation: string = context.federation || "F6";
    const useCase: string = context.useCase || "general";
    const language: string = context.language || "es-MX";

    if (!text) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ssml = buildSsml(text, federation);
    const cacheKey = await sha256(text + federation + language);
    const fileName = `${cacheKey}.mp3`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Cache lookup
    const { data: existingFiles } = await supabase.storage
      .from("isabella-voice-cache")
      .list("", { search: fileName });

    if (existingFiles && existingFiles.length > 0) {
      const { data: urlData } = await supabase.storage
        .from("isabella-voice-cache")
        .createSignedUrl(fileName, 3600);

      // Log cache hit
      await supabase.from("isabella_voice_logs").insert({
        original_text: text,
        ssml_applied: ssml,
        tts_provider: "cache",
        voice_model: "cached",
        ssml_profile: federation,
        audio_url: urlData?.signedUrl || null,
        cache_hit: true,
        latency_ms: 0,
        status: "success",
        federation_id: federation,
      }).catch(() => {});

      return new Response(JSON.stringify({
        audioUrl: urlData?.signedUrl || null,
        mode: "cloud",
        cacheHit: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Integrate Google Cloud TTS or ElevenLabs
    // const ttsApiKey = Deno.env.get("GOOGLE_TTS_API_KEY");
    // const ttsRes = await fetch(
    //   `https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsApiKey}`,
    //   {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       input: { ssml },
    //       voice: { languageCode: "es-MX", name: "es-MX-Wavenet-B" },
    //       audioConfig: { audioEncoding: "MP3" },
    //     }),
    //   }
    // );
    // const ttsData = await ttsRes.json();
    // const audioContent = ttsData.audioContent;
    // const audioBuffer = Uint8Array.from(atob(audioContent), (c) => c.charCodeAt(0));
    // await supabase.storage.from("isabella-voice-cache").upload(fileName, audioBuffer, {
    //   contentType: "audio/mpeg",
    //   upsert: true,
    // });

    // Return fallback to local mode when no TTS provider configured
    return new Response(JSON.stringify({
      audioUrl: null,
      mode: "local",
      cacheHit: false,
      message: "Cloud TTS provider not configured",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : "TTS failed",
      mode: "local",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
