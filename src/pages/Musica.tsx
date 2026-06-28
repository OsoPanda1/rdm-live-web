import { useState } from "react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { motion } from "framer-motion";
import {
  Play, Pause, Download, Heart, Clock,
  Headphones, Disc3,
  Sparkles, Award, BookOpen, ExternalLink
} from "lucide-react";

import legadoMp3 from "@/assets/legado.mp3";
import tumiradaMp3 from "@/assets/tumirada.mp3";
import aMimadreMp3 from "@/assets/musica/a_mimadre.mp3";
import adictedToyouMp3 from "@/assets/musica/adicted_toyou).mp3";
import cadaNocheMp3 from "@/assets/musica/cada_noche.mp3";
import elSenaladoMp3 from "@/assets/musica/el_señalado.mp3";
import legado1Mp3 from "@/assets/musica/Legado (1).mp3";
import patioDeTierraMp3 from "@/assets/musica/patio_detierra.mp3";
import puroDolorMp3 from "@/assets/musica/puro_dolor.mp3";
import rdmintro2Mp3 from "@/assets/musica/rdmintro (2).mp3";
import rdmYoteadoroMp3 from "@/assets/musica/rdm_yoteadoro.mp3";
import shootingStarMp3 from "@/assets/musica/shooting_star.mp3";
import tumiradaMusicaMp3 from "@/assets/musica/tumirada.mp3";
import playlistMd from "@/assets/musica/playlist.md?raw";
import ReactMarkdown from "react-markdown";
import { useAudioPlayer, type Track } from "@/contexts/AudioPlayerContext";

const PLAYLIST: Track[] = [
  { id: "legado", title: "Legado de Real del Monte", artist: "RDM Digital", description: "Tema principal del proyecto. Una travesía sonora por calles empedradas, niebla eterna y el latir minero del Pueblo Mágico.", src: legadoMp3, duration: 200, bpm: 80, mood: "Épico" },
  { id: "tumirada", title: "Tu Mirada", artist: "RDM Digital", description: "Melodía íntima que captura la esencia de una mirada que lo dice todo.", src: tumiradaMp3, duration: 240, bpm: 72, mood: "Melancólico" },
  { id: "a_mimadre", title: "A Mi Madre (Legend)", artist: "Edwin Castillo", description: "Homenaje musical a la madre, al amor incondicional y al sacrificio silencioso.", src: aMimadreMp3, duration: 210, bpm: 70, mood: "Emotivo" },
  { id: "adicted_toyou", title: "Adicted to You", artist: "Edwin Castillo", description: "Canción que explora la adicción emocional que nace del corazón y se niega a soltar.", src: adictedToyouMp3, duration: 220, bpm: 85, mood: "Pasional" },
  { id: "cada_noche", title: "Cada Noche", artist: "Edwin Castillo", description: "Ritmo nocturno que evoca las madrugadas de insomnio y reflexión.", src: cadaNocheMp3, duration: 230, bpm: 78, mood: "Nocturno" },
  { id: "el_senalado", title: "El Señalado", artist: "Edwin Castillo", description: "Narrativa musical sobre llevar una marca distinta y encontrar fuerza en la propia identidad.", src: elSenaladoMp3, duration: 240, bpm: 82, mood: "Intenso" },
  { id: "legado_1", title: "Legado (Versión Extendida)", artist: "RDM Digital", description: "Versión extendida del tema principal con arreglos adicionales.", src: legado1Mp3, duration: 260, bpm: 80, mood: "Épico" },
  { id: "patio_tierra", title: "Patio de Tierra", artist: "Edwin Castillo", description: "Melodía que evoca los patios de las casas antiguas y las memorias que ahí habitan.", src: patioDeTierraMp3, duration: 200, bpm: 65, mood: "Nostálgico" },
  { id: "puro_dolor", title: "Puro Dolor", artist: "Edwin Castillo", description: "Balada que transforma el dolor en arte y catarsis musical.", src: puroDolorMp3, duration: 250, bpm: 68, mood: "Triste" },
  { id: "rdmintro2", title: "RDM Intro (Versión 2)", artist: "RDM Digital", description: "Segunda versión de la introducción musical de Real del Monte Digital.", src: rdmintro2Mp3, duration: 180, bpm: 90, mood: "Energético" },
  { id: "rdm_yoteadoro", title: "Yo Te Adoro", artist: "Edwin Castillo", description: "Declaración de amor en forma de canción.", src: rdmYoteadoroMp3, duration: 215, bpm: 75, mood: "Romántico" },
  { id: "shooting_star", title: "Shooting Star", artist: "Edwin Castillo", description: "Inspirado en las estrellas fugaces que cruzan el cielo de Real del Monte.", src: shootingStarMp3, duration: 225, bpm: 88, mood: "Inspirador" },
  { id: "tumirada_musica", title: "Tu Mirada", artist: "Edwin Castillo", description: "Versión de estudio con arreglos acústicos.", src: tumiradaMusicaMp3, duration: 235, bpm: 72, mood: "Melancólico" },
];

const DONATION_AMOUNTS = [50, 100, 200, 500, 1000];

const MOOD_COLORS: Record<string, string> = {
  "Épico": "from-amber-500/20 to-red-500/10",
  "Melancólico": "from-blue-500/20 to-indigo-500/10",
  "Ambiental": "from-emerald-500/20 to-teal-500/10",
  "Festivo": "from-orange-500/20 to-yellow-500/10",
  "Ceremonial": "from-violet-500/20 to-purple-500/10",
};

const platinumText = "text-[#E5E4E2]";
const platinumDim = "text-[#E5E4E2]/60";
const electricBlue = "#00D4FF";
const electricBlueBorder = "border-[#00D4FF]";
const electricBlueGlow = "shadow-[0_0_15px_rgba(0,212,255,0.3)]";

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
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
          ? "bg-gradient-to-br from-[#00D4FF]/10 to-transparent border-[#00D4FF]/40 shadow-lg shadow-[#00D4FF]/10"
          : "bg-[#0d1225]/60 hover:bg-[#0d1225]/80 border-transparent hover:border-[#00D4FF]/20 hover:shadow-md"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#00D4FF]/20 to-[#0a0e1a] flex items-center justify-center border border-[#00D4FF]/20">
            {isActive && isPlaying ? (
              <span className="flex gap-px items-end h-5">
                {[1, 2, 3].map(b => (
                  <span key={b} className="w-1 bg-gradient-to-t from-[#00D4FF] to-[#0088FF] rounded-full animate-bounce" style={{ height: `${8 + b * 5}px`, animationDelay: `${b * 0.12}s` }} />
                ))}
              </span>
            ) : (
              <>
                <span className="text-[11px] font-bold text-[#E5E4E2]/40 group-hover:hidden">{String(index + 1).padStart(2, "0")}</span>
                <Play className="w-5 h-5 text-[#00D4FF] hidden group-hover:block" />
              </>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`text-sm font-bold truncate ${isActive ? "text-[#00D4FF]" : "text-[#E5E4E2]"}`}>
                {track.title}
              </h3>
              {track.mood && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF]/80 uppercase tracking-wider shrink-0">{track.mood}</span>
              )}
            </div>
            <p className="text-[11px] text-[#E5E4E2]/50 mb-1.5">{track.artist}</p>
            <p className="text-[10px] text-[#E5E4E2]/40 leading-relaxed line-clamp-2">{track.description}</p>
            <div className="flex items-center gap-3 mt-2 text-[9px] text-[#E5E4E2]/30">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#00D4FF]/50" />{formatDuration(track.duration)}</span>
              {track.bpm && <span className="flex items-center gap-1"><Headphones className="w-3 h-3 text-[#00D4FF]/50" />{track.bpm} BPM</span>}
            </div>
          </div>
          <div className="shrink-0 self-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isActive ? "bg-[#00D4FF]/20" : "bg-transparent group-hover:bg-[#00D4FF]/10"
            }`}>
              <Play className={`w-4 h-4 transition-colors ${isActive ? "text-[#00D4FF]" : "text-[#E5E4E2]/40 group-hover:text-[#00D4FF]"}`} />
            </div>
          </div>
        </div>
      </div>
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00D4FF] to-[#0088FF]" style={{ boxShadow: "0 0 10px rgba(0,212,255,0.5)" }} />
      )}
    </motion.div>
  );
}

export default function Musica() {
  const { currentTrack, isPlaying, play, togglePlay } = useAudioPlayer();
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donating, setDonating] = useState(false);

  const activeIdx = currentTrack ? PLAYLIST.findIndex(t => t.id === currentTrack.id) : -1;

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
      <SEOMeta title="Archivo Histórico Musical — RDM Digital" description="Archivo histórico musical del Pueblo Mágico. Melodías que capturan el espíritu de Real del Monte. Apoya con una donación." />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0a0e1a] via-[#0d1225] to-[#1a0f0a]" />
        <div className="absolute inset-0 -z-10 opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 15% 45%, rgba(0,212,255,0.2) 0%, transparent 60%), radial-gradient(circle at 85% 30%, rgba(0,212,255,0.1) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(0,100,200,0.1) 0%, transparent 40%)" }}
        />
        <div className="absolute inset-0 -z-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4FF' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF]/30 to-transparent" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#00D4FF]/10 to-transparent border border-[#00D4FF]/30 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#00D4FF]/10"
          >
            <Disc3 className="w-12 h-12 text-[#00D4FF]" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 px-4 py-1.5 text-[9px] uppercase tracking-[0.25em] text-[#E5E4E2]/60 mb-4">
              <Sparkles className="h-3 w-3 text-[#00D4FF]" />
              <span>Archivo Histórico Musical</span>
            </div>
            <h1 className="text-[2.85rem] md:text-[4.75rem] lg:text-[5.7rem] font-bold text-[#E5E4E2] mb-4 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Música de
              <br />
              <span className="text-[#00D4FF]" style={{ textShadow: "0 0 20px rgba(0,212,255,0.5)" }}>Real del Monte</span>
            </h1>
            <p className="text-[#E5E4E2]/50 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Melodías que capturan el alma del Pueblo Mágico. Una selección curada por el equipo RDM Digital para despertar el amor por nuestro territorio.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-8"
          >
            <span className="flex items-center gap-2 text-[#E5E4E2]/30 text-[11px]"><Award className="w-3.5 h-3.5 text-[#00D4FF]/60" />{PLAYLIST.length} tracks</span>
            <span className="w-1 h-1 rounded-full bg-[#00D4FF]/20" />
            <span className="flex items-center gap-2 text-[#E5E4E2]/30 text-[11px]"><Clock className="w-3.5 h-3.5 text-[#00D4FF]/60" />{formatDuration(PLAYLIST.reduce((a: number, t: Track) => a + t.duration, 0))}</span>
            <span className="w-1 h-1 rounded-full bg-[#00D4FF]/20" />
            <span className="flex items-center gap-2 text-[#E5E4E2]/30 text-[11px]"><Download className="w-3.5 h-3.5 text-[#00D4FF]/60" />Descarga libre</span>
          </motion.div>
        </div>
      </section>

      {/* Playlist Section */}
      <section className="py-8 px-6 md:px-16 pb-40">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00D4FF]/20 to-transparent" />
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#E5E4E2]/30 font-semibold">Catálogo Sonoro</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00D4FF]/20 to-transparent" />
          </motion.div>

          {/* Playlist manifesto from playlist.md */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mb-10 p-6 rounded-2xl bg-[#00D4FF]/5 border border-[#00D4FF]/10 backdrop-blur-sm"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-[#00D4FF]" />
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-[#E5E4E2]/70">
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
                isActive={currentTrack?.id === track.id}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                onPlay={() => {
                  if (currentTrack?.id === track.id) {
                    togglePlay()
                  } else {
                    play(track, PLAYLIST)
                  }
                }}
              />
            ))}
          </div>

          {/* Download all */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-6 flex justify-end"
          >
            <a href={legadoMp3} download="Legado_de_Real_del_Monte.mp3"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] text-[#E5E4E2]/40 hover:text-[#00D4FF] hover:bg-[#00D4FF]/5 transition-all"
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
            className="mt-16 rounded-[2rem] overflow-hidden border border-[#00D4FF]/20 bg-gradient-to-br from-[#0a0e1a] via-[#0d1225] to-[#1a0f0a] shadow-2xl"
          >
            {/* Visual top */}
            <div className="relative h-32 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/10 to-transparent" />
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(circle at 30% 40%, rgba(0,212,255,0.4) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(0,100,200,0.2) 0%, transparent 50%)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0e1a] to-transparent" />
              <div className="absolute bottom-6 left-8 flex items-center gap-3">
                <Heart className="w-8 h-8 text-[#00D4FF]" />
                <div>
                  <h3 className="text-lg font-bold text-[#E5E4E2]">Apoya esta música</h3>
                  <p className="text-[11px] text-[#E5E4E2]/40">Tu donación mantiene viva la plataforma</p>
                </div>
              </div>
            </div>

            <div className="px-8 pb-8">
              <p className="text-[13px] text-[#E5E4E2]/50 leading-relaxed mb-6 max-w-lg">
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
                        ? "bg-gradient-to-br from-[#00D4FF] to-[#0088FF] text-white shadow-lg shadow-[#00D4FF]/30 scale-105"
                        : "bg-[#00D4FF]/5 border border-[#00D4FF]/10 text-[#E5E4E2]/60 hover:bg-[#00D4FF]/10 hover:text-[#00D4FF] hover:border-[#00D4FF]/30"
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
                <span className="text-[11px] text-[#E5E4E2]/30 shrink-0">Otra cantidad:</span>
                <div className="relative flex-1 max-w-[200px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E5E4E2]/40 text-sm font-semibold">$</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="0"
                    value={customAmount}
                    onChange={e => { setCustomAmount(e.target.value); setDonationAmount(null); }}
                    className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/10 text-[#E5E4E2] text-sm focus:outline-none focus:border-[#00D4FF]/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <span className="text-[11px] text-[#E5E4E2]/20">MXN</span>
              </div>

              {/* Donate button */}
              <button
                onClick={handleDonation}
                disabled={donating || (!donationAmount && !customAmount)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#0088FF] text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 transition-all shadow-xl shadow-[#00D4FF]/25"
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

              <p className="mt-4 text-[9px] text-[#E5E4E2]/20 leading-relaxed">
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
            className="mt-8 p-5 rounded-2xl bg-[#00D4FF]/[0.02] border border-[#00D4FF]/5"
          >
            <div className="flex gap-3">
              <BookOpen className="w-5 h-5 text-[#00D4FF]/20 shrink-0 mt-0.5" />
              <div className="prose prose-invert prose-xs max-w-none text-[#E5E4E2]/40">
                <p className="text-[11px] font-semibold text-[#E5E4E2]/40 mb-1">Manifiesto</p>
                <ReactMarkdown>{playlistMd}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </RDMLayout>
  );
}