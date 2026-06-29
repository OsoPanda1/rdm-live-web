import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity, Shield, Eye, Cpu, Sparkles, Network } from "lucide-react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import SEOMeta from "@/components/SEOMeta";
import {
  SENTINELS_MIRROR,
  RADARS_MIRROR,
  NODES_MIRROR,
  CLUSTER_LABEL,
} from "@/data/tenochtitlan-data";

const STATUS_COLOR: Record<string, string> = {
  online: "hsl(var(--gold))",
  degraded: "hsl(var(--electric))",
  alert: "hsl(var(--terracotta))",
  offline: "hsl(var(--muted-foreground))",
};

const Tenochtitlan = () => {
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const clusters = useMemo(() => {
    const set = new Set(NODES_MIRROR.map((n) => n.cluster));
    return ["all", ...Array.from(set)];
  }, []);
  const filteredNodes = useMemo(
    () =>
      selectedCluster === "all"
        ? NODES_MIRROR
        : NODES_MIRROR.filter((n) => n.cluster === selectedCluster),
    [selectedCluster]
  );
  const onlineSentinels = SENTINELS_MIRROR.filter((s) => s.status === "online").length;
  const avgHealth = Math.round(
    NODES_MIRROR.reduce((acc, n) => acc + n.health, 0) / NODES_MIRROR.length
  );
  const totalDetections = RADARS_MIRROR.reduce((a, r) => a + r.detections, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOMeta
        title="System Tenochtitlán · Kernel Soberano"
        description="Dashboard en vivo del Sistema Tenochtitlán: 9 centinelas, 6 radares y 48 nodos funcionales del Nodo Cero RDM Digital."
        url="/tenochtitlan"
      />
      <NavBar />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-[hsl(var(--gold))] transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> Volver al portal
        </Link>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden border border-[hsl(var(--gold))]/20 p-10 md:p-14 mb-12"
          style={{
            background:
              "linear-gradient(135deg, hsla(220,40%,5%,0.95), hsla(220,30%,8%,0.85))",
          }}
        >
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🜂</span>
              <span className="font-body text-[10px] tracking-[0.4em] uppercase text-[hsl(var(--gold))]/70">
                Nodo Cero · Kernel Soberano
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl tracking-tight mb-4 text-gradient-gold">
              System Tenochtitlán
            </h1>
            <p className="font-body text-base md:text-lg text-foreground/75 max-w-3xl mb-8 leading-relaxed">
              Capital lógica de RDM Digital. Orquesta los <strong>9 centinelas</strong>
              {" "}del panteón TAMV, los <strong>6 radares</strong> en vigilancia continua y los
              {" "}<strong>48 nodos funcionales</strong> que sostienen el doble pipeline hexagonal,
              {" "}MD-X4 render, BookPI, ID-NVIDA y la Constitución TAMV-DM-X4.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: "Centinelas online", value: `${onlineSentinels}/${SENTINELS_MIRROR.length}` },
                { icon: Eye, label: "Detecciones radar", value: totalDetections.toLocaleString() },
                { icon: Cpu, label: "Salud promedio", value: `${avgHealth}%` },
                { icon: Network, label: "Nodos funcionales", value: NODES_MIRROR.length.toString() },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-[hsl(var(--gold))]/15 bg-background/40 p-4">
                  <kpi.icon className="w-4 h-4 text-[hsl(var(--gold))] mb-2" />
                  <div className="font-display text-2xl text-foreground">{kpi.value}</div>
                  <div className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">{kpi.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Sentinels */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-4 h-4 text-[hsl(var(--gold))]" />
            <h2 className="font-display text-2xl md:text-3xl">Panteón Centinela</h2>
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">9 sistemas activos</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SENTINELS_MIRROR.map((s, i) => (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="rounded-2xl border border-[hsl(var(--gold))]/15 bg-background/50 p-5 hover:border-[hsl(var(--gold))]/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.glyph}</span>
                    <div>
                      <h3 className="font-display text-base leading-tight">{s.name}</h3>
                      <span className="font-body text-[9px] tracking-[0.25em] uppercase text-muted-foreground">{s.id}</span>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 font-body text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-full"
                    style={{ background: `${STATUS_COLOR[s.status]}15`, color: STATUS_COLOR[s.status] }}
                  >
                    <Activity className="w-2.5 h-2.5" /> {s.status}
                  </span>
                </div>
                <p className="font-body text-xs text-foreground/70 leading-relaxed mb-4">{s.mission}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">Carga</span>
                  <span className="font-mono text-xs text-foreground/80">{s.load}%</span>
                </div>
                <div className="h-1 rounded-full bg-[hsl(var(--gold))]/10 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.load}%`, background: STATUS_COLOR[s.status] }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.powers.map((p) => (
                    <span key={p} className="font-body text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border border-[hsl(var(--gold))]/20 text-[hsl(var(--gold))]/80">
                      {p}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Radars */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-4 h-4 text-[hsl(var(--electric))]" />
            <h2 className="font-display text-2xl md:text-3xl">Radares Activos</h2>
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Ojo de Ra · Quetzalcóatl · MOS · Dekateotl · Laberinto</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RADARS_MIRROR.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="rounded-2xl border border-[hsl(var(--electric))]/15 bg-background/50 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-base">{r.codename}</h3>
                  <span className="font-body text-[9px] tracking-[0.2em] uppercase text-[hsl(var(--electric))]/70">{r.scope}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <div className="font-display text-xl">{r.detections}</div>
                    <div className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">detecciones</div>
                  </div>
                  <div>
                    <div className="font-display text-xl text-[hsl(var(--terracotta))]">{r.anomalies}</div>
                    <div className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">anomalías</div>
                  </div>
                  <div>
                    <div className="font-display text-xl">{r.coverage}%</div>
                    <div className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">cobertura</div>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-[hsl(var(--electric))]/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.coverage}%` }}
                    transition={{ duration: 1.2, delay: 0.2 + i * 0.05 }}
                    className="h-full rounded-full"
                    style={{ background: "hsl(var(--electric))" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 48 Nodes */}
        <section className="mb-16">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Network className="w-4 h-4 text-[hsl(var(--gold))]" />
            <h2 className="font-display text-2xl md:text-3xl">48 Nodos Funcionales</h2>
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Filtra por clúster</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {clusters.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCluster(c)}
                className={`px-3 py-1.5 rounded-full font-body text-[10px] tracking-[0.2em] uppercase transition-colors border ${
                  selectedCluster === c
                    ? "bg-[hsl(var(--gold))]/15 border-[hsl(var(--gold))]/50 text-[hsl(var(--gold))]"
                    : "border-[hsl(var(--gold))]/15 text-muted-foreground hover:border-[hsl(var(--gold))]/30"
                }`}
              >
                {c === "all" ? "Todos" : CLUSTER_LABEL[c] ?? c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredNodes.map((n, i) => (
              <motion.div
                key={n.code}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i, 24) * 0.02 }}
                className="rounded-xl border border-[hsl(var(--gold))]/12 bg-background/40 p-4 hover:border-[hsl(var(--gold))]/35 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] tracking-wider text-[hsl(var(--gold))]/70">{n.code}</span>
                  <span className="font-mono text-[10px] text-foreground/70">{n.health}%</span>
                </div>
                <h3 className="font-display text-sm leading-tight mb-1">{n.name}</h3>
                <p className="font-body text-[10px] text-muted-foreground leading-snug mb-3">{n.description}</p>
                <div className="h-1 rounded-full bg-[hsl(var(--gold))]/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${n.health}%`,
                      background: n.health > 90 ? "hsl(var(--gold))" : n.health > 75 ? "hsl(var(--electric))" : "hsl(var(--terracotta))",
                    }}
                  />
                </div>
                <span className="inline-block mt-3 font-body text-[8px] tracking-[0.25em] uppercase text-[hsl(var(--gold))]/60">
                  {CLUSTER_LABEL[n.cluster] ?? n.cluster}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section className="rounded-2xl border border-[hsl(var(--gold))]/15 p-8 bg-background/40">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-4 h-4 text-[hsl(var(--gold))]" />
            <h2 className="font-display text-2xl">Doble Pipeline Hexagonal</h2>
          </div>
          <p className="font-body text-sm text-foreground/70 leading-relaxed mb-6 max-w-3xl">
            Cada solicitud entra por el API Gateway, se replica en los gemelos <strong>MOS-A</strong> y
            {" "}<strong>MOS-B</strong>, ambos consultan el kernel Isabella DMX4, y el <strong>Consensor</strong>
            {" "}compara hashes SHA-256 de cada respuesta antes de servirla. Cualquier divergencia
            {" "}se sella en <strong>BookPI</strong> y notifica a <strong>Anubis</strong>, <strong>Horus</strong>
            {" "}y <strong>Dekateotl</strong>.
          </p>
          <pre className="font-mono text-[11px] leading-relaxed text-foreground/80 bg-background/60 rounded-xl p-5 overflow-x-auto border border-[hsl(var(--gold))]/10">{`
                 ┌──────────────────────┐
   request ─►   │   API Gateway        │
                 └─────────┬────────────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
         ┌────────────┐        ┌────────────┐
         │   MOS-A    │        │   MOS-B    │
         │  (hex-A)   │        │  (hex-B)   │
         └────┬───────┘        └────┬───────┘
              │                     │
              ▼                     ▼
         ┌──────────────────────────────┐
         │    Isabella DMX4 Kernel      │
         │  · TAMVAI · Chronus · MD-X4  │
         └────────────┬─────────────────┘
                      ▼
               ┌─────────────┐
               │  Consensor  │ ── SHA-256 == SHA-256 ?
               └──────┬──────┘
                      ▼
        ┌──────────────────────────┐
        │   BookPI (hash-chained)  │
        └──────────┬───────────────┘
                   ▼
   ┌────────────┬──────────┬──────────────┐
   │  Anubis    │  Horus   │  Dekateotl   │
   └────────────┴──────────┴──────────────┘
`}</pre>
        </section>
      </main>

      <FooterSection />
    </div>
  );
};

export default Tenochtitlan;
