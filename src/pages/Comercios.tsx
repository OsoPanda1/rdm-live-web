// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Store } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ModuleCinematicIntro } from "@/components/ModuleCinematicIntro";
import { BusinessCard } from "@/components/business/BusinessCard";
import { ElegantPagination } from "@/components/ElegantPagination";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  { value: "all", label: "Todos" },
  { value: "GASTRONOMIA", label: "Gastronomía" },
  { value: "HOSPEDAJE", label: "Hospedaje" },
  { value: "ARTESANIA", label: "Artesanía" },
  { value: "BAR", label: "Bar" },
  { value: "COMERCIO", label: "Comercio" },
  { value: "TURISMO", label: "Turismo" },
];

const PAGE_SIZE = 9;

export default function Comercios() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (data) setBusinesses(data);
    }
    load();
  }, []);

  const filtered = businesses.filter(b => {
    const matchCat = category === "all" || b.category === category;
    const matchSearch = !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (showIntro) {
    return (
      <ModuleCinematicIntro
        title="Directorio Comercial"
        eyebrow="Real del Monte"
        description="Descubre los comercios, restaurantes y artesanos que dan vida a nuestro Pueblo Mágico"
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
              <Store className="h-5 w-5 text-accent" />
              <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Economía Local</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">Directorio de Comercios</h1>
            <p className="text-muted-foreground max-w-2xl">Negocios activos verificados en Real del Monte. Apoya la economía local.</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar comercio..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl bg-card/60 border-border/50" />
            </div>
            <Select value={category} onValueChange={v => { setCategory(v); setPage(0); }}>
              <SelectTrigger className="w-48 rounded-xl bg-card/60 border-border/50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {paged.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Store className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p>No hay comercios registrados aún.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged.map(b => <BusinessCard key={b.id} business={b} />)}
            </div>
          )}

          <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}
