import { useEffect, useState, useRef } from "react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music2, Play, Pause, Download, Heart, Clock, ChevronRight,
  Volume2, SkipBack, SkipForward, Headphones, Disc3,
  Sparkles, Award, BookOpen, Quote, FileText, ExternalLink
} from "lucide-react";

import legadoMp3 from "@/assets/legado.mp3";
import tumiradaMp3 from "@/assets/tumirada.mp3";
import playlistMd from "@/assets/musica/playlist.md?raw";
import ReactMarkdown from "react-markdown";

interface Track {
  id: string;
  title: string;
  artist: string;
  description: string;
  src: string;
  duration: number;
  bpm?: number;
  mood?: string;
}

const PLAYLIST: Track[] = [
  { id: "legado", title: "Legado de Real del Monte", artist: "RDM Digital", description: "Tema principal del proyecto. Una travesía sonora por calles empedradas, niebla eterna y el latir minero del Pueblo Mágico.", src: legadoMp3, duration: 200, bpm: 80, mood: "Épico" },
  { id: "tumirada", title: "Mirada de Plata", artist: "RDM Digital", description: "Melodía inspirada en las vetas de plata que forjaron la historia de la región. Brillos tímidos que se abren paso entre la roca.", src: tumiradaMp3, duration: 240, bpm: 72, mood: "Melancólico" },
  { id: "neblina", title: "Neblina en el Monte", artist: "Isabella Villaseñor", description: "Paisaje sonoro del bosque de niebla. El viento entre oyameles y la respiración profunda de la sierra.", src: legadoMp3, duration: 200, bpm: 60, mood: "Ambiental" },
  { id: "paste", title: "Paste y Tradición", artist: "RDM Digital", description: "Ritmos cálidos que evocan la cocina tradicional. El horno de leña, la masa dorada y la conversación en la plaza.", src: tumiradaMp3, duration: 160, bpm: 95, mood: "Festivo" },
  { id: "canto", title: "Canto de las Antiguas", artist: "Coro Comunitario", description: "Canto ceremonial inspirado en las voces de las mujeres mineras. Memoria ancestral que se niega al silencio.", src: legadoMp3, duration: 300, bpm: 66, mood: "Ceremonial" },
];

const DONATION_AMOUNTS = [50, 100, 200, 500, 1000];

const MOOD_COLORS: Record<string, string> = {
  "Épico": "from-amber-500/20 to-red-500/10",
  "Melancólico": "from-blue-500/20 to-indigo-500/10",
  "Ambiental": "from-emerald-500/20 to-teal-500/10",
  "Festivo": "from-orange-500/20 to-yellow-500/10",
  "Ceremonial": "from-violet-500/20 to-purple-500/10",
};

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayerBar({ track, playing, onToggle, onPrev, onNext, hasPrev, hasNext }: {
  track: Track; playing: boolean; onToggle: () => void;
  onPrev: () => void; onNext: () => void; hasPrev: boolean; hasNext: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    if (playing) el.play().catch(() => {});
    else el.pause();
  }, [playing, track.id]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => {
      setProgress(el.duration ? el.currentTime / el.duration : 0);
      setCurrentTime(el.currentTime);
    };
    const onEnd = () => onNext();
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    return () => { el.removeEventListener("timeupdate", onTime); el.removeEventListener("ended", onEnd); };
  }, [track.id]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - rect.left) / rect.width) * el.duration;
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(218_24%_12%/0.98)] backdrop-blur-2xl border-t border-white/10 px-4 py-3 shadow-2xl"
    >
      <audio ref={audioRef} src={track.src} preload="auto" />
      <div className="max-w-5xl mx-auto">
        <div className="h-1 w-full bg-white/10 rounded-full mb-3 cursor-pointer group" onClick={seek}>
          <div className="h-full bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-amber-400 rounded-full transition-all duration-100 relative" style={{ width: `${progress * 100}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[hsl(var(--rdm-amber)/0.15)] flex items-center justify-center shrink-0">
              <Disc3 className="w-4 h-4 text-[hsl(var(--rdm-amber))]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{track.title}</p>
              <p className="text-[11px] text-white/40 truncate">{track.artist} · {formatDuration(currentTime)} / {formatDuration(track.duration)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onPrev} disabled={!hasPrev} className="text-white/40 hover:text-white disabled:opacity-20 transition-colors"><SkipBack className="w-5 h-5" /></button>
            <button onClick={onToggle} className="w-11 h-11 rounded-full bg-gradient-to-br from-[hsl(var(--rdm-amber))] to-amber-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[hsl(var(--rdm-amber)/0.4)]">
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button onClick={onNext} disabled={!hasNext} className="text-white/40 hover:text-white disabled:opacity-20 transition-colors"><SkipForward className="w-5 h-5" /></button>
          </div>
          <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
            <Volume2 className="w-4 h-4 text-white/30" />
            <input type="range" min={0} max={1} step={0.05} value={volume}
              onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v; }}
              className="w-20 accent-[hsl(var(--rdm-amber))] cursor-pointer" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TrackCard({ track, index, isActive, isPlaying, onPlay }: {
  track: Track; index: number; isActive: boolean; isPlaying: boolean; onPlay: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={onPlay}
      className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 border ${
        isActive
          ? "bg-gradient-to-br from-[hsl(var(--rdm-amber)/0.12)] to-transparent border-[hsl(var(--rdm-amber)/0.35)] shadow-lg shadow-[hsl(var(--rdm-amber)/0.08)]"
          : "bg-white/60 hover:bg-white/90 border-transparent hover:border-[hsl(var(--rdm-amber)/0.15)] hover:shadow-md"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[hsl(218_24%_20%)] to-[hsl(218_24%_28%)] flex items-center justify-center border border-white/10">
            {isActive && isPlaying ? (
              <span className="flex gap-px items-end h-5">
                {[1, 2, 3].map(b => (
                  <span key={b} className="w-1 bg-gradient-to-t from-[hsl(var(--rdm-amber))] to-amber-300 rounded-full animate-bounce" style={{ height: `${8 + b * 5}px`, animationDelay: `${b * 0.12}s` }} />
                ))}
              </span>
            ) : (
              <>
                <span className="text-xs font-bold text-white/50 group-hover:hidden">{String(index + 1).padStart(2, "0")}</span>
                <Play className="w-5 h-5 text-[hsl(var(--rdm-amber))] hidden group-hover:block" />
              </>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`text-base font-bold truncate ${isActive ? "text-[hsl(var(--rdm-amber))]" : "text-[hsl(var(--foreground))]"}`}>
                {track.title}
              </h3>
              {track.mood && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--rdm-amber)/0.1)] text-[hsl(var(--rdm-amber)/0.8)] uppercase tracking-wider shrink-0">{track.mood}</span>
              )}
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1.5">{track.artist}</p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground)/0.7)] leading-relaxed line-clamp-2">{track.description}</p>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-[hsl(var(--muted-foreground)/0.5)]">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(track.duration)}</span>
              {track.bpm && <span className="flex items-center gap-1"><Headphones className="w-3 h-3" />{track.bpm} BPM</span>}
            </div>
          </div>
          <div className="shrink-0 self-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isActive ? "bg-[hsl(var(--rdm-amber)/0.2)]" : "bg-transparent group-hover:bg-[hsl(var(--rdm-amber)/0.08)]"
            }`}>
              <Play className={`w-4 h-4 transition-colors ${isActive ? "text-[hsl(var(--rdm-amber))]" : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--rdm-amber))]"}`} />
            </div>
          </div>
        </div>
      </div>
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-amber-400" />
      )}
    </motion.div>
  );
}

export default function Musica() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donating, setDonating] = useState(false);

  const playTrack = (idx: number) => {
    if (activeIdx === idx) { setPlaying(p => !p); return; }
    setActiveIdx(idx);
    setPlaying(true);
  };

  const activeTrack = activeIdx !== null ? PLAYLIST[activeIdx] : null;

  const handleDonation = async () => {
    const amount = donationAmount ?? (customAmount ? parseInt(customAmount) : null);
    if (!amount || amount <= 0) return;
    setDonating(true);
    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      window.location.href = "/gracias-donativo";
    } finally {
      setDonating(false);
    }
  };

  return (
    <RDMLayout>
      <SEOMeta title="Música de Real del Monte — RDM Digital" description="Escucha y descarga la playlist oficial. Melodías que capturan el espíritu del Pueblo Mágico. Apoya con una donación." />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(218_25%_12%)] via-[hsl(218_24%_16%)] to-[hsl(24_40%_18%)]" />
        <div className="absolute inset-0 -z-10 opacity-25"
          style={{ backgroundImage: "radial-gradient(circle at 15% 45%, hsl(24 72% 50% / 0.5) 0%, transparent 60%), radial-gradient(circle at 85% 30%, hsl(212 36% 45% / 0.3) 0%, transparent 50%), radial-gradient(circle at 50% 80%, hsl(24 60% 40% / 0.15) 0%, transparent 40%)" }}
        />
        <div className="absolute inset-0 -z-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[hsl(var(--rdm-amber)/0.2)] to-[hsl(var(--rdm-amber)/0.05)] border border-[hsl(var(--rdm-amber)/0.25)] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[hsl(var(--rdm-amber)/0.1)]"
          >
            <Disc3 className="w-12 h-12 text-[hsl(var(--rdm-amber))]" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white/40 mb-4">
              <Sparkles className="h-3 w-3 text-[hsl(var(--rdm-amber))]" />
              <span>Playlist Oficial</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Música de
              <br />
              <span className="bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-amber-300 bg-clip-text text-transparent">Real del Monte</span>
            </h1>
            <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Melodías que capturan el alma del Pueblo Mágico. Una selección curada por el equipo RDM Digital para despertar el amor por nuestro territorio.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-8"
          >
            <span className="flex items-center gap-2 text-white/30 text-xs"><Award className="w-3.5 h-3.5" />5 tracks</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-2 text-white/30 text-xs"><Clock className="w-3.5 h-3.5" />{formatDuration(PLAYLIST.reduce((a, t) => a + t.duration, 0))}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-2 text-white/30 text-xs"><Download className="w-3.5 h-3.5" />Descarga libre</span>
          </motion.div>
        </div>
      </section>

      {/* Playlist Section */}
      <section className="py-8 px-6 md:px-16 pb-40">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-semibold">Playlist</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </motion.div>

          {/* Playlist manifesto from playlist.md */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mb-10 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--rdm-amber)/0.1)] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-[hsl(var(--rdm-amber))]" />
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-white/80">
                <ReactMarkdown>{playlistMd}</ReactMarkdown>
              </div>
            </div>
          </motion.div>

          {/* Track cards */}
          <div className="space-y-3">
            {PLAYLIST.map((track, idx) => (
              <TrackCard
                key={track.id}
                track={track}
                index={idx}
                isActive={activeIdx === idx}
                isPlaying={playing && activeIdx === idx}
                onPlay={() => playTrack(idx)}
              />
            ))}
          </div>

          {/* Download all */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-6 flex justify-end"
          >
            <a href={legadoMp3} download="Legado_de_Real_del_Monte.mp3"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Descargar todo (.zip próximamente)
            </a>
          </motion.div>

          {/* ── Donation Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-16 rounded-[2rem] overflow-hidden border border-[hsl(var(--rdm-amber)/0.2)] bg-gradient-to-br from-[hsl(218_25%_12%)] via-[hsl(218_24%_14%)] to-[hsl(24_40%_16%)] shadow-2xl"
          >
            {/* Visual top */}
            <div className="relative h-32 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--rdm-amber)/0.15)] to-transparent" />
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(circle at 30% 40%, hsl(24 72% 50% / 0.6) 0%, transparent 60%), radial-gradient(circle at 70% 60%, hsl(212 36% 45% / 0.3) 0%, transparent 50%)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[hsl(218_25%_12%)] to-transparent" />
              <div className="absolute bottom-6 left-8 flex items-center gap-3">
                <Heart className="w-8 h-8 text-[hsl(var(--rdm-amber))]" />
                <div>
                  <h3 className="text-xl font-bold text-white">Apoya esta música</h3>
                  <p className="text-xs text-white/40">Tu donación mantiene viva la plataforma</p>
                </div>
              </div>
            </div>

            <div className="px-8 pb-8">
              <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-lg">
                Esta música es y será siempre gratuita. Pero mantener los servidores, el dominio y el desarrollo de RDM Digital tiene un costo real.
                Elige una cantidad y haz tu donación ahora.
              </p>

              {/* Amount selector */}
              <div className="flex flex-wrap gap-3 mb-5">
                {DONATION_AMOUNTS.map(amount => (
                  <button
                    key={amount}
                    onClick={() => { setDonationAmount(amount); setCustomAmount(""); }}
                    className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                      donationAmount === amount
                        ? "bg-gradient-to-br from-[hsl(var(--rdm-amber))] to-amber-500 text-white shadow-lg shadow-[hsl(var(--rdm-amber)/0.3)] scale-105"
                        : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20"
                    }`}
                  >
                    ${amount.toLocaleString()}
                    {amount === 500 && <span className="block text-[9px] font-normal opacity-60">Más apoyado</span>}
                    {amount === 1000 && <span className="block text-[9px] font-normal opacity-60">⭐ Patrocinador</span>}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs text-white/30 shrink-0">Otra cantidad:</span>
                <div className="relative flex-1 max-w-[200px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-semibold">$</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="0"
                    value={customAmount}
                    onChange={e => { setCustomAmount(e.target.value); setDonationAmount(null); }}
                    className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[hsl(var(--rdm-amber)/0.5)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <span className="text-xs text-white/20">MXN</span>
              </div>

              {/* Donate button */}
              <button
                onClick={handleDonation}
                disabled={donating || (!donationAmount && !customAmount)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-br from-[hsl(var(--rdm-amber))] to-amber-500 text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 transition-all shadow-xl shadow-[hsl(var(--rdm-amber)/0.25)]"
              >
                {donating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando…</>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Donar ${(donationAmount ?? (customAmount ? parseInt(customAmount) : 0)).toLocaleString() || "…"}
                  </>
                )}
              </button>

              <p className="mt-4 text-[10px] text-white/20 leading-relaxed">
                <ExternalLink className="w-3 h-3 inline mr-1" />
                Pago procesado vía Stripe. No almacenamos datos bancarios.
              </p>
            </div>
          </motion.div>

          {/* Playlist.md source display */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 p-5 rounded-2xl bg-white/[0.02] border border-white/5"
          >
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-white/20 shrink-0 mt-0.5" />
              <div className="prose prose-invert prose-xs max-w-none text-white/40">
                <p className="text-xs font-semibold text-white/40 mb-1">Fuente: src/assets/musica/playlist.md</p>
                <ReactMarkdown>{playlistMd}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Player */}
      <AnimatePresence>
        {activeTrack && (
          <PlayerBar
            track={activeTrack}
            playing={playing}
            onToggle={() => setPlaying(p => !p)}
            onPrev={() => { if (activeIdx !== null && activeIdx > 0) playTrack(activeIdx - 1); }}
            onNext={() => { if (activeIdx !== null && activeIdx < PLAYLIST.length - 1) playTrack(activeIdx + 1); else setPlaying(false); }}
            hasPrev={activeIdx !== null && activeIdx > 0}
            hasNext={activeIdx !== null && activeIdx < PLAYLIST.length - 1}
          />
        )}
      </AnimatePresence>
    </RDMLayout>
  );
}