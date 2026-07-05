const ALLOWED_ORIGINS = [
  "https://rdm-digital.vercel.app",
  "https://rdm-digital-hub.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
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
