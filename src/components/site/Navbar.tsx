import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, MapPinned, UserRound } from "lucide-react";

const PRIMARY = [
  { to: "/", label: "Descubre" },
  { to: "/mapa-vivo", label: "Mapa Vivo" },
  { to: "/rutas", label: "Rutas" },
  { to: "/gastronomia", label: "Dónde comer" },
  { to: "/comercios", label: "Directorio" },
  { to: "/eventos", label: "Agenda" },
] as const;

const TOURISM = [
  { to: "/historia", label: "Historia" },
  { to: "/aventura", label: "Aventura" },
  { to: "/cultura", label: "Cultura" },
  { to: "/transporte", label: "Cómo llegar" },
  { to: "/realito", label: "Guía Realito AI" },
] as const;

const COMMUNITY = [
  { to: "/comunidad", label: "Comunidad" },
  { to: "/foros", label: "Foros" },
  { to: "/galeria", label: "Galería" },
  { to: "/musica", label: "Música" },
  { to: "/membresias", label: "Membresías" },
  { to: "/tienda", label: "Tienda RDM" },
] as const;

const SYSTEM = [
  { to: "/atlas", label: "Atlas territorial" },
  { to: "/ltos", label: "Plataforma LTOS" },
  { to: "/federacion", label: "Gobernanza" },
  { to: "/tomos", label: "Tomos" },
  { to: "/nodo-cero", label: "Nodo Cero" },
  { to: "/dichos", label: "Archivo oral" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [exp, setExp] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}
    >
      <div className="container mx-auto px-6">
        <div
          className={`flex items-center justify-between rounded-full border-hairline glass px-4 py-2 transition-all ${scrolled ? "shadow-card" : ""}`}
        >
          <Link to="/" className="flex items-center gap-3">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-aurora text-accent-foreground font-display text-sm shadow-card">
              R
              <span className="absolute -inset-0.5 rounded-full opacity-60 animate-pulse-ring" />
            </span>
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-base text-ink">RDM Digital</span>
              <span className="font-mono text-[9px] tracking-sovereign text-muted-foreground">
                LTOS · Territorial OS
              </span>
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {PRIMARY.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                activeProps={{
                  className: "px-3 py-2 rounded-full text-sm text-foreground bg-secondary",
                }}
              >
                {n.label}
              </Link>
            ))}
            <div className="relative" onMouseLeave={() => setExp(false)}>
              <button
                onClick={() => setExp((v) => !v)}
                onMouseEnter={() => setExp(true)}
                className="px-3 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 inline-flex items-center gap-1"
              >
                Más <ChevronDown className="w-3 h-3" />
              </button>
              {exp && (
                <div className="absolute right-0 top-full mt-2 w-[34rem] rounded-2xl glass border-hairline shadow-sovereign p-4 grid grid-cols-3 gap-4">
                  {[
                    { title: "Visita", items: TOURISM },
                    { title: "Participa", items: COMMUNITY },
                    { title: "Territorio", items: SYSTEM },
                  ].map((group) => (
                    <div key={group.title}>
                      <p className="px-2 pb-2 font-mono text-[9px] tracking-sovereign text-accent">
                        {group.title}
                      </p>
                      {group.items.map((n) => (
                        <Link
                          key={n.to}
                          to={n.to}
                          onClick={() => setExp(false)}
                          className="block px-2 py-2 rounded-xl text-xs hover:bg-secondary"
                        >
                          {n.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/atlas"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border-hairline px-3 py-2 text-xs hover:bg-secondary"
            >
              <MapPinned className="w-3.5 h-3.5" /> Mapa
            </Link>
            <Link
              to="/auth"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-xs hover:bg-accent transition-colors"
            >
              <UserRound className="w-3.5 h-3.5" /> Mi cuenta
            </Link>
            <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menú">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden mt-2 rounded-2xl glass border-hairline p-3 shadow-sovereign max-h-[70vh] overflow-y-auto">
            {[...PRIMARY, ...TOURISM, ...COMMUNITY, ...SYSTEM].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="block mt-2 px-4 py-3 rounded-xl text-sm text-center bg-foreground text-background"
            >
              Acceder
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
