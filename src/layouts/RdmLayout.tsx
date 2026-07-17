import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { GlobalSidebar } from "@/components/rdm/GlobalSidebar";

export function RdmLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <GlobalSidebar />
        <SidebarInset className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-40 h-12 flex items-center gap-3 border-b border-platinum/10 bg-background/70 backdrop-blur-xl px-3">
            <SidebarTrigger className="text-platinum hover:text-gold" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              RDM_OS · Panel Soberano
            </span>
          </header>
          <div
            className="pointer-events-none fixed top-0 right-0 left-0 h-[600px] opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(43 80% 55% / 0.06), transparent 70%)",
            }}
          />
          <div className="relative z-10 p-6 md:p-8 flex-1">
            <Outlet />
          </div>
          <div className="border-t border-white/5 py-2 text-center text-[10px] text-muted-foreground">
            © 2026 RDM Digital · Tecnología al servicio de la memoria
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
