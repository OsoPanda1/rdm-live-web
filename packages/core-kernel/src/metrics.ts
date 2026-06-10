type CounterKey = string;
type GaugeKey = string;

const counters: Record<CounterKey, number> = {};
const gauges: Record<GaugeKey, number> = {};

export function incCounter(key: CounterKey, value = 1) {
  counters[key] = (counters[key] ?? 0) + value;
}

export function setGauge(key: GaugeKey, value: number) {
  gauges[key] = value;
}

export function getMetricsSnapshot() {
  return {
    counters: { ...counters },
    gauges: { ...gauges },
    ts: new Date().toISOString(),
  };
}

export function resetMetricsSnapshot() {
  for (const key of Object.keys(counters)) delete counters[key];
  for (const key of Object.keys(gauges)) delete gauges[key];
}

/**
 * Claves sugeridas:
 * - http.requests.total
 * - http.requests.error
 * - ai.requests.total
 * - ai.requests.error
 * - commerce.clicks.whatsapp
 * - twin.routes.viewed
 */
