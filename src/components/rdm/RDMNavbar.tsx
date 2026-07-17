import { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  Trophy,
  User as UserIcon,
  LogIn,
  Music2,
  Users,
  Palette,
  Store,
  Heart,
  BookOpen,
  Globe,
  Landmark,
  Home,
  Map,
  Mic2,
  MessageSquare,
  ShoppingBag,
  Bus,
  Coffee,
  Star,
  Car,
  Crown,
} from "lucide-react";
import { useRDMAuth } from "@/contexts/RDMAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NavLink {
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  desc?: string;
}

interface MegaCategory {
  key: string;
  label: string;
  accent: string;
  links: NavLink[];
}

// ─── Data ───────────────────────────────────────────────────────────────────

/** Primary links shown flat in the desktop bar */
const PRIMARY_LINKS: NavLink[] = [
  { path: "/", label: "Inicio", icon: Home },
  { path: "/mapa", label: "Mapa", icon: MapPin },
  { path: "/historia", label: "Historia", icon: Pickaxe },
  { path: "/gastronomia", label: "Gastronomía", icon: Utensils },
  { path: "/ecoturismo", label: "Naturaleza", icon: TreePine },
  { path: "/rutas", label: "Rutas", icon: Compass },
  { path: "/musica", label: "Música", icon: Music2 },
  { path: "/eventos", label: "Eventos", icon: Calendar },
];

/** Four megamenu columns — every platform section */
const MEGA_CATEGORIES: MegaCategory[] = [
  {
    key: "turismo",
    label: "Turismo",
    accent: "hsl(var(--rdm-amber))",
    links: [
      { path: "/lugares",            label: "Lugares de interés",  icon: MapPin,        desc: "POIs y atracciones" },
      { path: "/patrimonio-cultural",label: "Patrimonio Cultural", icon: Landmark,      desc: "Monumentos y UNESCO" },
      { path: "/arte",               label: "Arte y Artesanías",   icon: Palette,       desc: "Platerías y talleres" },
      { path: "/cultura",            label: "Cultura",             icon: Globe,         desc: "Tradiciones vivas" },
      { path: "/relatos",            label: "Leyendas",            icon: BookOpen,      desc: "Mitos mineros" },
      { path: "/estacionamientos",   label: "Cómo llegar",         icon: Car,           desc: "Rutas y parking" },
    ],
  },
  {
    key: "comunidad",
    label: "Comunidad",
    accent: "hsl(var(--rdm-blue))",
    links: [
      { path: "/comunidad",          label: "Foro",                icon: MessageSquare, desc: "Publicaciones y noticias" },
      { path: "/musica",             label: "Música RDM",          icon: Music2,        desc: "Escucha y descarga" },
      { path: "/directorio",         label: "Directorio",          icon: Store,         desc: "Negocios locales" },
      { path: "/leaderboard",        label: "Tabla de Honor",      icon: Trophy,        desc: "Ranking de exploradores" },
      { path: "/perfil",             label: "Mi Perfil",           icon: UserIcon,      desc: "Puntos y logros" },
      { path: "/registro-comercio",  label: "Registra tu Negocio", icon: ShoppingBag,   desc: "Únete al directorio" },
    ],
  },
  {
    key: "atlas",
    label: "Atlas & Historia",
    accent: "hsl(var(--rdm-green))",
    links: [
      { path: "/capitulos",           label: "Capítulos narrativos", icon: BookOpen, desc: "Historia por capítulos" },
      { path: "/capitulos/minas",     label: "Las Minas",            icon: Pickaxe,  desc: "Historia minera" },
      { path: "/capitulos/pastes",    label: "Los Pastes",           icon: Coffee,   desc: "Gastronomía típica" },
      { path: "/capitulos/cementerio",label: "Panteón Inglés",       icon: Landmark, desc: "Legado británico" },
      { path: "/capitulos/calles",    label: "Las Calles",           icon: Map,      desc: "Arquitectura colonial" },
      { path: "/capitulos/leyendas",  label: "Leyendas",             icon: Mic2,     desc: "Relatos del pueblo" },
    ],
  },
  {
    key: "servicios",
    label: "Servicios",
    accent: "hsl(var(--rdm-purple))",
    links: [
      { path: "/paquetes",          label: "Paquetes turísticos", icon: Star,       desc: "Experiencias curadas" },
      { path: "/transporte-local",  label: "Transporte Local",    icon: Bus,        desc: "Movilidad en RDM" },
      { path: "/shuttle-cdmx-rdm",  label: "Shuttle CDMX↔RDM",   icon: Bus,        desc: "Traslados directos" },
      { path: "/negocios",          label: "Portal Negocios",     icon: Store,      desc: "Panel de comercios" },
      { path: "/donar",             label: "Donar",               icon: Heart,      desc: "Apoya la plataforma" },
      { path: "/quienes-somos",     label: "Quiénes somos",       icon: Users,      desc: "El equipo RDM Digital" },
      { path: "/premium",           label: "Planes Premium",      icon: Crown,      desc: "$99/mes — canjea puntos por premios reales" },
    ],
  },
];

const EXTRA_LINKS: NavLink[] = [
  { path: "/dichos-mineros",  label: "Dichos Mineros" },
  { path: "/atlas-maximus",   label: "Atlas Maximus" },
  { path: "/ecosistema-ltos", label: "Ecosistema LTOS" },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function RDMNavbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [megaOpen,    setMegaOpen]    = useState(false);
  const [hoverPath,   setHoverPath]   = useState<string | null>(null);
  const megaRef  = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, profile } = useRDMAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setHoverPath(null);
  }, [location.pathname]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : "RD";

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 18 } }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-[hsl(var(--background)/0.94)] border-b border-[hsl(var(--border)/0.3)] shadow-lg"
            : "bg-transparent"
        }`}
      >
        {/* Amber rule on scroll */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.3 }}
              className="h-px w-full bg-gradient-to-r from-transparent via-[hsl(var(--rdm-amber))] to-transparent origin-center"
            />
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <motion.div
              className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber)/0.75)] flex items-center justify-center shadow-lg relative overflow-hidden"
              whileHover={{ scale: 1.06, rotate: 4 }}
              whileTap={{ scale: 0.94 }}
            >
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{ opacity: [0.1, 0.22, 0.1] }}
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

          {/* ── Desktop primary links ── */}
          <div className="hidden xl:flex items-center gap-0.5">
            {PRIMARY_LINKS.map((item, i) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * i, type: "spring", stiffness: 220, damping: 16 } }}
                onMouseEnter={() => setHoverPath(item.path)}
                onMouseLeave={() => setHoverPath(null)}
                className="relative"
              >
                <Link
                  to={item.path}
                  className={`px-3 py-2 text-[11px] font-medium rounded-xl transition-all duration-250 inline-flex items-center gap-1.5 whitespace-nowrap ${
                    isActive(item.path)
                      ? "text-[hsl(var(--background))] bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber)/0.8)] shadow-md shadow-[hsl(var(--rdm-amber)/0.3)]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.08)]"
                  }`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.label}
                </Link>
                <AnimatePresence>
                  {hoverPath === item.path && !isActive(item.path) && (
                    <motion.div
                      className="h-[2px] rounded-full bg-[hsl(var(--rdm-amber))] absolute left-2 right-2 -bottom-1"
                      initial={{ opacity: 0, scaleX: 0.3 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0.3 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* ── Megamenu trigger ── */}
            <div ref={megaRef} className="relative ml-1">
              <motion.button
                type="button"
                onClick={() => setMegaOpen((o) => !o)}
                aria-expanded={megaOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1 px-3 py-2 text-[11px] font-medium rounded-xl transition-all duration-250 ${
                  megaOpen
                    ? "text-[hsl(var(--background))] bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber)/0.8)] shadow-md"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.08)]"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Explorar todo
                <motion.span animate={{ rotate: megaOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3 h-3" />
                </motion.span>
              </motion.button>

              {/* ── Megamenu panel ── */}
              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 240, damping: 22 }}
                    className="absolute top-full right-0 mt-3 w-[680px] rounded-3xl border border-[hsl(var(--border)/0.35)] bg-[hsl(var(--background)/0.98)] backdrop-blur-2xl shadow-2xl p-5"
                    role="menu"
                  >
                    <div className="grid grid-cols-2 gap-x-5 gap-y-0">
                      {MEGA_CATEGORIES.map((cat) => (
                        <div key={cat.key} className="mb-4">
                          <p
                            className="text-[10px] font-bold tracking-widest uppercase mb-2 px-2"
                            style={{ color: cat.accent, fontFamily: "var(--font-body)" }}
                          >
                            {cat.label}
                          </p>
                          {cat.links.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              role="menuitem"
                              className={`flex items-start gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition-all duration-200 group ${
                                isActive(link.path)
                                  ? "bg-[hsl(var(--rdm-amber)/0.1)] text-[hsl(var(--rdm-amber))]"
                                  : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.07)]"
                              }`}
                              style={{ fontFamily: "var(--font-body)" }}
                            >
                              {link.icon && (
                                <link.icon className="w-3.5 h-3.5 shrink-0 mt-px text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--rdm-amber))] transition-colors" />
                              )}
                              <span>
                                <span className="font-medium block">{link.label}</span>
                                {link.desc && (
                                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] leading-tight">
                                    {link.desc}
                                  </span>
                                )}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Bottom strip */}
                    <div className="mt-2 pt-3 border-t border-[hsl(var(--border)/0.3)] flex items-center justify-between gap-2 flex-wrap">
                      {EXTRA_LINKS.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="text-[10px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--rdm-amber))] transition-colors px-2"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <Link
                        to="/donar"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[hsl(var(--rdm-amber)/0.12)] text-[hsl(var(--rdm-amber))] text-[10px] font-semibold hover:bg-[hsl(var(--rdm-amber)/0.22)] transition-colors ml-auto"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        <Heart className="w-3 h-3" /> Apoya RDM Digital
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Donar CTA */}
            <Link
              to="/donar"
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold rounded-full bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber)/0.85)] text-white shadow-md shadow-[hsl(var(--rdm-amber)/0.3)] hover:shadow-[hsl(var(--rdm-amber)/0.55)] transition-all duration-300"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Heart className="w-3.5 h-3.5" />
              Donar
            </Link>

            {/* Auth state */}
            {user ? (
              <Link
                to="/perfil"
                className="flex items-center gap-2 px-1.5 py-1 rounded-full hover:bg-[hsl(var(--rdm-amber)/0.08)] transition-colors"
                title="Mi perfil"
              >
                <Avatar className="h-8 w-8 border border-[hsl(var(--rdm-amber)/0.4)]">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs font-semibold bg-[hsl(var(--rdm-amber)/0.15)] text-[hsl(var(--rdm-amber))]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="hidden md:block text-xs font-medium text-[hsl(var(--foreground))] max-w-[80px] truncate"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {profile?.display_name ?? "Perfil"}
                </span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-medium rounded-xl border border-[hsl(var(--rdm-amber)/0.4)] text-[hsl(var(--rdm-amber))] hover:bg-[hsl(var(--rdm-amber)/0.08)] transition-all"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <LogIn className="w-3.5 h-3.5" />
                Entrar
              </Link>
            )}

            {/* Mobile hamburger */}
            <motion.button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="xl:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[hsl(var(--rdm-amber)/0.1)] transition-colors text-[hsl(var(--foreground))]"
              whileTap={{ scale: 0.92 }}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.16 }}>
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.16 }}>
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 z-50 bg-[hsl(var(--background)/0.98)] backdrop-blur-2xl border-l border-[hsl(var(--border)/0.4)] shadow-2xl xl:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border)/0.3)] shrink-0">
                <div>
                  <span className="font-bold text-base text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-display)" }}>
                    RDM Digital
                  </span>
                  <span className="block text-[9px] tracking-widest uppercase text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-body)" }}>
                    Pueblo Mágico
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[hsl(var(--rdm-amber)/0.1)] text-[hsl(var(--foreground))] transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable links */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                {/* Primary */}
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-[hsl(var(--muted-foreground))] px-2 mb-2" style={{ fontFamily: "var(--font-body)" }}>
                    Principal
                  </p>
                  <div className="space-y-0.5">
                    {PRIMARY_LINKS.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                          isActive(item.path)
                            ? "bg-[hsl(var(--rdm-amber)/0.12)] text-[hsl(var(--rdm-amber))] font-semibold"
                            : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.07)]"
                        }`}
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {item.icon && <item.icon className="w-4 h-4 shrink-0 text-[hsl(var(--muted-foreground))]" />}
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Megamenu categories */}
                {MEGA_CATEGORIES.map((cat) => (
                  <div key={cat.key}>
                    <p
                      className="text-[9px] font-bold tracking-widest uppercase px-2 mb-2"
                      style={{ color: cat.accent, fontFamily: "var(--font-body)" }}
                    >
                      {cat.label}
                    </p>
                    <div className="space-y-0.5">
                      {cat.links.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                            isActive(link.path)
                              ? "bg-[hsl(var(--rdm-amber)/0.12)] text-[hsl(var(--rdm-amber))] font-semibold"
                              : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.07)]"
                          }`}
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {link.icon && <link.icon className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />}
                          <span>
                            <span className="font-medium">{link.label}</span>
                            {link.desc && (
                              <span className="block text-[10px] text-[hsl(var(--muted-foreground))] leading-tight">
                                {link.desc}
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Extra / platform links */}
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-[hsl(var(--muted-foreground))] px-2 mb-2" style={{ fontFamily: "var(--font-body)" }}>
                    Plataforma
                  </p>
                  <div className="space-y-0.5">
                    {EXTRA_LINKS.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center px-3 py-2 rounded-xl text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.07)] transition-all"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="px-4 py-4 border-t border-[hsl(var(--border)/0.3)] space-y-2 shrink-0">
                <Link
                  to="/donar"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-[hsl(var(--rdm-amber)/0.85)] text-white text-sm font-semibold shadow-lg hover:opacity-95 transition-opacity"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  <Heart className="w-4 h-4" />
                  Donar y apoyar RDM Digital
                </Link>
                {user ? (
                  <Link
                    to="/perfil"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl border border-[hsl(var(--border)/0.5)] text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.07)] transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Mi perfil
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl border border-[hsl(var(--border)/0.5)] text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--rdm-amber)/0.07)] transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
