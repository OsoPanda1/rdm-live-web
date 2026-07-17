// @ts-nocheck
import { motion } from "framer-motion";
import { Pause, Play, Volume2, VolumeX, Heart, ListMusic, SkipBack, SkipForward } from "lucide-react";
import { Link } from "react-router-dom";
import { useMusicPlayer } from "../hooks/useMusicPlayer";

export function RDMHeroPlayer({ autoplay = false }: { autoplay?: boolean }) {
  const p = useMusicPlayer({ autoplay });
  const isMuted = p.volume === 0;
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    p.seek((e.clientX - r.left) / r.width);
  };

  if (!p.currentTrack) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border border-gold/20 rounded-2xl p-5 shadow-elevated max-w-2xl"
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-gold/40 to-electric/30 flex items-center justify-center text-xl font-display font-bold text-background shrink-0">
          {p.currentTrack.cover_url ? (
            <img src={p.currentTrack.cover_url} alt={p.currentTrack.title} className="h-full w-full object-cover rounded-xl" />
          ) : "RDM"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">Ahora sonando · RDM Radio</p>
          <h3 className="text-base font-display font-semibold truncate">{p.currentTrack.title}</h3>
          <p className="text-[11px] font-body text-muted-foreground truncate">{p.currentTrack.artist}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={p.previous} className="h-9 w-9 flex items-center justify-center rounded-full glass hover:text-gold transition" aria-label="Anterior">
            <SkipBack className="h-4 w-4" />
          </button>
          <button onClick={p.togglePlay} className="h-11 w-11 flex items-center justify-center rounded-full gradient-gold text-primary-foreground shadow-gold hover:scale-105 transition" aria-label="Play/Pause">
            {p.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          <button onClick={p.next} className="h-9 w-9 flex items-center justify-center rounded-full glass hover:text-gold transition" aria-label="Siguiente">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div onClick={handleSeek} className="h-1.5 w-full rounded-full bg-border/40 cursor-pointer overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gold to-electric transition-all" style={{ width: `${p.progress * 100}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <Link to="/music" className="hover:text-gold transition">Ver playlist completa</Link>
          <span>{Math.floor(p.currentTrack.duration_seconds / 60)}:{String(p.currentTrack.duration_seconds % 60).padStart(2, "0")}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {p.currentTrack.donation_url && (
            <button onClick={() => window.open(p.currentTrack.donation_url!, "_blank", "noopener")} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-body glass hover:text-gold transition">
              <Heart className="h-3 w-3" /> Apoyar
            </button>
          )}
          <Link to="/music" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-body glass hover:text-electric transition">
            <ListMusic className="h-3 w-3" /> Playlist
          </Link>
        </div>
        <div className="flex items-center gap-2 min-w-[120px]">
          <button onClick={() => p.setVolume(isMuted ? 0.8 : 0)} className="text-muted-foreground hover:text-gold transition" aria-label="Volumen">
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input type="range" min={0} max={1} step={0.01} value={p.volume} onChange={(e) => p.setVolume(Number(e.target.value))} className="flex-1 accent-gold" />
        </div>
      </div>
    </motion.div>
  );
}