import type { AuthUser } from "../types/auth.js";

// ─── Data Source Interface ───────────────────────────────────────────────────

export type EntityType =
  | "user" | "profile" | "business" | "donation" | "interaction"
  | "digitalTwin" | "twinEvent"
  | "socialPost" | "socialComment" | "socialChannel" | "directMessage"
  | "streamRoom" | "videoCallRoom"
  | "ledger" | "membership" | "tokenBalance"
  | "protocolRun" | "msrEvent" | "bookpiNarrative" | "guardianAlert"
  | "dreamspace"
  | "yunBeEvent" | "yunBeJournal" | "yunBeRecoveryReport"
  | "gamificationPlayer" | "gamificationMission" | "gamificationQuestLog"
  | "gamificationReward" | "gamificationGuardian" | "emotionState"
  | "dgAuditLog" | "dgCacheEntry";

export interface QueryFilter {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains" | "startsWith";
  value: unknown;
}

export interface QueryOptions {
  filters?: QueryFilter[];
  sort?: { field: string; direction: "asc" | "desc" };
  limit?: number;
  offset?: number;
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface DataSource {
  readonly name: string;
  findById<T>(entityType: EntityType, id: string): Promise<T | null>;
  query<T>(entityType: EntityType, options?: QueryOptions): Promise<QueryResult<T>>;
  create<T>(entityType: EntityType, data: Partial<T>): Promise<T>;
  update<T>(entityType: EntityType, id: string, data: Partial<T>): Promise<T | null>;
  delete(entityType: EntityType, id: string): Promise<boolean>;
}

// ─── Gateway Request Context ─────────────────────────────────────────────────

export type SensitivityLevel = "low" | "medium" | "high" | "critical";

export interface GatewayContext {
  requestId: string;
  userId?: string;
  serviceId?: string;
  role?: AuthUser["role"];
  sourceIp?: string;
  federationId?: string;
}

// ─── Gateway Config ─────────────────────────────────────────────────────────

export interface GatewayConfig {
  auditEnabled: boolean;
  journalEnabled: boolean;
  cacheEnabled: boolean;
  defaultCacheTtl: number;
  sensitivityDefaults: Record<string, SensitivityLevel>;
}

// ─── Journal Types ─────────────────────────────────────────────────────────

export type JournalStatus = "PENDING" | "COMPLETED" | "FAILED" | "RECONCILED";
export type JournalOperationType =
  | "payment" | "card_issue" | "reward_claim" | "mission_complete"
  | "profile_update" | "data_export" | "reputation_adjust"
  | "benefit_grant" | "recovery_replay";

export interface JournalEntry {
  id: string;
  operationType: JournalOperationType;
  entityType: string;
  entityId?: string;
  payload: Record<string, unknown>;
  status: JournalStatus;
  idempotencyKey: string;
  supabaseUserId?: string;
  stripeId?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Gamification Types ─────────────────────────────────────────────────────

export type QuestStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
export type RewardType = "BADGE" | "SKIN" | "XR_ACCESS" | "CATTLEYA_BENEFIT";
export type MissionContext = "turismo" | "comercio" | "emociones" | "xr";

export interface GamificationPlayerData {
  id: number;
  supabaseUserId: string;
  displayName: string;
  level: number;
  xp: number;
  virtuePoints: number;
  reputationScore: number;
  avatarId?: number;
  avatar?: GamificationGuardianData;
}

export interface GamificationGuardianData {
  id: number;
  code: string;
  name: string;
  description: string;
  archetype: string;
  primaryVirtue: string;
}

export interface GamificationMissionData {
  id: number;
  code: string;
  title: string;
  description: string;
  context: MissionContext;
  xpReward: number;
  virtueReward: number;
  maxCompletions: number;
  isActive: boolean;
}

export interface GamificationQuestLogData {
  id: number;
  playerId: number;
  missionId: number;
  mission?: GamificationMissionData;
  status: QuestStatus;
  progress: number;
  completions: number;
}

export interface GamificationRewardData {
  id: number;
  playerId: number;
  rewardCode: string;
  type: RewardType;
  metadata: Record<string, unknown>;
  claimedAt: string;
}

export interface EmotionStateData {
  id: number;
  playerId: number;
  label: string;
  primaryEmotion: string;
  intensity: number;
  source: string;
  createdAt: string;
}

export interface GuardianAssignmentResult {
  previousCode?: string;
  currentCode: string;
  guardian: GamificationGuardianData;
  reason: string;
}

export interface MissionCompletionResult {
  player: GamificationPlayerData;
  mission: GamificationMissionData;
  xpGained: number;
  virtueGained: number;
  rewards: GamificationRewardData[];
  newLevel: number;
}
