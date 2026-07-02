import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const CORS_ORIGINS = [
  "https://www.visitarealdelmonte.online",
  "https://visitarealdelmonte.online",
  "https://rdm-digital-hub.vercel.app",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const allowed = origin && CORS_ORIGINS.includes(origin) ? origin : CORS_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

interface OntologyRequest {
  query: string;
  federationId?: number;
  themeId?: number;
  includeChildren?: boolean;
  includePath?: boolean;
}

interface OntologyResponse {
  node: Record<string, unknown> | null;
  children: Record<string, unknown>[];
  path: Record<string, unknown>[];
  alignment: { index: number; passed: boolean };
  timeUp: { allowed: boolean; reason: string | null };
}

async function verifyUser(req: Request): Promise<{ userId?: string; error?: string }> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return { error: "Missing Authorization header" };

  const [scheme, token] = authHeader.split(" ", 2);
  if (scheme !== "Bearer" || !token) return { error: "Invalid Authorization scheme" };

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return { error: error?.message || "Invalid token" };
    return { userId: user.id };
  } catch {
    return { error: "Auth verification failed" };
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 },
    );
  }

  // Auth check
  const auth = await verifyUser(req);
  if (auth.error) {
    return new Response(
      JSON.stringify({ error: auth.error }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 },
    );
  }

  try {
    const { query, federationId, themeId, includeChildren, includePath }: OntologyRequest =
      await req.json();
    if (!query?.trim()) {
      return new Response(
        JSON.stringify({ error: "query is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: node } = await supabase
      .from("isabella_ontology")
      .select("*")
      .ilike("node_name", `%${query}%`)
      .maybeSingle();

    const response: OntologyResponse = {
      node: node ?? null,
      children: [],
      path: [],
      alignment: { index: 0, passed: false },
      timeUp: { allowed: false, reason: "Node not found" },
    };

    if (!node) {
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const nodeFed = node.federation_id as number;
    const nodeTheme = node.theme_id as number;
    const targetFed = federationId ?? nodeFed;
    const targetTheme = themeId ?? nodeTheme;

    const fedWeight: Record<number, number> = { 1: 0.25, 2: 0.15, 3: 0.20, 4: 0.20, 5: 0.05, 6: 0.10, 7: 0.05 };
    const themeWeight: Record<number, number> = { 1: 0.15, 2: 0.15, 3: 0.10, 4: 0.10, 5: 0.15, 6: 0.10, 7: 0.10, 8: 0.10, 9: 0.05 };

    const alignmentIndex = (fedWeight[nodeFed] ?? 0) * (themeWeight[nodeTheme] ?? 0);
    const timeUpPassed = nodeFed === targetFed || nodeTheme === targetTheme;

    if (includeChildren) {
      const { data: children } = await supabase
        .from("isabella_ontology")
        .select("*")
        .eq("parent_node_id", node.node_id);
      response.children = children ?? [];
    }

    if (includePath) {
      const { data: ancestors } = await supabase.rpc("get_ontology_ancestors", {
        node_uuid: node.node_id,
      });
      response.path = (ancestors ?? []).reverse();
    }

    response.alignment = { index: alignmentIndex, passed: alignmentIndex >= 0.01 };
    response.timeUp = {
      allowed: timeUpPassed,
      reason: timeUpPassed
        ? null
        : `Nodo F${nodeFed}/T${nodeTheme} no coincide con F${targetFed}/T${targetTheme}`,
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
