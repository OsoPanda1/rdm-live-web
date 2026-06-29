// ============================================================================
// RDM Digital OS — Pagination Service v2
// Estandarización avanzada de paginación (page/offset + cursor) para APIs
// ============================================================================

export interface PaginationParams {
  page?: number;          // 1-based
  pageSize?: number;      // items per page
  sortBy?: string;
  sortDir?: "asc" | "desc";
  offset?: number;        // opcional, para endpoints que usen offset
  cursor?: string | null; // opcional, para cursor-based
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  // Para UX: URL o hint para siguiente página/cursor
  nextCursor?: string | null;
  prevCursor?: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Normaliza page y pageSize con límites razonables.
 */
function normalizePageParams(params: PaginationParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  return { page, pageSize };
}

/**
 * Pagina un array en memoria usando page/pageSize (clásico).
 * Soporta sort opcional via sortFn.
 */
export function paginateArray<T>(
  items: T[],
  params: PaginationParams = {},
  sortFn?: (a: T, b: T) => number,
): PaginatedResult<T> {
  const { page, pageSize } = normalizePageParams(params);

  let sorted = items;
  if (sortFn) {
    // Copia defensiva solo si hay sort
    sorted = [...items].sort(sortFn);
  }

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  const data = sorted.slice(offset, offset + pageSize);

  const meta: PaginationMeta = {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    nextCursor: null,
    prevCursor: null,
  };

  return { data, meta };
}

/**
 * Cursor simple basado en índice (para in-memory).
 * En producción se suele basar en IDs/createdAt para evitar saltos. [web:324][web:331]
 */
export interface CursorInfo {
  cursor?: string | null;
  limit?: number;
}

export interface CursorResult<T> {
  data: T[];
  nextCursor: string | null;
}

/**
 * Pagina con cursor (pensado para infinitescroll / "load more").
 * El cursor es un índice codificado en base64 para evitar exponer offset crudo.
 */
export function paginateArrayWithCursor<T>(
  items: T[],
  cursorInfo: CursorInfo = {},
  sortFn?: (a: T, b: T) => number,
): CursorResult<T> {
  const limit = Math.min(100, Math.max(1, cursorInfo.limit ?? 20));

  let sorted = items;
  if (sortFn) {
    sorted = [...items].sort(sortFn);
  }

  const totalItems = sorted.length;

  const startIndex = cursorInfo.cursor
    ? parseInt(Buffer.from(cursorInfo.cursor, "base64").toString("utf8"), 10) || 0
    : 0;

  const data = sorted.slice(startIndex, startIndex + limit);

  const nextIndex = startIndex + data.length;
  const nextCursor =
    nextIndex < totalItems
      ? Buffer.from(String(nextIndex), "utf8").toString("base64")
      : null;

  return { data, nextCursor };
}

/**
 * Extrae parámetros de paginación de un query object (Express / Hono / etc.).
 * Incluye soporte para:
 *  - page/pageSize
 *  - offset (para compatibilidad)
 *  - cursor (para infinitescroll)
 */
export function extractPaginationParams(
  query: Record<string, unknown>,
): PaginationParams {
  const page =
    typeof query.page === "string"
      ? Math.max(1, parseInt(query.page, 10) || 1)
      : undefined;

  const pageSize =
    typeof query.pageSize === "string"
      ? Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20))
      : undefined;

  const offset =
    typeof query.offset === "string"
      ? Math.max(0, parseInt(query.offset, 10) || 0)
      : undefined;

  const cursor =
    typeof query.cursor === "string" && query.cursor.length > 0
      ? query.cursor
      : undefined;

  const sortBy =
    typeof query.sortBy === "string" && query.sortBy.length > 0
      ? query.sortBy
      : undefined;

  const sortDir =
    query.sortDir === "desc" || query.sortDir === "ASC" || query.sortDir === "DESC"
      ? "desc"
      : "asc";

  return {
    page,
    pageSize,
    offset,
    cursor,
    sortBy,
    sortDir,
  };
}

/**
 * Helper para construir metadatos de paginación para la API,
 * útil para dashboards con skeleton loading y navegación elegante. [web:329][web:332]
 */
export function buildPaginationMeta<T>(
  data: T[],
  totalItems: number,
  params: PaginationParams,
): PaginationMeta {
  const { page, pageSize } = normalizePageParams(params);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    nextCursor: undefined,
    prevCursor: undefined,
  };
}
