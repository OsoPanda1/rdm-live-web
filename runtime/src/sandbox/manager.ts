import type { PluginConfig } from "../manifest/types.js";
import type { InstancePool, InvocationContext, InvocationResult, PoolConfig, PoolStats, WasmInstance } from "./types.js";

class SimplePool implements InstancePool {
  private active = 0;
  private idle: WasmInstance[] = [];
  private invocations = 0;
  private totalLatency = 0;
  private rejections = 0;
  private readonly config: PoolConfig;

  constructor(config: PoolConfig) {
    this.config = config;
  }

  async acquire(): Promise<WasmInstance> {
    if (this.active >= this.config.maxConcurrentInvokes) {
      this.rejections++;
      throw new Error(`Pool capacity reached for ${this.config.pluginId}`);
    }

    if (this.idle.length > 0) {
      this.active++;
      return this.idle.pop()!;
    }

    this.active++;
    return this.createInstance();
  }

  async release(inst: WasmInstance): Promise<void> {
    this.active--;
    if (this.idle.length < this.config.maxInstances - this.config.minWarmInstances) {
      this.idle.push(inst);
    } else {
      await inst.close();
    }
  }

  async warm(): Promise<void> {
    const count = Math.min(
      this.config.minWarmInstances - (this.idle.length + this.active),
      this.config.maxInstances,
    );
    for (let i = 0; i < count; i++) {
      const inst = this.createInstance();
      this.idle.push(await inst);
    }
  }

  stats(): PoolStats {
    return {
      pluginId: this.config.pluginId,
      activeInstances: this.active,
      idleInstances: this.idle.length,
      totalInvocations: this.invocations,
      avgLatencyMs: this.invocations > 0 ? this.totalLatency / this.invocations : 0,
      rejectionsDueToPool: this.rejections,
    };
  }

  private async createInstance(): Promise<WasmInstance> {
    return {
      invoke: async (ctx: InvocationContext, op: string, payload: unknown): Promise<InvocationResult> => {
        const start = Date.now();
        this.invocations++;
        try {
          return {
            statusCode: 200,
            payload: { op, result: payload },
            latencyMs: Date.now() - start,
          };
        } finally {
          this.totalLatency += Date.now() - start;
        }
      },
      close: async () => {},
    };
  }
}

export class SandboxManager {
  private pools: Map<string, InstancePool> = new Map();

  getPool(pluginId: string): InstancePool {
    const pool = this.pools.get(pluginId);
    if (!pool) throw new Error(`No pool found for plugin: ${pluginId}`);
    return pool;
  }

  registerPlugin(config: PluginConfig): InstancePool {
    const poolConfig: PoolConfig = {
      pluginId: config.id,
      minWarmInstances: 2,
      maxInstances: 10,
      idleTimeoutSeconds: 60,
      maxConcurrentInvokes: config.quotas.max_concurrent,
      riskLevel: config.risk_level,
      sandboxProfile: config.sandbox_profile,
    };

    const pool = new SimplePool(poolConfig);
    this.pools.set(config.id, pool);
    return pool;
  }

  async invoke(ctx: InvocationContext): Promise<InvocationResult> {
    const pool = this.getPool(ctx.pluginId);
    const inst = await pool.acquire();
    try {
      return await inst.invoke(ctx, ctx.operation, ctx.payload);
    } finally {
      await pool.release(inst);
    }
  }

  allStats(): PoolStats[] {
    return Array.from(this.pools.values()).map((p) => p.stats());
  }
}
