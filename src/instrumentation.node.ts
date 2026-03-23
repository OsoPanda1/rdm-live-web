import { createTraceId } from "@/core/context/trace";

interface SpanRecord {
  name: string;
  attributes: Record<string, string | number>;
  startedAt: number;
}

function startManualSpan(name: string): SpanRecord {
  return { name, attributes: {}, startedAt: Date.now() };
}

function endManualSpan(span: SpanRecord) {
  if (import.meta.env?.DEV) {
    const duration = Date.now() - span.startedAt;
    console.debug(`[otel-lite] span=${span.name} duration_ms=${duration}`, span.attributes);
  }
}

export function setSpanAttribute(span: SpanRecord, key: string, value: string | number) {
  span.attributes[key] = value;
}

export async function withSpan<T>(name: string, fn: () => Promise<T> | T, attributes: Record<string, string | number> = {}): Promise<T> {
  const span = startManualSpan(name);
  const fallbackTraceId = createTraceId();

  setSpanAttribute(span, "traceId", fallbackTraceId);
  Object.entries(attributes).forEach(([key, value]) => setSpanAttribute(span, key, value));

  try {
    return await fn();
  } finally {
    endManualSpan(span);
  }
}

export { startManualSpan, endManualSpan };
