import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import { federationBus } from './FederationBus';
import type { FederationEvent } from './FederationBus';
import type { FederationId, MDX5Intent } from '@/core/models';
import type { UserContribution, TerritorialStats, TerritorialHeatPoint } from '@/core/territorial/types';

export interface TerritorialFederationMap {
  contributionType: string;
  primaryFed: FederationId;
  secondaryFeds: FederationId[];
  eventType: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

const TERRITORIAL_FEDERATION_MAP: TerritorialFederationMap[] = [
  { contributionType: 'checkin',       primaryFed: 'CHRONOS',  secondaryFeds: ['DEKATEOTL', 'MDD_TAMV'], eventType: 'TERRITORIAL_CHECKIN', priority: 'normal' },
  { contributionType: 'review',        primaryFed: 'ANUBIS',   secondaryFeds: ['DEKATEOTL'],             eventType: 'TERRITORIAL_REVIEW', priority: 'normal' },
  { contributionType: 'photo',         primaryFed: 'KAOS_HYPERRENDER', secondaryFeds: ['DEKATEOTL'],     eventType: 'TERRITORIAL_PHOTO', priority: 'low' },
  { contributionType: 'rating',        primaryFed: 'MDD_TAMV',  secondaryFeds: ['DEKATEOTL'],            eventType: 'TERRITORIAL_RATING', priority: 'normal' },
  { contributionType: 'tip',           primaryFed: 'ANUBIS',   secondaryFeds: ['DEKATEOTL', 'CHRONOS'],  eventType: 'TERRITORIAL_TIP', priority: 'low' },
  { contributionType: 'event_report',  primaryFed: 'PHOENIX',  secondaryFeds: ['DEKATEOTL', 'CHRONOS'],  eventType: 'TERRITORIAL_EVENT', priority: 'high' },
  { contributionType: 'route_trace',   primaryFed: 'CHRONOS',  secondaryFeds: ['DEKATEOTL', 'KAOS_HYPERRENDER'], eventType: 'TERRITORIAL_ROUTE', priority: 'normal' },
  { contributionType: 'poi_suggestion', primaryFed: 'DEKATEOTL', secondaryFeds: ['PHOENIX', 'CHRONOS'],   eventType: 'TERRITORIAL_POI_SUGGESTION', priority: 'high' },
];

export class TerritorialFederationBridge {
  private maps: TerritorialFederationMap[];
  private subscribed = false;

  constructor() {
    this.maps = TERRITORIAL_FEDERATION_MAP;
  }

  subscribeToFederationEvents(): void {
    if (this.subscribed) return;
    this.subscribed = true;

    federationBus.on('TERRITORIAL_EVENT', (event: FederationEvent) => {
      logger.info('[TFB] Evento territorial recibido del bus', {
        source: event.source,
        type: event.type,
        traceId: event.traceId,
      });
    });

    logger.info('[TFB] Bridge conectado al Federation Bus');
  }

  routeContribution(contribution: UserContribution): void {
    const map = this.maps.find(m => m.contributionType === contribution.type);
    if (!map) {
      logger.warn('[TFB] Sin mapeo federado para tipo', { type: contribution.type });
      return;
    }

    const traceId = uuidv4();

    // Route to primary federation
    federationBus.emit({
      type: map.eventType,
      source: map.primaryFed,
      payload: {
        contributionId: contribution.id,
        userId: contribution.userId,
        type: contribution.type,
        coords: contribution.coords,
        territorio: contribution.territorio,
        timestamp: contribution.createdAt,
        traceId,
      },
      traceId,
    });

    // Route to secondary federations
    for (const fed of map.secondaryFeds) {
      federationBus.emit({
        type: `${map.eventType}_SYNC`,
        source: fed,
        payload: {
          contributionId: contribution.id,
          type: contribution.type,
          coords: contribution.coords,
          sourceFed: map.primaryFed,
          traceId,
        },
        traceId,
      });
    }

    logger.info('[TFB] Contribucion enrutada', {
      type: contribution.type,
      primary: map.primaryFed,
      secondary: map.secondaryFeds,
      traceId,
    });
  }

  routeTerritorialStats(stats: TerritorialStats): void {
    const traceId = uuidv4();
    federationBus.emit({
      type: 'TERRITORIAL_STATS_UPDATE',
      source: 'DEKATEOTL',
      payload: { stats, traceId },
      traceId,
    });
  }

  routeHeatMapUpdate(points: TerritorialHeatPoint[]): void {
    const traceId = uuidv4();
    federationBus.emit({
      type: 'HEATMAP_UPDATE',
      source: 'KAOS_HYPERRENDER',
      payload: { points, traceId },
      traceId,
    });
  }

  getFederationsForTerritory(territorio: string): FederationId[] {
    if (territorio === 'RDM') {
      return ['DEKATEOTL', 'ANUBIS', 'CHRONOS', 'KAOS_HYPERRENDER', 'MDD_TAMV'];
    }
    return ['DEKATEOTL', 'CHRONOS'];
  }
}

export const territorialFederationBridge = new TerritorialFederationBridge();
