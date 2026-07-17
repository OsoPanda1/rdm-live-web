import type { Request } from "@vercel/node";

interface Federation {
  id: string;
  name: string;
}

interface HealthResult {
  status: string;
  latency: number;
  error?: string;
}

interface FederationResult extends HealthResult {
  federation: string;
  name: string;
  logged: boolean;
}

const FEDERATIONS: Federation[] = [
  { id: "F1", name: "Gobernanza" },
  { id: "F2", name: "Identidad y Acceso" },
  { id: "F3", name: "Datos Territoriales" },
  { id: "F4", name: "Comercio y Monetización" },
  { id: "F5", name: "IA y Automatización" },
  { id: "F6", name: "Comunidad y Contenido" },
  { id: "F7", name: "Observabilidad y Seguridad" },
];

const DEFENSIVE_HEADERS: Record<string, string> = {
  "Content-Security-Policy": "default-src 'self'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "Content-Type": "application/json",
};

async function measureSupabaseHealth(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  federationId: string,
): Promise<HealthResult> {
  const started = Date.now();
  const probe = supabase
    .from("federation_health_log")
    .select("checked_at")
    .eq("federation_id", federationId)
    .order("checked_at", { ascending: false })
    .limit(1);

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Supabase health probe timeout")), 4_000);
  });

  try {
    const { error } = await Promise.race([probe, timeout]);
    return {
      status: error ? "degraded" : "healthy",
      latency: Date.now() - started,
      error: error?.message,
    };
  } catch (error) {
    return {
      status: "degraded",
      latency: Date.now() - started,
      error: error instanceof Error ? error.message : "Unknown health probe error",
    };
  }
}

export default async function handler(request: Request): Promise<Response> {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: DEFENSIVE_HEADERS,
    });
  }

  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: DEFENSIVE_HEADERS,
    });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Supabase not configured", status: "degraded" }),
        { status: 200, headers: DEFENSIVE_HEADERS },
      );
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: FederationResult[] = [];
    const timestamp = new Date().toISOString();

    for (const fed of FEDERATIONS) {
      const health = await measureSupabaseHealth(supabase, fed.id);

      const { error } = await supabase.from("federation_health_log").insert({
        federation_id: fed.id,
        federation_name: fed.name,
        status: health.status,
        latency_ms: health.latency,
        checked_at: timestamp,
        source: "cron-vercel",
      });

      results.push({
        federation: fed.id,
        name: fed.name,
        status: health.status,
        latency_ms: health.latency,
        logged: !error,
        error: health.error || error?.message,
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        timestamp,
        federations: results,
        healthy: results.filter((r) => r.status === "healthy").length,
        total: FEDERATIONS.length,
      }),
      { status: 200, headers: DEFENSIVE_HEADERS },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message, status: "error" }),
      { status: 500, headers: DEFENSIVE_HEADERS },
    );
  }
}

export const config = {
  runtime: "edge",
};
