import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { event_type, entity_type, entity_id, payload, route, session_id } = body ?? {};

    if (!event_type || typeof event_type !== "string" || event_type.length > 64) {
      return new Response(JSON.stringify({ error: "event_type required (max 64 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Best-effort user resolution from JWT
    let user_id: string | null = null;
    const auth = req.headers.get("Authorization");
    if (auth?.startsWith("Bearer ")) {
      const { data } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
      user_id = data.user?.id ?? null;
    }

    const { error } = await supabase.from("tracking_events").insert({
      event_type,
      entity_type: entity_type ?? null,
      entity_id: entity_id ?? null,
      payload: payload ?? {},
      route: route ?? null,
      session_id: session_id ?? null,
      user_id,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
