import { logger } from '@/lib/logger';
import { federationBus } from '@/federaciones/FederationBus';
import type { PipelineInput, PipelineResult, InputPort } from '../pipeline.types';

export class FederationInputPort implements InputPort {
  name = 'FederationInputPort';

  accept(input: PipelineInput): boolean {
    return input.type === 'federation_event';
  }

  async process(input: PipelineInput): Promise<Partial<PipelineResult>> {
    if (input.type !== 'federation_event') return {};

    const { event } = input;

    logger.info('[FederationInputPort] Evento de federacion recibido', {
      source: event.source,
      type: event.type,
      traceId: event.traceId,
    });

    // Check Federation Bus health for routed events
    if (event.type === 'FEDERATION_INTENT') {
      const federation = federationBus.getFederation(event.source);
      if (federation && federation.health < 0.5) {
        logger.warn('[FederationInputPort] Federacion con baja salud', {
          federation: federation.name,
          health: federation.health,
        });
      }
    }

    return {};
  }
}

export const federationInputPort = new FederationInputPort();
