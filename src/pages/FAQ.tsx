import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Search, MessageCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { SEOMeta } from "@/components/SEOMeta";

type FaqItemData = { q: string; a: string };
type FaqGroup = { group: string; key: string; items: FaqItemData[] };

const FAQ_GROUPS: FaqGroup[] = [
  {
    group: "Turismo y experiencia",
    key: "turismo",
    items: [
      { q: "¿Qué es Real del Monte?", a: "Real del Monte (Mineral del Monte) es un Pueblo Mágico de Hidalgo, México, célebre por su herencia minera, la influencia inglesa de Cornualles, los pastes, el Panteón Inglés y su clima de montaña a 2,700 m de altitud." },
      { q: "¿Cómo uso el mapa interactivo?", a: "En la página de inicio, sección Mapa, puedes ver sitios, museos, ecoturismo y comercios. Usa el botón “Centrar en mí” para activar tu geolocalización y filtra por categoría y tipo de lugar." },
      { q: "¿Qué son las rutas turísticas?", a: "Son recorridos temáticos (patrimonio, gastronomía, miradores, nocturna, romántica, platera y más) que conectan historias, lugares y comercios locales en una sola experiencia guiada." },
    ],
  },
  {
    group: "Historia, mitos y cultura",
    key: "historia",
    items: [
      { q: "¿Por qué hay influencia inglesa en Real del Monte?", a: "En el siglo XIX, mineros de Cornualles (Inglaterra) llegaron para trabajar las minas. Dejaron el fútbol, el paste y el Panteón Inglés, únicos en México por orientar las tumbas hacia su tierra natal." },
      { q: "¿Cuáles son las leyendas más conocidas?", a: "Destacan las Peñas Cargadas, los relatos de túneles encantados de las minas y apariciones del Panteón Inglés. Encuéntralas en la sección Mitos y Leyendas del Plano I." },
      { q: "¿Qué es el paste?", a: "Es una empanada horneada heredada del Cornish pasty inglés, hoy símbolo gastronómico del pueblo, con rellenos tradicionales (papa con carne) y dulces." },
    ],
  },
  {
    group: "Cuenta, perfil y comunidad",
    key: "comunidad",
    items: [
      { q: "¿Necesito registrarme?", a: "Puedes explorar gran parte del contenido sin cuenta. Para participar en la comunidad, gestionar tu perfil, activar membresías o usar la Mina necesitas iniciar sesión." },
      { q: "¿Cómo edito mi perfil?", a: "Entra a Mi Perfil desde el menú o el botón Cuenta. Ahí puedes actualizar tu nombre para mostrar y tu avatar, y revisar tu membresía y progreso minero." },
      { q: "¿Mis datos están protegidos?", a: "Sí. La plataforma usa autenticación segura y políticas de acceso por fila (RLS): cada usuario solo puede ver y editar su propia información." },
    ],
  },
  {
    group: "Membresías y gamificación",
    key: "membresias",
    items: [
      { q: "¿Qué incluye la membresía Minero RDM?", a: "Por $129 MXN al mes obtienes acceso completo a la Mina, donde acumulas minerales y puntos que puedes canjear por productos reales: pastes, refrescos, joyería de plata, hospedaje, cenas y paseos." },
      { q: "¿Cómo funciona la Mina?", a: "Cada extracción consume energía (que se regenera con el tiempo) y otorga minerales con distinta probabilidad. Los minerales se convierten en puntos canjeables en el catálogo de recompensas." },
      { q: "¿Cómo canjeo mis puntos?", a: "Desde la sección de recompensas de la Mina selecciona el producto disponible; si tienes puntos suficientes y hay stock, se genera tu canje." },
    ],
  },
  {
    group: "Comercios y pagos",
    key: "pagos",
    items: [
      { q: "Tengo un negocio, ¿cómo aparezco en el catálogo?", a: "Usa Registrar Comercio para dar de alta tu negocio, elegir categoría y completar el pago de activación. Tras la confirmación, un administrador aprueba y se publica tu ficha en el catálogo." },
      { q: "¿Cómo se manejan los pagos?", a: "Los pagos se procesan de forma segura mediante nuestra pasarela en línea. Al confirmarse el pago, la publicación de tu comercio queda lista para aprobación y activación." },
      { q: "¿Qué son las donaciones?", a: "Las donaciones apoyan la digitalización del pueblo y la visibilidad de los negocios locales. Puedes contribuir desde la sección Apoya RDM." },
    ],
  },
];

const CATEGORIES = [
  { key: null, label: "Todas" },
  ...FAQ_GROUPS.map((g) => ({ key: g.key, label: g.group })),
];

function FaqItem({ q, a }: FaqItemData) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-surface-strong overflow-hidden transition-shadow hover:shadow-[0_8px_30px_-12px_hsla(195,100%,60%,0.35)]">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-body text-sm text-white/95 md:text-base">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-cyan-200 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_GROUPS.filter((g) => !activeCat || g.key === activeCat)
      .map((g) => ({
        ...g,
        items: q ? g.items.filter((it) => it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q)) : g.items,
      }))
      .filter((g) => g.items.length > 0);
  }, [query, activeCat]);

  const totalResults = results.reduce((acc, g) => acc + g.items.length, 0);

  const askRealito = () => {
    window.dispatchEvent(new CustomEvent("rdm:realito-open", { detail: { question: query } }));
  };

  return (
    <MainLayout>
      <SEOMeta title="Preguntas Frecuentes · RDM Digital" description="Centro de ayuda con artículos por categoría sobre turismo, historia, comunidad, membresías y pagos en Real del Monte, con buscador inteligente." />
      {/* Hero Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        <img src="/images/landscape-fog.jpg" alt="Paisaje de Real del Monte" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      <section className="pb-20 pt-8">
        <div className="container mx-auto max-w-3xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <span className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
              <HelpCircle className="h-3.5 w-3.5" /> Plano II · Centro de Ayuda
            </span>
            <h1 className="mb-3 text-4xl font-bold uppercase leading-[0.9] tracking-tighter md:text-5xl">
              Preguntas <span className="text-gradient-cyan">Frecuentes</span>
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Artículos por categoría sobre turismo, historia, comunidad, membresías y pagos. Busca por tema o pregúntale directamente a Realito.
            </p>
          </motion.div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por tema: pastes, membresía, mapa, leyendas…"
              className="w-full rounded-xl border border-border bg-muted/40 py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
            />
          </div>

          {/* Category chips */}
          <div className="mb-8 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key ?? "all"}
                onClick={() => setActiveCat(c.key)}
                className={`rounded-full px-3.5 py-1.5 font-body text-xs tracking-wide transition-all ${
                  activeCat === c.key ? "bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/35" : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {totalResults === 0 ? (
            <div className="glass-surface-strong p-8 text-center">
              <p className="mb-4 text-sm text-muted-foreground">No encontramos artículos para “{query}”.</p>
              <button onClick={askRealito} className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/20">
                <MessageCircle className="h-4 w-4" /> Pregúntale a Realito AI
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {results.map((g, gi) => (
                <motion.div key={g.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
                  <h2 className="mb-3 font-body text-xs uppercase tracking-[0.24em] text-cyan-100/60">{g.group}</h2>
                  <div className="space-y-3">
                    {g.items.map((it) => (
                      <FaqItem key={it.q} q={it.q} a={it.a} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Realito CTA */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 glass-surface-strong flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="font-body text-base text-white/95">¿No encuentras tu respuesta?</h3>
              <p className="text-sm text-muted-foreground">Realito AI conoce el catálogo, rutas y la historia del pueblo.</p>
            </div>
            <button onClick={askRealito} className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/20">
              <MessageCircle className="h-4 w-4" /> Hablar con Realito
            </button>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
