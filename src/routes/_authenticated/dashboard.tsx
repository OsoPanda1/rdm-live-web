import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/site/PageHero";
import { HEPTA_LAYERS } from "@/lib/federation";
import { useGamification, getTierForLevel } from "@/hooks/use-gamification";
import {
  Activity,
  LogOut,
  Shield,
  Sparkles,
  Crown,
  Flame,
  Medal,
  Trophy,
  Target,
  Zap,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard ciudadano · RDM Digital" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext() as { user: { email?: string; id: string } };
  const navigate = (globalThis as { __TanStackNavigate?: (opts: { to: string }) => void }).__TanStackNavigate;
  const [profile, setProfile] = useState<{ display_name?: string | null; federation?: string | null } | null>(null);
  const [fed, setFed] = useState<string>("MDD_TAMV");
  const [saving, setSaving] = useState(false);
  const { profile: gamification, loading: gamLoading, loadAll } = useGamification();

  useEffect(() => {
    supabase.from("profiles").select("display_name, federation").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setProfile(data); if (data.federation) setFed(data.federation); }
    });
    loadAll(user.id);
  }, [user.id, loadAll]);

  const saveFed = async () => {
    setSaving(true);
    await supabase.from("profiles").update({ federation: fed }).eq("id", user.id);
    setSaving(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") window.location.href = "/";
  };

  const tier = gamification ? getTierForLevel(gamification.level) : null;

  return (
    <>
      <PageHero
        eyebrow="Identidad federada"
        title={`Hola, ${profile?.display_name || user.email || "ciudadano"}.`}
        description="Tu nodo personal dentro del kernel territorial. Selecciona tu capa federada y sigue tu pulso cívico."
      />
      <section className="container mx-auto px-6 pb-24 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Federation selector */}
          <div className="rounded-2xl border-hairline bg-card p-7">
            <div className="font-mono text-[10px] tracking-sovereign text-accent mb-2">Capa federada</div>
            <h2 className="font-display text-2xl text-ink mb-5">Selecciona tu pertenencia</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {HEPTA_LAYERS.map((l) => (
                <button key={l.key} onClick={() => setFed(l.key)} className={`text-left rounded-xl border p-4 transition-all ${fed === l.key ? "border-accent shadow-card" : "border-hairline hover:bg-secondary"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl" style={{ color: l.color }}>{l.glyph}</span>
                    <span className="font-mono text-[9px] tracking-sovereign text-muted-foreground">{l.key}</span>
                  </div>
                  <div className="font-display text-lg text-ink mt-2">{l.name}</div>
                  <p className="text-[11px] text-muted-foreground mt-1">{l.domain}</p>
                </button>
              ))}
            </div>
            <button onClick={saveFed} disabled={saving} className="mt-5 rounded-full bg-foreground text-background px-5 py-2.5 text-sm disabled:opacity-50">
              {saving ? "Guardando…" : "Guardar capa federada"}
            </button>
          </div>

          {/* Gamification Profile */}
          {gamification && (
            <div className="rounded-2xl border-hairline bg-card p-7">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-mono text-[10px] tracking-sovereign text-accent mb-1">Gamificación</div>
                  <h2 className="font-display text-2xl text-ink">Tu Progreso Territorial</h2>
                </div>
                <Link to="/rdm-quest" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                  Ver Quest <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-display text-xl text-ink">{gamification.points.toLocaleString()}</div>
                    <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground">XP</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-display text-xl text-ink">Nv. {gamification.level}</div>
                    <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground">{tier?.name ?? "Aprendiz"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Medal className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-display text-xl text-ink">{gamification.badges.length}</div>
                    <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground">Insignias</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-display text-xl text-ink">{gamification.streak_days}</div>
                    <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground">Racha</div>
                  </div>
                </div>
              </div>

              {gamification.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gamification.badges.slice(0, 5).map((b) => (
                    <span key={b} className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                      {b.replace("badge_", "").replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}

              {gamification.badges.length === 0 && (
                <p className="text-sm text-muted-foreground">Completa misiones en RDM Quest para ganar insignias y XP</p>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border-hairline bg-card p-6">
            <Shield className="w-5 h-5 text-accent mb-2" />
            <div className="font-display text-lg text-ink">Identidad</div>
            <p className="text-xs text-muted-foreground mt-1 break-all">{user.email}</p>
            <p className="font-mono text-[10px] tracking-sovereign text-muted-foreground mt-2">UID {user.id.slice(0, 8)}…</p>
          </div>

          <div className="rounded-2xl border-hairline bg-card p-6">
            <Activity className="w-5 h-5 text-accent mb-2" />
            <div className="font-display text-lg text-ink">Pulso cívico</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div><div className="font-display text-2xl text-ink">{gamification?.points ?? 0}</div><div className="font-mono text-[9px] tracking-sovereign text-muted-foreground">puntos</div></div>
              <div><div className="font-display text-2xl text-ink">{gamification?.level ?? 1}</div><div className="font-mono text-[9px] tracking-sovereign text-muted-foreground">nivel</div></div>
            </div>
          </div>

          <div className="rounded-2xl border-hairline bg-card p-6">
            <Sparkles className="w-5 h-5 text-accent mb-2" />
            <div className="font-display text-lg text-ink mb-2">Atajos</div>
            <ul className="text-sm space-y-1">
              <li><a className="hover:text-accent" href="/atlas">→ Atlas territorial</a></li>
              <li><a className="hover:text-accent" href="/rdm-quest">→ RDM Quest</a></li>
              <li><a className="hover:text-accent" href="/musica">→ RDM Ecos Música</a></li>
              <li><a className="hover:text-accent" href="/realito">→ Hablar con Realito</a></li>
              <li><a className="hover:text-accent" href="/comunidad">→ Foro federado</a></li>
            </ul>
          </div>

          <div className="rounded-2xl border-hairline bg-card p-6">
            <Trophy className="w-5 h-5 text-accent mb-2" />
            <div className="font-display text-lg text-ink mb-2">Próximas Misiones</div>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2"><Target className="w-4 h-4 text-accent shrink-0" /><span>Explora 5 POIs en el Atlas</span></li>
              <li className="flex items-center gap-2"><Target className="w-4 h-4 text-accent shrink-0" /><span>Crea tu primera Crónica Sonora</span></li>
              <li className="flex items-center gap-2"><Target className="w-4 h-4 text-accent shrink-0" /><span>Alcanza nivel 2</span></li>
            </ul>
          </div>

          <button onClick={signOut} className="w-full rounded-full border-hairline px-5 py-2.5 text-sm hover:bg-secondary inline-flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </aside>
      </section>
    </>
  );
}
