import { ChronusEngine, type PublishClient, type QueryableDb } from './engine/ChronusEngine';
import { MDX5Kernel } from './engine/MDX5Kernel';
import { timeUpEngine } from './engine/TimeUpEngine';
import { ledger } from './engine/Ledger';
import { federationBus } from "@/federaciones/FederationBus";
import { logger } from "@/lib/logger";

const databaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : undefined;
const redisUrl = typeof process !== "undefined" ? process.env.REDIS_URL : undefined;

const mockDb: QueryableDb = {
  async query() {
    return { rows: [{ activos: 0 }] };
  },
};

const mockPubSub: PublishClient = {
  async publish(channel: string, payload: string) {
    logger.info(`[KERNEL:MOCK] ${channel}`, { payload });
  },
};

if (databaseUrl && !redisUrl) {
  logger.warn('[KERNEL] DATABASE_URL y REDIS_URL no configurados. Se usará modo mock local.');
}

const chronus = new ChronusEngine({ db: mockDb, pubsub: mockPubSub });
export const mdx5 = new MDX5Kernel({ pollIntervalMs: 1000 }, chronus, federationBus);

let autopoiesisTimer: ReturnType<typeof setInterval> | null = null;
let started = false;

export function startKernel() {
  if (started) return;
  started = true;

  mdx5.start();

  autopoiesisTimer = setInterval(async () => {
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

  logger.info('[KERNEL] MD-X5 activo en modo soberano edge-first.');
  logger.info('[KERNEL] TIME UP engine cargado con', { politicas: 10 });
  logger.info('[KERNEL] Ledger listo para registrar acciones críticas');
}

export function stopKernel() {
  mdx5.stop();
  if (autopoiesisTimer) {
    clearInterval(autopoiesisTimer);
    autopoiesisTimer = null;
  }
  started = false;
}

if (typeof window !== "undefined") {
  startKernel();
}

export { chronus, timeUpEngine, ledger };

export function submitIntent(
  type: string,
  payload: unknown,
  source: string,
  priority: 'low' | 'normal' | 'high' | 'critical' = 'normal',
): string {
  return mdx5.submit({
    type,
    payload,
    source,
    priority,
    federation: undefined,
  });
}
