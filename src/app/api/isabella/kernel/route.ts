import { kernelResonance, kernelCronoAnamnesis, kernelEmpatiaAntifragil, kernelTransduccionEstetica, kernelOmnipresenciaMesh } from '@/isabella/kernel';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case 'resonance': {
        const result = await kernelResonance.getResonanceState();
        return Response.json({ success: true, data: result });
      }
      case 'timeup_anchor': {
        const { anchorId, reason, snapshot } = payload ?? {};
        if (!anchorId || !reason) return Response.json({ success: false, error: 'Faltan anchorId o reason' }, { status: 400 });
        const result = await kernelCronoAnamnesis.createAnchor(anchorId, reason, snapshot ?? {});
        return Response.json({ success: true, data: result });
      }
      case 'timeup_diff': {
        const { anchorA, anchorB } = payload ?? {};
        if (!anchorA || !anchorB) return Response.json({ success: false, error: 'Faltan anchorA o anchorB' }, { status: 400 });
        const result = await kernelCronoAnamnesis.diffAnchors(anchorA, anchorB);
        return Response.json({ success: true, data: result });
      }
      case 'empatia': {
        const logs = payload?.hostilityLogs ?? [];
        const result = await kernelEmpatiaAntifragil.synthesize(logs);
        return Response.json({ success: true, data: result });
      }
      case 'transduccion': {
        const telemetry = payload?.telemetry ?? { systemHealth: 0.8, activity: 0.5, adoption: 0.3 };
        const result = await kernelTransduccionEstetica.translate(telemetry);
        return Response.json({ success: true, data: result });
      }
      case 'mesh': {
        const nodes = payload?.nodes ?? [];
        const result = await kernelOmnipresenciaMesh.evaluateMesh(nodes);
        return Response.json({ success: true, data: result });
      }
      default:
        return Response.json({ success: false, error: `Accion desconocida: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
