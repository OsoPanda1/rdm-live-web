import { useMemo } from "react";
import { useIsabellaSSE } from "@/hooks/useIsabellaSSE";
import { REAL_DEL_MONTE_SITES } from "@/lib/kernel";
import { fastDistance } from "@/core/geo/haversine.fast";
import { useCivicEvent } from "@/hooks/useCivicEvent";

export function TerritorialMap() {
  const { decision, connectionState } = useIsabellaSSE();
  const emit = useCivicEvent();

  const highlightedSiteId = useMemo(() => {
    if (!decision) return null;

    const nearest = REAL_DEL_MONTE_SITES
      .map((site) => ({ site, distance: fastDistance(decision.coords, { lat: site.lat, lng: site.lng }) }))
      .sort((a, b) => a.distance - b.distance)[0];

    return nearest?.site.id ?? null;
  }, [decision]);

  return (
    <section className="py-10 px-6">
      <div className="max-w-5xl mx-auto rounded-2xl border border-border/50 p-5 bg-card/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">TerritorialMap (SSE en vivo)</h3>
          <p className="text-xs text-muted-foreground">Estado: {connectionState}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {REAL_DEL_MONTE_SITES.slice(0, 6).map((site) => {
            const isFocused = site.id === highlightedSiteId;
            return (
              <article
                key={site.id}
                className={`rounded-xl border p-3 transition cursor-pointer ${isFocused ? "border-accent shadow-[0_0_0_2px_hsl(var(--accent)/0.35)]" : "border-border/50"}`}
                onClick={() =>
                  void emit({
                    type: "TOURISM_INTERACTION",
                    federation: "DEKATEOTL",
                    payload: {
                      id: site.id,
                      name: site.name,
                      category: site.category,
                    },
                    source: "WEB_PORTAL",
                  })
                }
              >
                <p className="text-sm font-medium">{site.name}</p>
                <p className="text-xs text-muted-foreground">{site.category}</p>
                {isFocused && <p className="text-xs text-accent mt-1">Foco activo por decisión GEN-7</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
