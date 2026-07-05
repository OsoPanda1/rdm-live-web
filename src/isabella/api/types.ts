// ISA-API v.1.0.0-evolved — TypeScript types
// Generated from docs/yun/isa-api.yaml

// ─── Security Schemes ────────────────────────────────────────────────────────

export interface IsabellaApiKeyAuth {
  'X-Isabella-Api-Key': string;
}

export interface IsabellaTerritorialTokenAuth {
  Authorization: `Bearer ${string}`;
}

// ─── Common ──────────────────────────────────────────────────────────────────

export interface ErrorResponse {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trace_id: string;
}

export interface SystemHealthResponse {
  status: 'ok' | 'degraded' | 'down';
  trace_id: string;
  security_mode: string;
  active_domains: string[];
  uptime_s: number;
  memory_mb: number;
}

// ─── ORION — Cognitive Archaeology ──────────────────────────────────────────

export interface OrionSearchRequest {
  context_id?: string;
  query: string;
  scopes?: string[];
  filters?: {
    dateRange?: { start: string; end: string };
    type?: string[];
    tags?: string[];
  };
}

export interface OrionSearchResponse {
  artifacts: ArtifactDTO[];
  relations: RelationDTO[];
  gaps: GapDTO[];
  trace_id: string;
}

export interface ArtifactDTO {
  artifact_id: string;
  title: string;
  summary: string;
  source: string;
  confidence_score: number;
}

export interface RelationDTO {
  from_artifact_id: string;
  to_artifact_id: string;
  relation_type: string;
  strength: number;
}

export interface GapDTO {
  description: string;
  severity: string;
  suggested_action: string;
}

// ─── SOPHIA — Deep Research ─────────────────────────────────────────────────

export interface SophiaResearchRequest {
  research_request: string;
  sources?: string[];
  depth_level?: number;
  constraints?: {
    maxLength?: number;
    language?: string;
    tone?: string;
  };
}

export interface SophiaResearchResponse {
  synthesis: string;
  references: ReferenceDTO[];
  knowledge_gaps: GapDTO[];
  trace_id: string;
}

export interface ReferenceDTO {
  source_id: string;
  type: string;
  link: string;
  trust_level: number;
}

// ─── ARGUS — Future Impact Simulation ──────────────────────────────────────

export interface ArgusSimulationRequest {
  scenario_definition: {
    action: string;
    domain: string;
    target: string;
    parameters: Record<string, unknown>;
  };
  time_horizon: 'corto' | 'medio' | 'largo';
  dimensions: string[];
  constraints?: {
    budget?: number;
    timeline?: number;
    dependencies?: string[];
    assumptions?: string[];
  };
}

export interface ArgusSimulationResponse {
  simulations: SimulationDTO[];
  risk_profile: RiskProfileDTO;
  recommendations: string[];
  trace_id: string;
}

export interface SimulationDTO {
  scenario_id: string;
  dimension: string;
  expected_outcome: string;
  probability: number;
  confidence: number;
}

export interface RiskProfileDTO {
  overall_risk_level: string;
  dimension_risks: DimensionRiskDTO[];
}

export interface DimensionRiskDTO {
  dimension: string;
  probability: number;
  severity: string;
  type: string;
  mitigation: string;
}

// ─── MNEMOS — Civilizational Preservation ──────────────────────────────────

export interface MnemosRecordRequest {
  event: Record<string, unknown>;
  category: 'patrimonio' | 'politica_publica' | 'innovacion' | 'memoria_comunitaria';
  evidence?: Array<{ type: string; content: string }>;
  retention_policy?: 'permanente' | 'largo_plazo' | 'rotativa';
}

export interface MnemosRecordResponse {
  record_id: string;
  canonical_entry: MnemosRecordCanonical;
  trace_graph: { relatedRecords: string[] };
}

export interface MnemosRecordCanonical {
  record_id: string;
  who: string;
  what: string;
  when: string;
  where: string;
  why: string;
  evidence: Array<Record<string, unknown>>;
}

// ─── LUMEN — Constitutional Governance ─────────────────────────────────────

export interface LumenEvaluateRequest {
  action_request: {
    action_id: string;
    action_type: string;
    target: string;
    payload: Record<string, unknown>;
    initiated_by: string;
    federation_id?: string;
  };
  policy_context: {
    applicable_policies: string[];
    risk_level: 'bajo' | 'medio' | 'alto';
  };
}

export interface LumenEvaluateResponse {
  decision: 'permitir' | 'restringir' | 'bloquear' | 'escalar_a_humano';
  rationale: string;
  log_entry: {
    logId: string;
    actionRequest: string;
    decision: string;
    timestamp: Date;
    reviewerId: string | null;
    durationMs: number;
  };
  violations: PolicyViolationDTO[];
}

export interface PolicyViolationDTO {
  rule_id: string;
  rule_name: string;
  severity: string;
  description: string;
}

// ─── KERNEL — Resonance & Time ─────────────────────────────────────────────

export interface ResonanceUpdateRequest {
  federation_nodes?: FederationNodeStateDTO[];
  mesh_state?: MeshStateDTO;
  timestamp?: string;
}

export interface ResonanceUpdateResponse {
  resonance_state: string;
  friction_zones: FrictionZoneDTO[];
  redirect_plan: Record<string, unknown>;
}

export interface FederationNodeStateDTO {
  node_id: string;
  role: string;
  health_status: string;
  latency_ms: number;
  packet_loss_rate: number;
  attack_detected: boolean;
}

export interface MeshStateDTO {
  connected_nodes: number;
  isolated_nodes: number;
  average_latency_ms: number;
}

export interface FrictionZoneDTO {
  node_id: string;
  severity: string;
  description: string;
}

export interface TimeUpAnchorRequest {
  anchor_id: string;
  time_window?: string;
  reason: string;
}

export interface TimeUpAnchorResponse {
  snapshot_state: Record<string, unknown>;
  diff_analysis: Record<string, unknown>;
}

// ─── TOPOLOGY — Heptafederation ────────────────────────────────────────────

export interface HeptafederationTopology {
  federations: FederationNodeDTO[];
  links: FederationLinkDTO[];
}

export interface FederationNodeDTO {
  node_id: string;
  name: string;
  role: string;
  location: string;
}

export interface FederationLinkDTO {
  from_node_id: string;
  to_node_id: string;
  link_type: string;
}

export interface NodoCeroWorkflow {
  stages: NodoCeroStageDTO[];
  owner: string;
  status: string;
}

export interface NodoCeroStageDTO {
  stage_id: string;
  name: string;
  description: string;
  dependencies: string[];
}

// ─── SECURITY — Double Hexagon ─────────────────────────────────────────────

export interface HexagonValidationRequest {
  inner_hexagon: Record<string, unknown>;
  outer_hexagon: Record<string, unknown>;
  actor: string;
  action: string;
  context?: Record<string, unknown>;
}

export interface HexagonValidationResponse {
  allowed: boolean;
  decision: string;
  rationale: string;
  audit_id: string;
  trace_id: string;
}

// ─── INTEGRATION — Orchestration ───────────────────────────────────────────

export interface IntegrationOrchestrationRequest {
  trace_id?: string;
  subsystems: string[];
  pipeline: string[];
  constraints?: Record<string, unknown>;
}

export interface IntegrationOrchestrationResponse {
  plan: Array<Record<string, unknown>>;
  status: string;
  trace_id: string;
}

// ─── Internal Context ──────────────────────────────────────────────────────

export interface ISAContext {
  traceId: string;
  userId: string;
  sessionId: string;
  territoryId: string;
  federations: string[];
  timestamp: Date;
  apiKeyValidated: boolean;
  tokenValidated: boolean;
  hexagonValidated: boolean;
}
