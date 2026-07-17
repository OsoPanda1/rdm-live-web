import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Heart, MapPin } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useMusicPlayer } from "@/modules/music/hooks/useMusicPlayer";

export default function MusicDetail() {
  const { slug = "" } = useParams();
  const player = useMusicPlayer();
  const prefersReducedMotion = useReducedMotion();

  // Seleccionar pista cuando cambia el slug o el player
  useEffect(() => {
    if (slug) {
      player.selectBySlug(slug);
    }
  }, [slug, player]);

  const track = useMemo(
    () => player.tracks.find((x) => x.slug === slug),
    [player.tracks, slug],
  );

  if (!track) {
    return (
      <div className="min-h-screen pt-32 px-6 text-center">
        <p className="text-muted-foreground">Pista no encontrada.</p>
        <Link
          to="/music"
          className="text-gold underline mt-4 inline-block"
        >
          Volver a RDM Radio
        </Link>
      </div>
    );
  }

  const isCurrent = player.currentTrack?.slug === track.slug;
  const isPlayingCurrent = isCurrent && player.isPlaying;

  const moods = Array.isArray(track.moods) ? track.moods : [];
  const territories = Array.isArray(track.territories) ? track.territories : [];

  const handlePlayPause = () => {
    // Si no es la pista actual, primero seleccionamos y luego reproducimos
    if (!isCurrent) {
      player.selectBySlug(track.slug);
    }
    // togglePlay debería encargarse de respetar el estado actual internamente
    player.togglePlay();
  };

  const handleDonationClick = () => {
    if (!track.donation_url) return;
    // Apertura segura; idealmente usar <a> en vez de window.open, pero mantenemos patrón
    window.open(track.donation_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/music"
          className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-gold transition"
        >
          <ArrowLeft className="h-3 w-3" /> RDM Radio
        </Link>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          className="mt-6 glass-card border border-gold/20 rounded-3xl p-8"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="h-44 w-44 rounded-2xl bg-gradient-to-br from-gold/40 to-electric/30 flex items-center justify-center text-3xl font-display font-bold text-background shrink-0 overflow-hidden">
              {track.cover_url ? (
                <img
                  src={track.cover_url}
                  alt={`Portada de ${track.title} — ${track.artist}`}
                  className="h-full w-full object-cover rounded-2xl"
                  loading="lazy"
                />
              ) : (
                "RDM"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">
                Pista oficial · RDM Radio
              </p>
              <h1 className="text-3xl md:text-4xl font-display font-bold mt-2">
                {track.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {track.artist}
              </p>

              {moods.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <span
                      key={mood}
                      className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-gold/10 text-gold"
                    >
                      {mood}
                    </span>
                  ))}
                </div>
              )}

              {territories.length > 0 && (
                <p className="mt-4 flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {territories.join(" · ")}
                </p>
              )}

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="flex items-center gap-2 rounded-xl gradient-gold px-5 py-2.5 text-sm font-body font-semibold text-primary-foreground shadow-gold"
                >
                  {isPlayingCurrent ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isPlayingCurrent ? "Pausar" : "Reproducir"}
                </button>

                {track.donation_url && (
                  <button
                    type="button"
                    onClick={handleDonationClick}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-body glass hover:text-gold transition"
                    aria-label="Apoyar al proyecto (abre una nueva ventana)"
                  >
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
