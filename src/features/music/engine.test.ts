import { describe, it, expect } from 'vitest';
import {
  recommendTracks,
  recommendCronicas,
  recommendEvents,
  musicActionToGameEvent,
  recommendSpatialMode,
  calculateSoundPersona,
} from './engine';
import type { MusicTrack, MusicCronica, MusicEvent } from './types';

const makeTrack = (overrides: Partial<MusicTrack> = {}): MusicTrack => ({
  id: 't1', album_id: null, artist_id: null, title: 'Test', slug: 'test',
  file_flac: null, file_wav: null, file_alac: null, file_mp3_320: null, file_mp3_128: null,
  duration_ms: 240000, track_number: 1, canonical_level: 'historical',
  curator_notes: null, curated_by: null, location_name: 'Real del Monte',
  location_lat: null, location_lng: null, spatial_profiles: {
    archivo: { reverb: 0.1 }, espacio: { reverb: 0.5 }, metaverso: { reverb: 0.8, effects: ['reverb'] },
  },
  era: 'minero', play_count: 500, lyrics: null, credits: {}, status: 'active',
  metadata: {}, created_at: '',
  ...overrides,
});

const makeCronica = (overrides: Partial<MusicCronica> = {}): MusicCronica => ({
  id: 'c1', creator_id: null, title: 'Crónica test', slug: 'cronica-test',
  description: null, cover_url: null, cronica_type: 'ruta', route_id: null,
  canonical_level: 'historical', play_count: 100, like_count: 10, fork_count: 3,
  total_duration_ms: 600000, status: 'active', metadata: {}, created_at: '',
  ...overrides,
});

const makeEvent = (overrides: Partial<MusicEvent> = {}): MusicEvent => ({
  id: 'e1', event_code: 'evt-1', title: 'Evento test', description: '', event_type: 'concert',
  starts_at: '2026-07-20T18:00:00Z', ends_at: '2026-07-20T22:00:00Z',
  max_participants: 100, current_participants: 0, location_name: null,
  is_virtual: false, stream_url: null, reward_json: {}, status: 'upcoming',
  metadata: {}, ...overrides,
});

describe('recommendTracks', () => {
  it('ranks historical over community', () => {
    const historical = makeTrack({ id: 't1', canonical_level: 'historical', play_count: 0 });
    const community = makeTrack({ id: 't2', canonical_level: 'community', play_count: 0, location_name: null });
    const result = recommendTracks([community, historical], {});
    expect(result[0].id).toBe('t1');
  });

  it('penalizes already listened tracks', () => {
    const track = makeTrack({ id: 't1', play_count: 0, location_name: null, spatial_profiles: { archivo: { reverb: 0.1 }, espacio: { reverb: 0.1 }, metaverso: { reverb: 0.1 } } });
    const result = recommendTracks([track], { listened_track_ids: ['t1'] });
    expect(result.length).toBe(1);
  });
});

describe('musicActionToGameEvent', () => {
  it('maps track_play to page_visit', () => {
    const result = musicActionToGameEvent('track_play', { track_id: 't1', artist_id: 'a1' });
    expect(result?.event_type).toBe('page_visit');
    expect(result?.payload.xp_reward).toBe(10);
  });

  it('maps donation with calculated XP', () => {
    const result = musicActionToGameEvent('donation', { amount_cents: 1000 });
    expect(result?.payload.xp_track).toBe('comunidad');
    expect(result?.payload.xp_reward).toBe(500);
  });
});

describe('recommendSpatialMode', () => {
  it('returns user preference when available', () => {
    const track = makeTrack();
    expect(recommendSpatialMode(track, 'archivo', 22)).toBe('archivo');
  });

  it('returns metaverso at night if available', () => {
    const track = makeTrack();
    expect(recommendSpatialMode(track, undefined, 22)).toBe('metaverso');
  });

  it('returns archivo during day', () => {
    const track = makeTrack();
    expect(recommendSpatialMode(track, undefined, 10)).toBe('archivo');
  });
});

describe('calculateSoundPersona', () => {
  it('returns listener level with no donations', () => {
    const result = calculateSoundPersona({ listenedTracks: [], donationHistory: [] });
    expect(result.mecenas_level).toBe('listener');
  });

  it('detects mecenas level', () => {
    const result = calculateSoundPersona({ listenedTracks: [], donationHistory: [{ amount_cents: 5000, mecenas_tier: 'mecenas' }] });
    expect(result.mecenas_level).toBe('active');
  });
});
