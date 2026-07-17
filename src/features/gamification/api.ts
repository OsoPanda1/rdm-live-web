/**
 * Gamification LTOS Engine — API Client
 * Real del Monte Digital Hub
 *
 * Client-side API for interacting with the gamification backend.
 * Can be swapped with real Supabase calls when backend is ready.
 */

import type {
  PostGameEventRequest,
  PostGameEventResponse,
  GetPlayerProfileResponse,
  GetLeaderboardResponse,
  GamificationPlayer,
  GamificationQuest,
  GamificationBadge,
  GamificationReward,
  GamificationPlayerQuest,
  GamificationPlayerBadge,
  GamificationPlayerReward,
  GamificationSeason,
  LeaderboardEntry,
  XpTrack,
} from './types';
import { calculateLevel, processGameEvent, calculateRoles } from './engine';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

// ============================================================================
// MOCK DATA (for development without backend)
// ============================================================================

const MOCK_PLAYER: GamificationPlayer = {
  id: 'player-001',
  user_id: 'user-001',
  territory_id: 'rdm',
  display_name: 'Minero Digital',
  avatar_url: null,
  total_xp: 3450,
  level: 7,
  current_season_id: 'season-001',
  xp_cultura: 1800,
  xp_comunidad: 950,
  xp_juego: 700,
  roles: ['aprendiz_minero', 'minero_local'],
  quests_completed: 12,
  combos_total: 47,
  streak_days: 5,
  last_active_at: new Date().toISOString(),
  metadata: {},
  created_at: '2025-07-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

const MOCK_QUESTS: (GamificationQuest & { progress?: { current: number; target: number }; status?: string })[] = [
  {
    id: 'q1', code: 'primera_mision', season_id: 'season-001', name: 'Primeros Pasos',
    description: 'Completar tu primera mision en el juego RDM Match', quest_type: 'puzzle', track: 'juego',
    criteria_json: { type: 'quest_complete', 'min quests': 1 }, reward_json: { xp: 100, badge_code: 'aprendiz_minero' },
    difficulty: 'easy', prerequisite_quest_codes: [], starts_at: null, expires_at: null,
    repeatable: false, max_repeats: 1, cooldown_hours: 0, status: 'completed',
    metadata: {}, created_at: '', updated_at: '',
    progress: { current: 1, target: 1 },
  },
  {
    id: 'q2', code: 'explorador_rdm', season_id: 'season-001', name: 'Explorador de RDM',
    description: 'Visita 3 paginas del Hub', quest_type: 'narrative', track: 'cultura',
    criteria_json: { type: 'visit_pages', pages: ['/historia', '/mapa', '/gastronomia'], min_visits: 1 },
    reward_json: { xp: 200, badge_code: 'explorador_calles' }, difficulty: 'easy',
    prerequisite_quest_codes: [], starts_at: null, expires_at: null,
    repeatable: false, max_repeats: 1, cooldown_hours: 0, status: 'in_progress',
    metadata: {}, created_at: '', updated_at: '',
    progress: { current: 2, target: 3 },
  },
  {
    id: 'q3', code: 'ruta_minera', season_id: 'season-001', name: 'Ruta de las Minas',
    description: 'Juega 5 partidas con piezas de minas', quest_type: 'narrative', track: 'cultura',
    criteria_json: { type: 'chain', steps: [{ game: 'minas_played', min: 5 }] },
    reward_json: { xp: 350, badge_code: 'guardian_panteon' }, difficulty: 'medium',
    prerequisite_quest_codes: [], starts_at: null, expires_at: null,
    repeatable: false, max_repeats: 1, cooldown_hours: 0, status: 'in_progress',
    metadata: {}, created_at: '', updated_at: '',
    progress: { current: 3, target: 5 },
  },
  {
    id: 'q4', code: 'combo_cultural', season_id: 'season-001', name: 'Combo Cultural',
    description: 'Logra un combo de 10 usando piezas culturales', quest_type: 'puzzle', track: 'cultura',
    criteria_json: { type: 'combo', piece_types: ['capillas', 'calles', 'personajes'], min_combo: 10 },
    reward_json: { xp: 250 }, difficulty: 'medium',
    prerequisite_quest_codes: [], starts_at: null, expires_at: null,
    repeatable: false, max_repeats: 1, cooldown_hours: 0, status: 'in_progress',
    metadata: {}, created_at: '', updated_at: '',
    progress: { current: 7, target: 10 },
  },
  {
    id: 'q5', code: 'apoyo_comercio', season_id: 'season-001', name: 'Apoyo Local',
    description: 'Visita el directorio y apoya 2 negocios', quest_type: 'community', track: 'comunidad',
    criteria_json: { type: 'community_action', action: 'support_business', min_count: 2 },
    reward_json: { xp: 300, badge_code: 'corazon_comunidad' }, difficulty: 'medium',
    prerequisite_quest_codes: [], starts_at: null, expires_at: null,
    repeatable: false, max_repeats: 1, cooldown_hours: 0, status: 'in_progress',
    metadata: {}, created_at: '', updated_at: '',
    progress: { current: 1, target: 2 },
  },
];

const MOCK_BADGES: (GamificationBadge & { earned?: boolean })[] = [
  { id: 'b1', code: 'aprendiz_minero', name: 'Aprendiz Minero', description: 'Completaste tu primera mision', icon_url: null, rarity: 'common', category: 'cultural', criteria_json: {}, xp_bonus: 50, max_earners: 0, status: 'active', metadata: {}, created_at: '', earned: true },
  { id: 'b2', code: 'explorador_calles', name: 'Explorador de Calles', description: 'Visitaste 5 locations', icon_url: null, rarity: 'common', category: 'territorial', criteria_json: {}, xp_bonus: 100, max_earners: 0, status: 'active', metadata: {}, created_at: '', earned: true },
  { id: 'b3', code: 'guardian_panteon', name: 'Guardian del Panteon', description: 'Mision Panteon Ingles', icon_url: null, rarity: 'rare', category: 'cultural', criteria_json: {}, xp_bonus: 200, max_earners: 0, status: 'active', metadata: {}, created_at: '', earned: false },
  { id: 'b4', code: 'maestro_pastes', name: 'Maestro de los Pastes', description: '20 combos de pastes', icon_url: null, rarity: 'rare', category: 'gameplay', criteria_json: {}, xp_bonus: 150, max_earners: 0, status: 'active', metadata: {}, created_at: '', earned: false },
  { id: 'b5', code: 'minero_legendario', name: 'Minero Legendario', description: 'Nivel 10 Cultura', icon_url: null, rarity: 'epic', category: 'cultural', criteria_json: {}, xp_bonus: 500, max_earners: 0, status: 'active', metadata: {}, created_at: '', earned: false },
  { id: 'b6', code: 'corazon_comunidad', name: 'Corazon de la Comunidad', description: '3 acciones comunitarias', icon_url: null, rarity: 'rare', category: 'community', criteria_json: {}, xp_bonus: 300, max_earners: 0, status: 'active', metadata: {}, created_at: '', earned: false },
  { id: 'b7', code: 'combo_master', name: 'Combo Master', description: 'Combo de 15+', icon_url: null, rarity: 'epic', category: 'gameplay', criteria_json: {}, xp_bonus: 250, max_earners: 0, status: 'active', metadata: {}, created_at: '', earned: false },
  { id: 'b8', code: 'culturalista', name: 'Culturalista', description: '10 misiones culturales', icon_url: null, rarity: 'epic', category: 'cultural', criteria_json: {}, xp_bonus: 400, max_earners: 0, status: 'active', metadata: {}, created_at: '', earned: false },
];

const MOCK_SEASON: GamificationSeason = {
  id: 'season-001', code: 'S1-2025', name: 'Temporada Inaugural: Raices de Plata',
  description: 'La primera temporada del metajuego territorial de RDM Digital',
  theme: 'minas_inglesas', start_date: '2025-07-01', end_date: '2025-09-30',
  global_goal: { type: 'community_xp', target: 500000, current: 127500, description: 'XP colectivo para desbloquear evento especial' },
  status: 'active', metadata: {}, created_at: '', updated_at: '',
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, player_id: 'p1', user_id: 'u1', display_name: 'PlataMaster', avatar_url: null, total_xp: 12450, level: 12, xp_cultura: 6200, xp_comunidad: 3100, xp_juego: 3150, roles: ['guardian_patrimonio'] },
  { rank: 2, player_id: 'p2', user_id: 'u2', display_name: 'MineroCornish', avatar_url: null, total_xp: 9800, level: 10, xp_cultura: 4500, xp_comunidad: 2800, xp_juego: 2500, roles: ['guardian_patrimonio'] },
  { rank: 3, player_id: 'p3', user_id: 'u3', display_name: 'PasteQueen', avatar_url: null, total_xp: 8200, level: 9, xp_cultura: 3000, xp_comunidad: 4200, xp_juego: 1000, roles: ['minero_local'] },
  { rank: 4, player_id: 'p4', user_id: 'u4', display_name: 'SierraExplorer', avatar_url: null, total_xp: 6500, level: 8, xp_cultura: 2800, xp_comunidad: 1200, xp_juego: 2500, roles: ['minero_local'] },
  { rank: 5, player_id: 'p5', user_id: 'u5', display_name: 'RDMTraveler', avatar_url: null, total_xp: 5100, level: 7, xp_cultura: 2100, xp_comunidad: 1500, xp_juego: 1500, roles: ['minero_local'] },
  { rank: 6, player_id: 'player-001', user_id: 'user-001', display_name: 'Minero Digital', avatar_url: null, total_xp: 3450, level: 7, xp_cultura: 1800, xp_comunidad: 950, xp_juego: 700, roles: ['minero_local'] },
];

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Posts a game event to the gamification engine.
 */
export async function postGameEvent(
  request: PostGameEventRequest,
): Promise<PostGameEventResponse> {
  try {
    const res = await fetch(`${API_BASE}/gamification/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Fallback to client-side processing
    return processGameEventLocal(request);
  }
}

function processGameEventLocal(request: PostGameEventRequest): PostGameEventResponse {
  const result = processGameEvent(
    request,
    MOCK_PLAYER,
    MOCK_QUESTS,
    MOCK_QUESTS.map(q => ({ quest_code: q.code, status: q.status ?? 'in_progress', progress_json: q.progress ?? { current: 0, target: 1 } })),
    MOCK_BADGES.filter(b => b.earned).map(b => b.code),
  );

  // Update mock player
  MOCK_PLAYER.total_xp += result.xp_earned;
  MOCK_PLAYER.level = result.new_level;
  MOCK_PLAYER.xp_juego += request.event_type === 'combo' || request.event_type === 'score' ? result.xp_earned : 0;
  MOCK_PLAYER.xp_cultura += request.event_type === 'page_visit' ? result.xp_earned : 0;
  MOCK_PLAYER.xp_comunidad += request.event_type === 'community_action' ? result.xp_earned : 0;
  MOCK_PLAYER.roles = calculateRoles(MOCK_PLAYER.total_xp);
  MOCK_PLAYER.quests_completed += result.quest_progress.filter(q => q.progress.current >= q.progress.target).length;

  return result;
}

/**
 * Gets the player's full profile.
 */
export async function getPlayerProfile(): Promise<GetPlayerProfileResponse> {
  try {
    const res = await fetch(`${API_BASE}/gamification/profile`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      player: MOCK_PLAYER,
      active_quests: MOCK_QUESTS.map(q => ({
        id: `pq-${q.id}`,
        player_id: MOCK_PLAYER.id,
        quest_id: q.id,
        status: (q.status ?? 'in_progress') as 'in_progress' | 'completed',
        progress_json: q.progress ?? { current: 0, target: 1 },
        completed_at: q.status === 'completed' ? new Date().toISOString() : null,
        repeat_count: 0,
        metadata: {},
        created_at: '',
        updated_at: '',
        quest: q,
      })),
      badges: MOCK_BADGES.map(b => ({
        id: `pb-${b.id}`,
        player_id: MOCK_PLAYER.id,
        badge_id: b.id,
        earned_at: b.earned ? new Date().toISOString() : '',
        quest_id: null,
        metadata: {},
        badge: b,
      })),
      rewards: [],
      season: MOCK_SEASON,
    };
  }
}

/**
 * Gets the leaderboard.
 */
export async function getLeaderboard(
  track?: XpTrack,
): Promise<GetLeaderboardResponse> {
  try {
    const params = track ? `?track=${track}` : '';
    const res = await fetch(`${API_BASE}/gamification/leaderboard${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    let entries = [...MOCK_LEADERBOARD];
    if (track) {
      entries.sort((a, b) => {
        const aXp = track === 'cultura' ? a.xp_cultura : track === 'comunidad' ? a.xp_comunidad : a.xp_juego;
        const bXp = track === 'cultura' ? b.xp_cultura : track === 'comunidad' ? b.xp_comunidad : b.xp_juego;
        return bXp - aXp;
      });
      entries = entries.map((e, i) => ({ ...e, rank: i + 1 }));
    }

    const playerRank = entries.findIndex(e => e.player_id === 'player-001') + 1;

    return {
      entries,
      total_players: entries.length,
      season: MOCK_SEASON,
      player_rank: playerRank || null,
    };
  }
}
