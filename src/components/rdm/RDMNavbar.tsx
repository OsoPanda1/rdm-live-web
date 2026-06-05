import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Menu, X, MapPin, Utensils, Pickaxe, TreePine, Compass, Calendar, Car, ChevronDown } from "lucide-react";

const TURISMO_LINKS = [
  { path: "/", label: "Inicio" },
  { path: "/mapa", label: "Mapa", icon: MapPin },
  { path: "/historia", label: "Historia", icon: Pickaxe },
  { path: "/gastronomia", label: "Gastronomía", icon: Utensils },
  { path: "/ecoturismo", label: "Naturaleza", icon: TreePine },
  { path: "/rutas", label: "Rutas", icon: Compass },
  { path: "/patrimonio-cultural", label: "Patrimonio", icon: Mountain },
  { path: "/eventos", label: "Eventos", icon: Calendar },
  { path: "/estacionamientos", label: "Cómo llegar", icon: Car },
];

const MAS_LINKS = [
  { path: "/directorio", label: "Directorio de Negocios" },
  { path: "/comunidad", label: "Comunidad" },
  { path: "/arte", label: "Arte y Artesanías" },
  { path: "/cultura", label: "Cultura" },
  { path: "/relatos", label: "Leyendas" },
  { path: "/atlas-maximus", label: "Atlas Maximus" },
  { path: "/dichos-mineros", label: "Dichos Mineros" },
];

export function RDMNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [masOpen, setMasOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMasOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "rdm-glass shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--rdm-amber))] flex items-center justify-center">
              <Mountain className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg block leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                RDM Digital
              </span>
              <span className="text-[9px] tracking-widest uppercase text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-body)" }}>
                Pueblo Mágico
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {TURISMO_LINKS.slice(0, 8).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "text-[hsl(var(--rdm-amber))] bg-[hsl(var(--rdm-amber)/0.1)]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--rdm-amber))]"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {item.label}
              </Link>
            ))}

            {/* Más dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMasOpen(true)}
              onMouseLeave={() => setMasOpen(false)}
            >
              <button
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--rdm-amber))] transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Más <ChevronDown className={`w-3 h-3 transition-transform ${masOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {masOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full right-0 mt-1 w-52 rdm-glass rounded-xl p-2 shadow-xl"
                  >
                    {MAS_LINKS.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block px-3 py-2 text-xs rounded-lg hover:bg-[hsl(var(--rdm-amber)/0.1)] text-[hsl(var(--foreground))] transition-colors"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-[hsl(var(--border))] my-1" />
                    <Link
                      to="/arquitectura"
                      className="block px-3 py-2 text-[10px] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--rdm-amber))]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      🔧 Plataforma técnica
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/apoya"
              className="ml-2 px-4 py-2 text-xs font-semibold rounded-full bg-[hsl(var(--rdm-amber))] text-white hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Apoya
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-3 right-3 z-50 rdm-glass rounded-xl p-3 lg:hidden shadow-xl max-h-[70vh] overflow-y-auto"
          >
            <p className="px-3 pt-1 pb-2 text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>
              🗺️ Turismo
            </p>
            {TURISMO_LINKS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "text-[hsl(var(--rdm-amber))] bg-[hsl(var(--rdm-amber)/0.1)]"
                    : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.05)]"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </Link>
            ))}

            <div className="border-t border-[hsl(var(--border))] my-2" />
            <p className="px-3 pt-1 pb-2 text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>
              Más secciones
            </p>
            {MAS_LINKS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-2.5 text-sm rounded-lg text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.05)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
