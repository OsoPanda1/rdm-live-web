import { logger } from '@/lib/logger';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function badRequest(message: string, details?: Record<string, unknown>): ApiError {
  return new ApiError(message, 400, 'BAD_REQUEST', details);
}

export function unauthorized(message = 'No autorizado'): ApiError {
  return new ApiError(message, 401, 'UNAUTHORIZED');
}

export function forbidden(message = 'Acceso denegado'): ApiError {
  return new ApiError(message, 403, 'FORBIDDEN');
}

export function notFound(message = 'Recurso no encontrado'): ApiError {
  return new ApiError(message, 404, 'NOT_FOUND');
}

export function tooManyRequests(message = 'Demasiadas solicitudes'): ApiError {
  return new ApiError(message, 429, 'RATE_LIMITED');
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.statusCode },
    );
  }

  const message = error instanceof Error ? error.message : 'Error interno del servidor';
  logger.error('[API] Error no manejado', { error });

  return Response.json(
    { success: false, error: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
    { status: 500 },
  );
}

export function apiResponse(data: unknown, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}
