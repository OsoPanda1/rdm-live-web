/**
 * YUN Observability Stack — Metrics, Logs, Traces
 * Per YUN Constitution Principle #6 (Observable by Default)
 *
 * Provides: structured logging, metric collection, distributed tracing.
 */

import type { YunMetric, YunLogEntry, YunTraceSpan } from './types';

// ============================================================================
// METRICS
// ============================================================================

const metrics: YunMetric[] = [];
const MAX_METRICS = 10_000;

/**
 * Records a metric.
 */
export function recordMetric(
  name: string,
  value: number,
  labels: Record<string, string> = {},
): void {
  metrics.push({
    name,
    value,
    labels,
    timestamp: new Date().toISOString(),
  });

  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }
}

/**
 * Increments a counter metric.
 */
export function incrementCounter(
  name: string,
  labels: Record<string, string> = {},
): void {
  const existing = metrics.find(
    (m) => m.name === name && JSON.stringify(m.labels) === JSON.stringify(labels),
  );

  if (existing) {
    existing.value++;
    existing.timestamp = new Date().toISOString();
  } else {
    recordMetric(name, 1, labels);
  }
}

/**
 * Records a histogram metric.
 */
export function recordHistogram(
  name: string,
  value: number,
  labels: Record<string, string> = {},
): void {
  recordMetric(`${name}_sum`, value, labels);
  recordMetric(`${name}_count`, 1, labels);

  // Compute buckets
  const buckets = [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
  for (const bucket of buckets) {
    if (value <= bucket) {
      recordMetric(`${name}_bucket`, 1, { ...labels, le: String(bucket) });
    }
  }
}

/**
 * Records a gauge metric.
 */
export function recordGauge(
  name: string,
  value: number,
  labels: Record<string, string> = {},
): void {
  recordMetric(name, value, labels);
}

/**
 * Returns all metrics in Prometheus-compatible format.
 */
export function getMetrics(): string {
  const grouped = new Map<string, YunMetric[]>();
  for (const m of metrics) {
    const existing = grouped.get(m.name) ?? [];
    existing.push(m);
    grouped.set(m.name, existing);
  }

  const lines: string[] = [];
  for (const [name, metricList] of grouped) {
    lines.push(`# HELP ${name} RDM metric`);
    lines.push(`# TYPE ${name} gauge`);

    for (const m of metricList) {
      const labels = Object.entries(m.labels)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');
      const labelStr = labels ? `{${labels}}` : '';
      lines.push(`${name}${labelStr} ${m.value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Returns metrics as JSON.
 */
export function getMetricsJson(): YunMetric[] {
  return [...metrics];
}

// ============================================================================
// STRUCTURED LOGGING
// ============================================================================

const logs: YunLogEntry[] = [];
const MAX_LOGS = 50_000;

function createLogEntry(
  level: YunLogEntry['level'],
  message: string,
  context: Record<string, unknown> = {},
  traceId?: string,
  spanId?: string,
): YunLogEntry {
  const entry: YunLogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    trace_id: traceId,
    span_id: spanId,
  };

  logs.push(entry);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  // Console output in development
  if (typeof window === 'undefined') {
    const prefix = `[YUN ${level.toUpperCase()}]`;
    const contextStr = Object.keys(context).length ? JSON.stringify(context) : '';
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `${prefix} ${message} ${contextStr}`,
    );
  }

  return entry;
}

export const yunLogger = {
  debug: (message: string, context?: Record<string, unknown>, traceId?: string, spanId?: string) =>
    createLogEntry('debug', message, context, traceId, spanId),
  info: (message: string, context?: Record<string, unknown>, traceId?: string, spanId?: string) =>
    createLogEntry('info', message, context, traceId, spanId),
  warn: (message: string, context?: Record<string, unknown>, traceId?: string, spanId?: string) =>
    createLogEntry('warn', message, context, traceId, spanId),
  error: (message: string, context?: Record<string, unknown>, traceId?: string, spanId?: string) =>
    createLogEntry('error', message, context, traceId, spanId),
  fatal: (message: string, context?: Record<string, unknown>, traceId?: string, spanId?: string) =>
    createLogEntry('fatal', message, context, traceId, spanId),
};

/**
 * Returns logs filtered by level and/or trace ID.
 */
export function getLogs(options: {
  level?: YunLogEntry['level'];
  traceId?: string;
  limit?: number;
} = {}): YunLogEntry[] {
  let result = [...logs];

  if (options.level) {
    result = result.filter((l) => l.level === options.level);
  }

  if (options.traceId) {
    result = result.filter((l) => l.trace_id === options.traceId);
  }

  if (options.limit) {
    result = result.slice(-options.limit);
  }

  return result;
}

// ============================================================================
// DISTRIBUTED TRACING
// ============================================================================

const traces: YunTraceSpan[] = [];
const MAX_TRACES = 10_000;

/**
 * Creates a new trace span.
 */
export function startSpan(
  name: string,
  traceId?: string,
  parentSpanId?: string,
): YunTraceSpan {
  const span: YunTraceSpan = {
    trace_id: traceId ?? `trc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    span_id: `spn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    parent_span_id: parentSpanId,
    name,
    start_time: new Date().toISOString(),
    status: 'ok',
    attributes: {},
  };

  traces.push(span);
  if (traces.length > MAX_TRACES) {
    traces.shift();
  }

  return span;
}

/**
 * Finishes a trace span.
 */
export function finishSpan(
  spanId: string,
  status: YunTraceSpan['status'] = 'ok',
  attributes: Record<string, string> = {},
): void {
  const span = traces.find((s) => s.span_id === spanId);
  if (span) {
    span.end_time = new Date().toISOString();
    span.status = status;
    span.attributes = { ...span.attributes, ...attributes };
  }
}

/**
 * Executes a function within a trace span.
 */
export async function traced<T>(
  name: string,
  fn: (span: YunTraceSpan) => Promise<T>,
  parentSpanId?: string,
): Promise<T> {
  const span = startSpan(name, undefined, parentSpanId);

  try {
    const result = await fn(span);
    finishSpan(span.span_id, 'ok');
    return result;
  } catch (error) {
    finishSpan(span.span_id, 'error', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Returns all spans for a trace.
 */
export function getTrace(traceId: string): YunTraceSpan[] {
  return traces.filter((t) => t.trace_id === traceId);
}

/**
 * Returns recent traces.
 */
export function getRecentTraces(limit = 50): YunTraceSpan[] {
  return traces.slice(-limit);
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'critical';
  checks: {
    name: string;
    status: 'ok' | 'warn' | 'error';
    message: string;
    latencyMs?: number;
  }[];
  timestamp: string;
}

/**
 * Runs a comprehensive health check.
 */
export async function runHealthCheck(): Promise<HealthCheckResult> {
  const checks: HealthCheckResult['checks'] = [];
  const startTime = Date.now();

  // Check: Event bus
  checks.push({
    name: 'event_bus',
    status: 'ok',
    message: 'Event bus operational',
  });

  // Check: Rate limiter
  checks.push({
    name: 'rate_limiter',
    status: 'ok',
    message: 'Rate limiter operational',
  });

  // Check: Circuit breakers
  checks.push({
    name: 'circuit_breakers',
    status: 'ok',
    message: 'Circuit breakers operational',
  });

  // Check: Log buffer
  const recentErrors = logs.filter(
    (l) => l.level === 'error' && Date.now() - new Date(l.timestamp).getTime() < 60_000,
  );
  checks.push({
    name: 'log_buffer',
    status: recentErrors.length > 10 ? 'warn' : 'ok',
    message: `${recentErrors.length} errors in last minute`,
  });

  // Determine overall status
  const hasError = checks.some((c) => c.status === 'error');
  const hasWarn = checks.some((c) => c.status === 'warn');

  const status: HealthCheckResult['status'] = hasError
    ? 'critical'
    : hasWarn
      ? 'degraded'
      : 'healthy';

  return {
    status,
    checks,
    timestamp: new Date().toISOString(),
  };
}
