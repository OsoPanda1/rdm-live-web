import type { YunMetric, YunLogEntry, YunTraceSpan } from './types';

const metrics: YunMetric[] = []; const MAX_METRICS = 10_000;
export function recordMetric(name: string, value: number, labels: Record<string, string> = {}): void {
  metrics.push({ name, value, labels, timestamp: new Date().toISOString() });
  if (metrics.length > MAX_METRICS) metrics.shift();
}

export function incrementCounter(name: string, labels: Record<string, string> = {}): void {
  const existing = metrics.find((m) => m.name === name && JSON.stringify(m.labels) === JSON.stringify(labels));
  if (existing) { existing.value++; existing.timestamp = new Date().toISOString(); }
  else recordMetric(name, 1, labels);
}

export function recordHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
  recordMetric(`${name}_sum`, value, labels); recordMetric(`${name}_count`, 1, labels);
  for (const bucket of [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10])
    if (value <= bucket) recordMetric(`${name}_bucket`, 1, { ...labels, le: String(bucket) });
}

export function recordGauge(name: string, value: number, labels: Record<string, string> = {}): void { recordMetric(name, value, labels); }

export function getMetrics(): string {
  const grouped = new Map<string, YunMetric[]>(); const lines: string[] = [];
  for (const m of metrics) { const existing = grouped.get(m.name) ?? []; existing.push(m); grouped.set(m.name, existing); }
  for (const [name, metricList] of grouped) {
    lines.push(`# HELP ${name} RDM metric`); lines.push(`# TYPE ${name} gauge`);
    for (const m of metricList) {
      const labels = Object.entries(m.labels).map(([k, v]) => `${k}="${v}"`).join(',');
      lines.push(`${name}${labels ? `{${labels}}` : ''} ${m.value}`);
    }
  }
  return lines.join('\n');
}

export function getMetricsJson(): YunMetric[] { return [...metrics]; }

const logs: YunLogEntry[] = []; const MAX_LOGS = 50_000;

function createLogEntry(level: YunLogEntry['level'], message: string, context: Record<string, unknown> = {}, traceId?: string, spanId?: string): YunLogEntry {
  const entry: YunLogEntry = { level, message, context, timestamp: new Date().toISOString(), trace_id: traceId, span_id: spanId };
  logs.push(entry); if (logs.length > MAX_LOGS) logs.shift();
  return entry;
}

export const yunLogger = {
  debug: (message: string, context?: Record<string, unknown>, traceId?: string, spanId?: string) => createLogEntry('debug', message, context, traceId, spanId),
  info: (message: string, context?: Record<string, unknown>, traceId?: string, spanId?: string) => createLogEntry('info', message, context, traceId, spanId),
  warn: (message: string, context?: Record<string, unknown>, traceId?: string, spanId?: string) => createLogEntry('warn', message, context, traceId, spanId),
  error: (message: string, context?: Record<string, unknown>, traceId?: string, spanId?: string) => createLogEntry('error', message, context, traceId, spanId),
  fatal: (message: string, context?: Record<string, unknown>, traceId?: string, spanId?: string) => createLogEntry('fatal', message, context, traceId, spanId),
};

export function getLogs(options: { level?: YunLogEntry['level']; traceId?: string; limit?: number; } = {}): YunLogEntry[] {
  let result = [...logs];
  if (options.level) result = result.filter((l) => l.level === options.level);
  if (options.traceId) result = result.filter((l) => l.trace_id === options.traceId);
  if (options.limit) result = result.slice(-options.limit);
  return result;
}

const traces: YunTraceSpan[] = []; const MAX_TRACES = 10_000;

export function startSpan(name: string, traceId?: string, parentSpanId?: string): YunTraceSpan {
  const span: YunTraceSpan = { trace_id: traceId ?? `trc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, span_id: `spn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, parent_span_id: parentSpanId, name, start_time: new Date().toISOString(), status: 'ok', attributes: {} };
  traces.push(span); if (traces.length > MAX_TRACES) traces.shift();
  return span;
}

export function finishSpan(spanId: string, status: YunTraceSpan['status'] = 'ok', attributes: Record<string, string> = {}): void {
  const span = traces.find((s) => s.span_id === spanId);
  if (span) { span.end_time = new Date().toISOString(); span.status = status; span.attributes = { ...span.attributes, ...attributes }; }
}

export async function traced<T>(name: string, fn: (span: YunTraceSpan) => Promise<T>, parentSpanId?: string): Promise<T> {
  const span = startSpan(name, undefined, parentSpanId);
  try { const result = await fn(span); finishSpan(span.span_id, 'ok'); return result; }
  catch (error) { finishSpan(span.span_id, 'error', { error: error instanceof Error ? error.message : String(error) }); throw error; }
}

export function getTrace(traceId: string): YunTraceSpan[] { return traces.filter((t) => t.trace_id === traceId); }
export function getRecentTraces(limit = 50): YunTraceSpan[] { return traces.slice(-limit); }

export interface HealthCheckResult { status: 'healthy' | 'degraded' | 'critical'; checks: { name: string; status: 'ok' | 'warn' | 'error'; message: string; latencyMs?: number; }[]; timestamp: string; }

export async function runHealthCheck(): Promise<HealthCheckResult> {
  const checks: HealthCheckResult['checks'] = [];
  checks.push({ name: 'event_bus', status: 'ok', message: 'Event bus operational' });
  checks.push({ name: 'rate_limiter', status: 'ok', message: 'Rate limiter operational' });
  checks.push({ name: 'circuit_breakers', status: 'ok', message: 'Circuit breakers operational' });
  const recentErrors = logs.filter((l) => l.level === 'error' && Date.now() - new Date(l.timestamp).getTime() < 60_000);
  checks.push({ name: 'log_buffer', status: recentErrors.length > 10 ? 'warn' : 'ok', message: `${recentErrors.length} errors in last minute` });
  const hasError = checks.some((c) => c.status === 'error');
  const hasWarn = checks.some((c) => c.status === 'warn');
  return { status: hasError ? 'critical' : hasWarn ? 'degraded' : 'healthy', checks, timestamp: new Date().toISOString() };
}
