/* ============================================================================
 * LTOS Observability Kernel v4
 * Enterprise Metrics Registry (In-Memory, Bounded, Label-Aware, Hardened)
 * ============================================================================ */

export type MetricLabels = Record<string, string>

/* ============================================================================
 * INTERNAL KEYS & HELPERS
 * ============================================================================ */

interface BaseMetric {
  name: string
  labels?: MetricLabels
  lastSeen: number
}

export interface CounterMetric extends BaseMetric {
  value: number
}

export interface GaugeMetric extends BaseMetric {
  value: number
}

export interface HistogramMetric extends BaseMetric {
  buckets: number[]          // límites de buckets (ordenados)
  bucketCounts: number[]     // misma longitud que buckets
  count: number
  sum: number
  max: number
  overflowCount: number      // +Inf real (más allá del último bucket)
}

function buildLabelsKey(labels?: MetricLabels): string {
  if (!labels) return ""
  const entries = Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${String(v)}`)
  return entries.join("|")
}

function buildMetricKey(name: string, labels?: MetricLabels): string {
  const labelsKey = buildLabelsKey(labels)
  return labelsKey ? `${name}|${labelsKey}` : name
}

const counters = new Map<string, CounterMetric>()
const gauges = new Map<string, GaugeMetric>()
const histograms = new Map<string, HistogramMetric>()

const MAX_COUNTER_KEYS = 5_000
const MAX_GAUGE_KEYS = 5_000
const MAX_HISTOGRAM_KEYS = 2_000

/** TTL en ms para limpiar series que no se usan (ej: 24h). */
const METRIC_TTL_MS = 24 * 60 * 60 * 1000

/** Registro de overflow del kernel de métricas */
const METRICS_REGISTRY_OVERFLOW = "metrics_registry_overflow_total"

/* ============================================================================
 * OVERFLOW LOGGING (rate-limited)
 * ============================================================================ */

let lastOverflowLogTs = 0
const OVERFLOW_LOG_MIN_INTERVAL_MS = 60_000

function logOverflow(kind: "counter" | "gauge" | "histogram"): void {
  const now = Date.now()
  if (now - lastOverflowLogTs < OVERFLOW_LOG_MIN_INTERVAL_MS) {
    return
  }
  lastOverflowLogTs = now
  // eslint-disable-next-line no-console
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "error",
      message: "OBSERVABILITY_DEGRADED",
      reason: "metrics_registry_overflow",
      kind,
    }),
  )
}

function noteRegistryOverflow(kind: "counter" | "gauge" | "histogram"): void {
  const key = buildMetricKey(METRICS_REGISTRY_OVERFLOW, { kind })
  const current =
    counters.get(key) ?? {
      name: METRICS_REGISTRY_OVERFLOW,
      value: 0,
      labels: { kind },
      lastSeen: Date.now(),
    }
  current.value += 1
  current.lastSeen = Date.now()
  counters.set(key, current)
  logOverflow(kind)
}

/* ============================================================================
 * VALUE GUARDS
 * ============================================================================ */

function isValidFiniteNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

function isValidFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

/* ============================================================================
 * TTL / GC
 * ============================================================================ */

export function cleanupStaleMetrics(now: number = Date.now()): void {
  const cutoff = now - METRIC_TTL_MS

  for (const [key, metric] of counters.entries()) {
    if (metric.lastSeen < cutoff) counters.delete(key)
  }
  for (const [key, metric] of gauges.entries()) {
    if (metric.lastSeen < cutoff) gauges.delete(key)
  }
  for (const [key, metric] of histograms.entries()) {
    if (metric.lastSeen < cutoff) histograms.delete(key)
  }
}

/* ============================================================================
 * SAFE REGISTRIES (name + labels como identidad)
 * ============================================================================ */

function safeRegisterCounter(
  name: string,
  labels?: MetricLabels,
): CounterMetric {
  const key = buildMetricKey(name, labels)
  const existing = counters.get(key)
  if (existing) {
    existing.lastSeen = Date.now()
    return existing
  }
  if (counters.size >= MAX_COUNTER_KEYS) {
    noteRegistryOverflow("counter")
    return { name, value: 0, labels, lastSeen: Date.now() }
  }
  const metric: CounterMetric = { name, value: 0, labels, lastSeen: Date.now() }
  counters.set(key, metric)
  return metric
}

function safeRegisterGauge(name: string, labels?: MetricLabels): GaugeMetric {
  const key = buildMetricKey(name, labels)
  const existing = gauges.get(key)
  if (existing) {
    existing.lastSeen = Date.now()
    return existing
  }
  if (gauges.size >= MAX_GAUGE_KEYS) {
    noteRegistryOverflow("gauge")
    return { name, value: 0, labels, lastSeen: Date.now() }
  }
  const metric: GaugeMetric = { name, value: 0, labels, lastSeen: Date.now() }
  gauges.set(key, metric)
  return metric
}

function getExistingHistogram(
  name: string,
  labels?: MetricLabels,
): HistogramMetric | undefined {
  const key = buildMetricKey(name, labels)
  const existing = histograms.get(key)
  if (existing) {
    existing.lastSeen = Date.now()
  }
  return existing
}

function safeRegisterHistogram(
  name: string,
  buckets: number[],
  labels?: MetricLabels,
): HistogramMetric {
  const existing = getExistingHistogram(name, labels)
  if (existing) return existing

  if (histograms.size >= MAX_HISTOGRAM_KEYS) {
    noteRegistryOverflow("histogram")
    return {
      name,
      buckets,
      bucketCounts: new Array(buckets.length).fill(0),
      count: 0,
      sum: 0,
      max: 0,
      overflowCount: 0,
      labels,
      lastSeen: Date.now(),
    }
  }

  const sortedBuckets = [...buckets].sort((a, b) => a - b)
  const metric: HistogramMetric = {
    name,
    buckets: sortedBuckets,
    bucketCounts: new Array(sortedBuckets.length).fill(0),
    count: 0,
    sum: 0,
    max: 0,
    overflowCount: 0,
    labels,
    lastSeen: Date.now(),
  }
  const key = buildMetricKey(name, labels)
  histograms.set(key, metric)
  return metric
}

/* ============================================================================
 * PUBLIC API (Counters)
 * ============================================================================ */

export function registerCounter(name: string, labels?: MetricLabels): void {
  safeRegisterCounter(name, labels)
}

export function incCounter(
  name: string,
  value = 1,
  labels?: MetricLabels,
): void {
  // Counters deben ser monótonos y no negativos.
  if (!isValidFiniteNonNegative(value) || value <= 0) {
    return
  }
  const metric = safeRegisterCounter(name, labels)
  metric.value += value
  metric.lastSeen = Date.now()
}

/* ============================================================================
 * PUBLIC API (Gauges)
 * ============================================================================ */

export function registerGauge(name: string, labels?: MetricLabels): void {
  safeRegisterGauge(name, labels)
}

export function setGauge(
  name: string,
  value: number,
  labels?: MetricLabels,
): void {
  if (!isValidFiniteNumber(value)) {
    return
  }
  const metric = safeRegisterGauge(name, labels)
  metric.value = value
  metric.lastSeen = Date.now()
}

/* ============================================================================
 * PUBLIC API (Histograms)
 * ============================================================================ */

const DEFAULT_BUCKETS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]

export function registerHistogram(
  name: string,
  buckets: number[] = DEFAULT_BUCKETS,
  labels?: MetricLabels,
): void {
  safeRegisterHistogram(name, buckets, labels)
}

/**
 * Observa un valor en un histograma.
 * Respeta buckets personalizados si ya existe la serie,
 * usa DEFAULT_BUCKETS solo al crear una nueva.
 */
export function observeHistogram(
  name: string,
  value: number,
  labels?: MetricLabels,
): void {
  if (!isValidFiniteNonNegative(value)) {
    return
  }

  const existing = getExistingHistogram(name, labels)
  const metric = existing ?? safeRegisterHistogram(name, DEFAULT_BUCKETS, labels)

  metric.count += 1
  metric.sum += value
  if (value > metric.max) metric.max = value
  metric.lastSeen = Date.now()

  let bucketed = false
  for (let i = 0; i < metric.buckets.length; i++) {
    if (value <= metric.buckets[i]) {
      metric.bucketCounts[i] += 1
      bucketed = true
      break
    }
  }

  if (!bucketed) {
    // +Inf real
    metric.overflowCount += 1
  }
}

/* ============================================================================
 * ENDPOINT NORMALIZATION (para cardinalidad)
 * ============================================================================ */

function normalizeEndpoint(endpoint: string): string {
  // Implementación básica; idealmente reemplazar por una tabla de rutas canónicas.
  // Aquí se evita meter IDs crudos.
  return endpoint
    .replace(/\/\d+/g, "/:id")
    .replace(/\/[0-9a-fA-F-]{36}/g, "/:uuid")
}

/* ============================================================================
 * LATENCY
 * ============================================================================ */

export function recordLatency(operation: string, durationMs: number): void {
  observeHistogram("http_request_duration_ms", durationMs, {
    operation,
  })
}

/* ============================================================================
 * ERRORS
 * ============================================================================ */

export function recordError(
  service: string,
  errorCode = "unknown",
  labels?: MetricLabels,
): void {
  incCounter("errors_total", 1, { service, ...labels })
  incCounter("errors_by_code_total", 1, {
    service,
    code: errorCode,
    ...labels,
  })
}

/* ============================================================================
 * RED METHOD (Rate, Errors, Duration)
 * ============================================================================ */

export function recordRequest(
  endpoint: string,
  durationMs: number,
  success = true,
  extraLabels?: MetricLabels,
): void {
  const normalized = normalizeEndpoint(endpoint)

  incCounter("http_requests_total", 1, {
    endpoint: normalized,
    ...extraLabels,
  })

  observeHistogram("http_request_duration_ms", durationMs, {
    endpoint: normalized,
    ...extraLabels,
  })

  if (!success) {
    recordError("http", "request_failed", {
      endpoint: normalized,
      ...extraLabels,
    })
  }
}

/* ============================================================================
 * USE METHOD (Utilization, Saturation, Errors)
 * ============================================================================ */

export function recordCPUUtilization(value: number): void {
  setGauge("system_cpu_utilization", value)
}

export function recordMemoryUtilization(value: number): void {
  setGauge("system_memory_utilization", value)
}

export function recordSaturation(resource: string, value: number): void {
  setGauge("system_saturation", value, { resource })
}

/* ============================================================================
 * AI METRICS (Isabella / Realito)
 * ============================================================================ */

export function recordAIRequest(
  provider: string,
  latencyMs: number,
  tokenCount: number,
  labels?: MetricLabels,
): void {
  incCounter("ai_requests_total", 1, { provider, ...labels })
  observeHistogram("ai_latency_ms", latencyMs, { provider, ...labels })
  observeHistogram("ai_tokens", tokenCount, { provider, ...labels })
}

export function recordAIError(
  provider: string,
  code = "unknown",
  labels?: MetricLabels,
): void {
  incCounter("ai_requests_error_total", 1, {
    provider,
    code,
    ...labels,
  })
}

/** Telemetría de seguridad cognitiva Isabella */
export function recordAIHallucinationRisk(
  provider: string,
  riskScore: number,
  labels?: MetricLabels,
): void {
  observeHistogram("ai_hallucination_risk", riskScore, { provider, ...labels })
}

export function recordAIGuardrailBlock(
  provider: string,
  reason: string,
  labels?: MetricLabels,
): void {
  incCounter("ai_guardrail_blocks_total", 1, {
    provider,
    reason,
    ...labels,
  })
}

export function recordPromptInjectionDetected(
  provider: string,
  labels?: MetricLabels,
): void {
  incCounter("ai_prompt_injection_detected_total", 1, {
    provider,
    ...labels,
  })
}

export function recordPIIDetection(
  provider: string,
  labels?: MetricLabels,
): void {
  incCounter("ai_pii_detected_total", 1, {
    provider,
    ...labels,
  })
}

export function recordDecisionConfidence(
  engine: string,
  confidence: number,
  labels?: MetricLabels,
): void {
  observeHistogram("ai_decision_confidence", confidence, {
    engine,
    ...labels,
  })
}

/* ============================================================================
 * TERRITORIAL METRICS (normalizadas)
 * ============================================================================ */

export function recordTwinView(routePattern: string): void {
  incCounter("twin_routes_viewed_total", 1, { route: routePattern })
}

export function recordCommerceClick(channel: string): void {
  incCounter("commerce_clicks_total", 1, { channel })
}

/* ============================================================================
 * HISTOGRAM STATS (por buckets)
 * ============================================================================ */

function histogramPercentile(metric: HistogramMetric, p: number): number {
  if (metric.count === 0) return 0

  const target = metric.count * p
  let cumulative = 0

  for (let i = 0; i < metric.buckets.length; i++) {
    cumulative += metric.bucketCounts[i]
    if (cumulative >= target) {
      return metric.buckets[i]
    }
  }

  // si llegamos aquí, el percentil está en overflow (+Inf),
  // devolvemos el máximo real observado
  return metric.max
}

/* ============================================================================
 * SNAPSHOT (para debug / dashboards internos)
 * ============================================================================ */

export interface MetricsSnapshot {
  counters: CounterMetric[]
  gauges: GaugeMetric[]
  histograms: Array<{
    name: string
    labels?: MetricLabels
    count: number
    p50: number
    p95: number
    p99: number
    max: number
    sum: number
  }>
  ts: string
}

export function getMetricsSnapshot(): MetricsSnapshot {
  const histoStats: MetricsSnapshot["histograms"] = []

  for (const metric of histograms.values()) {
    if (metric.count === 0) {
      histoStats.push({
        name: metric.name,
        labels: metric.labels,
        count: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        max: 0,
        sum: 0,
      })
      continue
    }

    const p50 = histogramPercentile(metric, 0.5)
    const p95 = histogramPercentile(metric, 0.95)
    const p99 = histogramPercentile(metric, 0.99)

    histoStats.push({
      name: metric.name,
      labels: metric.labels,
      count: metric.count,
      p50,
      p95,
      p99,
      max: metric.max,
      sum: metric.sum,
    })
  }

  return {
    counters: [...counters.values()],
    gauges: [...gauges.values()],
    histograms: histoStats,
    ts: new Date().toISOString(),
  }
}

/* ============================================================================
 * PROMETHEUS EXPORT
 * ============================================================================ */

function sanitizePrometheusValue(v: string): string {
  return String(v)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
}

function sanitizePrometheusName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_:]/g, "_")
}

function formatLabels(labels?: MetricLabels): string {
  if (!labels || Object.keys(labels).length === 0) return ""
  const pairs = Object.entries(labels).map(
    ([k, v]) => `${sanitizePrometheusName(k)}="${sanitizePrometheusValue(v)}"`,
  )
  return `{${pairs.join(",")}}`
}

export function exportPrometheus(): string {
  const lines: string[] = []
  const typeEmitted = new Set<string>()

  // Counters
  for (const metric of counters.values()) {
    const safeName = sanitizePrometheusName(metric.name)
    if (!typeEmitted.has(safeName)) {
      lines.push(`# TYPE ${safeName} counter`)
      typeEmitted.add(safeName)
    }
    lines.push(`${safeName}${formatLabels(metric.labels)} ${metric.value}`)
  }

  // Gauges
  for (const metric of gauges.values()) {
    const safeName = sanitizePrometheusName(metric.name)
    if (!typeEmitted.has(safeName)) {
      lines.push(`# TYPE ${safeName} gauge`)
      typeEmitted.add(safeName)
    }
    lines.push(`${safeName}${formatLabels(metric.labels)} ${metric.value}`)
  }

  // Histograms (clásicos Prometheus)
  for (const metric of histograms.values()) {
    if (!typeEmitted.has(metric.name)) {
      lines.push(`# TYPE ${metric.name} histogram`)
      typeEmitted.add(metric.name)
    }

    const baseName = `${metric.name}_bucket`
    let cumulative = 0

    for (let i = 0; i < metric.buckets.length; i++) {
      cumulative += metric.bucketCounts[i]
      const leLabel = { ...(metric.labels ?? {}), le: String(metric.buckets[i]) }
      lines.push(`${baseName}${formatLabels(leLabel)} ${cumulative}`)
    }

    // +Inf bucket = todo (incluyendo overflowCount)
    cumulative += metric.overflowCount
    const infLabel = { ...(metric.labels ?? {}), le: "+Inf" }
    lines.push(`${baseName}${formatLabels(infLabel)} ${cumulative}`)

    lines.push(`${metric.name}_sum${formatLabels(metric.labels)} ${metric.sum}`)
    lines.push(
      `${metric.name}_count${formatLabels(metric.labels)} ${metric.count}`,
    )
  }

  return lines.join("\n")
}

/* ============================================================================
 * RESET
 * ============================================================================ */

export function resetMetricsSnapshot(): void {
  counters.clear()
  gauges.clear()
  histograms.clear()
}
