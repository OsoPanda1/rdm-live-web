// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, PenSquare, Image as ImageIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ModuleCinematicIntro } from "@/components/ModuleCinematicIntro";
import { PostCard } from "@/components/community/PostCard";
import { ElegantPagination } from "@/components/ElegantPagination";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const PAGE_SIZE = 8;

export default function ComunidadPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("community_posts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
    }
    load();
  }, []);

  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const paged = posts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Inicia sesión", description: "Necesitas una cuenta para publicar.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      title: newTitle || null,
      content: newContent,
      type: "post",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Publicado", description: "Tu post es visible para la comunidad." });
      setNewTitle(""); setNewContent(""); setShowCreate(false);
      const { data } = await supabase.from("community_posts").select("*").eq("status", "active").order("created_at", { ascending: false });
      if (data) setPosts(data);
    }
  };

  if (showIntro) {
    return (
      <ModuleCinematicIntro
        title="Comunidad RDM"
        eyebrow="Voz del Pueblo"
        description="Historias, experiencias y conexiones entre visitantes y locales de Real del Monte"
        onComplete={() => setShowIntro(false)}
      />
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 md:px-8 pt-24 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex items-start justify-between">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">Comunidad</h1>
              <p className="text-muted-foreground">Muro global de Real del Monte</p>
            </div>
            <Button onClick={() => setShowCreate(!showCreate)} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl gap-2">
              <PenSquare className="h-4 w-4" /> Publicar
            </Button>
          </motion.div>

          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8 p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm space-y-3">
              <Input placeholder="Título (opcional)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="rounded-xl bg-background/50" />
              <Textarea placeholder="¿Qué quieres compartir?" value={newContent} onChange={e => setNewContent(e.target.value)} className="rounded-xl bg-background/50 min-h-[100px]" />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">Publicar</Button>
              </div>
            </motion.div>
          )}

          {paged.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <MessageCircle className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p>Sé el primero en compartir algo con la comunidad.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {paged.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          )}

          <ElegantPagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}
