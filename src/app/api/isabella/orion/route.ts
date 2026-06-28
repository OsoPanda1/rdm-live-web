import { orion } from '@/isabella/skills/orion';
import { createTraceId } from '@/core/context/trace';

function val(body: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    const v = body[k];
    if (v !== undefined) return v;
  }
  return undefined;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const contextId = val(body, ['context_id', 'contextId']) as string;
    const query = val(body, ['query']) as string;
    const scopes = val(body, ['scopes']) as string[];
    const filters = val(body, ['filters']) as Record<string, unknown>;
    if (!contextId || !query) {
      return Response.json({ success: false, error: 'Faltan campos requeridos: context_id/contextId, query' }, { status: 400 });
    }
    const ctx = {
      sessionId: contextId,
      territoryId: 'RDM',
      userId: (val(body, ['user_id', 'userId']) as string) ?? 'anonymous',
      timestamp: new Date(),
      federations: scopes ?? ['rdm_hub', 'tamv_canon'],
      traceId: createTraceId(),
    };
    const result = await orion.search({ contextId, query, scopes: scopes ?? ['rdm_hub'], filters }, ctx);
    return Response.json({ success: true, data: { artifacts: result.artifacts, relations: result.relations, gaps: result.gaps }, trace_id: ctx.traceId });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const artifactId = url.searchParams.get('artifact_id') ?? url.searchParams.get('artifactId');
    if (artifactId) {
      const graph = await orion.getKnowledgeGraph({ sessionId: '', territoryId: 'RDM', userId: 'system', timestamp: new Date(), federations: [], traceId: '' });
      const artifact = graph.nodes.find(a => a.artifactId === artifactId);
      if (!artifact) return Response.json({ success: false, error: 'Artefacto no encontrado' }, { status: 404 });
      return Response.json({ success: true, data: { artifact: { artifact_id: artifact.artifactId, title: artifact.title, summary: artifact.summary, source: artifact.source, confidence_score: artifact.confidenceScore }, provenance: graph.edges.filter(e => e.sourceId === artifactId || e.targetId === artifactId).map(e => ({ from_artifact_id: e.sourceId, to_artifact_id: e.targetId, relation_type: e.type, strength: e.strength })), history: [] } });
    }
    const graph = await orion.getKnowledgeGraph({ sessionId: '', territoryId: 'RDM', userId: 'system', timestamp: new Date(), federations: [], traceId: '' });
    return Response.json({ success: true, data: graph });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
