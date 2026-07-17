import type { VercelRequest, VercelResponse } from "@vercel/node";

function absoluteUrl(req: VercelRequest): string {
  const host = req.headers.host || "localhost";
  const proto = (req.headers["x-forwarded-proto"] as string | undefined) || "https";
  const url = req.url || "/";
  return url.startsWith("http") ? url : `${proto}://${host}${url}`;
}

function normalizeHeaders(headers: VercelRequest["headers"]): Headers {
  const next = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const item of value) next.append(key, item);
    } else if (value !== undefined) {
      next.set(key, String(value));
    }
  }
  return next;
}

export function vercelRequestToWebRequest(req: VercelRequest): Request {
  const method = req.method || "GET";
  const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());
  const body = hasBody && req.body !== undefined
    ? typeof req.body === "string" || req.body instanceof Buffer
      ? req.body
      : JSON.stringify(req.body)
    : undefined;

  return new Request(absoluteUrl(req), {
    method,
    headers: normalizeHeaders(req.headers),
    body,
  });
}

export async function sendWebResponse(res: VercelResponse, response: Response) {
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const text = await response.text();
  return res.status(response.status).send(text);
}
