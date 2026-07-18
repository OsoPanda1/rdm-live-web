import type { SndtState, ZoneType, FederationId } from "../types"
import { resolveZone } from "../spatial-rules/semantic-zones"
import { getFederationsForPosition } from "../spatial-rules/semantic-zones"

export interface TerritorialBridgeEvent {
  twinId: string
  zoneIds: string[]
  zoneTypes: ZoneType[]
  federations: FederationId[]
  lon: number
  lat: number
  alt: number
  timestamp: number
}

export class TerritorialBridge {
  private listeners: Array<(event: TerritorialBridgeEvent) => void> = []

  processSndtState(state: SndtState): TerritorialBridgeEvent {
    const [lon, lat] = state.spatial_state.current_position.coordinates
    const alt = state.spatial_state.current_position.coordinates[2] ?? state.spatial_state.altitude_meters
    const zones = resolveZone(lon, lat, alt)
    const federations = getFederationsForPosition(lon, lat, alt)

    const event: TerritorialBridgeEvent = {
      twinId: state.twin_id,
      zoneIds: zones.map(z => z.id),
      zoneTypes: zones.map(z => z.zoneType),
      federations: federations as FederationId[],
      lon,
      lat,
      alt,
      timestamp: state.timestamp,
    }

    this.emit(event)
    return event
  }

  subscribe(listener: (event: TerritorialBridgeEvent) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const idx = this.listeners.indexOf(listener)
      if (idx >= 0) this.listeners.splice(idx, 1)
    }
  }

  private emit(event: TerritorialBridgeEvent): void {
    for (const listener of this.listeners) listener(event)
  }
}
