/**
 * alerts-engine — evalúa el snapshot más reciente de federation_health_log
 * y genera entradas en system_alerts cuando se exceden umbrales.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const THRESHOLDS = {
  latency_ms: 500,
  integrity_min: 0.7,
  max_offline: 0,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: last } = await supa
    .from("federation_health_log")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const generated: Array<{ severity: string; title: string }> = [];

  if (last) {
    if (last.offline_count > THRESHOLDS.max_offline) {
      const offlineFed = (last.snapshot?.federations ?? []).find((f: { status: string }) => f.status === "offline");
      await supa.from("system_alerts").insert({
        severity: "critical",
        federation_key: offlineFed?.key ?? null,
        title: `Federación offline: ${offlineFed?.name ?? "desconocida"}`,
        message: `${last.offline_count} federación(es) sin respuesta. Detalle: ${offlineFed?.detail ?? "n/a"}`,
      });
      generated.push({ severity: "critical", title: "offline" });
    }
    if (Number(last.integrity) < THRESHOLDS.integrity_min) {
      await supa.from("system_alerts").insert({
        severity: "critical",
        federation_key: null,
        title: `Integridad I_TAMV crítica: ${Number(last.integrity).toFixed(2)}`,
        message: `Por debajo del umbral soberano (${THRESHOLDS.integrity_min}). Revisar federaciones degradadas.`,
      });
      generated.push({ severity: "critical", title: "integrity" });
    }
    if (last.avg_latency_ms > THRESHOLDS.latency_ms) {
      await supa.from("system_alerts").insert({
        severity: "warning",
        federation_key: null,
        title: `Latencia elevada: ${last.avg_latency_ms}ms`,
        message: `Promedio supera ${THRESHOLDS.latency_ms}ms. Posible saturación del nodo.`,
      });
      generated.push({ severity: "warning", title: "latency" });
    }
    // dedupe: si el último insert (igual title) tiene <5min, no insertar duplicado
  }

  // Limpieza: marcar como acknowledged alertas más viejas de 1h sin actualización
  await supa
    .from("system_alerts")
    .update({ acknowledged: true })
    .lt("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .eq("acknowledged", false);

  return new Response(JSON.stringify({ ok: true, generated, evaluated_at: new Date().toISOString() }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
