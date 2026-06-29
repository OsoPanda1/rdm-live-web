import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Heart, ChevronDown, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import rdmLogo from "@/assets/rdm-digital-nexus-logo.png";

type NavChild = { label: string; path: string; preview: string };
type Plano = { id: string; title: string; subtitle: string; items: NavChild[] };

// LTOS Territorial — arquitectura de información en tres planos
const PLANOS: Plano[] = [
  {
    id: "territorio",
    title: "Territorio",
    subtitle: "Plano I · Real del Monte",
    items: [
      { label: "Inicio", path: "/", preview: "Portal" },
      { label: "Historia Minera", path: "/historia", preview: "Capítulo I" },
      { label: "Cultura", path: "/cultura", preview: "Identidad" },
      { label: "Mitos y Leyendas", path: "/relatos", preview: "Relatos" },
      { label: "Dichos Mineros", path: "/dichos", preview: "Tradición" },
      { label: "Gastronomía", path: "/gastronomia", preview: "Sabores" },
      { label: "Arte", path: "/arte", preview: "Creación" },
      { label: "Rutas Turísticas", path: "/rutas", preview: "Experiencias" },
      { label: "Ecoturismo", path: "/ecoturismo", preview: "Naturaleza" },
      { label: "Eventos", path: "/eventos", preview: "Agenda" },
      { label: "Mapa Interactivo", path: "/#mapa", preview: "Geolocalización" },
      { label: "Comunidad", path: "/comunidad", preview: "Muro Global" },
      { label: "Mi Perfil", path: "/perfil", preview: "Usuario" },
    ],
  },
  {
    id: "servicios",
    title: "Servicios",
    subtitle: "Plano II · Comunidad & Economía",
    items: [
      { label: "Catálogo de Comercios", path: "/catalogo", preview: "Negocios" },
      { label: "Registrar Comercio", path: "/comercios/registro", preview: "Alta" },
      { label: "Panel de Comercios", path: "/comercios/panel", preview: "Gestión" },
      { label: "Membresías", path: "/membresias", preview: "Planes" },
      { label: "Mina ⛏️", path: "/mina", preview: "Gamificación" },
      { label: "Preguntas Frecuentes", path: "/faq", preview: "Ayuda" },
      { label: "Ajustes", path: "/ajustes", preview: "Cuenta" },
      { label: "Apoya RDM", path: "/donar", preview: "Donaciones" },
    ],
  },
  {
    id: "documentacion",
    title: "Documentación",
    subtitle: "Plano III · Académico & Técnico",
    items: [
      { label: "TAMV Civilization Hub", path: "/tamv", preview: "Nodo Cero" },
      { label: "Estado del Sistema", path: "/tamv/status", preview: "Telemetría" },
      { label: "API Explorer", path: "/tamv/api", preview: "Endpoints" },
      { label: "Tesis TAMV", path: "/tamv/thesis", preview: "Académico" },
      { label: "Fusión RDM·X", path: "/fusion", preview: "Ecosistema" },
      { label: "System Tenochtitlán", path: "/tenochtitlan", preview: "Kernel" },
      { label: "Operativo", path: "/operativo", preview: "Backend" },
      { label: "Evolución", path: "/evolucion", preview: "Roadmap" },
      { label: "Quiénes Somos", path: "/quienes-somos", preview: "Equipo" },
    ],
  },
];

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openPlano, setOpenPlano] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenPlano(null);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path.split("#")[0]) && path !== "/#mapa";

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-50 px-3 sm:px-6 pt-4"
        onMouseLeave={() => setOpenPlano(null)}
      >
        <div
          className={`mx-auto max-w-[1320px] rounded-2xl border px-4 md:px-6 py-3 transition-all duration-500 ${
            scrolled
              ? "border-cyan-300/15 bg-[linear-gradient(135deg,hsla(220,26%,10%,0.85),hsla(220,18%,7%,0.92))] shadow-[0_10px_40px_-20px_hsla(195,100%,60%,0.45)] backdrop-blur-2xl"
              : "border-white/10 bg-black/30 backdrop-blur-xl"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-amber-300/30 shadow-[0_0_18px_-4px_hsla(43,80%,55%,0.55)] transition-transform group-hover:scale-105">
                <img src={rdmLogo} alt="Logo oficial RDM Digital Nexus" className="h-full w-full object-cover" />
              </div>
              <div>
                <span className="block font-display text-lg leading-none text-white/95">RDM Digital Nexus</span>
                <span className="block font-body text-[10px] tracking-[0.28em] uppercase text-cyan-100/55">LTOS Territorial</span>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-1">
              {PLANOS.map((plano) => {
                const open = openPlano === plano.id;
                return (
                  <div
                    key={plano.id}
                    className="relative"
                    onMouseEnter={() => setOpenPlano(plano.id)}
                  >
                    <button
                      onClick={() => setOpenPlano(open ? null : plano.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] tracking-[0.16em] uppercase transition-all duration-300 ${
                        open
                          ? "bg-cyan-400/15 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(125,211,252,0.35)]"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {plano.title}
                      <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 top-full mt-3 w-[320px] rounded-2xl border border-cyan-100/15 bg-slate-950/90 p-3 shadow-[0_20px_60px_-25px_hsla(195,100%,60%,0.4)] backdrop-blur-2xl"
                        >
                          <span className="mb-2 block px-3 font-body text-[9px] tracking-[0.3em] uppercase text-cyan-100/50">
                            {plano.subtitle}
                          </span>
                          <div className="grid gap-0.5">
                            {plano.items.map((item) => (
                              <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                                  isActive(item.path)
                                    ? "bg-cyan-400/10 text-cyan-100"
                                    : "text-slate-200 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <span className="font-body text-sm">{item.label}</span>
                                <span className="font-body text-[9px] tracking-[0.2em] uppercase text-cyan-100/40">
                                  {item.preview}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              <Link
                to={user ? "/perfil" : "/auth"}
                className="ml-1 flex items-center gap-1.5 rounded-full border border-cyan-200/25 bg-cyan-300/5 px-3.5 py-2 text-[11px] tracking-[0.16em] uppercase text-cyan-100 transition-all hover:bg-cyan-300/15"
              >
                <User className="h-3.5 w-3.5" />
                {user ? "Cuenta" : "Entrar"}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3.5 py-2 text-[11px] tracking-[0.16em] uppercase text-emerald-200 transition-all hover:bg-emerald-300/20"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
              <Link
                to="/donar"
                className="flex items-center gap-1.5 rounded-full border border-amber-300/35 bg-amber-300/10 px-4 py-2 text-[11px] tracking-[0.16em] uppercase text-amber-200 transition-all hover:bg-amber-300/20"
              >
                <Heart className="h-3.5 w-3.5" />
                Apoya
              </Link>
            </nav>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="xl:hidden rounded-xl border border-cyan-100/20 bg-black/30 px-3 py-2 text-[11px] tracking-[0.18em] uppercase text-cyan-100/80"
            >
              {menuOpen ? "Cerrar" : "Menú"}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[radial-gradient(circle_at_top,hsla(202,100%,45%,0.18),transparent_40%),linear-gradient(160deg,hsla(229,38%,8%,0.97),hsla(228,36%,4%,0.98))]"
          >
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <nav className="relative z-10 mx-auto mt-24 max-h-[78vh] w-[min(94vw,820px)] space-y-6 overflow-y-auto rounded-2xl border border-cyan-100/15 bg-slate-950/60 p-5 backdrop-blur-xl">
              {PLANOS.map((plano, pi) => (
                <div key={plano.id}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="font-display text-2xl text-white/95">{plano.title}</span>
                    <span className="font-body text-[9px] tracking-[0.26em] uppercase text-cyan-100/50">
                      {plano.subtitle}
                    </span>
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {plano.items.map((item, index) => (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: pi * 0.05 + index * 0.02 }}
                      >
                        <Link
                          to={item.path}
                          className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all ${
                            isActive(item.path)
                              ? "border border-cyan-200/35 bg-cyan-400/10"
                              : "border border-white/5 hover:border-cyan-200/20 hover:bg-white/5"
                          }`}
                        >
                          <span className="font-body text-base text-white/90">{item.label}</span>
                          <span className="font-body text-[9px] tracking-[0.22em] uppercase text-cyan-100/45">
                            {item.preview}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
              <Link
                to={user ? "/perfil" : "/auth"}
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-200/30 bg-cyan-300/10 px-4 py-3 font-body text-sm uppercase tracking-[0.18em] text-cyan-100"
              >
                <User className="h-4 w-4" />
                {user ? "Mi Cuenta" : "Iniciar Sesión"}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
