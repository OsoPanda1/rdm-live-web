import { motion } from "framer-motion";
import {
  Pickaxe,
  Gem,
  Trophy,
  Crown,
  Sparkles,
  Lock,
  Gift,
  ShieldCheck,
  Star,
  Flame,
  Medal,
  Swords,
  Users,
  Check,
  ArrowRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

type RdmProfile = {
  user_id: string;
  total_minerals: number;
  level: number;
  xp: number;
  xp_to_next: number;
  streak_days: number;
  last_mine_at: string | null;
};

type PremiumSub = {
  status: string;
};

type Reward = {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  monetary_value: number;
  stock: number;
  type: "experiencia" | "producto" | "servicio";
  businesses?: {
    name: string;
    sector: string;
    icon: string | null;
  };
};

type Mission = {
  id: string;
  title: string;
  description: string;
  points: number;
  type: "daily" | "weekly";
  progress: number;
  goal: number;
  completed: boolean;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "medal" | "flame" | "swords";
  unlockedAt: string;
};

function getRank(level: number, minerals: number) {
  if (level >= 30 || minerals >= 150_000) {
    return { name: "Soberano de Veta", color: "text-electric", badge: "bg-electric/20" };
  }
  if (level >= 20 || minerals >= 75_000) {
    return { name: "Forjador de Oro", color: "text-gold", badge: "bg-gold/15" };
  }
  if (level >= 10 || minerals >= 25_000) {
    return { name: "Explorador de Plata", color: "text-teal", badge: "bg-teal/15" };
  }
  return { name: "Aprendiz de Veta", color: "text-muted-foreground", badge: "bg-secondary/30" };
}

export default function GamePortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  // ---------- AUTH SESSION ----------
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth
      .getSession()
      .then(({ data }) => setUser(data.session?.user ?? null))
      .catch(() => {
        // Harden: no romper UI si falla la sesión
        setUser(null);
      });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // ---------- QUERIES ----------
  const { data: profile } = useQuery<RdmProfile | null>({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "user_id, total_minerals, level, xp, xp_to_next, streak_days, last_mine_at",
        )
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        logger.error("Error loading profile", { error });
        return null;
      }
      return (data ?? null) as RdmProfile | null;
    },
    enabled: !!user,
  });

  const { data: premium } = useQuery<PremiumSub | null>({
    queryKey: ["premium", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("subscriptions_premium")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        logger.error("Error loading premium", { error });
        return null;
      }
      return (data ?? null) as PremiumSub | null;
    },
    enabled: !!user,
  });

  const { data: rewards } = useQuery<Reward[]>({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*, businesses(name, sector, icon)")
        .eq("is_active", true)
        .order("points_cost");
      if (error) {
        logger.error("Error loading rewards", { error });
        return [];
      }
      return (data || []) as Reward[];
    },
  });

  const { data: missions } = useQuery<Mission[]>({
    queryKey: ["missions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("missions_view")
        .select("*")
        .eq("user_id", user.id);
      if (error) {
        logger.error("Error loading missions", { error });
        return [];
      }
      return (data || []) as Mission[];
    },
    enabled: !!user,
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("achievements_view")
        .select("*")
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false })
        .limit(6);
      if (error) {
        logger.error("Error loading achievements", { error });
        return [];
      }
      return (data || []) as Achievement[];
    },
    enabled: !!user,
  });

  const isPremium = premium?.status === "activa";
  const totalMinerals = profile?.total_minerals ?? 0;
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const xpToNext = profile?.xp_to_next ?? 100;
  const streak = profile?.streak_days ?? 0;

  const rank = useMemo(
    () => getRank(level, totalMinerals),
    [level, totalMinerals],
  );

  // ---------- PREMIUM HANDLERS ----------
  const [selectedTier, setSelectedTier] = useState<"99" | "129">("99");
  const [busyTier, setBusyTier] = useState<"99" | "129" | null>(null);

  const handleActivatePremium = async (tier: "99" | "129") => {
    if (!user) {
      toast.error("Inicia sesión para activar Premium");
      navigate("/auth");
      return;
    }

    if (busyTier === tier) {
      // Harden: evitar doble clic / doble petición
      return;
    }

    setBusyTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-premium-checkout", {
        body: { tier },
      });

      if (error) {
        logger.error("Error create-premium-checkout", { error });
        throw error;
      }

      if (data?.url && typeof data.url === "string") {
        window.location.href = data.url;
      } else {
        toast.error("No se recibió una URL válida de checkout");
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "No se pudo iniciar el pago";
      toast.error(message);
    } finally {
      setBusyTier(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast.error("Inicia sesión para gestionar tu suscripción");
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) {
        logger.error("Error customer-portal", { error });
        throw error;
      }

      if (data?.url && typeof data.url === "string") {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("No se recibió una URL válida de portal");
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "No se pudo abrir el portal";
      toast.error(message);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("premium") === "success" && user) {
      supabase.functions
        .invoke("check-subscription")
        .then(() => {
          toast.success("¡Premium activado!");
          window.history.replaceState({}, "", "/game");
        })
        .catch(() => {
          toast.error("No se pudo verificar la suscripción");
        });
    }
  }, [user]);

  // ---------- REDEEM ----------
  const handleRedeem = async (reward: Reward) => {
    if (!user) {
      toast.error("Inicia sesión para canjear premios");
      navigate("/auth");
      return;
    }

    if (!isPremium) {
      toast.error("Necesitas Premium para canjear");
      return;
    }

    if (reward.stock <= 0) {
      toast.error("Este premio ya no tiene stock disponible");
      return;
    }

    if (totalMinerals < reward.points_cost) {
      toast.error("No tienes suficientes minerales");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .insert({
          user_id: user.id,
          reward_id: reward.id,
        })
        .select()
        .single();

      if (error) {
        logger.error("Error reward_redemptions insert", { error });
        toast.error("No se pudo canjear el premio");
        return;
      }

      // Harden: validar que data tenga code
      const code =
        (data as { code?: string } | null)?.code ?? "sin código visible";
      toast.success(`¡Canjeado! Código: ${code}`);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          total_minerals: totalMinerals - reward.points_cost,
        })
        .eq("user_id", user.id);

      if (updateError) {
        logger.error("Error profiles update", { error: updateError });
        toast.error("Premio canjeado, pero no se pudo actualizar tus minerales");
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Error inesperado al canjear";
      toast.error(message);
    }
  };

  const xpProgress = Math.min(100, Math.round((xp / xpToNext) * 100));

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* HEADER HERO */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          Gamificación Territorial · Economía Sostenible
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight">
              Veta Soberana
            </h1>
            <p className="mt-1 text-sm font-body text-muted-foreground max-w-xl">
              Mina minerales digitales recorriendo Real del Monte, sube de nivel
              y canjéalos por experiencias reales en comercios federados.
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-3 text-right">
              <div className="text-right">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                  Rango
                </p>
                <p
                  className={cn(
                    "text-sm font-display font-semibold",
                    rank.color,
                  )}
                >
                  {rank.name}
                </p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em]",
                  rank.badge,
                )}
              >
                <Trophy className="h-3.5 w-3.5 text-gold" />
                Nivel {level}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* STATUS STRIP: minerales, nivel, racha, premium */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-4"
        >
          {/* Minerales */}
          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gold/15 flex items-center justify-center">
              <Gem className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Tus minerales
              </p>
              <p className="text-2xl font-display font-bold text-gradient-gold">
                {totalMinerals.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Nivel / XP */}
          <div className="glass rounded-2xl p-5 flex flex-col justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-electric/15 flex items-center justify-center">
                <Star className="h-6 w-6 text-electric" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Nivel
                </p>
                <p className="text-2xl font-display font-bold">{level}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>Progreso</span>
                <span>
                  {xp}/{xpToNext} XP
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-secondary/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold via-amber-400 to-electric"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Racha diaria */}
          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Flame className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Racha diaria
              </p>
              <p className="text-2xl font-display font-bold">
                {streak}{" "}
                <span className="text-[11px] font-mono text-muted-foreground">
                  días
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Mantén la racha para bonus de XP.
              </p>
            </div>
          </div>

          {/* Premium */}
          <div
            className={cn(
              "rounded-2xl p-5 flex items-center gap-4",
              isPremium ? "glass-gold" : "glass",
            )}
          >
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center",
                isPremium ? "bg-gold/30" : "bg-secondary/40",
              )}
            >
              <Crown
                className={cn(
                  "h-6 w-6",
                  isPremium ? "text-gold" : "text-muted-foreground",
                )}
              />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Estado
              </p>
              <p
                className={cn(
                  "text-lg font-display font-bold",
                  isPremium && "text-gradient-gold",
                )}
              >
                {isPremium ? "Premium activo" : "Cuenta básica"}
              </p>
              {isPremium ? (
                <button
                  onClick={handleManageSubscription}
                  className="mt-1 inline-flex items-center gap-1 rounded-lg bg-black/20 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-gold hover:bg-black/30"
                >
                  <Crown className="h-3 w-3" />
                  Gestionar
                </button>
              ) : (
                <button
                  onClick={() => handleActivatePremium(selectedTier)}
                  disabled={busyTier === selectedTier}
                  className="mt-1 inline-flex items-center gap-1 rounded-lg bg-gold/10 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-gold hover:bg-gold/15"
                >
                  <Crown className="h-3 w-3" />
                  {busyTier === selectedTier ? "Procesando..." : "Activar"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* PAYWALL PREMIUM (SI NO PREMIUM) */}
      {(!user || !isPremium) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl glass-gold p-10 text-center"
        >
          <div
            className="absolute inset-0 -z-10 opacity-25"
            style={{
              background:
                "radial-gradient(circle at 50% 10%, hsl(43 80% 55%), transparent 60%)",
            }}
          />
          <Lock className="mx-auto mb-4 h-12 w-12 text-gold" />
          <h3 className="text-3xl font-display font-bold">
            Activa Veta Soberana Premium
          </h3>
          <p className="mt-3 mx-auto max-w-2xl text-sm font-body text-muted-foreground">
            Elige tu plan y desbloquea minería digital, multiplicadores y acceso
            completo a la bolsa de premios.
          </p>

          {/* Tier selector */}
          <div className="mx-auto mt-6 grid max-w-lg gap-4 sm:grid-cols-2">
            {[
              {
                id: "99" as const,
                name: "Básico",
                price: "$99",
                features: ["Minería digital", "Bolsa de premios", "Misiones diarias"],
              },
              {
                id: "129" as const,
                name: "Minero",
                price: "$129",
                highlight: true,
                features: ["Multiplicador x2", "Minería remota", "Premios de alto valor", "Insignia exclusiva"],
              },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-all",
                  selectedTier === t.id
                    ? "border-gold/60 bg-gold/10 shadow-gold"
                    : "border-border/30 bg-black/20 hover:border-gold/30",
                )}
              >
                <div className="flex items-center justify_between mb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {t.name}
                  </span>
                  {selectedTier === t.id && (
                    <Check className="h-4 w-4 text-gold" />
                  )}
                </div>
                <p className="text-3xl font-display font-bold text-gradient-gold">
                  {t.price}
                  <span className="text-xs font-mono text-muted-foreground">
                    /mes
                  </span>
                </p>
                <ul className="mt-3 space-y-1">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-1.5 text-[11px] text-foreground/70"
                    >
                      <ShieldCheck className="h-3 w-3 text-teal shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleActivatePremium(selectedTier)}
            disabled={busyTier === selectedTier}
            className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-gold px-6 py-3 text-sm font-body font-semibold text-primary-foreground shadow-gold hover:shadow-elevated transition-all"
          >
            <Crown className="h-4 w-4" />
            {busyTier === selectedTier
              ? "Procesando..."
              : user
              ? `Activar ${
                  selectedTier === "129" ? "Minero" : "Básico"
                }`
              : "Iniciar sesión y activar"}
          </button>
          <p className="mt-3 text-[10px] font-mono text-muted-foreground">
            Pago seguro con Stripe · Cancela cuando quieras ·{" "}
            <button
              onClick={() => navigate("/premium")}
              className="text-gold underline-offset-2 hover:underline"
            >
              Ver todos los planes
            </button>
          </p>
        </motion.div>
      )}

      {/* MISIONES + LOGROS */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-[2fr,1.4fr]"
        >
          {/* Misiones */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Pickaxe className="h-5 w-5 text-gold" />
              <div>
                <h2 className="text-lg font-display font-bold">
                  Misiones activas
                </h2>
                <p className="text-[12px] font-body text-muted-foreground">
                  Completa misiones diarias y semanales para ganar XP y
                  minerales extra.
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(missions || []).map((m) => {
                const progressPct = Math.min(
                  100,
                  Math.round((m.progress / m.goal) * 100),
                );
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-2xl border p-4 glass flex flex-col gap-2",
                      m.completed && "border-gold/40",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em]",
                          m.type === "daily"
                            ? "bg-teal/15 text-teal"
                            : "bg-electric/15 text-electric",
                        )}
                      >
                        {m.type === "daily" ? "Diaria" : "Semanal"}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        +{m.points} ⚒️
                      </span>
                    </div>
                    <h3 className="text-sm font-display font-semibold">
                      {m.title}
                    </h3>
                    <p className="text-[12px] font-body text-muted-foreground">
                      {m.description}
                    </p>
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                        <span>Progreso</span>
                        <span>
                          {m.progress}/{m.goal}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-secondary/50 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r from-gold to-electric",
                            m.completed && "from-teal to-gold",
                          )}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                    {m.completed && (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-gold">
                        <Sparkles className="h-3 w-3" />
                        Completa — recompensa aplicada
                      </div>
                    )}
                  </div>
                );
              })}
              {!missions?.length && (
                <p className="col-span-2 text-[12px] font-body text-muted-foreground">
                  Aún no hay misiones activas. Vuelve pronto.
                </p>
              )}
            </div>
          </div>

          {/* Logros / Comunidad */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-gold" />
              <div>
                <h2 className="text-lg font-display font-bold">
                  Logros recientes
                </h2>
                <p className="text-[12px] font-body text-muted-foreground">
                  Hitos que has desbloqueado en la veta digital.
                </p>
              </div>
            </div>
            <div className="rounded-2xl glass p-4 space-y-3">
              {(achievements || []).map((a) => {
                const Icon =
                  a.icon === "trophy"
                    ? Trophy
                    : a.icon === "flame"
                    ? Flame
                    : a.icon === "swords"
                    ? Swords
                    : Medal;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-xl bg-black/20 px-3 py-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20">
                      <Icon className="h-4 w-4 text-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-display font-semibold">
                        {a.title}
                      </p>
                      <p className="text-[11px] font-body text-muted-foreground">
                        {a.description}
                      </p>
                    </div>
                  </div>
                );
              })}
              {!achievements?.length && (
                <p className="text-[12px] font-body text-muted-foreground">
                  Aún no tienes logros. Completa misiones y canjea premios para
                  empezar a desbloquearlos.
                </p>
              )}
            </div>
            <div className="rounded-2xl glass p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/20">
                  <Users className="h-4 w-4 text-teal" />
                </div>
                <div>
                  <p className="text-[12px] font-display font-semibold">
                    Comunidad federada
                  </p>
                  <p className="text-[11px] font-body text-muted-foreground">
                    Los premios provienen de comercios reales que sostienen la
                    economía local.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* REWARDS CATALOG */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-display font-bold">
              <Gift className="h-5 w-5 text-gold" />
              Bolsa de Premios
            </h2>
            <p className="mt-1 text-[12px] font-body text-muted-foreground">
              Premios reales aportados por comercios federados.{" "}
              {!isPremium && "Activa Premium para canjear."}
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(rewards || []).map((r) => {
            const canRedeem = isPremium && user && totalMinerals >= r.points_cost && r.stock > 0;
            return (
              <motion.div
                key={r.id}
                whileHover={{ y: -4 }}
                className={cn(
                  "flex flex-col rounded-2xl border p-5 glass",
                  canRedeem ? "border-gold/30" : "border-border/20",
                )}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span
                    className={cn(
                      "rounded-md px-2 py-1 text-[9px] font-mono uppercase tracking-widest",
                      r.type === "experiencia"
                        ? "bg-gold/15 text-gold"
                        : r.type === "producto"
                        ? "bg-teal/15 text-teal"
                        : "bg-electric/15 text-electric",
                    )}
                  >
                    {r.type}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    stock: {r.stock}
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold">{r.title}</h3>
                <p className="mt-1 flex-1 text-[12px] font-body text-muted-foreground leading-relaxed">
                  {r.description}
                </p>
                {r.businesses && (
                  <p className="mt-2 text-[10px] font-mono text-muted-foreground">
                    por {r.businesses.icon} {r.businesses.name}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Costo
                    </p>
                    <p className="text-lg font-display font-bold text-gradient-gold">
                      {r.points_cost.toLocaleString()} ⚒️
                    </p>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    ~$
                    {Number(r.monetary_value).toLocaleString()} MXN
                  </p>
                </div>
                <button
                  onClick={() => handleRedeem(r)}
                  disabled={!canRedeem}
                  className={cn(
                    "mt-3 w-full rounded-xl px-4 py-2.5 text-[12px] font-body font-semibold transition-all",
                    canRedeem
                      ? "gradient-gold text-primary-foreground shadow-gold hover:shadow-elevated"
                      : "cursor-not-allowed bg-secondary/30 text-muted-foreground",
                  )}
                >
                  {!user
                    ? "Inicia sesión"
                    : !isPremium
                    ? "Requiere Premium"
                    : totalMinerals < r.points_cost
                    ? "Faltan minerales"
                    : r.stock <= 0
                    ? "Sin stock"
                    : "Canjear"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ECONOMY FORMULA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <Sparkles className="h-4 w-4 text-gold" />
          Fórmula de sostenibilidad
        </h3>
        <p className="mt-2 text-[12px] font-body text-muted-foreground leading-relaxed">
          Cada premio tiene un{" "}
          <span className="font-mono text-gold">points_cost</span> asociado que
          refleja su valor dentro de la economía federada. Al recorrer Real del
          Monte, ganar minerales y canjearlos en la bolsa de premios, impulsas
          comercios locales y activas una red de turismo sostenible.
        </p>
      </motion.div>
    </div>
  );
}
