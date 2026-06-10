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
  Sparkles,
  Zap,
} from "lucide-react";
import { useRDMAuth } from "@/contexts/RDMAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TURISMO_LINKS = [
  { path: "/", label: "Inicio", icon: Sparkles },
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
  const [activeHover, setActiveHover] = useState<string | null>(null);

  const location = useLocation();
  const { user, profile } = useRDMAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 70);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMasOpen(false);
    setActiveHover(null);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navVariants = {
    hidden: { y: -80, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 18,
        delay: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.08 + i * 0.03,
        type: "spring",
        stiffness: 220,
        damping: 18,
      },
    }),
  };

  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          scrolled
            ? "backdrop-blur-xl bg-[hsl(var(--background))/0.9] shadow-xl border-b border-[hsl(var(--border))/0.35]"
            : "bg-transparent"
        }`}
      >
        {/* Glow superior sutil al hacer scroll */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "1px" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full bg-gradient-to-r from-[hsl(var(--rdm-amber))/0] via-[hsl(var(--rdm-amber))/0.9] to-[hsl(var(--rdm-amber))/0]"
            />
          )}
        </AnimatePresence>

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-16 md:px-8">
          {/* Logo – base de la original, efectos de la propuesta */}
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber))/0.8] shadow-lg md:h-10 md:w-10"
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/0 via-white/25 to-white/0"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
              <Mountain className="relative z-10 h-4 w-4 text-white md:h-5 md:w-5" />
            </motion.div>
            <div className="hidden sm:block">
              <motion.span
                className="block leading-tight text-lg font-bold md:text-xl bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--foreground))] bg-clip-text text-transparent"
                style={{ fontFamily: "var(--font-display)" }}
                animate={{ opacity: [1, 0.9, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                RDM Digital
              </motion.span>
              <span
                className="block text-[9px] uppercase tracking-[0.25em] text-[hsl(var(--rdm-amber))/0.9]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Pueblo Mágico
              </span>
            </div>
          </Link>

          {/* NAV DESKTOP */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* Links principales turismo */}
            <motion.div className="flex items-center gap-0.5">
              {TURISMO_LINKS.slice(0, 8).map((item, i) => (
                <motion.div
                  key={item.path}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    to={item.path}
                    onMouseEnter={() => setActiveHover(item.path)}
                    onMouseLeave={() => setActiveHover(null)}
                    className={`relative overflow-hidden rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-250 md:text-sm ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber))/0.85] text-[hsl(var(--background))] shadow-md shadow-[hsl(var(--rdm-amber))/0.35]"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--rdm-amber))/0.08] hover:text-[hsl(var(--foreground))]"
                    }`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <AnimatePresence>
                      {activeHover === item.path && !isActive(item.path) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-[hsl(var(--rdm-amber))/0.17] to-transparent"
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10 flex items-center gap-1.5">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Dropdown MÁS – mezcla de estructura original + estética nueva */}
            <div
              className="relative ml-1"
              onMouseEnter={() => setMasOpen(true)}
              onMouseLeave={() => setMasOpen(false)}
            >
              <motion.button
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium md:text-sm transition-all duration-200 ${
                  masOpen
                    ? "bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber))/0.85] text-[hsl(var(--background))] shadow-md"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--rdm-amber))/0.08]"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-1.5">
                  Más <Zap className="h-3.5 w-3.5" />
                </span>
                <motion.div
                  animate={{ rotate: masOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="h-3 w-3" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {masOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.22 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[hsl(var(--border))/0.4] bg-[hsl(var(--background))/0.97] p-2.5 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="space-y-0.5">
                      {MAS_LINKS.map((item, i) => (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                        >
                          <Link
                            to={item.path}
                            className="block rounded-xl px-3.5 py-2 text-xs text-[hsl(var(--foreground))] transition-all duration-150 hover:bg-[hsl(var(--rdm-amber))/0.11]"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>

                    <div className="my-2 border-t border-[hsl(var(--border))/0.4]" />

                    <Link
                      to="/arquitectura"
                      className="block rounded-xl px-3.5 py-2 text-[10px] text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--rdm-amber))/0.05] hover:text-[hsl(var(--rdm-amber))]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      🔧 Plataforma técnica
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botón Apoya – simple pero con peso visual */}
            <motion.div className="ml-2">
              <Link
                to="/apoya"
                className="relative flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber))/0.88] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[hsl(var(--rdm-amber))/0.4] md:px-5 md:text-sm"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Sparkles className="h-4 w-4" /> Apoya
              </Link>
            </motion.div>

            {/* Usuario / login – lógica original, look mejorado */}
            {user ? (
              <motion.div className="ml-1">
                <Link
                  to="/perfil"
                  title="Mi perfil"
                  className="flex items-center gap-2 rounded-full p-1.5 transition-colors hover:bg-[hsl(var(--rdm-amber))/0.08]"
                >
                  <Avatar className="h-8 w-8 border border-[hsl(var(--rdm-amber))/0.4]">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber))/0.7] text-[10px] font-semibold text-white">
                      {profile?.display_name?.slice(0, 2).toUpperCase() ?? (
                        <UserIcon className="h-3.5 w-3.5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {profile && (
                    <span className="hidden items-center gap-1 text-[10px] font-semibold text-[hsl(var(--rdm-amber))] xl:flex">
                      <Trophy className="h-3.5 w-3.5" />
                      {profile.total_points}
                    </span>
                  )}
                </Link>
              </motion.div>
            ) : (
              <motion.div className="ml-1">
                <Link
                  to="/auth"
                  className="flex items-center gap-1 rounded-full border border-[hsl(var(--rdm-amber))] px-3 py-2 text-xs font-medium text-[hsl(var(--rdm-amber))] transition-all hover:bg-[hsl(var(--rdm-amber))/0.08]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Entrar
                </Link>
              </motion.div>
            )}
          </div>

          {/* Toggle MOBILE */}
          <motion.button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-xl p-2 transition-colors hover:bg-[hsl(var(--rdm-amber))/0.09] lg:hidden"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* MENÚ MOBILE */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-3 right-3 z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-[hsl(var(--border))/0.35] bg-[hsl(var(--background))/0.97] p-4 shadow-2xl backdrop-blur-xl lg:hidden"
          >
            {/* Turismo */}
            <div>
              <p
                className="flex items-center gap-2 px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--muted-foreground))]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--rdm-amber))]" />
                🗺️ Turismo
              </p>
              <div className="space-y-1">
                {TURISMO_LINKS.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.02 }}
                  >
                    <Link
                      to={item.path}
                      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all ${
                        isActive(item.path)
                          ? "bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber))/0.85] text-[hsl(var(--background))] shadow-md"
                          : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber))/0.08]"
                      }`}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {item.icon && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--rdm-amber))/0.14] group-hover:bg-[hsl(var(--rdm-amber))/0.22]">
                          <item.icon className="h-4 w-4" />
                        </div>
                      )}
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="my-3 border-t border-[hsl(var(--border))/0.35]" />

            {/* Más secciones */}
            <div>
              <p
                className="flex items-center gap-2 px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--muted-foreground))]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--rdm-amber))/0.7]" />
                Más secciones
              </p>
              <div className="space-y-1">
                {MAS_LINKS.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.02 }}
                  >
                    <Link
                      to={item.path}
                      className="group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm text-[hsl(var(--foreground))] transition-all hover:bg-[hsl(var(--rdm-amber))/0.07]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--rdm-amber))/0.55] group-hover:bg-[hsl(var(--rdm-amber))]" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Apoya / Auth */}
            <div className="mt-4 space-y-2 border-t border-[hsl(var(--border))/0.35] pt-3">
              <Link
                to="/apoya"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber))/0.85] px-4 py-2.5 text-sm font-semibold text-white shadow-md"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <Sparkles className="h-4 w-4" />
                Apoya
              </Link>

              {!user && (
                <Link
                  to="/auth"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[hsl(var(--rdm-amber))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--rdm-amber))]"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
