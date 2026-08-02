const ALLOWED_ORIGINS = [
  "https://rdm-digital.vercel.app",
  "https://rdm-digital-hub.vercel.app",
  "https://rdm-digital-hub-ldtocs.vercel.app",
  "https://www.visitarealdelmonte.online",
  "https://visitarealdelmonte.online",
  "http://localhost:3000",
  "http://localhost:5173",
];

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  return false;
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req.headers.get("origin")),
    });
  }
  return null;
}

export function corsPreflightResponse(req: Request): Response {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get("origin")) });
}

export function corsJsonResponse(
  req: Request,
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
  ) : Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      "Content-Type": "application/json",
      "Acccess-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods":
"GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...(extraHeaders ?? {}),
    },
  });
}
