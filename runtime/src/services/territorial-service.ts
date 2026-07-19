// Territorial Service Facade — clean boundary between frontend and territorial kernel.
// Frontend code must NOT import TerritorialDataCollector, TerritorialGeofencer,
// IsabellaTerritorialMind, or any other core module directly.
// All territorial domain operations go through this facade.

import type { ITerritorialRepository, TerritorialPOI, UserContribution } from '../repository/types';

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface POIQuery {
  bounds?: GeoBounds;
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface ContributionInput {
  type: UserContribution['type'];
  location: Coordinate;
  payload: Record<string, unknown>;
}

export interface TerritorialSummary {
  totalPOIs: number;
  totalContributions: number;
  recentContributions: UserContribution[];
  activeZones: string[];
}

export class TerritorialService {
  constructor(private readonly repo: ITerritorialRepository) {}

  async queryPOIs(query: POIQuery): Promise<TerritorialPOI[]> {
    if (query.bounds) {
      return this.repo.findPOIsInBounds(query.bounds);
    }
    const all = await this.repo.pois.findAll();
    let filtered = all;
    if (query.category) filtered = filtered.filter(p => p.category === query.category);
    if (query.tags?.length) filtered = filtered.filter(p => query.tags!.some(t => p.tags.includes(t)));
    return filtered.slice(0, query.limit ?? 50);
  }

  async submitContribution(userId: string, input: ContributionInput): Promise<UserContribution> {
    const contribution: UserContribution = {
      id: crypto.randomUUID(),
      userId,
      type: input.type,
      location: input.location,
      payload: input.payload,
      verified: false,
      createdAt: new Date().toISOString(),
    };
    return this.repo.contributions.save(contribution);
  }

  async getSummary(userId?: string): Promise<TerritorialSummary> {
    const totalPOIs = await this.repo.pois.count();
    const allContribs = await this.repo.contributions.findAll();
    const recentContributions = allContribs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      totalPOIs,
      totalContributions: allContribs.length,
      recentContributions,
      activeZones: [],
    };
  }

  async getUserContributions(userId: string): Promise<UserContribution[]> {
    return this.repo.findContributionsByUser(userId);
  }

  // Haversine distance calculation moved from frontend to kernel boundary
  haversineDistance(a: Coordinate, b: Coordinate): number {
    const R = 6371e3;
    const φ1 = (a.lat * Math.PI) / 180;
    const φ2 = (b.lat * Math.PI) / 180;
    const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
    const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
    const A = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
  }
}
