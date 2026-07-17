// api/_shared/cors.js — CORS unificado para Vercel Serverless/Edge Functions
// Fuente de verdad para CORS en api/

const PRODUCTION_ORIGINS = [
  "https://www.visitarealdelmonte.online",
  "https://visitarealdelmonte.online",
  "https://rdm-digital-hub.vercel.app",
];

const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8888",
];

function getAllOrigins() {
  const isProd = process.env.NODE_ENV === "production";
  return isProd ? PRODUCTION_ORIGINS : [...PRODUCTION_ORIGINS, ...DEV_ORIGINS];
}

export function getCorsHeaders(request) {
  const origin = request.headers.get("origin");
  const allowed = getAllOrigins();
  const allowedOrigin = origin && allowed.includes(origin) ? origin : allowed[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Id",
    "Access-Control-Max-Age": "86400",
  };
}

export function corsPreflightResponse(request) {
  return new Response(null, {
    status: 204,
    headers: {
      ...getCorsHeaders(request),
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}

export function corsJsonResponse(request, body, status, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
      ...getCorsHeaders(request),
      ...(extraHeaders || {}),
    },
  });
}
