import { v4 as uuidv4 } from 'uuid';
import type {
  UserContribution,
  ContributionType,
  ContributionPayload,
  ContributionStatus,
  TerritorialHeatPoint,
  TerritorialStats,
  UserTerritorialProfile,
  VerificationMethod,
} from './types';
import { logger } from '@/lib/logger';
import { createBBox, fastDistance, withinBBox } from '@/core/geo';
import type { Coordenadas } from '@/core/models';

interface CollectorConfig {
  minCheckinDistanceMeters: number;
  maxPendingAgeHours: number;
  reputationDecayDays: number;
  verificationThreshold: number;
  heatMapResolution: number;
}

type ContributionListener = (contribution: UserContribution) => void;

export class TerritorialDataCollector {
  private contributions: Map<string, UserContribution> = new Map();
  private userProfiles: Map<string, UserTerritorialProfile> = new Map();
  private heatPoints: TerritorialHeatPoint[] = [];
  private listeners: Set<ContributionListener> = new Set();
  private config: CollectorConfig;

  constructor(config: Partial<CollectorConfig> = {}) {
    this.config = {
      minCheckinDistanceMeters: 10,
      maxPendingAgeHours: 48,
      reputationDecayDays: 30,
      verificationThreshold: 0.7,
      heatMapResolution: 50,
      ...config,
    };
  }

  recordContribution(
    userId: string,
    type: ContributionType,
    coords: Coordenadas,
    territorio: string,
    payload: ContributionPayload,
    poiId?: string
  ): UserContribution {
    const id = uuidv4();
    const reputationWeight = this.calculateReputationWeight(userId);
    const verificationMethod = this.determineVerificationMethod(type, payload);

    const contribution: UserContribution = {
      id,
      userId,
      type,
      status: 'pending',
      coords: { lat: coords.lat, lng: coords.lng },
      territorio,
      poiId,
      payload,
      verificationMethod,
      verificationScore: 0,
      reputationWeight,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.contributions.set(id, contribution);
    this.updateUserProfile(userId, contribution);
    this.updateHeatMap(coords, type);
    this.notifyListeners(contribution);

    logger.info('[TerritorialCollector] Contribucion registrada:', {
      id, type, userId, territorio,
      verificationMethod,
    });

    return contribution;
  }

  verifyContribution(
    id: string,
    verified: boolean,
    validator: 'system' | 'isabella' | 'peer' = 'system'
  ): UserContribution | null {
    const contribution = this.contributions.get(id);
    if (!contribution) return null;

    const verificationScore = verified
      ? Math.min(1, contribution.verificationScore + 0.3)
      : Math.max(0, contribution.verificationScore - 0.5);

    const newStatus: ContributionStatus = verificationScore >= this.config.verificationThreshold
      ? 'verified'
      : verificationScore <= 0.2
        ? 'flagged'
        : contribution.status;

    const updated: UserContribution = {
      ...contribution,
      status: newStatus,
      verificationScore,
      verificationMethod: validator === 'isabella' ? 'isabella_validation' : contribution.verificationMethod,
      updatedAt: new Date(),
    };

    this.contributions.set(id, updated);

    if (newStatus === 'verified') {
      this.boostUserReputation(contribution.userId, 0.05);
    }

    return updated;
  }

  getContributionsByUser(userId: string): UserContribution[] {
    return Array.from(this.contributions.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getContributionsByTerritory(territorio: string): UserContribution[] {
    return Array.from(this.contributions.values())
      .filter(c => c.territorio === territorio)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getContributionsByPOI(poiId: string): UserContribution[] {
    return Array.from(this.contributions.values())
      .filter(c => c.poiId === poiId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getContributionsInRadius(center: Coordenadas, radiusMeters: number): UserContribution[] {
    const bbox = createBBox(center, radiusMeters);
    return Array.from(this.contributions.values())
      .filter(c => withinBBox(c.coords, bbox) && fastDistance(center, c.coords) <= radiusMeters)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getVerifiedContributionsInRadius(center: Coordenadas, radiusMeters: number): UserContribution[] {
    return this.getContributionsInRadius(center, radiusMeters)
      .filter(c => c.status === 'verified');
  }

  getHeatMap(): TerritorialHeatPoint[] {
    return this.heatPoints;
  }

  getStats(): TerritorialStats {
    const all = Array.from(this.contributions.values());
    const verified = all.filter(c => c.status === 'verified');
    const today = all.filter(c =>
      c.createdAt.toDateString() === new Date().toDateString()
    );

    return {
      totalContributions: all.length,
      uniqueContributors: new Set(all.map(c => c.userId)).size,
      activePOIs: new Set(all.filter(c => c.poiId).map(c => c.poiId)).size,
      checkinsToday: today.filter(c => c.type === 'checkin').length,
      routeTraces: all.filter(c => c.type === 'route_trace').length,
      photoContributions: all.filter(c => c.type === 'photo').length,
      averageRating: this.calculateAverageRating(all),
      territoryHealth: this.calculateTerritoryHealth(all, verified),
      lastUpdated: new Date(),
    };
  }

  getUserProfile(userId: string): UserTerritorialProfile | null {
    return this.userProfiles.get(userId) ?? null;
  }

  subscribe(listener: ContributionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private calculateReputationWeight(userId: string): number {
    const profile = this.userProfiles.get(userId);
    if (!profile) return 0.5;

    const daysSinceLast = (Date.now() - profile.lastContribution.getTime()) / 86400000;
    const decay = Math.max(0.3, 1 - (daysSinceLast / this.config.reputationDecayDays));

    return Math.min(1, (profile.reputationScore * 0.7 + profile.verifiedCount * 0.05) * decay);
  }

  private determineVerificationMethod(type: ContributionType, payload: ContributionPayload): VerificationMethod {
    if (type === 'photo') return 'photo_confirm';
    if (type === 'route_trace') return 'auto_geo';
    if (type === 'review' || type === 'rating') return 'peer_review';
    return 'auto_geo';
  }

  private updateUserProfile(userId: string, contribution: UserContribution): void {
    const existing = this.userProfiles.get(userId);
    const profile: UserTerritorialProfile = existing ?? {
      userId,
      totalContributions: 0,
      reputationScore: 0.5,
      verifiedCount: 0,
      favoriteZones: [],
      badges: [],
      contributionStreak: 0,
      lastContribution: new Date(0),
      trustLevel: 'newcomer',
    };

    profile.totalContributions++;
    profile.lastContribution = contribution.createdAt;

    if (existing) {
      const daysSinceLast = (contribution.createdAt.getTime() - existing.lastContribution.getTime()) / 86400000;
      profile.contributionStreak = daysSinceLast <= 1 ? existing.contributionStreak + 1 : 1;
    } else {
      profile.contributionStreak = 1;
    }

    const zone = `${contribution.coords.lat.toFixed(3)},${contribution.coords.lng.toFixed(3)}`;
    if (!profile.favoriteZones.includes(zone)) {
      profile.favoriteZones.push(zone);
      if (profile.favoriteZones.length > 10) profile.favoriteZones.shift();
    }

    profile.trustLevel = this.calculateTrustLevel(profile);
    profile.reputationScore = Math.min(1, profile.reputationScore + 0.02);

    this.userProfiles.set(userId, profile);
  }

  private calculateTrustLevel(profile: UserTerritorialProfile): UserTerritorialProfile['trustLevel'] {
    if (profile.verifiedCount >= 20 && profile.totalContributions >= 50) return 'guardian';
    if (profile.verifiedCount >= 10 && profile.totalContributions >= 20) return 'trusted';
    if (profile.totalContributions >= 5) return 'regular';
    return 'newcomer';
  }

  private updateHeatMap(coords: Coordenadas, type: ContributionType): void {
    const resolution = this.config.heatMapResolution / 111320;
    const latKey = Math.round(coords.lat / resolution) * resolution;
    const lngKey = Math.round(coords.lng / resolution) * resolution;

    const existing = this.heatPoints.find(
      h => Math.abs(h.coords.lat - latKey) < resolution / 2 &&
           Math.abs(h.coords.lng - lngKey) < resolution / 2
    );

    if (existing) {
      existing.intensity = Math.min(1, existing.intensity + 0.1);
      existing.count++;
      existing.lastActivity = new Date();
    } else {
      this.heatPoints.push({
        coords: { lat: latKey, lng: lngKey },
        intensity: 0.3,
        type,
        count: 1,
        lastActivity: new Date(),
      });
    }
  }

  private boostUserReputation(userId: string, boost: number): void {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.reputationScore = Math.min(1, profile.reputationScore + boost);
      profile.verifiedCount++;
      profile.trustLevel = this.calculateTrustLevel(profile);
    }
  }

  private calculateAverageRating(contributions: UserContribution[]): number {
    const ratings = contributions
      .filter(c => c.payload.type === 'rating')
      .map(c => (c.payload as unknown as Record<string, unknown>).score as number)
      .filter((s): s is number => typeof s === 'number');

    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }

  private calculateTerritoryHealth(all: UserContribution[], verified: UserContribution[]): number {
    if (all.length === 0) return 0.5;
    const verificationRate = verified.length / all.length;
    const recency = all.filter(c =>
      (Date.now() - c.createdAt.getTime()) < 86400000 * 7
    ).length / Math.max(all.length, 1);
    return Math.min(1, (verificationRate * 0.6 + recency * 0.4));
  }

  private notifyListeners(contribution: UserContribution): void {
    for (const listener of this.listeners) {
      try { listener(contribution); } catch (e) {
        logger.error('[TerritorialCollector] Error en listener:', e);
      }
    }
  }
}

export const territorialCollector = new TerritorialDataCollector();
