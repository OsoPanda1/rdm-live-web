// Supabase Repository Implementation — concrete adapters behind the
// S-NDTM repository interfaces. Domain logic NEVER references Supabase
// directly; it only depends on the interfaces in types.ts.

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Repository, TransactionalRepository, TransactionToken,
  UserProfile, IIdentityRepository,
  MerchantProfile, CommerceTransaction, ICommerceRepository,
  KnowledgeEntry, IKnowledgeRepository,
  TelemetryEvent, ITelemetryRepository,
  GameplayProfile, LeaderboardEntry, IGameplayRepository,
  TerritorialPOI, UserContribution, ITerritorialRepository,
  SNDTMRegistry,
} from './types';

// ---- Generic Supabase Repository ----

class SupabaseRepo<T extends { id: string }> implements Repository<T> {
  constructor(
    protected readonly client: SupabaseClient,
    protected readonly table: string,
  ) {}

  async findById(id: string): Promise<T | null> {
    const { data } = await this.client.from(this.table).select('*').eq('id', id).single();
    return data as T | null;
  }

  async findAll(filter?: Partial<T>): Promise<T[]> {
    let query = this.client.from(this.table).select('*');
    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        if (value !== undefined) query = query.eq(key, value as string);
      }
    }
    const { data } = await query;
    return (data ?? []) as T[];
  }

  async save(entity: T): Promise<T> {
    const { data } = await this.client.from(this.table).upsert(entity as never).select().single();
    return data as T;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client.from(this.table).delete().eq('id', id);
    return !error;
  }

  async count(filter?: Partial<T>): Promise<number> {
    let query = this.client.from(this.table).select('*', { count: 'exact', head: true });
    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        if (value !== undefined) query = query.eq(key, value as string);
      }
    }
    const { count } = await query;
    return count ?? 0;
  }
}

class SupabaseTransactionalRepo<T extends { id: string }>
  extends SupabaseRepo<T>
  implements TransactionalRepository<T> {
  async beginTransaction(): Promise<TransactionToken> {
    return { id: crypto.randomUUID(), startedAt: Date.now() };
  }
  async commit(_token: TransactionToken): Promise<void> { /* Supabase handles tx per-request */ }
  async rollback(_token: TransactionToken): Promise<void> { /* no-op for Supabase */ }
}

// ---- Domain-specific Implementations ----

class SupabaseIdentityRepo implements IIdentityRepository {
  private readonly repo = new SupabaseRepo<UserProfile>(this.client, 'profiles');
  constructor(private readonly client: SupabaseClient) {}
  async findById(id: string) { return this.repo.findById(id); }
  async findAll(filter?: Partial<UserProfile>) { return this.repo.findAll(filter); }
  async save(entity: UserProfile) { return this.repo.save(entity); }
  async delete(id: string) { return this.repo.delete(id); }
  async count(filter?: Partial<UserProfile>) { return this.repo.count(filter); }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const { data } = await this.client.from('profiles').select('*').eq('email', email).single();
    return data as UserProfile | null;
  }

  async updateRoles(userId: string, roles: string[]): Promise<void> {
    await this.client.from('user_roles').upsert({ user_id: userId, roles });
  }
}

class SupabaseCommerceRepo implements ICommerceRepository {
  readonly merchants = new SupabaseRepo<MerchantProfile>(this.client, 'merchant_profiles');
  readonly transactions = new SupabaseTransactionalRepo<CommerceTransaction>(this.client, 'commerce_transactions');
  constructor(private readonly client: SupabaseClient) {}

  async findMerchantsByLocation(bounds: { north: number; south: number; east: number; west: number }): Promise<MerchantProfile[]> {
    const { data } = await this.client
      .rpc('merchants_in_bounds', {
        north: bounds.north, south: bounds.south,
        east: bounds.east, west: bounds.west,
      });
    return (data ?? []) as MerchantProfile[];
  }
}

class SupabaseKnowledgeRepo extends SupabaseRepo<KnowledgeEntry> implements IKnowledgeRepository {
  constructor(client: SupabaseClient) { super(client, 'knowledge_entries'); }

  async search(query: string, filters?: { type?: string; tags?: string[] }): Promise<KnowledgeEntry[]> {
    let q = this.client.from('knowledge_entries').select('*').textSearch('content', query);
    if (filters?.type) q = q.eq('type', filters.type);
    if (filters?.tags?.length) q = q.contains('tags', filters.tags);
    const { data } = await q;
    return (data ?? []) as KnowledgeEntry[];
  }

  async findByTag(tag: string): Promise<KnowledgeEntry[]> {
    const { data } = await this.client.from('knowledge_entries').select('*').contains('tags', [tag]);
    return (data ?? []) as KnowledgeEntry[];
  }
}

class SupabaseTelemetryRepo implements ITelemetryRepository {
  readonly events = new SupabaseRepo<TelemetryEvent>(this.client, 'yun_event_log');
  constructor(private readonly client: SupabaseClient) {}

  async queryTimeRange(from: string, to: string, filter?: { severity?: string; source?: string }): Promise<TelemetryEvent[]> {
    let q = this.client.from('yun_event_log').select('*').gte('timestamp', from).lte('timestamp', to);
    if (filter?.severity) q = q.eq('severity', filter.severity);
    if (filter?.source) q = q.eq('source', filter.source);
    const { data } = await q;
    return (data ?? []) as TelemetryEvent[];
  }

  async aggregateMetrics(eventType: string, _period: string): Promise<{ count: number; avgValue: number }> {
    const { count } = await this.client.from('yun_event_log').select('*', { count: 'exact', head: true }).eq('event_type', eventType);
    return { count: count ?? 0, avgValue: 0 };
  }
}

class SupabaseGameplayRepo implements IGameplayRepository {
  readonly profiles = new SupabaseRepo<GameplayProfile>(this.client, 'gamification_profiles');
  constructor(private readonly client: SupabaseClient) {}

  async getLeaderboard(limit: number, offset: number): Promise<LeaderboardEntry[]> {
    const { data } = await this.client
      .from('gamification_profiles')
      .select('user_id, xp, level')
      .order('xp', { ascending: false })
      .range(offset, offset + limit - 1);
    return (data ?? []).map((entry: { user_id: string; xp: number; level: number }, idx: number) => ({
      userId: entry.user_id,
      displayName: '',
      xp: entry.xp,
      level: entry.level,
      rank: offset + idx + 1,
    }));
  }

  async awardXp(userId: string, amount: number, reason: string): Promise<void> {
    await this.client.rpc('award_xp', { p_user_id: userId, p_amount: amount, p_reason: reason });
  }
}

class SupabaseTerritorialRepo implements ITerritorialRepository {
  readonly pois = new SupabaseRepo<TerritorialPOI>(this.client, 'territorial_pois');
  readonly contributions = new SupabaseRepo<UserContribution>(this.client, 'user_contributions');
  constructor(private readonly client: SupabaseClient) {}

  async findPOIsInBounds(bounds: { north: number; south: number; east: number; west: number }): Promise<TerritorialPOI[]> {
    const { data } = await this.client
      .rpc('pois_in_bounds', {
        north: bounds.north, south: bounds.south,
        east: bounds.east, west: bounds.west,
      });
    return (data ?? []) as TerritorialPOI[];
  }

  async findContributionsByUser(userId: string): Promise<UserContribution[]> {
    const { data } = await this.client.from('user_contributions').select('*').eq('user_id', userId);
    return (data ?? []) as UserContribution[];
  }
}

// ---- Registry Factory ----

export function createSupabaseRegistry(client: SupabaseClient): SNDTMRegistry {
  return {
    identity: new SupabaseIdentityRepo(client),
    commerce: new SupabaseCommerceRepo(client),
    knowledge: new SupabaseKnowledgeRepo(client),
    telemetry: new SupabaseTelemetryRepo(client),
    gameplay: new SupabaseGameplayRepo(client),
    territorial: new SupabaseTerritorialRepo(client),
  };
}
