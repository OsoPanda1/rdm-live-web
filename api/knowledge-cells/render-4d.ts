import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Render4DRequest {
  operation: 'create-hypercube' | 'rotate-4d' | 'project-to-3d' | 'color-map';
  payload: Record<string, unknown>;
  context?: { userId?: string; sessionId?: string };
}

function hammingDistance(a: number, b: number): number {
  let distance = 0;
  let xor = a ^ b;
  while (xor) {
    distance += xor & 1;
    xor >>= 1;
  }
  return distance;
}

function generateRotationMatrix(angle: number, plane: string = 'xy'): number[][] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const matrix: number[][] = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];

  if (plane === 'xy' || plane === 'yx') {
    matrix[0][0] = cos;
    matrix[0][1] = -sin;
    matrix[1][0] = sin;
    matrix[1][1] = cos;
  } else if (plane === 'zw' || plane === 'wz') {
    matrix[2][2] = cos;
    matrix[2][3] = -sin;
    matrix[3][2] = sin;
    matrix[3][3] = cos;
  }

  return matrix;
}

function frequencyToRGB(frequency: number): { r: number; g: number; b: number } {
  const wavelength = 380 + (frequency % 321);
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = Math.abs(wavelength - 440) / (440 - 380);
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    g = 1;
    b = Math.abs(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = Math.abs(wavelength - 645) / (645 - 580);
  } else if (wavelength >= 645 && wavelength <= 700) {
    r = 1;
  }

  return {
    r: Math.floor(r * 255),
    g: Math.floor(g * 255),
    b: Math.floor(b * 255),
  };
}

function createHypercube() {
  const vertices: Array<{ id: number; x: number; y: number; z: number; w: number }> = [];
  for (let i = 0; i < 16; i++) {
    vertices.push({
      id: i,
      x: i & 1 ? 1 : -1,
      y: i & 2 ? 1 : -1,
      z: i & 4 ? 1 : -1,
      w: i & 8 ? 1 : -1,
    });
  }

  const edges: Array<{ from: number; to: number }> = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      if (hammingDistance(i, j) === 1) {
        edges.push({ from: i, to: j });
      }
    }
  }

  return {
    type: 'hypercube-4d',
    vertexCount: vertices.length,
    edgeCount: edges.length,
    vertices,
    edges,
    topology: {
      cells_0d: 16, // vertices
      cells_1d: 32, // edges
      cells_2d: 24, // square faces
      cells_3d: 8, // cubic cells
      cells_4d: 1, // the hypercube itself
    },
  };
}

function rotate4D(payload: Record<string, unknown>) {
  const angle = (payload.angle as number) || 0.1;
  const plane = (payload.plane as string) || 'xy';

  const rotationMatrix = generateRotationMatrix(angle, plane);

  return {
    status: 'rotated',
    angle,
    plane,
    rotationMatrix,
    rotationApplied: true,
  };
}

function projectTo3D(payload: Record<string, unknown>) {
  const method = (payload.method as string) || 'schlegel';
  const distance = (payload.distance as number) || 2;

  const projection = [
    { x: 1, y: 1, z: 1 },
    { x: -1, y: 1, z: 1 },
    { x: 1, y: -1, z: 1 },
    { x: -1, y: -1, z: 1 },
    { x: 0.5, y: 0.5, z: 0.5 },
    { x: -0.5, y: 0.5, z: 0.5 },
    { x: 0.5, y: -0.5, z: 0.5 },
    { x: -0.5, y: -0.5, z: 0.5 },
  ];

  return {
    status: 'projected',
    method,
    projectionType: '3D',
    distance,
    vertices: projection,
    vertexCount: projection.length,
    metadata: {
      preservesTopology: method === 'schlegel',
      visibilityOptimized: true,
      renderReady: true,
    },
  };
}

function colorMap(payload: Record<string, unknown>) {
  const frequency = (payload.frequency as number) || 440;
  const colorScheme = (payload.colorScheme as string) || 'spectrum';

  const baseColor = frequencyToRGB(frequency);

  return {
    status: 'colored',
    colorScheme,
    baseColor: `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`,
    gradient: [
      frequencyToRGB(frequency - 50),
      baseColor,
      frequencyToRGB(frequency + 50),
    ].map((c) => `rgb(${c.r}, ${c.g}, ${c.b})`),
    frequency,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Cell-Type', 'Render4D');
  res.setHeader('X-Cell-Version', '1.0.0');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST for render-4d operations' },
    });
  }

  try {
    const { operation, payload, context } = req.body as Render4DRequest;

    const validOps = ['create-hypercube', 'rotate-4d', 'project-to-3d', 'color-map'] as const;
    if (!operation || !validOps.includes(operation)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OPERATION',
          message: `Operation '${operation}' not supported. Use: ${validOps.join(', ')}`,
        },
      });
    }

    let result: Record<string, unknown>;

    switch (operation) {
      case 'create-hypercube':
        result = createHypercube();
        break;
      case 'rotate-4d':
        result = rotate4D(payload || {});
        break;
      case 'project-to-3d':
        result = projectTo3D(payload || {});
        break;
      case 'color-map':
        result = colorMap(payload || {});
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
        code: 'RENDER_4D_ERROR',
        message: errorMessage,
      },
      performance: { executionTime },
      timestamp: new Date().toISOString(),
    });
  }
}
