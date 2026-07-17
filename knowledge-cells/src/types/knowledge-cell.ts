/**
 * @file knowledge-cell.ts
 * @description Core type definitions for the TAMV MD-X4 Knowledge Cell architecture
 * Defines the contract for all specialized microservices
 */

export type CellType =
  | 'Render3D'
  | 'Render4D'
  | 'IA-ImmersiveFX'
  | 'QuantumChannel'
  | 'SensorMultiFX'
  | 'APIIntegration'
  | 'Analytics'
  | 'UIControl'
  | 'SpatialLogic';

export type InputFormat = 'OBJ' | 'JSON' | 'BLOB' | 'WebRTC' | 'QuantumSignal' | 'AudioSignal' | 'TactileSignal';
export type OutputFormat = 'GLTF' | 'JSON' | 'BLOB' | 'WebXR' | 'SpatialAudio' | 'QuantumState' | '4DState';

export type RelationType = 'requires' | 'extends' | 'composes' | 'enhances' | 'depends';

export interface KnowledgeCell {
  id: string;
  type: CellType;
  description: string;
  version: string;
  dependencies?: string[];
  inputFormat: InputFormat;
  outputFormat: OutputFormat;
  iaSpecializationPrompt: string;
  apiEndpoint: string;
  microserviceUrl: string;
  testCases: string[];
  visualizationSample: string;
  author: string;
  created: Date;
  updated: Date;
  healthCheckEndpoint?: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  metricsEnabled?: boolean;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
}

export interface KnowledgeRelation {
  from: string;
  to: string;
  relation: RelationType;
  description?: string;
}

export interface KnowledgeRepo {
  id: string;
  version: string;
  cells: Record<string, KnowledgeCell>;
  relations: KnowledgeRelation[];
  aiExpertiseProfile: string;
  orchestratorUrl?: string;
  metricsPort?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  created: Date;
  updated: Date;
}

export interface CellRequest {
  cellId: string;
  operation: string;
  payload: Record<string, unknown>;
  context?: CellExecutionContext;
}

export interface CellExecutionContext {
  userId?: string;
  sessionId?: string;
  parentCellId?: string;
  metadata?: Record<string, unknown>;
}

export interface CellResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: CellError;
  executionTime: number;
  metricsId?: string;
  timestamp: Date;
}

export interface CellError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface CellMetrics {
  cellId: string;
  operation: string;
  executionTime: number;
  success: boolean;
  timestamp: Date;
  userId?: string;
  inputSize?: number;
  outputSize?: number;
}

export interface AIOrchestratorConfig {
  knowledgeRepoUrl: string;
  baseSpecializationPrompt: string;
  learningEnabled: boolean;
  anomalyDetectionEnabled: boolean;
  maxConcurrentOperations: number;
  timeout: number;
}
