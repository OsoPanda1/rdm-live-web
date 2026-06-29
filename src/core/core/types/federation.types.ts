/**
 * TAMV Federation Core Types - L0-L7
 * Architectural Foundation for Territorial & Multidimensional Awareness
 *
 * Estos tipos describen la ontología canónica del kernel MD‑X4 / LTOS.
 * No solo tipan datos: codifican cómo piensan las federaciones del sistema.
 */

// ============================================================================
// ENUMS BÁSICOS DE FEDERACIÓN Y CONTEXTO
// ============================================================================

/**
 * Federaciones soberanas del ecosistema TAMV / RDM.
 * Cada servicio, evento o decisión debe poder ubicarse en una de estas.
 */
export enum FederationDomain {
  TECHNOLOGY = "technology",
  CULTURE = "culture",
  GOVERNANCE = "governance",
  ECONOMY = "economy",
  EDUCATION = "education",
  HEALTH = "health",
  COMMUNICATION = "communication",
}

/**
 * Planos funcionales de la plataforma RDM Digital.
 * Se corresponden, por ejemplo, con las capas:
 *  - Plano 1: experiencia turística.
 *  - Plano 2: institucional.
 *  - Plano 3: documental / tecnológico.
 */
export enum RdmExperiencePlane {
  TOURISM = "tourism",
  INSTITUTIONAL = "institutional",
  TECHNICAL = "technical",
}

/**
 * Capas L0–L7 del kernel MD‑X4 / Heptafederado.
 */
export enum KernelLayer {
  L0_DOCTRINE_ETHICS = "L0_DOCTRINE_ETHICS",
  L1_MEMORY_REGISTRY = "L1_MEMORY_REGISTRY",
  L2_PROTOCOL_CONTROL = "L2_PROTOCOL_CONTROL",
  L3_GUARDIANSHIP = "L3_GUARDIANSHIP",
  L4_XR_SPATIAL = "L4_XR_SPATIAL",
  L5_DOMAIN_SERVICES = "L5_DOMAIN_SERVICES",
  L6_UX_SHELL = "L6_UX_SHELL",
  L7_CIVILIZATIONAL = "L7_CIVILIZATIONAL",
}

// ============================================================================
// L0: DOCTRINE & ETHICS
// ============================================================================

export enum EthicRiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Qué tipo de regla es (p.ej., protección de menores, datos sensibles, etc.).
 */
export enum EthicRuleCategory {
  PRIVACY = "privacy",
  SAFETY = "safety",
  ECONOMIC_FAIRNESS = "economic_fairness",
  CULTURAL_PRESERVATION = "cultural_preservation",
  GOVERNANCE = "governance",
  OTHER = "other",
}

/**
 * Comando de protocolo canonizado.
 * (Declarado aquí porque lo usan los validadores de ética.)
 */
export type ProtocolLifecycleState =
  | "received"
  | "validated"
  | "authorized"
  | "executed"
  | "reverted"
  | "rejected";

/**
 * Fuente principal que gatilló la decisión.
 */
export type DecisionSource =
  | "human_guardian"
  | "ai_recommendation"
  | "mixed"
  | "system";

/**
 * Comando de protocolo canonizado.
 * Puede venir de UX, IA, API externa o sistema.
 */
export interface ProtocolCommand {
  id: string;
  name: string;
  actorId: string;
  domain: FederationDomain;
  /**
   * Plano donde se originó el comando (turismo, institucional, técnico).
   */
  plane: RdmExperiencePlane;
  /**
   * Capa del kernel donde será principalmente procesado.
   */
  layer: KernelLayer;
  payload: Record<string, unknown>;
  timestamp: Date;
  priority?: number;
  /**
   * Referencia opcional a un contexto territorial (ruta, POI, etc.).
   */
  territorialContextId?: string;
}

export interface EthicRule {
  id: string;
  name: string;
  description: string;
  category: EthicRuleCategory;
  severity: EthicRiskLevel;
  /**
   * Dominio/federación para la cual aplica principalmente esta regla.
   */
  domain: FederationDomain;
  /**
   * Validador pura lógica: no debe tener side-effects.
   * Retorna true si el comando está permitido bajo esta regla.
   */
  validator: (command: ProtocolCommand) => boolean;
}

export interface EthicDecision {
  approved: boolean;
  risk: EthicRiskLevel;
  reasons: string[];
  /**
   * Lista de IDs de reglas violadas.
   */
  violations: string[];
  /**
   * Lista de reglas evaluadas (aprobadas o violadas) para trazabilidad.
   */
  evaluatedRules: string[];
}

// ============================================================================
// L1: MEMORY & REGISTRY (MSR + BookPi)
// ============================================================================

export type RegistryStatus =
  | "accepted"
  | "rejected"
  | "pending"
  | "cancelled";

/**
 * Evento canonizado en el registro (MSR).
 */
export interface RegistryEvent {
  id: string;
  commandId: string;
  actorId: string;
  timestamp: Date;
  risk: EthicRiskLevel;
  status: RegistryStatus;
  domain: FederationDomain;
  layer: KernelLayer;
  /**
   * Tags para facilitar búsquedas y agregaciones.
   * Ejemplo: ["donation", "commerce", "tourism-plane"].
   */
  tags: string[];
  metadata: Record<string, unknown>;
}

/**
 * Entrada narrativa (BookPi) asociada a eventos/decisiones.
 */
export interface NarrativeEntry {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  createdAt: Date;
  /**
   * Referencias externas (DOIs, IDs de repos, URNs, etc.).
   */
  references: string[];
  /**
   * ID opcional de sesión o hilo narrativo (para agrupar historias relacionadas).
   */
  threadId?: string;
}

// ============================================================================
// L2: PROTOCOLS & CONTROL
// ============================================================================

export interface ProtocolDecision {
  approved: boolean;
  risk: EthicRiskLevel;
  reasons: string[];
  /**
   * Nivel de intervención humana vs automática.
   */
  source: DecisionSource;
  /**
   * Si se requieren acciones correctivas posteriores.
   */
  requiresRemediation?: boolean;
}

export interface ProtocolExecutionResult {
  commandId: string;
  decision: ProtocolDecision;
  lifecycle: ProtocolLifecycleState;
  msrEventId: string;
  bookpiEntryId: string;
  executedAt: Date;
  /**
   * Duración total de la ejecución, útil para observabilidad.
   */
  durationMs?: number;
}

// ============================================================================
// L3: GUARDIANSHIP & OBSERVABILITY
// ============================================================================

export type HealthStatus = "healthy" | "degraded" | "critical";

export interface HealthMetric {
  service: string;
  status: HealthStatus;
  latency_ms: number;
  error_rate: number;
  last_check: Date;
  /**
   * Dominio y capa a la que pertenece este servicio.
   */
  domain: FederationDomain;
  layer: KernelLayer;
  /**
   * Tags para dashboards (ej: ["edge-function", "telemetry"]).
   */
  tags?: string[];
}

/**
 * Umbrales para alertas Guardian.
 */
export interface AlertThreshold {
  metric: string;
  warning: number;
  critical: number;
  /**
   * Unidad opcional (ej: "ms", "%", "events_per_minute").
   */
  unit?: string;
}

/**
 * Alerta emitida para Guardian Console / ECG.
 */
export interface GuardianAlert {
  id: string;
  severity: EthicRiskLevel;
  service: string;
  message: string;
  details: Record<string, unknown>;
  createdAt: Date;
  domain: FederationDomain;
  layer: KernelLayer;
  /**
   * ID de evento/trace para correlación.
   */
  traceId?: string;
}

// ============================================================================
// L4: XR/VISUAL & SPATIAL
// ============================================================================

export interface GeoPoint {
  lat: number;
  lon: number;
  /**
   * Altitud opcional (para XR/3D).
   */
  alt?: number;
}

export interface SpatialCell {
  hash: string; // p.ej. geohash
  points: GeoPoint[];
  metadata?: Record<string, unknown>;
}

/**
 * Decisión contextual (p.ej. sugerir ruta, ocultar comercio, mostrar aviso).
 */
export interface ContextualDecision {
  priority: number;
  action: string;
  payload: unknown;
  reason: string;
  /**
   * Plano donde impacta esta decisión (turismo/UX, institucional, técnico).
   */
  plane: RdmExperiencePlane;
}

// ============================================================================
// L5: DOMAIN SERVICES
// ============================================================================

export type DomainServiceStatus =
  | "ready"
  | "initializing"
  | "error"
  | "maintenance";

export interface DomainService {
  name: string;
  version: string;
  status: DomainServiceStatus;
  capabilities: string[];
  domain: FederationDomain;
  layer: KernelLayer;
}

/**
 * Identidad base (ej: ID‑NVIDA).
 */
export interface IdentityRecord {
  id: string;
  email: string;
  publicKey: string;
  createdAt: Date;
  verifiedAt?: Date;
  /**
   * Dominio principal al que está afiliada esta identidad (p.ej. ECONOMY, CULTURE).
   */
  primaryDomain?: FederationDomain;
}

/**
 * Entidad comercial del territorio.
 */
export interface CommerceEntity {
  id: string;
  name: string;
  category: string;
  location: GeoPoint;
  verified: boolean;
  /**
   * Puntuación operativa (puede provenir de gemelos, telemetría, reseñas).
   */
  operationalScore?: number;
  /**
   * ID de ruta o cluster turístico predominante.
   */
  clusterId?: string;
}

/**
 * Telemetría territorial básica (L5).
 */
export interface TelemetryData {
  timestamp: Date;
  userId: string;
  location: GeoPoint;
  signal?: Record<string, number>;
  metadata?: Record<string, unknown>;
  /**
   * Plano de experiencia asociado (ej: TOURISM cuando navega el mapa público).
   */
  plane?: RdmExperiencePlane;
}

// ============================================================================
// L6: UX SHELL
// ============================================================================

export interface UIState<T = unknown> {
  isLoading: boolean;
  error?: string;
  data?: T;
  /**
   * Última actualización para este estado, útil para cache y revalidación.
   */
  updatedAt?: Date;
}

// ============================================================================
// L7: QUANTUM-INSPIRED
// ============================================================================

export type FeedbackStrategy =
  | "penalize_strategy"
  | "reinforce_strategy"
  | "neutral";

export interface QuantumDecisionState {
  /**
   * Conjunto de decisiones posibles antes de colapsar.
   */
  superposition: ContextualDecision[];
  collapsed?: ContextualDecision;
  probability: number;
  /**
   * Información opcional para explicar por qué colapsó en cierta opción.
   */
  explanation?: string;
}

// ============================================================================
// FEDERATION COORDINATOR
// ============================================================================

/**
 * Contexto de ejecución federado: une actor, territorio, plano y capa.
 */
export interface TamvExecutionContext {
  commandId: string;
  actorId: string;
  location?: GeoPoint;
  speed?: number;
  timestamp: Date;
  traceId?: string;
  domain: FederationDomain;
  layer: KernelLayer;
  plane: RdmExperiencePlane;
  /**
   * Permite adjuntar metadata que atraviesa todo el pipeline (A/B, cohortes, etc.).
   */
  contextMeta?: Record<string, unknown>;
}

export interface TamvExecutionResult {
  executionId: string;
  success: boolean;
  protocolDecision?: ProtocolDecision;
  contextualDecisions?: ContextualDecision[];
  feedbackStrategy?: FeedbackStrategy;
  timestamp: Date;
  reason?: string;
  details?: Record<string, unknown>;
  error?: string;
}

// ============================================================================
// EVENT SYSTEM (FEDERATED EVENT BUS)
// ============================================================================

export type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

/**
 * Configuración del Event Bus soberano.
 */
export interface EventBusConfig {
  maxListeners: number;
  logEvents: boolean;
  /**
   * Entorno principal para tuning (dev/stage/prod).
   */
  env: "development" | "staging" | "production";
}

/**
 * Evento publicado en el bus federado.
 */
export interface PublishedEvent<T = unknown> {
  /**
   * Tipo canonizado, ej: "telemetry.ingested", "protocol.executed".
   */
  type: string;
  payload: T;
  timestamp: Date;
  traceId: string;
  /**
   * Dominio/federación y plano desde donde se emite.
   */
  domain: FederationDomain;
  layer: KernelLayer;
  plane: RdmExperiencePlane;
  /**
   * Tags opcionales para filtrado en observabilidad.
   */
  tags?: string[];
}
