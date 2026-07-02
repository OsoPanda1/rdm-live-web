// @ts-nocheck
import { motion } from "framer-motion";
import { Zap, Clock, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import Telemetry from "@/modules/control/Telemetry";
import HealthSparkline from "@/modules/control/HealthSparkline";
import AlertsPanel from "@/modules/control/AlertsPanel";
import { useFederationHealth } from "@/modules/control/useFederationHealth";

const statusColor = (s: string) =>
  s === "online" ? "bg-emerald-400 shadow-emerald-400/60"
  : s === "degraded" ? "bg-amber-400 shadow-amber-400/60"
  : "bg-red-500 shadow-red-500/60";

const statusBadge = (s: string) =>
  s === "online" ? "bg-emerald-500/15 text-emerald-400"
  : s === "degraded" ? "bg-amber-500/15 text-amber-400"
  : "bg-red-500/15 text-red-400";

export default function ControlCenter() {
  const { data, loading, error } = useFederationHealth(15000);
  const fed = data?.federations ?? [];
  const sum = data?.summary;
  const integrity = sum?.integrity ?? 0;
  const hasAlerts = fed.some((f) => f.status !== "online");

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
              <Shield className="h-5 w-5 text-gold" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">Control Center · RDM-TOS · Mini-Grafana Soberano</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
            Sistema Operativo <span className="text-gradient-gold italic">Territorial Soberano</span>
          </h1>
          <p className="mt-3 text-sm font-body text-muted-foreground max-w-xl">
            Nodo Cero · Real del Monte. Health-check + histórico + alertas con umbrales auditables, sin dependencias externas.
          </p>
        </motion.div>

        {hasAlerts && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <p className="text-xs font-mono uppercase tracking-wider text-amber-300">
              Alerta: {fed.filter((f) => f.status === "degraded").length} degradadas · {fed.filter((f) => f.status === "offline").length} offline
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Federaciones Online", value: sum ? `${sum.online}/${sum.total}` : "—", icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Latencia Promedio", value: sum ? `${sum.avg_latency_ms}ms` : "—", icon: Zap, color: sum && sum.avg_latency_ms > 300 ? "text-red-500" : "text-electric" },
            { label: "Degradadas", value: sum?.degraded ?? "—", icon: AlertTriangle, color: "text-amber-400" },
            { label: "Offline", value: sum?.offline ?? "—", icon: AlertTriangle, color: "text-red-500" },
            { label: "Última lectura", value: data ? new Date(data.timestamp).toLocaleTimeString("es-MX") : "—", icon: Clock, color: "text-gold" },
          ].map((m) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-4 border border-border/20">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <p className={`mt-2 text-2xl font-display font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{m.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-5 border border-border/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Integridad I_TAMV · últimas 30 lecturas</h2>
            <span className="text-[10px] font-mono text-muted-foreground/60">refresh 15s</span>
          </div>
          <HealthSparkline />
        </div>

        <AlertsPanel />

        <div className="glass-card rounded-2xl p-5 border border-border/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">7 Federaciones TAMV — Estado Real</h2>
            {error && <span className="text-[10px] font-mono text-red-400">{error}</span>}
            {loading && !data && <span className="text-[10px] font-mono text-muted-foreground">Cargando…</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {fed.map((f) => (
              <motion.div key={f.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4 bg-secondary/20 border border-border/20 hover:border-gold/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className={`h-2 w-2 rounded-full ${statusColor(f.status)} shadow-[0_0_8px]`} />
                  <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${statusBadge(f.status)}`}>{f.status}</span>
                </div>
                <p className="font-display text-base text-platinum truncate">{f.name}</p>
                <p className="text-[9px] font-mono uppercase tracking-wider text-gold/60 mt-1">{f.key}</p>
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground">{f.latency_ms}ms</span>
                  <span className="text-emerald-300/80">{f.metric}</span>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground line-clamp-2">{f.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Telemetría e Infraestructura (datos reales)</h2>
          <Telemetry />
        </div>

        <div className="glass-card rounded-2xl p-6 border border-gold/20">
          <p className="text-[11px] font-mono uppercase tracking-widest text-gold mb-2">TAMV-Consensus · Integridad Global</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-border/40 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold to-electric transition-all duration-700" style={{ width: `${integrity * 100}%` }} />
            </div>
            <span className="text-2xl font-display font-bold text-gold">{integrity.toFixed(2)}</span>
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md ${integrity >= 0.85 ? "bg-emerald-500/15 text-emerald-400" : integrity >= 0.5 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>
              {integrity >= 0.85 ? "SOVEREIGN_LOCKED" : integrity >= 0.5 ? "DEGRADED" : "CRITICAL"}
            </span>
          </div>
          <p className="mt-3 text-[10px] font-mono text-muted-foreground">
            I_TAMV = Σ(Wn · σ(Vn) / Δt) × E_Dignity · Estatuto de Dignidad: ✓
          </p>
        </div>
      </div>
    </div>
  );
}