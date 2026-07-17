import { argus } from '@/isabella/skills/argus';
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
    const scenarioDefinition = val(body, ['scenario_definition', 'scenarioDefinition']) as Record<string, unknown>;
    const timeHorizon = val(body, ['time_horizon', 'timeHorizon']) as string;
    const dimensions = val(body, ['dimensions']) as string[];
    const constraints = val(body, ['constraints']) as Record<string, unknown>;
    if (!scenarioDefinition || !timeHorizon || !dimensions) {
      return Response.json({ success: false, error: 'Faltan campos requeridos: scenario_definition/scenarioDefinition, time_horizon/timeHorizon, dimensions' }, { status: 400 });
    }
    const ctx = {
      sessionId: `sim-${crypto.randomUUID().slice(0, 12)}`,
      territoryId: 'RDM',
      userId: (val(body, ['user_id', 'userId']) as string) ?? 'anonymous',
      timestamp: new Date(),
      federations: dimensions,
      traceId: createTraceId(),
    };
    const result = await argus.simulate({ scenarioDefinition: scenarioDefinition as ArgusSimulationInput['scenarioDefinition'], timeHorizon, dimensions, constraints: constraints ?? {} }, ctx);
    return Response.json({
      success: true,
      data: {
        simulations: result.simulations.map(s => ({ scenario_id: s.scenarioId, outcomes: { [s.dimension]: s.expectedOutcome }, assumptions: [`Probabilidad: ${s.probability}`, `Confianza: ${s.confidence}`] })),
        risk_profile: { overall_risk_level: result.riskProfile.length > 1 ? 'alto' : result.riskProfile.length === 1 ? 'medio' : 'bajo', dimension_risks: result.riskProfile.map(r => ({ dimension: r.dimension, probability: r.probability, severity: r.severity === 'critical' ? 1.0 : r.severity === 'high' ? 0.7 : r.severity === 'medium' ? 0.4 : 0.1 })) },
        recommendations: result.recommendations,
      },
      trace_id: ctx.traceId,
    });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
