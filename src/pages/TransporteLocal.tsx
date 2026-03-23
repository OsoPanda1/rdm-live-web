// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, MapPin, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ModuleCinematicIntro } from "@/components/ModuleCinematicIntro";
import { TransportCard } from "@/components/transport/TransportCard";
import { ElegantPagination } from "@/components/ElegantPagination";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 8;

export default function TransporteLocal() {
  const [providers, setProviders] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("transport_providers").select("*").eq("status", "active").order("name");
      if (data) setProviders(data);
    }
    load();
  }, []);

  const totalPages = Math.ceil(providers.length / PAGE_SIZE);
  const paged = providers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (showIntro) {
    return (
      <ModuleCinematicIntro
        title="Transporte Local"
        eyebrow="Movilidad en RDM"
        description="Taxis, urbans y servicios de transporte dentro de Real del Monte y alrededores"
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
              <Car className="h-5 w-5 text-primary" />
              <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Movilidad</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Transporte Local</h1>
            <p className="text-muted-foreground max-w-2xl">Servicios de transporte disponibles en Real del Monte.</p>
          </motion.div>

          {paged.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Car className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p>No hay transportistas registrados aún.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged.map(p => <TransportCard key={p.id} provider={p} />)}
            </div>
          )}

          <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}
