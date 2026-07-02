import { motion, AnimatePresence } from "framer-motion"
import { useAudioPlayer } from "@/contexts/AudioPlayerContext"
import {
  Play, Pause, SkipBack, SkipForward, Disc3, Volume2, RefreshCw, AlertCircle,
} from "lucide-react"

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function GlobalPlayerBar() {
  const {
    currentTrack, isPlaying, progress, currentTime, volume, error,
    togglePlay, next, prev, setVolume, seek, retry,
  } = useAudioPlayer()

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (currentTrack) {
      seek(((e.clientX - rect.left) / rect.width) * currentTrack.duration)
    }
  }

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(218_24%_12%/0.98)] backdrop-blur-2xl border-t border-white/10 px-4 py-3 shadow-2xl"
        >
          <div className="max-w-5xl mx-auto">
            <div className="h-1 w-full bg-white/10 rounded-full mb-3 cursor-pointer group" onClick={handleSeek}>
              <div className="h-full bg-gradient-to-r from-[hsl(var(--rdm-amber))] to-amber-400 rounded-full transition-all duration-100 relative" style={{ width: `${progress * 100}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                <span className="text-[11px] text-red-300/80 truncate flex-1">{error}</span>
                <button onClick={retry} className="text-[11px] text-white/50 hover:text-white flex items-center gap-1 shrink-0">
                  <RefreshCw className="w-3 h-3" /> Reintentar
                </button>
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[hsl(var(--rdm-amber)/0.15)] flex items-center justify-center shrink-0">
                  <Disc3 className="w-4 h-4 text-[hsl(var(--rdm-amber))]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
                  <p className="text-[11px] text-white/60 truncate">{currentTrack.artist} · {formatDuration(currentTime)} / {formatDuration(currentTrack.duration)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={prev} className="text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button onClick={togglePlay} className="w-11 h-11 rounded-full bg-gradient-to-br from-[hsl(var(--rdm-amber))] to-amber-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[hsl(var(--rdm-amber)/0.4)]">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button onClick={next} className="text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>
              <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
                <Volume2 className="w-4 h-4 text-white/30" />
                <input
                  type="range" min={0} max={1} step={0.05} value={volume}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-[hsl(var(--rdm-amber))] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
