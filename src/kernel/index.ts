import { ChronusEngine, type PublishClient, type QueryableDb } from './engine/ChronusEngine';
import { logger } from "@/lib/logger";

const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

const mockDb: QueryableDb = {
  async query() {
    return { rows: [{ activos: 0 }] };
  },
};

const mockPubSub: PublishClient = {
  async publish(channel: string, payload: string) {
    logger.info(`[KERNEL:MOCK] ${channel}`, payload);
  },
};

if (!databaseUrl || !redisUrl) {
  logger.warn('[KERNEL] DATABASE_URL y REDIS_URL no configurados. Se usará modo mock local.');
}

const chronus = new ChronusEngine(mockDb, mockPubSub);

setInterval(async () => {
  try {
    await chronus.calcularSaturacionZonal('centro_historico', {
      clima: 'despejado',
      eventos_activos: [],
      turistas_concurrentes: 0,
    });
  } catch (error) {
    logger.error('[KERNEL] Error en ciclo de autopoiesis', error);
  }
}, 60_000);

logger.info('[KERNEL] Chronus-Real activo en modo soberano edge-first.');
