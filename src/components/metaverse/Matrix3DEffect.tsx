import { useEffect, useRef } from "react"

interface Matrix3DProps {
  density?: number
  speed?: number
  color?: string
  className?: string
}

const CHARS = "TAMVREALDIMONTE<>/{}[]|&^%$#@!アイウエオカキクケコサシスセソ"

export default function Matrix3DEffect({
  density = 80,
  speed = 1,
  color = "#22D3EE",
  className = "",
}: Matrix3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

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

    const fontSize = 12
    const cols = Math.floor(W / (fontSize * 1.5))
    const drops: number[][] = []

    for (let i = 0; i < cols; i++) {
      drops.push([
        Math.random() * -H / fontSize,
        Math.random() * 0.5 + 0.3, // speed multiplier
        Math.floor(Math.random() * 3), // depth layer 0-2
      ])
    }

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.scale(dpr, dpr)
    }
    window.addEventListener("resize", resize)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      ctx.fillStyle = "rgba(0,0,0,0.045)"
      ctx.fillRect(0, 0, W, H)

      for (let i = 0; i < drops.length; i++) {
        const [y, speedMul, depth] = drops[i]
        const x = i * fontSize * 1.5
        const depthScale = 1 - depth * 0.3
        const charSize = fontSize * depthScale
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]

        ctx.font = `${charSize}px monospace`
        ctx.shadowBlur = 6 * depthScale

        const alpha = 0.3 + (1 - depth * 0.35)

        // Head of drop is brighter
        const isHead = y % 10 < 1
        if (isHead) {
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`
          ctx.shadowColor = "rgba(255,255,255,0.4)"
        } else {
          ctx.fillStyle = `rgba(34, 211, 238, ${alpha * 0.6})`
          ctx.shadowColor = `rgba(34, 211, 238, ${alpha * 0.2})`
        }

        ctx.fillText(char, x, y * fontSize * depthScale)

        // Update position
        drops[i][0] += speed * speedMul * depthScale * 0.8

        // Reset when off screen
        if (y * fontSize * depthScale > H + 50) {
          drops[i][0] = -Math.random() * 20
          drops[i][1] = Math.random() * 0.5 + 0.3
        }
      }
      ctx.shadowBlur = 0
    }

    draw()
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [density, speed, color])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      style={{ opacity: 0.35 }}
    />
  )
}
