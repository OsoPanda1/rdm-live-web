/**
 * RDM Digital - Orquestador de Experiencias GEN-7+
 * Orquestacion determinista con reloj inyectable y throttling
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  TuristaEstado,
  IsabellaDecision,
  ExitPoint,
  PointOfInterest,
  ScoringContext,
  OrchestratorConfig,
  BusEvent,
  Coordenadas,
} from '../models';
import { GeoLRUCache, MovementFilter, findNearestPoint, filterPointsInRadius, calculateSpeed, withinBBox } from '../geo';
import { ScoringEngine, defaultScoringEngine } from '../engine/ScoringEngine';
import { logger } from "@/lib/logger";
import {
  isabellaTerritorialDecisionLatencyMs,
  decisionScore,
  decisionsEmittedTotal,
  isabellaGeoLruSize,
  streamConnections,
  eventsDroppedTotal,
  eventQueueSize,
  sanitizeTerritory,
} from '../metrics/prometheus';

// ============================================================================
// TIPOS DE RELOJ (INYECTABLE)
// ============================================================================

export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class FixedClock implements Clock {
  constructor(private readonly fixedTime: Date) {}
  now(): Date {
    return new Date(this.fixedTime);
  }
  advance(ms: number): void {
    this.fixedTime.setTime(this.fixedTime.getTime() + ms);
  }
}

// ============================================================================
// EVENT BUS CON BACKPRESSURE
// ============================================================================

export class EventBus {
  private queue: BusEvent[] = [];
  private listeners: Set<(event: BusEvent) => void> = new Set();
  private readonly maxQueueSize: number;

  constructor(maxQueueSize = 1000) {
    this.maxQueueSize = maxQueueSize;
  }

  emit<T>(channel: string, payload: T, priority: BusEvent['priority'] = 'normal', traceId?: string): boolean {
    if (this.queue.length >= this.maxQueueSize) {
      eventsDroppedTotal.inc({ channel, reason: 'backpressure' });
      return false;
    }

    const event: BusEvent<T> = {
      id: uuidv4(),
      channel,
      payload,
      timestamp: new Date(),
      traceId,
      priority,
    };

    // Insertar segun prioridad
    if (priority === 'critical') {
      this.queue.unshift(event);
    } else {
      this.queue.push(event);
    }

    eventQueueSize.set(this.queue.length);

    // Notificar listeners
    for (const listener of this.listeners) {
      try {
        listener(event as BusEvent);
      } catch (error) {
        logger.error('[EventBus] Error en listener:', error);
      }
    }

    return true;
  }

  subscribe(listener: (event: BusEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  drain(): BusEvent[] {
    const events = [...this.queue];
    this.queue = [];
    eventQueueSize.set(0);
    return events;
  }

  get size(): number {
    return this.queue.length;
  }
}

// ============================================================================
// ORQUESTADOR DE EXPERIENCIAS
// ============================================================================

export class ExperienceOrchestrator {
  private readonly geoCache: GeoLRUCache;
  private readonly movementFilters: Map<string, MovementFilter> = new Map();
  private readonly lastDecisionTime: Map<string, number> = new Map();
  private readonly scoringEngine: ScoringEngine;
  private readonly eventBus: EventBus;
  private readonly clock: Clock;
  private readonly config: OrchestratorConfig;

  // Datos de referencia
  private exitPoints: ExitPoint[] = [];
  private pointsOfInterest: PointOfInterest[] = [];
  private zoneSaturations: Map<string, number> = new Map();

  constructor(
    config: Partial<OrchestratorConfig> = {},
    clock: Clock = new SystemClock(),
    scoringEngine: ScoringEngine = defaultScoringEngine
  ) {
    this.config = {
      throttleWindowMs: 60000, // 1 minuto entre decisiones por turista
      minScoreThreshold: 0.4,
      maxQueueSize: 1000,
      heartbeatIntervalMs: 25000,
      enableSSE: true,
      enableMetrics: true,
      ...config,
    };

    this.clock = clock;
    this.scoringEngine = scoringEngine;
    this.eventBus = new EventBus(this.config.maxQueueSize);
    this.geoCache = new GeoLRUCache({ maxSize: 10000, ttlMs: 300000 }); // 5 min TTL

    // Inicializar puntos de salida por defecto (Real del Monte)
    this.initDefaultExitPoints();
    this.initDefaultPOIs();
  }

  private initDefaultExitPoints(): void {
    this.exitPoints = [
      {
        id: 'exit_main',
        name: 'Salida Principal - Plaza Central',
        coords: { lat: 20.1386, lng: -98.6707 },
        type: 'main',
        boundingBox: { minLat: 20.1376, maxLat: 20.1396, minLng: -98.6717, maxLng: -98.6697 },
      },
      {
        id: 'exit_mina',
        name: 'Salida Mina de Acosta',
        coords: { lat: 20.1396, lng: -98.6761 },
        type: 'secondary',
        boundingBox: { minLat: 20.1386, maxLat: 20.1406, minLng: -98.6771, maxLng: -98.6751 },
      },
      {
        id: 'exit_panteon',
        name: 'Salida Panteon Ingles',
        coords: { lat: 20.137, lng: -98.67 },
        type: 'secondary',
        boundingBox: { minLat: 20.136, maxLat: 20.138, minLng: -98.671, maxLng: -98.669 },
      },
    ];
  }

  private initDefaultPOIs(): void {
    this.pointsOfInterest = [
      { id: '1', name: 'Mina de Acosta', category: 'historia', coords: { lat: 20.138, lng: -98.671 }, rating: 4.8, description: 'Mina historica del siglo XVIII' },
      { id: '2', name: 'Museo de Medicina Laboral', category: 'cultura', coords: { lat: 20.139, lng: -98.673 }, rating: 4.6, description: 'Historia medica de los mineros' },
      { id: '3', name: 'Panteon Ingles', category: 'historia', coords: { lat: 20.137, lng: -98.67 }, rating: 4.9, description: 'Cementerio historico britanico' },
      { id: '4', name: 'Pastes El Portal', category: 'gastronomia', coords: { lat: 20.14, lng: -98.672 }, rating: 4.7, description: 'Pastes tradicionales cornish' },
      { id: '5', name: 'Pastes Kikos', category: 'gastronomia', coords: { lat: 20.139, lng: -98.674 }, rating: 4.5, description: 'Pastes artesanales desde 1940' },
      { id: '6', name: 'Hotel Real del Monte', category: 'hospedaje', coords: { lat: 20.141, lng: -98.675 }, rating: 4.3, description: 'Hospedaje colonial' },
      { id: '7', name: 'Pena del Cuervo', category: 'aventura', coords: { lat: 20.135, lng: -98.668 }, rating: 4.8, description: 'Mirador natural' },
      { id: '8', name: 'Iglesia de la Asuncion', category: 'cultura', coords: { lat: 20.14, lng: -98.671 }, rating: 4.6, description: 'Templo del siglo XVIII' },
      { id: '9', name: 'Centro Cultural Nicolas Zavala', category: 'cultura', coords: { lat: 20.138, lng: -98.672 }, rating: 4.4, description: 'Galeria de arte' },
      { id: '10', name: 'Sendero de las Minas', category: 'aventura', coords: { lat: 20.136, lng: -98.669 }, rating: 4.7, description: 'Recorrido por antiguas minas' },
    ];
  }

  /**
   * Evalua el estado de un turista y decide si emitir una decision
   */
  evaluar(state: TuristaEstado): IsabellaDecision | null {
    const startTime = this.clock.now().getTime();
    const traceId = uuidv4();

    // Throttling por turista
    const lastTime = this.lastDecisionTime.get(state.id);
    if (lastTime && startTime - lastTime < this.config.throttleWindowMs) {
      return null;
    }

    // Calcular distancia a salida mas cercana
    const nearestExit = this.findNearestExit(state.coords);
    if (!nearestExit) return null;

    // Calcular velocidad suavizada
    const speed = this.calculateSmoothedSpeed(state);

    // Calcular inactividad
    const inactivityMinutes = this.calculateInactivity(state);

    // Encontrar POIs cercanos (500m)
    const nearbyPOIs = filterPointsInRadius(
      state.coords,
      this.pointsOfInterest,
      500,
      this.geoCache
    ).map(r => r.point);

    // Obtener saturacion de zona
    const zoneSaturation = this.zoneSaturations.get(state.territory ?? 'RDM') ?? 0;

    // Construir contexto de scoring
    const context: ScoringContext = {
      distanceToNearestExit: nearestExit.distance,
      speedMps: speed,
      inactivityMinutes,
      visitDurationHours: state.stayTimeHours,
      nearbyPOIs,
      currentZoneSaturation: zoneSaturation,
    };

    // Evaluar score
    const score = this.scoringEngine.evaluate(state, context);

    // Registrar metricas
    if (this.config.enableMetrics) {
      decisionScore.observe(score.total);
    }

    // Verificar umbral
    if (score.total < this.config.minScoreThreshold) {
      return null;
    }

    // Determinar nivel, intent y patron
    const level = this.scoringEngine.determineLevel(score.total);
    const retentionIntent = this.scoringEngine.determineIntent(score, context);
    const pattern = this.scoringEngine.determinePattern(score, context);

    // Construir decision
    const decision: IsabellaDecision = {
      traceId,
      territory: sanitizeTerritory(state.territory ?? 'RDM'),
      level,
      retentionIntent,
      score,
      pattern,
      distanceToExit: nearestExit.distance,
      speedMps: speed,
      coords: state.coords,
      timestamp: this.clock.now(),
      payload: this.buildPayload(retentionIntent, pattern, nearbyPOIs),
    };

    // Actualizar ultimo tiempo de decision
    this.lastDecisionTime.set(state.id, startTime);

    // Emitir al bus
    this.eventBus.emit('ISABELLA_DECISION', decision, level === 'CRITICO' ? 'critical' : 'normal', traceId);

    // Registrar latencia
    if (this.config.enableMetrics) {
      const latency = this.clock.now().getTime() - startTime;
      isabellaTerritorialDecisionLatencyMs.observe(latency);
      decisionsEmittedTotal.inc({ territory: decision.territory, level, intent: retentionIntent });
      isabellaGeoLruSize.set(this.geoCache.size);
    }

    return decision;
  }

  private findNearestExit(coords: Coordenadas): { point: ExitPoint; distance: number } | null {
    // Primero filtrar por BBox para optimizacion
    const candidateExits = this.exitPoints.filter(exit => {
      // Crear BBox ampliado para busqueda inicial
      const expandedBBox = {
        minLat: exit.boundingBox.minLat - 0.01,
        maxLat: exit.boundingBox.maxLat + 0.01,
        minLng: exit.boundingBox.minLng - 0.01,
        maxLng: exit.boundingBox.maxLng + 0.01,
      };
      return withinBBox(coords, expandedBBox) || true; // Por ahora evaluar todos
    });

    return findNearestPoint(coords, candidateExits, this.geoCache);
  }

  private calculateSmoothedSpeed(state: TuristaEstado): number {
    if (!state.prevCoords) return 0;

    // Obtener o crear filtro de movimiento
    let filter = this.movementFilters.get(state.id);
    if (!filter) {
      filter = new MovementFilter(0.3);
      this.movementFilters.set(state.id, filter);
    }

    // Calcular tiempo delta (asumiendo 5 segundos si no hay timestamp previo)
    const timeDeltaMs = state.activityTimestamps.lastMovementAt
      ? this.clock.now().getTime() - state.activityTimestamps.lastMovementAt.getTime()
      : 5000;

    const rawSpeed = calculateSpeed(state.prevCoords, state.coords, timeDeltaMs, this.geoCache);
    return filter.smooth(rawSpeed);
  }

  private calculateInactivity(state: TuristaEstado): number {
    const lastInteraction = state.activityTimestamps.lastInteractionAt;
    const now = this.clock.now();
    return (now.getTime() - lastInteraction.getTime()) / 60000; // minutos
  }

  private buildPayload(
    intent: IsabellaDecision['retentionIntent'],
    pattern: IsabellaDecision['pattern'],
    nearbyPOIs: PointOfInterest[]
  ): IsabellaDecision['payload'] {
    const suggestedPOI = nearbyPOIs[0];

    const messages: Record<IsabellaDecision['retentionIntent'], { titulo: string; mensaje: string }> = {
      SAFE_EXIT: {
        titulo: 'Salida Segura',
        mensaje: 'Te acompano con una salida segura: caminemos por rutas visibles con paradas culturales breves.',
      },
      UPSELL: {
        titulo: 'Experiencia Premium',
        mensaje: 'Antes de irte, te propongo una experiencia de alto valor cerca de ti.',
      },
      DISCOVERY: {
        titulo: 'Descubre Mas',
        mensaje: 'Modo descubrimiento activo: tengo opciones cercanas con equilibrio entre historia, paisaje y gastronomia.',
      },
      RETENTION: {
        titulo: 'Quédate un Poco Mas',
        mensaje: 'Hay algo especial cerca que no querras perderte.',
      },
      ENGAGEMENT: {
        titulo: 'Momento Perfecto',
        mensaje: 'Este es el momento perfecto para una experiencia unica.',
      },
    };

    const { titulo, mensaje } = messages[intent];

    return {
      titulo,
      mensaje,
      ruta_ar_activada: intent === 'DISCOVERY' || pattern === 'EXPLORING',
      experiencia_sugerida: suggestedPOI?.name,
      federacion_destino: suggestedPOI?.federacion ?? this.mapCategoryToFederation(suggestedPOI?.category),
    };
  }

  private mapCategoryToFederation(category?: string): string {
    const mapping: Record<string, string> = {
      gastronomia: 'FED_GASTRONOMIA',
      hospedaje: 'FED_HOSPEDAJE',
      historia: 'FED_TURISMO',
      aventura: 'FED_TURISMO',
      cultura: 'FED_TURISMO',
      comercio: 'FED_COMERCIO',
    };
    return category ? mapping[category] ?? 'FED_TURISMO' : 'FED_TURISMO';
  }

  // ============================================================================
  // METODOS PUBLICOS DE CONFIGURACION
  // ============================================================================

  setExitPoints(exits: ExitPoint[]): void {
    this.exitPoints = exits;
  }

  setPointsOfInterest(pois: PointOfInterest[]): void {
    this.pointsOfInterest = pois;
  }

  updateZoneSaturation(zone: string, saturation: number): void {
    this.zoneSaturations.set(zone, Math.min(1, Math.max(0, saturation)));
  }

  getEventBus(): EventBus {
    return this.eventBus;
  }

  getGeoCache(): GeoLRUCache {
    return this.geoCache;
  }

  subscribeToDecisions(callback: (decision: IsabellaDecision) => void): () => void {
    return this.eventBus.subscribe((event) => {
      if (event.channel === 'ISABELLA_DECISION') {
        callback(event.payload as IsabellaDecision);
      }
    });
  }

  /**
   * Limpia recursos para el turista especificado
   */
  cleanupTourist(turistaId: string): void {
    this.movementFilters.delete(turistaId);
    this.lastDecisionTime.delete(turistaId);
  }

  /**
   * Obtiene estadisticas del orquestador
   */
  getStats(): {
    geoCacheSize: number;
    geoCacheCapacity: number;
    activeFilters: number;
    eventQueueSize: number;
    exitPointsCount: number;
    poisCount: number;
  } {
    return {
      geoCacheSize: this.geoCache.size,
      geoCacheCapacity: this.geoCache.capacity,
      activeFilters: this.movementFilters.size,
      eventQueueSize: this.eventBus.size,
      exitPointsCount: this.exitPoints.length,
      poisCount: this.pointsOfInterest.length,
    };
  }
}

// Instancia singleton por defecto
export const orchestrator = new ExperienceOrchestrator();
