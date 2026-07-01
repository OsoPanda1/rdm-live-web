import React from "react"
import { type LSMRenderProps, LSMRenderEngine } from "@/components/map/LSMRenderEngine"
import TerritorialSVGMap, {
  type TerritorialSVGMapProps,
} from "@/components/map/TerritorialSVGMap"

export interface UnifiedMapBridgeProps {
  /** Configuración de la capa LSM (movilidad, turismo, etc.) */
  lsmConfig: LSMRenderProps
  /** Props para el mapa territorial (POIs, selección, etc.) */
  territorialConfig?: Omit<TerritorialSVGMapProps, "onSelect">
  /** Callback cuando el usuario selecciona un nodo/POI desde cualquier mapa */
  onSelectNode?: (id: string) => void
}

/**
 * UnifiedMapBridge
 * Puente declarativo entre:
 *  - LSMRenderEngine (mapa orbital / flujos en tiempo real)
 *  - TerritorialSVGMap (mapa SVG de nodos / POIs)
 *
 * El objetivo: unificar interacción y estado sin mezclar lógicas internas.
 */
const UnifiedMapBridge: React.FC<UnifiedMapBridgeProps> = ({
  lsmConfig,
  territorialConfig,
  onSelectNode,
}) => {
  const handleTerritorialSelect = (id: string) => {
    onSelectNode?.(id)
  }

  return (
    <section
      className="relative grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
      aria-label="Panel unificado de mapas orbitales y territoriales"
    >
      {/* Panel orbital / LSM */}
      <div className="relative min-h-[260px] rounded-2xl border border-white/5 bg-slate-950/90 p-3 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
        <header className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                Mapa Orbital LTOS
              </span>
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Flujos en tiempo real por vector operativo.
            </p>
          </div>
        </header>

        <div className="mt-1 h-[220px] rounded-xl bg-slate-950/80">
          <LSMRenderEngine {...lsmConfig} />
        </div>
      </div>

      {/* Panel territorial / SVG */}
      <div className="relative min-h-[260px] rounded-2xl border border-white/5 bg-slate-950/90 p-3 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
        <header className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              <span className="bg-gradient-to-r from-slate-50 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                Mapa Territorial
              </span>
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Nodo Cero, federaciones y puntos estratégicos.
            </p>
          </div>
        </header>

        <div className="mt-1 h-[220px]">
          <TerritorialSVGMap
            {...territorialConfig}
            onSelect={handleTerritorialSelect}
          />
        </div>
      </div>
    </section>
  )
}

export default UnifiedMapBridge
