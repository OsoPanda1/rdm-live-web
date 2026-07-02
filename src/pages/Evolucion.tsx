// @ts-nocheck
import { motion } from "framer-motion";
import { Activity, GitCommitHorizontal, Layers3, Network, TrendingUp } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import SEOMeta from "@/components/SEOMeta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fusionRepositories } from "@/data/fusion-repos";
import { OPERATIVE_MODULES, overallCompletion } from "@/data/operativo-modules";

interface TimelineEntry {
  date: string;
  title: string;
  detail: string;
}

const TIMELINE: TimelineEntry[] = [
  {
    date: "2025·Q4",
    title: "Génesis RDM Digital",
    detail: "Arranque del explorador territorial y primeros gemelos digitales locales.",
  },
  {
    date: "2026·Q1",
    title: "Federación de repos",
    detail: "Unificación de Nodo Cero, Twin, Smart City OS y CiteMesh Roots vía submódulos.",
  },
  {
    date: "2026·Q2",
    title: "TAMV + Realito Cloud",
    detail: "Hub TAMV operativo y Realito AI corriendo sobre Lovable Cloud (Gemini).",
  },
  {
    date: "2026·05",
    title: "Cobro real para comercios",
    detail: "Registro, checkout y publicación automática vía webhook + RLS en Supabase.",
  },
  {
    date: "2026·05",
    title: "Documento maestro vivo",
    detail: "Vistas /operativo y /evolucion como tablero de control del ecosistema.",
  },
];

const Evolucion = () => {
  const metrics = [
    {
      label: "Repos integrados",
      value: fusionRepositories.length,
      Icon: Network,
    },
    {
      label: "Módulos catalogados",
      value: OPERATIVE_MODULES.length,
      Icon: Layers3,
    },
    {
      label: "Completitud global",
      value: `${overallCompletion()}%`,
      Icon: TrendingUp,
    },
    {
      label: "Hitos relevantes",
      value: TIMELINE.length,
      Icon: GitCommitHorizontal,
    },
  ];

  return (
    <MainLayout>
      <SEOMeta
        title="Evolución RDM·X — Mega-análisis del ecosistema"
        description="Línea de tiempo, métricas de adopción de módulos y trayectoria del ecosistema RDM Digital Nexus."
      />

      <section className="container mx-auto px-6 pb-24 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-4xl text-center"
        >
          <Badge variant="outline" className="mb-5 border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5 px-4 py-2">
            <Activity className="mr-2 h-4 w-4 text-[hsl(var(--gold))]" />
            <span className="font-body text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--gold))]">
              Mega-análisis de evolución
            </span>
          </Badge>
          <h1 className="font-display text-4xl font-light leading-tight md:text-6xl">
            Trayectoria del <span className="text-gradient-gold">ecosistema</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-relaxed text-muted-foreground">
            Cómo RDM Digital pasó de un explorador local a una federación operativa
            con gemelos digitales, IA soberana y economía local activable.
          </p>
        </motion.div>

        <div className="mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label} className="border-cyan-200/15 bg-card/50 backdrop-blur-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {m.label}
                  </p>
                  <m.Icon className="h-4 w-4 text-[hsl(var(--gold))]" />
                </div>
                <p className="font-display text-3xl font-light text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-[hsl(var(--gold))]/15 bg-card/60 backdrop-blur-md">
          <CardContent className="p-6">
            <h2 className="mb-6 font-display text-2xl font-light">Línea de tiempo</h2>
            <ol className="relative ml-3 border-l border-[hsl(var(--gold))]/25">
              {TIMELINE.map((t, i) => (
                <motion.li
                  key={t.title}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="mb-8 ml-6"
                >
                  <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full border border-[hsl(var(--gold))]/60 bg-background" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-100/70">{t.date}</p>
                  <h3 className="mt-1 font-display text-lg text-foreground">{t.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.detail}</p>
                </motion.li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
};

export default Evolucion;