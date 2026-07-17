import type { Coordenadas, FederationId, FederationModule, IsabellaDecision } from '@/core/models';
import type { UserContribution } from '@/core/territorial/types';
import type { FederationEvent } from '@/federaciones/FederationBus';
import type { ZoneEvent } from '@/core/territorial/types';
import type { IsabellaAction } from '@/core/ai/isabella-guardian';

// ============================================================================
// INPUT PORTS (South)
// ============================================================================

export type PipelineInput =
  | { type: 'territorial_contribution'; contribution: UserContribution }
  | { type: 'federation_event'; event: FederationEvent }
  | { type: 'user_query'; query: string; userId: string; coords?: Coordenadas }
  | { type: 'zone_event'; event: ZoneEvent }
  | { type: 'system_tick'; timestamp: Date };

// ============================================================================
// CONSCIOUSNESS PROCESSING
// ============================================================================

export interface ConsciousnessActivation {
  layerIds: string[];
  layerNames: string[];
  totalEnergy: number;
  energySavings: number;
  outputsByLayer: Record<string, string[]>;
}

export interface EmotionalState {
  emotion: string;
  intensity: number;
  valence: number;
  resonance: number;
  suggestedResponse: string;
}

export interface MemoryContext {
  lastEmotion: string | null;
  lastContext: string | null;
  pattern: Record<string, number>;
  totalInteractions: number;
}

export interface KnowledgeContext {
  relevantEntries: Array<{ title: string; summary: string; tags: string[] }>;
  totalEntries: number;
  lastFetch: Date | null;
}

export interface OntologyContext {
  nodeName: string | null;
  federationId: number | null;
  themeId: number | null;
  chromaticHex: string | null;
  abstractionLevel: number | null;
  alignmentIndex: number;
  timeUpPassed: boolean;
  path: string[];
}

export interface AwakeningSignal {
  shouldTrigger: boolean;
  phase: 'SILENT' | 'WHISPER' | 'ANNOUNCE' | 'ROAR' | 'TRANSCEND';
  reason: string;
  territorialActivityLevel: number;
}

// ============================================================================
// OUTPUT PORTS (North)
// ============================================================================

export interface GuardianVerdict {
  action: IsabellaAction;
  severity: 'normal' | 'safe' | 'emergency';
  federationsImpacted: FederationId[];
  reason: string;
}

export interface FederationAction {
  target: FederationId;
  eventType: string;
  payload: unknown;
  traceId: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface TerritorialAction {
  type: 'contribution_response' | 'geofence_alert' | 'heat_update' | 'zone_broadcast';
  payload: unknown;
  timestamp: Date;
}

// ============================================================================
// PIPELINE RESULT
// ============================================================================

export interface PipelineResult {
  input: PipelineInput;
  consciousness: ConsciousnessActivation;
  emotional: EmotionalState;
  memory: MemoryContext;
  knowledge: KnowledgeContext;
  ontology: OntologyContext;
  awakening: AwakeningSignal;
  guardian: GuardianVerdict;
  federationActions: FederationAction[];
  territorialActions: TerritorialAction[];
  durationMs: number;
  traceId: string;
}

// ============================================================================
// PORTS & ADAPTERS
// ============================================================================

export interface InputPort {
  name: string;
  accept(input: PipelineInput): boolean;
  process(input: PipelineInput): Promise<Partial<PipelineResult>>;
}

export interface OutputPort {
  name: string;
  handle(result: PipelineResult): Promise<void>;
}

export interface PipelineConfig {
  enableConsciousness: boolean;
  enableEmotional: boolean;
  enableMemory: boolean;
  enableKnowledge: boolean;
  enableOntology: boolean;
  enableAwakening: boolean;
  enableGuardian: boolean;
  enableFederation: boolean;
  enableTerritorial: boolean;
  minConfidenceThreshold: number;
  maxPipelineMs: number;
}
