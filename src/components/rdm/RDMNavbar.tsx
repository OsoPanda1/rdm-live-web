import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Inicio" },
  { path: "/mapa", label: "Mapa" },
  { path: "/gastronomia", label: "Gastronomía" },
  { path: "/historia", label: "Historia" },
  { path: "/ecoturismo", label: "Aventura" },
  { path: "/directorio", label: "Directorio" },
  { path: "/eventos", label: "Eventos" },
  { path: "/comunidad", label: "Comunidad" },
  { path: "/arquitectura", label: "Arquitectura" },
  { path: "/seguridad-tenochtitlan", label: "Seguridad" },
];

export function RDMNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "rdm-glass shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--rdm-amber))] flex items-center justify-center">
              <Mountain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>RDM Digital</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.path} to={item.path} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${location.pathname === item.path ? "text-[hsl(var(--rdm-amber))] bg-[hsl(var(--rdm-amber)/0.1)]" : "text-[hsl(215_13%_42%)] hover:text-[hsl(var(--rdm-amber))]"}`} style={{ fontFamily: "var(--font-body)" }}>
                {item.label}
              </Link>
            ))}
            <Link to="/apoya" className="ml-2 px-4 py-2 text-xs font-semibold rounded-full bg-[hsl(var(--rdm-amber))] text-white hover:opacity-90 transition-opacity" style={{ fontFamily: "var(--font-body)" }}>Apoya</Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed top-16 left-4 right-4 z-50 rdm-glass rounded-xl p-3 md:hidden shadow-xl">
            {NAV_ITEMS.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm rounded-lg hover:bg-[hsl(var(--rdm-amber)/0.1)] transition-colors" style={{ fontFamily: "var(--font-body)" }}>
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
