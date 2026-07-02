// @ts-nocheck
import { useDashboardMetrics } from "@/modules/dashboard/hooks/useDashboardMetrics";
import { KpiTile } from "@/modules/dashboard/components/KpiTile";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export function DashboardKpis() {
  const { data, isLoading, error } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-secondary/20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm font-mono text-destructive">
        Error cargando métricas: {(error as Error)?.message ?? "snapshot vacío"}
      </div>
    );
  }

  const { kpis } = data;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-4 w-4 text-gold animate-pulse" />
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          Snapshot · {new Date(data.generated_at).toLocaleTimeString("es-MX")}
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile label="Lugares activos" value={kpis.places_active} icon="🏛️" accent="gold" />
        <KpiTile label="Comercios verificados" value={kpis.businesses_verified} icon="🏪" accent="teal" />
        <KpiTile label="Eventos próximos" value={kpis.events_upcoming} icon="🎭" accent="copper" />
        <KpiTile label="Premium activos" value={kpis.premium_active} icon="👑" accent="gold" />
        <KpiTile label="Comercios pagados" value={kpis.commerce_active} icon="💼" accent="teal" />
        <KpiTile label="Eventos UX (24h)" value={kpis.tracking_events_24h} icon="📡" accent="electric" />
        <KpiTile label="Reservas (24h)" value={kpis.bookings_24h} icon="🎫" accent="copper" />
        <KpiTile label="Ingresos 24h (MXN)" value={`$${kpis.revenue_24h.toLocaleString("es-MX")}`} icon="💰" accent="gold" />
      </div>
      {Object.keys(data.breakdown.event_types).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border/20 bg-card/30 backdrop-blur-sm p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Eventos UX por tipo (24h)
          </p>
          <div className="space-y-2">
            {Object.entries(data.breakdown.event_types).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3 text-xs font-mono">
                <span className="w-32 truncate text-muted-foreground">{type}</span>
                <div className="flex-1 h-1.5 rounded-full bg-secondary/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-copper"
                    style={{ width: `${Math.min(100, (count / Math.max(...Object.values(data.breakdown.event_types))) * 100)}%` }}
                  />
                </div>
                <span className="w-10 text-right text-gold">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}