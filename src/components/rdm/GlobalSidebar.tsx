import { NavLink, useLocation } from "react-router-dom";
import {
  Mountain,
  Pickaxe,
  Utensils,
  MapPin,
  Compass,
  Users,
  Bot,
  LayoutDashboard,
  Navigation,
  Store,
  ShieldCheck,
  Ghost,
  User as UserIcon,
  Music as MusicIcon,
  Gamepad2,
  BookOpen,
  Activity,
  Sparkles,
  Cpu,
  Building2,
  ClipboardCheck,
  ChevronDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import rdmLogo from "@/assets/rdm-logo.png";

type Item = { path: string; label: string; icon: any; tag?: string };
type Group = { id: string; label: string; icon: any; items: Item[] };

const GROUPS: Group[] = [
  {
    id: "identidad",
    label: "Identidad & Memoria",
    icon: BookOpen,
    items: [
      { path: "/", label: "Inicio · Nodo Cero", icon: Mountain, tag: "HUB" },
      { path: "/historia", label: "Historia Minera", icon: Pickaxe },
      { path: "/wiki", label: "Wiki Realmontense", icon: BookOpen },
      { path: "/ltos", label: "Manifiesto LTOS", icon: ShieldCheck, tag: "TAMV" },
      { path: "/mitos", label: "Mitos y Leyendas", icon: Ghost },
    ],
  },
  {
    id: "territorio",
    label: "Territorio Vivo",
    icon: Navigation,
    items: [
      { path: "/mapa", label: "Mapa Interactivo", icon: Navigation },
      { path: "/lugares", label: "Lugares Sagrados", icon: MapPin },
      { path: "/recorridos", label: "Recorridos Guiados", icon: Compass },
      { path: "/ruta-del-paste", label: "Ruta del Paste", icon: Utensils, tag: "SVG" },
      { path: "/rutas", label: "Rutas Editoriales", icon: Compass },
    ],
  },
  {
    id: "experiencias",
    label: "Experiencias",
    icon: Sparkles,
    items: [
      { path: "/gastronomia", label: "Gastronomía", icon: Utensils },
      { path: "/music", label: "RDM Radio", icon: MusicIcon, tag: "♪" },
      { path: "/juegos", label: "Juegos", icon: Gamepad2 },
      { path: "/game", label: "Veta Soberana", icon: Pickaxe, tag: "GA" },
    ],
  },
  {
    id: "comunidad",
    label: "Comunidad & Comercio",
    icon: Users,
    items: [
      { path: "/comunidad", label: "Foro Abierto", icon: Users },
      { path: "/comercios", label: "Comercios Locales", icon: Store },
      { path: "/registrar-comercio", label: "Registrar Comercio", icon: Building2 },
      { path: "/b2b", label: "Portal B2B", icon: Building2, tag: "B2B" },
      { path: "/perfil", label: "Mi Perfil", icon: UserIcon },
    ],
  },
  {
    id: "operaciones",
    label: "Operaciones Soberanas",
    icon: Cpu,
    items: [
      { path: "/dashboard", label: "Dashboard CEO", icon: LayoutDashboard, tag: "SYS" },
      { path: "/control", label: "Control Center", icon: Activity, tag: "OPS" },
      { path: "/realito", label: "Realito AI", icon: Bot, tag: "AI" },
      { path: "/admin", label: "Administración", icon: ShieldCheck, tag: "RBAC" },
      { path: "/demo-checklist", label: "Demo Checklist", icon: ClipboardCheck },
    ],
  },
];

export function GlobalSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  return (
    <Sidebar collapsible="icon" className="border-r border-white/[0.06]">
      <SidebarHeader className="border-b border-white/[0.06] py-4">
        <NavLink to="/" className="flex items-center gap-3 px-2">
          <img
            src={rdmLogo}
            alt="RDM"
            className="h-9 w-9 shrink-0 drop-shadow-[0_0_10px_rgba(229,228,226,0.35)]"
          />
          {!collapsed && (
            <div className="leading-none min-w-0">
              <p className="text-[13px] font-display font-bold bg-gradient-to-r from-platinum-light via-platinum to-platinum-light bg-clip-text text-transparent truncate">
                RDM DIGITAL
              </p>
              <p className="mt-1 text-[9px] font-mono uppercase tracking-[0.22em] text-muted-foreground flex items-center gap-1">
                <Cpu className="h-2.5 w-2.5 text-gold animate-pulse" />
                MD-X5 · Nodo Cero
              </p>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-1">
        {GROUPS.map((group) => {
          const groupActive = group.items.some((i) => isActive(i.path));
          if (collapsed) {
            // Collapsed: render items flat (icon only) per group
            return (
              <SidebarGroup key={group.id}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                          <NavLink to={item.path}>
                            <item.icon className="h-4 w-4" />
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }
          return (
            <Collapsible key={group.id} defaultOpen={groupActive} className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild className="px-2">
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/80 hover:text-gold transition-colors py-2">
                    <span className="flex items-center gap-2">
                      <group.icon className="h-3 w-3" />
                      {group.label}
                    </span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-300 group-data-[state=closed]/collapsible:-rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton asChild isActive={isActive(item.path)}>
                            <NavLink
                              to={item.path}
                              className={({ isActive: a }) =>
                                cn(
                                  "flex items-center gap-2.5 rounded-md text-[12.5px] transition-colors",
                                  a
                                    ? "text-gold bg-gold/10 border border-gold/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]",
                                )
                              }
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span className="truncate flex-1">{item.label}</span>
                              {item.tag && (
                                <span className="ml-auto font-mono text-[8.5px] tracking-widest px-1.5 py-0.5 rounded border border-white/10 text-muted-foreground/70">
                                  {item.tag}
                                </span>
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.06] p-3">
        {!collapsed ? (
          <div className="rounded-lg border border-platinum/20 bg-gradient-to-br from-platinum/[0.04] to-transparent p-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Soberanía Activa
              </p>
            </div>
            <p className="mt-2 text-[9px] font-display italic text-platinum-light/80 leading-snug">
              "Orgullosamente Realmontenses"
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
