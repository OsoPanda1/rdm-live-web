import { Outlet } from "react-router-dom";
import FloatingNav from "@/components/rdm/FloatingNav";
import FooterSection from "@/components/rdm/FooterSection";
import DedicationBand from "@/components/rdm/DedicationBand";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { GlobalSidebar } from "@/components/rdm/GlobalSidebar";

export function PublicLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <GlobalSidebar />
        <SidebarInset className="flex-1 min-w-0">
          <FloatingNav />
          <div className="fixed top-3 left-3 z-50">
            <SidebarTrigger className="bg-background/80 backdrop-blur-xl border border-platinum/20 text-platinum hover:text-gold rounded-xl shadow-lg" />
          </div>
          <main>
            <Outlet />
          </main>
          <DedicationBand />
          <FooterSection />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
