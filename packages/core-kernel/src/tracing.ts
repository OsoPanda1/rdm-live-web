/* ============================================================================
 * LTOS Distributed Tracing Kernel v4
 * Quantum-Ready · OpenTelemetry & W3C Trace Context Compatible
 * ============================================================================
 */

import crypto from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";

/* ============================================================================
 * TIPOS CENTRALES
 * ============================================================================
 */

export type TraceId = string;
export type SpanId = string;

export type SpanStatus = "UNSET" | "OK" | "ERROR";

export interface TraceContext {
  traceId: TraceId;
  spanId: SpanId;
  parentSpanId?: SpanId;

  correlationId: string;
  requestId: string;
  sessionId?: string;

  userId?: string;

  service: string;
  operation: string;

  startTime: number; // epoch ms
  sampled: boolean;

  metadata?: Record<string, unknown>;
}

export interface TraceSpan {
  context: TraceContext;
  endTime?: number;
  durationMs?: number;
  success?: boolean;
  status: SpanStatus;
  error?: string;
  attributes?: Record<string, unknown>;
}

/* ============================================================================
 * QUANTUM-READY IDS
 * ============================================================================
 */

function secureRandom(bytes = 16): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/** W3C / OTEL: 16 bytes = 32 hex chars. [web:465][web:466] */
export function generateTraceId(): TraceId {
  return secureRandom(16);
}

/** W3C / OTEL: 8 bytes = 16 hex chars. [web:465][web:466] */
export function generateSpanId(): SpanId {
  return secureRandom(8);
}

/** Correlation / Request IDs: independientes, pero cortos y trazables. [web:472][web:469] */
export function generateCorrelationId(): string {
  return secureRandom(12);
}

export function generateRequestId(): string {
  return secureRandom(12);
}

/* ============================================================================
 * QUANTUM-READY METADATA
 * ============================================================================
 */

export interface QuantumReadyMetadata {
  algorithm: "CRYSTALS-Kyber" | "CRYSTALS-Dilithium" | "SPHINCS+" | "future";
  enabled: boolean;
  signature?: string;
}

export function attachQuantumMetadata(
  context: TraceContext,
  metadata: QuantumReadyMetadata,
): TraceContext {
  return {
    ...context,
    metadata: {
      ...context.metadata,
      quantum: metadata,
    },
  };
}

/* ============================================================================
 * CONFIGURACIÓN DEL KERNEL
 * ============================================================================
 */

export interface TracingConfig {
  serviceName: string;
  /** Base head-sampling 0–1. Errores y spans lentos se fuerzan a sampled. [web:468] */
  baseSampleRate?: number;
  /** TTL para spans activos (ms). */
  activeSpanTtlMs?: number;
  /** Máximo de spans activos simultáneos. */
  maxActiveSpans?: number;
  /** Umbral de latencia (ms) para marcar span “slow”. */
  slowSpanThresholdMs?: number;
  /** Intervalo de mantenimiento automático (ms). */
  maintenanceIntervalMs?: number;
}

const DEFAULT_TRACING_CONFIG: Required<TracingConfig> = {
  serviceName: "ltos-unknown",
  baseSampleRate: 1.0,
  activeSpanTtlMs: 10 * 60 * 1000,
  maxActiveSpans: 10_000,
  slowSpanThresholdMs: 1_000,
  maintenanceIntervalMs: 60_000,
};

let config: Required<TracingConfig> = { ...DEFAULT_TRACING_CONFIG };

export function configureTracing(partial: TracingConfig): void {
  config = { ...config, ...partial };
}

/* ============================================================================
 * CONTEXTO ASÍNCRONO
 * ============================================================================
 */

interface StoreContext {
  trace?: TraceContext;
}

const asyncLocalStore = new AsyncLocalStorage<StoreContext>();

export function getCurrentTrace(): TraceContext | undefined {
  return asyncLocalStore.getStore()?.trace;
}

export function runWithTrace<T>(
  context: TraceContext,
  fn: () => T,
): T {
  return asyncLocalStore.run({ trace: context }, fn);
}

/* ============================================================================
 * SPANS ACTIVOS + MANTENIMIENTO
 * ============================================================================
 */

const activeSpans = new Map<SpanId, TraceSpan>();

export function getActiveSpansCount(): number {
  return activeSpans.size;
}

export function cleanupStaleSpans(now: number = Date.now()): void {
  const cutoff = now - config.activeSpanTtlMs;
  for (const [spanId, span] of activeSpans.entries()) {
    if (span.context.startTime < cutoff) {
      activeSpans.delete(spanId);
    }
  }
}

let maintenanceTimer: NodeJS.Timeout | null = null;

/** Activa un loop interno de mantenimiento (TTL de spans). */
export function startTracingMaintenance(): void {
  if (maintenanceTimer) return;
  maintenanceTimer = setInterval(() => {
    cleanupStaleSpans();
  }, config.maintenanceIntervalMs).unref();
}

export function stopTracingMaintenance(): void {
  if (!maintenanceTimer) return;
  clearInterval(maintenanceTimer);
  maintenanceTimer = null;
}

/* ============================================================================
 * SAMPLING DETERMINÍSTICO (por traceId)
 * ============================================================================
 */

function hashTraceIdToRatio(traceId: string): number {
  // FNV-1a simple sobre los primeros 16 hex para ratio [0,1).
  let hash = 2166136261;
  const slice = traceId.slice(0, 16);
  for (let i = 0; i < slice.length; i++) {
    hash ^= slice.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0) / 0xffffffff;
}

/** Decisión de sampling basada solo en traceId, consistente en todos los servicios. [web:467][web:468] */
function shouldSampleDeterministic(traceId: string, baseRate: number): boolean {
  if (baseRate >= 1) return true;
  if (baseRate <= 0) return false;
  const r = hashTraceIdToRatio(traceId);
  return r < baseRate;
}

/* ============================================================================
 * CREACIÓN DE TRACE ROOT
 * ============================================================================
 */

export function createTrace(
  operation: string,
  options?: {
    userId?: string;
    sessionId?: string;
    correlationId?: string;
    requestId?: string;
    metadata?: Record<string, unknown>;
    sampleRateOverride?: number;
  },
): TraceContext {
  const traceId = generateTraceId();
  const baseRate = options?.sampleRateOverride ?? config.baseSampleRate;
  const sampled = shouldSampleDeterministic(traceId, baseRate);

  return {
    traceId,
    spanId: generateSpanId(),
    correlationId: options?.correlationId ?? generateCorrelationId(),
    requestId: options?.requestId ?? generateRequestId(),
    userId: options?.userId,
    sessionId: options?.sessionId,
    service: config.serviceName,
    operation,
    startTime: Date.now(),
    sampled,
    metadata: options?.metadata,
  };
}

/* ============================================================================
 * START SPAN ROOT
 * ============================================================================
 */

export function startSpan(context: TraceContext): TraceSpan {
  const span: TraceSpan = {
    context,
    status: "UNSET",
  };

  if (context.sampled && activeSpans.size < config.maxActiveSpans) {
    activeSpans.set(context.spanId, span);
  }

  return span;
}

/* ============================================================================
 * CHILD CONTEXT + SPAN
 * ============================================================================
 */

export function createChildContext(
  parent: TraceContext,
  operation: string,
  options?: {
    serviceOverride?: string;
    metadata?: Record<string, unknown>;
  },
): TraceContext {
  return {
    traceId: parent.traceId,
    spanId: generateSpanId(),
    parentSpanId: parent.spanId,
    correlationId: parent.correlationId,
    requestId: parent.requestId,
    sessionId: parent.sessionId,
    userId: parent.userId,
    service: options?.serviceOverride ?? config.serviceName,
    operation,
    startTime: Date.now(),
    sampled: parent.sampled,
    metadata: { ...parent.metadata, ...options?.metadata },
  };
}

export function startChildSpan(
  parent: TraceContext,
  operation: string,
  options?: {
    serviceOverride?: string;
    metadata?: Record<string, unknown>;
  },
): TraceSpan {
  const child = createChildContext(parent, operation, options);
  return startSpan(child);
}

/* ============================================================================
 * SANITIZACIÓN DE METADATA / ATTRIBUTES
 * ============================================================================
 */

const SENSITIVE_KEYS = [
  "password",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "cookie",
  "jwt",
  "secret",
  "api_key",
];

function sanitizeObject(
  obj?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.includes(k.toLowerCase())) {
      clean[k] = "[REDACTED]";
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

/* ============================================================================
 * safeStringify (evita romperse por BigInt / ciclos)
 * ============================================================================
 */

function safeStringify(value: unknown): string {
  const seen = new WeakSet<object>();

  const replacer = (_key: string, val: unknown): unknown => {
    if (typeof val === "bigint") {
      return val.toString();
    }
    if (typeof val === "object" && val !== null) {
      if (seen.has(val as object)) {
        return "[Circular]";
      }
      seen.add(val as object);
    }
    return val;
  };

  try {
    return JSON.stringify(value, replacer);
  } catch {
    return '{"error":"serialization_failed"}';
  }
}

/* ============================================================================
 * END SPAN (hardened + integración con métricas)
 * ============================================================================
 */

export interface MetricsAdapter {
  recordLatency: (operation: string, durationMs: number) => void;
  recordError: (service: string, code?: string) => void;
}

let metricsAdapter: MetricsAdapter | null = null;

/** Permite conectar el kernel de tracing con metrics.ts sin dependencia directa. */
export function registerMetricsAdapter(adapter: MetricsAdapter): void {
  metricsAdapter = adapter;
}

export function endSpan(
  spanId: SpanId,
  success = true,
  error?: string,
  attributes?: Record<string, unknown>,
): TraceSpan | undefined {
  const span = activeSpans.get(spanId);
  if (!span) return undefined;

  const end = Date.now();
  span.endTime = end;
  span.durationMs = end - span.context.startTime;
  span.success = success;
  span.error = error;
  span.attributes = {
    ...(span.attributes ?? {}),
    ...(sanitizeObject(attributes) ?? {}),
  };

  // Status OTEL-like
  if (!success || error) {
    span.status = "ERROR";
  } else {
    span.status = "OK";
  }

  // Slow spans se consideran siempre relevantes para observabilidad. [web:468]
  const isSlow =
    !!span.durationMs && span.durationMs >= config.slowSpanThresholdMs;
  if (!success || error || isSlow) {
    span.context.sampled = true;
  }

  activeSpans.delete(spanId);

  // Integración opcional con métricas (RED)
  if (metricsAdapter && span.durationMs !== undefined) {
    metricsAdapter.recordLatency(
      `${span.context.service}.${span.context.operation}`,
      span.durationMs,
    );
    if (!success || error) {
      metricsAdapter.recordError(span.context.service, "span_error");
    }
  }

  return span;
}

/* ============================================================================
 * W3C TRACE CONTEXT (traceparent + tracestate)
 * ============================================================================
 */

export interface W3CTraceParent {
  version: string;
  traceId: string;
  spanId: string;
  flags: string;
}

export function buildTraceParent(context: TraceContext): string {
  const traceId = context.traceId.slice(0, 32);
  const spanId = context.spanId.slice(0, 16);
  const flags = context.sampled ? "01" : "00";
  return `00-${traceId}-${spanId}-${flags}`;
}

export function parseTraceParent(value: string): W3CTraceParent | null {
  const parts = value.split("-");
  if (parts.length !== 4) return null;

  const [version, traceId, spanId, flags] = parts;

  if (!/^[0-9a-fA-F]{2}$/.test(version)) return null;
  if (!/^[0-9a-fA-F]{32}$/.test(traceId)) return null;
  if (!/^[0-9a-fA-F]{16}$/.test(spanId)) return null;
  if (!/^[0-9a-fA-F]{2}$/.test(flags)) return null;

  return { version, traceId, spanId, flags };
}

/**
 * W3C tracestate básico para propagar correlationId entre servicios LTOS.
 * No hace parsing genérico; mantiene un vendor-key fijo "ltos". [web:466][web:464]
 */
export function buildTraceStateFromContext(context: TraceContext): string {
  const entries = [`ltos-corr=${context.correlationId}`];
  return entries.join(",");
}

export function extractCorrelationIdFromTraceState(
  tracestate: string | undefined,
): string | undefined {
  if (!tracestate) return undefined;
  const parts = tracestate.split(",");
  for (const part of parts) {
    const [k, v] = part.split("=");
    if (k === "ltos-corr" && v) return v;
  }
  return undefined;
}

/**
 * Crea TraceContext a partir de traceparent + tracestate, preservando correlationId si existe.
 */
export function contextFromTraceContextHeaders(
  traceparent: string,
  tracestate: string | undefined,
  operation: string,
  options?: {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    metadata?: Record<string, unknown>;
  },
): TraceContext | null {
  const parsed = parseTraceParent(traceparent);
  if (!parsed) return null;

  const correlationFromState = extractCorrelationIdFromTraceState(tracestate);
  const sampled = parsed.flags === "01";

  return {
    traceId: parsed.traceId,
    spanId: generateSpanId(),
    parentSpanId: parsed.spanId,
    correlationId: correlationFromState ?? generateCorrelationId(),
    requestId: options?.requestId ?? generateRequestId(),
    userId: options?.userId,
    sessionId: options?.sessionId,
    service: config.serviceName,
    operation,
    startTime: Date.now(),
    sampled,
    metadata: options?.metadata,
  };
}

/* ============================================================================
 * SERIALIZACIÓN PARA AUDITORÍA
 * ============================================================================
 */

export function serializeSpan(span: TraceSpan): string {
  const payload = {
    traceId: span.context.traceId,
    spanId: span.context.spanId,
    parentSpanId: span.context.parentSpanId,
    correlationId: span.context.correlationId,
    requestId: span.context.requestId,
    sessionId: span.context.sessionId,
    userId: span.context.userId,
    service: span.context.service,
    operation: span.context.operation,
    durationMs: span.durationMs,
    success: span.success,
    status: span.status,
    error: span.error,
    metadata: sanitizeObject(span.context.metadata),
    attributes: span.attributes,
    ts: new Date().toISOString(),
  };

  return safeStringify(payload);
}

/* ============================================================================
 * SNAPSHOT
 * ============================================================================
 */

export function getTracingSnapshot() {
  return {
    activeSpans: activeSpans.size,
    config: { ...config },
    timestamp: new Date().toISOString(),
  };
}

/* ============================================================================
 * ADAPTERS VENDOR-NEUTRAL (OTEL / Jaeger / Tempo / etc.)
 * ============================================================================
 */

export interface SpanExporter {
  export(span: TraceSpan): void | Promise<void>;
}

const MAX_EXPORTERS = 32;
let spanExporters: SpanExporter[] = [];

export function registerSpanExporter(exporter: SpanExporter): void {
  if (spanExporters.length >= MAX_EXPORTERS) {
    return;
  }
  spanExporters.push(exporter);
}

export function clearSpanExporters(): void {
  spanExporters = [];
}

/**
 * Exporta un span a todos los exporters en paralelo.
 * No propaga errores de exporters al flujo principal. [web:468]
 */
export async function exportSpan(span: TraceSpan): Promise<void> {
  if (!span.context.sampled) return;
  if (spanExporters.length === 0) return;

  const tasks = spanExporters.map((exporter) => {
    try {
      return Promise.resolve(exporter.export(span));
    } catch {
      return Promise.resolve();
    }
  });

  await Promise.allSettled(tasks);
}
