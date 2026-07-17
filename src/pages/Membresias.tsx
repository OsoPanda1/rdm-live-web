import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Crown, Pickaxe, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free",
    name: "Explorador",
    price: "Gratis",
    tagline: "Descubre Real del Monte",
    accent: "from-cyan-300/20 to-cyan-500/5",
    features: [
      "Acceso a historia, mitos y rutas",
      "Mapa interactivo con geolocalización",
      "Catálogo de comercios locales",
      "Muro de comunidad",
    ],
  },
  {
    id: "miner",
    name: "Minero RDM",
    price: "$129 MXN/mes",
    tagline: "Mina, acumula y canjea",
    accent: "from-amber-300/30 to-amber-500/5",
    highlight: true,
    features: [
      "Todo lo del plan Explorador",
      "Acceso completo a la Mina ⛏️",
      "Acumula minerales y puntos",
      "Canjea por productos reales: pastes, plata, hospedaje, cenas",
      "Energía y recompensas exclusivas",
    ],
  },
];

export default function Membresias() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("game_memberships")
      .select("status,current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();
    setActive(!!(data?.status === "active" && data.current_period_end && new Date(data.current_period_end) > new Date()));
  }, [user]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const activate = async () => {
    if (!user) { navigate("/auth"); return; }
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("rdm-membership-activate");
    setBusy(false);
    if (error) return toast.error("No se pudo activar la membresía");
    if (data?.membership) { toast.success("¡Membresía minera activada por 30 días!"); loadStatus(); }
  };

  return (
    <MainLayout>
      <SEOMeta title="Membresías · RDM Digital" description="Elige tu plan en Real del Monte: explora gratis o conviértete en Minero RDM y canjea puntos por productos reales." />
      {/* Hero Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src="/images/mine-entrance.jpg" alt="Entrada de la mina de Real del Monte" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <section className="pb-20 pt-8">
        <div className="container mx-auto max-w-5xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
            <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-primary">Plano II · Servicios</span>
            <h1 className="mb-3 text-4xl font-bold uppercase leading-[0.9] tracking-tighter md:text-5xl">
              <span className="text-gradient-cyan">Membresías</span>
            </h1>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Apoya la digitalización del pueblo y vive una experiencia más profunda. La membresía minera impulsa a los negocios locales.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`glass-surface-strong relative overflow-hidden p-7 ${plan.highlight ? "ring-1 ring-amber-300/40" : ""}`}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${plan.accent}`} />
                <div className="relative">
                  {plan.highlight && (
                    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 font-body text-[10px] uppercase tracking-widest text-amber-200">
                      <Sparkles className="h-3 w-3" /> Recomendado
                    </span>
                  )}
                  <div className="mb-1 flex items-center gap-2">
                    {plan.highlight ? <Crown className="h-5 w-5 text-amber-300" /> : <Pickaxe className="h-5 w-5 text-cyan-200" />}
                    <h2 className="font-display text-2xl text-white/95">{plan.name}</h2>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">{plan.tagline}</p>
                  <p className="mb-5 font-display text-3xl text-white">{plan.price}</p>
                  <ul className="mb-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-200">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.highlight ? (
                    active ? (
                      <Button disabled className="w-full">Membresía activa ✓</Button>
                    ) : (
                      <Button onClick={activate} disabled={busy} className="w-full gap-2">
                        <Crown className="h-4 w-4" /> {busy ? "Activando..." : "Activar Minero RDM"}
                      </Button>
                    )
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => navigate(user ? "/perfil" : "/auth")}>
                      {user ? "Mi cuenta" : "Crear cuenta gratis"}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            ¿Dudas sobre los planes? Visita las{" "}
            <button onClick={() => navigate("/faq")} className="text-cyan-200 underline-offset-2 hover:underline">
              Preguntas Frecuentes
            </button>.
          </p>
        </div>
      </section>
    </MainLayout>
  );
}
