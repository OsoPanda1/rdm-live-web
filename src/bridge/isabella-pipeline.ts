import { consciousnessPipeline } from '@/isabella/pipeline/IsabellaConsciousnessPipeline';
import { orchestrator } from '@/core/orchestrator/ExperienceOrchestrator';
import { safeBus as eventBus } from '@/core/infra/event-bus';
import { logger } from '@/lib/logger';
import type { PipelineInput } from '@/isabella/pipeline/pipeline.types';
import type { IsabellaDecision } from '@/core/models';

let connected = false;

export function connectIsabellaPipeline(): void {
  if (connected) return;
  connected = true;

  consciousnessPipeline.registerInputPort({
    name: 'orchestrator-bridge',
    accept: (input: PipelineInput) => input.type === 'federation_event',
    process: async (input: PipelineInput) => {
      logger.info('[BRIDGE:PIPELINE] Procesando evento federado', { type: input.type });
      return {};
    },
  });

  consciousnessPipeline.registerOutputPort({
    name: 'core-orchestrator',
    handle: async (result) => {
      const { federationActions, territorialActions, guardian, traceId } = result;

      if (federationActions.length > 0) {
        eventBus.emit('rdm:federation:actions', {
          actions: federationActions,
          traceId,
        });
      }

      if (territorialActions.length > 0) {
        for (const action of territorialActions) {
          if (action.type === 'heat_update') {
            const { adjustment, reason } = action.payload as { adjustment: number; reason: string };
            orchestrator.updateZoneSaturation('RDM', Math.max(0, Math.min(1, adjustment)));
            logger.info('[BRIDGE:PIPELINE] Saturacion actualizada', { adjustment, reason });
          }
        }
      }

      if (guardian.action !== 'enable_cache_boost') {
        eventBus.emit('rdm:guardian:action', {
          action: guardian.action,
          severity: guardian.severity,
          traceId,
        });
      }
    },
  });

  consciousnessPipeline.registerOutputPort({
    name: 'heptafederation',
    handle: async (result) => {
      const { federationActions, traceId } = result;
      if (federationActions.length > 0) {
        const { applyDecisionToHeptafederation } = await import('@/lib/heptafederation');
        const decision: IsabellaDecision = {
          traceId,
          territory: 'RDM',
          level: 'MODERADO',
          retentionIntent: 'ENGAGEMENT',
          score: { total: 0.6, scores: { proximity: 0.5, movement: 0.5, inactivity: 0.5, visitDuration: 0.5, nearbyPOIs: 0.5, zoneSaturation: 0.5 }, details: {} },
          pattern: 'EXPLORING',
          distanceToExit: 200,
          speedMps: 0.5,
          coords: { lat: 20.138, lng: -98.671 },
          timestamp: new Date(),
          payload: { titulo: 'Pipeline', mensaje: 'Decision generada por pipeline de conciencia', ruta_ar_activada: false },
        };
        applyDecisionToHeptafederation(decision);
      }
    },
  });

  logger.info('[BRIDGE:PIPELINE] Pipeline de conciencia conectado al core');
}
