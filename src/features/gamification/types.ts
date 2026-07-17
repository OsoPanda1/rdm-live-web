/**
 * Gamification LTOS Engine — Core Types
 * Real del Monte Digital Hub
 *
 * Federated gamification system integrated with LTOS.
 * Every game action becomes a territory life event.
 */

// ============================================================================
// ENTITIES
// ============================================================================

export type XpTrack = 'cultura' | 'comunidad' | 'juego';
export type QuestType = 'puzzle' | 'narrative' | 'territorial' | 'community';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';
export type QuestStatus = 'active' | 'paused' | 'completed' | 'archived';
export type PlayerQuestStatus = 'in_progress' | 'completed' | 'failed' | 'expired';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'cultural' | 'community' | 'gameplay' | 'territorial';
export type RewardType = 'voucher' | 'discount' | 'access' | 'physical' | 'xp_boost';
export type RewardStatus = 'active' | 'paused' | 'expired' | 'redeemed';
export type PlayerRewardStatus = 'claimed' | 'redeemed' | 'expired' | 'cancelled';
export type SeasonStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type GameEventType =
  | 'combo'
  | 'quest_complete'
  | 'level_up'
  | 'badge_earned'
  | 'voucher_redeemed'
  | 'score'
  | 'page_visit'
  | 'community_action';

// ============================================================================
// PLAYER
// ============================================================================

export interface GamificationPlayer {
  id: string;
  user_id: string;
  territory_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  current_season_id: string | null;
  xp_cultura: number;
  xp_comunidad: number;
  xp_juego: number;
  roles: string[];
  quests_completed: number;
  combos_total: number;
  streak_days: number;
  last_active_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// QUEST
// ============================================================================

export interface GamificationQuest {
  id: string;
  code: string;
  season_id: string | null;
  name: string;
  description: string;
  quest_type: QuestType;
  track: XpTrack;
  criteria_json: QuestCriteria;
  reward_json: QuestReward;
  difficulty: QuestDifficulty;
  prerequisite_quest_codes: string[];
  starts_at: string | null;
  expires_at: string | null;
  repeatable: boolean;
  max_repeats: number;
  cooldown_hours: number;
  status: QuestStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface QuestCriteria {
  type: string;
  [key: string]: unknown;
}

export interface QuestReward {
  xp?: number;
  badge_code?: string;
  voucher?: string;
  xp_boost?: { multiplier: number; duration_hours: number };
}

// ============================================================================
// PLAYER QUEST
// ============================================================================

export interface GamificationPlayerQuest {
  id: string;
  player_id: string;
  quest_id: string;
  status: PlayerQuestStatus;
  progress_json: { current: number; target: number };
  completed_at: string | null;
  repeat_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// GAME EVENT
// ============================================================================

export interface GamificationEvent {
  id: string;
  player_id: string | null;
  event_type: GameEventType;
  source: 'construct3' | 'hub' | 'api' | 'webhook';
  payload_json: Record<string, unknown>;
  xp_earned: number;
  xp_track: XpTrack | null;
  territory_id: string;
  derived_events: string[];
  created_at: string;
}

// ============================================================================
// BADGE
// ============================================================================

export interface GamificationBadge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon_url: string | null;
  rarity: BadgeRarity;
  category: BadgeCategory;
  criteria_json: Record<string, unknown>;
  xp_bonus: number;
  max_earners: number;
  status: 'active' | 'hidden' | 'retired';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GamificationPlayerBadge {
  id: string;
  player_id: string;
  badge_id: string;
  earned_at: string;
  quest_id: string | null;
  metadata: Record<string, unknown>;
}

// ============================================================================
// REWARD
// ============================================================================

export interface GamificationReward {
  id: string;
  code: string;
  name: string;
  description: string;
  reward_type: RewardType;
  value: Record<string, unknown>;
  business_id: string | null;
  max_claims: number;
  claimed_count: number;
  starts_at: string | null;
  expires_at: string | null;
  status: RewardStatus;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GamificationPlayerReward {
  id: string;
  player_id: string;
  reward_id: string;
  voucher_code: string;
  status: PlayerRewardStatus;
  claimed_at: string;
  redeemed_at: string | null;
  redeemed_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================================================
// SEASON
// ============================================================================

export interface GamificationSeason {
  id: string;
  code: string;
  name: string;
  description: string | null;
  theme: string;
  start_date: string;
  end_date: string;
  global_goal: {
    type: string;
    target: number;
    current: number;
    description?: string;
  };
  status: SeasonStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TERRITORIAL EVENT
// ============================================================================

export interface GamificationTerritorialEvent {
  id: string;
  event_code: string;
  name: string;
  description: string;
  event_type: 'festival' | 'cultural' | 'seasonal' | 'community';
  season_id: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  event_date: string | null;
  game_impact: {
    xp_multiplier?: number;
    special_quests?: string[];
    bonus_rewards?: string[];
  };
  status: 'upcoming' | 'active' | 'completed';
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================================================
// LEADERBOARD
// ============================================================================

export interface LeaderboardEntry {
  rank: number;
  player_id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  xp_cultura: number;
  xp_comunidad: number;
  xp_juego: number;
  roles: string[];
}

// ============================================================================
// API REQUESTS/RESPONSES
// ============================================================================

export interface PostGameEventRequest {
  event_type: GameEventType;
  source: 'construct3' | 'hub' | 'api';
  payload: Record<string, unknown>;
}

export interface PostGameEventResponse {
  success: boolean;
  event_id: string;
  xp_earned: number;
  level_up: boolean;
  new_level: number;
  badges_earned: string[];
  quest_progress: { quest_code: string; progress: { current: number; target: number } }[];
}

export interface GetPlayerProfileResponse {
  player: GamificationPlayer;
  active_quests: (GamificationPlayerQuest & { quest: GamificationQuest })[];
  badges: (GamificationPlayerBadge & { badge: GamificationBadge })[];
  rewards: (GamificationPlayerReward & { reward: GamificationReward })[];
  season: GamificationSeason | null;
}

export interface GetLeaderboardResponse {
  entries: LeaderboardEntry[];
  total_players: number;
  season: GamificationSeason | null;
  player_rank: number | null;
}
