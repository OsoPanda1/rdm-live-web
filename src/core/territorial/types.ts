import type { Coordenadas, BoundingBox } from '@/core/models';

export type ContributionType = 'checkin' | 'review' | 'photo' | 'rating' | 'tip' | 'event_report' | 'route_trace' | 'poi_suggestion';

export type ZoneGeometryType = 'circle' | 'bbox' | 'polygon';

export interface TerritorialZone {
  id: string;
  name: string;
  type: ZoneGeometryType;
  centerLat?: number;
  centerLng?: number;
  radiusMeters: number;
  boundingBox?: BoundingBox;
  polygon?: { lat: number; lng: number }[];
  description: string;
  risk: 'low' | 'medium' | 'high';
}

export interface ZoneEvent {
  type: 'zone_enter' | 'zone_exit';
  userId: string;
  zoneId: string;
  zoneName: string;
  coords: Coordenadas;
  timestamp: Date;
}

export interface ZoneAlert {
  type: 'dwell_alert';
  userId: string;
  zoneId: string;
  zoneName: string;
  dwellMinutes: number;
  coords: Coordenadas;
  timestamp: Date;
}

export type ContributionStatus = 'pending' | 'verified' | 'flagged' | 'archived';

export type VerificationMethod = 'auto_geo' | 'photo_confirm' | 'peer_review' | 'isabella_validation';

export interface UserContribution {
  id: string;
  userId: string;
  type: ContributionType;
  status: ContributionStatus;
  coords: { lat: number; lng: number };
  territorio: string;
  poiId?: string;
  payload: ContributionPayload;
  verificationMethod?: VerificationMethod;
  verificationScore?: number;
  reputationWeight: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ContributionPayload =
  | CheckInPayload
  | ReviewPayload
  | PhotoPayload
  | RatingPayload
  | TipPayload
  | EventReportPayload
  | RouteTracePayload
  | POISuggestionPayload;

export interface CheckInPayload {
  type: 'checkin';
  poiName: string;
  durationMinutes?: number;
  mood?: string;
  companions?: number;
}

export interface ReviewPayload {
  type: 'review';
  text: string;
  rating: number;
  language: string;
  categories: string[];
}

export interface PhotoPayload {
  type: 'photo';
  caption?: string;
  tags: string[];
  imageHash?: string;
  imageUrl?: string;
}

export interface RatingPayload {
  type: 'rating';
  score: number;
  category: string;
  quickFeedback?: boolean;
}

export interface TipPayload {
  type: 'tip';
  text: string;
  category: 'proTip' | 'warning' | 'local_knowledge' | 'hidden_gem';
  helpful: number;
}

export interface EventReportPayload {
  type: 'event_report';
  eventName: string;
  description: string;
  date: string;
  crowdEstimate?: number;
  mediaUrls?: string[];
}

export interface RouteTracePayload {
  type: 'route_trace';
  waypoints: { lat: number; lng: number; timestamp: Date }[];
  distanceKm: number;
  durationMinutes: number;
  transportMode: 'walking' | 'driving' | 'biking' | 'bus';
}

export interface POISuggestionPayload {
  type: 'poi_suggestion';
  suggestedName: string;
  category: string;
  description: string;
  reasonForSuggestion: string;
}

export interface TerritorialHeatPoint {
  coords: { lat: number; lng: number };
  intensity: number;
  type: ContributionType;
  count: number;
  lastActivity: Date;
}

export interface TerritorialStats {
  totalContributions: number;
  uniqueContributors: number;
  activePOIs: number;
  checkinsToday: number;
  routeTraces: number;
  photoContributions: number;
  averageRating: number;
  territoryHealth: number;
  lastUpdated: Date;
}

export interface UserTerritorialProfile {
  userId: string;
  totalContributions: number;
  reputationScore: number;
  verifiedCount: number;
  favoriteZones: string[];
  badges: string[];
  contributionStreak: number;
  lastContribution: Date;
  trustLevel: 'newcomer' | 'regular' | 'trusted' | 'guardian';
}
