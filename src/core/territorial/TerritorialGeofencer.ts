import type { Coordenadas, BoundingBox, PointOfInterest } from '@/core/models';
import { withinBBox, fastDistance, createBBox } from '@/core/geo';
import type { TerritorialZone, ZoneEvent, ZoneAlert } from './types';
import { logger } from '@/lib/logger';

interface GeofenceConfig {
  checkIntervalMs: number;
  proximityMeters: number;
  dwellTimeMinutes: number;
}

export class TerritorialGeofencer {
  private zones: TerritorialZone[] = [];
  private userPositions: Map<string, { coords: Coordenadas; enteredAt: Date; lastSeen: Date; currentZone?: string }> = new Map();
  private zoneHistory: Map<string, { zoneId: string; enteredAt: Date; exitedAt?: Date }[]> = new Map();
  private listeners: Set<(event: ZoneEvent) => void> = new Set();
  private alertListeners: Set<(alert: ZoneAlert) => void> = new Set();
  private interval: ReturnType<typeof setInterval> | null = null;
  private config: GeofenceConfig;

  constructor(config: Partial<GeofenceConfig> = {}) {
    this.config = {
      checkIntervalMs: 30000,
      proximityMeters: 100,
      dwellTimeMinutes: 10,
      ...config,
    };
  }

  defineZones(zones: TerritorialZone[]): void {
    this.zones = zones;
    logger.info('[Geofencer] Zonas territoriales definidas', { count: zones.length });
  }

  addZone(zone: TerritorialZone): void {
    this.zones.push(zone);
  }

  start(): void {
    if (this.interval) return;
    this.interval = setInterval(() => this.checkAll(), this.config.checkIntervalMs);
    logger.info('[Geofencer] Vigilancia territorial iniciada');
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  updatePosition(userId: string, coords: Coordenadas): ZoneEvent | null {
    const now = new Date();
    const existing = this.userPositions.get(userId);

    if (existing) {
      existing.lastSeen = now;
      existing.coords = coords;
    } else {
      this.userPositions.set(userId, { coords, enteredAt: now, lastSeen: now });
    }

    const currentZone = this.findZone(coords);
    const prevZoneId = existing?.currentZone;

    if (currentZone && currentZone.id !== prevZoneId) {
      const event: ZoneEvent = {
        type: 'zone_enter',
        userId,
        zoneId: currentZone.id,
        zoneName: currentZone.name,
        coords,
        timestamp: now,
      };
      this.emitEvent(event);

      const history = this.zoneHistory.get(userId) ?? [];
      history.push({ zoneId: currentZone.id, enteredAt: now });
      this.zoneHistory.set(userId, history);

      if (existing) existing.currentZone = currentZone.id;
      else {
        const u = this.userPositions.get(userId);
        if (u) u.currentZone = currentZone.id;
      }

      return event;
    }

    if (!currentZone && prevZoneId) {
      const event: ZoneEvent = {
        type: 'zone_exit',
        userId,
        zoneId: prevZoneId,
        zoneName: this.zones.find(z => z.id === prevZoneId)?.name ?? '',
        coords,
        timestamp: now,
      };
      this.emitEvent(event);

      const history = this.zoneHistory.get(userId);
      if (history && history.length > 0) {
        const lastEntry = history[history.length - 1];
        if (!lastEntry.exitedAt) lastEntry.exitedAt = now;
      }

      const u = this.userPositions.get(userId);
      if (u) u.currentZone = undefined;

      return event;
    }

    return null;
  }

  getCurrentZone(userId: string): TerritorialZone | null {
    const pos = this.userPositions.get(userId);
    if (!pos?.currentZone) return null;
    return this.zones.find(z => z.id === pos.currentZone) ?? null;
  }

  getZoneHistory(userId: string): { zoneId: string; enteredAt: Date; exitedAt?: Date }[] {
    return this.zoneHistory.get(userId) ?? [];
  }

  getActiveUsersInZone(zoneId: string): number {
    let count = 0;
    for (const [, pos] of this.userPositions) {
      if (pos.currentZone === zoneId) count++;
    }
    return count;
  }

  getAllZones(): TerritorialZone[] {
    return [...this.zones];
  }

  subscribe(listener: (event: ZoneEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onAlert(listener: (alert: ZoneAlert) => void): () => void {
    this.alertListeners.add(listener);
    return () => this.alertListeners.delete(listener);
  }

  private findZone(coords: Coordenadas): TerritorialZone | null {
    for (const zone of this.zones) {
      if (zone.type === 'circle') {
        const dist = fastDistance(coords, { lat: zone.centerLat, lng: zone.centerLng });
        if (dist <= zone.radiusMeters) return zone;
      } else if (zone.type === 'bbox' && zone.boundingBox) {
        if (withinBBox(coords, zone.boundingBox)) return zone;
      } else if (zone.type === 'polygon' && zone.polygon) {
        if (this.pointInPolygon(coords, zone.polygon)) return zone;
      }
    }
    return null;
  }

  private pointInPolygon(point: Coordenadas, polygon: { lat: number; lng: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;
      if ((yi > point.lat) !== (yj > point.lat) &&
          point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  private checkAll(): void {
    const now = new Date();
    for (const [userId, pos] of this.userPositions) {
      const dwellMinutes = (now.getTime() - pos.enteredAt.getTime()) / 60000;
      if (pos.currentZone && dwellMinutes >= this.config.dwellTimeMinutes) {
        const zone = this.zones.find(z => z.id === pos.currentZone);
        if (zone) {
          const alert: ZoneAlert = {
            type: 'dwell_alert',
            userId,
            zoneId: zone.id,
            zoneName: zone.name,
            dwellMinutes: Math.round(dwellMinutes),
            coords: pos.coords,
            timestamp: now,
          };
          for (const listener of this.alertListeners) listener(alert);
        }
      }
    }
  }

  private emitEvent(event: ZoneEvent): void {
    for (const listener of this.listeners) listener(event);
  }
}

export const territorialGeofencer = new TerritorialGeofencer();

// Zonas predeterminadas de Real del Monte
export function initializeRDMZones(): void {
  territorialGeofencer.defineZones([
    {
      id: 'rdm-centro-historico',
      name: 'Centro Historico',
      type: 'circle',
      centerLat: 20.1432,
      centerLng: -98.6694,
      radiusMeters: 400,
      description: 'Nucleo principal del pueblo',
      risk: 'low',
    },
    {
      id: 'rdm-mina-acosta',
      name: 'Mina de Acosta',
      type: 'circle',
      centerLat: 20.1421,
      centerLng: -98.6712,
      radiusMeters: 200,
      description: 'Zona del museo minero',
      risk: 'medium',
    },
    {
      id: 'rdm-panteon-ingles',
      name: 'Panteon Ingles',
      type: 'circle',
      centerLat: 20.1455,
      centerLng: -98.6678,
      radiusMeters: 150,
      description: 'Cementerio historico',
      risk: 'low',
    },
    {
      id: 'rdm-penas-cargadas',
      name: 'Penas Cargadas',
      type: 'circle',
      centerLat: 20.15,
      centerLng: -98.66,
      radiusMeters: 300,
      description: 'Zona de miradores naturales',
      risk: 'medium',
    },
    {
      id: 'rdm-plaza-principal',
      name: 'Plaza Principal',
      type: 'circle',
      centerLat: 20.1386,
      centerLng: -98.6707,
      radiusMeters: 100,
      description: 'Corazon del pueblo',
      risk: 'low',
    },
    {
      id: 'rdm-calle-hidalgo',
      name: 'Calle Hidalgo',
      type: 'bbox',
      boundingBox: { minLat: 20.139, maxLat: 20.142, minLng: -98.669, maxLng: -98.667 },
      radiusMeters: 150,
      description: 'Eje comercial principal',
      risk: 'low',
    },
  ]);
}
