import { logger } from '@/lib/logger';
import { federationBus } from '@/federaciones/FederationBus';
import { applyDecisionToHeptafederation, getFederationStats } from '@/lib/heptafederation';
import type { PipelineResult, OutputPort } from '../pipeline.types';

export class FederationOutputPort implements OutputPort {
  name = 'FederationOutputPort';

  async handle(result: PipelineResult): Promise<void> {
    const federationActions = result.federationActions;

    if (federationActions.length === 0) return;

    logger.info('[FederationOutputPort] Acciones federativas procesadas', {
      count: federationActions.length,
      actions: federationActions.map(a => ({ target: a.target, type: a.eventType })),
    });
  }
}

export const federationOutputPort = new FederationOutputPort();
