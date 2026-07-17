import { useState } from "react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta, PAGE_SEO } from "@/components/SEOMeta";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MapPin, Clock, TrendingUp, Users, Sparkles, BookOpen } from "lucide-react";

interface FeedPost {
  id: string;
  author: { name: string; avatar: string; badge?: string };
  content: string;
  image?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  tags: string[];
  location?: string;
}

const DEMO_POSTS: FeedPost[] = [
  { id: "1", author: { name: "Mina de Acosta", avatar: "/images/mine-entrance.jpg", badge: "Lugar verificado" }, content: "Hoy inauguramos la nueva experiencia de realidad aumentada en el túnel principal. Los visitantes podrán ver cómo era la minería en 1880 a través de sus dispositivos móviles.", timestamp: new Date("2026-06-25T10:30:00"), likes: 47, comments: 12, tags: ["mina", "realidad-aumentada", "turismo"], location: "Mina de Acosta" },
  { id: "2", author: { name: "Cultura RDM", avatar: "/images/dia-muertos.jpg", badge: "Cultural" }, content: "Últimos días de la exposición 'Plata y Memoría' en el Museo del Paste. Entrada libre. No te pierdas las piezas de platería tradicional.", timestamp: new Date("2026-06-24T14:00:00"), likes: 32, comments: 8, tags: ["cultura", "exposición", "plata"], location: "Museo del Paste" },
  { id: "3", author: { name: "Comunidad RDM", avatar: "/images/bosque-niebla.jpg", badge: "Comunitario" }, content: "Gracias a todos los que participaron en la jornada de limpieza del bosque de niebla. ¡Recolectamos más de 200 kg de residuos! El siguiente sábado haremos otra jornada.", timestamp: new Date("2026-06-23T09:00:00"), likes: 89, comments: 24, tags: ["comunidad", "ambiente", "voluntariado"] },
  { id: "4", author: { name: "Gastronomía RDM", avatar: "/images/gastronomia-paste.jpg", badge: "Gastronómico" }, content: "Nuevo paste de temporada: ¡Paste de hongos y queso de cabra! Disponible en Pastes El Portal y pastelerías locales. Acompañado de salsa de chile morita.", timestamp: new Date("2026-06-22T12:00:00"), likes: 56, comments: 15, tags: ["gastronomía", "paste", "tradición"] },
  { id: "5", author: { name: "Junta Local", avatar: "/images/plaza-principal.jpg", badge: "Oficial" }, content: "Convocatoria abierta para el Festival de la Luz y la Plata 2026. Inscripciones hasta el 15 de julio. Categorías: fotografía, video, arte digital y música.", timestamp: new Date("2026-06-21T08:00:00"), likes: 124, comments: 31, tags: ["festival", "convocatoria", "cultura"] },
  { id: "6", author: { name: "Isabella AI", avatar: "/images/ceo-tamv.jpg", badge: "IA TAMV" }, content: "He estado analizando los patrones de visita de este mes. La afluencia turística ha aumentado un 34% vs el mes anterior. Recomiendo activar el plan de capacidad extendida los fines de semana.", timestamp: new Date("2026-06-20T16:00:00"), likes: 73, comments: 9, tags: ["isabella", "datos", "turismo"] },
];

const TRENDING_TAGS = ["#cultura", "#mina", "#paste", "#festival", "#realidad-aumentada", "#turismo", "#comunidad", "#plata"];

export default function Feed() {
  const [activeTab, setActiveTab] = useState<"recent" | "trending" | "following">("recent");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <RDMLayout>
      <SEOMeta {...PAGE_SEO.mapa} title="Feed Comunitario — RDM Digital" description="Publicaciones, historias y recuerdos compartidos por la comunidad de Real del Monte." />
      <div className="pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--rdm-amber)/0.3)] bg-[hsl(var(--rdm-amber)/0.08)] px-4 py-2 text-xs uppercase tracking-[0.2em] mb-4">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--rdm-amber))]" />
            <span>Red Social Territorial</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Feed Comunitario</h1>
          <p className="mt-3 text-[hsl(var(--muted-foreground))] max-w-2xl">Publicaciones, historias y recuerdos compartidos por la comunidad de Real del Monte.</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] w-fit">
              {(["recent", "trending", "following"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === tab ? "bg-[hsl(var(--rdm-amber))] text-white" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>
                  {tab === "recent" ? "Recientes" : tab === "trending" ? "Tendencia" : "Siguiendo"}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {DEMO_POSTS.map((post, i) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="rounded-2xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background))] p-5 hover:border-[hsl(var(--rdm-amber)/0.3)] transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[hsl(var(--rdm-amber)/0.2)] flex items-center justify-center text-xs font-bold text-[hsl(var(--rdm-amber))] overflow-hidden">
                        <img src={post.author.avatar} alt="" loading="lazy" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget).style.display = "none" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{post.author.name}</span>
                          {post.author.badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--rdm-amber)/0.1)] text-[hsl(var(--rdm-amber))]">{post.author.badge}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{post.timestamp.toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                          {post.location && <><MapPin className="h-3 w-3" /><span>{post.location}</span></>}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-[hsl(var(--foreground)/0.85)] leading-relaxed mb-3">{post.content}</p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">#{tag}</span>)}
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-[hsl(var(--border)/0.3)]">
                      <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-colors">
                        <Heart className={`h-3.5 w-3.5 ${likedPosts.has(post.id) ? "fill-red-400 text-red-400" : ""}`} />
                        {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--rdm-amber))] transition-colors">
                        <MessageCircle className="h-3.5 w-3.5" />{post.comments}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--rdm-amber))] transition-colors ml-auto">
                        <Share2 className="h-3.5 w-3.5" />Compartir
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background))] p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-4"><TrendingUp className="h-4 w-4 text-[hsl(var(--rdm-amber))]" />Tendencia</h3>
              <div className="space-y-2">
                {TRENDING_TAGS.slice(0, 6).map((tag, i) => (
                  <button key={tag} className="flex items-center justify-between w-full text-xs px-3 py-2 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] transition-colors">
                    <span className="text-[hsl(var(--rdm-amber))]">{tag}</span>
                    <span className="text-[hsl(var(--muted-foreground))]">{Math.floor(20 + Math.random() * 80)} publicaciones</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border)/0.4)] bg-[hsl(var(--background))] p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-4"><Users className="h-4 w-4 text-[hsl(var(--rdm-amber))]" />Actividad Reciente</h3>
              <div className="space-y-3 text-xs text-[hsl(var(--muted-foreground))]">
                {["María G. visitó Mina de Acosta", "Carlos L. compartió 3 fotos", "Ana R. comentó en 'Paste de temporada'", "Turismo RDM publicó un evento", "Isabella AI analizó 45 reviews"].map((activity, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--rdm-amber)/0.5)]" />
                    <span>{activity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--rdm-amber)/0.25)] bg-[hsl(var(--rdm-amber)/0.06)] p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3"><BookOpen className="h-4 w-4 text-[hsl(var(--rdm-amber))]" />Sobre el Feed</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">Este espacio está moderado por el Guardian de Isabella AI con supervisión humana (HITL). Las publicaciones siguen el código de conducta TAMV y promueven el respeto, la cultura y la memoria de Real del Monte.</p>
            </div>
          </div>
        </div>
      </div>
    </RDMLayout>
  );
}