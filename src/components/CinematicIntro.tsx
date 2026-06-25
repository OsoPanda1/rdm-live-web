import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import introAudioSrc from "@/assets/tumirada.mp3"

interface CinematicIntroProps {
  onComplete: () => void
}

/**
 * AudioEqualizer — barras espectrales ligadas al AnalyserNode
 */
const AudioEqualizer = ({ analyser }: { analyser: AnalyserNode | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!analyser || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const BAR_COUNT = 48
    const dataArr = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArr)

      const { width: w, height: h } = canvas
      ctx.clearRect(0, 0, w, h)

      const barW = (w / BAR_COUNT) * 0.7
      const gap = (w / BAR_COUNT) * 0.5

      for (let i = 0; i < BAR_COUNT; i++) {
        const binIndex = Math.floor(
          (i / BAR_COUNT) * (analyser.frequencyBinCount * 0.75),
        )
        const rawVal = dataArr[binIndex] / 255
        const barH = Math.max(4, rawVal * h * 0.9)

        const x = i * (barW + gap)
        const y = h - barH

        const grad = ctx.createLinearGradient(x, h, x, y)
        grad.addColorStop(0, `hsla(43, 75%, 65%, ${0.3 + rawVal * 1.3})`)
        grad.addColorStop(0.5, `hsla(210, 80%, 65%, ${0.45 + rawVal * 0.5})`)
        grad.addColorStop(1, `hsla(280, 60%, 70%, ${0.3 + rawVal * 1.4})`)

        ctx.fillStyle = grad
        ctx.shadowBlur = rawVal > 0.55 ? 14 : 4
        ctx.shadowColor = `hsla(210, 100%, 65%, ${rawVal * 0.9})`

        const radius = Math.min(barW / 2, 3)
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + barW - radius, y)
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius)
        ctx.lineTo(x + barW, h)
        ctx.lineTo(x, h)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.fill()

        ctx.save()
        ctx.globalAlpha = 0.36
        ctx.scale(1, -0.35)
        ctx.translate(0, -h * 2 - 6)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + barW - radius, y)
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius)
        ctx.lineTo(x + barW, h)
        ctx.lineTo(x, h)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
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
      width={530}
      height={80}
      className="h-[70px] w-[320px] md:h-[80px] md:w-[530px]"
    />
  )
}

/**
 * AudioWaveform — osciloscopio temporal
 */
const AudioWaveform = ({ analyser }: { analyser: AnalyserNode | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!analyser || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dataArr = new Uint8Array(analyser.fftSize)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArr)

      const { width: w, height: h } = canvas
      ctx.clearRect(0, 0, w, h)

      ctx.lineWidth = 3
      ctx.strokeStyle = "hsla(210, 100%, 75%, 0.85)"
      ctx.shadowBlur = 15
      ctx.shadowColor = "hsla(210, 100%, 65%, 0.8)"

      ctx.beginPath()

      const sliceWidth = (w * 1.0) / dataArr.length
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

      ctx.lineWidth = 0.5
      ctx.strokeStyle = "hsla(210, 100%, 50%, 0.12)"
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.moveTo(0, h / 2)
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
      width={520}
      height={55}
      className="h-[34px] w-[320px] opacity-70 md:h-[48px] md:w-[520px]"
    />
  )
}

/**
 * Estrellas y cielo mágico
 */
type Star = {
  id: number
  size: number
  baseX: number
  baseY: number
  color: string
  driftX: number
  driftY: number
  duration: number
  delay: number
  layer: 0 | 1 | 2
}

const STAR_COLORS = [
  "hsla(210,100%,80%,0.9)",
  "hsla(43,95%,72%,0.9)",
  "hsla(280,70%,75%,0.8)",
  "hsla(0,0%,100%,0.7)",
]

const createStarField = (count: number): Star[] => {
  const stars: Star[] = []
  for (let i = 0; i < count; i++) {
    const layer = (i % 3) as 0 | 1 | 2
    const sizeBase = layer === 0 ? 0.7 : layer === 1 ? 1.3 : 2.2

    stars.push({
      id: i,
      size: sizeBase + Math.random() * (layer === 2 ? 2.4 : 1.4),
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      color: STAR_COLORS[i % STAR_COLORS.length],
      driftX: (Math.random() - 0.5) * (layer === 2 ? 90 : 45),
      driftY: -40 - Math.random() * (layer === 2 ? 130 : 60),
      duration: 6 + Math.random() * 6,
      delay: Math.random() * 4.5,
      layer,
    })
  }
  return stars
}

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [phase, setPhase] = useState(0)
  const [started, setStarted] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [stars] = useState<Star[]>(() => createStarField(190))

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
      } catch {}
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
      const Ctor = window.AudioContext || (window as any).webkitAudioContext
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
      anal.fftSize = 512
      anal.smoothingTimeConstant = 0.85
      setAnalyser(anal)

      const bass = ctx.createBiquadFilter()
      bass.type = "lowshelf"
      bass.frequency.value = 280
      bass.gain.value = 6

      const high = ctx.createBiquadFilter()
      high.type = "highshelf"
      high.frequency.value = 6500
      high.gain.value = 2

      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -26
      compressor.knee.value = 24
      compressor.ratio.value = 3.5
      compressor.attack.value = 0.013
      compressor.release.value = 0.25

      const delay = ctx.createDelay(1.0)
      delay.delayTime.value = 0.38

      const feedback = ctx.createGain()
      feedback.gain.value = 0.32

      const wet = ctx.createGain()
      wet.gain.value = 0.28

      const dry = ctx.createGain()
      dry.gain.value = 1.0

      source.connect(bass)
      bass.connect(high)
      high.connect(dry)
      dry.connect(compressor)

      source.connect(delay)
      delay.connect(feedback)
      feedback.connect(delay)
      delay.connect(wet)
      wet.connect(compressor)

      compressor.connect(anal)
      anal.connect(ctx.destination)

      audio.volume = 0

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        await playPromise
      }

      // Fade in suave
      fadeInIntervalRef.current = window.setInterval(() => {
        if (!audioRef.current) {
          if (fadeInIntervalRef.current !== null) {
            clearInterval(fadeInIntervalRef.current)
            fadeInIntervalRef.current = null
          }
          return
        }

        const nextVol = Math.min(audioRef.current.volume + 0.06, 1)
        audioRef.current.volume = nextVol

        if (nextVol >= 0.85) {
          if (fadeInIntervalRef.current !== null) {
            clearInterval(fadeInIntervalRef.current)
            fadeInIntervalRef.current = null
          }
        }
      }, 120)

      // Fade out final suave sobre los últimos segundos
      setTimeout(() => {
        if (!audioRef.current) return
        fadeIntervalRef.current = window.setInterval(() => {
          if (!audioRef.current) {
            if (fadeIntervalRef.current !== null) {
              clearInterval(fadeIntervalRef.current)
              fadeIntervalRef.current = null
            }
            return
          }

          const nextVol = Math.max(audioRef.current.volume - 0.04, 0)
          audioRef.current.volume = nextVol

          if (nextVol <= 0) {
            if (fadeIntervalRef.current !== null) {
              clearInterval(fadeIntervalRef.current)
              fadeIntervalRef.current = null
            }
            stopAudio()
          }
        }, 120)
      }, 64000)

      audio.addEventListener("ended", () => {
        setOverlayVisible(false)
        onComplete()
      })
    } catch (e) {
      console.error("Audio init failed:", e)
    }
  }

  /**
   * Timeline extendido (≈70s) + 1.5s extra por mensaje
   * Antes: 0–70s aprox; ahora sumamos margen de lectura.
   */
  useEffect(() => {
    if (!started) return

    const timers = [
      setTimeout(() => setPhase(1), 800),    // TAMV
      setTimeout(() => setPhase(2), 8500),   // Dedicado a Reina (antes ~7s)
      setTimeout(() => setPhase(3), 19000),  // Texto emotivo largo
      setTimeout(() => setPhase(4), 31000),  // A mi madre / oveja negra
      setTimeout(() => setPhase(5), 41000),  // Real del Monte / cielo
      setTimeout(() => setPhase(6), 52000),  // Orgullo, memoria y magia
      setTimeout(() => setPhase(7), 62000),  // Legado
      setTimeout(() => setPhase(8), 70500),  // Bienvenidos / entrada
      setTimeout(() => {
        setOverlayVisible(false)
        onComplete()
      }, 76000),
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

  // Contenido por fase
  const scene = (() => {
    switch (phase) {
      case 0:
      case 1:
        return {
          tag: "TAMV ONLINE NETWORK",
          title: "Orgullosamente realmontenses",
          body:
            "Una red nacida desde la montaña, hecha por manos que conocen el frío, la neblina y el corazón de este pueblo.",
        }
      case 2:
        return {
          tag: "Dedicado con amor",
          title: "Proyecto dedicado a Reina Trejo Serrano",
          body:
            "Porque detrás de cada sueño que se levanta, hubo una mujer que sostuvo el mundo en silencio.",
        }
      case 3:
        return {
          tag: "A ti, mamá",
          title: "A ti que en silencio sostuviste noches interminables",
          body:
            "A ti que desde la sombra sufriste sin una sola queja. A ti que renunciaste a tu propia vida para darme alas, camino y futuro.",
        }
      case 4:
        return {
          tag: "A mi madre",
          title: "Hoy tu oveja negra te entrega su trabajo",
          body:
            "Sonríe, levanta el rostro y siéntete orgullosa: por fin lo logré. Todo esto también es tuyo. Te amo con toda el alma.",
        }
      case 5:
        return {
          tag: "Real del Monte",
          title: "Un lugar cerca del cielo",
          body:
            "Entre niebla, viento y campanas, un pueblo mágico levanta la voz y cuenta su propia historia.",
        }
      case 6:
        return {
          tag: "Orgullo, memoria y magia",
          title: "Una tierra que late con historia",
          body:
            "Aquí cada calle guarda una leyenda, cada mina un recuerdo, cada mirada un pedazo de eternidad.",
        }
      case 7:
        return {
          tag: "Esto no es solo un proyecto",
          title: "Es un legado",
          body:
            "Una forma de honrar lo que somos, lo que amamos y lo que soñamos dejarle a quienes vienen detrás.",
        }
      case 8:
      default:
        return {
          tag: "Bienvenidos",
          title: "Real del Monte Digital",
          body: "Aquí comienza una experiencia hecha con alma, memoria y orgullo.",
        }
    }
  })()

  // Secuencia de imágenes que entran y salen (hero + secundarias)
  const heroImages = [
    "/images/rdm-hero.png",
    "/images/realito-pasterias.png",
    "/images/realito-platerias.png",
    "/images/realito-sanitarios.png",
  ]

  const heroIndex =
    phase <= 2 ? 0 : phase === 3 ? 1 : phase === 4 ? 2 : phase === 5 ? 3 : 0

  return (
    <AnimatePresence>
      {overlayVisible && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at top, hsl(220 45% 8%) 0%, hsl(220 35% 3%) 40%, hsl(220 25% 2%) 100%)",
            cursor: !started ? "pointer" : "default",
            backgroundAttachment: "fixed",
          }}
          onClick={!started ? startIntro : undefined}
        >
          {/* Pantalla inicial: tocar para iniciar */}
          {!started && (
            <motion.div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src="/images/rdm-hero.png"
                alt="RDM Digital"
                className="h-40 w-40 rounded-full object-cover opacity-90 md:h-56 md:w-56"
                style={{
                  filter:
                    "drop-shadow(0 0 40px hsla(210,100%,60%,0.7)) saturate(1.25)",
                }}
              />
              <p
                className="text-xs tracking-[0.35em] uppercase md:text-sm"
                style={{ color: "hsl(210 60% 75%)" }}
              >
                Toca para iniciar la experiencia sonora
              </p>
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: "hsla(210, 80%, 60%, 0.6)",
                }}
                animate={{
                  scale: [1, 1.14, 1],
                  boxShadow: [
                    "0 0 0px hsla(210,80%,60%,0)",
                    "0 0 30px hsla(210,80%,60%,0.45)",
                    "0 0 0px hsla(210,80%,60%,0)",
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                <div
                  className="ml-1 h-0 w-0 border-b-[8px] border-t-[8px] border-l-[14px] border-b-transparent border-t-transparent"
                  style={{ borderLeftColor: "hsl(210 80% 70%)" }}
                />
              </motion.div>
            </motion.div>
          )}

          {started && (
            <>
              {/* Fondo hero dinámico a pantalla completa */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIndex}
                  className="absolute inset-0 z-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 0.7, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 2.3, ease: "easeInOut" }}
                >
                  <img
                    src={heroImages[heroIndex]}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{
                      filter:
                        "saturate(0.85) contrast(1.12) brightness(0.65) blur(0.4px)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,25%,4%)] via-[hsla(220,20%,2%,0.7)] to-[hsl(220,20%,3%)]" />
                </motion.div>
              </AnimatePresence>

              {/* Capa extra oscurecida en momentos clave (para que el texto brille) */}
              <motion.div
                className="absolute inset-0 z-[1]"
                animate={{
                  backgroundColor:
                    phase === 3 || phase === 4
                      ? "rgba(0,0,0,0.55)"
                      : "rgba(0,0,0,0.35)",
                }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />

              {/* Cielo estelar mágico */}
              <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
                {stars.map((star) => (
                  <motion.div
                    key={star.id}
                    className="absolute rounded-full"
                    style={{
                      width: `${star.size}px`,
                      height: `${star.size}px`,
                      background: star.color,
                      left: `${star.baseX}%`,
                      top: `${star.baseY}%`,
                      boxShadow:
                        star.layer === 2
                          ? "0 0 20px hsla(43,95%,70%,0.8)"
                          : "0 0 10px hsla(210,100%,80%,0.75)",
                      opacity:
                        star.layer === 0 ? 0.45 : star.layer === 1 ? 0.8 : 1,
                    }}
                    initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
                    animate={{
                      opacity: [0, 1, 0.4, 0.9, 0],
                      scale: [0.4, 1.9, 1.2, 2.1, 0.7],
                      y: [0, star.driftY, star.driftY * 1.1, 0],
                      x: [0, star.driftX, star.driftX * 0.7, 0],
                    }}
                    transition={{
                      duration: star.duration,
                      repeat: Infinity,
                      delay: star.delay,
                      ease: "easeInOut",
                    }}
                  />
                ))}

                {/* Nebulosas suaves centrales */}
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

                {/* Grain sutil */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg,transparent,transparent 2px,hsla(0,0%,100%,0.05) 2px,hsla(0,0%,100%,0.05) 4px)",
                  }}
                />
              </div>

              {/* Anillos concéntricos centrales */}
              <motion.div
                className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center"
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

              {/* Núcleo RDM (más grande, más central) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.45, filter: "blur(40px)" }}
                animate={
                  phase >= 1
                    ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                    : {}
                }
                transition={{ duration: 1.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-[4] mb-10 flex items-center justify-center"
              >
                <motion.div
                  className="absolute h-80 w-80 rounded-full blur-3xl md:h-[380px] md:w-[380px]"
                  style={{
                    background:
                      "radial-gradient(circle,hsla(210,100%,60%,0.4) 0%,hsla(43,80%,50%,0.3) 45%,transparent 80%)",
                  }}
                  animate={
                    phase >= 1
                      ? { opacity: [0.35, 0.8, 0.35], scale: [1, 1.05, 1] }
                      : { opacity: 0 }
                  }
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <div
                  className="relative flex h-40 w-40 items-center justify-center rounded-full md:h-60 md:w-60"
                  style={{
                    background:
                      "linear-gradient(135deg, hsla(220,30%,15%,0.96), hsla(220,40%,8%,0.98))",
                    border: "2px solid hsla(43,80%,65%,0.55)",
                    boxShadow:
                      "0 0 90px hsla(210,100%,60%,0.4), inset 0 0 42px hsla(210,100%,60%,0.2)",
                  }}
                >
                  <div className="text-center px-4">
                    <p
                      className="text-[10px] tracking-[0.3em] uppercase md:text-xs"
                      style={{ color: "hsl(210 70% 70%)" }}
                    >
                      RDM DIGITAL
                    </p>
                    <h2
                      className="mt-1 font-serif text-2xl font-bold md:text-3xl"
                      style={{
                        background:
                          "linear-gradient(135deg, hsl(43 80% 75%), hsl(43 60% 55%))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      REAL DEL
                    </h2>
                    <h2
                      className="font-serif text-2xl font-bold md:text-3xl"
                      style={{
                        background:
                          "linear-gradient(135deg, hsl(210 70% 85%), hsl(43 70% 70%))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      MONTE
                    </h2>
                  </div>
                </div>
              </motion.div>

              {/* Bloque de texto: escenas (centrado, grande, full width) */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{
                    opacity: 0,
                    y: 36,
                    scale: 0.98,
                    filter: "blur(12px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    y: -24,
                    scale: 1.02,
                    filter: "blur(10px)",
                  }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-[5] mb-8 flex max-w-5xl flex-col items-center px-6 text-center"
                >
                  <p
                    className="mb-3 text-[11px] tracking-[0.55em] uppercase md:text-xs"
                    style={{
                      color:
                        phase === 3 || phase === 4
                          ? "hsl(43 70% 78%)"
                          : "hsl(210 55% 72%)",
                    }}
                  >
                    {scene.tag}
                  </p>

                  <h1
                    className="font-serif text-3xl font-bold leading-tight md:text-5xl lg:text-6xl"
                    style={{
                      background:
                        phase === 5 || phase === 6
                          ? "linear-gradient(135deg,hsl(43 80% 80%),hsl(210 70% 88%))"
                          : "linear-gradient(135deg,hsl(0 0% 98%),hsl(43 78% 78%),hsl(210 60% 86%),hsl(0 0% 92%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {scene.title}
                  </h1>

                  <motion.div
                    className="mx-auto my-4 h-[2px]"
                    style={{
                      background:
                        "linear-gradient(90deg,transparent,hsl(210 80% 65%),hsl(43 80% 58%),transparent)",
                    }}
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        phase <= 1
                          ? "12rem"
                          : phase <= 3
                          ? "18rem"
                          : phase <= 5
                          ? "16rem"
                          : "12rem",
                    }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                  />

                  <p
                    className="mx-auto max-w-3xl text-sm leading-7 text-[hsl(210_25%_80%)] md:text-lg"
                    style={{ textShadow: "0 0 18px rgba(255,255,255,0.1)" }}
                  >
                    {scene.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Ecualizador + texto intro sonora */}
              <motion.div
                initial={{ opacity: 0, scaleY: 0.3 }}
                animate={phase >= 2 ? { opacity: 1, scaleY: 1 } : {}}
                transition={{ duration: 1.8, delay: 0.6, ease: "easeOut" }}
                className="relative z-[5] mb-6 flex flex-col items-center gap-1"
              >
                <AudioEqualizer analyser={analyser} />
                <AudioWaveform analyser={analyser} />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={phase >= 2 ? { opacity: 0.5 } : {}}
                  transition={{ delay: 1.2, duration: 1.6 }}
                  className="mt-2 text-[9px] tracking-[0.35em] uppercase"
                  style={{ color: "hsl(210 40% 60%)" }}
                >
                  rdm · intro sonora territorial
                </motion.p>
              </motion.div>

              {/* Carrusel inferior: imágenes que entran y salen */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 5 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.8 }}
                className="absolute bottom-24 z-[5] flex w-full justify-center gap-5 px-4"
              >
                {[
                  { src: "/images/realito-pasterias.png", label: "Gastronomía" },
                  { src: "/images/realito-platerias.png", label: "Artesanías" },
                  { src: "/images/realito-sanitarios.png", label: "Servicios" },
                ].map((item, i) => (
                  <AnimatePresence key={item.label} mode="wait">
                    <motion.div
                      initial={{ opacity: 0, y: 24, scale: 0.9 }}
                      animate={
                        phase >= 5
                          ? { opacity: 1, y: 0, scale: 1 }
                          : { opacity: 0, y: 24, scale: 0.9 }
                      }
                      exit={{ opacity: 0, y: 24, scale: 0.9 }}
                      transition={{ duration: 1, delay: i * 0.15 }}
                      className="group relative"
                    >
                      <div
                        className="h-20 w-20 overflow-hidden rounded-2xl md:h-24 md:w-24"
                        style={{
                          border: "1px solid hsla(210,100%,70%,0.35)",
                          boxShadow: "0 0 24px hsla(210,100%,60%,0.25)",
                        }}
                      >
                        <img
                          src={item.src}
                          alt={item.label}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p
                        className="mt-2 text-center text-[9px] uppercase tracking-wider md:text-[10px]"
                        style={{ color: "hsl(210 55% 68%)" }}
                      >
                        {item.label}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                ))}
              </motion.div>

              {/* Claim inferior */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={phase >= 3 ? { opacity: 1 } : {}}
                transition={{ duration: 1.8, delay: 0.7 }}
                className="absolute bottom-10 z-[5] text-center"
              >
                <p
                  className="text-[10px] tracking-[0.4em] uppercase md:text-xs"
                  style={{ color: "hsl(210 40% 55%)" }}
                >
                  Innovación Turística Inteligente
                </p>
              </motion.div>

              {/* Botón de saltar */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={phase >= 1 ? { opacity: 0.6 } : {}}
                whileHover={{ opacity: 1, scale: 1.05 }}
                onClick={handleSkip}
                className="absolute bottom-6 right-6 z-[50] rounded-full px-4 py-2 text-[10px] tracking-widest uppercase transition-all"
                style={{
                  background: "hsla(0,0%,100%,0.05)",
                  border: "1px solid hsla(0,0%,100%,0.15)",
                  color: "hsl(0 0% 70%)",
                }}
              >
                Saltar (Esc)
              </motion.button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CinematicIntro
