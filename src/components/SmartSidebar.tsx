import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, matchPath } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  BookOpen,
  Users,
  Building2,
  Sparkles,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface SidebarLink {
  to: string
  label: string
}

interface SidebarSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  links: SidebarLink[]
}

/**
 * Mapa contextual: según la ruta actual, mostramos solo las secciones que aportan.
 * Las claves coinciden con la base del pathname (ej. "/mapa", "/capitulos").
 */
const CONTEXT_MAP: Record<string, string[]> = {
  "/": ["explora", "guia"],
  "/mapa": ["explora", "guia", "comercio"],
  "/lugares": ["explora", "guia"],
  "/rutas": ["explora", "guia"],
  "/capitulos": ["guia", "comunidad"],
  "/comercios": ["comercio"],
  "/comunidad": ["comunidad"],
  "/perfil": ["comunidad"],
  "/admin": ["admin"],
}

const SECTIONS: SidebarSection[] = [
  {
    id: "explora",
    label: "Explorar territorio",
    icon: Compass,
    links: [
      { to: "/mapa", label: "Mapa soberano" },
      { to: "/lugares", label: "Lugares" },
      { to: "/rutas", label: "Rutas" },
      { to: "/ecoturismo", label: "Ecoturismo" },
    ],
  },
  {
    id: "guia",
    label: "Guía narrativa",
    icon: BookOpen,
    links: [
      { to: "/capitulos", label: "Capítulos" },
      { to: "/capitulos/minas", label: "Minas" },
      { to: "/capitulos/pastes", label: "Pastes" },
      { to: "/capitulos/leyendas", label: "Leyendas" },
    ],
  },
  {
    id: "comercio",
    label: "Comercio local",
    icon: Building2,
    links: [
      { to: "/comercios", label: "Catálogo" },
      { to: "/registro-comercio", label: "Registro" },
      { to: "/negocios", label: "Portal negocios" },
    ],
  },
  {
    id: "comunidad",
    label: "Comunidad",
    icon: Users,
    links: [
      { to: "/comunidad", label: "Foro" },
      { to: "/leaderboard", label: "Ranking" },
      { to: "/perfil", label: "Mi perfil" },
    ],
  },
  {
    id: "admin",
    label: "Administración",
    icon: Sparkles,
    links: [{ to: "/admin", label: "Panel admin" }],
  },
]

const ICON_FOR_SECTION: Record<
  SidebarSection["id"],
  React.ComponentType<{ className?: string }>
> = {
  explora: MapPin,
  guia: BookOpen,
  comercio: Building2,
  comunidad: Users,
  admin: Sparkles,
}

const STORAGE_KEY = "rdm.sidebar.collapsed"

function matchContext(pathname: string): SidebarSection["id"][] {
  const base = "/" + (pathname.split("/")[1] ?? "")
  return CONTEXT_MAP[base] ?? CONTEXT_MAP[pathname] ?? ["explora", "guia"]
}

function isActiveLink(pathname: string, linkTo: string): boolean {
  // Soporta coincidencia exacta y rutas hijas (ej. /capitulos/minas)
  return Boolean(
    matchPath(
      {
        path: linkTo,
        end: linkTo === "/" || !linkTo.includes("/:"),
      },
      pathname,
    ) || (linkTo !== "/" && pathname.startsWith(linkTo)),
  )
}

/**
 * SmartSidebar — Barra lateral inteligente en acordeón.
 * - Replegable (icon-only) con `collapsed`.
 * - Acordeón con secciones contextuales según ruta.
 * - Persiste estado en localStorage.
 * - Oculta en rutas de auth/admin embebido si así se desea.
 */
export default function SmartSidebar() {
  const { pathname } = useLocation()

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === null ? true : stored === "1"
  })
  const [openSection, setOpenSection] = useState<string>("")

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0")
  }, [collapsed])

  const visibleSections = useMemo(() => {
    const ids = new Set(matchContext(pathname))
    return SECTIONS.filter((s) => ids.has(s.id))
  }, [pathname])

  // Auto-abrir la sección contextual más relevante al cambiar de ruta
  useEffect(() => {
    if (!collapsed && visibleSections.length) {
      // Si alguna sección contiene el link activo, ábrela
      const sectionWithActive = visibleSections.find((section) =>
        section.links.some((link) => isActiveLink(pathname, link.to)),
      )
      setOpenSection(sectionWithActive?.id ?? visibleSections[0].id)
    }
  }, [pathname, visibleSections, collapsed])

  // Ocultar en intro / auth completo
  if (
    pathname === "/auth" ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return null
  }

  return (
    <aside
      aria-label="Barra de herramientas contextual"
      className={`fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 transition-all duration-300 lg:flex ${
        collapsed ? "w-12" : "w-64"
      }`}
    >
      <div className="glass-card rounded-r-2xl border border-l-0 border-[hsl(var(--gold)/0.2)] p-2 shadow-premium">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-label={
            collapsed
              ? "Expandir barra de herramientas"
              : "Replegar barra de herramientas"
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--electric))]"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          {!collapsed && (
            <span className="text-[10px] uppercase tracking-[0.22em]">
              Herramientas
            </span>
          )}
        </button>

        {collapsed ? (
          <nav
            aria-label="Atajos contextuales"
            className="mt-2 flex flex-col gap-1"
          >
            {visibleSections.map((section) => {
              const Icon = ICON_FOR_SECTION[section.id] ?? Compass
              const firstLink = section.links[0]?.to ?? "/"
              const active = isActiveLink(pathname, firstLink)

              return (
                <Link
                  key={section.id}
                  to={firstLink}
                  aria-label={section.label}
                  title={section.label}
                  className={`flex items-center justify-center rounded-lg p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--electric))] ${
                    active
                      ? "bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold))]"
                      : "hover:bg-[hsl(var(--muted)/0.5))]"
                  }`}
                >
                  <Icon className="h-4 w-4 text-[hsl(var(--electric))]" />
                </Link>
              )
            })}
          </nav>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={(val) => setOpenSection(val)}
            className="mt-2"
          >
            {visibleSections.map((section) => {
              const Icon = section.icon
              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border-[hsl(var(--border))]"
                >
                  <AccordionTrigger className="px-2 py-2 text-sm hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[hsl(var(--electric))]" />
                      {section.label}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <ul className="flex flex-col gap-0.5 pl-6">
                      {section.links.map((link) => {
                        const active = isActiveLink(pathname, link.to)
                        return (
                          <li key={link.to}>
                            <Link
                              to={link.to}
                              className={`block rounded-md px-2 py-1.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--electric))] ${
                                active
                                  ? "bg-[hsl(var(--gold)/0.08)] text-[hsl(var(--gold))]"
                                  : "text-[hsl(var(--foreground)/0.8)] hover:bg-[hsl(var(--muted)/0.5)]"
                              }`}
                            >
                              {link.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </div>
    </aside>
  )
}
