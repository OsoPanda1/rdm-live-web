import { useEffect, useMemo, useState } from "react"
import { useWebSocketSubscription } from "../../hooks/useWebSocket"

export interface LSMRenderProps {
  capaActiva: "turismo" | "economia" | "plateria" | "movilidad"
  initialViewState: {
    longitude: number
    latitude: number
    zoom: number
    pitch?: number
    bearing?: number
  }
}

interface LSMNodeEvent {
  capa: LSMRenderProps["capaActiva"]
  data: {
    id: string
    lat: number
    lng: number
    intensidadSaturacion?: number
    ofertaActiva?: boolean
  }
}

const MAP_BOUNDS = {
  minLat: 20.12,
  maxLat: 20.16,
  minLng: -98.69,
  maxLng: -98.65,
}

// Configuración cromática y semántica de la infraestructura LTOS
const CAPA_THEME_MAP: Record<
  LSMRenderProps["capaActiva"],
  {
    colorNodo: string
    shadow: string
    pulseColor: string
  }
> = {
  turismo: {
    colorNodo: "rgba(59, 130, 246, 0.85)", // Azul brillante
    shadow: "0 0 4px rgba(37,99,235,0.2), 0 0 16px rgba(59,130,246,0.6)",
    pulseColor: "bg-blue-400",
  },
  economia: {
    colorNodo: "rgba(245, 158, 11, 0.85)", // Ámbar económico
    shadow: "0 0 4px rgba(217,119,6,0.2), 0 0 16px rgba(245,158,11,0.6)",
    pulseColor: "bg-amber-400",
  },
  plateria: {
    colorNodo: "rgba(226, 232, 240, 0.9)", // Plata / Slate de alta visibilidad
    shadow: "0 0 4px rgba(148,163,184,0.2), 0 0 18px rgba(226,232,240,0.7)",
    pulseColor: "bg-slate-300",
  },
  movilidad: {
    colorNodo: "rgba(244, 63, 94, 0.85)", // Rosa / Carmesí de flujo de tráfico
    shadow: "0 0 4px rgba(225,29,72,0.2), 0 0 16px rgba(244,63,94,0.6)",
    pulseColor: "bg-rose-400",
  },
}

const projectPoint = (lat: number, lng: number) => {
  const x =
    ((lng - MAP_BOUNDS.minLng) /
      (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng || 1e-6)) *
    100
  const y =
    100 -
    ((lat - MAP_BOUNDS.minLat) /
      (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat || 1e-6)) *
      100

  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  }
}

export const LSMRenderEngine = ({
  capaActiva,
  initialViewState,
}: LSMRenderProps) => {
  const [nodosLSM, setNodosLSM] = useState<LSMNodeEvent["data"][]>([])
  const lastEvent = useWebSocketSubscription<LSMNodeEvent>(
    "LSM_REALTIME_STREAM",
  )

  // Aislamiento de Capas: evita persistencia de nodos fantasma al conmutar vector operativo
  useEffect(() => {
    setNodosLSM([])
  }, [capaActiva])

  // Consumo e inserción limpia de flujos en tiempo real
  useEffect(() => {
    if (!lastEvent || lastEvent.capa !== capaActiva) return

    setNodosLSM((prev) => {
      const filtrados = prev.filter((n) => n.id !== lastEvent.data.id)
      const nuevos = [...filtrados, lastEvent.data]
      // Límite de seguridad para evitar tormentas de renders en sesiones largas
      return nuevos.slice(-500)
    })
  }, [lastEvent, capaActiva])

  // Procesamiento y proyección matemática de coordenadas analíticas
  const nodosVisuales = useMemo(() => {
    return nodosLSM.map((nodo) => {
      const point = projectPoint(nodo.lat, nodo.lng)
      const saturacion = nodo.intensidadSaturacion ?? 0
      const scale =
        capaActiva === "movilidad"
          ? 0.6 + saturacion
          : nodo.ofertaActiva
          ? 1.1
          : 0.8

      return {
        ...nodo,
        ...point,
        scale,
      }
    })
  }, [nodosLSM, capaActiva])

  const currentTheme = CAPA_THEME_MAP[capaActiva]

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl border border-white/5 bg-[#060b16] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      data-lng-center={initialViewState.longitude} // Preservación analítica de la referencia de centrado espacial
      data-lat-center={initialViewState.latitude}
    >
      {/* Fondo inmersivo optimizado */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(96,165,250,0.22),transparent_50%),radial-gradient(circle_at_75%_70%,rgba(16,185,129,0.15),transparent_48%),linear-gradient(180deg,#020617,#0f172a)]" />

      {/* Contenedor de Capas de Red optimizado para GPU mediante sub-capa compuesta */}
      <div className="absolute inset-0 pointer-events-none contain-strict">
        {nodosVisuales.map((nodo) => {
          const isOferta = nodo.ofertaActiva && capaActiva !== "movilidad"

          return (
            <div
              key={nodo.id}
              className="absolute rounded-full border border-white/20 will-change-transform"
              style={{
                width: 16,
                height: 16,
                left: 0,
                top: 0,
                // translate3d activa la aceleración por hardware
                // Se usa vw/vh para hacer la proyección relativa al viewport
                transform: `translate3d(${nodo.x}vw, ${nodo.y}vh, 0) translate(-50%, -50%) scale(${nodo.scale})`,
                background: isOferta
                  ? "rgba(238, 242, 255, 0.95)"
                  : currentTheme.colorNodo,
                boxShadow: isOferta
                  ? "0 0 0 4px rgba(238,242,255,0.2), 0 0 24px rgba(238,242,255,0.85)"
                  : currentTheme.shadow,
                transition:
                  "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.2s ease",
              }}
              title={`${nodo.id} · Vector: ${capaActiva}`}
            />
          )
        })}
      </div>

      {/* Panel de Control y Estado de Telemetría Territorial */}
      <div className="pointer-events-none absolute right-4 top-4 rounded-lg border border-white/10 bg-black/70 p-3 backdrop-blur-md transition-all duration-300">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[2px] text-slate-400">
          Estatus LSM
        </span>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 animate-pulse rounded-full ${currentTheme.pulseColor}`}
          />
          <span className="font-sans text-xs font-bold capitalize tracking-wide text-slate-200">
            {capaActiva}
          </span>
        </div>
      </div>
    </div>
  )
}
