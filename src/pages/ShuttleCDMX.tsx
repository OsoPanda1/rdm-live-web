// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bus, Search, Calendar, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ModuleCinematicIntro } from "@/components/ModuleCinematicIntro";
import { ShuttleRouteCard } from "@/components/transport/ShuttleRouteCard";
import { ElegantPagination } from "@/components/ElegantPagination";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const PAGE_SIZE = 6;

export default function ShuttleCDMX() {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("shuttle_routes")
        .select("*, shuttle_companies(name)")
        .eq("status", "active")
        .order("departure_time");
      if (data) setRoutes(data.map(r => ({
        ...r,
        company_name: (r.shuttle_companies as any)?.name,
        days_of_week: Array.isArray(r.days_of_week) ? r.days_of_week : [],
      })));
    }
    load();
  }, []);

  const totalPages = Math.ceil(routes.length / PAGE_SIZE);
  const paged = routes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleBook = () => {
    toast({ title: "Reserva", description: "Sistema de reservas próximamente. Contacta a la empresa directamente." });
  };

  if (showIntro) {
    return (
      <ModuleCinematicIntro
        title="Shuttle CDMX ↔ RDM"
        eyebrow="Conexión Directa"
        description="Viaja cómodo entre la Ciudad de México y Real del Monte con servicios de shuttle verificados"
        onComplete={() => setShowIntro(false)}
      />
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 pt-24 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Bus className="h-5 w-5 text-accent" />
              <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Conectividad</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Shuttle CDMX ↔ Real del Monte</h1>
            <p className="text-muted-foreground max-w-2xl">Rutas de transporte directo entre la capital y nuestro Pueblo Mágico.</p>
          </motion.div>

          {paged.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Bus className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p>No hay rutas de shuttle disponibles aún.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {paged.map(r => <ShuttleRouteCard key={r.id} route={r} onBook={handleBook} />)}
            </div>
          )}

          <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}
