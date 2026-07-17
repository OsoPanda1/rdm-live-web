import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, matchPath } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, ChevronRight, Compass, MapPin, BookOpen, Users,
  Building2, Sparkles, Music2, Camera, History, Mountain,
  Store, Gamepad2, Shield, ScrollText, Heart, HandCoins, Crown,
} from "lucide-react"

interface SidebarLink { to: string; label: string; icon?: React.ComponentType<{ className?: string }> }
interface SidebarSection {
  id: string; label: string; icon: React.ComponentType<{ className?: string }>
  links: SidebarLink[]; badge?: string; color?: string
}

const CONTEXT_MAP: Record<string, string[]> = {
  "/": ["explora", "guia", "comercio"],
  "/mapa": ["explora", "guia", "comercio"],
  "/musica": ["cultura"],
  "/cultura": ["cultura"],
  "/historia": ["cultura"],
  "/lugares": ["explora", "guia"],
  "/rutas": ["explora", "guia"],
  "/capitulos": ["guia", "explora"],
  "/comercios": ["comercio"],
  "/registro-comercio": ["comercio"],
  "/juegos": ["juegos"],
  "/gamification": ["juegos"],
  "/comunidad": ["comunidad"],
  "/perfil": ["comunidad", "juegos"],
  "/leaderboard": ["comunidad", "juegos"],
  "/admin": ["admin"],
  "/isabella-ai": ["admin"],
}

const SECTIONS: SidebarSection[] = [
  {
    id: "explora", label: "Explorar", icon: Compass, color: "#f59e0b",
    links: [
      { to: "/mapa", label: "Mapa interactivo", icon: MapPin },
      { to: "/lugares", label: "Lugares", icon: Mountain },
      { to: "/rutas", label: "Rutas turísticas", icon: History },
      { to: "/ecoturismo", label: "Ecoturismo", icon: Camera },
    ],
  },
  {
    id: "guia", label: "Guía narrativa", icon: BookOpen, color: "#3b82f6",
    links: [
      { to: "/capitulos", label: "Capítulos", icon: BookOpen },
      { to: "/capitulos/minas", label: "Minas", icon: Mountain },
      { to: "/capitulos/pastes", label: "Pastes", icon: Store },
      { to: "/capitulos/leyendas", label: "Leyendas", icon: Sparkles },
    ],
  },
  {
    id: "cultura", label: "Cultura", icon: Music2, color: "#ec4899",
    links: [
      { to: "/musica", label: "Música", icon: Music2 },
      { to: "/cultura", label: "Cultura viva", icon: Camera },
      { to: "/historia", label: "Historia", icon: History },
    ],
  },
  {
    id: "comercio", label: "Comercio local", icon: Store, color: "#10b981",
    links: [
      { to: "/comercios", label: "Directorio", icon: Building2 },
      { to: "/registro-comercio", label: "Registrar negocio", icon: Store },
      { to: "/negocios", label: "Portal negocios", icon: Building2 },
    ],
  },
  {
    id: "juegos", label: "Juegos", icon: Gamepad2, color: "#8b5cf6",
    badge: "NUEVO",
    links: [
      { to: "/juegos", label: "Mini juegos", icon: Gamepad2 },
      { to: "/gamification", label: "Canjear realitos", icon: Sparkles },
      { to: "/leaderboard", label: "Ranking", icon: Shield },
      { to: "/premium", label: "Planes premium", icon: Crown },
    ],
  },
  {
    id: "comunidad", label: "Comunidad", icon: Users, color: "#06b6d4",
    links: [
      { to: "/comunidad", label: "Foro", icon: Users },
      { to: "/perfil", label: "Mi perfil", icon: Users },
    ],
  },
  {
    id: "admin", label: "Sistema", icon: Shield, color: "#64748b",
    links: [
      { to: "/admin", label: "Panel", icon: Shield },
      { to: "/isabella-ai", label: "Isabella AI", icon: Sparkles },
      { to: "/rfcs", label: "RFCs", icon: ScrollText },
    ],
  },
  {
    id: "donar", label: "Apoyar", icon: Heart, color: "#f43f5e",
    badge: "DONAR",
    links: [
      { to: "/donar", label: "Donar ahora", icon: HandCoins },
    ],
  },
]

const ICON_FOR_SECTION: Record<string, React.ComponentType<{ className?: string }>> = {
  explora: MapPin, guia: BookOpen, cultura: Music2, comercio: Building2,
  juegos: Gamepad2, comunidad: Users, admin: Sparkles, donar: Heart,
}

const STORAGE_KEY = "rdm.sidebar.collapsed"

function matchContext(pathname: string): string[] {
  const base = "/" + (pathname.split("/")[1] ?? "")
  return CONTEXT_MAP[base] ?? CONTEXT_MAP[pathname] ?? ["explora", "guia"]
}

function isActive(pathname: string, to: string): boolean {
  return Boolean(matchPath({ path: to, end: to === "/" || !to.includes("/:") }, pathname))
    || (to !== "/" && pathname.startsWith(to))
}

const springConfig = { type: "spring" as const, stiffness: 300, damping: 30 }

export default function SmartSidebar() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return true
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === null ? true : stored === "1"
  })
  const [openSection, setOpenSection] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0")
  }, [collapsed])

  const visibleSections = useMemo(() => {
    const ids = new Set(matchContext(pathname))
    return SECTIONS.filter(s => ids.has(s.id))
  }, [pathname])

  useEffect(() => {
    if (!collapsed && visibleSections.length) {
      const found = visibleSections.find(s => s.links.some(l => isActive(pathname, l.to)))
      setOpenSection(found?.id ?? visibleSections[0].id)
    }
  }, [pathname, visibleSections, collapsed])

  if (["/auth", "/login", "/register"].includes(pathname)) return null

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      aria-label="Barra de herramientas contextual"
      className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 lg:flex"
    >
      <motion.div
        animate={{ width: collapsed ? 56 : 260 }}
        transition={springConfig}
        className="relative overflow-hidden rounded-r-2xl border border-l-0 border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}
      >
        {/* Gradient accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500 via-amber-400 to-amber-600 opacity-60" />

        <div className="relative p-2">
          {/* Toggle button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setCollapsed(v => !v)}
            aria-expanded={!collapsed}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-[9px] uppercase tracking-[0.25em] text-white/40 overflow-hidden whitespace-nowrap"
                >
                  Menú contextual
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Collapsed icons */}
          {collapsed ? (
            <nav aria-label="Atajos" className="mt-2 flex flex-col gap-1">
              {visibleSections.map(section => {
                const Icon = ICON_FOR_SECTION[section.id] ?? Compass
                const firstLink = section.links[0]?.to ?? "/"
                const active = isActive(pathname, firstLink)
                return (
                  <Link key={section.id} to={firstLink} title={section.label}
                    className="group relative flex items-center justify-center rounded-xl p-2.5 transition-all"
                  >
                    <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                      active ? "bg-white/10" : "opacity-0 group-hover:opacity-100 group-hover:bg-white/5"
                    }`} />
                    <Icon className={`relative h-4 w-4 transition-colors ${
                      active ? "text-amber-400" : "text-white/40 group-hover:text-white/70"
                    }`} />
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 px-2.5 py-1 rounded-lg bg-black/90 backdrop-blur-md border border-white/10 text-[10px] text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {section.label}
                    </div>
                  </Link>
                )
              })}
            </nav>
          ) : (
            <div className="mt-2 space-y-1">
              {visibleSections.map((section, sIdx) => {
                const Icon = section.icon
                const isOpen = openSection === section.id
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sIdx * 0.05 }}
                  >
                    <button
                      onClick={() => setOpenSection(isOpen ? "" : section.id)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all hover:bg-white/5"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left text-xs font-medium text-white/80">{section.label}</span>
                      {section.badge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-[8px] font-bold text-black uppercase tracking-wider">
                          {section.badge}
                        </span>
                      )}
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="h-3 w-3 text-white/30" />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/5 pl-2">
                            {section.links.map(link => {
                              const active = isActive(pathname, link.to)
                              const LinkIcon = link.icon
                              return (
                                <Link key={link.to} to={link.to}
                                  className={`group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-all ${
                                    active
                                      ? "text-amber-400 bg-amber-400/5"
                                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                  }`}
                                >
                                  {LinkIcon && <LinkIcon className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" />}
                                  <span>{link.label}</span>
                                  {active && (
                                    <motion.div
                                      layoutId="sidebar-active"
                                      className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-amber-400"
                                    />
                                  )}
                                </Link>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}

              {/* Branding footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 pt-3 border-t border-white/5 px-3"
              >
                <p className="text-[8px] uppercase tracking-[0.3em] text-white/20 text-center">
                  Real del Monte Digital
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.aside>
  )
}
