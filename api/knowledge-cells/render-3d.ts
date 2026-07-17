import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RenderRequest {
  operation: 'render' | 'sync-audio' | 'update-color';
  payload: Record<string, unknown>;
  context?: { userId?: string; sessionId?: string };
}

function analyzeFrequencies(signal: number[]): Record<string, number> {
  if (!signal || signal.length < 20) {
    return { bass: 0, mid: 0, treble: 0 };
  }
  return {
    bass: signal.slice(0, 5).reduce((a, b) => a + b, 0) / 5,
    mid: signal.slice(5, 15).reduce((a, b) => a + b, 0) / 10,
    treble: signal.slice(15, 20).reduce((a, b) => a + b, 0) / 5,
  };
}

function calculateImmersion(frequencies: Record<string, number>): number {
  const total = Object.values(frequencies).reduce((a, b) => a + b, 0);
  return Math.min(total / 300, 1);
}

function frequencyToColor(frequency: number): string {
  const hue = (frequency % 360).toString();
  return `hsl(${hue}, 100%, 50%)`;
}

async function performRender(payload: Record<string, unknown>) {
  const startTime = Date.now();

  // Simular renderizado
  const renderTime = Math.random() * 50 + 10;
  await new Promise((resolve) => setTimeout(resolve, renderTime));

  return {
    status: 'rendered',
    gltfHash: `gltf_${Date.now()}_${Math.random().toString(36).slice(7)}`,
    meshCount: 1,
    vertexCount: 24,
    triangleCount: 12,
    renderTime,
    totalTime: Date.now() - startTime,
    lightConfig: (payload as Record<string, unknown>).lightConfig || { intensity: 1.0, color: '#ffffff' },
    metadata: {
      renderer: 'WebGL2',
      shaders: ['vertex', 'fragment'],
      extensions: ['KHR_lights_punctual', 'KHR_materials_specular'],
    },
  };
}

async function syncAudio(payload: Record<string, unknown>) {
  const audioSignal = (payload.audioSignal as number[]) || [];
  const frequencyBands = analyzeFrequencies(audioSignal);
  const immersion = calculateImmersion(frequencyBands);

  return {
    status: 'synced',
    frequencyBands,
    spatialAudioEnabled: true,
    immersionLevel: immersion,
    audioConfig: {
      sampleRate: (payload.sampleRate as number) || 44100,
      channels: (payload.channels as number) || 2,
      bitDepth: (payload.bitDepth as number) || 16,
    },
  };
}

async function updateColor(payload: Record<string, unknown>) {
  const frequency = (payload.frequency as number) || 440;
  const targetColor = frequencyToColor(frequency);

  return {
    status: 'updated',
    color: targetColor,
    frequency,
    transitionDuration: (payload.transitionDuration as number) || 300,
    easing: (payload.easing as string) || 'easeInOutQuad',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Cell-Type', 'Render3D');
  res.setHeader('X-Cell-Version', '1.0.0');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST for render-3d operations' },
    });
  }

  try {
    const { operation, payload, context } = req.body as RenderRequest;

    if (!operation || !['render', 'sync-audio', 'update-color'].includes(operation)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OPERATION',
          message: `Operation '${operation}' not supported. Use: render, sync-audio, update-color`,
        },
      });
    }

    let result: Record<string, unknown>;

    switch (operation) {
      case 'render':
        result = await performRender(payload || {});
        break;
      case 'sync-audio':
        result = await syncAudio(payload || {});
        break;
      case 'update-color':
        result = await updateColor(payload || {});
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const executionTime = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      data: result,
      performance: { executionTime, startTime },
      timestamp: new Date().toISOString(),
      context: { userId: context?.userId, sessionId: context?.sessionId },
    });
  } catch (err) {
    const executionTime = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      error: {
        code: 'RENDER_3D_ERROR',
        message: errorMessage,
      },
      performance: { executionTime },
      timestamp: new Date().toISOString(),
    });
  }
}
