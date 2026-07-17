import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pickaxe, Zap, Gem, LogOut, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Balance {
  oro: number; plata: number; cuarzo: number; carbon: number;
  puntos: number; energy: number; total_mined: number;
}
interface Reward { id: string; name: string; description: string; category: string; cost_points: number; }

const MINERALS = [
  { key: "oro", label: "Oro", emoji: "🪙", color: "from-amber-400 to-yellow-600" },
  { key: "plata", label: "Plata", emoji: "🔘", color: "from-slate-200 to-slate-400" },
  { key: "cuarzo", label: "Cuarzo", emoji: "💎", color: "from-cyan-200 to-cyan-400" },
  { key: "carbon", label: "Carbón", emoji: "🪨", color: "from-zinc-500 to-zinc-700" },
] as const;

const ENERGY_MAX = 100;

export default function Mina() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pop, setPop] = useState<{ mineral: string; amount: number; points: number } | null>(null);

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [loading, user, navigate]);

  const loadAll = useCallback(async () => {
    if (!user) return;
    const [{ data: bal }, { data: mem }, { data: rw }] = await Promise.all([
      supabase.from("mineral_balances").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("game_memberships").select("status,current_period_end").eq("user_id", user.id).maybeSingle(),
      supabase.from("rewards_catalog").select("id,name,description,category,cost_points").eq("active", true).order("cost_points"),
    ]);
    if (bal) setBalance(bal as Balance);
    setActive(!!(mem?.status === "active" && mem.current_period_end && new Date(mem.current_period_end) > new Date()));
    if (rw) setRewards(rw as Reward[]);
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const activate = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("rdm-membership-activate");
    setBusy(false);
    if (error) return toast.error("No se pudo activar la membresía");
    if (data?.membership) { toast.success("¡Membresía minera activada por 30 días!"); loadAll(); }
  };

  const mine = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("rdm-mine");
    setBusy(false);
    if (error || data?.error) {
      const msg = (data?.message as string) || "No se pudo minar";
      return toast.error(msg);
    }
    setBalance(data.balance);
    setPop(data.mined);
    setTimeout(() => setPop(null), 1100);
  };

  const redeem = async (r: Reward) => {
    if (!balance || balance.puntos < r.cost_points) return toast.error("Puntos insuficientes");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("rdm-redeem", { body: { reward_id: r.id } });
    setBusy(false);
    if (error || data?.error) return toast.error((data?.message as string) || "No se pudo canjear");
    setBalance(data.balance);
    toast.success(`Canjeaste: ${r.name}. Te contactaremos para entregarlo.`);
  };

  const energyPct = balance ? Math.min(100, (balance.energy / ENERGY_MAX) * 100) : 0;

  return (
    <MainLayout>
        <SEOMeta title="Mina RDM · Subsuelo Digital de Real del Monte" description="Mina oro, plata, cuarzo y carbón digitales y canjea tus puntos por productos reales de Real del Monte." />
        {/* Hero Banner */}
        <div className="relative h-48 w-full overflow-hidden">
          <img src="/images/historia-mina.jpg" alt="Historia de la mina de Real del Monte" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <section className="container mx-auto px-4 pt-28 pb-20 max-w-5xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-gradient-gold">Subsuelo Digital RDM</h1>
            <p className="font-body text-muted-foreground mt-2">Mina minerales, acumula puntos y cánjealos por experiencias reales del Pueblo Mágico.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} className="shrink-0">
            <LogOut className="h-4 w-4 mr-1" /> Salir
          </Button>
        </div>

        {!active ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel-futuristic rounded-3xl p-8 text-center">
            <Gem className="h-12 w-12 mx-auto text-[hsl(var(--gold))] mb-4" />
            <h2 className="font-display text-3xl mb-2">Membresía Minera</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-1">Activa tu acceso al subsuelo digital y empieza a minar Oro, Plata, Cuarzo y Carbón.</p>
            <p className="text-4xl font-display text-gradient-gold my-4">$129 <span className="text-base text-muted-foreground">MXN / mes</span></p>
            <Button onClick={activate} disabled={busy} className="btn-premium">{busy ? "Activando…" : "Activar membresía"}</Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pico / minado */}
            <div className="lg:col-span-2 panel-futuristic rounded-3xl p-8 relative overflow-hidden">
              <div className="dust-particles" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-full mb-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-[hsl(var(--electric))]" /> Energía</span>
                    <span>{balance?.energy ?? 0}/{ENERGY_MAX}</span>
                  </div>
                  <Progress value={energyPct} className="h-2" />
                </div>

                <div className="relative">
                  <AnimatePresence>
                    {pop && (
                      <motion.div
                        key={Date.now()}
                        initial={{ opacity: 0, y: 0, scale: 0.6 }}
                        animate={{ opacity: 1, y: -60, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-1/2 -translate-x-1/2 -top-4 font-display text-2xl text-[hsl(var(--gold))] text-glow-gold whitespace-nowrap"
                      >
                        +{pop.amount} {pop.mineral} · +{pop.points} pts
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={mine}
                    disabled={busy || (balance?.energy ?? 0) < 5}
                    className="h-44 w-44 rounded-full bg-gradient-gold grid place-items-center pulse-gold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Pickaxe className="h-20 w-20 text-[hsl(220,45%,8%)]" />
                  </motion.button>
                </div>
                <p className="text-sm text-muted-foreground mt-6">Toca el pico para extraer del subsuelo (5 energía por golpe).</p>

                <div className="grid grid-cols-4 gap-3 w-full mt-8">
                  {MINERALS.map((m) => (
                    <div key={m.key} className="glass-card rounded-2xl p-3 text-center">
                      <div className="text-2xl">{m.emoji}</div>
                      <div className="font-display text-xl mt-1">{balance ? Math.floor(Number(balance[m.key as keyof Balance])) : 0}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Puntos + recompensas */}
            <div className="space-y-6">
              <div className="glass-gold rounded-3xl p-6 text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Puntos RDM</p>
                <p className="font-display text-5xl text-gradient-gold my-1">{balance?.puntos ?? 0}</p>
                <p className="text-xs text-muted-foreground">{balance?.total_mined ?? 0} minerales extraídos</p>
              </div>

              <div className="panel-futuristic rounded-3xl p-5">
                <h3 className="font-display text-xl flex items-center gap-2 mb-4"><Gift className="h-5 w-5 text-[hsl(var(--gold))]" /> Recompensas reales</h3>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {rewards.map((r) => {
                    const can = (balance?.puntos ?? 0) >= r.cost_points;
                    return (
                      <div key={r.id} className="glass-card rounded-2xl p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-body font-semibold text-sm">{r.name}</p>
                          <span className="text-xs font-display text-[hsl(var(--gold))] whitespace-nowrap">{r.cost_points} pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                        <Button size="sm" variant={can ? "default" : "outline"} disabled={!can || busy} onClick={() => redeem(r)} className="w-full mt-2 h-8 text-xs">
                          {can ? "Canjear" : "Faltan puntos"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </MainLayout>
  );
}
