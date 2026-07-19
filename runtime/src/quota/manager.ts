import type { PluginConfig } from "../manifest/types.js";

interface QuotaBucket {
  used: number;
  resetAt: number;
}

export class QuotaExceededError extends Error {
  constructor(public readonly limit: string, public readonly current: number, public readonly max: number) {
    super(`Quota exceeded: ${limit} (${current}/${max})`);
    this.name = "QuotaExceededError";
  }
}

export class QuotaManager {
  private buckets: Map<string, QuotaBucket> = new Map();
  private readonly windowMs: number;

  constructor(windowMs = 1000) {
    this.windowMs = windowMs;
  }

  checkConcurrent(pluginId: string, config: PluginConfig): void {
    const key = `concurrent:${pluginId}`;
    const bucket = this.getBucket(key);
    const max = config.quotas.max_concurrent;

    if (bucket.used >= max) {
      throw new QuotaExceededError(`concurrent_${pluginId}`, bucket.used, max);
    }
    bucket.used++;
  }

  releaseConcurrent(pluginId: string): void {
    const key = `concurrent:${pluginId}`;
    const bucket = this.getBucket(key);
    bucket.used = Math.max(0, bucket.used - 1);
  }

  checkGlobalConcurrent(): boolean {
    const key = "global:concurrent";
    const bucket = this.getBucket(key);
    return bucket.used < 100;
  }

  trackInvocation(pluginId: string): void {
    const key = `total:${pluginId}`;
    const bucket = this.getBucket(key, 60000);
    bucket.used++;
  }

  private getBucket(key: string, windowMs?: number): QuotaBucket {
    const ttl = windowMs ?? this.windowMs;
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      bucket = { used: 0, resetAt: now + ttl };
      this.buckets.set(key, bucket);
    }

    return bucket;
  }

  reset(): void {
    this.buckets.clear();
  }
}
