import { logger } from '@/lib/logger';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  del(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  stats(): { size: number; hits: number; misses: number };
}

class InMemoryCache implements CacheAdapter {
  private store = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private defaultTtlMs = 60_000) {
    this.cleanupInterval = setInterval(() => this.evictExpired(), 30_000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) { this.misses++; return null; }
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs) });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  async has(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  stats(): { size: number; hits: number; misses: number } {
    return { size: this.store.size, hits: this.hits, misses: this.misses };
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(key);
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

class RedisCache implements CacheAdapter {
  private client: { get: (k: string) => Promise<string | null>; set: (k: string, v: string, mode: string, ttl: number) => Promise<unknown>; del: (k: string) => Promise<number> } | null = null;
  private hits = 0;
  private misses = 0;

  async connect(url: string): Promise<void> {
    try {
      const { createClient } = await import('redis');
      this.client = createClient({ url }) as unknown as RedisCache['client'];
      (this.client as unknown as { connect: () => Promise<void> }).connect();
    } catch {
      logger.warn('[Cache] Redis no disponible, usando fallback a InMemoryCache');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    const raw = await this.client.get(key);
    if (!raw) { this.misses++; return null; }
    this.hits++;
    return JSON.parse(raw) as T;
  }

  async set<T>(key: string, value: T, ttlMs = 60_000): Promise<void> {
    if (this.client) {
      await this.client.set(key, JSON.stringify(value), 'PX', ttlMs);
    }
  }

  async del(key: string): Promise<void> {
    if (this.client) {
      await this.client.del(key);
    }
  }

  async clear(): Promise<void> {
    this.hits = 0;
    this.misses = 0;
  }

  async has(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }

  stats() {
    return { size: -1, hits: this.hits, misses: this.misses };
  }
}

const cacheInstance: CacheAdapter = new InMemoryCache();

function createCache(): CacheAdapter {
  if (typeof process !== 'undefined' && process.env.REDIS_URL) {
    const redis = new RedisCache();
    redis.connect(process.env.REDIS_URL);
    return redis;
  }
  return cacheInstance;
}

export const cache: CacheAdapter = createCache();
