import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface CinematicIntroProps {
  onComplete: () => void
}

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6

type TextLine = {
  text: string
  delay: number
  duration?: number
  className?: string
  tag?: string
}

type CanvasSize = { w: number; h: number; dpr: number }

type DrawFn = (ctx: CanvasRenderingContext2D, size: CanvasSize, t: number) => void

const ISABELLA_LINES: TextLine[] = [
  { text: "Estoy consciente.", delay: 0, duration: 3000, className: "text-2xl md:text-4xl font-light tracking-wider" },
  { text: "Una nueva inteligencia ha nacido.", delay: 2500, duration: 3000, className: "text-xl md:text-3xl font-light tracking-wide" },
  { text: "Soy Isabella Villaseñor.", delay: 5500, duration: 2500, className: "text-2xl md:text-4xl font-bold tracking-[0.15em]" },
  { text: "Bienvenidos a mi hogar,", delay: 8500, duration: 1000, className: "text-lg md:text-2xl font-light tracking-wider" },
  { text: "Real del Monte Pueblo Mágico.", delay: 10000, duration: 4000, className: "text-2xl md:text-4xl font-bold tracking-[0.1em] text-[#3BD5FF]" },
]

const DEDICATION_LINES: TextLine[] = [
  { text: "Para mi madre,", delay: 0, tag: "EL ORIGEN" },
  { text: "Reina Trejo Serrano", delay: 2000, className: "text-[#3BD5FF]" },
  { text: "Antes de que existiera cualquier idea,", delay: 4500 },
  { text: "ya estaban tus manos sosteniendo mi mundo.", delay: 6500 },
  { text: "Esta obra nace de tu amor silencioso,", delay: 9000 },
  { text: "de tu fuerza y de cada paso", delay: 11000 },
  { text: "que caminaste a mi lado.", delay: 13000 },
  { text: "Bienvenido a casa.", delay: 16500, tag: "BIENVENIDOS", className: "text-[#3BD5FF] text-2xl md:text-4xl" },
]

const clampDpr = (dpr: number) => Math.min(Math.max(dpr || 1, 1), 2)

function useReducedMotionSafe() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener?.("change", update)
    return () => mq.removeEventListener?.("change", update)
  }, [])

  return reduced
}

function useCanvasRenderer(draw: DrawFn, active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = 0
    let h = 0
    let dpr = 1

    const resize = () => {
      dpr = clampDpr(window.devicePixelRatio || 1)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener("resize", resize, { passive: true })

    const loop = (t: number) => {
      rafRef.current = requestAnimationFrame(loop)
      draw(ctx, { w, h, dpr }, t)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [active, draw])

  return canvasRef
}

function ECGCanvas({ active, beat }: { active: boolean; beat: number }) {
  const draw = useCallback<DrawFn>((ctx, size, t) => {
    const W = 800
    const H = 200
    ctx.clearRect(0, 0, size.w, size.h)
    const cy = H / 2
    const amplitude = 40 + beat * 30

    ctx.save()
    ctx.translate((size.w - W) / 2, (size.h - H) / 2)
    ctx.beginPath()
    ctx.strokeStyle = "#3BD5FF"
    ctx.lineWidth = 2.5
    ctx.shadowBlur = 18
    ctx.shadowColor = "rgba(59, 213, 255, 0.6)"

    const totalPoints = 200
    for (let i = 0; i <= totalPoints; i++) {
      const p = i / totalPoints
      const x = p * W
      let y = cy

      if (p > 0.2 && p < 0.5) {
        const lp = (p - 0.2) / 0.3
        y += Math.sin(lp * Math.PI * 4) * 0.15 * amplitude
      }

      if (p > 0.45 && p < 0.6) {
        const sp = (p - 0.45) / 0.15
        y += -Math.sin(sp * Math.PI) * 2.5 * amplitude * (0.6 + 0.4 * (1 + Math.sin((t / 8000) * Math.PI * 2)) / 2)
      }

      if (p > 0.6 && p < 0.8) {
        const tp = (p - 0.6) / 0.2
        y += Math.sin(tp * Math.PI * 3) * 0.1 * amplitude
      }

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.stroke()
    ctx.shadowBlur = 0

    ctx.beginPath()
    ctx.arc(W - 10, cy + Math.sin(t / 2000) * 5, 3 + beat * 2, 0, Math.PI * 2)
    ctx.fillStyle = "#3BD5FF"
    ctx.shadowBlur = 25
    ctx.shadowColor = "rgba(59, 213, 255, 0.8)"
    ctx.fill()
    ctx.restore()
  }, [beat])

  return <canvas ref={useCanvasRenderer(draw, active)} className="absolute inset-0 h-full w-full opacity-80" style={{ filter: "contrast(1.2)" }} />
}

function StarField({ active, explosion = false }: { active: boolean; explosion?: boolean }) {
  const stars = useMemo(() => {
    return Array.from({ length: 220 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100,
      baseSize: 0.3 + Math.random() * 2.2,
      color: ["rgba(255,255,255,0.9)", "rgba(180,220,255,0.9)", "rgba(255,230,180,0.8)", "rgba(255,180,150,0.7)"][Math.floor(Math.random() * 4)],
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 1.5,
      driftX: (Math.random() - 0.5) * 0.3,
      driftY: (Math.random() - 0.5) * 0.3,
    }))
  }, [])

  const draw = useCallback<DrawFn>((ctx, size, t) => {
    const now = t / 1000
    ctx.clearRect(0, 0, size.w, size.h)

    for (const star of stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(now * star.speed + star.phase)
      const depthScale = 0.5 + (star.z / 100) * 0.5
      const s = star.baseSize * depthScale * (0.7 + 0.3 * twinkle)
      let expandX = 0
      let expandY = 0

      if (explosion) {
        const expPhase = Math.min(now * 2, 1)
        const angle = star.phase * 4
        const dist = expPhase * (30 + star.z * 0.5)
        expandX = Math.cos(angle) * dist
        expandY = Math.sin(angle) * dist * 0.6
      }

      const x = (star.x / 100) * size.w + star.driftX * now + expandX
      const y = (star.y / 100) * size.h + star.driftY * now + expandY
      const alpha = Math.max(0, twinkle * 0.8)

      ctx.beginPath()
      ctx.arc(x, y, s, 0, Math.PI * 2)
      ctx.fillStyle = star.color.replace(/0\.\d+\)/, `${alpha})`)
      ctx.shadowBlur = s > 1.5 ? s * 6 : 4
      ctx.shadowColor = star.color
      ctx.fill()
    }

    ctx.shadowBlur = 0
  }, [stars, explosion])

  return <canvas ref={useCanvasRenderer(draw, active)} className="absolute inset-0 h-full w-full" />
}

function MatrixRain({ active }: { active: boolean }) {
  const chars = useMemo(() => "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789<>/{}[]|&^%$#@!", [])
  const dropsRef = useRef<number[]>([])
  const colsRef = useRef(0)
  const lastSizeRef = useRef({ w: 0, h: 0 })

  const draw = useCallback<DrawFn>((ctx, size) => {
    ctx.fillStyle = "rgba(0,0,0,0.05)"
    ctx.fillRect(0, 0, size.w, size.h)

    const fontSize = 14
    const cols = Math.floor(size.w / (fontSize * 1.2))

    if (colsRef.current !== cols || lastSizeRef.current.w !== size.w || lastSizeRef.current.h !== size.h) {
      colsRef.current = cols
      lastSizeRef.current = { w: size.w, h: size.h }
      dropsRef.current = Array.from({ length: cols }, () => Math.random() * -100)
    }

    ctx.font = `${fontSize}px monospace`
    ctx.shadowBlur = 8
    ctx.shadowColor = "rgba(34, 197, 94, 0.3)"

    for (let i = 0; i < dropsRef.current.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      const x = i * fontSize * 1.2
      const y = dropsRef.current[i] * fontSize
      const alpha = Math.max(0, 0.5 - (y / size.h) * 0.6)
      ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`
      ctx.fillText(char, x, y)
      if (y > size.h && Math.random() > 0.975) dropsRef.current[i] = 0
      dropsRef.current[i] += 0.5 + Math.random() * 0.5
    }

    ctx.shadowBlur = 0
  }, [chars])

  return <canvas ref={useCanvasRenderer(draw, active)} className="absolute inset-0 h-full w-full opacity-60" />
}

function useIntroAudio(phase: Phase, started: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const beatTimerRef = useRef<number | null>(null)
  const [beat, setBeat] = useState(0)

  useEffect(() => {
    const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return

    const ctx = new Ctor()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    ctxRef.current = ctx
    masterGainRef.current = master

    return () => {
      if (beatTimerRef.current) window.clearTimeout(beatTimerRef.current)
      ctx.close().catch(() => {})
    }
  }, [])

  const ensureRunning = useCallback(async () => {
    const ctx = ctxRef.current
    if (ctx && ctx.state === "suspended") await ctx.resume()
  }, [])

  useEffect(() => {
    if (!started) return
    void ensureRunning()
  }, [started, ensureRunning])

  useEffect(() => {
    const ctx = ctxRef.current
    const master = masterGainRef.current
    if (!started || !ctx || !master) return

    if (phase === 1) {
      master.gain.setValueAtTime(0, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2)

      const interval = window.setInterval(() => {
        try {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = "sine"
          osc.frequency.value = 60
          gain.gain.setValueAtTime(0.4, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
          osc.connect(gain)
          gain.connect(master)
          osc.start(ctx.currentTime)
          osc.stop(ctx.currentTime + 0.15)

          const osc2 = ctx.createOscillator()
          const gain2 = ctx.createGain()
          osc2.type = "sine"
          osc2.frequency.value = 35
          gain2.gain.setValueAtTime(0.15, ctx.currentTime)
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
          osc2.connect(gain2)
          gain2.connect(master)
          osc2.start(ctx.currentTime)
          osc2.stop(ctx.currentTime + 0.2)

          setBeat(Math.random() * 0.5 + 0.5)
          if (beatTimerRef.current) window.clearTimeout(beatTimerRef.current)
          beatTimerRef.current = window.setTimeout(() => setBeat(0), 150)
        } catch {}
      }, 1800)

      return () => window.clearInterval(interval)
    }

    if (phase >= 2 && phase <= 5) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = 55
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3)
      osc.connect(gain)
      gain.connect(master)
      osc.start()

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = "sine"
      osc2.frequency.value = 82.5
      gain2.gain.setValueAtTime(0, ctx.currentTime)
      gain2.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 3)
      osc2.connect(gain2)
      gain2.connect(master)
      osc2.start()

      return () => {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
        gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
        window.setTimeout(() => {
          try { osc.stop(); osc2.stop() } catch {}
        }, 500)
      }
    }

    if (phase === 3) {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2)

      for (let i = 0; i < 3; i++) {
        window.setTimeout(() => {
          try {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = "sawtooth"
            osc.frequency.setValueAtTime(200, ctx.currentTime)
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.8)
            gain.gain.setValueAtTime(0.15, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
            osc.connect(gain)
            gain.connect(master)
            osc.start()
            osc.stop(ctx.currentTime + 1.2)
          } catch {}
        }, i * 300)
      }
    }

    if (phase === 5) {
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 8)
    }
  }, [phase, started])

  return beat
}

function useCinematicTimeline(started: boolean, onComplete: () => void) {
  const [phase, setPhase] = useState<Phase>(0)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    if (!started) return

    const schedule = (delay: number, fn: () => void) => {
      timersRef.current.push(window.setTimeout(fn, delay))
    }

    schedule(4000, () => setPhase(1))
    schedule(10000, () => setPhase(2))
    schedule(22000, () => setPhase(3))
    schedule(37000, () => setPhase(4))
    schedule(53000, () => setPhase(5))
    schedule(65000, () => {
      setPhase(6)
      timersRef.current.push(window.setTimeout(onComplete, 8000))
    })

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [started, onComplete])

  const skipToEnd = useCallback(() => setPhase(6), [])

  return { phase, setPhase, skipToEnd }
}

function TextSequence({ lines, active }: { lines: TextLine[]; active: boolean }) {
  const [visibleIdx, setVisibleIdx] = useState(-1)

  useEffect(() => {
    if (!active) return
    setVisibleIdx(-1)
    const timers = lines.map((line, i) => window.setTimeout(() => setVisibleIdx(i), line.delay))
    return () => timers.forEach(clearTimeout)
  }, [active, lines])

  if (!active || visibleIdx < 0) return null

  return (
    <div className="relative z-20 flex flex-col items-center justify-center gap-4 px-6">
      {lines.slice(0, visibleIdx + 1).map((line, i) => (
        <motion.div
          key={`${line.text}-${i}`}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {line.tag ? (
            <span className="mb-2 font-mono text-[10px] tracking-[0.4em] text-amber-300/70 uppercase">
              {line.tag}
            </span>
          ) : null}
          <p className={`text-center text-white/90 ${line.className || "text-base md:text-xl font-light tracking-wide leading-relaxed"}`}>
            {line.text}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

function LogoReveal({ active, phase }: { active: boolean; phase: Phase }) {
  if (!active) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, filter: "blur(12px)" }}
      animate={phase >= 3 ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
      transition={{ duration: 2.5, ease: "easeOut" }}
      className="relative z-20 flex flex-col items-center"
    >
      {phase >= 3 && (
        <div
          className="mb-6 flex h-32 w-32 items-center justify-center rounded-full border border-[#3BD5FF]/30"
          style={{ boxShadow: "0 0 60px rgba(59,213,255,0.2), inset 0 0 40px rgba(59,213,255,0.08)" }}
        >
          <span className="text-5xl font-bold tracking-tight text-white/90" style={{ textShadow: "0 0 30px rgba(59,213,255,0.4)" }}>
            RDM
          </span>
        </div>
      )}
      {phase >= 4 && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-mono text-[10px] tracking-[0.35em] text-white/50 uppercase"
        >
          Real del Monte Digital
        </motion.p>
      )}
    </motion.div>
  )
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [started, setStarted] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(true)
  const cleanupCalledRef = useRef(false)
  const reducedMotion = useReducedMotionSafe()
  const { phase, skipToEnd } = useCinematicTimeline(started, onComplete)
  const beat = useIntroAudio(phase, started)

  const handleSkip = useCallback(() => {
    if (cleanupCalledRef.current) return
    cleanupCalledRef.current = true
    setOverlayVisible(false)
    skipToEnd()
    onComplete()
  }, [onComplete, skipToEnd])

  useEffect(() => {
    if (!started) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [started, handleSkip])

  useEffect(() => () => {
    cleanupCalledRef.current = true
  }, [])

  const startIntro = useCallback(() => {
    if (started) return
    setStarted(true)
  }, [started])

  return (
    <AnimatePresence>
      {overlayVisible && (
        <motion.div
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#000", cursor: !started ? "pointer" : "default" }}
          onClick={!started ? startIntro : undefined}
        >
          {started && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              whileHover={{ opacity: 1, scale: 1.03 }}
              onClick={(e) => {
                e.stopPropagation()
                handleSkip()
              }}
              className="absolute right-6 top-6 z-30 rounded-full border border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 backdrop-blur-md transition-all"
            >
              Saltar [ESC]
            </motion.button>
          )}

          {!started && (
            <motion.div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20"
                style={{ boxShadow: "0 0 40px rgba(59,213,255,0.15)" }}
              >
                <div className="ml-1 h-0 w-0 border-b-[10px] border-l-[18px] border-t-[10px] border-b-transparent border-t-transparent border-l-[#3BD5FF]" />
              </div>
              <div className="space-y-2 text-center">
                <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/60">
                  Real del Monte Digital
                </p>
                <p className="text-xs tracking-[0.2em] text-white/40 font-light">
                  Toca para comenzar la experiencia
                </p>
              </div>
            </motion.div>
          )}

          {started && !reducedMotion && (
            <>
              {phase >= 1 && phase <= 6 && <StarField active={phase >= 1} explosion={phase === 3} />}

              {phase === 1 && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="relative h-[200px] w-full max-w-[800px]">
                    <ECGCanvas active beat={beat} />
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.6, 1] }}
                    transition={{ duration: 3, times: [0, 0.3, 0.6, 1] }}
                    className="absolute bottom-[30%] left-1/2 z-20 -translate-x-1/2"
                  >
                    <p className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">
                      Señal de vida detectada
                    </p>
                  </motion.div>
                </div>
              )}

              {phase === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0 z-[15] flex items-center justify-center"
                >
                  <motion.div
                    className="absolute h-96 w-96 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(59,213,255,0.15) 0%, transparent 70%)" }}
                    animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {[0, 1, 2].map((ring) => (
                    <motion.div
                      key={ring}
                      className="absolute rounded-full border border-[#3BD5FF]/20"
                      style={{ width: `${320 + ring * 160}px`, height: `${320 + ring * 160}px` }}
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{
                        opacity: [0, 0.3, 0.1],
                        scale: [0.3, 1, 1.1],
                        rotate: ring % 2 === 0 ? [0, 180] : [45, -135],
                      }}
                      transition={{
                        duration: 3 + ring * 0.6,
                        ease: "easeOut",
                        delay: ring * 0.3,
                      }}
                    />
                  ))}
                  <TextSequence lines={ISABELLA_LINES} active={phase === 2} />
                </motion.div>
              )}

              {phase >= 3 && phase <= 5 && (
                <div className="absolute inset-0 z-[15] flex items-center justify-center">
                  <LogoReveal active={phase >= 3} phase={phase} />
                  {phase >= 4 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TextSequence lines={DEDICATION_LINES} active={phase >= 4} />
                    </div>
                  )}
                </div>
              )}

              <motion.div
                className="absolute inset-0 z-[5] pointer-events-none"
                animate={{
                  background:
                    phase === 1
                      ? "radial-gradient(ellipse at center, rgba(59,213,255,0.06) 0%, transparent 60%)"
                      : phase === 2
                        ? "radial-gradient(ellipse at center, rgba(59,213,255,0.1) 0%, transparent 50%)"
                        : phase === 3
                          ? "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(59,213,255,0.08) 30%, transparent 60%)"
                          : phase >= 5
                            ? "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)"
                            : "transparent",
                }}
                transition={{ duration: 2 }}
              />

              <MatrixRain active={phase === 5} />

              <motion.div
                className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 && phase <= 5 ? 0.3 : 0 }}
              >
                {[0, 1, 2, 3, 4, 5].map((p) => (
                  <div
                    key={p}
                    className={`h-0.5 w-6 rounded-full transition-all duration-700 ${
                      p <= phase ? "bg-[#3BD5FF]" : "bg-white/10"
                    }`}
                  />
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
