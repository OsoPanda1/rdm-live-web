interface VercelRequest {
  method?: string;
}

interface VercelResponse {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  uptime: number;
  region: string;
  cells: Array<{ id: string; endpoint: string; status: string; latency: number }>;
  federations: Array<{ name: string; status: string }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = performance.now();

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, max-age=60');

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const federationStatuses = [
      { name: 'F1 - Gobernanza', status: 'operational' },
      { name: 'F2 - Identidad y Acceso', status: 'operational' },
      { name: 'F3 - Datos Territoriales', status: 'operational' },
      { name: 'F4 - Comercio y Monetización', status: 'operational' },
      { name: 'F5 - IA Cognitiva', status: 'operational' },
      { name: 'F6 - Comunidad y Contenido', status: 'operational' },
      { name: 'F7 - Observabilidad y Seguridad', status: 'operational' },
    ];

    // Real Supabase connectivity check
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        const start = Date.now();
        await supabase.from("profiles").select("id", { count: "exact", head: true });
        const dbLatency = Date.now() - start;
        if (dbLatency > 500) {
          federationStatuses[2].status = 'degraded'; // F3 - Datos
        }
      } catch {
        federationStatuses[2].status = 'critical';
      }
    }

    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime?.() || 0,
      region: process.env.VERCEL_REGION || 'unknown',
      cells: [
        {
          id: 'supabase-db',
          endpoint: supabaseUrl || 'not-configured',
          status: federationStatuses[2].status,
          latency: 0,
        },
      ],
      federations: federationStatuses,
    };

    const degraded = healthStatus.federations.some((f) => f.status !== 'operational');
    if (degraded) {
      healthStatus.status = 'degraded';
    }

    const executionTime = performance.now() - startTime;

    return res.status(healthStatus.status === 'critical' ? 503 : 200).json({
      success: true,
      data: healthStatus,
      performance: { executionTime },
    });
  } catch (err) {
    const executionTime = performance.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    return res.status(500).json({
      success: false,
      status: 'critical',
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: errorMessage,
      },
      performance: { executionTime },
      timestamp: new Date().toISOString(),
    });
  }
}
