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

    logger.info('[FederationInputPort] Evento de federacion recibido', {
      source: input.event.source,
      type: input.event.type,
      traceId: input.event.traceId,
    });

    return {};
  }
}

export const federationInputPort = new FederationInputPort();
