import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  type MouseEvent,
} from "react"
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import {
  Play,
  Eye,
  Heart,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type VideoType = "trailer" | "xr" | "course" | "social"

export interface VideoItem {
  id: string
  thumbnail: string
  title: string
  creator: string
  views: number
  likes: number
  duration: string
  isLive?: boolean
  type: VideoType
}

export interface VideoCarouselProps {
  videos: VideoItem[]
  title: string
  subtitle?: string
  /** callback cuando se hace play / click en una tarjeta */
  onVideoSelect?: (video: VideoItem) => void
  /** autoplay orbital opcional (ms) */
  autoRotateIntervalMs?: number
  /** índice inicial del centro */
  initialIndex?: number
}

interface VideoCardProps {
  video: VideoItem
  offset: number // posición relativa al centro (0 = centro absoluto)
  isCenter: boolean
  onSelect: () => void
}

const TYPE_ACCENT: Record<
  VideoType,
  { gradient: string; label: string }
> = {
  xr: {
    gradient: "from-cyan-400 to-emerald-400",
    label: "XR",
  },
  course: {
    gradient: "from-violet-400 to-cyan-400",
    label: "Curso",
  },
  trailer: {
    gradient: "from-cyan-400 to-blue-500",
    label: "Trailer",
  },
  social: {
    gradient: "from-fuchsia-400 to-cyan-400",
    label: "Social",
  },
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  offset,
  isCenter,
  onSelect,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null)

  // Tilt suave con framer-motion
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 180, damping: 22, mass: 0.6 })
  const springY = useSpring(y, { stiffness: 180, damping: 22, mass: 0.6 })

  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    x.set(px)
    y.set(py)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  // Profundidad orbital
  const depthFactor = 1 - Math.min(Math.abs(offset) * 0.18, 0.75)
  const baseRotateY = offset * -16
  const translateZ = depthFactor * 140
  const scale = 0.85 + depthFactor * 0.25
  const opacity = 0.2 + depthFactor * 0.8

  const typeAccent = TYPE_ACCENT[video.type]

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-[16rem] flex-shrink-0 md:w-[19rem]"
      aria-hidden={!isCenter}
    >
      <motion.div
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
        }}
        whileHover={{ y: -6 }}
      >
        <button
          type="button"
          onClick={onSelect}
          className="group relative block w-full rounded-[1.35rem] text-left outline-none"
        >
          <motion.div
            style={{
              transform: `
                translateZ(${translateZ}px)
                rotateY(${baseRotateY}deg)
                scale(${scale})
              `,
              transformStyle: "preserve-3d",
            }}
            className="tamv-card-video relative aspect-video overflow-hidden rounded-[1.35rem] shadow-[0_24px_70px_rgba(15,23,42,0.95)]"
          >
            {/* thumbnail */}
            <img
              src={video.thumbnail}
              alt={video.title}
              loading="lazy"
              className="h-full w-full object-cover saturate-[1.15] contrast-[1.05]"
            />

            {/* overlay de profundidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-slate-900/40" />

            {/* glows */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.4),transparent_55%)] mix-blend-screen opacity-70" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(232,121,249,0.35),transparent_55%)] mix-blend-screen opacity-60" />

            {/* botón play flotante */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: isCenter ? 1 : 0.95,
                opacity: isCenter ? 1 : 0.4,
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute h-20 w-20 rounded-full bg-cyan-400/35 blur-xl" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/90 shadow-[0_0_30px_rgba(34,211,238,0.9)] group-hover:bg-cyan-400">
                  <Play className="ml-1 h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>

            {/* duración */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[11px] text-slate-50 backdrop-blur-md">
              <Clock className="h-3 w-3" />
              {video.duration}
            </div>

            {/* live */}
            {video.isLive && (
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-500/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                <span className="inline-flex h-[6px] w-[6px] animate-pulse rounded-full bg-white" />
                En Vivo
              </div>
            )}

            {/* borde iridiscente TAMV */}
            <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] border border-transparent bg-[conic-gradient(from_150deg,rgba(59,245,255,0.65),rgba(192,132,252,0.7),rgba(59,245,255,0.65))] mix-blend-soft-light opacity-60" />

            {/* marco interno sutil */}
            <div className="pointer-events-none absolute inset-[1px] rounded-[1.25rem] border border-white/8" />
          </motion.div>

          {/* información */}
          <div className="relative mt-3 px-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="line-clamp-2 text-sm font-medium leading-snug text-slate-50 md:text-[15px]">
                  <span className="bg-gradient-to-r from-slate-50 via-slate-200 to-cyan-200 bg-clip-text text-transparent">
                    {video.title}
                  </span>
                </h4>
                <p className="mt-1 text-[11px] text-slate-400">
                  {video.creator}
                </p>
              </div>

              {/* chip de tipo */}
              <div className="flex-shrink-0">
                <div
                  className={`
                    inline-flex items-center rounded-full border border-cyan-300/40
                    bg-slate-950/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]
                    text-cyan-200 bg-gradient-to-r ${typeAccent.gradient}
                    bg-clip-text text-transparent
                  `}
                >
                  {typeAccent.label}
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {video.views.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {video.likes.toLocaleString()}
              </span>
            </div>
          </div>
        </button>
      </motion.div>
    </motion.div>
  )
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({
  videos,
  title,
  subtitle,
  onVideoSelect,
  autoRotateIntervalMs = 0,
  initialIndex = 2,
}) => {
  const [centerIndex, setCenterIndex] = useState(
    Math.min(initialIndex, Math.max(0, videos.length - 1)),
  )

  const containerRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef<number | null>(null)

  const move = useCallback(
    (dir: "left" | "right") => {
      setCenterIndex((prev) => {
        const next = dir === "left" ? prev - 1 : prev + 1
        const len = videos.length
        return (next + len) % len
      })
    },
    [videos.length],
  )

  // Autoplay orbital opcional
  useEffect(() => {
    if (!autoRotateIntervalMs) return
    const id = window.setInterval(() => move("right"), autoRotateIntervalMs)
    return () => window.clearInterval(id)
  }, [autoRotateIntervalMs, move])

  // Swipe táctil básico
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0]?.clientX ?? null
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const startX = touchStartX.current
      if (startX == null) return
      const endX = e.changedTouches[0]?.clientX ?? startX
      const delta = endX - startX
      const threshold = 40 // px
      if (delta > threshold) move("left")
      else if (delta < -threshold) move("right")
      touchStartX.current = null
    }

    el.addEventListener("touchstart", handleTouchStart, { passive: true })
    el.addEventListener("touchend", handleTouchEnd)

    return () => {
      el.removeEventListener("touchstart", handleTouchStart)
      el.removeEventListener("touchend", handleTouchEnd)
    }
  }, [move])

  const handleVideoSelect = (video: VideoItem) => {
    onVideoSelect?.(video)
  }

  if (!videos || videos.length === 0) return null

  return (
    <section
      className="relative py-6"
      aria-label={`${title} — carrusel de videos inmersivos`}
    >
      {/* header TAMV */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-8 w-[3px] rounded-full bg-gradient-to-b from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_18px_rgba(56,189,248,0.8)]" />
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-slate-100 md:text-xl">
              <span className="bg-gradient-to-r from-slate-50 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                {title}
              </span>
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs text-slate-400 md:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            type="button"
            className="h-8 w-8 rounded-full border-cyan-300/60 bg-slate-950/80 text-cyan-200 shadow-[0_0_16px_rgba(56,189,248,0.6)] hover:bg-slate-900/90 hover:text-cyan-100"
            onClick={() => move("left")}
            aria-label="Video anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            type="button"
            className="h-8 w-8 rounded-full border-cyan-300/60 bg-slate-950/80 text-cyan-200 shadow-[0_0_16px_rgba(56,189,248,0.6)] hover:bg-slate-900/90 hover:text-cyan-100"
            onClick={() => move("right")}
            aria-label="Siguiente video"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* horizonte 3D */}
      <div
        ref={containerRef}
        className="relative mt-2 [perspective:1300px]"
      >
        {/* pista orbital */}
        <div className="pointer-events-none absolute inset-x-6 -bottom-4 h-16 rounded-full bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent blur-2xl opacity-80" />

        <div className="relative flex items-stretch justify-center gap-3 md:gap-5">
          {videos.map((video, index) => {
            const offsetRaw = index - centerIndex
            const len = videos.length
            const offset =
              offsetRaw > len / 2
                ? offsetRaw - len
                : offsetRaw < -len / 2
                ? offsetRaw + len
                : offsetRaw

            const isCenter = offset === 0

            return (
              <AnimatePresence key={video.id}>
                <VideoCard
                  video={video}
                  offset={offset}
                  isCenter={isCenter}
                  onSelect={() => handleVideoSelect(video)}
                />
              </AnimatePresence>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default VideoCarousel
