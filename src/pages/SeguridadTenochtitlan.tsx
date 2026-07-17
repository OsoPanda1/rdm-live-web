import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, Lock, Users, Fingerprint, ChevronRight, Zap, AlertTriangle, Cpu, Network, Radar, Activity } from "lucide-react";
import { WikiPage } from "@/components/WikiPage";
import { Section, InfoBox } from "@/components/WikiElements";
import { useSystemMode } from "@/hooks/useSystemMode";

/* ── Centinelas Data ── */
const centinelas = [
  {
    id: "anubis",
    name: "ANUBIS CENTINEL",
    subtitle: "Sistema Primario de Defensa",
    capas: 4,
    totalCapas: "4 capas encriptadas obligatorias",
    icon: Shield,
    color: "hsl(210,100%,55%)",
    gradient: "linear-gradient(135deg, hsl(210,100%,55%), hsl(210,80%,40%))",
    items: [
      "Identidad criptográfica (DID + claves rotativas)",
      "Análisis de tráfico y comportamiento en tiempo real",
      "Control de acceso por propósito (RBAC + ABAC)",
      "Registro probatorio inmutable (blockchain-backed)",
    ],
    description: "Primera línea de defensa. Siempre activo. Protege todas las comunicaciones, identidades y accesos del ecosistema RDM Digital.",
  },
  {
    id: "horus",
    name: "HORUS CENTINEL",
    subtitle: "Standby Evolutivo",
    capas: 10,
    totalCapas: "6+2+2 capas de protección",
    icon: Eye,
    color: "hsl(43,80%,55%)",
    gradient: "linear-gradient(135deg, hsl(43,80%,55%), hsl(35,70%,40%))",
    items: [
      "Arquitectura independiente de ANUBIS",
      "Modelos de amenaza actualizados con IA",
      "Activación solo con aprobación humana",
      "Redundancia total ante fallo primario",
    ],
    description: "Centinela de respaldo evolutivo. Opera de forma autónoma e independiente. Se activa cuando ANUBIS detecta compromiso o fallo sistémico.",
  },
  {
    id: "dekateotl",
    name: "DEKATEOTL",
    subtitle: "Orquestación Suprema",
    capas: 11,
    totalCapas: "11 capas de verificación",
    icon: Cpu,
    color: "hsl(145,50%,50%)",
    gradient: "linear-gradient(135deg, hsl(145,50%,50%), hsl(160,40%,35%))",
    items: [
      "Consenso mínimo requerido entre centinelas",
      "Kill-Switch ético con supervisión humana",
      "Cumplimiento constitucional y normativo",
      "Coordinación de todos los centinelas",
    ],
    description: "Orquestador supremo del sistema. Coordina decisiones entre centinelas, requiere consenso humano para acciones críticas.",
  },
  {
    id: "aztekgods",
    name: "AZTEK GODS",
    subtitle: "Standby Absoluto — Última Línea",
    capas: 22,
    totalCapas: "22 capas para continuidad civilizatoria",
    icon: Zap,
    color: "hsl(0,70%,55%)",
    gradient: "linear-gradient(135deg, hsl(0,70%,55%), hsl(350,60%,40%))",
    items: [
      "Última línea de defensa — activación ante catástrofe",
      "Preservación del núcleo inmortal del ecosistema",
      "Recuperación autónoma del sistema completo",
      "Protocolos de continuidad civilizatoria",
    ],
    description: "Protocolo de último recurso. Se activa únicamente ante catástrofe total del sistema. Preserva la esencia digital de RDM para generaciones futuras.",
  },
];

const radares = [
  { icon: Radar, name: "QUETZALCOATL", desc: "Anti-fraude económico — detecta patrones de lavado y manipulación", color: "hsl(210,100%,55%)" },
  { icon: Eye, name: "OJO DE RA", desc: "Anti-contenido ilegal — no censura ideas, protege dignidad", color: "hsl(43,80%,55%)" },
  { icon: Users, name: "MOS GEMELOS", desc: "Validación cruzada — A valida, B cuestiona, consenso decide", color: "hsl(145,50%,50%)" },
];

const securityMetrics = [
  { label: "Detección", value: "< 1s", icon: Zap },
  { label: "Falsos Positivos", value: "< 0.1%", icon: Shield },
  { label: "Cobertura", value: "99.9%", icon: Network },
  { label: "Resolución", value: "< 1 hora", icon: AlertTriangle },
];

/* ── Interactive Layer Visualization ── */
function LayerRings({ activeCentinel }: { activeCentinel: string | null }) {
  const active = centinelas.find(c => c.id === activeCentinel);
  const layers = active ? active.capas : 4;

  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Core */}
      <motion.div
        className="absolute inset-0 m-auto w-16 h-16 rounded-full flex items-center justify-center z-10"
        style={{ background: active?.gradient || "linear-gradient(135deg, hsl(210,100%,55%), hsl(210,80%,40%))" }}
        animate={{ scale: [1, 1.1, 1], boxShadow: [`0 0 20px ${active?.color || "hsl(210,100%,55%)"}40`, `0 0 40px ${active?.color || "hsl(210,100%,55%)"}60`, `0 0 20px ${active?.color || "hsl(210,100%,55%)"}40`] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Lock className="w-6 h-6 text-white" />
      </motion.div>

      {/* Layer rings */}
      {Array.from({ length: Math.min(layers, 8) }).map((_, i) => {
        const size = 48 + (i + 1) * 26;
        const delay = i * 0.15;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              border: `1px solid`,
              borderColor: `${active?.color || "hsl(210,100%,55%)"}${Math.max(15, 50 - i * 5).toString(16).padStart(2, '0')}`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, duration: 0.4, ease: "easeOut" }}
          />
        );
      })}

      {/* Layer count label */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold tracking-wider" style={{ color: active?.color || "hsl(210,100%,55%)" }}>
        {layers} CAPAS
      </div>
    </div>
  );
}

/* ── Main Component ── */
const SystemModeBadge = () => {
  const { mode, aiDecision } = useSystemMode(15000);
  const config = {
    NORMAL: { color: "hsl(145,50%,50%)", label: "NOMINAL", bg: "hsla(145,50%,50%,0.1)" },
    SAFE: { color: "hsl(43,80%,55%)", label: "MODO SEGURO", bg: "hsla(43,80%,55%,0.1)" },
    EMERGENCY: { color: "hsl(0,70%,55%)", label: "EMERGENCIA", bg: "hsla(0,70%,55%,0.1)" },
  }[mode];

  return (
    <motion.div
      className="rounded-xl border p-4 flex items-center gap-3"
      style={{ borderColor: `${config.color}40`, background: config.bg }}
      animate={{ borderColor: [`${config.color}40`, `${config.color}80`, `${config.color}40`] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{ background: config.color }}
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <div>
        <div className="text-xs font-bold tracking-wider" style={{ color: config.color }}>{config.label}</div>
        <div className="text-[10px] text-muted-foreground">
          {aiDecision ? aiDecision.reasoning : "Sistema operando correctamente"}
        </div>
      </div>
      <Activity className="w-4 h-4 ml-auto" style={{ color: config.color }} />
    </motion.div>
  );
};

const SeguridadTenochtitlan = () => {
  const [activeCentinel, setActiveCentinel] = useState<string | null>("anubis");

  return (
    <WikiPage
      title="Sistema TENOCHTITLAN"
        subtitle="Arquitectura Defensiva Avanzada — Seguridad Multicapa Civilizatoria"
      >
        {/* Hero Banner */}
        <div className="relative h-48 w-full overflow-hidden">
          <img src="/images/iglesia.jpg" alt="Iglesia de Real del Monte" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        {/* Live System Mode */}
        <SystemModeBadge />

      <InfoBox type="warning" title="Principio Fundamental">
        "TAMV no se defiende atacando. Se defiende siendo imposible de capturar."
      </InfoBox>

      {/* Interactive Sentinel Visualization */}
      <Section title="Arquitectura de Centinelas" icon={Shield}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Centinel selector */}
          <div className="space-y-3">
            {centinelas.map((c, i) => {
              const Icon = c.icon;
              const isActive = activeCentinel === c.id;
              return (
                <motion.button
                  key={c.id}
                  onClick={() => setActiveCentinel(c.id)}
                  className="w-full text-left rounded-xl p-4 transition-all border"
                  style={{
                    background: isActive ? `${c.color}12` : "transparent",
                    borderColor: isActive ? `${c.color}40` : "hsla(0,0%,100%,0.06)",
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.gradient }}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: isActive ? c.color : "hsl(0,0%,85%)" }}>{c.name}</span>
                        {isActive && <ChevronRight className="w-4 h-4" style={{ color: c.color }} />}
                      </div>
                      <span className="text-xs text-muted-foreground">{c.subtitle} — {c.totalCapas}</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Visualization panel */}
          <div className="rounded-2xl border border-border/30 p-8" style={{ background: "hsla(220,40%,8%,0.5)" }}>
            <AnimatePresence mode="wait">
              {activeCentinel && (() => {
                const c = centinelas.find(x => x.id === activeCentinel)!;
                const Icon = c.icon;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <LayerRings activeCentinel={activeCentinel} />
                    <div className="pt-8">
                      <h3 className="font-bold text-lg mb-2" style={{ color: c.color }}>{c.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{c.description}</p>
                      <ul className="space-y-2">
                        {c.items.map((item, j) => (
                          <motion.li
                            key={item}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + j * 0.08 }}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: c.color }} />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </Section>

      {/* Radares */}
      <Section title="Radares Especializados" icon={Radar}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {radares.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border/30 p-5"
                style={{ background: "hsla(220,40%,8%,0.5)" }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `${r.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: r.color }} />
                </div>
                <div className="font-bold text-sm mb-1" style={{ color: r.color }}>{r.name}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{r.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Guardianía Humana */}
      <Section title="Guardianía Humana" icon={Users}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["Técnico", "Ético", "Legal", "Económico"].map((tipo, i) => (
            <motion.div
              key={tipo}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border/30 p-4 text-center"
              style={{ background: "hsla(210,100%,55%,0.05)" }}
            >
              <div className="text-sm font-bold text-foreground">Guardián {tipo}</div>
              <div className="text-xs text-muted-foreground mt-1">Supervisión paralela</div>
            </motion.div>
          ))}
        </div>
        <InfoBox type="info">
          Ninguna IA tiene autoridad final. Todas las decisiones críticas requieren supervisión humana redundante.
        </InfoBox>
      </Section>

      {/* Security Config */}
      <Section title="Configuración de Seguridad" icon={Lock}>
        <div className="rounded-xl border border-border/30 p-6 font-mono text-xs space-y-4" style={{ background: "hsla(220,40%,8%,0.5)" }}>
          <div>
            <div className="text-muted-foreground mb-1"># Encriptación</div>
            <div><span style={{ color: "hsl(210,100%,60%)" }}>at_rest:</span> AES-256</div>
            <div><span style={{ color: "hsl(210,100%,60%)" }}>in_transit:</span> TLS 1.3</div>
            <div><span style={{ color: "hsl(210,100%,60%)" }}>key_rotation:</span> 90 días</div>
            <div><span style={{ color: "hsl(210,100%,60%)" }}>pqc_migration:</span> lattice-based (CRYSTALS-Kyber)</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1"># Autenticación</div>
            <div><span style={{ color: "hsl(43,80%,55%)" }}>method:</span> DID + JWT</div>
            <div><span style={{ color: "hsl(43,80%,55%)" }}>mfa:</span> obligatorio</div>
            <div><span style={{ color: "hsl(43,80%,55%)" }}>session_timeout:</span> 1 hora</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1"># Autorización</div>
            <div><span style={{ color: "hsl(145,50%,50%)" }}>model:</span> RBAC + ABAC</div>
            <div><span style={{ color: "hsl(145,50%,50%)" }}>principle:</span> least privilege</div>
            <div><span style={{ color: "hsl(145,50%,50%)" }}>quantum_aware:</span> true</div>
          </div>
        </div>
      </Section>

      {/* Metrics */}
      <Section title="Métricas de Seguridad" icon={Fingerprint}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {securityMetrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border/30 p-5 text-center"
                style={{ background: "hsla(220,40%,8%,0.5)" }}
              >
                <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: "hsl(210,100%,60%)" }} />
                <div className="text-xl font-bold" style={{ color: "hsl(210,100%,60%)" }}>{m.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Audit Results */}
      <Section title="Resultados de Auditoría Extrema (Stress Test)" icon={Activity}>
        <p className="text-muted-foreground text-sm mb-4">
          El sistema fue sometido a pruebas de estrés con 65,000 usuarios concurrentes. Resultados certificados por el protocolo BookPI™.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Componente</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Resistencia</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">% Fallo</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Calificación</th>
              </tr>
            </thead>
            <tbody>
              {[
                { comp: "Núcleo Isabella (IA)", res: "99.8%", fallo: "0.2%", cal: "EXCELENTE", color: "hsl(145,50%,50%)" },
                { comp: "Directorio Comercial", res: "94.5%", fallo: "5.5%", cal: "ÓPTIMO", color: "hsl(210,100%,60%)" },
                { comp: "Micro-Presentaciones", res: "88.0%", fallo: "12.0%", cal: "MEJORABLE", color: "hsl(43,80%,55%)" },
                { comp: "Motor de Pagos", res: "100.0%", fallo: "0.0%", cal: "SÓLIDO", color: "hsl(145,50%,50%)" },
              ].map((row) => (
                <tr key={row.comp} className="border-b border-border/20">
                  <td className="py-2.5 px-3 text-foreground font-medium">{row.comp}</td>
                  <td className="py-2.5 px-3 text-center" style={{ color: row.color }}>{row.res}</td>
                  <td className="py-2.5 px-3 text-center text-muted-foreground">{row.fallo}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-xs tracking-wider" style={{ color: row.color }}>{row.cal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-lg border border-border/30 p-4" style={{ background: "hsla(145,50%,50%,0.08)" }}>
          <p className="text-sm font-semibold" style={{ color: "hsl(145,50%,50%)" }}>DIAGNÓSTICO: RDM-TOS es ANTI-FRÁGIL</p>
          <p className="text-xs text-muted-foreground mt-1">
            Al forzarlo al máximo, el código no solo no se rompió, sino que Isabella aprendió a priorizar
            el contenido textual sobre el visual para mantener la operatividad del territorio.
          </p>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Código de Validación: <span className="font-mono text-foreground">RDM-AUD-GOV-2026</span></p>
          <p>Clasificación: Documento Técnico Institucional · TAMV Enterprise — Todos los derechos reservados, 2026</p>
        </div>
      </Section>
    </WikiPage>
  );
};

export default SeguridadTenochtitlan;
