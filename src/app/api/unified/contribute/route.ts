import { unifiedSDK } from '@/core/unified/UnifiedSDK';
import type { ContributionType } from '@/core/territorial/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, coords, territorio, payload, poiId } = body;

    if (!userId || !type || !coords || !payload) {
      return Response.json(
        { success: false, error: 'Faltan campos requeridos: userId, type, coords, payload' },
        { status: 400 }
      );
    }

    const validTypes: ContributionType[] = ['checkin', 'review', 'photo', 'rating', 'tip', 'event_report', 'route_trace', 'poi_suggestion'];
    if (!validTypes.includes(type)) {
      return Response.json(
        { success: false, error: `Tipo invalido: ${type}. Validos: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const result = unifiedSDK.recordContribution(
      userId,
      type,
      { lat: coords.lat, lng: coords.lng },
      territorio ?? 'RDM',
      payload,
      poiId
    );

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
