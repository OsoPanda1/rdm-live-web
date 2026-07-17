// @ts-nocheck
import { motion } from "framer-motion";
import { Music as MusicIcon, Play, Pause, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useMusicPlayer } from "@/modules/music/hooks/useMusicPlayer";
import { RDMHeroPlayer } from "@/modules/music/components/RDMHeroPlayer";
import { DonationButton } from "@/components/music/DonationButton";

export default function Music() {
  const p = useMusicPlayer();

  return (
    <div className="min-h-screen pt-28 pb-24 px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
              <MusicIcon className="h-5 w-5 text-gold" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">RDM Radio &amp; Music Experience</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
            Banda Sonora <span className="text-gradient-gold">Territorial</span>
          </h1>
          <p className="mt-3 text-sm font-body text-muted-foreground max-w-xl">
            La memoria sonora del Nodo Cero. Música compuesta por y para el territorio de Real del Monte.
          </p>
        </motion.div>

        <div className="mt-10">
          <RDMHeroPlayer />
        </div>

        <section className="mt-8 glass-card rounded-2xl border border-gold/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/80 flex items-center gap-2"><Heart className="h-3 w-3" /> Música para sostener el proyecto</p>
            <h3 className="mt-1 text-xl font-display font-bold">Esta música es creada para generar donaciones</h3>
            <p className="mt-1 text-sm text-muted-foreground">Cada peso aportado paga los costos del ecosistema RDM Digital y de TAMV ONLINE Records. Donación mínima: <span className="text-gold font-semibold">$25 MXN</span>.</p>
          </div>
          <DonationButton trackTitle={p.currentTrack?.title} trackId={p.currentTrack?.id} />
        </section>


        <section className="mt-12">
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Playlist completa · {p.tracks.length} pistas</h2>
          <div className="space-y-2">
            {p.tracks.map((t, i) => {
              const isCurrent = p.currentTrack?.slug === t.slug;
              return (
                <motion.div
                  key={t.slug}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`group flex items-center gap-4 rounded-xl border p-3 transition ${isCurrent ? "border-gold/40 bg-gold/5" : "border-border/20 hover:border-gold/30 hover:bg-secondary/20"}`}
                >
                  <button
                    onClick={() => { p.selectBySlug(t.slug); setTimeout(() => p.play(), 50); }}
                    className="h-11 w-11 flex items-center justify-center rounded-lg gradient-gold text-primary-foreground shadow-gold shrink-0"
                    aria-label="Reproducir"
                  >
                    {isCurrent && p.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </button>
                  <Link to={`/music/${t.slug}`} className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium truncate">{t.title}</p>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">{t.artist} · {t.moods.join(" · ")}</p>
                  </Link>
                  <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                    {Math.floor(t.duration_seconds / 60)}:{String(t.duration_seconds % 60).padStart(2, "0")}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}