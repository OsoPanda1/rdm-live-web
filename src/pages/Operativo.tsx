// @ts-nocheck
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Circle, Clock3, Layers3 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import SEOMeta from "@/components/SEOMeta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  OPERATIVE_MODULES,
  overallCompletion,
  summarizeByDomain,
} from "@/data/operativo-modules";
import type { ModuleStatus } from "@/lib/types/operativo";

const statusMeta: Record<ModuleStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  done: {
    label: "Listo",
    className: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    Icon: CheckCircle2,
  },
  "in-progress": {
    label: "En progreso",
    className: "border-amber-300/30 bg-amber-300/10 text-amber-100",
    Icon: Clock3,
  },
  design: {
    label: "Diseño",
    className: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
    Icon: Circle,
  },
};

const Operativo = () => {
  const overall = overallCompletion();
  const domains = summarizeByDomain();

  return (
    <MainLayout>
      <SEOMeta
        title="Operativo RDM·X — Estado de módulos en producción"
        description="Tablero vivo del documento maestro: módulos backend, frontend, IA, gemelos digitales y plataforma con su nivel de completitud."
      />

      <section className="container mx-auto px-6 pb-24 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-4xl text-center"
        >
          <Badge variant="outline" className="mb-5 border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5 px-4 py-2">
            <Layers3 className="mr-2 h-4 w-4 text-[hsl(var(--gold))]" />
            <span className="font-body text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--gold))]">
              Documento maestro operativo
            </span>
          </Badge>
          <h1 className="font-display text-4xl font-light leading-tight md:text-6xl">
            Estado <span className="text-gradient-gold">operativo</span> del ecosistema
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-body text-base leading-relaxed text-muted-foreground">
            Refleja el contrato de cada módulo derivado de <code className="text-cyan-100/80">docs/</code>:
            qué está listo para producción, qué está en progreso y dónde aún queda diseño por bajar a código.
          </p>
        </motion.div>

        <Card className="mb-10 border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Completitud global
                </p>
                <p className="mt-2 font-display text-5xl font-light text-foreground">{overall}%</p>
              </div>
              <div className="grid flex-1 gap-3 sm:grid-cols-3">
                {(["done", "in-progress", "design"] as ModuleStatus[]).map((s) => {
                  const count = OPERATIVE_MODULES.filter((m) => m.status === s).length;
                  const meta = statusMeta[s];
                  return (
                    <div key={s} className="rounded-xl border border-white/10 bg-background/40 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          {meta.label}
                        </span>
                        <meta.Icon className="h-4 w-4 text-[hsl(var(--gold))]" />
                      </div>
                      <p className="mt-2 font-display text-2xl text-foreground">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <Progress value={overall} className="mt-6" />
          </CardContent>
        </Card>

        <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => (
            <Card key={d.domain} className="border-cyan-200/15 bg-card/50 backdrop-blur-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-display text-lg capitalize text-foreground">{d.domain}</p>
                  <span className="font-mono text-xs text-cyan-100/70">
                    {d.done}/{d.total}
                  </span>
                </div>
                <Progress value={d.completion} />
                <p className="mt-2 text-xs text-muted-foreground">{d.completion}% promedio</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {OPERATIVE_MODULES.map((m, i) => {
            const meta = statusMeta[m.status];
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="h-full border-[hsl(var(--gold))]/15 bg-card/60 backdrop-blur-md transition-all hover:border-[hsl(var(--gold))]/35">
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="font-display text-xl font-light">{m.name}</CardTitle>
                        <p className="mt-1 font-body text-[10px] uppercase tracking-[0.22em] text-cyan-100/60">
                          {m.domain}
                        </p>
                      </div>
                      <Badge variant="outline" className={meta.className}>
                        <meta.Icon className="mr-1 h-3 w-3" />
                        {meta.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={m.completion} />
                    <p className="mt-2 text-xs text-muted-foreground">{m.completion}% completado</p>
                    {m.notes && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.notes}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {m.spec && (
                        <code className="rounded-md bg-black/25 px-2 py-1 text-[11px] text-slate-200">
                          {m.spec}
                        </code>
                      )}
                      {m.route && (
                        <Link
                          to={m.route}
                          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100 hover:text-white"
                        >
                          Abrir módulo <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>
    </MainLayout>
  );
};

export default Operativo;