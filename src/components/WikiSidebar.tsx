import {
  BookOpen, Landmark, Layers, Shield, Brain, Clock, FileText,
  Home, Network, GraduationCap, Globe, Coins, ChevronDown,
  Activity, Cpu, BookMarked, Rocket, Crown, Briefcase, Plug, Target, Library,
  Users, Link2, Monitor, Atom, Search, Heart, Award,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

const mainNav = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Introducción", url: "/introduccion", icon: BookOpen },
  { title: "Filosofía y Códice", url: "/filosofia", icon: Landmark },
  { title: "Arquitectura", url: "/arquitectura", icon: Layers },
  { title: "WikiTAMV", url: "/wiki", icon: Library },
];

const dominios = [
  { title: "ID‑NVIDA", url: "/dominios/id-nvida", icon: Shield },
  { title: "UTAMV", url: "/dominios/utamv", icon: GraduationCap },
  { title: "Metaverso MD‑X4", url: "/dominios/metaverso", icon: Globe },
  { title: "Economía TAMV", url: "/dominios/economia", icon: Coins },
  { title: "Seguridad", url: "/dominios/seguridad", icon: Shield },
];

const ecosistema = [
  { title: "Red Social Avanzada", url: "/red-social", icon: Users },
  { title: "Seguridad TENOCHTITLAN", url: "/seguridad-tenochtitlan", icon: Shield },
  { title: "Blockchain MSR", url: "/blockchain-msr", icon: Link2 },
  { title: "XR/VR/3D/4D", url: "/xr-tecnologia", icon: Monitor },
  { title: "Economía Federada", url: "/economia-federada", icon: Coins },
  { title: "Quantum Computing", url: "/quantum-computing", icon: Atom },
  { title: "Enciclopedia Universal", url: "/enciclopedia", icon: Search },
  { title: "Isabella AI", url: "/isabella-ai", icon: Heart },
  { title: "Impacto & Expansión", url: "/impacto-civilizatorio", icon: Award },
];

const extras = [
  { title: "IA & Agentes", url: "/ia-agentes", icon: Brain },
  { title: "Sistemas Avanzados", url: "/sistemas-avanzados", icon: Cpu },
  { title: "Dashboard", url: "/dashboard", icon: Activity },
  { title: "Línea de Tiempo", url: "/timeline", icon: Clock },
  { title: "Documentación", url: "/documentacion", icon: FileText },
  { title: "Manuales", url: "/manuales", icon: BookMarked },
  { title: "Gobernanza", url: "/gobernanza", icon: Shield },
  { title: "Despliegue", url: "/despliegue", icon: Rocket },
  { title: "Biografía CEO", url: "/biografia-ceo", icon: Crown },
  { title: "Casos de Uso", url: "/casos-de-uso", icon: Briefcase },
  { title: "Kit APIs", url: "/kit-apis", icon: Plug },
  { title: "Estrategia", url: "/estrategia", icon: Target },
];

export function WikiSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderItems = (items: typeof mainNav) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.url}
              end
              className="hover:bg-sidebar-accent/50 transition-colors"
              activeClassName="bg-sidebar-accent text-primary font-medium"
            >
              <item.icon className="mr-2 h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70 uppercase text-xs tracking-widest">
            General
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(mainNav)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="text-primary/70 uppercase text-xs tracking-widest flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1">
                  <Network className="h-3 w-3" /> Dominios
                </span>
                {!collapsed && <ChevronDown className="h-3 w-3" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>{renderItems(dominios)}</SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="text-primary/70 uppercase text-xs tracking-widest flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Ecosistema NextGen
                </span>
                {!collapsed && <ChevronDown className="h-3 w-3" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>{renderItems(ecosistema)}</SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70 uppercase text-xs tracking-widest">
            Más
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderItems(extras)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
