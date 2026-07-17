import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Crown,
  Store,
  Pickaxe,
  Sparkles,
  ShieldCheck,
  Gift,
  Medal,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

type Tab = "usuarios" | "comercios";

const USER_PLANS = [
  {
    id: "99",
    name: "Veta Soberana · Básico",
    price: "$99",
    period: "MXN/mes",
    tagline: "Acceso a minería digital y bolsa de premios",
    features: [
      "Minería digital en el Subsuelo RDM",
      "Bolsa de premios: pastes, micheladas, tours",
      "Canje de puntos por productos reales",
      "Misiones diarias y semanales",
      "Ranking y logros en la Tabla de Honor",
      "Sin publicidad en la plataforma",
    ],
    accent: "from-gold/20 to-amber-500/5",
    icon: Pickaxe,
  },
  {
    id: "129",
    name: "Veta Soberana · Minero",
    price: "$129",
    period: "MXN/mes",
    tagline: "Minería remota, multiplicadores x2 y misiones avanzadas",
    highlight: true,
    features: [
      "Todo lo del plan Básico",
      "Multiplicador x2 en puntos de juegos",
      "Minería remota desde cualquier lugar",
      "Misiones avanzadas con recompensas exclusivas",
      "Energía y cooldown reducidos en la mina",
      "Acceso prioritario a premios de alto valor (plata, cenas, hospedaje)",
      "Insignia exclusiva de Minero RDM en el perfil",
    ],
    accent: "from-gold/30 to-amber-600/5",
    icon: Crown,
  },
];

const COMMERCE_PLANS = [
  {
    id: "199",
    name: "Comercio Federado · Básico",
    price: "$199",
    period: "MXN/mes",
    tagline: "Digitaliza tu negocio y aparece en el mapa",
    features: [
      "Perfil digital con fotos, horarios y contacto",
      "Ubicación en el mapa interactivo turístico",
      "Analytics básicos: vistas y clics",
      "Botón de WhatsApp directo",
      "Soporte por chat en horario laboral",
    ],
    accent: "from-teal/20 to-cyan-500/5",
    icon: Store,
  },
  {
    id: "299",
    name: "Comercio Federado · Premium",
    price: "$299",
    period: "MXN/mes",
    tagline: "Destaca, atrae jugadores y vende más",
    highlight: true,
    features: [
      "Todo lo del plan Básico",
      "Nodo de Energía: los jugadores recargan en tu local",
      "Prioridad en la bolsa de premios (tus productos aparecen primero)",
      "Catálogo premium con fotos profesionales",
      "Métricas avanzadas: conversión, retención, ticket promedio",
      "Insignia 'Premium' destacada en el directorio",
      "Reporte semanal de rendimiento por email",
    ],
    accent: "from-teal/30 to-cyan-600/5",
    icon: Crown,
  },
];

function getCheckoutFunctionName(planId: string, isCommerce: boolean): string {
  // Punto único para mapear planes → función de Edge, fácil de versionar
  if (isCommerce) return "create-commerce-premium-checkout";
  return "create-user-premium-checkout";
}

export default function PremiumPlans() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("usuarios");
  const [busy, setBusy] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const plans = useMemo(
    () => (tab === "usuarios" ? USER_PLANS : COMMERCE_PLANS),
    [tab],
  );

  const handleActivate = async (planId: string, isCommerce: boolean) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (busy) {
      // Evitar múltiples disparos simultáneos
      return;
    }

    setBusy(planId);

    try {
      if (isCommerce) {
        // Para comercios, se deriva a registro con el plan seleccionado
        navigate(`/registro-comercio?plan=${encodeURIComponent(planId)}`);
        setBusy(null);
        return;
      }

      const fn = getCheckoutFunctionName(planId, isCommerce);

      // Punto de auditoría mínimo: log informativo (idealmente enviar a telemetría backend)
      // eslint-disable-next-line no-console
      console.info("Iniciando checkout premium", {
        userId: user.id,
        planId,
        fn,
      });

      const { data, error } = await supabase.functions.invoke(fn, {
        body: { tier: planId },
      });

      if (error) {
        logger.error("Error en checkout premium:", { error });
        throw new Error(error.message || "Error en la función de pago");
      }

      const url = data?.url;
      if (typeof url !== "string" || !url.startsWith("http")) {
        logger.error("URL de checkout inválida:", { url });
        throw new Error("Respuesta de pago inválida. Intenta más tarde.");
      }

      window.location.href = url;
    } catch (e: unknown) {
      const message =
        (e instanceof Error ? e.message : null) ||
        "No se pudo iniciar el pago. Revisa tu conexión o intenta más tarde.";
      toast.error(message);
      setBusy(null);
    }
  };

  return (
    <MainLayout>
      <SEOMeta
        title="Planes Premium · RDM Digital"
        description="Planes premium para usuarios y comercios en Real del Monte. Desde $99 MXN/mes."
      />
      {/* Hero Banner */}
      <div className="relative h-56 w-full overflow-hidden">
        <img src="/images/artesanias-plata.jpg" alt="Artesanías de plata de Real del Monte" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-3xl font-bold">Planes Premium</h1>
          <p className="text-white/80 mt-1">Desbloquea experiencias exclusivas</p>
        </div>
      </div>
      <section className="pb-24 pt-8">
        <div className="container mx-auto max-w-6xl px-6">
          {/* Header */}
          <motion.div
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }
            }
            animate={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
            }
            className="mb-10 text-center"
          >
            <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-primary">
              DOCUMENTO MAESTRO · Capítulo VII
            </span>
            <h1 className="mb-3 text-4xl font-bold uppercase leading-[0.9] tracking-tighter md:text-5xl">
              <span className="text-gradient-gold">Planes Premium</span>
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground text-sm">
              Elige el plan que mejor se adapte a ti. Los puntos de juegos se
              convierten en premios reales en comercios federados de Real del
              Monte. Los comercios acceden a la red de jugadores y analytics
              territoriales.
            </p>
          </motion.div>

          {/* Tab Switcher */}
          <div className="mx-auto mb-10 flex w-fit rounded-full border border-border/40 bg-card/60 p-1">
            <button
              type="button"
              onClick={() => setTab("usuarios")}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2 text-xs font-mono uppercase tracking-widest transition-all",
                tab === "usuarios"
                  ? "bg-gold/20 text-gold shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Pickaxe className="h-3.5 w-3.5" /> Usuarios
            </button>
            <button
              type="button"
              onClick={() => setTab("comercios")}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2 text-xs font-mono uppercase tracking-widest transition-all",
                tab === "comercios"
                  ? "bg-gold/20 text-gold shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Store className="h-3.5 w-3.5" /> Comercios
            </button>
          </div>

          {/* Plans Grid */}
          <div className="grid gap-6 md:grid-cols-2 mx-auto max-w-4xl">
            {plans.map((plan, i) => {
              const Icon = plan.icon;
              const isHighlight = Boolean(plan.highlight);

              return (
                <motion.div
                  key={plan.id}
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 18 }
                  }
                  animate={
                    prefersReducedMotion
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0 }
                  }
                  transition={
                    prefersReducedMotion
                      ? undefined
                      : { delay: i * 0.08 }
                  }
                  className={cn(
                    "relative overflow-hidden rounded-2xl p-8 border transition-all duration-300 hover:scale-[1.02]",
                    isHighlight
                      ? "glass-gold shadow-gold ring-1 ring-gold/40"
                      : "glass border-border/20 hover:border-gold/30",
                  )}
                >
                  {/* Background gradient */}
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 bg-gradient-to-br",
                      plan.accent,
                    )}
                  />

                  <div className="relative">
                    {isHighlight && (
                      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-body text-[10px] uppercase tracking-widest text-gold">
                        <Sparkles className="h-3 w-3" /> Recomendado
                      </span>
                    )}

                    <div className="mb-1 flex items-center gap-2">
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          isHighlight ? "text-gold" : "text-muted-foreground",
                        )}
                      />
                      <h2 className="font-display text-2xl text-foreground">
                        {plan.name}
                      </h2>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {plan.tagline}
                    </p>

                    <div className="mb-6 flex items-baseline gap-1">
                      <span
                        className={cn(
                          "text-5xl font-display font-bold",
                          isHighlight
                            ? "text-gradient-gold"
                            : "text-foreground",
                        )}
                      >
                        {plan.price}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        /{plan.period}
                      </span>
                    </div>

                    <ul className="mb-8 space-y-3">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-foreground/80"
                        >
                          <Check
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0",
                              isHighlight ? "text-gold" : "text-teal",
                            )}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      type="button"
                      onClick={() =>
                        handleActivate(plan.id, tab === "comercios")
                      }
                      disabled={busy === plan.id}
                      className={cn(
                        "w-full gap-2 h-12 text-sm font-semibold",
                        isHighlight
                          ? "gradient-gold text-primary-foreground shadow-gold hover:shadow-elevated"
                          : "bg-secondary/50 hover:bg-secondary text-foreground",
                      )}
                    >
                      {busy === plan.id ? (
                        "Procesando..."
                      ) : (
                        <>
                          {tab === "comercios"
                            ? "Registrar comercio"
                            : "Activar plan"}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Cross-sell note */}
          <motion.div
            initial={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }
            }
            animate={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
            }
            transition={prefersReducedMotion ? undefined : { delay: 0.4 }}
            className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border/20 bg-card/40 p-6 text-center"
          >
            <Gift className="mx-auto mb-3 h-8 w-8 text-gold" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              ¿Cómo funcionan los puntos?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Juega Memoria Minera y Trivia Territorial para ganar puntos
              canjeables. Los puntos se acreditan automáticamente al completar
              partidas. Canjea tus puntos por pastes, micheladas, joyería de
              plata, cenas románticas, noches de hospedaje y recorridos guiados
              en comercios federados de Real del Monte. Los premios son
              aportados por los propios comercios — la plataforma no retiene
              comisión.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-teal" /> Stock limitado
              </span>
              <span className="flex items-center gap-1">
                <Gift className="h-3 w-3 text-gold" /> Canje inmediato
              </span>
              <span className="flex items-center gap-1">
                <Medal className="h-3 w-3 text-electric" /> Puntos seguros
              </span>
            </div>
          </motion.div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            ¿Dudas? Visita las{" "}
            <Link
              to="/faq"
              className="text-gold underline-offset-2 hover:underline"
            >
              Preguntas Frecuentes
            </Link>
            {" · "}Pago seguro con Stripe · Cancela cuando quieras
          </p>
        </div>
      </section>
    </MainLayout>
  );
}
