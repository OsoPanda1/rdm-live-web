import type { RiskLevel } from "../manifest/types.js";

export interface MetricLabels {
  plugin?: string;
  operation?: string;
  status?: number | string;
  riskLevel?: RiskLevel;
  sessionCached?: boolean;
  batched?: boolean;
}

export interface MetricSample {
  name: string;
  value: number;
  labels: MetricLabels;
  timestamp: number;
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  pluginId?: string;
  operation?: string;
  sessionId?: string;
  latencyMs?: number;
  statusCode?: number;
  riskLevel?: RiskLevel;
  securityDecision?: "allow" | "deny";
  error?: string;
  traceId?: string;
}

export class TelemetryCollector {
  private metrics: MetricSample[] = [];
  private logs: LogEntry[] = [];
  private readonly maxSamples: number;
  private readonly redactFields: string[];

  constructor(maxSamples = 10000, redactFields: string[] = ["original_token", "coordinates", "ip_address"]) {
    this.maxSamples = maxSamples;
    this.redactFields = redactFields;
  }

  recordMetric(name: string, value: number, labels: MetricLabels = {}): void {
    if (this.metrics.length >= this.maxSamples) {
      this.metrics.shift();
    }
    this.metrics.push({ name, value, labels, timestamp: Date.now() });
  }

  recordRequest(pluginId: string, operation: string, statusCode: number, latencyMs: number, labels: MetricLabels = {}): void {
    this.recordMetric("rdm_runtime_requests_total", 1, { ...labels, plugin: pluginId, operation, status: statusCode });
    this.recordMetric("rdm_runtime_request_latency_ms", latencyMs, { ...labels, plugin: pluginId, operation });
  }

  recordAuth(latencyMs: number, sessionCached: boolean): void {
    this.recordMetric("rdm_runtime_auth_latency_ms", latencyMs, { sessionCached });
  }

  recordSecurityIncident(plugin: string, reason: string): void {
    this.recordMetric("rdm_runtime_security_incidents_total", 1, { plugin, status: reason });
  }

  recordPoolMetric(plugin: string, active: number, rejections: number): void {
    this.recordMetric("rdm_runtime_sandbox_pool_active", active, { plugin });
    this.recordMetric("rdm_runtime_sandbox_pool_rejections", rejections, { plugin });
  }

  log(entry: LogEntry): void {
    const redacted = this.redact(entry);
    this.logs.push(redacted);
    // In production, forward to pino/winston
    if (entry.level === "error") {
      console.error(JSON.stringify(redacted));
    } else if (entry.level === "warn") {
      console.warn(JSON.stringify(redacted));
    }
  }

  flush(): { metrics: MetricSample[]; logs: LogEntry[] } {
    const snapshot = { metrics: [...this.metrics], logs: [...this.logs] };
    this.metrics = [];
    this.logs = [];
    return snapshot;
  }

  private redact(entry: LogEntry): LogEntry {
    const copy = { ...entry };
    for (const field of this.redactFields) {
      if (field in copy) {
        (copy as Record<string, unknown>)[field] = "[REDACTED]";
      }
    }
    return copy;
  }
}
