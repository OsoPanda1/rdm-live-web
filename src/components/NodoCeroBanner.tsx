import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Crown, ArrowRight, ScrollText, Network, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NodoCeroBanner = () => {
  return (
    <section className="relative py-14 md:py-20 overflow-hidden">
      <div
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{ background: "var(--gradient-premium)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-background/70 pointer-events-none" aria-hidden />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="glass-card rounded-2xl p-8 md:p-12 max-w-5xl mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1">
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5"
              >
                <Crown className="w-3.5 h-3.5 mr-2 text-[hsl(var(--gold))]" />
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]">
                  Nodo Cero · Activo
                </span>
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl leading-tight mb-3">
                Real del Monte opera como{" "}
                <span className="text-gradient-gold">Sistema Operativo Territorial Soberano</span>
              </h2>
              <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                Primer pueblo mágico mexicano con federación triple{" "}
                <span className="text-foreground/80">conceptual · legal · técnica</span>, IA local,
                economía Phoenix 20/30/50 y memoria anclada en IPFS. Tesis pública, código
                auditable.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:min-w-[220px]">
              <Link
                to="/tamv/thesis"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-dark))] text-[hsl(var(--navy-dark))] font-body text-xs tracking-[0.25em] uppercase font-semibold hover:shadow-[var(--shadow-gold)] transition-all"
              >
                <ScrollText className="w-4 h-4" />
                Tesis Soberana
              </Link>
              <Link
                to="/tamv"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[hsl(var(--electric))]/40 bg-[hsl(var(--electric))]/5 text-[hsl(var(--electric-light))] font-body text-xs tracking-[0.25em] uppercase hover:bg-[hsl(var(--electric))]/10 transition-all"
              >
                Civilization Hub
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/fusion"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[hsl(var(--electric))]/40 bg-[hsl(var(--electric))]/5 text-[hsl(var(--electric-light))] font-body text-xs tracking-[0.25em] uppercase hover:bg-[hsl(var(--electric))]/10 transition-all"
              >
                <GitBranch className="w-4 h-4" />
                Fusión RDM·X
              </Link>
              <Link
                to="/tenochtitlan"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[hsl(var(--gold))]/40 bg-[hsl(var(--gold))]/5 text-[hsl(var(--gold))] font-body text-xs tracking-[0.25em] uppercase hover:bg-[hsl(var(--gold))]/10 transition-all"
              >
                <Network className="w-4 h-4" />
                Tenochtitlán
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NodoCeroBanner;
