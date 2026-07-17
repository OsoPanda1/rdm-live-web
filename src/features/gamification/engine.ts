/**
 * Gamification LTOS Engine — Core Logic
 * Real del Monte Digital Hub
 *
 * Processes game events, evaluates quests, awards XP and badges.
 * Integrates with YUN event bus for observability.
 */

import type {
  GamificationPlayer,
  GamificationQuest,
  GamificationEvent,
  GamificationBadge,
  PostGameEventRequest,
  PostGameEventResponse,
  XpTrack,
  QuestCriteria,
} from './types';

// ============================================================================
// XP LEVEL TABLE
// ============================================================================

const XP_LEVEL_TABLE: number[] = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200,
  6500, 8000, 10000, 12500, 15500, 19000, 23000, 27500, 32500, 38000,
  44000, 50500, 57500, 65000, 73000, 81500, 90500, 100000, 110000, 121000,
];

/**
 * Calculates the level for a given XP amount.
 */
export function calculateLevel(totalXp: number): number {
  for (let i = XP_LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (totalXp >= XP_LEVEL_TABLE[i]) return i + 1;
  }
  return 1;
}

/**
 * Returns XP needed for the next level.
 */
export function xpForNextLevel(currentLevel: number): number {
  if (currentLevel >= XP_LEVEL_TABLE.length) return Infinity;
  return XP_LEVEL_TABLE[currentLevel];
}

/**
 * Returns XP progress within current level (0-1).
 */
export function levelProgress(totalXp: number): number {
  const level = calculateLevel(totalXp);
  const currentLevelXp = XP_LEVEL_TABLE[level - 1] ?? 0;
  const nextLevelXp = XP_LEVEL_TABLE[level] ?? currentLevelXp + 1000;
  return (totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp);
}

// ============================================================================
// XP CALCULATION
// ============================================================================

interface XpCalculation {
  xp: number;
  track: XpTrack;
  multiplier: number;
}

/**
 * Calculates XP for a game event based on type and payload.
 */
export function calculateEventXp(
  eventType: string,
  payload: Record<string, unknown>,
  seasonMultiplier: number = 1,
): XpCalculation {
  const baseXp = getBaseXp(eventType, payload);
  const multiplier = seasonMultiplier;

  return {
    xp: Math.round(baseXp * multiplier),
    track: inferTrack(eventType, payload),
    multiplier,
  };
}

function getBaseXp(eventType: string, payload: Record<string, unknown>): number {
  switch (eventType) {
    case 'combo': {
      const combo = (payload.combo_size as number) ?? 0;
      const pieceTypes = (payload.piece_types as string[]) ?? [];
      const culturalBonus = pieceTypes.some(t =>
        ['capillas', 'calles', 'personajes', 'minas', 'pastes'].includes(t),
      ) ? 1.5 : 1;
      return Math.round(combo * 5 * culturalBonus);
    }
    case 'score': {
      const score = (payload.score as number) ?? 0;
      return Math.round(score / 1000);
    }
    case 'quest_complete':
      return (payload.xp_reward as number) ?? 100;
    case 'page_visit':
      return 10;
    case 'community_action':
      return (payload.xp_reward as number) ?? 50;
    case 'level_up':
      return 25;
    case 'badge_earned':
      return (payload.xp_bonus as number) ?? 50;
    default:
      return 5;
  }
}

function inferTrack(eventType: string, payload: Record<string, unknown>): XpTrack {
  // Explicit track in payload
  if (payload.xp_track && ['cultura', 'comunidad', 'juego'].includes(payload.xp_track as string)) {
    return payload.xp_track as XpTrack;
  }

  // Infer from event type
  if (eventType === 'community_action') return 'comunidad';
  if (eventType === 'page_visit') return 'cultura';

  // Infer from piece types
  const pieceTypes = (payload.piece_types as string[]) ?? [];
  if (pieceTypes.some(t => ['capillas', 'calles', 'personajes', 'minas'].includes(t))) {
    return 'cultura';
  }

  return 'juego';
}

// ============================================================================
// QUEST EVALUATION
// ============================================================================

/**
 * Evaluates whether a quest criteria is met by an event.
 */
export function evaluateQuestCriteria(
  criteria: QuestCriteria,
  event: GamificationEvent,
  player: GamificationPlayer,
  questHistory: { event_type: string; payload_json: Record<string, unknown> }[],
): { met: boolean; progress: { current: number; target: number } } {
  switch (criteria.type) {
    case 'combo': {
      const minCombo = (criteria.min_combo as number) ?? 10;
      const pieceTypes = (criteria.piece_types as string[]) ?? [];
      const comboSize = (event.payload_json.combo_size as number) ?? 0;
      const eventPieces = (event.payload_json.piece_types as string[]) ?? [];
      const hasMatchingPieces = pieceTypes.length === 0 || pieceTypes.some(p => eventPieces.includes(p));
      const current = hasMatchingPieces ? comboSize : 0;
      return { met: current >= minCombo, progress: { current, target: minCombo } };
    }
    case 'score': {
      const minScore = (criteria.min_score as number) ?? 50000;
      const score = (event.payload_json.score as number) ?? 0;
      return { met: score >= minScore, progress: { current: score, target: minScore } };
    }
    case 'quest_complete': {
      const minQuests = (criteria['min quests'] as number) ?? 1;
      const completed = player.quests_completed;
      return { met: completed >= minQuests, progress: { current: completed, target: minQuests } };
    }
    case 'visit_pages': {
      const requiredPages = (criteria.pages as string[]) ?? [];
      const minVisits = (criteria.min_visits as number) ?? 1;
      const visitedPages = new Set(
        questHistory
          .filter(h => h.event_type === 'page_visit')
          .map(h => h.payload_json.page as string),
      );
      const matched = requiredPages.filter(p => visitedPages.has(p));
      return {
        met: matched.length >= minVisits,
        progress: { current: matched.length, target: requiredPages.length },
      };
    }
    case 'chain': {
      const steps = (criteria.steps as { game?: string; hub?: string; min: number }[]) ?? [];
      const completedSteps = steps.filter(step => {
        if (step.game) {
          return questHistory.some(h => h.event_type === step.game);
        }
        if (step.hub) {
          return questHistory.some(h => h.event_type === step.hub);
        }
        return false;
      });
      return {
        met: completedSteps.length >= steps.length,
        progress: { current: completedSteps.length, target: steps.length },
      };
    }
    case 'all_season_quests': {
      // This requires external context — mark as not met by default
      return { met: false, progress: { current: 0, target: 1 } };
    }
    case 'community_action': {
      const action = (criteria.action as string) ?? '';
      const minCount = (criteria.min_count as number) ?? 1;
      const actionCount = questHistory.filter(
        h => h.event_type === 'community_action' && h.payload_json.action === action,
      ).length;
      return {
        met: actionCount >= minCount,
        progress: { current: actionCount, target: minCount },
      };
    }
    default:
      return { met: false, progress: { current: 0, target: 1 } };
  }
}

// ============================================================================
// BADGE EVALUATION
// ============================================================================

/**
 * Checks if a player qualifies for a badge based on their stats.
 */
export function evaluateBadgeCriteria(
  badge: GamificationBadge,
  player: GamificationPlayer,
  playerBadges: string[],
): boolean {
  // Already has badge
  if (playerBadges.includes(badge.code)) return false;

  const criteria = badge.criteria_json;

  // Quest completion criteria
  if (criteria.quests_completed_min) {
    if (player.quests_completed < (criteria.quests_completed_min as number)) return false;
  }
  if (criteria.track && criteria.level_min) {
    const trackXp = criteria.track === 'cultura' ? player.xp_cultura
      : criteria.track === 'comunidad' ? player.xp_comunidad
      : player.xp_juego;
    if (trackXp < (criteria.level_min as number) * 1000) return false;
  }
  if (criteria.level_cultura_min) {
    if (player.xp_cultura < (criteria.level_cultura_min as number) * 1000) return false;
  }
  if (criteria.combos_pastes_min) {
    if (player.combos_total < (criteria.combos_pastes_min as number)) return false;
  }
  if (criteria.max_combo_min) {
    if (player.combos_total < (criteria.max_combo_min as number)) return false;
  }
  if (criteria.community_actions_min) {
    if (player.quests_completed < (criteria.community_actions_min as number)) return false;
  }
  if (criteria.all_tracks_max) {
    if (player.level < 30) return false;
  }
  if (criteria.cultural_quests_min) {
    if (player.xp_cultura < (criteria.cultural_quests_min as number) * 500) return false;
  }

  return true;
}

// ============================================================================
// ROLE CALCULATION
// ============================================================================

const ROLE_THRESHOLDS: { role: string; minXp: number }[] = [
  { role: 'aprendiz_minero', minXp: 0 },
  { role: 'minero_local', minXp: 1000 },
  { role: 'guardian_patrimonio', minXp: 5000 },
  { role: 'maestro_hub', minXp: 15000 },
  { role: 'arquitecto_territorial', minXp: 50000 },
];

/**
 * Calculates federated roles based on total XP.
 */
export function calculateRoles(totalXp: number): string[] {
  return ROLE_THRESHOLDS
    .filter(r => totalXp >= r.minXp)
    .map(r => r.role);
}

// ============================================================================
// EVENT PROCESSOR (Main entry point)
// ============================================================================

/**
 * Processes a game event and returns the result.
 * This is the core of the Gamification LTOS Engine.
 */
export function processGameEvent(
  request: PostGameEventRequest,
  player: GamificationPlayer,
  activeQuests: GamificationQuest[],
  playerQuests: { quest_code: string; status: string; progress_json: Record<string, unknown> }[],
  playerBadges: string[],
  seasonMultiplier: number = 1,
): PostGameEventResponse {
  const event: GamificationEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    player_id: player.id,
    event_type: request.event_type,
    source: request.source,
    payload_json: request.payload,
    xp_earned: 0,
    xp_track: null,
    territory_id: 'rdm',
    derived_events: [],
    created_at: new Date().toISOString(),
  };

  // 1. Calculate XP
  const xpCalc = calculateEventXp(request.event_type, request.payload, seasonMultiplier);
  event.xp_earned = xpCalc.xp;
  event.xp_track = xpCalc.track;

  // 2. Update player XP
  const newXp = player.total_xp + xpCalc.xp;
  const newLevel = calculateLevel(newXp);
  const levelUp = newLevel > player.level;

  // 3. Evaluate quests
  const questProgress: PostGameEventResponse['quest_progress'] = [];
  const completedQuests: string[] = [];

  for (const quest of activeQuests) {
    if (quest.status !== 'active') continue;
    if (quest.quest_type !== request.event_type && quest.quest_type !== 'narrative' && quest.quest_type !== 'territorial') continue;

    const pq = playerQuests.find(p => p.quest_code === quest.code);
    const result = evaluateQuestCriteria(
      quest.criteria_json,
      event,
      player,
      [{ event_type: request.event_type, payload_json: request.payload }],
    );

    if (result.met && (!pq || pq.status !== 'completed')) {
      completedQuests.push(quest.code);
      questProgress.push({
        quest_code: quest.code,
        progress: result.progress,
      });
    } else if (pq) {
      questProgress.push({
        quest_code: quest.code,
        progress: result.progress,
      });
    }
  }

  // 4. Check badge qualifications
  const badgesEarned: string[] = [];
  const allBadges = getAllBadges();
  for (const badge of allBadges) {
    if (evaluateBadgeCriteria(badge, { ...player, total_xp: newXp }, [...playerBadges, ...badgesEarned])) {
      badgesEarned.push(badge.code);
    }
  }

  return {
    success: true,
    event_id: event.id,
    xp_earned: xpCalc.xp,
    level_up: levelUp,
    new_level: newLevel,
    badges_earned: badgesEarned,
    quest_progress: questProgress,
  };
}

// ============================================================================
// MOCK DATA (for client-side preview)
// ============================================================================

function getAllBadges(): GamificationBadge[] {
  return [
    { id: '1', code: 'aprendiz_minero', name: 'Aprendiz Minero', description: '', icon_url: null, rarity: 'common', category: 'cultural', criteria_json: { quests_completed_min: 1, track: 'cultura' }, xp_bonus: 50, max_earners: 0, status: 'active', metadata: {}, created_at: '' },
    { id: '2', code: 'explorador_calles', name: 'Explorador de Calles', description: '', icon_url: null, rarity: 'common', category: 'territorial', criteria_json: { locations_visited_min: 5 }, xp_bonus: 100, max_earners: 0, status: 'active', metadata: {}, created_at: '' },
    { id: '3', code: 'guardian_panteon', name: 'Guardian del Panteon', description: '', icon_url: null, rarity: 'rare', category: 'cultural', criteria_json: { quest_code: 'panteon_ingles' }, xp_bonus: 200, max_earners: 0, status: 'active', metadata: {}, created_at: '' },
    { id: '4', code: 'maestro_pastes', name: 'Maestro de los Pastes', description: '', icon_url: null, rarity: 'rare', category: 'gameplay', criteria_json: { combos_pastes_min: 20 }, xp_bonus: 150, max_earners: 0, status: 'active', metadata: {}, created_at: '' },
    { id: '5', code: 'minero_legendario', name: 'Minero Legendario', description: '', icon_url: null, rarity: 'epic', category: 'cultural', criteria_json: { level_cultura_min: 10 }, xp_bonus: 500, max_earners: 0, status: 'active', metadata: {}, created_at: '' },
    { id: '6', code: 'corazon_comunidad', name: 'Corazon de la Comunidad', description: '', icon_url: null, rarity: 'rare', category: 'community', criteria_json: { community_actions_min: 3 }, xp_bonus: 300, max_earners: 0, status: 'active', metadata: {}, created_at: '' },
    { id: '7', code: 'arquitecto_territorial', name: 'Arquitecto Territorial', description: '', icon_url: null, rarity: 'legendary', category: 'territorial', criteria_json: { all_tracks_max: true }, xp_bonus: 1000, max_earners: 0, status: 'active', metadata: {}, created_at: '' },
    { id: '8', code: 'leyenda_viva', name: 'Leyenda Viva', description: '', icon_url: null, rarity: 'legendary', category: 'cultural', criteria_json: { all_season_quests: true }, xp_bonus: 2000, max_earners: 0, status: 'active', metadata: {}, created_at: '' },
    { id: '9', code: 'combo_master', name: 'Combo Master', description: '', icon_url: null, rarity: 'epic', category: 'gameplay', criteria_json: { max_combo_min: 15 }, xp_bonus: 250, max_earners: 0, status: 'active', metadata: {}, created_at: '' },
    { id: '10', code: 'culturalista', name: 'Culturalista', description: '', icon_url: null, rarity: 'epic', category: 'cultural', criteria_json: { cultural_quests_min: 10 }, xp_bonus: 400, max_earners: 0, status: 'active', metadata: {}, created_at: '' },
  ];
}
