import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react"
import { logger } from "@/lib/logger"

export interface Track {
  id: string
  title: string
  artist: string
  description: string
  src: string
  duration: number
  bpm?: number
  mood?: string
}

interface AudioPlayerState {
  currentTrack: Track | null
  playlist: Track[]
  isPlaying: boolean
  progress: number
  currentTime: number
  volume: number
  error: string | null
  play: (track: Track, playlist?: Track[]) => void
  togglePlay: () => void
  pause: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  retry: () => void
}

const AudioPlayerContext = createContext<AudioPlayerState | null>(null)

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const nextRef = useRef<() => void>(() => {})
  const volumeRef = useRef(0.8)
  const lastTrackRef = useRef<Track | null>(null)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [playlist, setPlaylist] = useState<Track[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [error, setError] = useState<string | null>(null)
  volumeRef.current = volume
  const trackIndexRef = useRef(-1)

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = "auto"
    }
    const audio = audioRef.current
    audio.volume = volumeRef.current

    const onTime = () => {
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0)
      setCurrentTime(audio.currentTime)
    }
    const onEnd = () => {
      nextRef.current()
    }
    const onPlay = () => { setIsPlaying(true); setError(null) }
    const onPause = () => setIsPlaying(false)
    const onError = () => {
      const msg = audio.src ? `Error al cargar audio: ${audio.src.split('/').pop()}` : 'Error de reproducción'
      setError(msg)
      logger.warn(msg)
    }

    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("ended", onEnd)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("error", onError)

    return () => {
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("ended", onEnd)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("error", onError)
    }
  }, [])

  const play = useCallback((track: Track, newPlaylist?: Track[]) => {
    const audio = audioRef.current
    if (!audio) return

    lastTrackRef.current = track
    setError(null)

    if (newPlaylist) {
      setPlaylist(newPlaylist)
      trackIndexRef.current = newPlaylist.findIndex(t => t.id === track.id)
    } else {
      const idx = playlist.findIndex(t => t.id === track.id)
      if (idx >= 0) trackIndexRef.current = idx
    }

    audio.src = track.src
    audio.currentTime = 0
    audio.play().catch((err) => {
      setError(`No se pudo reproducir: ${err.message || 'error desconocido'}`)
      setIsPlaying(false)
    })
    setCurrentTrack(track)
    setIsPlaying(true)
    setProgress(0)
    setCurrentTime(0)
  }, [playlist])

  const retry = useCallback(() => {
    if (!lastTrackRef.current) return
    play(lastTrackRef.current)
  }, [play])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (audio.paused) {
      audio.play().catch((err) => {
        setError(`No se pudo reanudar: ${err.message}`)
        setIsPlaying(false)
      })
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [currentTrack])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const next = useCallback(() => {
    if (playlist.length === 0) return
    const nextIdx = (trackIndexRef.current + 1) % playlist.length
    trackIndexRef.current = nextIdx
    const nextTrack = playlist[nextIdx]
    if (nextTrack) play(nextTrack)
  }, [playlist, play])
  nextRef.current = next

  const prev = useCallback(() => {
    if (playlist.length === 0) return
    const prevIdx = (trackIndexRef.current - 1 + playlist.length) % playlist.length
    trackIndexRef.current = prevIdx
    const prevTrack = playlist[prevIdx]
    if (prevTrack) play(prevTrack)
  }, [playlist, play])

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time
  }, [])

  const setVolumeFn = useCallback((v: number) => {
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  return (
    <AudioPlayerContext.Provider value={{
      currentTrack,
      playlist,
      isPlaying,
      progress,
      currentTime,
      volume,
      error,
      play,
      togglePlay,
      pause,
      next,
      prev,
      seek,
      setVolume: setVolumeFn,
      retry,
    }}>
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext)
  if (!ctx) throw new Error("useAudioPlayer must be used within AudioPlayerProvider")
  return ctx
}
