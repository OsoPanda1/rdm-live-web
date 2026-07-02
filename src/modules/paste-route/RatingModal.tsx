// @ts-nocheck
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Props = {
  poiId: string;
  poiName: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function RatingModal({ poiId, poiName, onClose, onSaved }: Props) {
  const [score, setScore] = useState(5);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    setSaving(true);
    const { data: sess } = await supabase.auth.getUser();
    if (!sess.user) {
      toast.error("Inicia sesión para puntuar");
      navigate("/auth");
      return;
    }
    const clean = review.trim().slice(0, 500);
    const { error } = await supabase
      .from("paste_ratings")
      .upsert({ poi_id: poiId, user_id: sess.user.id, score, review: clean || null }, { onConflict: "poi_id,user_id" });
    setSaving(false);
    if (error) { toast.error("No se pudo guardar"); return; }
    toast.success("¡Gracias por tu reseña!");
    onSaved();
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-gold/30 bg-gradient-to-br from-navy-dark to-charcoal p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">Tu experiencia</p>
            <h3 className="font-display text-2xl text-platinum mt-1">{poiName}</h3>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-border/30 hover:bg-border/50 flex items-center justify-center text-platinum"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex justify-center gap-2 mb-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setScore(n)}>
              <Star className={`h-9 w-9 transition-all ${(hover || score) >= n ? "fill-gold text-gold" : "text-border"}`} />
            </button>
          ))}
        </div>
        <textarea value={review} onChange={(e) => setReview(e.target.value.slice(0, 500))} maxLength={500} rows={3}
          placeholder="¿Qué hace especial este lugar? (opcional)"
          className="w-full rounded-xl bg-background/60 border border-border/40 px-4 py-3 text-sm text-platinum placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 resize-none" />
        <div className="mt-2 text-right text-[10px] font-mono text-muted-foreground">{review.length}/500</div>
        <button onClick={submit} disabled={saving}
          className="mt-4 w-full gradient-gold text-primary-foreground font-semibold py-3 rounded-xl shadow-gold hover:shadow-elevated transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publicar reseña"}
        </button>
      </motion.div>
    </motion.div>
  );
}