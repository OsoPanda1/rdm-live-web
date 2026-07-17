import { logger } from '@/lib/logger';
import { territorialCollector } from '@/core/territorial/TerritorialDataCollector';
import { territorialGeofencer } from '@/core/territorial/TerritorialGeofencer';
import type { PipelineInput, PipelineResult, InputPort } from '../pipeline.types';

export class TerritorialInputPort implements InputPort {
  name = 'TerritorialInputPort';

  accept(input: PipelineInput): boolean {
    return input.type === 'territorial_contribution';
  }

  async process(input: PipelineInput): Promise<Partial<PipelineResult>> {
    if (input.type !== 'territorial_contribution') return {};

    const { contribution } = input;

    // Detect zone entry via geofencer
    const zoneEvent = territorialGeofencer.updatePosition(contribution.userId, contribution.coords);

    if (contribution.type === 'checkin') {
      const stats = territorialCollector.getStats();
      if (stats.totalContributions > 0) {
        logger.info('[TerritorialInputPort] Checkin en territorio vivo', {
          contribuciones: stats.totalContributions,
        });
      }
    }

    return {};
  }
}

export const territorialInputPort = new TerritorialInputPort();
