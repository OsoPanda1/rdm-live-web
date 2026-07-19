import type { PluginConfig } from "../manifest/types.js";
import type { InstancePool, InvocationContext, InvocationResult, PoolConfig, PoolStats, WasmInstance } from "./types.js";
import { WitHostAdapter, Capability, type WitHostImports } from "./wit-host-adapter.js";

class WITCompliantPool implements InstancePool {
  private active = 0;
  private idle: WasmInstance[] = [];
  private invocations = 0;
  private totalLatency = 0;
  private rejections = 0;
  private readonly config: PoolConfig;
  private readonly pluginId: string;

  constructor(config: PoolConfig) {
    this.config = config;
    this.pluginId = config.pluginId;
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
    // Create a minimal WASM runtime instance with WIT-defined imports
    const hostImports: WitHostImports = {
      log: (level, message) => {
        this.checkCapability(Capability.LogTelemetry, "log");
        const prefix = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR"][level] ?? "UNKNOWN";
        console.log(`[WASM:${this.pluginId}] ${prefix}: ${message}`);
      },
      kvGet: (key) => {
        this.checkCapability(Capability.ReadKv, "kvGet");
        return null;
      },
      kvSet: (_key, _value) => {
        this.checkCapability(Capability.WriteKv, "kvSet");
      },
      kvDelete: (_key) => {
        this.checkCapability(Capability.WriteKv, "kvDelete");
      },
      emitMetric: (_name, _value, _labels) => {
        this.checkCapability(Capability.LogTelemetry, "emitMetric");
      },
      routeToFederation: (_event) => {
        this.checkCapability(Capability.EmitSovereigntyEvent, "routeToFederation");
        return "accepted";
      },
      queryPois: (_within, _maxResults) => {
        this.checkCapability(Capability.QueryTerritorial, "queryPois");
        return { matches: [], count: 0, truncated: false };
      },
    };

    // Declared capabilities come from the plugin config's risk profile
    const declaredCaps = this.resolveCapabilities(this.config.riskLevel);

    // Create the inner instance and wrap with WIT adapter
    return new WitHostAdapter(
      this.createInnerInstance(),
      this.pluginId,
      declaredCaps,
      hostImports,
    );
  }

  private createInnerInstance(): WasmInstance {
    // Stub WASM instance — in production, this loads the actual WASM binary
    // via WebAssembly.instantiate() with the WIT-generated imports.
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

  private resolveCapabilities(riskLevel: string): Capability[] {
    switch (riskLevel) {
      case "sandboxed":
        return [Capability.LogTelemetry];
      case "low":
        return [Capability.LogTelemetry, Capability.ReadKv, Capability.CryptoHash];
      case "medium":
        return [Capability.LogTelemetry, Capability.ReadKv, Capability.WriteKv, Capability.CryptoHash, Capability.QueryTerritorial];
      case "high":
        return Object.values(Capability);
      default:
        return [Capability.LogTelemetry];
    }
  }

  private checkCapability(cap: Capability, method: string): void {
    // Runtime capability check: thrown errors are caught by the WIT adapter
    if (!this.resolveCapabilities(this.config.riskLevel).includes(cap)) {
      throw new Error(`[WIT GUARD] Capability '${cap}' denied for ${this.pluginId} (risk=${this.config.riskLevel}) in ${method}`);
    }
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

    const pool = new WITCompliantPool(poolConfig);
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
