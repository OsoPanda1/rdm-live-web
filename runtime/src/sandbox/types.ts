export type PluginID = string;

export interface InvocationContext {
  pluginId: PluginID;
  sessionTicketId: string;
  operation: string;
  payload: unknown;
  deadlineMs: number;
}

export interface InvocationResult {
  statusCode: number;
  payload: unknown;
  latencyMs: number;
}

export interface WasmInstance {
  invoke(ctx: InvocationContext, op: string, payload: unknown): Promise<InvocationResult>;
  close(): Promise<void>;
}

export interface PoolConfig {
  pluginId: PluginID;
  minWarmInstances: number;
  maxInstances: number;
  idleTimeoutSeconds: number;
  maxConcurrentInvokes: number;
  riskLevel: string;
  sandboxProfile: string;
}

export interface PoolStats {
  pluginId: PluginID;
  activeInstances: number;
  idleInstances: number;
  totalInvocations: number;
  avgLatencyMs: number;
  rejectionsDueToPool: number;
}

export interface InstancePool {
  acquire(): Promise<WasmInstance>;
  release(inst: WasmInstance): Promise<void>;
  warm(): Promise<void>;
  stats(): PoolStats;
}
