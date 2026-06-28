import { registerJob, enqueue } from './index';
import { logger } from '@/lib/logger';

export function registerDefaultJobs(): void {
  registerJob('knowledge:absorb', async (payload) => {
    const { source } = payload as { source: string };
    logger.info('[Job] Absorbiendo conocimiento', { source });
    await new Promise(r => setTimeout(r, 500));
    logger.info('[Job] Conocimiento absorbido', { source });
  });

  registerJob('pipeline:process', async (payload) => {
    const { traceId } = payload as { traceId: string };
    logger.info('[Job] Procesando pipeline', { traceId });
    await new Promise(r => setTimeout(r, 200));
    logger.info('[Job] Pipeline completado', { traceId });
  });

  registerJob('federation:sync', async (payload) => {
    const { federationId } = payload as { federationId: string };
    logger.info('[Job] Sincronizando federación', { federationId });
    await new Promise(r => setTimeout(r, 1000));
    logger.info('[Job] Federación sincronizada', { federationId });
  });

  registerJob('territorial:heatmap-update', async (payload) => {
    const { zone } = payload as { zone: string };
    logger.info('[Job] Actualizando heatmap territorial', { zone });
    await new Promise(r => setTimeout(r, 300));
    logger.info('[Job] Heatmap actualizado', { zone });
  });

  registerJob('audit:flush', async () => {
    logger.info('[Job] Vaciando buffer de auditoría');
  });
}

export function schedulePeriodicJobs(): void {
  setInterval(() => enqueue('knowledge:absorb', { source: 'periodic-refresh' }, -1), 5 * 60 * 1000);
  setInterval(() => enqueue('audit:flush', {}, -1), 60 * 1000);
}
