import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import introAudioSrc from "@/assets/legado.mp3"
import { logger } from "@/lib/logger";
import cinematicBg from "@/assets/rdm-hero-cinematic.png"
import rdm01 from "@/assets/rdm01.jpg"
import rdm02 from "@/assets/rdm02.jpg"
import rdm03 from "@/assets/rdm03.jpg"
import rdm04 from "@/assets/rdm-plaza-principal.jpg"
import logoTamv from "@/assets/banner_rdm.jpg"
import isabellaLogo from "@/assets/isabella_logo.jpg"
import rdmLogo from "@/assets/rdm-logo.png"

interface CinematicIntroProps {
  onComplete: () => void
}

/**
 * 3D Equalizer — bars rendered with perspective transforms
 */
const AudioEqualizer = ({ analyser }: { analyser: AnalyserNode | null }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!analyser || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = 530
    const H = 80
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const BAR_COUNT = 60
    const dataArr = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArr)

      ctx.clearRect(0, 0, W, H)

      const barW = (W / BAR_COUNT) * 0.55
      const gap = (W / BAR_COUNT) * 0.45
      const centerX = W / 2

      for (let i = 0; i < BAR_COUNT; i++) {
        const binIndex = Math.floor(
          (i / BAR_COUNT) * (analyser.frequencyBinCount * 0.6),
        )
        const rawVal = dataArr[binIndex] / 255
        const barH = Math.max(3, rawVal * H * 0.92)

        // 3D perspective: mirror from center, tilt inward
        const mirrored = i >= BAR_COUNT / 2
        const localI = mirrored ? BAR_COUNT - 1 - i : i
        const halfCount = BAR_COUNT / 2
        const distanceFromCenter = Math.abs(localI - halfCount) / halfCount
        const perspectiveScale = 1 - distanceFromCenter * 0.35
        const xOffset = mirrored
          ? centerX + (localI - halfCount) * (barW + gap)
          : localI * (barW + gap)

        const effectiveH = barH * perspectiveScale
        const effectiveW = barW * perspectiveScale
        const x = xOffset + (barW - effectiveW) / 2
        const y = H - effectiveH

        // 3D top face
        const topDepth = effectiveW * 0.15
        const grad = ctx.createLinearGradient(x, H, x, y - topDepth)
        grad.addColorStop(0, `hsla(36, 75%, 45%, ${0.2 + rawVal * 0.8})`)
        grad.addColorStop(0.5, `hsla(43, 90%, 55%, ${0.4 + rawVal * 0.5})`)
        grad.addColorStop(1, `hsla(24, 85%, 60%, ${0.15 + rawVal * 1.0})`)

        ctx.fillStyle = grad
        ctx.shadowBlur = rawVal > 0.5 ? 10 : 0
        ctx.shadowColor = `hsla(43, 90%, 55%, ${rawVal * 0.5})`

        // Front face
        const radius = Math.min(effectiveW / 2, 2)
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + effectiveW - radius, y)
        ctx.quadraticCurveTo(x + effectiveW, y, x + effectiveW, y + radius)
        ctx.lineTo(x + effectiveW, H)
        ctx.lineTo(x, H)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.fill()

        // Top face (3D extrusion)
        ctx.fillStyle = `hsla(43, 70%, 65%, ${0.1 + rawVal * 0.4})`
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + effectiveW, y)
        ctx.lineTo(x + effectiveW + topDepth, y - topDepth)
        ctx.lineTo(x + topDepth, y - topDepth)
        ctx.closePath()
        ctx.fill()

        // Right face (3D extrusion)
        ctx.fillStyle = `hsla(36, 60%, 35%, ${0.05 + rawVal * 0.3})`
        ctx.beginPath()
        ctx.moveTo(x + effectiveW, y)
        ctx.lineTo(x + effectiveW, H)
        ctx.lineTo(x + effectiveW + topDepth, H - topDepth)
        ctx.lineTo(x + effectiveW + topDepth, y - topDepth)
        ctx.closePath()
        ctx.fill()

        // Glow dots on top
        if (rawVal > 0.7) {
          ctx.beginPath()
          ctx.arc(x + effectiveW / 2, y - topDepth - 2, 2 * perspectiveScale, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(43, 100%, 80%, ${rawVal * 0.6})`
          ctx.fill()
        }
      }
    }

    draw()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [analyser])

  return (
    <canvas
      ref={canvasRef}
      className="h-[60px] w-[280px] md:h-[80px] md:w-[530px]"
    />
  )
}

/**
 * Latido de la historia
 */
const AudioWaveform = ({ analyser }: { analyser: AnalyserNode | null }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!analyser || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 520 * dpr
    canvas.height = 40 * dpr
    ctx.scale(dpr, dpr)

    const dataArr = new Uint8Array(analyser.fftSize)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArr)

      const w = 520
      const h = 40
      ctx.clearRect(0, 0, w, h)

      ctx.lineWidth = 2
      ctx.strokeStyle = "hsla(43, 85%, 65%, 0.75)"
      ctx.shadowBlur = 6
      ctx.shadowColor = "hsla(43, 85%, 55%, 0.5)"

      ctx.beginPath()
      const sliceWidth = w / dataArr.length
      let x = 0

      for (let i = 0; i < dataArr.length; i++) {
        const v = dataArr[i] / 128.0
        const y = (v * h) / 2
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }

      ctx.lineTo(w, h / 2)
      ctx.stroke()
    }

    draw()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [analyser])

  return (
    <canvas
      ref={canvasRef}
      className="h-[24px] w-[280px] opacity-50 md:h-[40px] md:w-[520px]"
    />
  )
}

/**
 * Realistic star field — white dwarfs, blue giants, yellow stars, red giants
 */
type Star = {
  id: number
  size: number
  baseX: number
  baseY: number
  depth: number
  color: string
  glowColor: string
  driftX: number
  driftY: number
  duration: number
  delay: number
  layer: 0 | 1 | 2
  twinklePhase: number
  twinkleSpeed: number
  twinkleDepth: number
}

type Particle = {
  id: number
  size: number
  baseX: number
  baseY: number
  opacity: number
  driftY: number
  duration: number
  delay: number
}

/**
 * Realistic star color distribution:
 * ~60% white (main sequence)
 * ~20% blue-white (hotter)
 * ~15% yellow (like our sun)
 * ~5% red (red giants/cooler)
 */
const STAR_COLORS = [
  { color: "hsla(0,0%,95%,0.95)", glow: "hsla(0,0%,100%,0.4)", weight: 60 },
  { color: "hsla(210,100%,85%,0.95)", glow: "hsla(210,100%,75%,0.35)", weight: 20 },
  { color: "hsla(43,90%,75%,0.9)", glow: "hsla(43,80%,70%,0.3)", weight: 15 },
  { color: "hsla(15,90%,65%,0.85)", glow: "hsla(15,90%,55%,0.25)", weight: 5 },
]

function pickStarColor() {
  const total = STAR_COLORS.reduce((s, c) => s + c.weight, 0)
  let r = Math.random() * total
  for (const sc of STAR_COLORS) {
    r -= sc.weight
    if (r <= 0) return sc
  }
  return STAR_COLORS[0]
}

const createStarField = (count: number): Star[] => {
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    const layer = (i % 3) as 0 | 1 | 2
    const depth = 0.3 + Math.random() * 1.7
    const sizeBase = layer === 0 ? 0.5 : layer === 1 ? 1.2 : 2.0
    const sc = pickStarColor()

    stars.push({
      id: i,
      size: sizeBase + Math.random() * (layer === 2 ? 2.8 : 1.2),
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      depth,
      color: sc.color,
      glowColor: sc.glow,
      driftX: (Math.random() - 0.5) * (layer === 2 ? 100 : 50),
      driftY: -30 - Math.random() * (layer === 2 ? 140 : 70),
      duration: 8 + Math.random() * 8,
      delay: Math.random() * 5,
      layer,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 2.5,
      twinkleDepth: 0.15 + Math.random() * 0.6,
    })
  }
  return stars
}

// Neblina de la montaña
const createMistField = (count: number): Particle[] => {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      size: 1 + Math.random() * 3,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      opacity: 0.15 + Math.random() * 0.45,
      driftY: -30 - Math.random() * 60,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 4,
    })
  }
  return particles
}

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [phase, setPhase] = useState(0)
  const [started, setStarted] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [stars] = useState<Star[]>(() => createStarField(190))
  const [mistParticles] = useState<Particle[]>(() => createMistField(140))

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const fadeIntervalRef = useRef<number | null>(null)
  const fadeInIntervalRef = useRef<number | null>(null)
  const cleanupCalledRef = useRef(false)

  const stopAudio = useCallback(() => {
    if (fadeIntervalRef.current !== null) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }
    if (fadeInIntervalRef.current !== null) {
      clearInterval(fadeInIntervalRef.current)
      fadeInIntervalRef.current = null
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      } catch { /* audio cleanup */ }
      audioRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    sourceRef.current = null
    setAnalyser(null)
  }, [])

  const handleSkip = useCallback(() => {
    if (cleanupCalledRef.current) return
    cleanupCalledRef.current = true
    setOverlayVisible(false)
    stopAudio()
    onComplete()
  }, [onComplete, stopAudio])

  useEffect(() => {
    if (!started) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [started, handleSkip])

  const startIntro = async () => {
    if (started) return
    setStarted(true)

    try {
      const Ctor =
        window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctor()
      if (ctx.state === "suspended") {
        await ctx.resume()
      }
      audioCtxRef.current = ctx

      const audio = new Audio(introAudioSrc)
      audio.crossOrigin = "anonymous"
      audio.preload = "auto"
      audioRef.current = audio

      const source = ctx.createMediaElementSource(audio)
      sourceRef.current = source

      const anal = ctx.createAnalyser()
      anal.fftSize = 256
      anal.smoothingTimeConstant = 0.85
      setAnalyser(anal)

      const bass = ctx.createBiquadFilter()
      bass.type = "lowshelf"
      bass.frequency.value = 180
      bass.gain.value = 6

      const presence = ctx.createBiquadFilter()
      presence.type = "peaking"
      presence.frequency.value = 3200
      presence.gain.value = 2.5

      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -20
      compressor.knee.value = 25
      compressor.ratio.value = 3.5
      compressor.attack.value = 0.015
      compressor.release.value = 0.25

      source.connect(bass)
      bass.connect(presence)
      presence.connect(compressor)
      compressor.connect(anal)
      anal.connect(ctx.destination)

      audio.volume = 0
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        await playPromise
      }

      // Entrada suave
      fadeInIntervalRef.current = window.setInterval(() => {
        if (!audioRef.current) return
        const nextVol = Math.min(audioRef.current.volume + 0.05, 0.85)
        audioRef.current.volume = nextVol
        if (nextVol >= 0.85 && fadeInIntervalRef.current) {
          clearInterval(fadeInIntervalRef.current)
        }
      }, 120)

      // Despedida suave al final
      setTimeout(() => {
        if (!audioRef.current) return
        fadeIntervalRef.current = window.setInterval(() => {
          if (!audioRef.current) return
          const nextVol = Math.max(audioRef.current.volume - 0.05, 0)
          audioRef.current.volume = nextVol
          if (nextVol <= 0 && fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
            stopAudio()
          }
        }, 120)
      }, 74000)

      audio.addEventListener("ended", () => {
        setOverlayVisible(false)
        onComplete()
      })
    } catch (e) {
      logger.error("Audio initialization failed:", e)
    }
  }

  /**
   * Tiempo extendido: más calma para leer y sentir
   */
  useEffect(() => {
    if (!started) return

    const timers = [
      setTimeout(() => setPhase(1), 600),   // Origen y orgullo
      setTimeout(() => setPhase(2), 9500),  // Dedicado a Reina
      setTimeout(() => setPhase(3), 20500), // Las noches de desvelo
      setTimeout(() => setPhase(4), 33000), // Oveja negra, logro compartido
      setTimeout(() => setPhase(5), 44500), // Real del Monte
      setTimeout(() => setPhase(6), 56000), // Trabajo artesanal y manos
      setTimeout(() => setPhase(7), 67000), // Siete federaciones / legado
      setTimeout(() => setPhase(8), 76000), // Bienvenida final
      setTimeout(() => {
        setOverlayVisible(false)
        onComplete()
      }, 81500),
    ]

    return () => timers.forEach(clearTimeout)
  }, [started, onComplete])

  useEffect(() => {
    return () => {
      if (cleanupCalledRef.current) return
      cleanupCalledRef.current = true
      stopAudio()
    }
  }, [stopAudio])

  // Texto totalmente orientado a legado, amor, historia
  const scene = (() => {
    switch (phase) {
      case 0:
      case 1:
        return {
          tag: "NUESTRA RAÍZ",
          title: "Orgullosamente realmontenses",
          body:
            "Más que un proyecto, esto es la voz de nuestra historia. Nació entre el frío, la piedra y la neblina de Real del Monte, forjado con el carácter de quienes aprendimos a amar la montaña.",
        }
      case 2:
        return {
          tag: "EL ORIGEN DE ESTA HISTORIA",
          title: "Para mi madre, Reina Trejo Serrano",
          body:
            "Antes de que existiera cualquier idea, ya estaban tus manos sosteniendo mi mundo. Esta obra nace de tu amor silencioso, de tu fuerza y de cada paso que caminaste a mi lado.",
        }
      case 3:
        return {
          tag: "NOCHES EN VELA",
          title: "Por cada madrugada en la que no me soltaste",
          body:
            "A ti, que enfrentaste el cansancio y el miedo sin una sola queja, solo para que yo tuviera un mañana distinto. Cada logro aquí es un reflejo de tu fe inquebrantable y de tu corazón inmenso.",
        }
      case 4:
        return {
          tag: "HONOR A TU NOMBRE",
          title: "Mamá, lo hemos logrado",
          body:
            "Mírame con orgullo y levanta la frente: la oveja negra encontró su camino. Todo este esfuerzo, cada hora y cada detalle, es una forma de devolverte un poco de lo infinito que me diste. Te amo.",
        }
      case 5:
        return {
          tag: "TIERRA QUE NOS FORMÓ",
          title: "Real del Monte, un lugar cerca del cielo",
          body:
            "Entre niebla, viento y campanas, un pueblo mágico levanta la voz y se cuenta a sí mismo. Aquí la montaña no es paisaje: es memoria, carácter y hogar para quienes nunca la hemos dejado de amar.",
        }
      case 6:
        return {
          tag: "HERENCIA DE TRABAJO",
          title: "Manos que moldean la vida con paciencia",
          body:
            "Crecimos viendo manos que transforman la madera, la plata y la piedra en sustento y dignidad. Ese mismo pulso está aquí: en cada palabra, en cada imagen y en cada segundo de esta historia.",
        }
      case 7:
        return {
          tag: "ESFUERZO QUE DEJA HUELLA",
          title: "Siete federaciones, un solo corazón",
          body:
            "Lo que ves es fruto de años de constancia, de más de 23,000 horas de entrega sincera y solitaria. Cuando el trabajo nace del alma, el resultado deja de ser un sistema y se convierte en legado.",
        }
      case 8:
      default:
        return {
          tag: "BIENVENIDOS A CASA",
          title: "Real del Monte Digital",
          body:
            "Esto es una ofrenda a nuestra tierra y a quienes la habitan. Una herramienta nacida del amor, el respeto por nuestra historia y la gratitud por todo lo que recibimos. Gracias por entrar a esta memoria viva.",
        }
    }
  })()

  const heroImages = [
    cinematicBg,
    rdm01,
    rdm02,
    rdm03,
  ]

  const heroIndex =
    phase <= 2 ? 0 : phase === 3 ? 1 : phase === 4 ? 2 : phase === 5 ? 3 : 0

  return (
    <AnimatePresence>
      {overlayVisible && (
        <motion.div
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at center, hsl(223, 40%, 7%) 0%, hsl(224, 45%, 4%) 60%, hsl(225, 60%, 2%) 100%)",
            cursor: !started ? "pointer" : "default",
          }}
          onClick={!started ? startIntro : undefined}
        >
          {/* Botón para entrar directo */}
          {started && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              whileHover={{ opacity: 1, scale: 1.03 }}
              onClick={(e) => {
                e.stopPropagation()
                handleSkip()
              }}
              className="absolute right-6 top-6 z-[60] rounded-full border border-amber-500/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-100/80 backdrop-blur-md transition-all"
            >
              Saltar presentación [ESC]
            </motion.button>
          )}

          {/* Pantalla de invitación inicial */}
          {!started && (
            <motion.div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <img
                  src={cinematicBg}
                  alt="Real del Monte"
                  className="relative h-40 w-40 rounded-full object-cover md:h-52 md:w-52"
                  style={{
                    filter:
                      "drop-shadow(0 0 40px hsla(36,80%,50%,0.3)) saturate(1.1)",
                    border: "2px solid hsla(43, 70%, 55%, 0.3)",
                  }}
                />
              </div>
              <div className="space-y-1 px-4 text-center">
                <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-amber-200/90">
                  TAMV · raíz y memoria
                </p>
                <p className="text-xs tracking-[0.2em] text-slate-300/70">
                  Haz clic para escuchar esta historia de amor, origen y legado
                </p>
              </div>
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-full border"
                style={{ borderColor: "hsla(43, 70%, 55%, 0.4)" }}
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 0px hsla(43,70%,55%,0)",
                    "0 0 25px hsla(43,80%,55%,0.3)",
                    "0 0 0px hsla(43,70%,55%,0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="ml-1 h-0 w-0 border-b-[6px] border-t-[6px] border-l-[12px] border-b-transparent border-t-transparent"
                  style={{ borderLeftColor: "hsl(43, 85%, 60%)" }}
                />
              </motion.div>
            </motion.div>
          )}

          {started && (
            <>
              {/* Fondo de paisajes reales */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIndex}
                  className="absolute inset-0 z-0"
                  initial={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                  animate={{ opacity: 0.45, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                >
                  <img
                    src={heroImages[heroIndex]}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{
                      filter: "saturate(0.65) contrast(1.15) brightness(0.35)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(224,50%,4%)] via-[hsla(224,30%,3%,0.8)] to-[hsl(225,40%,4%)]" />
                </motion.div>
              </AnimatePresence>

              {/* Oscurecimiento íntimo para escenas familiares */}
              <motion.div
                className="absolute inset-0 z-[1]"
                animate={{
                  backgroundColor:
                    phase >= 2 && phase <= 4
                      ? "rgba(0,0,0,0.8)"
                      : "rgba(0,0,0,0.45)",
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />

              {/* Neblina suave */}
              <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
                {mistParticles.map((pt) => (
                  <motion.div
                    key={pt.id}
                    className="absolute rounded-full bg-slate-200/20"
                    style={{
                      width: `${pt.size}px`,
                      height: `${pt.size}px`,
                      left: `${pt.baseX}%`,
                      top: `${pt.baseY}%`,
                    }}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{
                      opacity: [0, pt.opacity, pt.opacity * 0.5, 0],
                      y: [0, pt.driftY],
                    }}
                    transition={{
                      duration: pt.duration,
                      repeat: Infinity,
                      delay: pt.delay,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              {/* Estrellas realistas con paralaje y brillo natural */}
              <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
                {stars.map((star) => {
                  const orbitFactor =
                    star.layer === 2 ? 1.2 : star.layer === 1 ? 0.9 : 0.6
                  const depthScale = 0.5 + star.depth * 0.5
                  const parallaxFactor = 0.5 + star.depth * 0.5

                  return (
                    <motion.div
                      key={star.id}
                      className="absolute rounded-full"
                      style={{
                        width: `${star.size * depthScale}px`,
                        height: `${star.size * depthScale}px`,
                        background: star.color,
                        left: `${star.baseX}%`,
                        top: `${star.baseY}%`,
                        boxShadow: star.size > 2
                          ? `0 0 ${6 + star.size * 3}px ${star.glowColor}`
                          : `0 0 ${2 + star.size}px ${star.glowColor}`,
                        transform: `translateZ(${parallaxFactor * 50}px)`,
                      }}
                      initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
                      animate={{
                        opacity: [
                          0,
                          0.3 + Math.sin(star.twinklePhase) * star.twinkleDepth * 0.5 + 0.5,
                          0.2 + Math.sin(star.twinklePhase + 1.5) * star.twinkleDepth * 0.4 + 0.4,
                          0.4 + Math.sin(star.twinklePhase + 3) * star.twinkleDepth * 0.3 + 0.6,
                          0,
                        ],
                        scale: [
                          0.3,
                          1.2 + Math.sin(star.twinklePhase) * 0.4,
                          1 + Math.sin(star.twinklePhase * 0.7) * 0.3,
                          1.5 + Math.sin(star.twinklePhase * 1.3) * 0.5,
                          0.3,
                        ],
                        y: [0, star.driftY * orbitFactor, star.driftY * 1.1, 0],
                        x: [0, star.driftX * orbitFactor, star.driftX * 0.7, 0],
                      }}
                      transition={{
                        duration: star.duration / star.twinkleSpeed,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut",
                      }}
                    />
                  )
                })}

                {/* Manchas de luz como recuerdos */}
                <motion.div
                  className="absolute inset-[-20%] blur-3xl"
                  initial={{ opacity: 0 }}
                  animate={
                    phase >= 1 ? { opacity: [0.2, 0.6, 0.3] } : { opacity: 0 }
                  }
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 20%, hsla(210,100%,65%,0.32) 0, transparent 50%), radial-gradient(circle at 70% 80%, hsla(43,90%,60%,0.26) 0, transparent 55%), radial-gradient(circle at 50% 40%, hsla(280,60%,70%,0.22) 0, transparent 60%)",
                    mixBlendMode: "screen",
                  }}
                />
              </div>

              {/* Anillos suaves rodeando el centro */}
              <motion.div
                className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={phase >= 1 ? { opacity: 1 } : {}}
              >
                {[0, 1, 2].map((ring) => (
                  <motion.div
                    key={ring}
                    className="absolute rounded-full"
                    style={{
                      width: `${520 + ring * 220}px`,
                      height: `${520 + ring * 220}px`,
                      border: `1px solid ${
                        ring === 1
                          ? "hsla(43,80%,65%,0.3)"
                          : "hsla(210,100%,70%,0.24)"
                      }`,
                    }}
                    initial={{ opacity: 0, scale: 0.35 }}
                    animate={
                      phase >= 1
                        ? {
                            opacity: [0, 0.38, 0.14],
                            scale: [0.35, 1, 1.1],
                            rotate: ring % 2 === 0 ? [0, 220] : [60, -160],
                          }
                        : {}
                    }
                    transition={{
                      duration: 3.4 + ring * 0.8,
                      ease: "easeOut",
                      delay: ring * 0.4,
                    }}
                  />
                ))}
              </motion.div>

              {/* Centro: sello de identidad */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="relative z-[5] mb-8 flex items-center justify-center"
              >
                <motion.div
                  className="absolute h-80 w-80 rounded-full blur-3xl md:h-[380px] md:w-[380px]"
                  style={{
                    background:
                      "radial-gradient(circle,hsla(210,100%,60%,0.4) 0%,hsla(43,80%,50%,0.3) 45%,transparent 80%)",
                  }}
                  animate={{
                    opacity: [0.35, 0.8, 0.35],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <div
                  className="relative flex h-40 w-40 flex-col items-center justify-center rounded-full md:h-56 md:w-56"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(224,30%,10%), hsl(225,45%,5%))",
                    border: "1px solid hsla(43,70%,55%,0.4)",
                    boxShadow:
                      "0 15px 40px rgba(0,0,0,0.6), inset 0 0 28px rgba(255,215,0,0.1)",
                  }}
                >
                  <div className="space-y-1 px-4 text-center">
                    <p className="font-mono text-[9px] tracking-[0.3em] text-amber-200/70 uppercase">
                      Real del Monte
                    </p>
                    <h2
                      className="font-serif text-xl font-bold tracking-wide md:text-2xl"
                      style={{
                        background:
                          "linear-gradient(135deg, #fff, hsl(43, 70%, 65%))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      RAÍZ
                    </h2>
                    <h2
                      className="font-serif text-xl font-bold tracking-wide md:text-2xl"
                      style={{
                        background:
                          "linear-gradient(135deg, #ddd, #94a3b8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Y MEMORIA
                    </h2>
                  </div>
                </div>
              </motion.div>

              {/* Bloque central de palabras */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -22, filter: "blur(8px)" }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  className="relative z-[5] mb-8 flex max-w-4xl flex-col items-center px-6 text-center"
                >
                  <p className="mb-3 font-mono text-[10px] tracking-[0.4em] text-amber-300/85 uppercase md:text-xs">
                    {scene.tag}
                  </p>

                  <h1 className="font-serif text-3xl font-bold leading-tight tracking-normal text-white md:text-5xl lg:text-6xl">
                    {scene.title}
                  </h1>

                  <motion.div
                    className="mx-auto my-4 h-[1px]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, hsl(43,70%,55%), transparent)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: "14rem" }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                  />

                  <p className="mx-auto max-w-3xl text-sm leading-relaxed tracking-wide text-slate-200/90 font-light md:text-base">
                    {scene.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Pulso visual de la música */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={phase >= 1 ? { opacity: 1 } : {}}
                transition={{ duration: 1 }}
                className="relative z-[5] mb-8 flex flex-col items-center gap-1"
              >
                <AudioEqualizer analyser={analyser} />
                <AudioWaveform analyser={analyser} />
                <p className="mt-2 font-mono text-[8px] tracking-[0.3em] text-slate-500 uppercase">
                  Un homenaje nacido del amor y la memoria
                </p>
              </motion.div>

              {/* Logos institucionales */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 5 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.5 }}
                className="absolute bottom-10 z-[5] flex w-full justify-center gap-6 px-4"
              >
                {[
                  {
                    src: logoTamv,
                    label: "TAMV",
                  },
                  {
                    src: isabellaLogo,
                    label: "Isabella AI",
                  },
                  {
                    src: rdmLogo,
                    label: "Real del Monte Digital",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={phase >= 5 ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 1, delay: i * 0.15 }}
                    className="group relative"
                  >
                    <div
                      className="relative h-14 w-14 overflow-hidden rounded-xl border md:h-20 md:w-20 transition-all duration-300 bg-black/40 flex items-center justify-center p-1"
                      style={{
                        borderColor: "hsla(43,50%,50%,0.25)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
                      }}
                    >
                      <img
                        src={item.src}
                        alt={item.label}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-widest text-slate-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CinematicIntro
