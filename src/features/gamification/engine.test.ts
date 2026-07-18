import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  xpForNextLevel,
  levelProgress,
  calculateEventXp,
  evaluateQuestCriteria,
  evaluateBadgeCriteria,
  calculateRoles,
  processGameEvent,
} from './engine';
import type {
  GamificationPlayer,
  GamificationQuest,
  GamificationBadge,
  PostGameEventRequest,
  PostGameEventResponse,
} from './types';

describe('calculateLevel', () => {
  it('returns 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('returns 1 for 99 XP (below first threshold)', () => {
    expect(calculateLevel(99)).toBe(1);
  });

  it('returns 2 for 100 XP', () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it('returns 6 for 1500 XP', () => {
    expect(calculateLevel(1500)).toBe(6);
  });

  it('returns 30 for 121000 XP (max level)', () => {
    expect(calculateLevel(121000)).toBe(30);
  });
});

describe('xpForNextLevel', () => {
  it('returns XP for the next level', () => {
    expect(xpForNextLevel(1)).toBe(100);
    expect(xpForNextLevel(2)).toBe(300);
  });

  it('returns Infinity beyond max level', () => {
    expect(xpForNextLevel(30)).toBe(Infinity);
  });
});

describe('levelProgress', () => {
  it('returns 0 at start of level', () => {
    expect(levelProgress(0)).toBe(0);
  });

  it('returns 0.5 at 50 XP on level 1', () => {
    expect(levelProgress(50)).toBeCloseTo(0.5);
  });

  it('returns 0 at 100 XP (levelup boundary, resets progress)', () => {
    expect(levelProgress(100)).toBeCloseTo(0);
  });
});

describe('calculateRoles', () => {
  it('returns only aprendiz_minero for 0 XP', () => {
    expect(calculateRoles(0)).toEqual(['aprendiz_minero']);
  });

  it('returns multiple roles for high XP', () => {
    const roles = calculateRoles(50000);
    expect(roles).toContain('arquitecto_territorial');
    expect(roles).toContain('minero_local');
    expect(roles).toContain('aprendiz_minero');
  });
});

describe('calculateEventXp', () => {
  it('calculates XP for combo event', () => {
    const result = calculateEventXp('combo', { combo_size: 10, piece_types: ['capillas'] });
    expect(result.xp).toBe(75); // 10 * 5 * 1.5 (cultural bonus)
    expect(result.track).toBe('cultura');
  });

  it('calculates XP for score event', () => {
    const result = calculateEventXp('score', { score: 50000 });
    expect(result.xp).toBe(50);
  });

  it('applies season multiplier', () => {
    const result = calculateEventXp('page_visit', {}, 2);
    expect(result.xp).toBe(20);
  });
});

describe('processGameEvent', () => {
  const player: GamificationPlayer = {
    id: 'p1', user_id: 'u1', territory_id: 'rdm', display_name: 'Test', avatar_url: null,
    total_xp: 500, level: 1, current_season_id: null,
    xp_cultura: 100, xp_comunidad: 200, xp_juego: 200,
    roles: [], quests_completed: 0, combos_total: 0, streak_days: 0,
    last_active_at: null, metadata: {}, created_at: '', updated_at: '',
  };

  const request: PostGameEventRequest = {
    event_type: 'page_visit', source: 'hub', payload: {},
  };

  it('returns success with XP earned', () => {
    const result = processGameEvent(request, player, [], [], []);
    expect(result.success).toBe(true);
    expect(result.xp_earned).toBe(10);
  });

  it('triggers level_up when crossing threshold', () => {
    const highPlayer = { ...player, total_xp: 95, level: 1 };
    const result = processGameEvent({ ...request, event_type: 'score', payload: { score: 10000 } }, highPlayer, [], [], []);
    expect(result.level_up).toBe(true);
    expect(result.new_level).toBeGreaterThan(1);
  });
});
