/**
 * RDM Ecos Música — Recommendation Engine
 * Suggests tracks, crónicas, and events based on:
 * - User location / territory
 * - Listening history
 * - Canonical level (historical > artistic > community)
 * - Gamification synergy (XP-eligible music actions)
 */

import type {
  MusicTrack,
  MusicCronica,
  MusicEvent,
  MusicArtist,
  SpatialMode,
  CanonicalLevel,
} from './types';

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

interface RecommendationContext {
  territory_id?: string;
  user_xp_cultura?: number;
  listened_track_ids?: string[];
  favorite_era?: string;
  spatial_preference?: SpatialMode;
}

/**
 * Recommends tracks based on territory and listening history.
 */
export function recommendTracks(
  allTracks: MusicTrack[],
  ctx: RecommendationContext,
  limit = 8,
): MusicTrack[] {
  let scored = allTracks.map((track) => {
    let score = 0;

    // Canonical level bonus
    if (track.canonical_level === 'historical') score += 30;
    else if (track.canonical_level === 'artistic') score += 20;
    else score += 10;

    // Territory match
    if (ctx.territory_id && track.location_name?.toLowerCase().includes('real del monte')) {
      score += 25;
    }

    // Era match
    if (ctx.favorite_era && track.era === ctx.favorite_era) {
      score += 15;
    }

    // Spatial profile richness (metaverso-ready tracks score higher)
    if (track.spatial_profiles?.metaverso?.effects?.length) {
      score += 10;
    }

    // Popularity (normalize play count)
    score += Math.min(track.play_count / 100, 15);

    // Penalize already listened
    if (ctx.listened_track_ids?.includes(track.id)) {
      score -= 20;
    }

    return { track, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.track);
}

/**
 * Recommends crónicas based on territory.
 */
export function recommendCronicas(
  allCronicas: MusicCronica[],
  ctx: RecommendationContext,
  limit = 4,
): MusicCronica[] {
  let scored = allCronicas.map((cronica) => {
    let score = 0;

    if (cronica.canonical_level === 'historical') score += 30;
    else if (cronica.canonical_level === 'artistic') score += 20;
    else score += 10;

    // Community engagement
    score += Math.min(cronica.play_count / 50, 20);
    score += cronica.fork_count * 5;

    return { cronica, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.cronica);
}

/**
 * Recommends events based on timing and user engagement.
 */
export function recommendEvents(
  allEvents: MusicEvent[],
  limit = 3,
): MusicEvent[] {
  const now = new Date();
  return allEvents
    .filter((e) => e.status === 'upcoming' || e.status === 'live')
    .sort((a, b) => {
      // Live events first
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      // Then by start time
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    })
    .slice(0, limit);
}

// ============================================================================
// GAMIFICATION SYNERGY
// ============================================================================

/**
 * Maps a music action to a gamification event.
 */
export function musicActionToGameEvent(
  action: 'track_play' | 'cronica_complete' | 'donation' | 'event_attend',
  payload: Record<string, unknown>,
): { event_type: string; payload: Record<string, unknown> } | null {
  switch (action) {
    case 'track_play':
      return {
        event_type: 'page_visit',
        payload: {
          page: '/musica',
          track_id: payload.track_id,
          artist_id: payload.artist_id,
          spatial_mode: payload.spatial_mode,
          xp_track: 'cultura',
          xp_reward: 10,
        },
      };
    case 'cronica_complete':
      return {
        event_type: 'community_action',
        payload: {
          action: 'cronica_listened',
          cronica_id: payload.cronica_id,
          tracks_completed: payload.tracks_completed,
          xp_track: 'cultura',
          xp_reward: 50,
        },
      };
    case 'donation':
      return {
        event_type: 'community_action',
        payload: {
          action: 'music_donation',
          amount_cents: payload.amount_cents,
          mecenas_tier: payload.mecenas_tier,
          xp_track: 'comunidad',
          xp_reward: Math.round((payload.amount_cents as number) / 10) * 5,
        },
      };
    case 'event_attend':
      return {
        event_type: 'community_action',
        payload: {
          action: 'music_event_attend',
          event_id: payload.event_id,
          event_type: payload.event_type,
          xp_track: 'cultura',
          xp_reward: 75,
        },
      };
    default:
      return null;
  }
}

// ============================================================================
// SPATIAL MODE RECOMMENDATION
// ============================================================================

/**
 * Recommends the best spatial mode based on context.
 */
export function recommendSpatialMode(
  track: MusicTrack,
  userPreference?: SpatialMode,
  timeOfDay?: number,
): SpatialMode {
  if (userPreference) return userPreference;

  const hour = timeOfDay ?? new Date().getHours();

  // Night = metaverso, evening = espacio, day = archivo
  if (hour >= 21 || hour < 6) {
    return track.spatial_profiles?.metaverso ? 'metaverso' : 'espacio';
  }
  if (hour >= 18 || hour < 21) {
    return 'espacio';
  }
  return 'archivo';
}

// ============================================================================
// SOUND PERSONA CALCULATION
// ============================================================================

interface SoundPersonaInput {
  listenedTracks: { track: MusicTrack; duration_ms: number }[];
  donationHistory: { amount_cents: number; mecenas_tier: string }[];
}

/**
 * Calculates the user's sound persona based on listening habits.
 */
export function calculateSoundPersona(input: SoundPersonaInput) {
  const eraCounts: Record<string, number> = {};
  const genreCounts: Record<string, number> = {};
  const locationCounts: Record<string, number> = {};
  let totalMs = 0;

  for (const { track, duration_ms } of input.listenedTracks) {
    totalMs += duration_ms;
    if (track.era) {
      eraCounts[track.era] = (eraCounts[track.era] || 0) + 1;
    }
    // Extract genre from album metadata or track metadata
    const genre = (track.metadata?.genre as string) || 'unknown';
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    if (track.location_name) {
      locationCounts[track.location_name] = (locationCounts[track.location_name] || 0) + 1;
    }
  }

  const totalDonated = input.donationHistory.reduce((s, d) => s + d.amount_cents, 0);
  const hasMecenas = input.donationHistory.some(
    (d) => d.mecenas_tier === 'mecenas' || d.mecenas_tier === 'productor',
  );

  return {
    primary_era: topKey(eraCounts),
    primary_genre: topKey(genreCounts),
    exploration_score: Math.min(Object.keys(genreCounts).length * 10, 100),
    top_locations: Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([loc]) => loc),
    total_listened_ms: totalMs,
    mecenas_level: hasMecenas ? 'active' : totalDonated > 0 ? 'supporter' : 'listener',
  };
}

function topKey(counts: Record<string, number>): string | undefined {
  let max = 0;
  let top: string | undefined;
  for (const [key, count] of Object.entries(counts)) {
    if (count > max) {
      max = count;
      top = key;
    }
  }
  return top;
}
