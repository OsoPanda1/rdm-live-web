import type { InvocationContext, InvocationResult } from "../sandbox/types.js";

export interface BatchConfig {
  enabled: boolean;
  maxBatchWindowMs: number;
  maxBatchSize: number;
}

interface BatchEntry {
  inv: InvocationContext;
  resolve: (result: InvocationResult) => void;
  reject: (err: Error) => void;
}

interface BatchKey {
  pluginId: string;
  operation: string;
}

export class Batcher {
  private batches: Map<string, BatchEntry[]> = new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private readonly config: BatchConfig;
  private processor: (batch: InvocationContext[]) => Promise<InvocationResult[]>;

  constructor(config: BatchConfig, processor: (batch: InvocationContext[]) => Promise<InvocationResult[]>) {
    this.config = config;
    this.processor = processor;
  }

  submit(inv: InvocationContext): Promise<InvocationResult> {
    return new Promise((resolve, reject) => {
      const key = this.makeKey(inv);
      if (!this.batches.has(key)) {
        this.batches.set(key, []);
      }
      const batch = this.batches.get(key)!;
      batch.push({ inv, resolve, reject });

      if (batch.length >= this.config.maxBatchSize) {
        this.flushBatch(key);
      } else if (!this.timers.has(key)) {
        const timer = setTimeout(() => this.flushBatch(key), this.config.maxBatchWindowMs);
        this.timers.set(key, timer);
      }
    });
  }

  start(): void {}

  async stop(): Promise<void> {
    for (const [key] of this.timers) {
      this.flushBatch(key);
    }
  }

  private makeKey(inv: InvocationContext): string {
    return `${inv.pluginId}:${inv.operation}`;
  }

  private flushBatch(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }

    const batch = this.batches.get(key);
    if (!batch || batch.length === 0) {
      this.batches.delete(key);
      return;
    }
    this.batches.delete(key);

    const contexts = batch.map((e) => e.inv);
    this.processor(contexts)
      .then((results) => {
        for (let i = 0; i < batch.length; i++) {
          batch[i].resolve(results[i] ?? {
            statusCode: 500,
            payload: { error: "No result from batch processor" },
            latencyMs: 0,
          });
        }
      })
      .catch((err) => {
        for (const entry of batch) {
          entry.reject(err);
        }
      });
  }
}
