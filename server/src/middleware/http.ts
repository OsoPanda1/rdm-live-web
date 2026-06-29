import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function sendError(res: Response, status: number, code: string, message: string, details?: unknown) {
  return res.status(status).json({ code, message, details });
}

export function notFoundHandler(_req: Request, res: Response) {
  return sendError(res, 404, "NOT_FOUND", "Resource not found");
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return sendError(res, err.status, err.code, err.message, err.details);
  }

  // eslint-disable-next-line no-console
  console.error("Unhandled API error", err);
  return sendError(res, 500, "INTERNAL_ERROR", "Internal server error");
}
