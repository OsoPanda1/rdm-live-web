import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Heart, MessageCircle, MapPin, Share2, Star, Clock, User, Image as ImageIcon } from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { RDM_IMAGES } from "@/data/rdm-images";

// Demo posts (will be replaced with Supabase data when connected)
const DEMO_POSTS = [
  {
    id: "1", author: "María González", avatar: "MG", time: "Hace 2 horas",
    content: "¡Increíble experiencia en la Mina de Acosta! Bajar 400 metros bajo tierra y ver la maquinaria original del siglo XVIII fue impresionante. Los guías son muy conocedores. 100% recomendado para toda la familia. 🏔️⛏️",
    images: [RDM_IMAGES.minaEntrance], location: "Mina de Acosta", likes: 47, comments: 12, rating: 5,
  },
  {
    id: "2", author: "Carlos Ramírez", avatar: "CR", time: "Hace 5 horas",
    content: "Los pastes de Real del Monte son otra cosa. Probé el tradicional de papa con carne y uno de mole, ambos espectaculares. La tradición cornish se siente en cada bocado. ¡Ya quiero volver!",
    images: [RDM_IMAGES.pastesTraditional, RDM_IMAGES.cafeMontana], location: "Plaza Principal", likes: 83, comments: 24, rating: 5,
  },
  {
    id: "3", author: "Ana Sofía López", avatar: "AS", time: "Hace 1 día",
    content: "Amanecer desde Peñas Cargadas. No hay palabras para describir esta vista. La neblina envolviendo todo mientras sale el sol... Real del Monte es magia pura. 🌄",
    images: [RDM_IMAGES.penasCargadas, RDM_IMAGES.bosqueNiebla], location: "Peñas Cargadas", likes: 156, comments: 38,
  },
  {
    id: "4", author: "Roberto Hernández", avatar: "RH", time: "Hace 1 día",
    content: "El Panteón Inglés es uno de los lugares más sobrecogedores que he visitado. Las tumbas victorianas entre la niebla y los pinos te transportan a otra época. Historia pura.",
    images: [RDM_IMAGES.panteonIngles], location: "Panteón Inglés", likes: 92, comments: 15, rating: 5,
  },
  {
    id: "5", author: "Daniela Flores", avatar: "DF", time: "Hace 2 días",
    content: "Nos hospedamos en una cabaña con chimenea y vista al valle de niebla. Despertar con esta vista no tiene precio. Real del Monte es el escape perfecto de la CDMX. ❤️☁️",
    images: [RDM_IMAGES.hospedajeCabana, RDM_IMAGES.miradorSunset], location: "Sierra de Pachuca", likes: 204, comments: 41,
  },
  {
    id: "6", author: "Fernando Castillo", avatar: "FC", time: "Hace 3 días",
    content: "Recorriendo los callejones románticos al atardecer. Cada esquina tiene una leyenda, cada callejón una historia. Los faroles encendiéndose mientras cae la noche... perfecto para una escapada en pareja.",
    images: [RDM_IMAGES.callejonRomantico, RDM_IMAGES.callesColoridas], location: "Centro Histórico", likes: 128, comments: 22, rating: 4,
  },
  {
    id: "7", author: "Lucía Méndez", avatar: "LM", time: "Hace 4 días",
    content: "El Día de Muertos aquí es completamente diferente. La mezcla de tradiciones mexicanas con las costumbres inglesas del Panteón crea algo único en el mundo. Altares bilingües, cempasúchil entre tumbas victorianas... una experiencia que te marca.",
    images: [RDM_IMAGES.diaMuertos], location: "Panteón Inglés", likes: 312, comments: 67,
  },
  {
    id: "8", author: "Arturo Vega", avatar: "AV", time: "Hace 5 días",
    content: "Compré unas piezas de plata hermosas. Los artesanos locales son verdaderos maestros. Cada pieza cuenta la historia minera del pueblo. Un recuerdo con alma.",
    images: [RDM_IMAGES.artesaniasPlata], location: "Portal del Comercio", likes: 67, comments: 9, rating: 5,
  },
];

function PostCard({ post }: { post: typeof DEMO_POSTS[0] }) {
  const [liked, setLiked] = useState(false);
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rdm-glass rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[hsl(var(--rdm-amber)/0.15)] flex items-center justify-center text-sm font-bold text-[hsl(var(--rdm-amber))]">
          {post.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-body)" }}>{post.author}</p>
          <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
            <Clock className="w-3 h-3" /> {post.time}
            {post.location && <><MapPin className="w-3 h-3 ml-1" /> {post.location}</>}
          </div>
        </div>
        {post.rating && (
          <div className="flex items-center gap-1">
            {Array.from({ length: post.rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-[hsl(var(--rdm-amber))] text-[hsl(var(--rdm-amber))]" />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{post.content}</p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className={`grid ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-0.5`}>
          {post.images.map((img, i) => (
            <div key={i} className={`relative overflow-hidden ${post.images.length === 1 ? "h-64" : "h-48"}`}>
              <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex items-center gap-6 border-t border-[hsl(var(--border)/0.5)]">
        <button onClick={() => setLiked(!liked)} className="flex items-center gap-2 text-xs transition-colors hover:text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-body)" }}>
          <Heart className={`w-4 h-4 ${liked ? "fill-[hsl(var(--rdm-red))] text-[hsl(var(--rdm-red))]" : ""}`} />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <button className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors" style={{ fontFamily: "var(--font-body)" }}>
          <MessageCircle className="w-4 h-4" /> {post.comments}
        </button>
        <button className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors ml-auto" style={{ fontFamily: "var(--font-body)" }}>
          <Share2 className="w-4 h-4" /> Compartir
        </button>
      </div>
    </motion.article>
  );
}

export default function ComunidadPage() {
  return (
    <RDMLayout>
      <SEOMeta title="Muro Social — Real del Monte" description="Comparte tus experiencias, fotos y opiniones sobre Real del Monte. Un muro comunitario de visitantes y locales." />

      {/* Hero */}
      <section className="pt-24 pb-8 px-6 md:px-16 lg:px-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Camera className="w-8 h-8 mx-auto text-[hsl(var(--rdm-amber))] mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Muro <span className="text-[hsl(var(--rdm-amber))]">Social</span>
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>
              Experiencias reales de quienes han visitado Real del Monte. Comparte la tuya.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Create Post CTA */}
      <section className="px-6 md:px-16 lg:px-24 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="rdm-glass rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
              <User className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            </div>
            <div className="flex-1 text-sm text-[hsl(var(--muted-foreground))] cursor-pointer hover:text-[hsl(var(--foreground))] transition-colors" style={{ fontFamily: "var(--font-body)" }}>
              ¿Visitaste Real del Monte? Comparte tu experiencia...
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--rdm-amber))] text-white text-xs font-semibold" style={{ fontFamily: "var(--font-body)" }}>
              <ImageIcon className="w-3 h-3" /> Publicar
            </button>
          </div>
        </div>
      </section>

      {/* Feed */}
      <section className="px-6 md:px-16 lg:px-24 pb-20">
        <div className="max-w-2xl mx-auto space-y-4">
          {DEMO_POSTS.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </RDMLayout>
  );
}
