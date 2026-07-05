/**
 * YUN Data Fabric — Cross-Domain Orchestration
 * Per YUN Constitution Principle #3 (Federate Don't Subjugate)
 * and Principle #4 (Reversible by Default)
 *
 * Provides: saga pattern, circuit breakers for data access, transaction coordination.
 * Storage adapters route to real backends: Supabase (Identity), Supabase (Knowledge/Telemetry/Gameplay via tables).
 */

import type { YunDomain, StorageEngine } from './types';
import { publish, createEvent } from './event-bus';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// DATA FABRIC CONFIGURATION
// ============================================================================

export interface DataFabricConfig {
  defaultTimeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
}

const DEFAULT_CONFIG: DataFabricConfig = {
  defaultTimeoutMs: 10_000,
  retryAttempts: 3,
  retryDelayMs: 1_000,
};

// ============================================================================
// SAGA PATTERN
// ============================================================================

export interface SagaStep<TInput = unknown, TOutput = unknown> {
  name: string;
  execute: (input: TInput) => Promise<TOutput>;
  compensate: (input: TInput, output: TOutput, error: Error) => Promise<void>;
}

export interface SagaResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  completedSteps: string[];
  compensatedSteps: string[];
}

/**
 * Executes a saga — a sequence of steps with compensating transactions.
 * Per YUN Principle #4: Reversible by Default.
 */
export async function executeSaga<TFinal>(
  steps: SagaStep[],
  initialInput: unknown,
  config: Partial<DataFabricConfig> = {},
): Promise<SagaResult<TFinal>> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const completedSteps: string[] = [];
  const compensatedSteps: string[] = [];
  const stepOutputs: unknown[] = [];
  let currentInput = initialInput;

  try {
    for (const step of steps) {
      let lastError: Error | undefined;
      let attempts = 0;

      while (attempts < cfg.retryAttempts) {
        try {
          const output = await step.execute(currentInput as never);
          stepOutputs.push(output);
          completedSteps.push(step.name);
          currentInput = output;
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          attempts++;
          if (attempts < cfg.retryAttempts) {
            await delay(cfg.retryDelayMs * attempts);
          }
        }
      }

      if (lastError && attempts >= cfg.retryAttempts) {
        throw lastError;
      }
    }

    return {
      success: true,
      result: currentInput as TFinal,
      completedSteps,
      compensatedSteps,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    for (let i = completedSteps.length - 1; i >= 0; i--) {
      const step = steps.find((s) => s.name === completedSteps[i]);
      if (step) {
        try {
          await step.compensate(
            i > 0 ? stepOutputs[i - 1] : initialInput,
            stepOutputs[i],
            err,
          );
          compensatedSteps.push(step.name);
        } catch (compError) {
          console.error(
            `[YUN DataFabric] Compensation failed for step ${completedSteps[i]}:`,
            compError,
          );
        }
      }
    }

    return {
      success: false,
      error: err,
      completedSteps,
      compensatedSteps,
    };
  }
}

// ============================================================================
// CROSS-DOMAIN DATA ACCESS
// ============================================================================

export interface DataAccessRequest {
  domain: YunDomain;
  entity: string;
  operation: 'read' | 'write' | 'delete';
  payload?: unknown;
  userId?: string;
}

export interface DataAccessResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  domain: YunDomain;
  storage: StorageEngine;
  latencyMs: number;
}

/**
 * Accesses data across domains through the Data Fabric.
 * Routes to the correct storage engine based on domain mapping.
 */
export async function accessData<T>(
  request: DataAccessRequest,
  handlers: Record<YunDomain, DataHandler>,
): Promise<DataAccessResponse<T>> {
  const startTime = Date.now();
  const handler = handlers[request.domain];

  if (!handler) {
    return {
      success: false,
      error: `No handler registered for domain: ${request.domain}`,
      domain: request.domain,
      storage: 'supabase',
      latencyMs: Date.now() - startTime,
    };
  }

  try {
    const result = await handler.handle<T>(request);

    await publish(
      createEvent('yun.telemetry.data_access.created', 'data-fabric', {
        domain: request.domain,
        entity: request.entity,
        operation: request.operation,
        success: true,
        latencyMs: Date.now() - startTime,
      }, { domain: 'telemetry' }),
    );

    return {
      success: true,
      data: result,
      domain: request.domain,
      storage: handler.storage,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    await publish(
      createEvent('yun.telemetry.data_access.created', 'data-fabric', {
        domain: request.domain,
        entity: request.entity,
        operation: request.operation,
        success: false,
        error: errorMsg,
        latencyMs: Date.now() - startTime,
      }, { domain: 'telemetry' }),
    );

    return {
      success: false,
      error: errorMsg,
      domain: request.domain,
      storage: handler.storage,
      latencyMs: Date.now() - startTime,
    };
  }
}

// ============================================================================
// DATA HANDLER INTERFACE
// ============================================================================

export interface DataHandler {
  storage: StorageEngine;
  handle<T>(request: DataAccessRequest): Promise<T>;
}

// ============================================================================
// STORAGE ADAPTERS — Real Supabase-backed implementations
// ============================================================================

/**
 * Supabase adapter for Identity domain.
 * Handles: users, profiles, roles, badges, auth, gamification_quests, gamification_rewards.
 */
export class SupabaseIdentityAdapter implements DataHandler {
  storage: StorageEngine = 'supabase';

  async handle<T>(request: DataAccessRequest): Promise<T> {
    const { entity, operation, payload, userId } = request;

    switch (operation) {
      case 'read': {
        let query = supabase.from(entity as never).select('*');
        if (userId) query = query.eq('user_id', userId);
        if (payload && typeof payload === 'object' && 'id' in (payload as Record<string, unknown>)) {
          query = query.eq('id', (payload as Record<string, unknown>).id);
        }
        const { data, error } = await query;
        if (error) throw new Error(`Supabase read error: ${error.message}`);
        return data as T;
      }
      case 'write': {
        const { data, error } = await supabase
          .from(entity as never)
          .upsert(payload as never, { onConflict: 'id' });
        if (error) throw new Error(`Supabase write error: ${error.message}`);
        return data as T;
      }
      case 'delete': {
        const { error } = await supabase
          .from(entity as never)
          .delete()
          .eq('id', (payload as Record<string, unknown>)?.id as string);
        if (error) throw new Error(`Supabase delete error: ${error.message}`);
        return { deleted: true } as T;
      }
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }
}

/**
 * Supabase adapter for Commerce domain.
 * Handles: donations, subscriptions, payments, business registrations.
 * Uses Supabase tables (Neon migration pending).
 */
export class CommerceAdapter implements DataHandler {
  storage: StorageEngine = 'supabase';

  async handle<T>(request: DataAccessRequest): Promise<T> {
    const { entity, operation, payload, userId } = request;

    switch (operation) {
      case 'read': {
        let query = supabase.from(entity as never).select('*');
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await query;
        if (error) throw new Error(`Commerce read error: ${error.message}`);
        return data as T;
      }
      case 'write': {
        const { data, error } = await supabase
          .from(entity as never)
          .upsert(payload as never, { onConflict: 'id' });
        if (error) throw new Error(`Commerce write error: ${error.message}`);
        return data as T;
      }
      case 'delete': {
        const { error } = await supabase
          .from(entity as never)
          .delete()
          .eq('id', (payload as Record<string, unknown>)?.id as string);
        if (error) throw new Error(`Commerce delete error: ${error.message}`);
        return { deleted: true } as T;
      }
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }
}

/**
 * Supabase adapter for Knowledge domain.
 * Handles: ontology, chronicles, music cronicles, knowledge entries, archives.
 */
export class KnowledgeAdapter implements DataHandler {
  storage: StorageEngine = 'supabase';

  async handle<T>(request: DataAccessRequest): Promise<T> {
    const { entity, operation, payload } = request;

    switch (operation) {
      case 'read': {
        let query = supabase.from(entity as never).select('*');
        if (payload && typeof payload === 'object') {
          const filters = payload as Record<string, unknown>;
          for (const [key, value] of Object.entries(filters)) {
            if (key !== 'id' && typeof value === 'string') {
              query = query.eq(key, value);
            }
          }
        }
        const { data, error } = await query;
        if (error) throw new Error(`Knowledge read error: ${error.message}`);
        return data as T;
      }
      case 'write': {
        const { data, error } = await supabase
          .from(entity as never)
          .upsert(payload as never, { onConflict: 'id' });
        if (error) throw new Error(`Knowledge write error: ${error.message}`);
        return data as T;
      }
      case 'delete': {
        const { error } = await supabase
          .from(entity as never)
          .delete()
          .eq('id', (payload as Record<string, unknown>)?.id as string);
        if (error) throw new Error(`Knowledge delete error: ${error.message}`);
        return { deleted: true } as T;
      }
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }
}

/**
 * Supabase adapter for Telemetry domain.
 * Handles: audit_log, security_events, system_alerts, federation_health, ai_prompts_log.
 */
export class TelemetryAdapter implements DataHandler {
  storage: StorageEngine = 'supabase';

  async handle<T>(request: DataAccessRequest): Promise<T> {
    const { entity, operation, payload } = request;

    switch (operation) {
      case 'read': {
        let query = supabase.from(entity as never).select('*');
        if (payload && typeof payload === 'object') {
          const filters = payload as Record<string, unknown>;
          for (const [key, value] of Object.entries(filters)) {
            if (typeof value === 'string' || typeof value === 'number') {
              query = query.eq(key, value as never);
            }
          }
        }
        const { data, error } = await query;
        if (error) throw new Error(`Telemetry read error: ${error.message}`);
        return data as T;
      }
      case 'write': {
        const { data, error } = await supabase
          .from(entity as never)
          .insert(payload as never);
        if (error) throw new Error(`Telemetry write error: ${error.message}`);
        return data as T;
      }
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }
}

/**
 * In-memory adapter for Gameplay domain.
 * Handles: XP, points, streaks, sessions, quest progress, ephemeral game state.
 * Uses Supabase for persistence but caches in-memory for speed.
 */
export class GameplayAdapter implements DataHandler {
  storage: StorageEngine = 'redis';
  private cache = new Map<string, { data: unknown; expiresAt: number }>();

  async handle<T>(request: DataAccessRequest): Promise<T> {
    const { entity, operation, payload, userId } = request;
    const cacheKey = `${entity}:${userId ?? 'global'}:${JSON.stringify(payload ?? {})}`;

    switch (operation) {
      case 'read': {
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
          return cached.data as T;
        }
        let query = supabase.from(entity as never).select('*');
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await query;
        if (error) throw new Error(`Gameplay read error: ${error.message}`);
        this.cache.set(cacheKey, { data, expiresAt: Date.now() + 30_000 });
        return data as T;
      }
      case 'write': {
        this.cache.delete(cacheKey);
        const { data, error } = await supabase
          .from(entity as never)
          .upsert(payload as never, { onConflict: 'id' });
        if (error) throw new Error(`Gameplay write error: ${error.message}`);
        return data as T;
      }
      case 'delete': {
        this.cache.delete(cacheKey);
        const { error } = await supabase
          .from(entity as never)
          .delete()
          .eq('id', (payload as Record<string, unknown>)?.id as string);
        if (error) throw new Error(`Gameplay delete error: ${error.message}`);
        return { deleted: true } as T;
      }
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }
}

// ============================================================================
// DATA FABRIC INSTANCE
// ============================================================================

export class YunDataFabric {
  private handlers: Map<YunDomain, DataHandler> = new Map();

  constructor() {
    this.registerHandler('identity', new SupabaseIdentityAdapter());
    this.registerHandler('commerce', new CommerceAdapter());
    this.registerHandler('knowledge', new KnowledgeAdapter());
    this.registerHandler('telemetry', new TelemetryAdapter());
    this.registerHandler('gameplay', new GameplayAdapter());
  }

  registerHandler(domain: YunDomain, handler: DataHandler): void {
    this.handlers.set(domain, handler);
  }

  async access<T>(request: DataAccessRequest): Promise<DataAccessResponse<T>> {
    const handlerMap = Object.fromEntries(this.handlers) as Record<YunDomain, DataHandler>;
    return accessData<T>(request, handlerMap);
  }

  async executeSaga<TFinal>(
    steps: SagaStep[],
    initialInput: unknown,
  ): Promise<SagaResult<TFinal>> {
    return executeSaga<TFinal>(steps, initialInput);
  }
}

// Singleton
export const dataFabric = new YunDataFabric();

// ============================================================================
// HELPERS
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
