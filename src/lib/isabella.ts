/**
 * RDM Digital - Fachada Isabella GEN-7+
 * API unificada para interactuar con el sistema de inteligencia territorial
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  TuristaEstado,
  IsabellaDecision,
  Coordenadas,
  KernelOutput,
} from '@/core/models';
import { orchestrator, ExperienceOrchestrator } from '@/core/orchestrator/ExperienceOrchestrator';
import { runRealitoKernel, getSystemMetrics, getAllPlaces } from './kernel';
import {
  applyDecisionToHeptafederation,
  getGlobalHealth,
  getTelemetry,
  getFederationStats,
} from './heptafederation';

// ============================================================================
// TIPOS DE LA FACHADA
// ============================================================================

export interface IsabellaContext {
  turistaId: string;
  coords: Coordenadas;
  sessionStartTime: Date;
  lastInteraction: Date;
  query?: string;
}

export interface IsabellaResponse {
  decision: IsabellaDecision | null;
  kernel: KernelOutput | null;
  federationHealth: number;
  systemMetrics: ReturnType<typeof getSystemMetrics>;
  telemetry: ReturnType<typeof getTelemetry>;
}

// ============================================================================
// FACHADA PRINCIPAL
// ============================================================================

/**
 * Evalua el estado de un turista y genera respuesta completa
 */
export async function evaluarTurista(context: IsabellaContext): Promise<IsabellaResponse> {
  // Construir estado del turista
  const state: TuristaEstado = {
    id: context.turistaId,
    territory: 'RDM',
    coords: context.coords,
    stayTimeHours: (Date.now() - context.sessionStartTime.getTime()) / 3600000,
    activityTimestamps: {
      lastInteractionAt: context.lastInteraction,
      firstSeenAt: context.sessionStartTime,
      lastMovementAt: new Date(),
    },
  };

  // Evaluar con el orquestador
  const decision = orchestrator.evaluar(state);

  // Aplicar decision a la federacion
  if (decision) {
    applyDecisionToHeptafederation(decision);
  }

  // Ejecutar kernel si hay query
  let kernel: KernelOutput | null = null;
  if (context.query) {
    kernel = runRealitoKernel(context.query, decision ?? undefined);
  }

  return {
    decision,
    kernel,
    federationHealth: getGlobalHealth(),
    systemMetrics: getSystemMetrics(),
    telemetry: getTelemetry(),
  };
}

/**
 * Procesa un mensaje de chat y genera respuesta contextual
 */
export async function procesarMensaje(
  message: string,
  turistaId?: string,
  coords?: Coordenadas
): Promise<{
  respuesta: string;
  recomendaciones: KernelOutput['recommendations'];
  decision?: IsabellaDecision;
}> {
  const kernel = runRealitoKernel(message);

  let decision: IsabellaDecision | undefined;

  // Si tenemos contexto de ubicacion, evaluar decision
  if (turistaId && coords) {
    const context: IsabellaContext = {
      turistaId,
      coords,
      sessionStartTime: new Date(Date.now() - 3600000), // Asume 1 hora de sesion
      lastInteraction: new Date(),
      query: message,
    };

    const response = await evaluarTurista(context);
    decision = response.decision ?? undefined;
  }

  // Construir respuesta
  const respuesta = construirRespuesta(kernel, decision);

  return {
    respuesta,
    recomendaciones: kernel.recommendations,
    decision,
  };
}

function construirRespuesta(kernel: KernelOutput, decision?: IsabellaDecision): string {
  let response = kernel.narrative;

  // Agregar recomendaciones si hay
  if (kernel.recommendations.length > 0) {
    const lugares = kernel.recommendations
      .map(r => `- ${r.name} (${r.rating}/5)`)
      .join('\n');
    response += `\n\nTe recomiendo:\n${lugares}`;
  }

  // Agregar contexto de decision si existe
  if (decision) {
    response += `\n\n${decision.payload.mensaje}`;
    if (decision.payload.experiencia_sugerida) {
      response += ` Te sugiero visitar: ${decision.payload.experiencia_sugerida}.`;
    }
  }

  return response;
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Registra feedback de usuario sobre una decision
 */
export function registrarFeedback(
  decisionTraceId: string,
  rating: number,
  feedback?: string,
  consentimiento?: boolean
): void {
  console.log('[Isabella] Feedback registrado:', {
    traceId: decisionTraceId,
    rating,
    feedback,
    consentimiento,
    timestamp: new Date().toISOString(),
  });

  // TODO: Persistir en base de datos
}

/**
 * Obtiene el estado actual del sistema
 */
export function getSystemStatus(): {
  orchestratorStats: ReturnType<ExperienceOrchestrator['getStats']>;
  federationStats: ReturnType<typeof getFederationStats>;
  systemMetrics: ReturnType<typeof getSystemMetrics>;
  placesCount: number;
} {
  return {
    orchestratorStats: orchestrator.getStats(),
    federationStats: getFederationStats(),
    systemMetrics: getSystemMetrics(),
    placesCount: getAllPlaces().length,
  };
}

/**
 * Suscribe a decisiones en tiempo real
 */
export function suscribirDecisiones(
  callback: (decision: IsabellaDecision) => void
): () => void {
  return orchestrator.subscribeToDecisions(callback);
}

/**
 * Actualiza la saturacion de una zona
 */
export function actualizarSaturacionZona(zona: string, saturacion: number): void {
  orchestrator.updateZoneSaturation(zona, saturacion);
}

/**
 * Genera un ID de sesion para un turista
 */
export function generarSesionTurista(): string {
  return `TURISTA_${uuidv4().slice(0, 8).toUpperCase()}`;
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export {
  orchestrator,
  runRealitoKernel,
  getSystemMetrics,
  getAllPlaces,
  getGlobalHealth,
  getTelemetry,
  getFederationStats,
};

export type {
  TuristaEstado,
  IsabellaDecision,
  KernelOutput,
  Coordenadas,
};
