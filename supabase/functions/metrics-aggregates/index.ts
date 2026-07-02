import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const sinceISO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [places, businesses, events, premium, commerceSubs, tracking, bookings, redemptions, foot] =
      await Promise.all([
        supabase.from("places").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("businesses").select("id", { count: "exact", head: true }).eq("is_active", true).eq("is_subscribed", true),
        supabase.from("events").select("id", { count: "exact", head: true }).eq("is_active", true).gte("starts_at", new Date().toISOString()),
        supabase.from("subscriptions_premium").select("id", { count: "exact", head: true }).eq("status", "activa"),
        supabase.from("commerce_subscriptions").select("id", { count: "exact", head: true }).eq("status", "activa"),
        supabase.from("tracking_events").select("event_type, route, created_at").gte("created_at", sinceISO).limit(1000),
        supabase.from("tour_bookings").select("id, total_paid").gte("created_at", sinceISO),
        supabase.from("reward_redemptions").select("id", { count: "exact", head: true }).gte("redeemed_at", sinceISO),
        supabase.from("foot_traffic").select("place_id, count, recorded_at").gte("recorded_at", sinceISO).limit(500),
      ]);

    const trackingRows = tracking.data ?? [];
    const eventCountsByType: Record<string, number> = {};
    const hourly: Record<string, number> = {};
    for (const row of trackingRows) {
      eventCountsByType[row.event_type] = (eventCountsByType[row.event_type] ?? 0) + 1;
      const hour = new Date(row.created_at).getHours();
      hourly[String(hour)] = (hourly[String(hour)] ?? 0) + 1;
    }

    const bookingsArr = bookings.data ?? [];
    const revenue24h = bookingsArr.reduce((acc, b: any) => acc + Number(b.total_paid ?? 0), 0);

    const footArr = foot.data ?? [];
    const topPlaces: Record<string, number> = {};
    for (const f of footArr) {
      if (!f.place_id) continue;
      topPlaces[f.place_id] = (topPlaces[f.place_id] ?? 0) + Number(f.count ?? 0);
    }

    return new Response(
      JSON.stringify({
        kpis: {
          places_active: places.count ?? 0,
          businesses_verified: businesses.count ?? 0,
          events_upcoming: events.count ?? 0,
          premium_active: premium.count ?? 0,
          commerce_active: commerceSubs.count ?? 0,
          tracking_events_24h: trackingRows.length,
          bookings_24h: bookingsArr.length,
          revenue_24h: revenue24h,
          redemptions_24h: redemptions.count ?? 0,
        },
        breakdown: { event_types: eventCountsByType, hourly_activity: hourly, top_places: topPlaces },
        generated_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
