import { mnemos } from '@/isabella/skills/mnemos';
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
    const event = val(body, ['event']) as Record<string, unknown>;
    const category = val(body, ['category']) as string;
    const evidence = val(body, ['evidence']) as Array<{ type: string; content: string }>;
    const retentionPolicy = val(body, ['retention_policy', 'retentionPolicy']) as string;
    if (!event || !category || !evidence) {
      return Response.json({ success: false, error: 'Faltan campos requeridos: event, category, evidence' }, { status: 400 });
    }
    const validCategories = ['patrimonio', 'politica_publica', 'innovacion', 'memoria_comunitaria'];
    if (!validCategories.includes(category)) {
      return Response.json({ success: false, error: `Categoria invalida: ${category}. Validas: ${validCategories.join(', ')}` }, { status: 400 });
    }
    const ctx = {
      sessionId: `record-${crypto.randomUUID().slice(0, 12)}`,
      territoryId: 'RDM',
      userId: (val(body, ['user_id', 'userId']) as string) ?? 'anonymous',
      timestamp: new Date(),
      federations: [],
      traceId: createTraceId(),
    };
    const result = await mnemos.record({ event, category, evidence, retentionPolicy: retentionPolicy ?? 'rotativa' }, ctx);
    const ce = result.canonicalEntry;
    return Response.json({
      success: true,
      data: {
        record_id: result.recordId,
        canonical_entry: {
          record_id: ce.recordId,
          who: ce.authorId,
          what: (ce.event as Record<string, unknown>)?.title as string ?? ce.category,
          when: ce.timestamp.toISOString(),
          where: 'RDM',
          why: `Registro categoría: ${ce.category}`,
          evidence: ce.evidence.map(e => ({ evidenceId: e.evidenceId, type: e.type, content: e.content, hash: e.hash, verifiedAt: e.verifiedAt.toISOString() })),
        },
        trace_graph: result.traceGraph,
      },
      trace_id: ctx.traceId,
    });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const recordId = url.searchParams.get('record_id');
    if (recordId) {
      const record = await mnemos.getRecord(recordId);
      if (!record) return Response.json({ success: false, error: 'Registro no encontrado' }, { status: 404 });
      return Response.json({ success: true, data: record });
    }
    const ctx = { sessionId: '', territoryId: 'RDM', userId: 'system', timestamp: new Date(), federations: [], traceId: '' };
    const graph = await mnemos.getKnowledgeGraph(ctx);
    return Response.json({ success: true, data: graph });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
