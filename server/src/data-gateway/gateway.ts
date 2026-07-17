import type { DataSource, EntityType, GatewayConfig, GatewayContext, QueryOptions, QueryResult, SensitivityLevel } from "./types.js";
import { storeSource } from "./sources/store-source.js";
import { auditService } from "./services/audit.service.js";
import { cacheService } from "./services/cache.service.js";
import { journalService } from "./services/journal.service.js";

const DEFAULT_CONFIG: GatewayConfig = {
  auditEnabled: true,
  journalEnabled: true,
  cacheEnabled: true,
  defaultCacheTtl: 300,
  sensitivityDefaults: {
    user: "high",
    donation: "high",
    ledger: "high",
    membership: "medium",
    tokenBalance: "medium",
    yunBeEvent: "medium",
    yunBeJournal: "medium",
    digitalTwin: "low",
    business: "low",
    place: "low",
  },
};

export class DataGateway {
  private sources = new Map<string, DataSource>();
  private config: GatewayConfig;

  constructor(config?: Partial<GatewayConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.registerSource(storeSource);
  }

  registerSource(source: DataSource): void {
    this.sources.set(source.name, source);
  }

  private getSource(_entityType: EntityType): DataSource {
    return this.sources.get("in-memory-store")!;
  }

  private getSensitivity(entityType: EntityType): SensitivityLevel {
    return this.config.sensitivityDefaults[entityType] ?? "low";
  }

  async findById<T>(entityType: EntityType, id: string, context?: GatewayContext): Promise<T | null> {
    const cacheKey = `dg:${entityType}:${id}`;
    if (this.config.cacheEnabled) {
      const cached = cacheService.get<T>(cacheKey);
      if (cached) return cached;
    }

    const source = this.getSource(entityType);
    const result = await source.findById<T>(entityType, id);

    if (result && this.config.cacheEnabled) {
      cacheService.set(cacheKey, result, this.config.defaultCacheTtl);
    }

    const duration = 0;
    if (this.config.auditEnabled && context) {
      auditService.log({
        endpoint: `/dg/${entityType}/${id}`,
        method: "GET",
        statusCode: result ? 200 : 404,
        durationMs: duration,
        sensitivityLevel: this.getSensitivity(entityType),
        context,
      });
    }

    return result;
  }

  async query<T>(entityType: EntityType, options?: QueryOptions, context?: GatewayContext): Promise<QueryResult<T>> {
    const cacheKey = `dg:q:${entityType}:${JSON.stringify(options)}`;
    if (this.config.cacheEnabled) {
      const cached = cacheService.get<QueryResult<T>>(cacheKey);
      if (cached) return cached;
    }

    const source = this.getSource(entityType);
    const result = await source.query<T>(entityType, options);

    if (this.config.cacheEnabled) {
      cacheService.set(cacheKey, result, this.config.defaultCacheTtl);
    }

    if (this.config.auditEnabled && context) {
      auditService.log({
        endpoint: `/dg/${entityType}/query`,
        method: "GET",
        params: options as Record<string, unknown>,
        statusCode: 200,
        durationMs: 0,
        sensitivityLevel: this.getSensitivity(entityType),
        context,
      });
    }

    return result;
  }

  async create<T>(entityType: EntityType, data: Partial<T>, context?: GatewayContext): Promise<T> {
    const source = this.getSource(entityType);
    const result = await source.create<T>(entityType, data);

    cacheService.invalidateByPrefix(`dg:${entityType}:`);

    if (this.config.auditEnabled && context) {
      auditService.log({
        endpoint: `/dg/${entityType}`,
        method: "POST",
        statusCode: 201,
        durationMs: 0,
        sensitivityLevel: this.getSensitivity(entityType),
        context,
      });
    }

    return result;
  }

  async update<T>(entityType: EntityType, id: string, data: Partial<T>, context?: GatewayContext): Promise<T | null> {
    const source = this.getSource(entityType);
    const result = await source.update<T>(entityType, id, data);

    cacheService.invalidateByPrefix(`dg:${entityType}:`);

    if (this.config.auditEnabled && context) {
      auditService.log({
        endpoint: `/dg/${entityType}/${id}`,
        method: "PATCH",
        statusCode: result ? 200 : 404,
        durationMs: 0,
        sensitivityLevel: this.getSensitivity(entityType),
        context,
      });
    }

    return result;
  }

  async delete(entityType: EntityType, id: string, context?: GatewayContext): Promise<boolean> {
    const source = this.getSource(entityType);
    const result = await source.delete(entityType, id);

    cacheService.invalidateByPrefix(`dg:${entityType}:`);

    if (this.config.auditEnabled && context) {
      auditService.log({
        endpoint: `/dg/${entityType}/${id}`,
        method: "DELETE",
        statusCode: result ? 200 : 404,
        durationMs: 0,
        sensitivityLevel: this.getSensitivity(entityType),
        context,
      });
    }

    return result;
  }

  getConfig(): GatewayConfig {
    return { ...this.config };
  }
}

export const gateway = new DataGateway();
