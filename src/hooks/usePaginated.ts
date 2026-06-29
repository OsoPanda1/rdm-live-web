import { useCallback, useEffect, useState } from "react";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Generic paginated data hook.
 * Expects backend to return either:
 *   { data, page, pageSize, totalItems, totalPages }  (standard)
 *   { items, pagination: { page, pageSize, total, totalPages } }  (current in-memory format)
 */
export function usePaginated<T>(
  basePath: string,
  initialPage = 1,
  pageSize = 12,
  extraParams: Record<string, string> = {},
) {
  const [page, setPage] = useState(initialPage);
  const [result, setResult] = useState<PaginatedResponse<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPage = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
        const url = new URL(`${baseUrl}${basePath}`, window.location.origin);
        url.searchParams.set("page", String(targetPage));
        url.searchParams.set("pageSize", String(pageSize));
        Object.entries(extraParams).forEach(([k, v]) => {
          if (v) url.searchParams.set(k, v);
        });

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();

        // Normalize response format
        let normalized: PaginatedResponse<T>;
        if (json.data && typeof json.totalItems === "number") {
          normalized = json as PaginatedResponse<T>;
        } else if (json.items && json.pagination) {
          normalized = {
            data: json.items,
            page: json.pagination.page,
            pageSize: json.pagination.pageSize,
            totalItems: json.pagination.total ?? json.pagination.totalItems,
            totalPages: json.pagination.totalPages,
          };
        } else if (Array.isArray(json)) {
          normalized = {
            data: json,
            page: 1,
            pageSize: json.length,
            totalItems: json.length,
            totalPages: 1,
          };
        } else {
          normalized = {
            data: [],
            page: 1,
            pageSize,
            totalItems: 0,
            totalPages: 1,
          };
        }

        setResult(normalized);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [basePath, pageSize, JSON.stringify(extraParams)],
  );

  useEffect(() => {
    void fetchPage(page);
  }, [page, fetchPage]);

  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, p));
  }, []);

  const nextPage = useCallback(() => {
    setPage((p) => (result && p < result.totalPages ? p + 1 : p));
  }, [result]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  return {
    data: result?.data ?? null,
    meta: result
      ? {
          page: result.page,
          pageSize: result.pageSize,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
        }
      : null,
    loading,
    error,
    page,
    goToPage,
    nextPage,
    prevPage,
  };
}
