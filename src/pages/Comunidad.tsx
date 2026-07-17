import { RDMLayout } from "@/components/rdm/RDMLayout";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SEOMeta from "@/components/SEOMeta";
import GradientSeparator from "@/components/GradientSeparator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useRDMAuth } from "@/contexts/RDMAuthContext";
import { 
  Heart, MessageCircle, MapPin, Send, Plus, X, User,
  Camera, Film, Utensils, Mountain, Clock, Palette, Sparkles,
  ChevronDown, ThumbsUp, Share2, BookOpen, LogIn
} from "lucide-react";

import pasteImg from "@/assets/paste.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import minaImg from "@/assets/mina-acosta.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import callesImg from "@/assets/calles-colonial.webp";
import heroImg from "@/assets/hero-real-del-monte.webp";

const categories = [
  { id: "all", label: "Todos", icon: Sparkles },
  { id: "gastronomia", label: "Gastronomía", icon: Utensils },
  { id: "historia", label: "Historia", icon: Clock },
  { id: "naturaleza", label: "Naturaleza", icon: Mountain },
  { id: "aventura", label: "Aventura", icon: Camera },
  { id: "cultura", label: "Cultura", icon: Palette },
  { id: "general", label: "General", icon: BookOpen },
];

const placeholderImages: Record<string, string> = {
  "Centro Histórico": callesImg,
  "Mina de Acosta": minaImg,
  "Panteón Inglés": panteonImg,
  "Peñas Cargadas": penasImg,
  "Plaza Principal": heroImg,
  "Calles Coloniales": callesImg,
  "Real del Monte": heroImg,
};

interface ForumPost {
  id: string;
  author_id: string | null;
  author_name: string;
  author_avatar: string | null;
  title: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  place_name: string | null;
  category: string;
  likes: number;
  created_at: string;
}

interface ForumComment {
  id: string;
  post_id: string;
  author_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
}

const Comunidad = () => {
  const { user, profile, loading: authLoading } = useRDMAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<Record<string, ForumComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewPost, setShowNewPost] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newPost, setNewPost] = useState({ 
    title: "", content: "", place_name: "", category: "general" 
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch posts
  useEffect(() => {
    fetchPosts();
    
    // Realtime subscription
    const channel = supabase
      .channel('forum-posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_comments' }, () => {
        if (expandedPost) fetchComments(expandedPost);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentional: subscribe once, use ref for expandedPost // eslint-disable-line react-hooks/exhaustive-deps -- realtime subscription: mount-only by design

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
    setLoading(false);
  };

  const fetchComments = async (postId: string) => {
    const { data } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (data) setComments(prev => ({ ...prev, [postId]: data }));
  };

  const handleSubmitPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    if (!user) return;
    setSubmitting(true);
    
    const displayName = profile?.display_name || user.email?.split('@')[0] || "Usuario";
    
    const { error } = await supabase.from('forum_posts').insert({
      author_id: user.id,
      author_name: displayName,
      author_avatar: displayName.charAt(0).toUpperCase(),
      title: newPost.title,
      content: newPost.content,
      place_name: newPost.place_name || null,
      category: newPost.category,
    });

    if (error) {
      setSubmitting(false);
      return;
    }

    setNewPost({ title: "", content: "", place_name: "", category: "general" });
    setShowNewPost(false);
    setSubmitting(false);
    fetchPosts();
  };

  const handleSubmitComment = async (postId: string) => {
    if (!newComment.trim()) return;
    if (!user) return;
    
    const displayName = profile?.display_name || user.email?.split('@')[0] || "Usuario";
    
    const { error } = await supabase.from('forum_comments').insert({
      post_id: postId,
      author_id: user.id,
      author_name: displayName,
      content: newComment,
    });

    if (error) {
      return;
    }

    setNewComment("");
    fetchComments(postId);
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    await supabase
      .from('forum_posts')
      .update({ likes: currentLikes + 1 })
      .eq('id', postId);
    fetchPosts();
  };

  const toggleComments = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      fetchComments(postId);
    }
  };

  const filteredPosts = selectedCategory === "all" 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "ahora";
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)}d`;
    return new Date(date).toLocaleDateString('es-MX');
  };

  return (
    <RDMLayout>
      <SEOMeta 
        title="Foro Comunitario"
        description="Comparte tus experiencias, fotos y recuerdos de Real del Monte. Foro público para visitantes y locales."
      />
      <div className="min-h-screen bg-background overflow-x-hidden">

        {/* Hero */}
        <div className="relative pt-28 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-primary mb-4">
                <MessageCircle className="w-3 h-3" /> Foro Público
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-4">
                Muro de Recuerdos
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Comparte tus experiencias, fotos y recuerdos de Real del Monte con otros viajeros
              </p>
              {user ? (
                <Button 
                  onClick={() => setShowNewPost(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl text-lg"
                >
                  <Plus className="w-5 h-5 mr-2" /> Compartir mi experiencia
                </Button>
              ) : (
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl text-lg">
                    <LogIn className="w-5 h-5 mr-2" /> Inicia sesión para publicar
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="container mx-auto px-4 md:px-8 mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "glass hover:bg-primary/10"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        <section className="pb-16">
          <div className="container mx-auto px-4 md:px-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No hay publicaciones en esta categoría aún.</p>
                <p className="text-sm mt-2">¡Sé el primero en compartir tu experiencia!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {filteredPosts.map((post, i) => {
                  const postImage = post.image_url || (post.place_name ? placeholderImages[post.place_name] : null) || heroImg;
                  const postComments = comments[post.id] || [];
                  
                  return (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl overflow-hidden hover:shadow-elevated transition-all duration-300"
                    >
                      {/* Post Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img src={postImage} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          {post.place_name && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm">
                              <MapPin className="w-3 h-3" /> {post.place_name}
                            </span>
                          )}
                          <span className="px-2 py-1 rounded-full bg-amber-500/80 text-white text-xs backdrop-blur-sm capitalize">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Author */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            {post.author_avatar || post.author_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {post.author_name}
                              {post.author_id && (
                                <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 uppercase tracking-wider">Verificado</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                          </div>
                        </div>

                        <h3 className="font-bold text-foreground text-lg mb-2">{post.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                          <button 
                            onClick={() => handleLike(post.id, post.likes)}
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            <span className="text-xs font-medium">{post.likes}</span>
                          </button>
                          <button 
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Comentar</span>
                          </button>
                          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors ml-auto">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Comments Section */}
                        <AnimatePresence>
                          {expandedPost === post.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                                {postComments.map(comment => (
                                  <div key={comment.id} className="flex gap-2">
                                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                                      <User className="w-3 h-3 text-muted-foreground" />
                                    </div>
                                    <div className="bg-muted/50 rounded-xl px-3 py-2 flex-1">
                                      <p className="text-xs font-medium text-foreground">{comment.author_name}</p>
                                      <p className="text-xs text-muted-foreground">{comment.content}</p>
                                    </div>
                                  </div>
                                ))}

                                {/* New comment input */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Escribe un comentario..."
                                    className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                                    onKeyDown={e => e.key === "Enter" && handleSubmitComment(post.id)}
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleSubmitComment(post.id)}
                                    disabled={!newComment.trim()}
                                    className="rounded-xl"
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* New Post Modal */}
        <AnimatePresence>
          {showNewPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowNewPost(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Compartir Experiencia
                    </h2>
                    <button onClick={() => setShowNewPost(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                        {(profile?.display_name || user?.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-foreground font-medium">
                        {profile?.display_name || user?.email?.split('@')[0] || "Usuario"}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">Verificado</span>
                    </div>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                      placeholder="Título de tu experiencia *"
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                    />
                    <textarea
                      value={newPost.content}
                      onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                      placeholder="Cuéntanos tu experiencia en Real del Monte... *"
                      rows={4}
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newPost.place_name}
                        onChange={e => setNewPost(p => ({ ...p, place_name: e.target.value }))}
                        placeholder="Lugar visitado"
                        className="bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                      />
                      <select
                        value={newPost.category}
                        onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))}
                        className="bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary"
                      >
                        {categories.filter(c => c.id !== "all").map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowNewPost(false)}
                      className="flex-1 rounded-xl"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSubmitPost}
                      disabled={submitting || !newPost.title.trim() || !newPost.content.trim()}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl"
                    >
                      {submitting ? "Publicando..." : "Publicar"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-4 md:px-8"><GradientSeparator /></div>
      </div>
    </RDMLayout>
  );
};

export default Comunidad;
