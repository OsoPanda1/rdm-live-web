import { sophia } from '@/isabella/skills/sophia';
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
    const researchRequest = val(body, ['research_request', 'researchRequest']) as string;
    const sources = val(body, ['sources']) as string[];
    const depthLevel = val(body, ['depth_level', 'depthLevel']) as number;
    const constraints = val(body, ['constraints']) as Record<string, unknown>;
    if (!researchRequest) {
      return Response.json({ success: false, error: 'Falta campo requerido: research_request/researchRequest' }, { status: 400 });
    }
    const ctx = {
      sessionId: `research-${crypto.randomUUID().slice(0, 12)}`,
      territoryId: 'RDM',
      userId: (val(body, ['user_id', 'userId']) as string) ?? 'anonymous',
      timestamp: new Date(),
      federations: sources ?? ['rdm_docs', 'tamv_papers'],
      traceId: createTraceId(),
    };
    const result = await sophia.research(
      { researchRequest, sources: sources ?? ['rdm_docs', 'tamv_papers'], depthLevel: depthLevel ?? 3, constraints: constraints ?? {} },
      ctx,
    );
    return Response.json({
      success: true,
      data: {
        synthesis: result.summary,
        references: result.references.map(r => ({ source_id: r.sourceId, type: r.type, link: r.link, trust_level: r.trustLevel })),
        knowledge_gaps: result.knowledgeGaps.map(g => ({ description: g.description, severity: g.severity, suggested_action: g.suggestedAction })),
      },
      trace_id: ctx.traceId,
    });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
