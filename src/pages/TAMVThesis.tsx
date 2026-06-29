import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Crown,
  ScrollText,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Network,
  Layers,
  Quote,
  HeartHandshake,
  Compass,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import FooterSection from "@/components/FooterSection";
import { SEOMeta } from "@/components/SEOMeta";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TAMV_THESIS } from "@/data/tamv-thesis";

const STATUS_STYLE: Record<string, string> = {
  operativa:
    "border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]",
  construccion:
    "border-[hsl(var(--electric))]/40 bg-[hsl(var(--electric))]/10 text-[hsl(var(--electric-light))]",
  planeada:
    "border-[hsl(var(--platinum))]/30 bg-[hsl(var(--platinum))]/5 text-[hsl(var(--platinum))]",
  ratified:
    "border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))]",
  review:
    "border-[hsl(var(--electric))]/40 bg-[hsl(var(--electric))]/10 text-[hsl(var(--electric-light))]",
  draft:
    "border-[hsl(var(--platinum))]/30 bg-[hsl(var(--platinum))]/5 text-[hsl(var(--platinum))]",
};

const TAMVThesis = () => {
  const t = TAMV_THESIS;

  return (
    <>
      <SEOMeta
        title="Tesis Soberana TAMV — Nodo Cero Real del Monte"
        description="Documento maestro público del primer Sistema Operativo Civilizatorio Triple-Federado. Anclajes verificables: ORCID, Zenodo DOI, GitHub, BookPI."
      />
      <div className="min-h-screen bg-background relative">
        <NavBar />

        <main className="container mx-auto px-6 pt-32 pb-24 relative z-10">
          {/* HERO */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <Badge
              variant="outline"
              className="mb-6 px-4 py-2 border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5"
            >
              <Crown className="w-4 h-4 mr-2 text-[hsl(var(--gold))]" />
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]">
                TAMV Online Network™ · Tesis Soberana
              </span>
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-light mb-6 leading-tight">
              <span className="text-gradient-gold">{t.meta.title.split("—")[0].trim()}</span>
              <br />
              <span className="text-foreground/85 text-3xl md:text-5xl">
                {t.meta.title.split("—")[1]?.trim()}
              </span>
            </h1>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t.meta.subtitle}
            </p>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-[hsl(var(--gold))] mt-8">
              {t.meta.method}
            </p>
          </motion.section>

          {/* ARQUITECTO + ANCLAJES */}
          <section className="grid md:grid-cols-2 gap-6 mb-20">
            <motion.article
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <HeartHandshake className="w-5 h-5 text-[hsl(var(--gold))]" />
                <h2 className="font-display text-2xl">El Arquitecto</h2>
              </div>
              <p className="font-display text-xl text-foreground/90 leading-snug">
                {t.biography.name}
              </p>
              <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mt-2">
                {t.biography.role}
              </p>
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="text-center">
                  <p className="font-display text-3xl text-[hsl(var(--gold))]">
                    {t.biography.hours.toLocaleString()}
                  </p>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
                    Horas dedicadas
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-display text-3xl text-[hsl(var(--electric))]">
                    {t.biography.yearsAlone}
                  </p>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
                    Años en soledad creativa
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-display text-3xl text-[hsl(var(--platinum))]">9</p>
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
                    Manuscritos integrados
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-border/50">
                <p className="font-body text-xs text-muted-foreground italic">
                  Dedicado a <span className="text-[hsl(var(--gold))]">{t.meta.dedicatedTo}</span>
                </p>
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-[hsl(var(--electric))]" />
                <h2 className="font-display text-2xl">Anclajes Públicos Verificables</h2>
              </div>
              <p className="font-body text-xs text-muted-foreground mb-5">
                Cada nodo del corpus está atado a una huella pública independiente.
              </p>
              <ul className="space-y-2">
                {t.anchors.map((a) => (
                  <li key={a.url}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-background/40 border border-border/40 hover:border-[hsl(var(--electric))]/40 hover:bg-[hsl(var(--electric))]/5 transition-all group"
                    >
                      <span className="font-body text-sm text-foreground/85 group-hover:text-[hsl(var(--electric-light))]">
                        {a.label}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[hsl(var(--electric-light))]" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.article>
          </section>

          {/* PILARES */}
          <section className="mb-20">
            <h2 className="font-display text-3xl md:text-4xl text-center mb-10">
              Tres <span className="text-gradient-gold">Pilares</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {t.pillars.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-6"
                >
                  <Sparkles className="w-5 h-5 text-[hsl(var(--gold))] mb-3" />
                  <h3 className="font-display text-2xl mb-2">{p.name}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* FEDERACIONES */}
          <section className="mb-20">
            <div className="flex items-center justify-center gap-3 mb-10">
              <Network className="w-6 h-6 text-[hsl(var(--electric))]" />
              <h2 className="font-display text-3xl md:text-4xl text-center">
                Siete <span className="text-gradient-electric">Federaciones</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {t.federations.map((f, i) => (
                <motion.article
                  key={f.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                        {f.id}
                      </p>
                      <h3 className="font-display text-xl mt-0.5">{f.name}</h3>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[9px] tracking-[0.2em] uppercase ${STATUS_STYLE[f.status]}`}
                    >
                      {f.status}
                    </Badge>
                  </div>
                  <p className="font-body text-xs text-[hsl(var(--gold))]/80 mb-2">{f.domain}</p>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </section>

          {/* CAPAS */}
          <section className="mb-20">
            <div className="flex items-center justify-center gap-3 mb-10">
              <Layers className="w-6 h-6 text-[hsl(var(--gold))]" />
              <h2 className="font-display text-3xl md:text-4xl text-center">
                Las 8 Capas Civilizatorias
              </h2>
            </div>
            <div className="glass-card rounded-2xl p-6 md:p-8">
              <ol className="space-y-3">
                {t.layers.map((l) => (
                  <li
                    key={l.level}
                    className="flex items-start gap-4 py-3 border-b border-border/30 last:border-0"
                  >
                    <span className="font-display text-3xl text-[hsl(var(--gold))] min-w-[2.5rem]">
                      L{l.level}
                    </span>
                    <div className="flex-1">
                      <p className="font-display text-lg text-foreground/90">{l.name}</p>
                      <p className="font-body text-sm text-muted-foreground">{l.role}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* RFCs */}
          <section className="mb-20">
            <h2 className="font-display text-3xl md:text-4xl text-center mb-10">
              RFCs <span className="text-gradient-gold">TAMV</span>
            </h2>
            <div className="space-y-3">
              {t.rfcs.map((r, i) => (
                <motion.article
                  key={r.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-[hsl(var(--gold))]">
                        {r.id}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[9px] tracking-[0.2em] uppercase ${STATUS_STYLE[r.status]}`}
                      >
                        {r.status}
                      </Badge>
                    </div>
                    <h3 className="font-display text-lg">{r.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-1">{r.summary}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          {/* MADUREZ */}
          <section className="mb-20">
            <h2 className="font-display text-3xl md:text-4xl text-center mb-10">
              Madurez <span className="text-gradient-electric">Declarada</span>
            </h2>
            <div className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
              {t.maturity.map((m) => (
                <div key={m.area}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-body text-sm text-foreground/85">{m.area}</span>
                    <span className="font-mono text-xs text-[hsl(var(--gold))]">{m.percent}%</span>
                  </div>
                  <Progress value={m.percent} className="h-1.5" />
                  <p className="font-body text-[11px] text-muted-foreground mt-1.5">{m.note}</p>
                </div>
              ))}
            </div>
          </section>

          {/* DIAGNÓSTICO */}
          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-8 md:p-10 max-w-4xl mx-auto border-[hsl(var(--terracotta))]/30"
              style={{ borderWidth: 1 }}
            >
              <Compass className="w-7 h-7 text-[hsl(var(--terracotta))] mb-4" />
              <h2 className="font-display text-3xl mb-3">
                Diagnóstico:{" "}
                <span className="text-[hsl(var(--terracotta))]">{t.diagnosis.name}</span>
              </h2>
              <p className="font-body text-base text-muted-foreground leading-relaxed">
                {t.diagnosis.description}
              </p>
            </motion.div>
          </section>

          {/* AXIOMAS */}
          <section className="mb-20">
            <h2 className="font-display text-3xl md:text-4xl text-center mb-10">
              Cinco <span className="text-gradient-gold">Axiomas Operativos</span>
            </h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {t.axioms.map((a, i) => (
                <motion.blockquote
                  key={a}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-xl p-5 flex items-start gap-4"
                >
                  <Quote className="w-5 h-5 text-[hsl(var(--gold))] flex-shrink-0 mt-1" />
                  <p className="font-display text-lg md:text-xl text-foreground/90 leading-snug italic">
                    {a}
                  </p>
                </motion.blockquote>
              ))}
            </div>
          </section>

          {/* CTA FINAL */}
          <section className="text-center">
            <Link
              to="/tamv"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] text-[hsl(var(--navy-dark))] font-body text-xs tracking-[0.3em] uppercase font-semibold hover:shadow-[var(--shadow-gold)] transition-all"
            >
              <ScrollText className="w-4 h-4" />
              Volver al Civilization Hub
            </Link>
          </section>
        </main>

        <FooterSection />
      </div>
    </>
  );
};

export default TAMVThesis;
