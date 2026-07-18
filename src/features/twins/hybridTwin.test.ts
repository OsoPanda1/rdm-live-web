import { describe, it, expect } from 'vitest';
import {
  synthesizeTwinSignals,
  buildTwinOverlaySummary,
  buildRecommendedActions,
} from './hybridTwin';
import type { MapMarkerData } from '@/features/places/mapTypes';

const markers: MapMarkerData[] = [
  { id: 'm1', name: 'Mina', category: 'mina', lat: 20.1, lng: -98.7, description: '', image: '', type: 'place', status: 'Activo' },
  { id: 'm2', name: 'Premium', category: 'hotel', lat: 20.2, lng: -98.8, description: '', image: '', type: 'business', isPremium: true, status: 'Activo' },
];

describe('synthesizeTwinSignals', () => {
  it('returns signals for each marker-source pair', () => {
    const signals = synthesizeTwinSignals(markers);
    expect(signals.length).toBe(12); // 2 markers × 6 sources
  });

  it('assigns deterministic health values', () => {
    const signals = synthesizeTwinSignals(markers.slice(0, 1));
    expect(signals[0].health).toMatch(/^(healthy|degraded|offline)$/);
  });
});

describe('buildTwinOverlaySummary', () => {
  it('groups signals by source', () => {
    const signals = synthesizeTwinSignals(markers);
    const summaries = buildTwinOverlaySummary(signals);
    expect(summaries.length).toBe(6); // 6 unique sources
    expect(summaries[0].throughputPerMinute).toBeGreaterThan(0);
  });

  it('calculates healthScore from incidents and latency', () => {
    const signals = synthesizeTwinSignals(markers);
    const summaries = buildTwinOverlaySummary(signals);
    for (const s of summaries) {
      expect(s.healthScore).toBeGreaterThanOrEqual(0);
      expect(s.healthScore).toBeLessThanOrEqual(100);
    }
  });
});

describe('buildRecommendedActions', () => {
  it('returns recommendations for degraded sources', () => {
    const signals = synthesizeTwinSignals(markers);
    const summaries = buildTwinOverlaySummary(signals);
    const actions = buildRecommendedActions(summaries);
    expect(Array.isArray(actions)).toBe(true);
  });

  it('limits to 4 actions', () => {
    const signals = synthesizeTwinSignals(markers);
    const summaries = buildTwinOverlaySummary(signals);
    const actions = buildRecommendedActions(summaries);
    expect(actions.length).toBeLessThanOrEqual(4);
  });
});
