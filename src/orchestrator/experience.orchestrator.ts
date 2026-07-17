import { MovementFilter } from "@/core/behavior/movement.filter";
import { detectMovementPattern } from "@/core/behavior/pattern.detector";
import { createTraceId } from "@/core/context/trace";
import { type IClock, Clock } from "@/core/engine/deterministic-clock";
import { ScoringEngine } from "@/core/engine/scoring.engine";
import { withinBBox } from "@/core/geo";
import { fastDistance } from "@/core/geo";
import { GeoLRUCache } from "@/core/geo";
import { bus, type EventBus } from "@/core/infra/event-bus";
import type { Coordenadas, BoundingBox, IsabellaDecision, RetentionIntent, TuristaEstado, ScoreBreakdown } from "@/core/models";

interface OrchestratorOptions {
  cacheCapacity?: number;
  cacheTtlMs?: number;
  movementAlpha?: number;
  clock?: IClock;
  engine?: ScoringEngine;
  eventBus?: EventBus;
  throttleMs?: number;
  proximityBBoxMeters?: number;
  threshold?: number;
}

interface SpatialEntry {
  id: string;
  coords: Coordenadas;
}

class LinearSpatialIndex {
  private entries: SpatialEntry[] = [];

  upsert(entry: SpatialEntry): void {
    const idx = this.entries.findIndex(e => e.id === entry.id);
    if (idx >= 0) this.entries[idx] = entry;
    else this.entries.push(entry);
  }

  nearest(coords: Coordenadas): SpatialEntry | null {
    let nearest: SpatialEntry | null = null;
    let minDist = Infinity;
    for (const entry of this.entries) {
      const dist = fastDistance(coords, entry.coords);
      if (dist < minDist) {
        minDist = dist;
        nearest = entry;
      }
    }
    return nearest;
  }
}

export class ExperienceOrchestrator {
  private cache: GeoLRUCache;
  private movement: MovementFilter;
  private clock: IClock;
  private engine: ScoringEngine;
  private eventBus: EventBus;
  private throttleMs: number;
  private proximityBBoxMeters: number;
  private threshold: number;
  private lastDecisionAt = new Map<string, number>();
  private exitIndex = new LinearSpatialIndex();

  constructor(
    private exits: Coordenadas[],
    options: OrchestratorOptions = {},
  ) {
    this.clock = options.clock ?? new Clock();
    this.engine = options.engine ?? new ScoringEngine();
    this.eventBus = options.eventBus ?? bus;
    this.cache = new GeoLRUCache({
      maxSize: options.cacheCapacity ?? 5000,
      ttlMs: options.cacheTtlMs ?? 30_000,
    });
    this.movement = new MovementFilter(options.movementAlpha ?? 0.3);
    this.throttleMs = options.throttleMs ?? 45_000;
    this.proximityBBoxMeters = options.proximityBBoxMeters ?? 300;
    this.threshold = options.threshold ?? 40;

    this.exits.forEach((exit, idx) => {
      this.exitIndex.upsert({ id: `exit-${idx}`, coords: exit });
    });
  }

  allowExecution(touristId: string, windowMs = this.throttleMs): boolean {
    const now = this.clock.now();
    const previous = this.lastDecisionAt.get(touristId);
    if (!previous) return true;
    return now - previous >= windowMs;
  }

  evaluar(t: TuristaEstado): IsabellaDecision | null {
    const started = this.clock.now();
    if (!this.allowExecution(t.id, this.throttleMs)) {
      return null;
    }

    const traceId = createTraceId();

    const nearest = this.getNearestExit(t.coords);
    if (!nearest || !withinBBox(t.coords, nearest as unknown as BoundingBox)) {
      return null;
    }

    const dist = fastDistance(t.coords, nearest);

    const rawSpeed = t.prevCoords ? fastDistance(t.prevCoords, t.coords) / 5 : 0;
    const speed = this.movement.update(rawSpeed);

    const inactivity = (started - t.activityTimestamps.lastInteractionAt.getTime()) / 60_000;

    const score = this.engine.evaluar({
      distanceToExit: dist,
      stayTimeHours: t.stayTimeHours,
      inactivityMinutes: inactivity,
      speedMps: speed,
    });

    if (score.total < this.threshold) {
      return null;
    }

    const pattern = detectMovementPattern({ speedMps: speed, distanceToExit: dist });
    const retentionIntent = this.resolveIntent(score.total, pattern);

    const fullScore: ScoreBreakdown = {
      total: score.total / 100,
      factors: score.factors,
      confidence: 0.7,
    };

    const decision: IsabellaDecision = {
      traceId,
      territory: t.territory ?? "RDM",
      level: score.total >= 70 ? "CRITICO" : "ALERTA",
      retentionIntent,
      pattern,
      distanceToExit: dist,
      speedMps: speed,
      coords: t.coords,
      timestamp: new Date(this.clock.now()),
      score: fullScore,
      payload: {
        titulo: retentionIntent === "SAFE_EXIT" ? "Salida segura sugerida" : "Experiencia desbloqueada",
        mensaje:
          retentionIntent === "UPSELL"
            ? "Ultima experiencia local disponible antes de salir"
            : retentionIntent === "DISCOVERY"
              ? "Ruta exploratoria activada cerca de ti"
              : "Te guiamos por una salida segura y cultural",
        ruta_ar_activada: true,
      },
    };

    this.lastDecisionAt.set(t.id, started);
    this.eventBus.emit("isabella:decision", decision);

    return decision;
  }

  private resolveIntent(totalScore: number, pattern: string): RetentionIntent {
    if (totalScore >= 80 || pattern === "EXITING") return "SAFE_EXIT";
    if (totalScore >= 55) return "UPSELL";
    return "DISCOVERY";
  }

  private getNearestExit(coords: Coordenadas): Coordenadas | null {
    return this.exitIndex.nearest(coords)?.coords ?? null;
  }
}
