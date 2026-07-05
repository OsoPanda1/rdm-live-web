import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-rdm.jpg";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  MapPin,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { EVENTS, ROUTES_ITEMS } from "@/data/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Turismo en Real del Monte · RDM Digital" },
      {
        name: "description",
        content:
          "Planea tu visita a Real del Monte: rutas, gastronomía, patrimonio, eventos, comercios y experiencias inteligentes en un solo lugar.",
      },
      { property: "og:title", content: "Descubre Real del Monte · RDM Digital" },
      {
        property: "og:description",
        content: "La plataforma turística territorial de Real del Monte, Hidalgo.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden -mt-24 pt-32 pb-24">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Real del Monte con malla territorial digital"
            className="w-full h-full object-cover opacity-40"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border-hairline glass px-3 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-ring" />
              <span className="font-mono text-[10px] tracking-sovereign text-muted-foreground">
                Pueblo Mágico · Hidalgo · México
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] text-ink">
              Vive Real del Monte
              <br />
              <span className="text-gradient-copper italic">como nunca antes.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl font-body">
              Historia minera, pastes recién horneados, bosques de niebla y experiencias que
              conectan cultura viva con tecnología territorial.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/rutas"
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm hover:bg-accent transition-colors shadow-sovereign"
              >
                Planear mi visita <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/atlas"
                className="inline-flex items-center gap-2 rounded-full border-hairline glass px-6 py-3 text-sm hover:bg-secondary"
              >
                Abrir mapa turístico
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
            {[
              { label: "Rutas curadas", value: ROUTES_ITEMS.length, icon: Compass },
              { label: "Pueblo Mágico", value: "2004", icon: Star },
              { label: "Patrimonio minero", value: "250+", icon: MapPin },
              { label: "Próximo evento", value: "15 OCT", icon: CalendarDays },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border-hairline glass p-4 shadow-card">
                <s.icon className="w-4 h-4 text-accent mb-2" />
                <div className="font-display text-3xl text-ink">{s.value}</div>
                <div className="font-mono text-[10px] tracking-sovereign text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOURISM FIRST */}
      <section className="container mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="font-mono text-[10px] tracking-sovereign text-accent mb-2">
              Primero, tu viaje
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-ink">
              Todo Real del Monte en una sola guía.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Decide qué hacer, dónde comer, cómo llegar y qué está pasando hoy. La tecnología
              trabaja detrás; el territorio está al frente.
            </p>
          </div>
          <Link
            to="/rutas"
            className="text-sm inline-flex items-center gap-1 text-accent hover:underline"
          >
            Ver itinerarios <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              to: "/rutas",
              icon: Compass,
              title: "Rutas",
              desc: "Cinco itinerarios por minas, pastes, arquitectura y bosque.",
            },
            {
              to: "/gastronomia",
              icon: UtensilsCrossed,
              title: "Sabores",
              desc: "Pastes, cocina minera, café de olla y productores locales.",
            },
            {
              to: "/comercios",
              icon: Store,
              title: "Dónde ir",
              desc: "Hospedaje, restaurantes, guías y comercios verificados.",
            },
            {
              to: "/eventos",
              icon: CalendarDays,
              title: "Agenda",
              desc: "Festivales, recorridos, cultura y actividades de temporada.",
            },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-2xl border-hairline bg-card p-6 hover:shadow-sovereign transition-all hover:-translate-y-1"
            >
              <item.icon className="w-5 h-5 text-accent" />
              <h3 className="font-display text-2xl text-ink mt-4">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* MODULES GRID */}
      <section className="container mx-auto px-6 py-24 border-t border-hairline">
        <div className="font-mono text-[10px] tracking-sovereign text-accent mb-2">
          Después, participa
        </div>
        <h2 className="font-display text-4xl md:text-5xl text-ink max-w-3xl">
          Una comunidad que recompensa explorar y compartir.
        </h2>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              to: "/comunidad",
              icon: Star,
              title: "Experiencias y reseñas",
              desc: "Comparte tu visita y califica los lugares registrados.",
            },
            {
              to: "/galeria",
              icon: MapPin,
              title: "Galería viajera",
              desc: "Fotografías del territorio publicadas por la comunidad.",
            },
            {
              to: "/rdm-quest",
              icon: Star,
              title: "RDM Quest",
              desc: "Gamificación federada: misiones, niveles y recompensas territoriales.",
            },
            {
              to: "/membresias",
              icon: Store,
              title: "Membresías",
              desc: "Beneficios para viajeros y herramientas para comercios locales.",
            },
            {
              to: "/tienda",
              icon: Store,
              title: "Tienda RDM",
              desc: "Artículos exclusivos que sostienen la plataforma territorial.",
            },
            {
              to: "/musica",
              icon: Star,
              title: "Memoria sonora",
              desc: "Música, relatos y paisajes sonoros de la Comarca Minera.",
            },
            {
              to: "/auth",
              icon: Compass,
              title: "Mi perfil",
              desc: "Guarda rutas, suma puntos y personaliza tu experiencia.",
            },
          ].map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group rounded-2xl border-hairline bg-card p-6 hover:shadow-sovereign transition-all hover:-translate-y-1"
            >
              <m.icon className="w-5 h-5 text-accent" />
              <div className="font-display text-2xl text-ink mt-4 group-hover:text-accent transition-colors">
                {m.title}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
              <div className="mt-4 font-mono text-[10px] tracking-sovereign text-muted-foreground inline-flex items-center gap-1 group-hover:text-accent">
                Entrar <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="font-mono text-[10px] tracking-sovereign opacity-70">
              Visión LTOS Territorial
            </div>
            <h2 className="font-display text-3xl md:text-5xl mt-2">
              El primer Pueblo Mágico turístico territorial operativo de Latinoamérica.
            </h2>
            <p className="mt-4 max-w-2xl opacity-75">
              Un híbrido de turismo, cultura, comercio, comunidad, ciudad inteligente, gemelo
              digital y gobernanza; organizado para servir primero a quien visita Real del Monte.
            </p>
          </div>
          <Link
            to="/ltos"
            className="inline-flex items-center gap-2 rounded-full bg-background text-foreground px-6 py-3 text-sm"
          >
            Conocer la infraestructura <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
