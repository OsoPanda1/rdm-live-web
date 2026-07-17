import { useState, useCallback, useEffect } from "react"
import { RDMLayout } from "@/components/rdm/RDMLayout"
import { SEOMeta } from "@/components/SEOMeta"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  Download,
  Heart,
  Clock,
  Headphones,
  Disc3,
  Sparkles,
  Award,
  BookOpen,
  ExternalLink,
  ChevronDown,
  Globe,
  Radio,
  Waves,
  Calendar,
  MapPin,
  Users,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useAudioPlayer, type Track } from "@/contexts/AudioPlayerContext"
import playlistMd from "@/assets/musica/playlist.md?raw"

// Ecos Música — New system components
import { SpatialPlayer } from "@/features/music/components/SpatialPlayer"
import { CronicaPanel } from "@/features/music/components/CronicaPanel"
import { MecenasPanel } from "@/features/music/components/MecenasPanel"
import { MOCK_TRACKS, MOCK_CRONICAS, MOCK_EVENTS } from "@/features/music/api"
import { recommendTracks, recommendCronicas, recommendEvents } from "@/features/music/engine"
import { recordMusicAction } from "@/features/music/api"
import type { MusicTrack, MusicCronica, MusicEvent } from "@/features/music/types"

import aMimadreMp3 from "@/assets/musica/a_mimadre.mp3"
import reinaTrejoMp3 from "@/assets/musica/reina_trejo.mp3"
import tumiradaMp3 from "@/assets/musica/tumirada.mp3"
import adictedToyouMp3 from "@/assets/musica/adicted_toyou).mp3"
import cadaNocheMp3 from "@/assets/musica/cada_noche.mp3"
import elSenaladoMp3 from "@/assets/musica/el_señalado.mp3"
import legadoMp3 from "@/assets/musica/Legado (1).mp3"
import patioDetierraMp3 from "@/assets/musica/patio_detierra.mp3"
import puroDolorMp3 from "@/assets/musica/puro_dolor.mp3"
import shootingStarMp3 from "@/assets/musica/shooting_star.mp3"
import rdmYoteadoroMp3 from "@/assets/musica/rdm_yoteadoro.mp3"
import rdmintroMp3 from "@/assets/musica/rdmintro (2).mp3"

const PLAYLIST: Track[] = [
  {
    id: "a_mimadre",
    title: "El Real (Legend)",
    artist: "Edwin Castillo",
    description: "Tema principal del intro de la plataforma.",
    src: aMimadreMp3,
    duration: 210,
    bpm: 70,
    mood: "Emotivo",
  },
  {
    id: "reina_trejo",
    title: "A Mi Madre",
    artist: "RDM Digital",
    description: "Homenaje musical a mi madre, al amor incondicional y al sacrificio silencioso.",
    src: reinaTrejoMp3,
    duration: 275,
    bpm: 70,
    mood: "Emotivo",
  },
  {
    id: "tumirada",
    title: "Tu Mirada",
    artist: "RDM Digital",
    description: "Melodía íntima que captura la esencia de una mirada que lo dice todo.",
    src: tumiradaMp3,
    duration: 240,
    bpm: 72,
    mood: "Melancólico",
  },
  {
    id: "adicted_toyou",
    title: "Adicted to You",
    artist: "Edwin Castillo",
    description:
      "Canción que explora la adicción emocional que nace del corazón y se niega a soltar los recuerdos del ayer.",
    src: adictedToyouMp3,
    duration: 220,
    bpm: 85,
    mood: "Pasional",
  },
  {
    id: "cada_noche",
    title: "Cada Noche",
    artist: "Edwin Castillo",
    description: "Ritmo nocturno que evoca las madrugadas de insomnio y reflexión.",
    src: cadaNocheMp3,
    duration: 230,
    bpm: 78,
    mood: "Nocturno",
  },
  {
    id: "el_senalado",
    title: "El Señalado",
    artist: "Edwin Castillo",
    description: "Narrativa musical sobre llevar una marca distinta y encontrar fuerza en la propia identidad.",
    src: elSenaladoMp3,
    duration: 240,
    bpm: 82,
    mood: "Intenso",
  },
  {
    id: "legado_1",
    title: "Legado (Versión Extendida)",
    artist: "RDM Digital",
    description:
      "Como deseo ser recordado, que dejo como legado, una pregunta que vive a diario en mi mente.",
    src: legadoMp3,
    duration: 260,
    bpm: 80,
    mood: "Épico",
  },
  {
    id: "patio_detierra",
    title: "Patio de Tierra",
    artist: "Edwin Castillo",
    description: "Melodía que evoca los patios de las casas antiguas y las memorias que ahí habitan.",
    src: patioDetierraMp3,
    duration: 200,
    bpm: 65,
    mood: "Nostálgico",
  },
  {
    id: "puro_dolor",
    title: "Puro Dolor",
    artist: "Edwin Castillo",
    description: "Balada que transforma el dolor en arte y catarsis musical.",
    src: puroDolorMp3,
    duration: 250,
    bpm: 68,
    mood: "Triste",
  },
  {
    id: "shooting_star",
    title: "Shooting Star",
    artist: "Edwin Castillo",
    description:
      "Inspirado en la estrella fugaz que iluminó mi andar y cruza el cielo de Real del Monte.",
    src: shootingStarMp3,
    duration: 225,
    bpm: 88,
    mood: "Inspirador",
  },
  {
    id: "rdm_yoteadoro",
    title: "RDM Yo Te Adoro",
    artist: "RDM Digital",
    description: "Declaración de amor al Pueblo Mágico de Real del Monte.",
    src: rdmYoteadoroMp3,
    duration: 210,
    bpm: 76,
    mood: "Emotivo",
  },
  {
    id: "rdm_intro",
    title: "RDM Intro (Versión Extendida)",
    artist: "RDM Digital",
    description: "Melodía de apertura extendida de la plataforma RDM Digital.",
    src: rdmintroMp3,
    duration: 195,
    bpm: 70,
    mood: "Épico",
  },
]

const DONATION_AMOUNTS = [50, 100, 200, 500, 1000]

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

/* ------------------------------------------------------------------ */
/*  TRACK ROW ESTILO STREAMING                                         */
/* ------------------------------------------------------------------ */

function TrackRow({
  track,
  index,
  isActive,
  isPlaying,
  onPlay,
}: {
  track: Track
  index: number
  isActive: boolean
  isPlaying: boolean
  onPlay: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const open = expanded || (isActive && isPlaying)

  // Colores de mood (verde limón / rojo cereza / azul eléctrico)
  const moodColor =
    track.mood === "Triste" || track.mood === "Intenso"
      ? "#FF1744" // rojo cereza
      : track.mood === "Energético" || track.mood === "Épico"
      ? "#00D4FF" // azul eléctrico
      : "#A7F300" // verde limón por defecto

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group rounded-2xl border transition-all duration-200 will-change-transform will-change-opacity ${
        isActive
          ? "border-[#00D4FF] bg-[#F3F4F6] shadow-[0_12px_35px_rgba(0,212,255,0.35)]"
          : "border-[#E5E7EB] bg-white hover:border-[#00D4FF]/70 hover:shadow-[0_10px_30px_rgba(11,18,32,0.15)]"
      }`}
    >
      <button
        onClick={() => {
          onPlay()
          if (!isActive) setExpanded(true)
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        {/* index / playing */}
        <div className="relative shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#050814]">
          {isActive && isPlaying ? (
            <span className="flex gap-px items-end h-3.5">
              {[1, 2, 3].map((b) => (
                <span
                  key={b}
                  className="w-[3px] rounded-full animate-bounce"
                  style={{
                    background:
                      "linear-gradient(to top, #00D4FF, #A7F300)",
                    height: `${5 + b * 3}px`,
                    animationDelay: `${b * 0.42}s`,
                  }}
                />
              ))}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-[#1F2937] group-hover:opacity-0 transition-opacity">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          {!isActive && (
            <Play className="absolute w-3.5 h-3.5 text-[#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold truncate ${
                isActive ? "text-[#0b1020]" : "text-[#0b1020]"
              }`}
            >
              {track.title}
            </span>
            {track.mood && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-[0.18em] shrink-0 hidden sm:inline"
                style={{
                  backgroundColor: `${moodColor}15`,
                  color: moodColor,
                  border: `1px solid ${moodColor}55`,
                }}
              >
                {track.mood}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#24304f]">{track.artist}</p>
        </div>

        {/* Duration + controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-[#4B5563] tabular-nums">
            {formatDuration(track.duration)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPlay()
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all will-change-transform will-change-opacity ${
              isActive
                ? "bg-[#00D4FF]/15 text-[#00D4FF]"
                : "text-[#4B5563] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10"
            }`}
          >
            {isActive && isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className={`p-1 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            } text-[#9CA3AF] hover:text-[#374151]`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t border-[#E5E7EB] mt-1">
              <p className="text-[12px] text-[#1c2540] leading-relaxed mb-2 mt-2">
                {track.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#4B5563]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(track.duration)}
                </span>
                {track.bpm && (
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    {track.bpm} BPM
                  </span>
                )}
                {track.mood && (
                  <span className="flex items-center gap-1">
                    <Disc3 className="w-3 h-3" />
                    {track.mood}
                  </span>
                )}
              </div>
              {isActive && <ActiveProgressBar />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  PROGRESS BAR / NOW PLAYING                                         */
/* ------------------------------------------------------------------ */

function ActiveProgressBar() {
  const { progress } = useAudioPlayer()
  return (
    <div className="mt-2 h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-250"
        style={{
          width: `${progress * 100}%`,
          background:
            "linear-gradient(90deg, #FF1744, #00D4FF, #A7F300)",
        }}
      />
    </div>
  )
}

function NowPlayingBadge() {
  const { currentTrack, isPlaying } = useAudioPlayer()
  if (!currentTrack) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 flex items-center gap-3"
    >
      <div className="h-8 w-8 rounded-full bg-[#00D4FF]/15 flex items-center justify-center">
        <Disc3 className="w-4 h-4 text-[#00D4FF]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#4B5563]">
          {isPlaying ? "Reproduciendo ahora" : "Pausado"}
        </p>
        <p className="text-[12px] text-[#0b1020] truncate">
          {currentTrack.title} • {currentTrack.artist}
        </p>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  ECOS MUSICA — Spatial audio, crónicas, events                      */
/* ------------------------------------------------------------------ */

const recommendedTracks = recommendTracks(MOCK_TRACKS, { territory_id: "rdm" }, 4)
const recommendedCronicas = recommendCronicas(MOCK_CRONICAS, {}, 3)
const recommendedEvents = recommendEvents(MOCK_EVENTS, 3)

function EcosMusicaSection() {
  const [activeTab, setActiveTab] = useState<"player" | "cronicas" | "eventos">("player")
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack>(recommendedTracks[0] || MOCK_TRACKS[0])
  const [trackIndex, setTrackIndex] = useState(0)
  const [xpToast, setXpToast] = useState<string | null>(null)

  const handleXpEarned = (xp: number) => {
    setXpToast(`+${xp} XP Cultura`)
    setTimeout(() => setXpToast(null), 2500)
  }

  const handleNextTrack = () => {
    const next = (trackIndex + 1) % recommendedTracks.length
    setTrackIndex(next)
    setSelectedTrack(recommendedTracks[next])
    recordMusicAction("track_play", {
      track_id: recommendedTracks[next].id,
      spatial_mode: "archivo",
    })
  }

  const handlePrevTrack = () => {
    const prev = trackIndex > 0 ? trackIndex - 1 : recommendedTracks.length - 1
    setTrackIndex(prev)
    setSelectedTrack(recommendedTracks[prev])
  }

  const handlePlayCronica = (cronica: MusicCronica) => {
    recordMusicAction("cronica_complete", {
      cronica_id: cronica.id,
      tracks_completed: cronica.trackCount ?? 0,
    })
    handleXpEarned(50)
  }

  return (
    <section className="py-16 px-6 md:px-16 bg-[#050814] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0,212,255,0.12) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 70%, rgba(167,243,0,0.08) 0%, transparent 50%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#A7F300]/30 bg-[#A7F300]/10 px-4 py-1.5 text-[9px] uppercase tracking-[0.25em] text-[#A7F300] mb-4">
            <Waves className="h-3 w-3" />
            <span>Ecos Musica — Sistema Sonoro Territorial</span>
          </div>
          <h2
            className="text-[2rem] md:text-[2.8rem] font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Archivo Sonoro de
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#A7F300] bg-clip-text text-transparent">
              {" "}Real del Monte
            </span>
          </h2>
          <p className="mt-3 text-sm text-[#9CA3AF] max-w-xl">
            Tres modos de escucha: Archivo (lossless puro), Espacio (acustica de las minas), y
            Metaverso (experiencia XR espacial). Cada track es un fragmento del territorio.
          </p>
        </motion.div>

        {/* Tab selector */}
        <div className="flex gap-2 mb-8">
          {[
            { key: "player" as const, label: "Reproductor", icon: Disc3 },
            { key: "cronicas" as const, label: "Cronicas", icon: BookOpen },
            { key: "eventos" as const, label: "Eventos", icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-[#A7F300] text-[#050814]"
                    : "bg-white/5 text-[#9CA3AF] hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* XP toast */}
        <AnimatePresence>
          {xpToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 px-4 py-2 rounded-xl bg-[#A7F300] text-[#050814] text-xs font-bold shadow-lg"
            >
              {xpToast}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === "player" && (
            <motion.div
              key="player"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Spatial Player */}
              <SpatialPlayer
                track={selectedTrack}
                queue={recommendedTracks}
                currentIndex={trackIndex}
                onPrev={handlePrevTrack}
                onNext={handleNextTrack}
                onXpEarned={handleXpEarned}
              />

              {/* Recommended tracks */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#A7F300]/60 mb-3">
                  Recomendados para ti
                </p>
                <div className="space-y-2">
                  {recommendedTracks.map((track, idx) => (
                    <button
                      key={track.id}
                      onClick={() => {
                        setSelectedTrack(track)
                        setTrackIndex(idx)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        selectedTrack.id === track.id
                          ? "bg-white/10 border border-[#A7F300]/30"
                          : "bg-white/5 border border-transparent hover:bg-white/8"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#A7F300]/15 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#A7F300]">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{track.artist?.name}</p>
                      </div>
                      <span className="text-[9px] text-[#9CA3AF] tabular-nums">
                        {Math.round(track.duration_ms / 60000)}:{String(Math.round((track.duration_ms % 60000) / 1000)).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                          track.canonical_level === "historical"
                            ? "bg-amber-500/20 text-amber-400"
                            : track.canonical_level === "artistic"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {track.canonical_level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "cronicas" && (
            <motion.div
              key="cronicas"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CronicaPanel
                cronicas={recommendedCronicas}
                onPlay={handlePlayCronica}
                onFork={(c) => handleXpEarned(25)}
              />
            </motion.div>
          )}

          {activeTab === "eventos" && (
            <motion.div
              key="eventos"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {recommendedEvents.map((evt, idx) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 hover:border-[#A7F300]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                            evt.status === "live"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-[#00D4FF]/20 text-[#00D4FF]"
                          }`}
                        >
                          {evt.status === "live" ? "En vivo" : "Proximo"}
                        </span>
                        <span className="text-[9px] text-[#9CA3AF] capitalize">{evt.event_type.replace("_", " ")}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{evt.title}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#9CA3AF]">
                        {new Date(evt.starts_at).toLocaleDateString("es-MX", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-[#9CA3AF]">
                        {new Date(evt.starts_at).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] leading-relaxed mb-3">{evt.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-[#9CA3AF]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {evt.location_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {evt.current_participants}/{evt.max_participants}
                      </span>
                    </div>
                    {evt.reward_json.xp && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#A7F300]/15 text-[#A7F300] font-bold">
                        +{evt.reward_json.xp} XP
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  PAGE: Música streaming híbrido sobre fondo blanco                  */
/* ------------------------------------------------------------------ */

export default function Musica() {
  const { currentTrack, isPlaying, play, togglePlay } = useAudioPlayer()
  const [donationAmount, setDonationAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [donating, setDonating] = useState(false)

  const handleDonation = async () => {
    const amount = donationAmount ?? (customAmount ? parseInt(customAmount) : null)
    if (!amount || amount <= 0) return
    setDonating(true)
    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
      if (!res.ok) {
        setDonating(false)
        return
      }
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setDonating(false)
    }
  }

  const totalDuration = PLAYLIST.reduce((a: number, t: Track) => a + t.duration, 0)

  return (
    <RDMLayout>
      <SEOMeta
        title="Archivo Histórico Musical — RDM Digital"
        description="Archivo histórico musical del Pueblo Mágico. Melodías que capturan el espíritu de Real del Monte. Apoya con una donación."
      />

      {/* Fondo blanco + halo superior de color */}
      <section className="relative pt-24 pb-12 px-6 md:px-16 overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 h-40 -z-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 0%, rgba(0,212,255,0.25) 0%, transparent 55%), " +
                "radial-gradient(circle at 90% 0%, rgba(255,23,68,0.20) 0%, transparent 55%), " +
                "linear-gradient(to bottom, rgba(5,8,20,0.06), transparent)",
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Header tipo playlist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <div className="flex items-start gap-6">
                {/* Cover card */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-[#050814] border border-[#111827] shadow-[0_20px_45px_rgba(5,8,20,0.45)] flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-70"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 30% 0%, rgba(0,212,255,0.5) 0%, transparent 55%), " +
                        "radial-gradient(circle at 80% 100%, rgba(167,243,0,0.35) 0%, transparent 55%)",
                    }}
                  />
                  <Disc3 className="w-14 h-14 md:w-16 md:h-16 text-white" />
                </div>

                {/* Playlist info */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF] bg-[#00D4FF]/10 px-4 py-1.5 text-[9px] uppercase tracking-[0.25em] text-[#0b1020] mb-3">
                    <Sparkles className="h-3 w-3 text-[#00D4FF]" />
                    <span>Archivo Histórico Musical</span>
                  </div>
                  <h1
                    className="text-[1.9rem] md:text-[2.7rem] font-bold text-[#0b1020] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Música de Real del Monte
                  </h1>
                  <p className="mt-2 text-[13px] text-[#1c2540] max-w-md">
                    Una colección viva de canciones que narran la historia, el amor y la memoria del
                    Pueblo Mágico. Diseñado como un archivo sonoro, disponible siempre para todos.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-[#4B5563]">
                    <span className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-[#00D4FF]" />
                      {PLAYLIST.length} pistas
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#00D4FF]" />
                      {formatDuration(totalDuration)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                    <span className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-[#00D4FF]" />
                      Descarga libre
                    </span>
                  </div>

                  <NowPlayingBadge />
                </div>
              </div>

              {/* Manifiesto markdown */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-6 p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/12 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-[#00D4FF]" />
                  </div>
                </div>
                <div className="prose prose-sm max-w-none text-[#1c2540] text-[13px] mt-2">
                  <ReactMarkdown>{playlistMd}</ReactMarkdown>
                </div>
              </motion.div>
            </motion.div>

            {/* Lista de tracks + donaciones */}
            <div className="flex-1 flex flex-col gap-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#9CA3AF]">
                    Catálogo sonoro
                  </span>
                </div>

                <div className="space-y-1.5">
                  {PLAYLIST.map((track, idx) => (
                    <TrackRow
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

                {/* Descargar todo (zip próximamente) */}
              </div>

              {/* Donaciones */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden border border-[#E5E7EB] bg-[#F3F4F6] shadow-[0_16px_40px_rgba(15,23,42,0.15)]"
              >
                <div className="relative h-28 overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(120deg, rgba(0,212,255,0.22), rgba(255,23,68,0.18), rgba(167,243,0,0.20))",
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F3F4F6] to-transparent" />
                  <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <Heart className="w-7 h-7 text-[#050814]" />
                    <div>
                      <h3 className="text-sm font-bold text-[#0b1020]">
                        Apoya esta música
                      </h3>
                      <p className="text-[11px] text-[#24304f]">
                        Tu donación mantiene vivo este archivo sonoro.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4">
                  <p className="text-[13px] text-[#1c2540] leading-relaxed mb-5">
                    Esta música es y será siempre gratuita. Pero mantener servidores, dominio y el
                    desarrollo de RDM Digital requiere inversión constante. Si este proyecto resuena
                    contigo, considera hacer una contribución.
                  </p>

                  <DonationControls
                    donationAmount={donationAmount}
                    setDonationAmount={setDonationAmount}
                    customAmount={customAmount}
                    setCustomAmount={setCustomAmount}
                    donating={donating}
                    onDonate={handleDonation}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecos Musica — Spatial audio, crónicas, events */}
      <EcosMusicaSection />
    </RDMLayout>
  )
}

/* ------------------------------------------------------------------ */
/*  DONATION CONTROLS                                                  */
/* ------------------------------------------------------------------ */

function DonationControls({
  donationAmount,
  setDonationAmount,
  customAmount,
  setCustomAmount,
  donating,
  onDonate,
}: {
  donationAmount: number | null
  setDonationAmount: (v: number | null) => void
  customAmount: string
  setCustomAmount: (v: string) => void
  donating: boolean
  onDonate: () => void
}) {
  const currentAmount =
    donationAmount ?? (customAmount ? parseInt(customAmount) || 0 : 0)

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-5">
        {DONATION_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setDonationAmount(amount)
              setCustomAmount("")
            }}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all will-change-transform will-change-opacity ${
              donationAmount === amount
                ? "bg-gradient-to-br from-[#00D4FF] to-[#FF1744] text-white shadow-lg shadow-[#00D4FF]/35 scale-105"
                : "bg-white border border-[#E5E7EB] text-[#0b1020] hover:bg-[#F3F4F6] hover:text-[#00D4FF]"
            }`}
          >
            ${amount.toLocaleString()}
            {amount === 500 && (
              <span className="block text-[9px] font-normal opacity-70">
                Más apoyado
              </span>
            )}
            {amount === 1000 && (
              <span className="block text-[9px] font-normal opacity-70">
                ⭐ Patrocinador
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-[11px] text-[#4B5563] shrink-0">
          Otra cantidad:
        </span>
        <div className="relative flex-1 max-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm font-semibold">
            $
          </span>
          <input
            type="number"
            min={1}
            placeholder="0"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value)
              setDonationAmount(null)
            }}
            className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#0b1020] text-sm focus:outline-none focus:border-[#00D4FF] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <span className="text-[11px] text-[#6B7280]">MXN</span>
      </div>

      <button
        onClick={onDonate}
        disabled={donating || (!donationAmount && !customAmount)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-xl bg-gradient-to-br from-[#00D4FF] via-[#FF1744] to-[#A7F300] text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 transition-all shadow-xl shadow-[#00D4FF]/25 will-change-transform will-change-opacity"
      >
        {donating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Procesando…
          </>
        ) : (
          <>
            <Heart className="w-4 h-4" />
            Donar $
            {currentAmount.toLocaleString() || "…"}
          </>
        )}
      </button>

      <p className="mt-3 text-[9px] text-[#6B7280] leading-relaxed">
        <ExternalLink className="w-3 h-3 inline mr-1" />
        Pago procesado vía Stripe. No almacenamos datos bancarios.
      </p>
    </>
  )
}
