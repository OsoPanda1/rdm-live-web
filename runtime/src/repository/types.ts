// S-NDTM Repository Interfaces — Domain-Driven persistence contracts.
// These interfaces define the persistence boundary for each Sovereign
// Digital Territorial Memory domain. Implementations (Supabase, Neon,
// Turso, D1, Redis) are injected behind these interfaces, never exposed
// to domain logic. This eliminates vendor lock-in and leaky abstractions.

// ---- Generic Repository Primitives ----

export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<boolean>;
  count(filter?: Partial<T>): Promise<number>;
}

export interface TransactionalRepository<T, ID = string> extends Repository<T, ID> {
  beginTransaction(): Promise<TransactionToken>;
  commit(token: TransactionToken): Promise<void>;
  rollback(token: TransactionToken): Promise<void>;
}

export interface TransactionToken {
  id: string;
  startedAt: number;
}

// ---- Identity Domain (Profiles, Auth, Roles) ----

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IIdentityRepository extends Repository<UserProfile> {
  findByEmail(email: string): Promise<UserProfile | null>;
  updateRoles(userId: string, roles: string[]): Promise<void>;
}

// ---- Commerce Domain (Merchants, Products, Payments) ----

export interface MerchantProfile {
  id: string;
  ownerId: string;
  businessName: string;
  category: string;
  location: { lat: number; lng: number };
  verified: boolean;
}

export interface CommerceTransaction {
  id: string;
  merchantId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

export interface ICommerceRepository {
  merchants: Repository<MerchantProfile>;
  transactions: TransactionalRepository<CommerceTransaction>;
  findMerchantsByLocation(bounds: { north: number; south: number; east: number; west: number }): Promise<MerchantProfile[]>;
}

// ---- Knowledge Domain (Songs, Places, Chronicles) ----

export interface KnowledgeEntry {
  id: string;
  type: 'song' | 'place' | 'chronicle' | 'article';
  title: string;
  content: string;
  tags: string[];
  mediaUrls: string[];
  createdAt: string;
}

export interface IKnowledgeRepository extends Repository<KnowledgeEntry> {
  search(query: string, filters?: { type?: string; tags?: string[] }): Promise<KnowledgeEntry[]>;
  findByTag(tag: string): Promise<KnowledgeEntry[]>;
}

// ---- Telemetry Domain (Logs, Metrics, Audit) ----

export interface TelemetryEvent {
  id: string;
  eventType: string;
  source: string;
  severity: 'debug' | 'info' | 'warn' | 'error';
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface ITelemetryRepository {
  events: Repository<TelemetryEvent>;
  queryTimeRange(from: string, to: string, filter?: { severity?: string; source?: string }): Promise<TelemetryEvent[]>;
  aggregateMetrics(eventType: string, period: string): Promise<{ count: number; avgValue: number }>;
}

// ---- Gameplay Domain (Profiles, XP, Badges, Leaderboard) ----

export interface GameplayProfile {
  userId: string;
  xp: number;
  level: number;
  cattleyaTier: string;
  badges: string[];
  lastActive: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  xp: number;
  level: number;
  rank: number;
}

export interface IGameplayRepository {
  profiles: Repository<GameplayProfile, string>;
  getLeaderboard(limit: number, offset: number): Promise<LeaderboardEntry[]>;
  awardXp(userId: string, amount: number, reason: string): Promise<void>;
}

// ---- Territorial Domain (POIs, Contributions, Heatmap) ----

export interface TerritorialPOI {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  category: string;
  tags: string[];
  verified: boolean;
}

export interface UserContribution {
  id: string;
  userId: string;
  type: 'checkin' | 'review' | 'photo' | 'rating' | 'tip' | 'event_report' | 'route_trace' | 'poi_suggestion';
  location: { lat: number; lng: number };
  payload: Record<string, unknown>;
  verified: boolean;
  createdAt: string;
}

export interface ITerritorialRepository {
  pois: Repository<TerritorialPOI>;
  contributions: Repository<UserContribution>;
  findPOIsInBounds(bounds: { north: number; south: number; east: number; west: number }): Promise<TerritorialPOI[]>;
  findContributionsByUser(userId: string): Promise<UserContribution[]>;
}

// ---- S-NDTM Registry — central catalog of all domain repositories ----

export interface SNDTMRegistry {
  identity: IIdentityRepository;
  commerce: ICommerceRepository;
  knowledge: IKnowledgeRepository;
  telemetry: ITelemetryRepository;
  gameplay: IGameplayRepository;
  territorial: ITerritorialRepository;
}
