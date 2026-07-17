/**
 * @file index.ts
 * @description Main entry point for TAMV MD-X4 knowledge cells server
 */

import { createApp } from '@/server/express-app';
import { Logger } from '@utils/logger';

const logger = Logger.getInstance();
const PORT = parseInt(process.env.PORT || '3000');

async function main() {
  try {
    logger.info('=== TAMV MD-X4 Knowledge Cells Starting ===');

    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      });

      logger.info('Available endpoints:');
      logger.info('  GET  /health');
      logger.info('  GET  /api/cells');
      logger.info('  GET  /api/cells/:cellId');
      logger.info('  GET  /api/cells/type/:type');
      logger.info('  POST /api/render/3d/holocube');
      logger.info('  POST /api/render/4d/hypercube');
      logger.info('  GET  /api/repo/metadata');
      logger.info('  GET  /api/repo/export');
    });

    process.on('SIGINT', () => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error('Fatal error', {}, err instanceof Error ? err : new Error(String(err)));
    process.exit(1);
  }
}

main();
