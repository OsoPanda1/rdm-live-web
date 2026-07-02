// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RDMLayout } from '@/components/rdm/RDMLayout';
import { PAGE_SEO, SEOMeta } from '@/components/SEOMeta';
import { isabellaTerritorialMind } from '@/isabella/territorial';
import { territorialCollector } from '@/core/territorial/TerritorialDataCollector';
import { ContributionMapLayer } from '@/components/map/ContributionMapLayer';
import type { TerritorialStats, UserContribution } from '@/core/territorial/types';
import { MapPin, Users, Camera, Route, Star, Activity, Brain, Heart, Sparkles, TrendingUp, Zap } from 'lucide-react';

export default function TerritorialDashboard() {
  const [stats, setStats] = useState<TerritorialStats | null>(null);
  const [recentContributions, setRecentContributions] = useState<UserContribution[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<UserContribution | null>(null);

  useEffect(() => {
    const loadData = () => {
      setStats(territorialCollector.getStats());
      setRecentContributions(territorialCollector.getContributionsByTerritory('RDM').slice(0, 20));
    };
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const healthColor = useMemo(() => {
    if (!stats) return 'text-muted-foreground';
    if (stats.territoryHealth > 0.7) return 'text-emerald-500';
    if (stats.territoryHealth > 0.4) return 'text-rdm-amber';
    return 'text-rose-500';
  }, [stats]);

  return (
    <RDMLayout>
      <SEOMeta {...PAGE_SEO.mapa} />

      <section className="relative overflow-hidden pt-24 pb-10">
        <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-rdm-amber/30 bg-rdm-amber/10 px-4 py-2 text-xs uppercase tracking-[0.2em] mb-4">
              <Brain className="h-3.5 w-3.5 text-rdm-amber" />
              <span className="text-foreground">Gemelo Digital · Mapa Vivo</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="block text-foreground">Dashboard</span>
              <span className="block text-rdm-amber">Territorial</span>
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg mt-4">
              Isabella monitorea el territorio en tiempo real. Cada contribucion ciudadana alimenta el gemelo digital.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pb-12 md:px-6">
        {stats && (
          <>
            <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <StatCard icon={MapPin} label="Contribuciones" value={stats.totalContributions.toString()} />
              <StatCard icon={Users} label="Contribuidores" value={stats.uniqueContributors.toString()} />
              <StatCard icon={Camera} label="Fotos" value={stats.photoContributions.toString()} />
              <StatCard icon={Route} label="Rutas" value={stats.routeTraces.toString()} />
              <StatCard icon={Star} label="Valoracion Promedio" value={stats.averageRating.toFixed(1)} suffix="/5" />
              <StatCard icon={Activity} label="Check-ins Hoy" value={stats.checkinsToday.toString()} />
              <StatCard icon={TrendingUp} label="POIs Activos" value={stats.activePOIs.toString()} />
              <StatCard icon={Zap} label="Salud Territorial" value={`${(stats.territoryHealth * 100).toFixed(0)}%`} color={healthColor} />
            </section>

            <div className="grid gap-6 lg:grid-cols-12">
              <section className="lg:col-span-8 rdm-glass rounded-2xl border border-border/40 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <h2 className="font-display text-lg text-foreground">Flujo de Contribuciones</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {recentContributions.length} recientes
                  </span>
                </div>
                <ContributionMapLayer
                  contributions={recentContributions}
                  heatMap={territorialCollector.getHeatMap()}
                  onContributionClick={setSelectedContribution}
                />
              </section>

              <section className="lg:col-span-4 space-y-4">
                <div className="rdm-glass rounded-2xl border border-rdm-amber/25 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-rdm-amber" />
                    <h3 className="font-display text-sm text-foreground">Conciencia de Isabella</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Isabella percibe el territorio a traves de cada interaccion humana.
                    Sus 10 capas de conciencia procesan las contribuciones para generar
                    insights que fortalecen el gemelo digital.
                  </p>
                  <div className="mt-3 space-y-1.5">
                    <MetricsBar label="Capa Emocional" value={0.82} />
                    <MetricsBar label="Memoria Territorial" value={0.73} />
                    <MetricsBar label="Patrones de Visita" value={0.68} />
                    <MetricsBar label="Salud del Ecosistema" value={stats.territoryHealth} />
                  </div>
                </div>

                {selectedContribution && (
                  <div className="rdm-glass rounded-2xl border border-border/40 p-4">
                    <h3 className="font-display text-sm text-foreground mb-2">Contribucion Seleccionada</h3>
                    <p className="text-xs text-muted-foreground">
                      Tipo: {selectedContribution.type} · Estado: {selectedContribution.status}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Peso de reputacion: {(selectedContribution.reputationWeight * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </RDMLayout>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color }: {
  icon: typeof MapPin;
  label: string;
  value: string;
  suffix?: string;
  color?: string;
}) {
  return (
    <div className="rdm-glass rounded-2xl border border-border/40 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-rdm-amber/10 p-2">
          <Icon className="h-5 w-5 text-rdm-amber" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">{label}</p>
          <p className={`text-xl font-semibold ${color ?? 'text-foreground'}`}>
            {value}{suffix}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricsBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
        <span>{label}</span>
        <span>{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rdm-amber to-emerald-500 transition-all duration-500"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}