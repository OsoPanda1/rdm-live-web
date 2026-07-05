import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/site/PageHero";
import { useGamification, getTierForLevel, type LeaderboardEntry } from "@/hooks/use-gamification";
import {
  Trophy,
  Target,
  Zap,
  Shield,
  Crown,
  Flame,
  Star,
  ChevronRight,
  Medal,
  Swords,
  Gem,
} from "lucide-react";

export const Route = createFileRoute("/rdm-quest")({
  head: () => ({
    meta: [
      { title: "RDM Quest · Conquista el Hub · RDM Digital" },
      { name: "description", content: "Gamificación federada: misiones, niveles, leaderboard y recompensas del Sistema Operativo Territorial." },
    ],
  }),
  component: RDMQuestPage,
});

const QUEST_ICONS: Record<string, typeof Trophy> = {
  onboarding: Star,
  weekly: Target,
  special: Gem,
  milestone: Crown,
};

function RDMQuestPage() {
  const { profile, quests, leaderboard, loading, tiers, loadAll, recordEvent } = useGamification();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"misiones" | "ranking" | "perfil" | "niveles">("misiones");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        loadAll(data.user.id);
      }
    });
  }, [loadAll]);

  const tier = profile ? getTierForLevel(profile.level) : tiers[0];
  const nextTier = tiers.find((t) => t.level === (profile?.level ?? 0) + 1);
  const xpProgress = nextTier
    ? ((profile?.points ?? 0) - tier.xpRequired) / (nextTier.xpRequired - tier.xpRequired)
    : 1;

  return (
    <>
      <PageHero
        eyebrow="Motor de Gamificación LTOS"
        title="RDM Quest"
        highlight="· Conquista el Hub."
        description="Misiones semanales, sistema de niveles federados y leaderboard en tiempo real. Tu progreso se traduce en beneficios reales dentro del Hub."
      />
      <section className="container mx-auto px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-hairline pb-4">
            {(["misiones", "ranking", "perfil", "niveles"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "misiones" && <Target className="inline w-4 h-4 mr-1.5 -mt-0.5" />}
                {tab === "ranking" && <Trophy className="inline w-4 h-4 mr-1.5 -mt-0.5" />}
                {tab === "perfil" && <Shield className="inline w-4 h-4 mr-1.5 -mt-0.5" />}
                {tab === "niveles" && <Crown className="inline w-4 h-4 mr-1.5 -mt-0.5" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Profile Summary Bar */}
          {profile && (
            <div className="rounded-2xl border-hairline bg-card p-5 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-display text-xl text-ink">{profile.points.toLocaleString()}</div>
                  <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground">XP Total</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-display text-xl text-ink">Nv. {profile.level}</div>
                  <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground">{tier.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Medal className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-display text-xl text-ink">{profile.badges.length}</div>
                  <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground">Insignias</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Swords className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-display text-xl text-ink">{profile.streak_days}</div>
                  <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground">Días racha</div>
                </div>
              </div>
              {/* XP Progress bar */}
              {nextTier && (
                <div className="col-span-2 md:col-span-4 mt-1">
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
                    <span>{tier.name}</span>
                    <span>{nextTier.name} ({nextTier.xpRequired.toLocaleString()} XP)</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-aurora transition-all duration-700" style={{ width: `${Math.min(100, xpProgress * 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Tabs */}
          {activeTab === "misiones" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">Cargando misiones...</div>
              ) : quests.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">No hay misiones activas</div>
              ) : (
                quests.map((q) => {
                  const Icon = QUEST_ICONS[q.quest_type] ?? Target;
                  return (
                    <article key={q.id} className="rounded-2xl border-hairline bg-card p-6 hover:shadow-sovereign transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-[9px] tracking-sovereign text-accent">{q.quest_type.toUpperCase()}</span>
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="font-display text-xl text-ink">{q.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{q.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium">+{q.reward_xp} XP</span>
                        </div>
                        {q.reward_badge && (
                          <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-accent/10 text-accent">{q.reward_badge.replace("badge_", "")}</span>
                        )}
                      </div>
                      {q.ends_at && (
                        <div className="mt-3 text-[10px] font-mono text-muted-foreground">
                          Termina: {new Date(q.ends_at).toLocaleDateString("es-MX")}
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "ranking" && (
            <div className="rounded-2xl border-hairline bg-card overflow-hidden">
              <div className="p-6 border-b border-hairline">
                <h2 className="font-display text-2xl text-ink flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-accent" /> Leaderboard Territorial
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Ranking de jugadores por puntos de experiencia</p>
              </div>
              <div className="divide-y divide-hairline">
                {leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">Sin datos de ranking aún</div>
                ) : (
                  leaderboard.map((entry) => {
                    const entryTier = getTierForLevel(entry.level);
                    return (
                      <div key={entry.user_id} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-sm ${
                          entry.rank === 1 ? "bg-amber-100 text-amber-700" :
                          entry.rank === 2 ? "bg-slate-100 text-slate-600" :
                          entry.rank === 3 ? "bg-orange-100 text-orange-700" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-ink truncate">{entry.display_name ?? `Jugador ${entry.user_id.slice(0, 6)}`}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{entryTier.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-lg text-ink">{entry.points.toLocaleString()}</div>
                          <div className="font-mono text-[9px] text-muted-foreground">XP</div>
                        </div>
                        <div className="w-12 text-right">
                          <div className="font-display text-sm text-ink">Nv. {entry.level}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "perfil" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border-hairline bg-card p-6">
                <h2 className="font-display text-2xl text-ink mb-4">Tu Perfil Gamer</h2>
                {profile ? (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-aurora flex items-center justify-center">
                        <Crown className="w-8 h-8 text-background" />
                      </div>
                      <div>
                        <div className="font-display text-2xl text-ink">{tier.name}</div>
                        <div className="text-sm text-muted-foreground">Nivel {profile.level} · {profile.points.toLocaleString()} XP</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Puntos totales</span><span className="font-medium">{profile.points.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Nivel actual</span><span className="font-medium">{profile.level}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Insignias</span><span className="font-medium">{profile.badges.length}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Racha de días</span><span className="font-medium">{profile.streak_days}</span></div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Inicia sesión para ver tu perfil de gamificación</p>
                  </div>
                )}
              </div>
              <div className="rounded-2xl border-hairline bg-card p-6">
                <h2 className="font-display text-2xl text-ink mb-4">Insignias Recientes</h2>
                {profile && profile.badges.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {profile.badges.map((b) => (
                      <div key={b} className="rounded-xl bg-secondary p-3 text-center">
                        <Medal className="w-6 h-6 text-accent mx-auto mb-1" />
                        <div className="text-xs font-medium">{b.replace("badge_", "").replace(/_/g, " ")}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Medal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Completa misiones para desbloquear insignias</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "niveles" && (
            <div className="space-y-4">
              <div className="rounded-2xl border-hairline bg-card p-6 mb-6">
                <h2 className="font-display text-2xl text-ink mb-2">El Camino del Minero 2.0</h2>
                <p className="text-sm text-muted-foreground">
                  Cada nivel desbloquea beneficios reales en el Hub: acceso a módulos avanzados,Wi-Fi prioritario, eventos privados y votaciones internas.
                </p>
              </div>
              {tiers.map((t, i) => {
                const isActive = (profile?.level ?? 0) >= t.level;
                const isCurrent = (profile?.level ?? 0) === t.level;
                return (
                  <div key={t.level} className={`flex items-center gap-6 rounded-2xl border-hairline p-5 transition-all ${
                    isCurrent ? "bg-accent/5 border-accent shadow-card" : isActive ? "bg-card" : "bg-secondary/30 opacity-60"
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display text-lg ${
                      isCurrent ? "bg-aurora text-background" : isActive ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"
                    }`}>
                      {t.level}
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-lg text-ink">{t.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{t.xpRequired.toLocaleString()} XP requeridos</div>
                    </div>
                    <div>
                      {isCurrent && <span className="text-xs px-3 py-1 rounded-full bg-accent text-accent-foreground">Actual</span>}
                      {isActive && !isCurrent && <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">Completado</span>}
                      {!isActive && <span className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground">Bloqueado</span>}
                    </div>
                    {i < tiers.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
