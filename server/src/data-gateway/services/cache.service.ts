const DEFAULT_TTL_MS = 300_000;

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

function now() {
  return Date.now();
}

export const cacheService = {
  get<T>(key: string): T | null {
    const entry = store.get(key);
    if (!entry) return null;
    if (now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value as T;
  },

  set(key: string, value: unknown, ttlMs?: number): void {
    store.set(key, {
      value,
      expiresAt: now() + (ttlMs ?? DEFAULT_TTL_MS),
    });
  },

  delete(key: string): boolean {
    return store.delete(key);
  },

  clear(): void {
    store.clear();
  },

  invalidateByPrefix(prefix: string): number {
    let count = 0;
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) {
        store.delete(key);
        count++;
      }
    }
    return count;
  },

  size(): number {
    return store.size;
  },
};
