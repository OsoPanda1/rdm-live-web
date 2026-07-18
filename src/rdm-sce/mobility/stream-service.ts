import type { SndtState, MotionType, GeoPoint } from "../types"
import { getProfileForTwin, type SamplingProfile, type SamplingConfig } from "./profiles"

export interface MobilitySample {
  twin_id: string
  timestamp: number
  position: GeoPoint
  altitude_meters: number
  velocity_mps: number
  heading_degrees: number
  motion_type: MotionType
  accuracy_radius: number
}

export class MobilityStreamService {
  private pendingBatch: Map<string, MobilitySample[]> = new Map()
  private lastSample: Map<string, MobilitySample> = new Map()
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map()
  private listeners: Array<(sample: MobilitySample) => void> = []

  ingestSample(sample: MobilitySample): void {
    const twinId = sample.twin_id
    const last = this.lastSample.get(twinId)
    if (last && this.isDuplicateOrStale(sample, last)) return

    this.lastSample.set(twinId, sample)
    this.emit(sample)

    const batch = this.pendingBatch.get(twinId) ?? []
    batch.push(sample)
    this.pendingBatch.set(twinId, batch)
  }

  flushBatch(twinId: string): MobilitySample[] {
    const batch = this.pendingBatch.get(twinId) ?? []
    this.pendingBatch.set(twinId, [])
    return batch
  }

  getLastSample(twinId: string): MobilitySample | undefined {
    return this.lastSample.get(twinId)
  }

  getBatchSize(twinId: string): number {
    return (this.pendingBatch.get(twinId) ?? []).length
  }

  startAutoFlush(
    twinId: string,
    profile: SamplingProfile,
    onFlush: (samples: MobilitySample[]) => void,
  ): void {
    const config = profile.activeMovement.batchUpload
    if (!config?.enabled) return

    const existing = this.timers.get(twinId)
    if (existing) clearInterval(existing)

    const timer = setInterval(() => {
      const batch = this.flushBatch(twinId)
      if (batch.length > 0) onFlush(batch)
    }, config.flushIntervalMs)

    this.timers.set(twinId, timer)
  }

  stopAutoFlush(twinId: string): void {
    const timer = this.timers.get(twinId)
    if (timer) {
      clearInterval(timer)
      this.timers.delete(twinId)
    }
  }

  shouldSample(
    currentState: SndtState,
    previousState?: SndtState,
  ): SamplingConfig | null {
    const profile = getProfileForTwin(
      "smart_tourism_twin",
      currentState.network_state.threat_level,
      currentState.network_state.connection_type,
    )

    const isMoving = currentState.mobility_state.motion_type !== "stationary"
    const config = isMoving ? profile.activeMovement : profile.stationary

    if (!previousState) return config

    const dist = this.haversineDistance(
      previousState.spatial_state.current_position.coordinates,
      currentState.spatial_state.current_position.coordinates,
    )

    if (previousState.spatial_state.current_position.coordinates[2] !== undefined &&
        currentState.spatial_state.current_position.coordinates[2] !== undefined) {
      const altDelta = Math.abs(
        currentState.spatial_state.current_position.coordinates[2] -
        previousState.spatial_state.current_position.coordinates[2],
      )
      if (altDelta > 50) {
        config.updateIntervalMs = Math.max(
          config.updateIntervalMs / 2,
          1000,
        )
      }
    }

    if (dist < config.distanceFilterMeters) return null

    return config
  }

  subscribe(listener: (sample: MobilitySample) => void): () => void {
    this.listeners.push(listener)
    return () => {
      const idx = this.listeners.indexOf(listener)
      if (idx >= 0) this.listeners.splice(idx, 1)
    }
  }

  private emit(sample: MobilitySample): void {
    for (const listener of this.listeners) listener(sample)
  }

  private isDuplicateOrStale(sample: MobilitySample, last: MobilitySample): boolean {
    return (
      sample.timestamp <= last.timestamp &&
      sample.position.coordinates[0] === last.position.coordinates[0] &&
      sample.position.coordinates[1] === last.position.coordinates[1]
    )
  }

  private haversineDistance(a: number[], b: number[]): number {
    const R = 6371000
    const dLat = this.toRad(b[1] - a[1])
    const dLon = this.toRad(b[0] - a[0])
    const lat1 = this.toRad(a[1])
    const lat2 = this.toRad(b[1])
    const sinDLat = Math.sin(dLat / 2)
    const sinDLon = Math.sin(dLon / 2)
    const aVal = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
    return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal))
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180
  }
}
