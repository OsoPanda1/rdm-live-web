import { Outlet } from "react-router-dom";
import { RDMNavbar } from "@/components/rdm/RDMNavbar";
import { RDMFooter } from "@/components/rdm/RDMFooter";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { GlobalSidebar } from "@/components/rdm/GlobalSidebar";

export function PublicLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <GlobalSidebar />
        <SidebarInset className="flex-1 min-w-0">
          <RDMNavbar />
          <div className="fixed top-3 left-3 z-50">
            <SidebarTrigger className="bg-background/80 backdrop-blur-xl border border-platinum/20 text-platinum hover:text-gold rounded-xl shadow-lg" />
          </div>
          <main>
            <Outlet />
          </main>
          <div className="border-t border-white/5 py-2 text-center text-[10px] text-muted-foreground">
            © 2026 RDM Digital · Tecnología al servicio de la memoria
          </div>
          <RDMFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
