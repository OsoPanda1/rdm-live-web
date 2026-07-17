export const YUN_DOMAINS = ['identity', 'commerce', 'knowledge', 'telemetry', 'gameplay'] as const;
export type YunDomain = (typeof YUN_DOMAINS)[number];

export const YUN_FEDERATIONS = [
  'comercio', 'turismo_cultura', 'academia', 'gobierno',
  'tech_infra', 'comunidad', 'metaverso_xr',
] as const;
export type YunFederation = (typeof YUN_FEDERATIONS)[number];

export const DATA_CLASSIFICATIONS = ['public', 'internal', 'confidential', 'restricted'] as const;
export type DataClassification = (typeof DATA_CLASSIFICATIONS)[number];

export const STORAGE_ENGINES = ['supabase', 'neon', 'turso', 'd1', 'redis'] as const;
export type StorageEngine = (typeof STORAGE_ENGINES)[number];

export const DOMAIN_STORAGE: Record<YunDomain, StorageEngine> = {
  identity: 'supabase', commerce: 'neon', knowledge: 'turso',
  telemetry: 'd1', gameplay: 'redis',
};

export const FEDERATION_DOMAINS: Record<YunFederation, YunDomain[]> = {
  comercio: ['commerce'], turismo_cultura: ['knowledge'], academia: ['knowledge'],
  gobierno: ['identity', 'telemetry'], tech_infra: ['telemetry', 'identity'],
  comunidad: ['knowledge', 'gameplay'], metaverso_xr: ['gameplay'],
};

export type YunEventType =
  | `yun.${string}.${string}.created` | `yun.${string}.${string}.updated`
  | `yun.${string}.${string}.deleted` | `yun.${string}.${string}.archived`
  | `yun.system.health` | `yun.system.mode-changed` | `yun.system.overload`
  | `yun.federation.degraded` | `yun.federation.recovered` | `yun.domain.sync`;

export interface YunEventEnvelope<T = unknown> {
  id: string; type: YunEventType; source: string; timestamp: string; data: T;
  metadata: { version: string; correlationId?: string; causationId?: string;
    federation?: YunFederation; domain?: YunDomain; classification?: DataClassification; };
}

export interface YunDataCatalogEntry {
  domain: YunDomain; entity: string; owner_federation: YunFederation;
  data_class: DataClassification; storage: StorageEngine;
  retention_days: number; pii_fields: string[]; created_at: string;
}

export interface YunGatewayConfig {
  rateLimit: { windowMs: number; maxPerWindow: number; maxPerUser: number; };
  circuitBreaker: { failureThreshold: number; resetTimeoutMs: number; halfOpenMax: number; };
  tls: { minVersion: 'TLSv1.2' | 'TLSv1.3'; ciphers: string[]; };
}

export interface YunFederationHealth {
  federation: YunFederation; status: 'healthy' | 'degraded' | 'critical' | 'offline';
  health_score: number; last_heartbeat: string; active_domains: YunDomain[];
  error_rate: number; p99_latency_ms: number;
}

export interface YunMetric {
  name: string; value: number; labels: Record<string, string>; timestamp: string;
}

export interface YunLogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string; context: Record<string, unknown>;
  timestamp: string; trace_id?: string; span_id?: string;
}

export interface YunTraceSpan {
  trace_id: string; span_id: string; parent_span_id?: string;
  name: string; start_time: string; end_time?: string;
  status: 'ok' | 'error' | 'unset'; attributes: Record<string, string>;
}

export interface YunADR {
  id: string; title: string; status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  date: string; authors: string[]; context: string;
  decision: string; consequences: string[]; superseded_by?: string;
}
