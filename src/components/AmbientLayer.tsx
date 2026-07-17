import { useEffect, useRef } from "react"

function CanvasStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      s: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.3 + 0.05,
      speed: Math.random() * 0.3 + 0.05,
      phase: Math.random() * Math.PI * 2,
    }))

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.scale(dpr, dpr)
    }
    window.addEventListener("resize", resize)

    let running = true
    const draw = () => {
      if (!running) return
      ctx.clearRect(0, 0, W, H)
      const now = Date.now() / 1000
      for (const star of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(now * star.speed + star.phase)
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.s * (0.7 + 0.3 * twinkle), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${star.o * twinkle})`
        ctx.fill()
      }
      requestAnimationFrame(draw)
    }

    draw()
    return () => {
      running = false
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6 }} />
}

export default function AmbientLayer() {
  const rafRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const root = document.documentElement

    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        root.style.setProperty("--mx", `${e.clientX}px`)
        root.style.setProperty("--my", `${e.clientY}px`)
        root.style.setProperty("--mx-pct", `${mouseRef.current.x * 100}%`)
        root.style.setProperty("--my-pct", `${mouseRef.current.y * 100}%`)
      })
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    root.classList.add("cursor-ambient")

    return () => {
      window.removeEventListener("pointermove", onMove)
      root.classList.remove("cursor-ambient")
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Canvas starfield */}
      <CanvasStarfield />

      {/* Aurora layer 1 — deep shift */}
      <div className="absolute inset-0 aurora-bg opacity-70" />

      {/* Aurora layer 2 — conic shimmer */}
      <div className="absolute inset-0 aurora-conic opacity-50" />

      {/* Grid paper fine */}
      <div className="absolute inset-0 grid-paper-fine opacity-40" />

      {/* Floating particles */}
      <div className="absolute inset-0 ambient-particles" />

      {/* Shooting stars */}
      <div className="absolute inset-0 shooting-stars" />

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
    </div>
  )
}
