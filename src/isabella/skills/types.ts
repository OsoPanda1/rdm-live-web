export interface SkillContext {
  sessionId: string;
  territoryId: string;
  userId: string;
  timestamp: Date;
  federations: string[];
  traceId: string;
}

export interface Artifact {
  artifactId: string;
  title: string;
  summary: string;
  source: string;
  confidenceScore: number;
  timestamp: Date;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface Relation {
  sourceId: string;
  targetId: string;
  type: string;
  strength: number;
  direction: 'forward' | 'backward' | 'bidirectional';
}

export interface Gap {
  gapId: string;
  description: string;
  domain: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
}

export interface Reference {
  sourceId: string;
  type: 'canon' | 'research' | 'community' | 'external';
  link: string;
  trustLevel: number;
  verifiedAt: Date | null;
}

export interface SimulationResult {
  scenarioId: string;
  dimension: string;
  expectedOutcome: string;
  probability: number;
  confidence: number;
}

export interface RiskProfile {
  riskId: string;
  dimension: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'technical' | 'social' | 'economic' | 'cultural' | 'ethical';
  mitigation: string;
}

export interface CanonicalEntry {
  recordId: string;
  title: string;
  category: 'patrimonio' | 'politica_publica' | 'innovacion' | 'memoria_comunitaria';
  event: Record<string, unknown>;
  evidence: Evidence[];
  timestamp: Date;
  authorId: string;
  retentionPolicy: 'permanente' | 'largo_plazo' | 'rotativa';
  immutable: boolean;
}

export interface Evidence {
  evidenceId: string;
  type: 'document' | 'testimony' | 'data' | 'media';
  content: string;
  hash: string;
  verifiedAt: Date;
}

export interface PolicyViolation {
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface LumenDecision {
  decision: 'permitir' | 'restringir' | 'bloquear' | 'escalar_a_humano';
  rationale: string;
  logEntry: LumenLogEntry;
  violations: PolicyViolation[];
}

export interface LumenLogEntry {
  logId: string;
  actionRequest: string;
  decision: string;
  timestamp: Date;
  reviewerId: string | null;
  durationMs: number;
}

export interface ResearchSynthesis {
  summary: string;
  marco: string;
  hallazgos: string[];
  implicaciones: string[];
  references: Reference[];
  knowledgeGaps: Gap[];
}

export interface KnowledgeGraph {
  nodes: Artifact[];
  edges: Relation[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    density: number;
  };
}

export interface SkillMetadata {
  skillId: string;
  name: string;
  version: string;
  description: string;
  priority: 'maximo' | 'critico' | 'alto' | 'medio' | 'bajo';
  enabled: boolean;
  lastRun: Date | null;
  totalCalls: number;
  avgResponseMs: number;
}
