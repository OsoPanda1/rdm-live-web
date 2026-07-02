// @ts-nocheck
import { motion } from "framer-motion";
import { Store, Check, ArrowRight, Crown, Building2, Sparkles } from "lucide-react";
import { b2bPlans } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const sectorBenefits: Record<string, string[]> = {
  "Hoteles": ["Reservas directas sin OTA", "Analítica de visitantes", "Dashboard de estancias"],
  "Bares": ["Happy Hour Digital geolocalizado", "Alertas de eventos en tiempo real"],
  "Pasterías/Platerías": ["Nodo de Energía para jugadores", "Métricas de conversión territorial"],
  "Artesanías": ["Catálogo digital premium", "WhatsApp Business integrado"],
  "Tiendas": ["Digitalización micro-negocio", "Analytics de ticket promedio"],
  "Góndolas/Semifijos": ["Geolocalización en mapa turístico", "Ubicación dinámica en tiempo real"],
};

export default function B2BPortal() {
  return (
    <div className="space-y-8 max-w-[1400px]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Economía Local
        </p>
        <h1 className="text-4xl font-display font-bold tracking-tight">Federación Comercial B2B</h1>
        <p className="text-sm font-body text-muted-foreground mt-1">
          Planes de suscripción sectorial para comercios de Real del Monte
        </p>
      </motion.div>

      {/* Plans grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {b2bPlans.map((plan) => {
          const isTopTier = plan.sector === "Hoteles";
          return (
            <motion.div
              key={plan.sector}
              variants={item}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={cn(
                "relative rounded-2xl p-7 transition-all duration-300 cursor-pointer",
                isTopTier
                  ? "glass-gold shadow-gold"
                  : "glass hover:border-gold/20"
              )}
            >
              {isTopTier && (
                <div className="absolute top-4 right-4">
                  <Crown className="h-5 w-5 text-gold animate-pulse-gold" />
                </div>
              )}

              <div className="text-4xl mb-5">{plan.icon}</div>
              <h3 className="text-2xl font-display font-bold">{plan.sector}</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-4xl font-display font-bold text-gradient-gold">${plan.price}</span>
                <span className="text-xs font-body text-muted-foreground">MXN/mes</span>
              </div>
              <p className="mt-2 text-[11px] font-mono text-muted-foreground">
                {plan.businesses} comercios activos
              </p>

              <div className="divider-gold my-5" />

              <div className="space-y-3">
                {(sectorBenefits[plan.sector] || []).map((benefit) => (
                  <Benefit key={benefit} text={benefit} />
                ))}
              </div>

              <Button
                className={cn(
                  "mt-6 w-full rounded-xl h-11 text-[13px] font-semibold transition-all duration-300",
                  isTopTier
                    ? "gradient-gold text-primary-foreground shadow-gold hover:shadow-elevated"
                    : "bg-secondary/50 hover:bg-secondary text-foreground"
                )}
              >
                Suscribirse <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* DAO Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-teal rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(174 62% 47%), transparent 70%)' }} />
        <div className="relative z-10 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/10">
            <Building2 className="h-6 w-6 text-teal" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold text-teal">Gobernanza DAO RDM</h3>
            <p className="mt-2 text-sm font-body text-muted-foreground leading-relaxed max-w-2xl">
              Las cuotas, beneficios y reglas comerciales son ajustadas por la DAO de Real del Monte,
              sin modificar la arquitectura base TAMV. Los ingresos se liquidan y reportan en dashboards específicos de RDM,
              garantizando soberanía económica total del territorio.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald/10">
        <Check className="h-3 w-3 text-emerald" />
      </div>
      <span className="text-[12px] font-body text-secondary-foreground">{text}</span>
    </div>
  );
}