// Minimal shim for framework-agnostic API context.
export interface APIContext {
  request: Request;
  params?: Record<string, string>;
  url?: URL;
}
