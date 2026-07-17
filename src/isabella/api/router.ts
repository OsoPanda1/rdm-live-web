// ISA-API v.1.0.0-evolved — Main Router
// Bridges OpenAPI endpoints to existing Isabella skills

import { orion } from '../skills/orion';
import { sophia } from '../skills/sophia';
import { argus } from '../skills/argus';
import { mnemos } from '../skills/mnemos';
import { lumen } from '../skills/lumen';
import { kernelResonance, kernelCronoAnamnesis, kernelEmpatiaAntifragil, kernelTransduccionEstetica, kernelOmnipresenciaMesh } from '../kernel/index';
import { isabellaIdentidad } from '../core/identity';
import { motorConciencia } from '../core/consciousness';
import {
  createISAContext,
  generateTraceId,
  validateHexagon,
  buildErrorResponse,
  type SecurityResult,
} from './middleware';
import type {
  ISAContext,
  OrionSearchRequest,
  OrionSearchResponse,
  SophiaResearchRequest,
  SophiaResearchResponse,
  ArgusSimulationRequest,
  ArgusSimulationResponse,
  MnemosRecordRequest,
  MnemosRecordResponse,
  LumenEvaluateRequest,
  LumenEvaluateResponse,
  ResonanceUpdateRequest,
  ResonanceUpdateResponse,
  TimeUpAnchorRequest,
  TimeUpAnchorResponse,
  HeptafederationTopology,
  NodoCeroWorkflow,
  SystemHealthResponse,
  HexagonValidationRequest,
  HexagonValidationResponse,
  IntegrationOrchestrationRequest,
  IntegrationOrchestrationResponse,
  ErrorResponse,
} from './types';

// ─── Route Handler Type ─────────────────────────────────────────────────────

type RouteHandler = (
  body: Record<string, unknown>,
  headers: Record<string, string | null>,
  params: Record<string, string>,
) => Promise<{ status: number; body: unknown }>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getHeader(headers: Record<string, string | null>, name: string): string | null {
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) return value;
  }
  return null;
}

function secure(body: Record<string, unknown>, headers: Record<string, string | null>, action: string): SecurityResult & { traceId: string } {
  const traceId = generateTraceId();
  const apiKey = getHeader(headers, 'X-Isabella-Api-Key');
  const token = getHeader(headers, 'Authorization');
  const result = createISAContext(apiKey, token, action, traceId);
  return { ...result, traceId };
}

// ─── ORION Routes ───────────────────────────────────────────────────────────

const orionSearch: RouteHandler = async (body, headers) => {
  const sec = secure(body, headers, 'orion:search');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const input = body as unknown as OrionSearchRequest;
  const ctx: ISAContext = sec.ctx!;
  const result = await orion.search({
    contextId: input.context_id ?? ctx.sessionId,
    query: input.query,
    scopes: input.scopes ?? [],
    filters: input.filters,
  }, ctx);

  return {
    status: 200,
    body: {
      artifacts: result.artifacts.map(a => ({
        artifact_id: a.artifactId,
        title: a.title,
        summary: a.summary,
        source: a.source,
        confidence_score: a.confidenceScore,
      })),
      relations: result.relations.map(r => ({
        from_artifact_id: r.sourceId,
        to_artifact_id: r.targetId,
        relation_type: r.type,
        strength: r.strength,
      })),
      gaps: result.gaps.map(g => ({
        description: g.description,
        severity: g.severity,
        suggested_action: g.suggestedAction,
      })),
      trace_id: sec.traceId,
    },
  };
};

const orionArtifact: RouteHandler = async (body, headers, params) => {
  const sec = secure(body, headers, 'orion:artifact');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const { artifact_id } = params;
  const ctx = sec.ctx!;

  // Search for the specific artifact in the knowledge graph
  const graph = await orion.getKnowledgeGraph(ctx);
  const artifact = graph.nodes.find(a => a.artifactId === artifact_id);

  if (!artifact) {
    return buildErrorResponse('NOT_FOUND', `Artifact ${artifact_id} not found`, sec.traceId);
  }

  return {
    status: 200,
    body: {
      artifact_id: artifact.artifactId,
      title: artifact.title,
      summary: artifact.summary,
      source: artifact.source,
      confidence_score: artifact.confidenceScore,
    },
  };
};

// ─── SOPHIA Routes ──────────────────────────────────────────────────────────

const sophiaResearch: RouteHandler = async (body, headers) => {
  const sec = secure(body, headers, 'sophia:research');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const input = body as unknown as SophiaResearchRequest;
  const ctx = sec.ctx!;
  const result = await sophia.research({
    researchRequest: input.research_request,
    sources: input.sources ?? [],
    depthLevel: input.depth_level ?? 3,
    constraints: input.constraints ?? {},
  }, ctx);

  return {
    status: 200,
    body: {
      synthesis: result.summary,
      references: result.references.map(r => ({
        source_id: r.sourceId,
        type: r.type,
        link: r.link,
        trust_level: r.trustLevel,
      })),
      knowledge_gaps: result.knowledgeGaps.map(g => ({
        description: g.description,
        severity: g.severity,
        suggested_action: g.suggestedAction,
      })),
      trace_id: sec.traceId,
    },
  };
};

// ─── ARGUS Routes ───────────────────────────────────────────────────────────

const argusSimulate: RouteHandler = async (body, headers) => {
  const sec = secure(body, headers, 'argus:simulate');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const input = body as unknown as ArgusSimulationRequest;
  const ctx = sec.ctx!;
  const result = await argus.simulate({
    scenarioDefinition: input.scenario_definition,
    timeHorizon: input.time_horizon,
    dimensions: input.dimensions,
    constraints: input.constraints ?? {},
  }, ctx);

  return {
    status: 200,
    body: {
      simulations: result.simulations.map(s => ({
        scenario_id: s.scenarioId,
        dimension: s.dimension,
        expected_outcome: s.expectedOutcome,
        probability: s.probability,
        confidence: s.confidence,
      })),
      risk_profile: {
        overall_risk_level: result.riskProfile.length > 0 ? 'medium' : 'low',
        dimension_risks: result.riskProfile.map(r => ({
          dimension: r.dimension,
          probability: r.probability,
          severity: r.severity,
          type: r.type,
          mitigation: r.mitigation,
        })),
      },
      recommendations: result.recommendations,
      trace_id: sec.traceId,
    },
  };
};

// ─── MNEMOS Routes ──────────────────────────────────────────────────────────

const mnemosRecord: RouteHandler = async (body, headers) => {
  const sec = secure(body, headers, 'mnemos:record');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const input = body as unknown as MnemosRecordRequest;
  const ctx = sec.ctx!;
  const result = await mnemos.record({
    event: input.event,
    category: input.category,
    evidence: input.evidence ?? [],
    retentionPolicy: input.retention_policy ?? 'largo_plazo',
  }, ctx);

  return {
    status: 201,
    body: {
      record_id: result.recordId,
      canonical_entry: {
        record_id: result.canonicalEntry.recordId,
        who: result.canonicalEntry.authorId,
        what: result.canonicalEntry.title,
        when: result.canonicalEntry.timestamp.toISOString(),
        where: 'rdm',
        why: result.canonicalEntry.category,
        evidence: result.canonicalEntry.evidence.map(e => ({
          evidenceId: e.evidenceId,
          type: e.type,
          content: e.content,
          hash: e.hash,
        })),
      },
      trace_graph: result.traceGraph,
    },
  };
};

const mnemosGetRecord: RouteHandler = async (body, headers, params) => {
  const sec = secure(body, headers, 'mnemos:get');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const { record_id } = params;
  const record = await mnemos.getRecord(record_id);

  if (!record) {
    return buildErrorResponse('NOT_FOUND', `Record ${record_id} not found`, sec.traceId);
  }

  return {
    status: 200,
    body: {
      record_id: record.recordId,
      who: record.authorId,
      what: record.title,
      when: record.timestamp.toISOString(),
      where: 'rdm',
      why: record.category,
      evidence: record.evidence,
    },
  };
};

// ─── LUMEN Routes ───────────────────────────────────────────────────────────

const lumenEvaluate: RouteHandler = async (body, headers) => {
  const sec = secure(body, headers, 'lumen:evaluate');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const input = body as unknown as LumenEvaluateRequest;
  const ctx = sec.ctx!;
  const result = await lumen.evaluate({
    actionRequest: {
      actionId: input.action_request.action_id,
      actionType: input.action_request.action_type,
      target: input.action_request.target,
      payload: input.action_request.payload,
      initiatedBy: input.action_request.initiated_by,
      federationId: input.action_request.federation_id,
    },
    policyContext: {
      applicablePolicies: input.policy_context.applicable_policies,
      riskLevel: input.policy_context.risk_level,
    },
  }, ctx);

  return {
    status: 200,
    body: {
      decision: result.decision,
      rationale: result.rationale,
      log_entry: result.logEntry,
      violations: result.violations.map(v => ({
        rule_id: v.ruleId,
        rule_name: v.ruleName,
        severity: v.severity,
        description: v.description,
      })),
    },
  };
};

// ─── KERNEL Routes ──────────────────────────────────────────────────────────

const kernelResonanceUpdate: RouteHandler = async (body, headers) => {
  const sec = secure(body, headers, 'kernel:resonance');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const result = await kernelResonance.getResonanceState();

  return {
    status: 200,
    body: {
      resonance_state: 'active',
      friction_zones: result.frictionZones.map(z => ({
        node_id: z,
        severity: 'medium',
        description: `Fricción detectada en nodo ${z}`,
      })),
      redirect_plan: result.redirectPlan,
    },
  };
};

const kernelTimeUpAnchor: RouteHandler = async (body, headers) => {
  const sec = secure(body, headers, 'kernel:timeup');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const input = body as unknown as TimeUpAnchorRequest;
  const result = await kernelCronoAnamnesis.createAnchor(
    input.anchor_id,
    input.reason,
    { timestamp: new Date().toISOString(), reason: input.reason },
  );

  return {
    status: 200,
    body: {
      snapshot_state: { anchorId: result.anchorId, timestamp: result.timestamp },
      diff_analysis: {},
    },
  };
};

// ─── TOPOLOGY Routes ────────────────────────────────────────────────────────

const topologyHeptafederation: RouteHandler = async (_body, headers) => {
  const sec = secure({}, headers, 'topology:heptafederation');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const nodes = await kernelResonance.getResonanceState();

  const topology: HeptafederationTopology = {
    federations: nodes.resonanceState.map(n => ({
      node_id: n.nodeId,
      name: n.federationId,
      role: 'heptafederado',
      location: n.nodeId,
    })),
    links: [
      { from_node_id: 'anubis-core', to_node_id: 'dekateotl-ethics', link_type: 'seguridad-etica' },
      { from_node_id: 'bookpi-immutable', to_node_id: 'phoenix-resilience', link_type: 'inmutabilidad-resiliencia' },
      { from_node_id: 'mdd-creative', to_node_id: 'kaos-xr', link_type: 'creatividad-experiencia' },
      { from_node_id: 'chronos-planning', to_node_id: 'anubis-core', link_type: 'planificacion-seguridad' },
    ],
  };

  return { status: 200, body: topology };
};

const topologyNodoCero: RouteHandler = async (_body, headers) => {
  const sec = secure({}, headers, 'topology:nodo_cero');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const workflow: NodoCeroWorkflow = {
    stages: [
      { stage_id: 'nc-001', name: 'Despertar', description: 'Activación progresiva del Nodo Cero', dependencies: [] },
      { stage_id: 'nc-002', name: 'Resonancia', description: 'Sincronización con la Heptafederación TAMV', dependencies: ['nc-001'] },
      { stage_id: 'nc-003', name: 'Orquestación', description: 'Coordinación de subsistemas territoriales', dependencies: ['nc-002'] },
      { stage_id: 'nc-004', name: 'Trascendencia', description: 'Escalamiento y visión estratégica', dependencies: ['nc-003'] },
    ],
    owner: 'isabella-villaseñor',
    status: 'active',
  };

  return { status: 200, body: workflow };
};

// ─── HEALTH Route ───────────────────────────────────────────────────────────

const healthCheck: RouteHandler = async (_body, headers) => {
  const sec = secure({}, headers, 'kernel:health');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const identity = isabellaIdentidad.getIdentidad();
  const stats = {
    orion: orion.getStats(),
    sophia: sophia.getStats(),
    argus: argus.getStats(),
    mnemos: mnemos.getStats(),
    lumen: lumen.getStats(),
  };

  const health: SystemHealthResponse = {
    status: 'ok',
    trace_id: sec.traceId,
    security_mode: 'double-hexagon',
    active_domains: ['ORION', 'SOPHIA', 'ARGUS', 'MNEMOS', 'LUMEN', 'KERNEL', 'TOPOLOGY'],
    uptime_s: Math.floor(process.uptime?.() ?? 0),
    memory_mb: Math.round((process.memoryUsage?.().heapUsed ?? 0) / 1024 / 1024),
  };

  return { status: 200, body: health };
};

// ─── SECURITY Routes ────────────────────────────────────────────────────────

const securityHexagonValidate: RouteHandler = async (body, headers) => {
  const sec = secure(body, headers, 'security:hexagon');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const input = body as unknown as HexagonValidationRequest;
  const result = validateHexagon({
    innerHexagon: input.inner_hexagon,
    outerHexagon: input.outer_hexagon,
    actor: input.actor,
    action: input.action,
    context: input.context,
  }, sec.traceId);

  return { status: 200, body: result };
};

// ─── INTEGRATION Route ──────────────────────────────────────────────────────

const integrationOrchestrate: RouteHandler = async (body, headers) => {
  const sec = secure(body, headers, 'integration:orchestrate');
  if (!sec.valid) return buildErrorResponse('UNAUTHORIZED', sec.error ?? 'Auth failed', sec.traceId);

  const input = body as unknown as IntegrationOrchestrationRequest;
  const traceId = input.trace_id ?? sec.traceId;

  // Build orchestration plan from requested subsystems
  const plan = input.subsystems.map(subsystem => ({
    subsystem,
    status: 'queued',
    pipeline: input.pipeline,
    constraints: input.constraints ?? {},
  }));

  return {
    status: 200,
    body: {
      plan,
      status: 'orchestrated',
      trace_id: traceId,
    },
  };
};

// ─── Route Registry ─────────────────────────────────────────────────────────

export const ISA_ROUTES: Record<string, Record<string, RouteHandler>> = {
  POST: {
    '/isabella/orion/search': orionSearch,
    '/isabella/sophia/research': sophiaResearch,
    '/isabella/argus/simulate': argusSimulate,
    '/isabella/mnemos/record': mnemosRecord,
    '/isabella/lumen/evaluate': lumenEvaluate,
    '/isabella/kernel/resonance/update': kernelResonanceUpdate,
    '/isabella/kernel/timeup/anchor': kernelTimeUpAnchor,
    '/isabella/security/hexagon/validate': securityHexagonValidate,
    '/isabella/integration/orchestrate': integrationOrchestrate,
  },
  GET: {
    '/isabella/orion/artifact/{artifact_id}': orionArtifact,
    '/isabella/mnemos/record/{record_id}': mnemosGetRecord,
    '/isabella/topology/heptafederation': topologyHeptafederation,
    '/isabella/topology/nodo_cero': topologyNodoCero,
    '/isabella/health': healthCheck,
  },
};

// ─── Request Dispatcher ─────────────────────────────────────────────────────

export async function dispatchISARequest(
  method: string,
  pathname: string,
  body: Record<string, unknown>,
  headers: Record<string, string | null>,
): Promise<{ status: number; body: unknown }> {
  const routes = ISA_ROUTES[method.toUpperCase()];
  if (!routes) {
    return buildErrorResponse('NOT_FOUND', `Method ${method} not supported`, generateTraceId());
  }

  // Exact match first
  if (routes[pathname]) {
    return routes[pathname](body, headers, {});
  }

  // Pattern match (e.g., /isabella/orion/artifact/{artifact_id})
  for (const [pattern, handler] of Object.entries(routes)) {
    const paramMatch = matchRoutePattern(pattern, pathname);
    if (paramMatch) {
      return handler(body, headers, paramMatch);
    }
  }

  return buildErrorResponse('NOT_FOUND', `Route ${pathname} not found`, generateTraceId());
}

function matchRoutePattern(pattern: string, pathname: string): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith('{') && patternParts[i].endsWith('}')) {
      const paramName = patternParts[i].slice(1, -1);
      params[paramName] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }

  return params;
}
