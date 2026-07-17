import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Quote, Heart, Sparkles, Search, Filter, ChevronDown, Share2, BookOpen, ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DichosIntro } from "./DichosIntro";
import { useCivicEvent } from "@/hooks/useCivicEvent";

const CATEGORIES = [
  { id: "all", label: "Todos", icon: "✨" },
  { id: "PERSONAJES", label: "Personajes", icon: "👤" },
  { id: "BRINDIS", label: "Brindis", icon: "🥂" },
  { id: "HUMOR", label: "Humor", icon: "🎭" },
  { id: "FAMILIA", label: "Familia", icon: "👥" },
  { id: "COMIDA_BEBIDA", label: "Comida y Bebida", icon: "🍷" },
  { id: "TRABAJO", label: "Trabajo", icon: "⚙️" },
  { id: "VIDA_COTIDIANA", label: "Vida Cotidiana", icon: "🏛️" },
  { id: "MINERIA", label: "Minería", icon: "💎" },
];

interface Dicho {
  id: string;
  personaje: string;
  texto: string;
  significado: string;
  jerga_original: string;
  categoria: string;
  likes: number;
}

interface DichosSectionProps {
  onBack: () => void;
}

export function DichosSection({ onBack }: DichosSectionProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [likedDichos, setLikedDichos] = useState<Set<string>>(new Set());
  const [dichos, setDichos] = useState<Dicho[]>([]);
  const [loading, setLoading] = useState(true);
  const emit = useCivicEvent();

  useEffect(() => {
    async function fetchDichos() {
      try {
        if (import.meta.env.VITE_API_GATEWAY) {
          const res = await fetch(`${import.meta.env.VITE_API_GATEWAY}/dichos`);
          if (res.ok) {
            const data = await res.json();
            setDichos((data.items ?? []) as Dicho[]);
            setLoading(false);
            return;
          }
        }

        const { data } = await supabase.from("dichos").select("*").order("likes", { ascending: false });
        if (data) setDichos(data as Dicho[]);
      } finally {
        setLoading(false);
      }
    }
    fetchDichos();
  }, []);

  const filteredDichos = dichos.filter((d) => {
    const matchCat = selectedCategory === "all" || d.categoria === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      d.texto.toLowerCase().includes(q) ||
      d.personaje.toLowerCase().includes(q) ||
      d.significado.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const featuredDichos = [...dichos].sort((a, b) => b.likes - a.likes).slice(0, 3);

  const handleLike = (id: string) => {
    setLikedDichos((prev) => {
      const s = new Set(prev);
      if (s.has(id)) { s.delete(id); } else { s.add(id); }
      return s;
    });
  };

  if (showIntro) {
    return (
      <AnimatePresence>
        <DichosIntro onComplete={() => setShowIntro(false)} />
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Hero */}
      <div className="relative py-24 px-6 md:px-16 lg:px-24 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at top, hsl(var(--accent) / 0.35) 0%, transparent 50%)",
        }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors font-body mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-xs tracking-[0.4em] uppercase text-accent font-body mb-4 flex items-center gap-2">
              <BookOpen className="w-3 h-3" />
              Archivo Histórico · Real del Monte
            </p>
            <h1 className="text-4xl md:text-7xl font-display font-bold mb-4 leading-[0.9]">
              Callejón de los{" "}
              <span className="text-accent">Dichos</span>
            </h1>
            <p className="text-foreground/60 font-body max-w-xl text-lg leading-relaxed">
              La identidad de nuestro Pueblo Mágico codificada en 47 expresiones atemporales.
              Un ecosistema lingüístico preservado en alta fidelidad.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="px-6 md:px-16 lg:px-24 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por personaje, dicho o significado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-muted/50 border-border/50 font-body"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px] bg-muted/50 border-border/50 font-body">
              <Filter className="w-3 h-3 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="font-body">
                  {cat.icon} {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Featured */}
        {selectedCategory === "all" && !searchQuery && featuredDichos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="text-lg font-display font-semibold">Nodos Destacados</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredDichos.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="group relative rounded-2xl overflow-hidden glass p-6 hover:border-accent/30 transition-colors cursor-pointer"
                  onClick={() => {
                    const next = expandedId === d.id ? null : d.id;
                    setExpandedId(next);
                    if (next) {
                      void emit({
                        type: "DICHO_CONSULTED",
                        federation: "BOOKPI",
                        payload: { id: d.id, tags: [d.categoria], origen: d.personaje },
                        source: "WEB_PORTAL",
                      });
                    }
                  }}
                >
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="text-[10px] border-accent/30 text-accent font-body">
                      #{i + 1}
                    </Badge>
                  </div>
                  <p className="text-xs text-accent font-body font-medium mb-2">{d.personaje}</p>
                  <p className="text-base font-display font-semibold mb-3 leading-snug">
                    "{d.texto}"
                  </p>
                  <p className="text-xs text-muted-foreground font-body">{d.significado}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] text-muted-foreground font-body flex items-center gap-1">
                      {CATEGORIES.find((c) => c.id === d.categoria)?.icon}
                      {d.categoria.replace("_", " ")}
                    </span>
                    <span className="text-xs text-accent flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {d.likes}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { label: "Personajes Mapeados", value: dichos.length },
            { label: "Taxonomías", value: CATEGORIES.length - 1 },
            { label: "Años de Preservación", value: "200+" },
            { label: "Registros Únicos", value: "47" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="glass rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-display font-bold text-accent">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-body mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-semibold">
            {selectedCategory === "all"
              ? "Directorio Completo"
              : `${CATEGORIES.find((c) => c.id === selectedCategory)?.icon} ${CATEGORIES.find((c) => c.id === selectedCategory)?.label}`}
          </h2>
          <Badge variant="outline" className="text-xs font-body border-border/50 text-muted-foreground">
            {filteredDichos.length} resultados
          </Badge>
        </div>

        {/* Dichos Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground font-body mt-4">Cargando archivo...</p>
          </div>
        ) : filteredDichos.length === 0 ? (
          <div className="text-center py-20">
            <Quote className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-body">No existen registros bajo esos parámetros.</p>
          </div>
        ) : (
          <div className="space-y-2 pb-24">
            {filteredDichos.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => {
                  const next = expandedId === d.id ? null : d.id;
                  setExpandedId(next);
                  if (next) {
                    void emit({
                      type: "DICHO_CONSULTED",
                      federation: "BOOKPI",
                      payload: {
                        id: d.id,
                        tags: [d.categoria],
                        origen: d.personaje,
                      },
                      source: "WEB_PORTAL",
                    });
                  }
                }}
                className="group glass rounded-xl p-4 cursor-pointer hover:border-accent/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm shrink-0">
                    {CATEGORIES.find((c) => c.id === d.categoria)?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-accent font-body font-medium mb-1">{d.personaje}</p>
                    <p className="text-sm font-display font-semibold leading-snug">"{d.texto}"</p>

                    <AnimatePresence>
                      {expandedId === d.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body mb-1">
                                Jerga Original
                              </p>
                              <p className="text-xs text-foreground/80 font-body italic">{d.jerga_original}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-body mb-1">
                                Traducción
                              </p>
                              <p className="text-xs text-foreground/80 font-body">{d.significado}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(d.id);
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors font-body"
                  >
                    <Heart
                      className={`w-3 h-3 ${likedDichos.has(d.id) ? "fill-accent text-accent" : ""}`}
                    />
                    {d.likes + (likedDichos.has(d.id) ? 1 : 0)}
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
