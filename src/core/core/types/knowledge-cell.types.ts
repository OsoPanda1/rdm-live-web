/**
 * Knowledge Cell Types - Specialized Microservice Containers
 * Cada célula es una unidad desplegable, versionada y observable.
 *
 * Este modelo asume:
 * - Contrato de entrada/salida tipado.
 * - Ciclo de vida explícito (draft, active, deprecated, archived).
 * - Integración con federaciones TAMV y planos RDM.
 * - Operación como grafo (cells que se componen entre sí).
 */

import {
  FederationDomain,
  KernelLayer,
  RdmExperiencePlane,
} from "./federation.types";

// ============================================================================
// ENUMS BÁSICOS
// ============================================================================

/**
 * Tipos canónicos de Knowledge Cell.
 * Puedes extender esta lista según crezca el ecosistema.
 */
export type CellType =
  | "Render3D"
  | "Render4D"
  | "IA-ImmersiveFX"
  | "QuantumChannel"
  | "SensorMultiFX"
  | "APIIntegration"
  | "Analytics"
  | "UIControl"
  | "SpatialLogic"
  | "NarrativeEngine"
  | "TelemetryIngest"
  | "EconomyEngine"
  | "IdentityBridge";

/**
 * Estado de ciclo de vida de la célula.
 */
export type CellLifecycle = "draft" | "active" | "deprecated" | "archived";

/**
 * Nivel de criticidad operacional.
 */
export type CellCriticality =
  | "low"
  | "medium"
  | "high"
  | "mission_critical";

/**
 * Nivel de estabilidad de la API de la célula.
 */
export type CellStability = "experimental" | "beta" | "stable" | "legacy";

// ============================================================================
// CONTRATOS DE ENTRADA / SALIDA
// ============================================================================

/**
 * Representa el contrato de IO de una célula.
 * En implementación real esto podría mapear a Zod schemas o OpenAPI.
 */
export interface CellIOContract {
  /**
   * Descripción concisa del propósito de la célula.
   */
  summary: string;
  /**
   * Descripción del formato de entrada (ej: JSON schema, tipo lógico).
   */
  inputFormat: string;
  /**
   * Descripción del formato de salida.
   */
  outputFormat: string;
  /**
   * Ejemplos de payloads de entrada (para docs, pruebas, sandbox).
   */
  inputExamples?: unknown[];
  /**
   * Ejemplos de salida.
   */
  outputExamples?: unknown[];
}

// ============================================================================
// SLAs, OBSERVABILITY, SECURITY
// ============================================================================

/**
 * Atributos de confiabilidad esperados de la célula.
 */
export interface CellSLA {
  /**
   * Latencia esperada (p50/p95) en milisegundos.
   */
  expectedLatencyMs?: {
    p50?: number;
    p95?: number;
  };
  /**
   * Tasa máxima de error aceptable (0–1).
   */
  maxErrorRate?: number;
  /**
   * Ventana de evaluación de métricas (en segundos).
   */
  evaluationWindowSeconds?: number;
}

/**
 * Configuración para observabilidad de la célula.
 */
export interface CellObservabilityConfig {
  /**
   * Si true, emite eventos de tracing al Event Bus / Guardian Console.
   */
  emitTracingEvents: boolean;
  /**
   * Si true, registra métricas agregadas (latencia, errores).
   */
  collectMetrics: boolean;
  /**
   * Si true, incluye muestras de payload en logs (cuidar privacidad).
   */
  samplePayloads: boolean;
}

/**
 * Configuración de seguridad / privacidad.
 */
export interface CellSecurityConfig {
  /**
   * Si la célula puede recibir datos sensibles.
   */
  acceptsSensitiveData: boolean;
  /**
   * Si la célula debe aplicar anonimización (IP, IDs, etc.) antes de salir.
   */
  enforcesAnonymization: boolean;
  /**
   * Scopes / roles mínimos requeridos para invocarla.
   * Ejemplo: ["guardian", "admin", "commerce_owner"].
   */
  requiredScopes?: string[];
}

// ============================================================================
// KNOWLEDGE CELL CANÓNICA
// ============================================================================

export interface KnowledgeCell {
  /**
   * ID único y estable de la célula (ej: "rdm.render3d.atlas.v1").
   */
  id: string;

  /**
   * Tipo canónico de la célula (Render, Engine, Bridge, etc.).
   */
  type: CellType;

  /**
   * Descripción humana de alto nivel.
   */
  description: string;

  /**
   * Versión semántica (ej: "1.0.3").
   */
  version: string;

  /**
   * Compatibilidad hacia atrás (ej: ">=1.0.0 <2.0.0").
   * Útil para orquestadores de grafo.
   */
  compatibleWith?: string;

  /**
   * Dominio federado al que pertenece (tecnología, cultura, economía, etc.).
   */
  domain: FederationDomain;

  /**
   * Capa del kernel donde principalmente opera esta célula.
   */
  layer: KernelLayer;

  /**
   * Plano de experiencia con el que se relaciona
   * (turismo, institucional, técnico).
   */
  plane: RdmExperiencePlane;

  /**
   * Estado de ciclo de vida de la célula.
   */
  lifecycle: CellLifecycle;

  /**
   * Criticidad operacional (para priorizar despliegue/observabilidad).
   */
  criticality: CellCriticality;

  /**
   * Nivel de estabilidad de la API.
   */
  stability: CellStability;

  /**
   * Contrato de IO de la célula.
   */
  io: CellIOContract;

  /**
   * Lista de IDs de otras células de las que depende.
   */
  dependencies?: string[];

  /**
   * Prompt base que especializa la IA que habita esta célula,
   * en caso de que sea una célula cognitiva.
   */
  iaSpecializationPrompt?: string;

  /**
   * Endpoint API (path lógico) y URL de microservicio de esta célula.
   * - apiEndpoint: ruta interna (ej: "/cells/render3d/atlas").
   * - microserviceUrl: host/URL de despliegue (edge, lambda, etc.).
   */
  apiEndpoint: string;
  microserviceUrl: string;

  /**
   * Casos de prueba en formato libre (pueden referenciar scripts, IDs, etc.).
   */
  testCases: string[];

  /**
   * Muestra de visualización (ej: URL a un PNG, vídeo, XR, etc.).
   */
  visualizationSample?: string;

  /**
   * Información de autoría / procedencia.
   */
  author: string;
  created: Date;
  updated: Date;

  /**
   * Etiquetas libres para clasificación, búsqueda y navegación.
   */
  tags: string[];

  /**
   * Si la célula es visible/usable por el público general.
   */
  isPublic: boolean;

  /**
   * Domain-specific metadata para extender sin romper el contrato.
   */
  metadata?: Record<string, unknown>;

  /**
   * SLAs y configuración de observabilidad y seguridad.
   */
  sla?: CellSLA;
  observability?: CellObservabilityConfig;
  security?: CellSecurityConfig;
}

// ============================================================================
// KNOWLEDGE REPOSITORY (GRAFO DE CÉLULAS)
// ============================================================================

export type CellRelationType =
  | "requires"
  | "extends"
  | "composes"
  | "consumes";

/**
 * Relación entre células (grafos de conocimiento / pipelines).
 */
export interface CellRelation {
  from: string; // cellId
  to: string; // cellId
  relation: CellRelationType;
  /**
   * Peso/fortaleza de la relación (0–1).
   * Útil para orden de composición, recomendadores, etc.
   */
  weight?: number;
}

export interface KnowledgeRepository {
  /**
   * Células indexadas por ID.
   */
  cells: Record<string, KnowledgeCell>;

  /**
   * Relaciones entre células (grafo dirigido).
   */
  relations: CellRelation[];

  /**
   * Perfil de expertise de IA asociado a este repositorio
   * (ej: "Turismo territorial RDM + Gemelos 4D").
   */
  aiExpertiseProfile: string;

  /**
   * Versión del repositorio (no de las células individuales).
   */
  version: string;

  /**
   * Metadatos adicionales (ej: DOIs, enlaces a Zenodo, etc.).
   */
  metadata: Record<string, unknown>;
}

// ============================================================================
// CONTEXTO Y RESULTADOS DE EJECUCIÓN
// ============================================================================

/**
 * Contexto de ejecución de una célula.
 */
export interface CellExecutionContext<TInput = unknown> {
  cellId: string;
  input: TInput;

  /**
   * Tiempo máximo de ejecución permitido (ms).
   */
  timeout?: number;

  /**
   * Número máximo de reintentos ante fallos transitorios.
   */
  retries?: number;

  /**
   * ID de trazas (para correlación con el Event Bus / Guardian).
   */
  traceId?: string;

  /**
   * Contexto territorial opcional (ej: POI, ruta, plano).
   */
  plane?: RdmExperiencePlane;
  domain?: FederationDomain;
  layer?: KernelLayer;

  /**
   * Metadata contextual (usuario, sesión, idioma, etc.).
   */
  contextMeta?: Record<string, unknown>;
}

/**
 * Resultado de ejecución de una célula.
 */
export interface CellExecutionResult<TOutput = unknown> {
  cellId: string;
  success: boolean;
  output?: TOutput;
  error?: string;
  executionTimeMs: number;
  retryCount: number;

  /**
   * Registro de warnings no fatales
   * (ej: degradación de calidad visual, fallback de modelo).
   */
  warnings?: string[];

  /**
   * ID de trace para asociar a otros sistemas
   * (MSR, BookPi, Event Bus).
   */
  traceId?: string;
}
