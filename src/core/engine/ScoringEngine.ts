import { logger } from "@/lib/logger";
/**
 * RDM Digital - Motor de Scoring GEN-7+
 * Sistema de reglas desacopladas para decision territorial
 */

import type {
  TuristaEstado,
  ScoringContext,
  ScoreRule,
  ScoreBreakdown,
  ThresholdConfig,
  DecisionLevel,
  RetentionIntent,
  TouristPattern,
} from '../models';

// ============================================================================
// REGLAS DE SCORING PREDEFINIDAS
// ============================================================================

/**
 * Regla: Proximidad a salida
 * Puntuacion alta cuando el turista esta cerca de un punto de salida
 */
export const proximityToExitRule: ScoreRule = {
  id: 'proximity_to_exit',
  name: 'Proximidad a Salida',
  weight: 0.35,
  evaluate: (_state, context) => {
    const distance = context.distanceToNearestExit;
    // Menos de 50m = 1.0, mas de 500m = 0.0
    if (distance < 50) return 1.0;
    if (distance > 500) return 0.0;
    return 1 - (distance - 50) / 450;
  },
};

/**
 * Regla: Velocidad de movimiento
 * Velocidad alta indica intencion de salir
 */
export const movementSpeedRule: ScoreRule = {
  id: 'movement_speed',
  name: 'Velocidad de Movimiento',
  weight: 0.2,
  evaluate: (_state, context) => {
    const speed = context.speedMps;
    // Caminar rapido (>1.5 m/s) = alta probabilidad de salir
    if (speed < 0.5) return 0.0; // Casi estatico
    if (speed > 2.0) return 1.0; // Caminando rapido
    return (speed - 0.5) / 1.5;
  },
};

/**
 * Regla: Inactividad
 * Alta inactividad puede indicar perdida de interes
 */
export const inactivityRule: ScoreRule = {
  id: 'inactivity',
  name: 'Inactividad',
  weight: 0.15,
  evaluate: (_state, context) => {
    const mins = context.inactivityMinutes;
    // Mas de 30 mins inactivo = puntuacion maxima
    if (mins < 5) return 0.0;
    if (mins > 30) return 1.0;
    return (mins - 5) / 25;
  },
};

/**
 * Regla: Duracion de visita corta
 * Visitas muy cortas pueden indicar salida prematura
 */
export const shortVisitRule: ScoreRule = {
  id: 'short_visit',
  name: 'Visita Corta',
  weight: 0.15,
  evaluate: (_state, context) => {
    const hours = context.visitDurationHours;
    // Menos de 1 hora = alta probabilidad de salida prematura
    if (hours < 0.5) return 1.0;
    if (hours > 3) return 0.0;
    return 1 - (hours - 0.5) / 2.5;
  },
};

/**
 * Regla: POIs cercanos no visitados
 * Si hay POIs cercanos, hay oportunidad de retencion
 */
export const nearbyPOIsRule: ScoreRule = {
  id: 'nearby_pois',
  name: 'POIs Cercanos',
  weight: 0.1,
  evaluate: (_state, context) => {
    const pois = context.nearbyPOIs.length;
    // Si hay POIs cercanos, menor urgencia de intervencion
    if (pois === 0) return 0.8;
    if (pois >= 5) return 0.0;
    return 0.8 - (pois * 0.16);
  },
};

/**
 * Regla: Saturacion de zona
 * Alta saturacion puede indicar necesidad de redistribucion
 */
export const zoneSaturationRule: ScoreRule = {
  id: 'zone_saturation',
  name: 'Saturacion de Zona',
  weight: 0.05,
  evaluate: (_state, context) => {
    const saturation = context.currentZoneSaturation;
    // Alta saturacion = redirigir
    return Math.min(1, saturation);
  },
};

// ============================================================================
// CONJUNTO DE REGLAS POR DEFECTO
// ============================================================================

export const DEFAULT_RULES: ScoreRule[] = [
  proximityToExitRule,
  movementSpeedRule,
  inactivityRule,
  shortVisitRule,
  nearbyPOIsRule,
  zoneSaturationRule,
];

// ============================================================================
// MOTOR DE SCORING
// ============================================================================

export class ScoringEngine {
  private rules: ScoreRule[];
  private thresholds: ThresholdConfig;

  constructor(
    rules: ScoreRule[] = DEFAULT_RULES,
    thresholds: ThresholdConfig = { critical: 0.7, alert: 0.5, info: 0.3 }
  ) {
    this.rules = rules;
    this.thresholds = thresholds;
    this.validateWeights();
  }

  private validateWeights(): void {
    const totalWeight = this.rules.reduce((sum, r) => sum + r.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      logger.warn(
        `[ScoringEngine] Pesos no suman 1.0 (actual: ${totalWeight}). Normalizando...`
      );
      // Normalizar pesos
      this.rules = this.rules.map(r => ({
        ...r,
        weight: r.weight / totalWeight,
      }));
    }
  }

  /**
   * Evalua todas las reglas y calcula el score final
   */
  evaluate(state: TuristaEstado, context: ScoringContext): ScoreBreakdown {
    const factors: Record<string, number> = {};
    let total = 0;

    for (const rule of this.rules) {
      const rawScore = rule.evaluate(state, context);
      const weightedScore = rawScore * rule.weight;
      factors[rule.id] = rawScore;
      total += weightedScore;
    }

    // Calcular confianza basada en la varianza de los factores
    const values = Object.values(factors);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const confidence = Math.max(0.5, 1 - Math.sqrt(variance));

    return {
      total: Math.min(1, Math.max(0, total)),
      factors,
      confidence,
    };
  }

  /**
   * Determina el nivel de decision basado en el score
   */
  determineLevel(score: number): DecisionLevel {
    if (score >= this.thresholds.critical) return 'CRITICO';
    if (score >= this.thresholds.alert) return 'ALERTA';
    if (score >= this.thresholds.info) return 'INFO';
    return 'SUGERENCIA';
  }

  /**
   * Determina la intencion de retencion basada en el contexto
   */
  determineIntent(
    score: ScoreBreakdown,
    context: ScoringContext
  ): RetentionIntent {
    const { factors } = score;

    // Si esta muy cerca de la salida y moviéndose rapido
    if (factors.proximity_to_exit > 0.8 && factors.movement_speed > 0.6) {
      return 'SAFE_EXIT';
    }

    // Si hay POIs cercanos y visita corta
    if (factors.short_visit > 0.5 && context.nearbyPOIs.length > 0) {
      return 'UPSELL';
    }

    // Si esta inactivo pero no cerca de salida
    if (factors.inactivity > 0.5 && factors.proximity_to_exit < 0.3) {
      return 'ENGAGEMENT';
    }

    // Si la visita es larga y hay oportunidades
    if (factors.short_visit < 0.3 && context.nearbyPOIs.length > 2) {
      return 'DISCOVERY';
    }

    return 'RETENTION';
  }

  /**
   * Determina el patron de comportamiento del turista
   */
  determinePattern(
    score: ScoreBreakdown,
    context: ScoringContext
  ): TouristPattern {
    const { factors } = score;

    if (factors.proximity_to_exit > 0.6 && factors.movement_speed > 0.4) {
      return 'EXITING';
    }

    if (factors.inactivity > 0.6) {
      return 'IDLE';
    }

    if (factors.movement_speed > 0.3 && factors.inactivity < 0.3) {
      return 'EXPLORING';
    }

    if (context.visitDurationHours > 2 && factors.short_visit < 0.2) {
      return 'LINGERING';
    }

    return 'RETURNING';
  }

  /**
   * Agrega una regla personalizada
   */
  addRule(rule: ScoreRule): void {
    this.rules.push(rule);
    this.validateWeights();
  }

  /**
   * Obtiene los thresholds actuales
   */
  getThresholds(): ThresholdConfig {
    return { ...this.thresholds };
  }

  /**
   * Actualiza los thresholds
   */
  setThresholds(thresholds: Partial<ThresholdConfig>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Obtiene las reglas actuales
   */
  getRules(): ScoreRule[] {
    return [...this.rules];
  }
}

// Instancia por defecto exportada
export const defaultScoringEngine = new ScoringEngine();
