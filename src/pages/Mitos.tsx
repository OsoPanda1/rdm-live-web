// @ts-nocheck
import { motion, useScroll, useTransform } from "framer-motion";
import { Ghost, Moon, Skull, Flame, BookOpen, Mountain } from "lucide-react";

const legends = [
  {
    id: "llorona-minera",
    title: "La Llorona de la Mina",
    epoch: "Siglo XVIII",
    icon: Ghost,
    color: "from-electric/30 to-transparent",
    excerpt:
      "Cuentan los viejos mineros que en los túneles abandonados de la mina de Acosta, cuando la lámpara se apaga, se escucha el llanto de una mujer que perdió a su hijo en un derrumbe. Quien la sigue, no vuelve a ver la luz del sol.",
    moral: "Respeta los socavones: la montaña guarda memoria.",
  },
  {
    id: "carruaje-ingles",
    title: "El Carruaje Inglés",
    epoch: "1875",
    icon: Moon,
    color: "from-gold/30 to-transparent",
    excerpt:
      "En las noches de niebla espesa, vecinos del Panteón Inglés juran haber visto un carruaje negro tirado por caballos sin jinete que cruza la calle principal. Adentro, la silueta de un capataz británico cuenta monedas que nunca se acaban.",
    moral: "La codicia no se entierra: viaja con uno hasta la última estación.",
  },
  {
    id: "duende-veta",
    title: "El Duende de la Veta",
    epoch: "Tradición oral",
    icon: Flame,
    color: "from-copper/30 to-transparent",
    excerpt:
      "Un pequeño ser de barba blanca aparece a los mineros que trabajan solos. Si le ofreces un trago de aguardiente, te muestra la veta más rica. Si te burlas de él, la mina se te traga.",
    moral: "Antes de extraer, hay que ofrendar.",
  },
  {
    id: "novia-mineral",
    title: "La Novia de Mineral",
    epoch: "1902",
    icon: Skull,
    color: "from-teal/30 to-transparent",
    excerpt:
      "Esperando a su prometido inglés que partió a Pachuca y nunca volvió, una joven realmontense subió al cerro del Judío con su vestido de novia. Hoy, las parejas que suben al mirador escuchan un suspiro entre el viento.",
    moral: "El amor mal correspondido se queda en el paisaje.",
  },
  {
    id: "paste-fantasma",
    title: "El Paste Fantasma",
    epoch: "Cocina viva",
    icon: Flame,
    color: "from-gold/30 to-transparent",
    excerpt:
      "En la pastería más antigua del pueblo, cada noche aparece un paste recién horneado que nadie cocinó. Dicen que es la abuela inglesa que enseñó la receta original y todavía vigila la masa.",
    moral: "La tradición no se hereda: se aparece.",
  },
  {
    id: "campana-muda",
    title: "La Campana Muda",
    epoch: "Templo de la Asunción",
    icon: BookOpen,
    color: "from-platinum/30 to-transparent",
    excerpt:
      "Una de las campanas del templo no suena desde 1920. Cuentan que enmudeció el día que un minero murió rezando. Repica sola, dicen, cuando alguien va a perder a alguien en la mina.",
    moral: "El silencio también avisa.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

function FloatingMist() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" as const }}
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 10% 0%, rgba(148,163,184,0.12), transparent 60%), radial-gradient(ellipse 60% 40% at 90% 20%, rgba(56,189,248,0.15), transparent 70%), radial-gradient(ellipse 80% 60% at 50% 100%, rgba(250,204,21,0.08), transparent 65%)",
          backgroundSize: "200% 200%",
        }}
      />
    </div>
  );
}

function Starfield() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-30">
      <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.04),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.03),transparent_50%)]" />
    </div>
  );
}

export default function Mitos() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-8%"]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617]">
      {/* Capas atmosféricas */}
      <Starfield />
      <FloatingMist />

      {/* Hero cinematográfico */}
      <section className="relative overflow-hidden px-6 pt-28 pb-20 lg:px-12">
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 2 }}
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--gold)/0.10),transparent_45%),radial-gradient(circle_at_80%_0%,hsl(var(--electric)/0.11),transparent_55%)]"
        />
        <motion.div style={{ y: heroY }} className="relative mx-auto max-w-5xl text-center">
          <motion.div
            {...fadeUp}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/40 bg-black/40 px-4 py-2 backdrop-blur"
          >
            <Ghost className="h-3.5 w-3.5 text-electric" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-electric">
              Federación de Cultura y Memoria
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="text-balance text-5xl font-display font-bold leading-[1.05] tracking-tight md:text-7xl"
          >
            Mitos y <span className="text-gradient-gold">Leyendas</span>
            <br />
            del{" "}
            <span className="not-italic text-electric/90 underline decoration-electric/40 decoration-wavy underline-offset-4">
              Mineral
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-balance text-base font-body leading-relaxed text-muted-foreground md:text-lg"
          >
            Real del Monte se cuenta a sí mismo en la voz de sus abuelos, en el
            crujir de sus minas y en el viento del Panteón Inglés. Estas son
            las historias que la montaña se niega a olvidar.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.3 }}
            className="mt-9 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground"
          >
            <Mountain className="h-3 w-3 text-gold" />
            <span>Archivo vivo · Curaduría TAMV Online</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Grid editorial */}
      <section className="px-6 pb-24 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-7 md:grid-cols-2">
          {legends.map((l, i) => {
            const Icon = l.icon;
            return (
              <motion.article
                key={l.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.06 * i }}
                whileHover={{ y: -6, rotateX: 1.5 }}
                className="group relative overflow-hidden rounded-3xl border border-border/20 bg-gradient-to-b from-slate-900/70 to-slate-950/90 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all hover:border-gold/40 hover:shadow-[0_22px_70px_rgba(0,0,0,0.7)]"
              >
                {/* Aura de color por leyenda */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-gradient-to-br ${l.color} blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
                />

                {/* Borde lumínico inferior */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-40"
                />

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/40 bg-black/40 shadow-[0_0_0_1px_rgba(15,23,42,0.7)] transition-colors group-hover:border-gold/60">
                        <Icon className="h-5 w-5 text-gold" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-mono uppercase tracking-[0.26em] text-muted-foreground">
                          {l.epoch}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.20em] text-gold/80">
                          Crónica del Mineral
                        </span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-display font-bold leading-tight md:text-[26px]">
                    {l.title}
                  </h2>

                  <p className="mt-4 text-sm font-body leading-relaxed text-slate-200/90">
                    {l.excerpt}
                  </p>

                  <div className="mt-6 border-t border-border/25 pt-5">
                    <p className="mb-1.5 text-[10px] font-mono uppercase tracking-[0.25em] text-gold/80">
                      Lo que enseña
                    </p>
                    <p className="text-[13px] font-body italic text-slate-100/90">
                      &laquo; {l.moral} &raquo;
                    </p>
                  </div>

                  {/* Micro‑detalle en esquina */}
                  <div className="mt-4 flex items-center justify-end gap-1 text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">
                    <span className="h-px w-8 bg-slate-600/60" />
                    <span>Registro {String(i + 1).padStart(2, "0")}</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Cierre editorial / invitación */}
        <motion.div
          {...fadeUp}
          className="mx-auto mt-20 max-w-3xl rounded-3xl border border-gold/25 bg-gradient-to-b from-slate-900/80 to-slate-950/95 p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-black/40">
            <BookOpen className="h-6 w-6 text-gold" />
          </div>
          <h3 className="text-2xl font-display font-bold md:text-3xl">
            ¿Conoces una leyenda que aún no contamos?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm font-body leading-relaxed text-muted-foreground">
            Este archivo vive mientras la comunidad lo alimente. Comparte tu
            historia en el módulo de Comunidad y el consejo editorial del RDM
            decidirá si la montaña la adopta.
          </p>
          <a
            href="/comunidad"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-electric px-5 py-3 text-[12px] font-body font-semibold text-slate-950 shadow-[0_18px_45px_rgba(250,204,21,0.35)] transition-all hover:shadow-[0_22px_55px_rgba(250,204,21,0.55)]"
          >
            Compartir mi leyenda
          </a>
          <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.18em] text-gold/70">
            Archivo curado · No todas las historias salen a la luz
          </p>
        </motion.div>
      </section>
    </div>
  );
}