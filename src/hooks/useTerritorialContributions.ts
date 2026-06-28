import { useState, useEffect, useCallback, useRef } from 'react';
import { territorialCollector } from '@/core/territorial/TerritorialDataCollector';
import { isabellaTerritorialMind } from '@/isabella/territorial';
import type { UserContribution, TerritorialHeatPoint, ContributionType, ContributionPayload } from '@/core/territorial/types';
import type { Coordenadas } from '@/core/models';

interface UseTerritorialContributionsOptions {
  autoRefreshInterval?: number;
  radiusMeters?: number;
}

export function useTerritorialContributions(
  centerCoords?: Coordenadas | null,
  options: UseTerritorialContributionsOptions = {}
) {
  const { autoRefreshInterval = 30000, radiusMeters = 500 } = options;

  const [contributions, setContributions] = useState<UserContribution[]>([]);
  const [heatMap, setHeatMap] = useState<TerritorialHeatPoint[]>([]);
  const [isContributing, setIsContributing] = useState(false);
  const [lastContribution, setLastContribution] = useState<UserContribution | null>(null);
  const [nearbyCount, setNearbyCount] = useState(0);

  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    if (centerCoords) {
      const nearby = territorialCollector.getContributionsInRadius(centerCoords, radiusMeters);
      setContributions(nearby);
      setNearbyCount(nearby.length);
    }
    setHeatMap(territorialCollector.getHeatMap());
  }, [centerCoords, radiusMeters]);

  useEffect(() => {
    refresh();
    if (autoRefreshInterval > 0) {
      refreshIntervalRef.current = setInterval(refresh, autoRefreshInterval);
    }
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [refresh, autoRefreshInterval]);

  const submitContribution = useCallback(async (
    userId: string,
    type: ContributionType,
    coords: Coordenadas,
    payload: ContributionPayload,
    poiId?: string
  ): Promise<UserContribution> => {
    setIsContributing(true);
    try {
      const contribution = territorialCollector.recordContribution(
        userId, type, coords, 'RDM', payload, poiId
      );
      const insights = await isabellaTerritorialMind.processUserContribution(contribution);
      setLastContribution(contribution);
      refresh();
      return contribution;
    } finally {
      setIsContributing(false);
    }
  }, [refresh]);

  const submitCheckIn = useCallback(async (
    userId: string,
    coords: Coordenadas,
    poiName: string,
    poiId?: string,
    durationMinutes?: number
  ): Promise<UserContribution> => {
    return submitContribution(userId, 'checkin', coords, {
      type: 'checkin',
      poiName,
      durationMinutes,
    }, poiId);
  }, [submitContribution]);

  const submitReview = useCallback(async (
    userId: string,
    coords: Coordenadas,
    text: string,
    rating: number,
    poiId?: string
  ): Promise<UserContribution> => {
    return submitContribution(userId, 'review', coords, {
      type: 'review',
      text,
      rating,
      language: 'es',
      categories: [],
    }, poiId);
  }, [submitContribution]);

  const submitRating = useCallback(async (
    userId: string,
    coords: Coordenadas,
    score: number,
    category: string,
    poiId?: string
  ): Promise<UserContribution> => {
    return submitContribution(userId, 'rating', coords, {
      type: 'rating',
      score,
      category,
    }, poiId);
  }, [submitContribution]);

  const submitRouteTrace = useCallback(async (
    userId: string,
    waypoints: { lat: number; lng: number; timestamp: Date }[],
    transportMode: 'walking' | 'driving' | 'biking' | 'bus' = 'walking'
  ): Promise<UserContribution> => {
    if (waypoints.length < 2) throw new Error('Se requieren al menos 2 waypoints');
    const last = waypoints[waypoints.length - 1];
    return submitContribution(userId, 'route_trace', { lat: last.lat, lng: last.lng }, {
      type: 'route_trace',
      waypoints,
      distanceKm: 0,
      durationMinutes: 0,
      transportMode,
    });
  }, [submitContribution]);

  const submitTip = useCallback(async (
    userId: string,
    coords: Coordenadas,
    text: string,
    category: 'proTip' | 'warning' | 'local_knowledge' | 'hidden_gem' = 'local_knowledge',
    poiId?: string
  ): Promise<UserContribution> => {
    return submitContribution(userId, 'tip', coords, {
      type: 'tip',
      text,
      category,
      helpful: 0,
    }, poiId);
  }, [submitContribution]);

  return {
    contributions,
    heatMap,
    nearbyCount,
    isContributing,
    lastContribution,
    refresh,
    submitContribution,
    submitCheckIn,
    submitReview,
    submitRating,
    submitRouteTrace,
    submitTip,
  };
}
