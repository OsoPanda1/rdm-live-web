import { getManifest } from "../manifest/loader.js";
import type { PluginConfig } from "../manifest/types.js";
import { SessionManager, SessionError } from "../session/manager.js";
import type { SessionConfig } from "../session/types.js";
import { validateIdentity, validateExecution } from "../security/validator.js";
import type { SecurityContext } from "../security/types.js";
import { SandboxManager } from "../sandbox/manager.js";
import type { InvocationContext, InvocationResult } from "../sandbox/types.js";
import { Batcher } from "./batch.js";
import type { BatchConfig } from "./batch.js";
import { QuotaManager, QuotaExceededError } from "../quota/manager.js";
import { TelemetryCollector } from "../telemetry/metrics.js";

export interface RuntimeConfig {
  signingKey: Buffer;
  sessionTTLMs: number;
  maxSessions: number;
}

export class RuntimeRouter {
  readonly session: SessionManager;
  readonly sandbox: SandboxManager;
  readonly quota: QuotaManager;
  readonly telemetry: TelemetryCollector;
  readonly batcher: Batcher | null;

  constructor(config: RuntimeConfig) {
    const manifest = getManifest();

    const sessionCfg: SessionConfig = {
      ttlMs: config.sessionTTLMs,
      maxSessions: config.maxSessions,
      signingKey: config.signingKey,
    };
    this.session = new SessionManager(sessionCfg);
    this.sandbox = new SandboxManager();
    this.quota = new QuotaManager();
    this.telemetry = new TelemetryCollector();

    for (const plugin of manifest.plugins) {
      this.sandbox.registerPlugin(plugin);
    }

    const perfConfig = manifest.performance_policies;
    if (perfConfig.enable_batching) {
      const batchCfg: BatchConfig = {
        enabled: true,
        maxBatchWindowMs: perfConfig.max_batch_window_ms,
        maxBatchSize: perfConfig.max_batch_size,
      };
      this.batcher = new Batcher(batchCfg, async (batch) => {
        const results: InvocationResult[] = [];
        for (const inv of batch) {
          try {
            results.push(await this.executeInvocation(inv));
          } catch (err) {
            results.push({
              statusCode: 500,
              payload: { error: (err as Error).message },
              latencyMs: 0,
            });
          }
        }
        return results;
      });
      this.batcher.start();
    } else {
      this.batcher = null;
    }
  }

  async handleRequest(
    pluginId: string,
    operation: string,
    payload: unknown,
    authHeader: string | null,
    sessionId: string | null,
  ): Promise<{ status: number; body: unknown }> {
    const start = Date.now();
    const manifest = getManifest();
    const plugin = manifest.plugins.find((p) => p.id === pluginId);

    if (!plugin) {
      this.telemetry.recordRequest(pluginId, operation, 404, Date.now() - start);
      return { status: 404, body: { error: `Plugin not found: ${pluginId}` } };
    }

    // Step 1: Identity validation (zero-trust layer 1)
    const authStart = Date.now();
    const identity = validateIdentity(authHeader, sessionId, this.session);
    this.telemetry.recordAuth(Date.now() - authStart, !!sessionId);

    if (!identity.valid || !identity.context) {
      this.telemetry.recordSecurityIncident(pluginId, identity.error ?? "auth_failed");
      return { status: 401, body: { error: identity.error ?? "Authentication failed" } };
    }

    // Issue session ticket if not cached
    if (identity.shouldIssueTicket && identity.context) {
      const ticket = this.session.issue({
        subjectId: identity.context.subjectId!,
        federationId: identity.context.federationId ?? "unknown",
        roles: identity.context.roles,
        riskLevel: identity.context.riskLevel,
      });
      const ctx = identity.context;
      ctx.sessionCached = false;
    }

    // Step 2: Execution validation (zero-trust layer 2)
    const execValidation = validateExecution(plugin, identity.context);
    if (!execValidation.allowed) {
      this.telemetry.recordSecurityIncident(pluginId, execValidation.error ?? "exec_denied");
      return { status: 403, body: { error: execValidation.error } };
    }

    // Step 3: Quota check
    try {
      this.quota.checkConcurrent(pluginId, plugin);
    } catch (err) {
      if (err instanceof QuotaExceededError) {
        return { status: 503, body: { error: err.message } };
      }
      throw err;
    }

    // Step 4: Execute (batched or direct)
    try {
      const invCtx: InvocationContext = {
        pluginId,
        sessionTicketId: sessionId ?? "",
        operation,
        payload,
        deadlineMs: plugin.quotas.timeout_ms,
      };

      let result: InvocationResult;
      if (this.batcher && plugin.supports_batching) {
        result = await this.batcher.submit(invCtx);
      } else {
        result = await this.executeInvocation(invCtx);
      }

      this.quota.trackInvocation(pluginId);
      this.telemetry.recordRequest(pluginId, operation, result.statusCode, Date.now() - start, {
        riskLevel: plugin.risk_level,
        sessionCached: identity.context.sessionCached,
        batched: this.batcher !== null && plugin.supports_batching,
      });

      return { status: result.statusCode, body: result.payload };
    } finally {
      this.quota.releaseConcurrent(pluginId);
    }
  }

  private async executeInvocation(invCtx: InvocationContext): Promise<InvocationResult> {
    const result = await this.sandbox.invoke(invCtx);
    return result;
  }

  stats() {
    return {
      session: this.session.stats(),
      pools: this.sandbox.allStats(),
    };
  }
}
