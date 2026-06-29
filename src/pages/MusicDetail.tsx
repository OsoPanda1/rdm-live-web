import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Heart, MapPin } from "lucide-react";
import { useMusicPlayer } from "@/modules/music/hooks/useMusicPlayer";

export default function MusicDetail() {
  const { slug = "" } = useParams();
  const p = useMusicPlayer();

  useEffect(() => { if (slug) p.selectBySlug(slug); /* eslint-disable-next-line */ }, [slug]);

  const t = p.tracks.find((x) => x.slug === slug);
  if (!t) return (
    <div className="min-h-screen pt-32 px-6 text-center">
      <p className="text-muted-foreground">Pista no encontrada.</p>
      <Link to="/music" className="text-gold underline mt-4 inline-block">Volver a RDM Radio</Link>
    </div>
  );

  const isCurrent = p.currentTrack?.slug === t.slug;
  return (
    <div className="min-h-screen pt-28 pb-24 px-6 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/music" className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-gold transition">
          <ArrowLeft className="h-3 w-3" /> RDM Radio
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 glass-card border border-gold/20 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="h-44 w-44 rounded-2xl bg-gradient-to-br from-gold/40 to-electric/30 flex items-center justify-center text-3xl font-display font-bold text-background shrink-0">
              {t.cover_url ? <img src={t.cover_url} alt={t.title} className="h-full w-full object-cover rounded-2xl" /> : "RDM"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">Pista oficial · RDM Radio</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold mt-2">{t.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t.artist}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {t.moods.map((m) => (
                  <span key={m} className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-gold/10 text-gold">{m}</span>
                ))}
              </div>
              {t.territories.length > 0 && (
                <p className="mt-4 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {t.territories.join(" · ")}
                </p>
              )}
              <div className="mt-6 flex items-center gap-3">
                <button onClick={() => { if (!isCurrent) p.selectBySlug(t.slug); setTimeout(() => p.togglePlay(), 50); }} className="flex items-center gap-2 rounded-xl gradient-gold px-5 py-2.5 text-sm font-body font-semibold text-primary-foreground shadow-gold">
                  {isCurrent && p.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isCurrent && p.isPlaying ? "Pausar" : "Reproducir"}
                </button>
                {t.donation_url && (
                  <button onClick={() => window.open(t.donation_url!, "_blank", "noopener")} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-body glass hover:text-gold transition">
                    <Heart className="h-4 w-4" /> Apoyar
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
