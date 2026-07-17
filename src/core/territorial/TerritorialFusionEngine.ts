import { logger } from '@/lib/logger';
import { territorialCollector } from './TerritorialDataCollector';
import { territorialFederationBridge } from '@/federaciones/territorial-federation-bridge';
import { consciousnessPipeline } from '@/isabella/pipeline/IsabellaConsciousnessPipeline';
import { federationInputPort, territorialInputPort, federationOutputPort } from '@/isabella/pipeline/ports';
import { isabellaTerritorialMind } from '@/isabella/territorial/IsabellaTerritorialMind';
import { territorialGeofencer, initializeRDMZones } from './TerritorialGeofencer';
import { federationBus } from '@/federaciones/FederationBus';
import { knowledgeEngine } from '@/isabella/knowledge/KnowledgeAbsorptionEngine';
import { awakeningProtocol } from '@/isabella/protocols/IsabellaAwakeningProtocol';
import type { UserContribution } from './types';
import type { Coordenadas, FederationId } from '@/core/models';

export interface FusionEngineState {
  active: boolean;
  collectorContributions: number;
  pipelineProcessed: number;
  geofencerZones: number;
  federationModules: number;
  knowledgeEntries: number;
  awakeningPhase: string;
  territorialHeat: number;
  avgPipelineLatencyMs: number;
  uptimeSeconds: number;
}

export class TerritorialFusionEngine {
  private active = false;
  private startTime: Date | null = null;

  start(): void {
    if (this.active) return;
    this.active = true;
    this.startTime = new Date();

    // Register pipeline ports
    consciousnessPipeline.registerInputPort(territorialInputPort);
    consciousnessPipeline.registerInputPort(federationInputPort);
    consciousnessPipeline.registerOutputPort(federationOutputPort);

    // Subscribe collector to pipeline and federation bridge
    territorialCollector.subscribe((contribution: UserContribution) => {
      territorialFederationBridge.routeContribution(contribution);
      consciousnessPipeline.processInput({
        type: 'territorial_contribution',
        contribution,
      });
    });

    // Subscribe to Federation Bus territorial events
    federationBus.on('TERRITORIAL_EVENT', (event) => {
      consciousnessPipeline.processInput({
        type: 'federation_event',
        event,
      });
    });

    // Subscribe geofencer zone events
    territorialGeofencer.subscribe((zoneEvent) => {
      consciousnessPipeline.processInput({
        type: 'zone_event',
        event: zoneEvent,
      });

      territorialFederationBridge.routeContribution({
        id: `zone-${zoneEvent.timestamp.getTime()}`,
        userId: zoneEvent.userId,
        type: 'checkin',
        status: 'verified',
        coords: { lat: zoneEvent.coords.lat, lng: zoneEvent.coords.lng },
        territorio: 'RDM',
        payload: {
          type: 'checkin',
          poiName: zoneEvent.zoneName,
          mood: 'exploring',
        },
        reputationWeight: 1,
        createdAt: zoneEvent.timestamp,
        updatedAt: zoneEvent.timestamp,
      });
    });

    // Start subsystems
    initializeRDMZones();
    territorialGeofencer.start();
    isabellaTerritorialMind.start(60000);
    territorialFederationBridge.subscribeToFederationEvents();
    knowledgeEngine.startAbsorptionCycle(300000);

    logger.info('[FusionEngine] TERRITORIAL FUSION ENGINE ACTIVADO');
    logger.info('[FusionEngine] Sistemas conectados', {
      systems: [
        'ConsciousnessPipeline',
        'TerritorialCollector',
        'FederationBus',
        'Geofencer',
        'IsabellaTerritorialMind',
        'KnowledgeAbsorption',
        'AwakeningProtocol',
      ],
    });
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    territorialGeofencer.stop();
    isabellaTerritorialMind.stop();
    knowledgeEngine.stop();
    logger.info('[FusionEngine] TERRITORIAL FUSION ENGINE DETENIDO');
  }

  async processQuery(text: string, userId: string, coords?: Coordenadas): Promise<unknown> {
    return consciousnessPipeline.processInput({
      type: 'user_query',
      query: text,
      userId,
      coords,
    });
  }

  async triggerFederationEvent(source: FederationId, type: string, payload: unknown): Promise<void> {
    federationBus.emit({ type, source, payload, traceId: crypto.randomUUID() });
  }

  getState(): FusionEngineState {
    const pipelineStats = consciousnessPipeline.getStats();
    const stats = territorialCollector.getStats();
    const awakeningState = awakeningProtocol.getState();

    return {
      active: this.active,
      collectorContributions: stats.totalContributions,
      pipelineProcessed: pipelineStats.totalProcessed,
      geofencerZones: territorialGeofencer.getAllZones().length,
      federationModules: federationBus.getAllFederations().length,
      knowledgeEntries: knowledgeEngine.getStats().totalEntries,
      awakeningPhase: awakeningState.currentPhase,
      territorialHeat: stats.territoryHealth,
      avgPipelineLatencyMs: Math.round(pipelineStats.avgLatencyMs),
      uptimeSeconds: this.startTime ? Math.round((Date.now() - this.startTime.getTime()) / 1000) : 0,
    };
  }
}

export const fusionEngine = new TerritorialFusionEngine();
