import { logger } from '@/lib/logger';
import { federationBus } from '@/federaciones/FederationBus';
import { applyDecisionToHeptafederation, getFederationStats } from '@/lib/heptafederation';
import type { PipelineResult, OutputPort } from '../pipeline.types';

export class FederationOutputPort implements OutputPort {
  name = 'FederationOutputPort';

  async handle(result: PipelineResult): Promise<void> {
    const federationActions = result.federationActions;

    if (federationActions.length === 0) return;

    // Update heptafederation health based on emotional valence
    const healthImpact = result.emotional.valence * 0.1;
    for (const action of federationActions) {
      const fed = federationBus.getFederation(action.target);
      if (fed) {
        const newHealth = Math.max(0, Math.min(1, fed.health + (result.emotional.valence > 0.5 ? healthImpact : -healthImpact)));
        federationBus.updateHealth(action.target, newHealth);
      }
    }

    // Log federation stats after processing
    const stats = getFederationStats();
    logger.info('[FederationOutputPort] Estado federacion post-pipeline', {
      saludGlobal: stats.globalHealth,
      modulosActivos: stats.activeModules,
    });
  }
}

export const federationOutputPort = new FederationOutputPort();
