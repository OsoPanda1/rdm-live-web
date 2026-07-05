import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/site/PageHero";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Share2,
  Plus,
  Music2,
  Headphones,
  Radio,
  Disc3,
  Users,
  Coins,
  ChevronRight,
  Clock,
  Waves,
} from "lucide-react";

export const Route = createFileRoute("/musica")({
  head: () => ({
    meta: [
      { title: "RDM Ecos Música · Archivo Sonoro Vivo · RDM Digital" },
      { name: "description", content: "Ecosistema sonoro soberano de Real del Monte: FLAC lossless, visuales 3D, crónicas sonoras y economía comunitaria." },
    ],
  }),
  component: MusicaPage,
});

interface Track {
  id: string;
  title: string;
  artist: string;
  theme: string | null;
  kind: string;
  tags: string[];
  description: string | null;
  audio_url: string | null;
  cover_url: string | null;
  year: number | null;
  duration_seconds: number;
  popularity: number;
  status: string;
}

interface SonicCronicle {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  tags: string[];
  track_ids: string[];
  duration_seconds: number;
  play_count: number;
  like_count: number;
  creator_id: string;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const LISTENING_MODES = [
  { key: "archive", label: "Archivo", desc: "Reproducción fiel, FLAC puro", icon: Disc3 },
  { key: "space", label: "Espacio", desc: "Simulación acústica de lugares", icon: Waves },
  { key: "metaverse", label: "Metaverso", desc: "Efectos XR integrados", icon: Headphones },
] as const;

function MusicaPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [cronicles, setCronicles] = useState<SonicCronicle[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"catalog" | "cronicles" | "mecenas" | "live">("catalog");
  const [listeningMode, setListeningMode] = useState<"archive" | "space" | "metaverse">("archive");
  const [userId, setUserId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    const fetchTracks = async () => {
      const { data } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("status", "published")
        .order("popularity", { ascending: false });
      if (data) setTracks(data as Track[]);
    };
    const fetchCronicles = async () => {
      const { data } = await supabase
        .from("music_cronicles")
        .select("*")
        .eq("status", "published")
        .order("play_count", { ascending: false });
      if (data) setCronicles(data as SonicCronicle[]);
    };
    fetchTracks();
    fetchCronicles();
  }, []);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);

    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (track.audio_url) {
      const audio = new Audio(track.audio_url);
      audio.volume = volume;
      audioRef.current = audio;
      audio.play().catch(() => {});
      audio.ontimeupdate = () => {
        if (audio.duration) setProgress(audio.currentTime / audio.duration);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  }, [currentTrack, isPlaying]);

  const nextTrack = useCallback(() => {
    const idx = tracks.findIndex((t) => t.id === currentTrack?.id);
    const next = shuffle
      ? tracks[Math.floor(Math.random() * tracks.length)]
      : tracks[(idx + 1) % tracks.length];
    if (next) playTrack(next);
  }, [tracks, currentTrack, shuffle, playTrack]);

  const prevTrack = useCallback(() => {
    const idx = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    if (prev) playTrack(prev);
  }, [tracks, currentTrack, playTrack]);

  const toggleLike = (trackId: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  // Audio visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const bars = 64;
      const barWidth = w / bars - 1;
      for (let i = 0; i < bars; i++) {
        const barHeight = isPlaying
          ? (Math.sin(Date.now() / 200 + i * 0.5) * 0.3 + 0.5) * h * progress * 1.5
          : Math.sin(i * 0.3) * h * 0.05 + h * 0.05;

        const gradient = ctx.createLinearGradient(0, h, 0, h - barHeight);
        gradient.addColorStop(0, "oklch(0.66 0.16 45 / 0.3)");
        gradient.addColorStop(1, "oklch(0.66 0.16 45 / 0.8)");
        ctx.fillStyle = gradient;
        ctx.fillRect(i * (barWidth + 1), h - barHeight, barWidth, barHeight);
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, progress]);

  return (
    <>
      <PageHero
        eyebrow="RDM Ecos Música · Archivo Sonoro Vivo"
        title="Sonidos del"
        highlight="territorio."
        description="Curaduría soberana, FLAC lossless, visuales 3D reactivas y economía comunitaria integrada. La infraestructura sonora de la identidad de Real del Monte."
      />

      {/* Live Listening Event Banner */}
      <section className="container mx-auto px-6 mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border-hairline p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
            <Radio className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] tracking-sovereign text-accent">EN VIVO</div>
            <div className="font-display text-lg text-ink">Radio Nodo Cero — Selección continua</div>
          </div>
          <button className="rounded-full bg-foreground text-background px-5 py-2.5 text-sm flex items-center gap-2">
            <Play className="w-4 h-4" /> Escuchar
          </button>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="container mx-auto px-6">
        <div className="flex flex-wrap gap-2 mb-8 border-b border-hairline pb-4">
          {([
            { key: "catalog", label: "Catálogo", icon: Music2 },
            { key: "cronicles", label: "Crónicas Sonoras", icon: Clock },
            { key: "mecenas", label: "Mecenas", icon: Coins },
            { key: "live", label: "Eventos en Vivo", icon: Users },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Visualizer Canvas */}
        <div className="rounded-2xl border-hairline bg-card mb-8 overflow-hidden">
          <canvas ref={canvasRef} width={800} height={120} className="w-full" />
          {currentTrack && (
            <div className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-aurora flex items-center justify-center shrink-0">
                <Music2 className="w-7 h-7 text-background" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg text-ink truncate">{currentTrack.title}</div>
                <div className="text-sm text-muted-foreground truncate">{currentTrack.artist}</div>
              </div>
              <div className="flex items-center gap-2">
                {LISTENING_MODES.map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setListeningMode(mode.key)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-mono transition-all ${
                      listeningMode === mode.key
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    title={mode.desc}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              <button onClick={() => toggleLike(currentTrack.id)} className="p-2">
                <Heart className={`w-5 h-5 ${liked.has(currentTrack.id) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
              </button>
              <button className="p-2">
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          )}
          {/* Progress bar */}
          <div className="px-5 pb-4">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-aurora transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[10px] font-mono text-muted-foreground">
              <span>{currentTrack ? formatDuration(Math.floor(progress * currentTrack.duration_seconds)) : "0:00"}</span>
              <span>{currentTrack ? formatDuration(currentTrack.duration_seconds) : "0:00"}</span>
            </div>
          </div>
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 pb-5">
            <button onClick={() => setShuffle(!shuffle)} className={`p-2 ${shuffle ? "text-accent" : "text-muted-foreground"}`}>
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={prevTrack} className="p-2 text-foreground">
              <SkipBack className="w-5 h-5" />
            </button>
            <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={nextTrack} className="p-2 text-foreground">
              <SkipForward className="w-5 h-5" />
            </button>
            <button onClick={() => setRepeat(!repeat)} className={`p-2 ${repeat ? "text-accent" : "text-muted-foreground"}`}>
              <Repeat className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 ml-4">
              <button onClick={() => setIsMuted(!isMuted)} className="p-1">
                {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-muted-foreground" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                className="w-20 accent-accent"
              />
            </div>
          </div>
        </div>

        {/* Catalog Tab */}
        {activeTab === "catalog" && (
          <div className="space-y-2">
            {tracks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Music2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>El archivo sonoro está siendo curado por los administradores</p>
                <p className="text-xs mt-2">Próximamente: pistas FLAC de Real del Monte</p>
              </div>
            ) : (
              tracks.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:bg-secondary/50 ${
                    currentTrack?.id === track.id ? "bg-accent/5 border border-accent/20" : ""
                  }`}
                >
                  <div className="w-8 text-center font-mono text-sm text-muted-foreground">{i + 1}</div>
                  <div className="w-10 h-10 rounded-lg bg-aurora flex items-center justify-center shrink-0">
                    <Music2 className="w-5 h-5 text-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink truncate">{track.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{track.artist}</div>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    {track.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary">{t}</span>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">{formatDuration(track.duration_seconds)}</div>
                  <button onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }} className="p-1">
                    <Heart className={`w-4 h-4 ${liked.has(track.id) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Crónicas Sonoras Tab */}
        {activeTab === "cronicles" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cronicles.length === 0 ? (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Las Crónicas Sonoras serán creadas por la comunidad</p>
                <p className="text-xs mt-2">Organiza tu colección en capítulos de narrativa sonora</p>
              </div>
            ) : (
              cronicles.map((c) => (
                <article key={c.id} className="rounded-2xl border-hairline bg-card p-5 hover:shadow-sovereign transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[9px] tracking-sovereign text-accent">{c.kind.toUpperCase()}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="font-mono text-[9px] text-muted-foreground">{c.track_ids.length} pistas</span>
                  </div>
                  <h3 className="font-display text-xl text-ink">{c.title}</h3>
                  {c.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {c.play_count}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {c.like_count}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(c.duration_seconds)}</span>
                  </div>
                </article>
              ))
            )}
            {userId && (
              <Link to="/auth" className="rounded-2xl border-2 border-dashed border-hairline p-5 flex flex-col items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-all">
                <Plus className="w-8 h-8 mb-2" />
                <span className="text-sm">Crear Crónica Sonora</span>
              </Link>
            )}
          </div>
        )}

        {/* Mecenas Tab */}
        {activeTab === "mecenas" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border-hairline bg-card p-6">
              <h2 className="font-display text-2xl text-ink mb-2">Mecenas de la Historia Sonora</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Financia la infraestructura, los artistas locales y la preservación sonora de Real del Monte.
              </p>
              <div className="space-y-4">
                {[
                  { tier: "Oyente Comprometido", amount: "50 MXN/mes", desc: "Apoyo recurrente al archivo", icon: Music2 },
                  { tier: "Mecenas del Patrimonio", amount: "200 MXN/mes", desc: "Financia grabaciones y remasterizaciones", icon: Coins },
                  { tier: "Productor Comunitario", amount: "500 MXN/mes", desc: "Financia proyectos específicos de audio", icon: Headphones },
                ].map((m) => (
                  <div key={m.tier} className="rounded-xl border-hairline p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <m.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-lg text-ink">{m.tier}</div>
                      <div className="text-sm text-muted-foreground">{m.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg text-ink">{m.amount}</div>
                      <button className="text-xs text-accent hover:underline mt-1">Donar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border-hairline bg-card p-6">
              <h2 className="font-display text-2xl text-ink mb-4">Impacto Comunitario</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-secondary p-4 text-center">
                  <div className="font-display text-3xl text-ink">0</div>
                  <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground mt-1">Mecenas activos</div>
                </div>
                <div className="rounded-xl bg-secondary p-4 text-center">
                  <div className="font-display text-3xl text-ink">$0</div>
                  <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground mt-1">Recaudado este mes</div>
                </div>
                <div className="rounded-xl bg-secondary p-4 text-center">
                  <div className="font-display text-3xl text-ink">0</div>
                  <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground mt-1">Sesiones grabadas</div>
                </div>
                <div className="rounded-xl bg-secondary p-4 text-center">
                  <div className="font-display text-3xl text-ink">0</div>
                  <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground mt-1">Artistas apoyados</div>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Los fondos se destinan a: infraestructura (servidores, bandwidth FLAC), artistas locales, y proyectos educativos de preservación sonora.
              </p>
            </div>
          </div>
        )}

        {/* Live Events Tab */}
        {activeTab === "live" && (
          <div className="space-y-4">
            <div className="rounded-2xl border-hairline bg-card p-6">
              <h2 className="font-display text-2xl text-ink mb-2">Eventos de Escucha en Tiempo Real</h2>
              <p className="text-sm text-muted-foreground">
                Sesiones sincronizadas donde la comunidad escucha la misma pista o Crónica Sonora con interacción en vivo.
              </p>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay eventos programados</p>
              <p className="text-xs mt-2">Próximamente: sesiones de escucha colectiva y conciertos virtuales</p>
            </div>
          </div>
        )}

        {/* Bottom Categories */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Radio, title: "Radio Nodo Cero", desc: "Selección continua de música local y cápsulas históricas", meta: "En vivo" },
            { icon: Music2, title: "Tradición y Fiesta", desc: "Bandas, repertorios comunitarios y celebraciones locales", meta: "Colección" },
            { icon: Waves, title: "Paisajes Sonoros", desc: "Bosque, campanas, mina y lluvia para inmersión total", meta: "Ambient" },
            { icon: Disc3, title: "Archivo Oral", desc: "Relatos, leyendas y voces que conservan la memoria", meta: "Patrimonio" },
          ].map((cat) => (
            <article key={cat.title} className="rounded-2xl border-hairline bg-card p-5 hover:shadow-sovereign transition-all">
              <cat.icon className="w-5 h-5 text-accent" />
              <p className="mt-3 font-mono text-[9px] tracking-sovereign text-accent">{cat.meta}</p>
              <h3 className="font-display text-lg text-ink mt-1">{cat.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{cat.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Full-width bottom spacing */}
      <div className="h-32" />
    </>
  );
}
