import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Globe,
  Radio,
  Headphones,
  Waves,
} from "lucide-react";
import type { MusicTrack, SpatialMode } from "../types";
import {
  playTrack,
  pauseTrack,
  resumeTrack,
  seekTo,
  setVolume,
  getCurrentTime,
  getDuration,
  isPlaying as getIsPlaying,
  onTimeUpdate,
  onTrackEnd,
  getAverageFrequency,
} from "../audio-engine";

const SPATIAL_MODES: { mode: SpatialMode; label: string; icon: typeof Globe; desc: string }[] = [
  { mode: "archivo", label: "Archivo", icon: Radio, desc: "Lossless, sin procesamiento" },
  { mode: "espacio", label: "Espacio", icon: Headphones, desc: "Acústica de RDM" },
  { mode: "metaverso", label: "Metaverso", icon: Waves, desc: "XR espacial" },
];

interface SpatialPlayerProps {
  track: MusicTrack;
  queue?: MusicTrack[];
  currentIndex?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onXpEarned?: (xp: number) => void;
}

export function SpatialPlayer({
  track,
  queue = [],
  currentIndex = 0,
  onPrev,
  onNext,
  onXpEarned,
}: SpatialPlayerProps) {
  const [spatialMode, setSpatialMode] = useState<SpatialMode>("archivo");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [vol, setVol] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [visualizerData, setVisualizerData] = useState<number[]>([]);

  // Time update
  useEffect(() => {
    const unsub = onTimeUpdate((timeMs) => {
      setProgress(timeMs);
      setDuration(getDuration());
    });
    return unsub;
  }, []);

  // Track end handler
  useEffect(() => {
    const unsub = onTrackEnd(() => {
      setPlaying(false);
      onNext?.();
    });
    return unsub;
  }, [onNext]);

  // Visualizer data poll
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      const freq = getAverageFrequency();
      setVisualizerData((prev) => [...prev.slice(-60), freq]);
    }, 50);
    return () => clearInterval(interval);
  }, [playing]);

  const handlePlay = useCallback(() => {
    if (playing) {
      pauseTrack();
      setPlaying(false);
    } else {
      playTrack(track, spatialMode);
      setPlaying(true);
      // XP for first play
      onXpEarned?.(10);
    }
  }, [playing, track, spatialMode, onXpEarned]);

  const handleModeChange = (mode: SpatialMode) => {
    setSpatialMode(mode);
    if (playing) {
      playTrack(track, mode);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVol(v);
    setVolume(muted ? v : v);
    setMuted(v === 0);
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  // Mini visualizer bars
  const bars = visualizerData.slice(-32);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
    >
      {/* Visualizer strip */}
      <div className="relative h-16 bg-[#050814] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, rgba(0,212,255,0.3) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(167,243,0,0.2) 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0 flex items-end justify-center gap-[2px] px-4 pb-2">
          {bars.map((val, i) => (
            <div
              key={i}
              className="w-1 rounded-t transition-[height] duration-75"
              style={{
                height: `${Math.max(2, val * 40)}px`,
                background: `linear-gradient(to top, #00D4FF, #A7F300)`,
                opacity: 0.4 + val * 0.6,
              }}
            />
          ))}
        </div>
        {/* Track title overlay */}
        <div className="absolute bottom-2 left-4 right-4 flex items-end justify-between">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#A7F300]/70">
              {spatialMode === "archivo" ? "Lossless" : spatialMode === "espacio" ? "Espacial" : "Metaverso XR"}
            </p>
            <p className="text-xs text-white font-semibold truncate">{track.title}</p>
          </div>
          <span className="text-[10px] text-white/50 tabular-nums shrink-0">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 py-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div
            className="h-1.5 rounded-full bg-[#E5E7EB] cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seekTo(pct * duration);
            }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-100 relative"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #00D4FF, #A7F300)",
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onPrev}
              disabled={!onPrev}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4B5563] hover:text-[#0b1020] hover:bg-[#F3F4F6] disabled:opacity-30 transition-all"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlay}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#A7F300] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#00D4FF]/30"
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={onNext}
              disabled={!onNext}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4B5563] hover:text-[#0b1020] hover:bg-[#F3F4F6] disabled:opacity-30 transition-all"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#4B5563] hover:text-[#0b1020] transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : vol}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 accent-[#00D4FF]"
            />
          </div>
        </div>

        {/* Spatial mode selector */}
        <div className="mt-4 flex gap-2">
          {SPATIAL_MODES.map((s) => {
            const Icon = s.icon;
            const active = spatialMode === s.mode;
            return (
              <button
                key={s.mode}
                onClick={() => handleModeChange(s.mode)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-[0.15em] transition-all ${
                  active
                    ? "bg-[#050814] text-[#A7F300] shadow-inner"
                    : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
                }`}
                title={s.desc}
              >
                <Icon className="w-3 h-3" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
