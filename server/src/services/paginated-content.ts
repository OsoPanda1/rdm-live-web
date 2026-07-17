export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  q?: string;
}

export function normalizePagination(query: PaginationQuery, maxPageSize = 50) {
  const page = Math.max(1, Number.isFinite(query.page) ? Number(query.page) : 1);
  const pageSize = Math.max(1, Math.min(maxPageSize, Number.isFinite(query.pageSize) ? Number(query.pageSize) : 12));
  const q = (query.q ?? "").trim().toLowerCase();
  return { page, pageSize, q };
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  return { page, pageSize, totalItems, totalPages, data: items.slice(start, start + pageSize) };
}
