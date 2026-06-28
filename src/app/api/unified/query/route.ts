import { unifiedSDK } from '@/core/unified/UnifiedSDK';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, userId, coords } = body;

    if (!text || !userId) {
      return Response.json(
        { success: false, error: 'Faltan campos requeridos: text, userId' },
        { status: 400 }
      );
    }

    const result = await unifiedSDK.queryTerritory(
      text,
      userId,
      coords ? { lat: coords.lat, lng: coords.lng } : undefined
    );

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
