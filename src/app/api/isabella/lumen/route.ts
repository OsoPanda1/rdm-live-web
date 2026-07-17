import { lumen } from '@/isabella/skills/lumen';
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
    const actionRequest = val(body, ['action_request', 'actionRequest']) as Record<string, unknown>;
    const policyContext = val(body, ['policy_context', 'policyContext']) as Record<string, unknown>;
    const riskLevel = val(body, ['risk_level', 'riskLevel']) as string;
    if (!actionRequest) {
      return Response.json({ success: false, error: 'Faltan campos requeridos: action_request/actionRequest' }, { status: 400 });
    }
    const ctx = {
      sessionId: `lumen-${crypto.randomUUID().slice(0, 12)}`,
      territoryId: 'RDM',
      userId: (actionRequest as Record<string, unknown>)?.initiatedBy as string ?? (val(body, ['user_id', 'userId']) as string) ?? 'anonymous',
      timestamp: new Date(),
      federations: (policyContext as Record<string, unknown>)?.applicablePolicies as string[] ?? [],
      traceId: createTraceId(),
    };
    const result = await lumen.evaluate({
      actionRequest: actionRequest as LumenEvaluateInput['actionRequest'],
      policyContext: { applicablePolicies: (policyContext as Record<string, unknown>)?.applicablePolicies as string[] ?? [], riskLevel: riskLevel ?? (policyContext as Record<string, unknown>)?.riskLevel as string ?? 'bajo' },
    }, ctx);
    return Response.json({ success: true, data: { decision: result.decision, rationale: result.rationale, log_entry: result.logEntry }, trace_id: ctx.traceId });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const constitution = lumen.getConstitution();
    const stats = lumen.getStats();
    return Response.json({ success: true, data: { constitution, stats } });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
