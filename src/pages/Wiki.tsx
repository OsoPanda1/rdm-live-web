import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Loader2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Article = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  content_md: string;
  tags: string[] | null;
};

export default function Wiki() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("wiki_articles").select("*").eq("published", true).order("order_index").then(({ data }) => {
      const arr = (data as Article[]) ?? [];
      setArticles(arr);
      setSelected(arr[0] ?? null);
      setLoading(false);
    });
  }, []);

  const categories = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gold/15 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-gold" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">RDMLAWIKI · Enciclopedia Soberana</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
            Memoria <span className="text-gradient-gold italic">Viva</span> de Real del Monte
          </h1>
          <p className="mt-3 text-base font-body text-muted-foreground max-w-2xl">
            Historia, leyendas, personajes y herencia cornish documentada con rigor editorial. Curada para el Nodo Cero LTOS.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
            <aside className="space-y-6">
              {categories.map((cat) => (
                <div key={cat}>
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/60 mb-2">{cat}</p>
                  <div className="space-y-1">
                    {articles.filter((a) => a.category === cat).map((a) => (
                      <button key={a.id} onClick={() => setSelected(a)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${selected?.id === a.id ? "bg-gold/10 text-gold border border-gold/20" : "text-muted-foreground hover:text-platinum hover:bg-secondary/30"}`}>
                        <ChevronRight className="h-3 w-3" />
                        <span className="truncate">{a.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </aside>

            <article className="glass-card rounded-2xl p-8 border border-gold/15">
              {selected && (
                <>
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">{selected.category}</span>
                  <h2 className="mt-2 text-4xl font-display font-bold text-platinum">{selected.title}</h2>
                  {selected.excerpt && <p className="mt-3 text-base italic text-muted-foreground font-display">{selected.excerpt}</p>}
                  <div className="mt-6 prose prose-invert max-w-none font-body text-platinum/90">
                    {selected.content_md.split("\n").map((line, i) => {
                      if (line.startsWith("# ")) return <h1 key={i} className="text-3xl font-display mt-6 mb-3 text-gold">{line.slice(2)}</h1>;
                      if (line.startsWith("## ")) return <h2 key={i} className="text-2xl font-display mt-5 mb-2 text-platinum">{line.slice(3)}</h2>;
                      if (line.startsWith("- ")) return <li key={i} className="ml-6 list-disc text-platinum/85">{line.slice(2)}</li>;
                      if (!line.trim()) return <br key={i} />;
                      return <p key={i} className="text-platinum/85 leading-relaxed mb-3">{line}</p>;
                    })}
                  </div>
                  {selected.tags && selected.tags.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-border/20 flex flex-wrap gap-2">
                      {selected.tags.map((t) => (
                        <span key={t} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-gold/10 text-gold border border-gold/20">#{t}</span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
