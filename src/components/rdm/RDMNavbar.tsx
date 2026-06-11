import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain,
  Menu,
  X,
  MapPin,
  Utensils,
  Pickaxe,
  TreePine,
  Compass,
  Calendar,
  Car,
  ChevronDown,
  Trophy,
  User as UserIcon,
  LogIn,
} from "lucide-react";
import { useRDMAuth } from "@/contexts/RDMAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  { path: "/ecosistema-ltos", label: "Ecosistema LTOS" },
  { path: "/leaderboard", label: "🏆 Tabla de Honor" },
];

export function RDMNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [masOpen, setMasOpen] = useState(false);
  const [hoverPath, setHoverPath] = useState<string | null>(null);
  const location = useLocation();
  const { user, profile } = useRDMAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 64);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMasOpen(false);
    setHoverPath(null);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navVariants = {
    initial: { y: -80, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 120, damping: 18 },
    },
  };

  const desktopItemVariants = {
    initial: { opacity: 0, y: -6 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.06 * i,
        type: "spring" as const,
        stiffness: 220,
        damping: 16,
      },
    }),
  };

  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="initial"
        animate="animate"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-[hsl(var(--background)/0.9)] border-b border-[hsl(var(--border)/0.3)] shadow-lg"
            : "bg-transparent"
        }`}
      >
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.35 }}
              className="h-px w-full bg-gradient-to-r from-transparent via-[hsl(var(--rdm-amber))] to-transparent origin-center"
            />
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber)/0.8)] flex items-center justify-center shadow-lg relative overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Mountain className="w-4 h-4 text-white relative z-10" />
            </motion.div>
            <div className="hidden sm:block">
              <span
                className="font-bold text-lg block leading-tight bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--foreground))] bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-display)" }}
              >
                RDM Digital
              </span>
              <span
                className="text-[9px] tracking-[0.25em] uppercase text-[hsl(var(--rdm-amber))]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Pueblo Mágico
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {TURISMO_LINKS.slice(0, 8).map((item, i) => (
                <motion.div
                  key={item.path}
                  custom={i}
                  variants={desktopItemVariants}
                  initial="initial"
                  animate="animate"
                  onMouseEnter={() => setHoverPath(item.path)}
                  onMouseLeave={() => setHoverPath(null)}
                  className="relative"
                >
                  <Link
                    to={item.path}
                    className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all duration-300 inline-flex items-center gap-1.5 ${
                      isActive(item.path)
                        ? "text-[hsl(var(--background))] bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber)/0.8)] shadow-md shadow-[hsl(var(--rdm-amber)/0.35)]"
                        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.08)]"
                    }`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {item.label}
                  </Link>

                  <AnimatePresence>
                    {(isActive(item.path) || hoverPath === item.path) && (
                      <motion.div
                        className="h-[2px] rounded-full bg-[hsl(var(--rdm-amber))] absolute left-2 right-2 -bottom-1"
                        initial={{ opacity: 0, scaleX: 0.4 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0.4 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Más dropdown */}
            <div
              className="relative ml-1"
              onMouseEnter={() => setMasOpen(true)}
              onMouseLeave={() => setMasOpen(false)}
            >
              <motion.button
                type="button"
                className={`flex items-center gap-1 px-3.5 py-2 text-xs font-medium rounded-xl transition-all duration-300 ${
                  masOpen
                    ? "text-[hsl(var(--background))] bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber)/0.8)] shadow-md"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.08)]"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Más
                <motion.span
                  animate={{ rotate: masOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {masOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 210, damping: 18 }}
                    className="absolute top-full right-0 mt-2 w-56 rounded-2xl border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--background)/0.98)] backdrop-blur-xl shadow-2xl p-2.5"
                  >
                    <div className="space-y-0.5">
                      {MAS_LINKS.map((item, idx) => (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.02 * idx }}
                        >
                          <Link
                            to={item.path}
                            className="block px-3 py-2 text-xs rounded-xl text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.08)] transition-colors"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                    <div className="border-t border-[hsl(var(--border)/0.3)] my-2" />
                    <Link
                      to="/arquitectura"
                      className="block px-3 py-2 text-[10px] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--rdm-amber))] hover:bg-[hsl(var(--rdm-amber)/0.06)] transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      🔧 Plataforma técnica
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA Apoya */}
            <Link
              to="/apoya"
              className="ml-2 px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber)/0.85)] text-white shadow-md shadow-[hsl(var(--rdm-amber)/0.35)] hover:shadow-[hsl(var(--rdm-amber)/0.6)] transition-all duration-300 inline-flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Apoya
            </Link>

            {/* Usuario / Auth */}
            {user ? (
              <Link
                to="/perfil"
                className="ml-1 flex items-center gap-2 px-1.5 py-1 rounded-full hover:bg-[hsl(var(--rdm-amber)/0.08)] transition-colors"
                title="Mi perfil"
              >
                <Avatar className="h-8 w-8 border border-[hsl(var(--rdm-amber)/0.4)]">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-[hsl(var(--rdm-amber))] text-white">
                    {profile?.display_name?.slice(0, 2).toUpperCase() ?? (
                      <UserIcon className="h-3 w-3" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {profile && (
                  <span className="hidden xl:flex items-center gap-1 text-[10px] font-semibold text-[hsl(var(--rdm-amber))]">
                    <Trophy className="h-3 w-3" /> {profile.total_points}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/auth"
                className="ml-1 flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-[hsl(var(--rdm-amber))] text-[hsl(var(--rdm-amber))] hover:bg-[hsl(var(--rdm-amber)/0.1)] transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" /> Entrar
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <motion.button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-[hsl(var(--rdm-amber)/0.08)] transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="fixed top-16 left-3 right-3 z-50 rdm-glass rounded-2xl p-3.5 lg:hidden shadow-2xl max-h-[70vh] overflow-y-auto border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--background)/0.97)] backdrop-blur-xl"
          >
            <p
              className="px-3 pt-1 pb-2 text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              🗺️ Turismo
            </p>
            {TURISMO_LINKS.map((item, i) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * i }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-colors ${
                    isActive(item.path)
                      ? "text-[hsl(var(--rdm-amber))] bg-[hsl(var(--rdm-amber)/0.12)]"
                      : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.06)]"
                  }`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              </motion.div>
            ))}

            <div className="border-t border-[hsl(var(--border)/0.35)] my-2" />
            <p
              className="px-3 pt-1 pb-2 text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Más secciones
            </p>
            {MAS_LINKS.map((item, i) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * i }}
              >
                <Link
                  to={item.path}
                  className="block px-3 py-2.5 text-sm rounded-xl text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.06)]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
