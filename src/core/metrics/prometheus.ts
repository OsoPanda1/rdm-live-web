/**
 * RDM Digital - Sistema de Metricas Prometheus-compatible GEN-7+
 * Metricas tecnicas y de negocio para observabilidad
 */

import { logger } from '@/lib/logger';

type Labels = Record<string, string>;

// ============================================================================
// PRIMITIVAS DE METRICAS
// ============================================================================

const MAX_CARDINALITY = 10_000;
const MAX_LABEL_KEYS = 5;
const MAX_LABEL_VALUE_LENGTH = 64;

function validateLabels(labels: Labels, metricName: string): void {
  const keys = Object.keys(labels);
  if (keys.length > MAX_LABEL_KEYS) {
    logger.warn(`[prometheus] ${metricName}: truncating labels from ${keys.length} to ${MAX_LABEL_KEYS}`);
    for (const k of keys.slice(MAX_LABEL_KEYS)) delete labels[k];
  }
  for (const [k, v] of Object.entries(labels)) {
    if (v.length > MAX_LABEL_VALUE_LENGTH) {
      labels[k] = v.slice(0, MAX_LABEL_VALUE_LENGTH);
    }
  }
}

export class Counter {
  private data = new Map<string, number>();

  constructor(
    public readonly name: string,
    public readonly help: string
  ) {}

  inc(labels: Labels = {}, value = 1): void {
    validateLabels(labels, this.name);
    const key = JSON.stringify(labels);
    if (!this.data.has(key) && this.data.size >= MAX_CARDINALITY) {
      logger.warn(`[prometheus] ${this.name}: cardinality limit (${MAX_CARDINALITY}) reached, dropping labels`);
      return;
    }
    const previous = this.data.get(key) ?? 0;
    this.data.set(key, previous + value);
  }

  snapshot(): Array<{ labels: Labels; value: number }> {
    return [...this.data.entries()].map(([labels, value]) => ({
      labels: JSON.parse(labels),
      value,
    }));
  }

  cardinality(): number {
    return this.data.size;
  }

  reset(): void {
    this.data.clear();
  }
}

export class Gauge {
  private value = 0;
  private labels: Labels = {};

  constructor(
    public readonly name: string,
    public readonly help: string
  ) {}

  inc(value = 1): void {
    this.value += value;
  }

  dec(value = 1): void {
    this.value = Math.max(0, this.value - value);
  }

  set(value: number, labels?: Labels): void {
    this.value = value;
    if (labels) this.labels = labels;
  }

  snapshot(): number {
    return this.value;
  }

  snapshotWithLabels(): { value: number; labels: Labels } {
    return { value: this.value, labels: this.labels };
  }
}

export class Histogram {
  private observations: number[] = [];
  private labeledObservations = new Map<string, number[]>();

  constructor(
    public readonly name: string,
    public readonly help: string,
    private readonly buckets: number[]
  ) {
    this.buckets = buckets.sort((a, b) => a - b);
  }

  observe(value: number, labels?: Labels): void {
    if (labels && Object.keys(labels).length > 0) {
      const key = JSON.stringify(labels);
      const existing = this.labeledObservations.get(key) ?? [];
      existing.push(value);
      this.labeledObservations.set(key, existing);
    } else {
      this.observations.push(value);
    }
  }

  snapshot(): {
    count: number;
    sum: number;
    buckets: Array<{ le: number; count: number }>;
  } {
    const allObs = [
      ...this.observations,
      ...[...this.labeledObservations.values()].flat(),
    ];

    return {
      count: allObs.length,
      sum: allObs.reduce((acc, curr) => acc + curr, 0),
      buckets: this.buckets.map(bucket => ({
        le: bucket,
        count: allObs.filter(v => v <= bucket).length,
      })),
    };
  }

  percentile(p: number): number {
    const allObs = [
      ...this.observations,
      ...[...this.labeledObservations.values()].flat(),
    ].sort((a, b) => a - b);

    if (allObs.length === 0) return 0;

    const index = Math.ceil((p / 100) * allObs.length) - 1;
    return allObs[Math.max(0, index)];
  }

  reset(): void {
    this.observations = [];
    this.labeledObservations.clear();
  }
}

// ============================================================================
// REGISTRO DE METRICAS
// ============================================================================

type Metric = Counter | Gauge | Histogram;

export class Registry {
  private metrics = new Map<string, Metric>();

  registerMetric(metric: Metric): void {
    this.metrics.set(metric.name, metric);
  }

  getMetric<T extends Metric>(name: string): T | undefined {
    return this.metrics.get(name) as T | undefined;
  }

  async metricsText(): Promise<string> {
    const lines: string[] = [];

    for (const metric of this.metrics.values()) {
      lines.push(`# HELP ${metric.name} ${metric.help}`);

      if (metric instanceof Counter) {
        lines.push(`# TYPE ${metric.name} counter`);
        const entries = metric.snapshot();
        for (const entry of entries) {
          const labels = Object.entries(entry.labels)
            .map(([k, v]) => `${k}="${v}"`)
            .join(',');
          lines.push(
            labels
              ? `${metric.name}{${labels}} ${entry.value}`
              : `${metric.name} ${entry.value}`
          );
        }
      } else if (metric instanceof Gauge) {
        lines.push(`# TYPE ${metric.name} gauge`);
        lines.push(`${metric.name} ${metric.snapshot()}`);
      } else if (metric instanceof Histogram) {
        lines.push(`# TYPE ${metric.name} histogram`);
        const snap = metric.snapshot();
        for (const bucket of snap.buckets) {
          lines.push(`${metric.name}_bucket{le="${bucket.le}"} ${bucket.count}`);
        }
        lines.push(`${metric.name}_bucket{le="+Inf"} ${snap.count}`);
        lines.push(`${metric.name}_count ${snap.count}`);
        lines.push(`${metric.name}_sum ${snap.sum}`);
      }
    }

    return lines.join('\n');
  }

  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [name, metric] of this.metrics.entries()) {
      if (metric instanceof Counter) {
        result[name] = metric.snapshot();
      } else if (metric instanceof Gauge) {
        result[name] = metric.snapshot();
      } else if (metric instanceof Histogram) {
        const snap = metric.snapshot();
        result[name] = {
          ...snap,
          p50: metric.percentile(50),
          p95: metric.percentile(95),
          p99: metric.percentile(99),
        };
      }
    }

    return result;
  }
}

// ============================================================================
// INSTANCIA GLOBAL Y METRICAS PREDEFINIDAS
// ============================================================================

export const register = new Registry();

// Metricas de Decision Isabella
export const isabellaTerritorialDecisionLatencyMs = new Histogram(
  'isabella_territorial_decision_latency_ms',
  'Latencia de decisiones territoriales Isabella',
  [10, 25, 50, 100, 200, 500, 1000]
);

export const decisionScore = new Histogram(
  'decision_score',
  'Distribucion del score calculado por turista',
  [0.2, 0.4, 0.6, 0.8, 1]
);

export const decisionsEmittedTotal = new Counter(
  'decisions_emitted_total',
  'Total de decisiones emitidas por tipo y territorio'
);

// Metricas de Feedback
export const reviews = new Counter(
  'reviews_total',
  'Volumen de resenas por territorio y polaridad'
);

export const consentEvents = new Counter(
  'consent_events_total',
  'Total de eventos de consentimiento'
);

export const reviewsScore = new Histogram(
  'reviews_score',
  'Distribucion de rating de resenas',
  [1, 2, 3, 4, 5]
);

// Metricas de Conexiones
export const streamConnections = new Gauge(
  'sse_connections',
  'Conexiones SSE activas'
);

export const activeUsers = new Gauge(
  'active_users',
  'Usuarios activos en el sistema'
);

// Metricas de Cache Geo
export const isabellaGeoLruSize = new Gauge(
  'isabella_geo_lru_size',
  'Tamano actual del LRU geoespacial'
);

export const isabellaGeoLruCapacity = new Gauge(
  'isabella_geo_lru_capacity',
  'Capacidad maxima del LRU geoespacial'
);

export const geoLruHits = new Counter(
  'geo_lru_hits_total',
  'Hits del cache LRU geoespacial'
);

export const geoLruMisses = new Counter(
  'geo_lru_misses_total',
  'Misses del cache LRU geoespacial'
);

// Metricas de Movimiento
export const isabellaMovementFilterAlpha = new Gauge(
  'isabella_movement_filter_alpha',
  'Alpha del filtro EMA de movimiento'
);

// Metricas de Bus de Eventos
export const eventsDroppedTotal = new Counter(
  'events_dropped_total',
  'Eventos descartados por backpressure'
);

export const eventsProcessedTotal = new Counter(
  'events_processed_total',
  'Eventos procesados por el bus'
);

export const eventQueueSize = new Gauge(
  'event_queue_size',
  'Tamano actual de la cola de eventos'
);

// Metricas de Federacion
export const federationHealth = new Gauge(
  'federation_health',
  'Salud global de la heptafederacion'
);

export const federationModuleStatus = new Counter(
  'federation_module_status_total',
  'Estado de modulos de federacion'
);

// Metricas de Kernel
export const kernelLatency = new Histogram(
  'kernel_latency_ms',
  'Latencia del kernel de recomendaciones',
  [10, 25, 50, 100, 250, 500]
);

export const intentsProcessed = new Counter(
  'intents_processed_total',
  'Intents procesados por tipo'
);

// Alias de compatibilidad
export const decisionLatency = isabellaTerritorialDecisionLatencyMs;

// Registrar todas las metricas
[
  isabellaTerritorialDecisionLatencyMs,
  decisionScore,
  decisionsEmittedTotal,
  reviews,
  consentEvents,
  reviewsScore,
  streamConnections,
  activeUsers,
  isabellaGeoLruSize,
  isabellaGeoLruCapacity,
  geoLruHits,
  geoLruMisses,
  isabellaMovementFilterAlpha,
  eventsDroppedTotal,
  eventsProcessedTotal,
  eventQueueSize,
  federationHealth,
  federationModuleStatus,
  kernelLatency,
  intentsProcessed,
].forEach(metric => register.registerMetric(metric));

// ============================================================================
// TERRITORIOS PERMITIDOS (Anti-cardinalidad)
// ============================================================================

export const ALLOWED_TERRITORIES = ['RDM', 'PACHUCA', 'HIDALGO', 'CDMX'] as const;
export type AllowedTerritory = (typeof ALLOWED_TERRITORIES)[number];

export function sanitizeTerritory(territory: string): AllowedTerritory {
  const upper = territory.toUpperCase();
  if (ALLOWED_TERRITORIES.includes(upper as AllowedTerritory)) {
    return upper as AllowedTerritory;
  }
  return 'RDM';
}
