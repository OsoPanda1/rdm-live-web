/**
 * RDM Digital - Sistema Heptafederado GEN-7+
 * Modelo de federacion civilizatoria con telemetria y health checks
 * Integrado desde: rdm-smart-city-os, citemesh-roots
 */

import type {
  FederationId,
  FederationModule,
  FederationStatus,
  IsabellaDecision,
  TelemetryEntry,
} from '@/core/models';
import {
  federationHealth,
  federationModuleStatus,
} from '@/core/metrics/prometheus';

// ============================================================================
// DEFINICION DE LA HEPTAFEDERACION
// ============================================================================

export const HEPTAFEDERATION: FederationModule[] = [
  {
    id: 'DEKATEOTL',
    name: 'Dekateotl',
    specialty: 'Etica y Logica Narrativa',
    stack: ['LangGraph', 'SHAP', 'RLHF'],
    role: 'Orquestador de axiologia, veto etico y memoria de valores.',
    status: 'ACTIVE',
    health: 0.98,
    operationalScore: 0.97,
    lastHeartbeat: new Date(),
  },
  {
    id: 'ANUBIS',
    name: 'Anubis Sentinel',
    specialty: 'Seguridad PQC',
    stack: ['Dilithium-5', 'Kyber-1024', 'zk-SNARKs'],
    role: 'Blindaje criptografico poscuantico y tunel de soberania.',
    status: 'ACTIVE',
    health: 1,
    operationalScore: 0.99,
    lastHeartbeat: new Date(),
  },
  {
    id: 'BOOKPI_DATAGIT',
    name: 'BookPI / DataGit',
    specialty: 'Inmutabilidad y Auditoria',
    stack: ['IPFS Pinning', 'Merkle Trees', 'MSR Blockchain'],
    role: 'Caja negra y trazabilidad granular de decisiones.',
    status: 'ACTIVE',
    health: 0.94,
    operationalScore: 0.95,
    lastHeartbeat: new Date(),
  },
  {
    id: 'PHOENIX',
    name: 'Phoenix Protocol',
    specialty: 'Resiliencia y P2P',
    stack: ['libp2p', 'Swarm Quorum'],
    role: 'Topologia de resiliencia sin SPOF y auto-reparacion.',
    status: 'ACTIVE',
    health: 0.96,
    operationalScore: 0.92,
    lastHeartbeat: new Date(),
  },
  {
    id: 'MDD_TAMV',
    name: 'MDD / TAMV Credits',
    specialty: 'Economia Creativa',
    stack: ['Web3 Identity', 'Quadratic Funding'],
    role: 'Motor de valor y financiamiento comunitario.',
    status: 'ACTIVE',
    health: 0.93,
    operationalScore: 0.91,
    lastHeartbeat: new Date(),
  },
  {
    id: 'KAOS_HYPERRENDER',
    name: 'KAOS / HyperRender',
    specialty: 'Sensorialidad y XR',
    stack: ['Three.js', 'WebNN', 'Haptics API'],
    role: 'Capa multisensorial y sinestesia digital Crystal Glow.',
    status: 'IDLE',
    health: 0.89,
    operationalScore: 0.88,
    lastHeartbeat: new Date(),
  },
  {
    id: 'CHRONOS',
    name: 'Chronos Planning',
    specialty: 'Gestion de Tiempo y Guia',
    stack: ['Genetic Algorithms', 'Mapbox GL', 'Turf.js'],
    role: 'Planificador multiobjetivo territorial.',
    status: 'ACTIVE',
    health: 0.97,
    operationalScore: 0.96,
    lastHeartbeat: new Date(),
  },
];

// ============================================================================
// ESTADO MUTABLE DE LA FEDERACION
// ============================================================================

let currentFederation: FederationModule[] = [...HEPTAFEDERATION];

// ============================================================================
// FUNCIONES DE GESTION DE FEDERACION
// ============================================================================

/**
 * Aplica el efecto de una decision de Isabella a la federacion
 * Las decisiones criticas pueden degradar temporalmente algunos modulos
 */
export function applyDecisionToHeptafederation(
  decision?: IsabellaDecision
): FederationModule[] {
  if (!decision) return currentFederation;

  const stress = getStressFactor(decision.retentionIntent);

  currentFederation = currentFederation.map(module => {
    // Aplicar stress diferenciado por modulo
    const moduleStress = getModuleStress(module.id, decision, stress);
    const operationalScore = Math.max(0.65, Math.min(1, module.health - moduleStress));

    const newStatus: FederationStatus = 
      operationalScore < 0.7 ? 'DEGRADED' : 
      operationalScore < 0.85 ? 'IDLE' : 
      module.status;

    // Registrar metrica
    federationModuleStatus.inc({ 
      module: module.id, 
      status: newStatus,
      intent: decision.retentionIntent,
    });

    return {
      ...module,
      operationalScore,
      status: newStatus,
      lastHeartbeat: new Date(),
    };
  });

  // Actualizar salud global
  const globalHealth = getGlobalHealth(currentFederation);
  federationHealth.set(globalHealth * 100);

  return currentFederation;
}

function getStressFactor(intent: IsabellaDecision['retentionIntent']): number {
  const stressMap: Record<IsabellaDecision['retentionIntent'], number> = {
    SAFE_EXIT: 0.04,
    UPSELL: 0.02,
    DISCOVERY: 0.01,
    RETENTION: 0.02,
    ENGAGEMENT: 0.01,
  };
  return stressMap[intent] ?? 0;
}

function getModuleStress(
  moduleId: FederationId,
  decision: IsabellaDecision,
  baseStress: number
): number {
  // Modulos mas afectados por ciertos tipos de decisiones
  const stressMultipliers: Partial<Record<FederationId, Record<string, number>>> = {
    CHRONOS: { SAFE_EXIT: 1.5, DISCOVERY: 1.2 },
    KAOS_HYPERRENDER: { ENGAGEMENT: 1.3, DISCOVERY: 1.4 },
    DEKATEOTL: { SAFE_EXIT: 1.2, UPSELL: 0.8 },
    MDD_TAMV: { UPSELL: 1.4, RETENTION: 1.3 },
  };

  const multiplier = stressMultipliers[moduleId]?.[decision.retentionIntent] ?? 1;
  return baseStress * multiplier;
}

/**
 * Calcula la salud global de la federacion
 */
export function getGlobalHealth(modules = currentFederation): number {
  if (modules.length === 0) return 0;
  return modules.reduce((acc, m) => acc + m.operationalScore, 0) / modules.length;
}

/**
 * Obtiene telemetria formateada para dashboards
 */
export function getTelemetry(modules = currentFederation): TelemetryEntry[] {
  return modules.map(m => ({
    id: m.id.slice(0, 3),
    label: m.name,
    status: Math.round(m.operationalScore * 100),
    specialty: m.specialty,
    statusLabel: m.status,
    timestamp: m.lastHeartbeat ?? new Date(),
  }));
}

/**
 * Obtiene un modulo especifico por ID
 */
export function getModule(id: FederationId): FederationModule | undefined {
  return currentFederation.find(m => m.id === id);
}

/**
 * Obtiene modulos filtrados por estado
 */
export function getModulesByStatus(status: FederationStatus): FederationModule[] {
  return currentFederation.filter(m => m.status === status);
}

/**
 * Actualiza manualmente el estado de un modulo
 */
export function updateModuleStatus(
  id: FederationId,
  updates: Partial<Pick<FederationModule, 'status' | 'health' | 'operationalScore'>>
): FederationModule | null {
  const index = currentFederation.findIndex(m => m.id === id);
  if (index === -1) return null;

  currentFederation[index] = {
    ...currentFederation[index],
    ...updates,
    lastHeartbeat: new Date(),
  };

  return currentFederation[index];
}

/**
 * Simula un heartbeat para todos los modulos activos
 */
export function heartbeatAll(): void {
  currentFederation = currentFederation.map(module => ({
    ...module,
    lastHeartbeat: new Date(),
    // Recuperacion gradual si estaba degradado
    operationalScore: module.status === 'DEGRADED' 
      ? Math.min(module.health, module.operationalScore + 0.01)
      : module.operationalScore,
    status: module.operationalScore >= 0.85 ? 'ACTIVE' : module.status,
  }));
}

/**
 * Reinicia la federacion a su estado inicial
 */
export function resetFederation(): void {
  currentFederation = HEPTAFEDERATION.map(m => ({
    ...m,
    lastHeartbeat: new Date(),
  }));
}

/**
 * Obtiene estadisticas agregadas de la federacion
 */
export function getFederationStats(): {
  totalModules: number;
  activeModules: number;
  degradedModules: number;
  idleModules: number;
  globalHealth: number;
  avgOperationalScore: number;
  criticalAlerts: string[];
} {
  const active = currentFederation.filter(m => m.status === 'ACTIVE').length;
  const degraded = currentFederation.filter(m => m.status === 'DEGRADED').length;
  const idle = currentFederation.filter(m => m.status === 'IDLE').length;
  
  const criticalModules = currentFederation.filter(m => m.operationalScore < 0.7);

  return {
    totalModules: currentFederation.length,
    activeModules: active,
    degradedModules: degraded,
    idleModules: idle,
    globalHealth: getGlobalHealth(),
    avgOperationalScore: currentFederation.reduce((acc, m) => acc + m.operationalScore, 0) / currentFederation.length,
    criticalAlerts: criticalModules.map(m => `${m.name} en estado critico (${(m.operationalScore * 100).toFixed(1)}%)`),
  };
}

// ============================================================================
// FEDERACIONES LOCALES (ECONOMIA/TURISMO)
// ============================================================================

export enum Federacion {
  HOSPEDAJE = 'FED_HOSPEDAJE',
  GASTRONOMIA = 'FED_GASTRONOMIA',
  MINERIA_PLATERIA = 'FED_PLATERIA',
  TURISMO_ACTIVO = 'FED_TURISMO',
  MOVILIDAD = 'FED_MOVILIDAD',
  COMERCIO_LOCAL = 'FED_COMERCIO',
  GOBIERNO_DIGITAL = 'FED_GOBIERNO',
}

export interface LocalFederationStatus {
  id: Federacion;
  name: string;
  activeBusiness: number;
  satisfaction: number;
  revenue24h: number;
  trending: 'up' | 'down' | 'stable';
}

const LOCAL_FEDERATION_DEFAULTS: LocalFederationStatus[] = [
  { id: Federacion.HOSPEDAJE, name: 'Hospedaje', activeBusiness: 12, satisfaction: 0.89, revenue24h: 45000, trending: 'up' },
  { id: Federacion.GASTRONOMIA, name: 'Gastronomia', activeBusiness: 28, satisfaction: 0.92, revenue24h: 78000, trending: 'up' },
  { id: Federacion.MINERIA_PLATERIA, name: 'Plateria y Mineria', activeBusiness: 8, satisfaction: 0.85, revenue24h: 23000, trending: 'stable' },
  { id: Federacion.TURISMO_ACTIVO, name: 'Turismo Activo', activeBusiness: 15, satisfaction: 0.88, revenue24h: 34000, trending: 'up' },
  { id: Federacion.MOVILIDAD, name: 'Movilidad', activeBusiness: 6, satisfaction: 0.78, revenue24h: 12000, trending: 'stable' },
  { id: Federacion.COMERCIO_LOCAL, name: 'Comercio Local', activeBusiness: 35, satisfaction: 0.82, revenue24h: 56000, trending: 'down' },
  { id: Federacion.GOBIERNO_DIGITAL, name: 'Gobierno Digital', activeBusiness: 3, satisfaction: 0.75, revenue24h: 0, trending: 'stable' },
];

let localFederations: LocalFederationStatus[] = [...LOCAL_FEDERATION_DEFAULTS];

export function getLocalFederations(): LocalFederationStatus[] {
  return localFederations;
}

export function getLocalFederation(id: Federacion): LocalFederationStatus | undefined {
  return localFederations.find(f => f.id === id);
}

export function updateLocalFederation(
  id: Federacion,
  updates: Partial<Omit<LocalFederationStatus, 'id'>>
): LocalFederationStatus | null {
  const index = localFederations.findIndex(f => f.id === id);
  if (index === -1) return null;

  localFederations[index] = {
    ...localFederations[index],
    ...updates,
  };

  return localFederations[index];
}

// ============================================================================
// EXPORTACIONES
// ============================================================================

export type { FederationId, FederationModule, FederationStatus, TelemetryEntry };
