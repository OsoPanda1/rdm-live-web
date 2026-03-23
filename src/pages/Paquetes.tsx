// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Compass, Clock, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ModuleCinematicIntro } from "@/components/ModuleCinematicIntro";
import { PackageCard } from "@/components/packages/PackageCard";
import { ElegantPagination } from "@/components/ElegantPagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const TYPES = [
  { value: "all", label: "Todos" },
  { value: "cultural", label: "Cultural" },
  { value: "aventurero", label: "Aventurero" },
  { value: "romantico", label: "Romántico" },
  { value: "gastronomico", label: "Gastronómico" },
  { value: "relajacion", label: "Relajación" },
];

const PAGE_SIZE = 6;

export default function Paquetes() {
  const [packages, setPackages] = useState<any[]>([]);
  const [type, setType] = useState("all");
  const [page, setPage] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("packages").select("*").eq("status", "active").order("created_at", { ascending: false });
      if (data) setPackages(data);
    }
    load();
  }, []);

  const filtered = type === "all" ? packages : packages.filter(p => p.type === type);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (showIntro) {
    return (
      <ModuleCinematicIntro
        title="Paquetes de Visita"
        eyebrow="Experiencias Curadas"
        description="Itinerarios diseñados para cada tipo de viajero. Aventura, romance, cultura o gastronomía."
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
              <Compass className="h-5 w-5 text-accent" />
              <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Experiencias</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Paquetes de Visita</h1>
          </motion.div>

          <div className="flex gap-3 mb-8">
            <Select value={type} onValueChange={v => { setType(v); setPage(0); }}>
              <SelectTrigger className="w-52 rounded-xl bg-card/60 border-border/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {paged.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Compass className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p>No hay paquetes disponibles aún.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged.map(p => <PackageCard key={p.id} pkg={p} />)}
            </div>
          )}

          <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}
