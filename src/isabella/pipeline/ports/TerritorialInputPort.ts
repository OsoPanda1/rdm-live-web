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

    logger.info('[TerritorialInputPort] Contribucion territorial recibida', {
      type: input.contribution.type,
    });

    return {};
  }
}

export const territorialInputPort = new TerritorialInputPort();
