// @ts-nocheck
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ExternalLink, GitBranch, Layers3, Network } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import SEOMeta from "@/components/SEOMeta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fusionIntegrationFlow,
  fusionPillars,
  fusionRepositories,
  getFusionReadiness,
} from "@/data/fusion-repos";

const statusLabel = {
  integrado: "Integrado",
  orquestado: "Orquestado",
  "pendiente-remoto": "Pendiente remoto",
};

const statusClass = {
  integrado: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  orquestado: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  "pendiente-remoto": "border-amber-300/30 bg-amber-300/10 text-amber-100",
};

const FusionEcosystem = () => {
  const readiness = getFusionReadiness();

  return (
    <MainLayout>
      <SEOMeta
        title="Fusión Funcional RDM·X — Nodo Cero, Turismo, Twin y CiteMesh"
        description="Panel operativo que unifica RDM Digital Nodo Cero, RDM Turismo Digital, Real del Monte Twin y CiteMesh Roots dentro de RDM Digital Nexus."
      />

      <section className="container mx-auto px-6 pb-24 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-14 max-w-5xl text-center"
        >
          <Badge variant="outline" className="mb-5 border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5 px-4 py-2">
            <GitBranch className="mr-2 h-4 w-4 text-[hsl(var(--gold))]" />
            <span className="font-body text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--gold))]">
              Fusión funcional · 4 repositorios
            </span>
          </Badge>
          <h1 className="font-display text-4xl font-light leading-tight md:text-7xl">
            Unificación <span className="text-gradient-gold">RDM·X</span> operativa
          </h1>
          <p className="mx-auto mt-6 max-w-3xl font-body text-base leading-relaxed text-muted-foreground md:text-lg">
            Nodo Cero, Turismo Digital, Gemelo Digital y CiteMesh Roots dejan de verse como piezas aisladas:
            aquí se exponen como un solo sistema navegable con rutas, contratos y responsabilidades claras.
          </p>
        </motion.div>

        <div className="mb-12 grid gap-4 md:grid-cols-4">
          <Card className="border-[hsl(var(--gold))]/20 bg-card/60 backdrop-blur-md md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Readiness</p>
                  <p className="mt-2 font-display text-5xl font-light text-foreground">{readiness}%</p>
                </div>
                <div className="h-24 w-24 rounded-full border border-[hsl(var(--gold))]/25 bg-[radial-gradient(circle,hsla(43,90%,60%,0.24),transparent_68%)] p-3">
                  <div className="flex h-full w-full items-center justify-center rounded-full border border-cyan-200/20 bg-slate-950/60">
                    <Network className="h-9 w-9 text-cyan-100" />
                  </div>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-[hsl(var(--gold))] to-emerald-300" style={{ width: `${readiness}%` }} />
              </div>
            </CardContent>
          </Card>

          {fusionPillars.map((pillar, index) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 + 0.1 }}
            >
              <Card className="h-full border-cyan-200/10 bg-card/50 backdrop-blur-md">
                <CardContent className="p-6">
                  <pillar.icon className="mb-4 h-7 w-7 text-[hsl(var(--gold))]" />
                  <h2 className="font-display text-xl text-foreground">{pillar.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mb-14 grid gap-5 lg:grid-cols-2">
          {fusionRepositories.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.06, duration: 0.5 }}
            >
              <Card className="h-full border-[hsl(var(--gold))]/15 bg-card/60 backdrop-blur-md transition-all hover:border-[hsl(var(--gold))]/35">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="font-display text-2xl font-light">{repo.name}</CardTitle>
                      <p className="mt-1 font-body text-[10px] uppercase tracking-[0.22em] text-cyan-100/60">{repo.role}</p>
                    </div>
                    <Badge variant="outline" className={statusClass[repo.status]}>
                      {statusLabel[repo.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{repo.summary}</p>

                  <div className="mb-5 flex flex-wrap gap-2">
                    {repo.stack.map((item) => (
                      <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {repo.capabilities.map((capability) => (
                      <div key={capability.id} className="rounded-xl border border-white/10 bg-background/35 p-4">
                        <capability.icon className="mb-3 h-5 w-5 text-[hsl(var(--gold))]" />
                        <h3 className="font-display text-lg text-foreground">{capability.label}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{capability.description}</p>
                        {capability.route && (
                          <Link to={capability.route} className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100 hover:text-white">
                            Abrir ruta <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-[hsl(var(--gold))]/10 bg-[hsl(var(--gold))]/5 p-4">
                    <p className="mb-2 flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--gold))]">
                      <Layers3 className="h-4 w-4" /> Contratos absorbidos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {repo.contracts.map((contract) => (
                        <code key={contract} className="rounded-md bg-black/25 px-2 py-1 text-[11px] text-slate-200">
                          {contract}
                        </code>
                      ))}
                    </div>
                  </div>

                  <a href={repo.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-cyan-100">
                    Ver repositorio fuente <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="border-cyan-200/15 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="font-display text-2xl font-light">Flujo de integración funcional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              {fusionIntegrationFlow.map((step, index) => (
                <div key={step} className="rounded-xl border border-white/10 bg-background/40 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono text-xs text-cyan-100/70">0{index + 1}</span>
                    <CheckCircle2 className="h-5 w-5 text-emerald-300/80" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
};

export default FusionEcosystem;