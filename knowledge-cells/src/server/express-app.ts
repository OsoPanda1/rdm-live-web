/**
 * @file express-app.ts
 * @description Express server for TAMV MD-X4 knowledge cell orchestration
 */

import express, { Express, Request, Response } from 'express';
import { knowledgeRepository } from '@/repository/knowledge-repo';
import { Logger } from '@utils/logger';
import { handleRender3D } from '@cells/render-3d-holocube/cell';
import { handleRender4D } from '@cells/render-4d-hypercube/cell';
import { CellRequest } from '@types/knowledge-cell';

const logger = Logger.getInstance();

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.static('public'));

  app.use((req: Request, res: Response, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  app.get('/api/cells', (req: Request, res: Response) => {
    try {
      const cells = knowledgeRepository.getAllCells();
      res.json({
        success: true,
        data: cells.map((cell) => ({
          id: cell.id,
          type: cell.type,
          description: cell.description,
          version: cell.version,
          endpoint: cell.apiEndpoint,
        })),
        count: cells.length,
      });
    } catch (err) {
      logger.error('Error fetching cells', {}, err instanceof Error ? err : new Error(String(err)));
      res.status(500).json({ success: false, error: 'Failed to fetch cells' });
    }
  });

  app.get('/api/cells/:cellId', (req: Request, res: Response) => {
    try {
      const cell = knowledgeRepository.getCell(req.params.cellId);
      if (!cell) {
        return res.status(404).json({ success: false, error: 'Cell not found' });
      }
      res.json({ success: true, data: cell });
    } catch (err) {
      logger.error('Error fetching cell', { cellId: req.params.cellId }, err instanceof Error ? err : new Error(String(err)));
      res.status(500).json({ success: false, error: 'Failed to fetch cell' });
    }
  });

  app.get('/api/cells/:cellId/dependencies', (req: Request, res: Response) => {
    try {
      const graph = knowledgeRepository.getDependencyGraph(req.params.cellId);
      res.json({
        success: true,
        cellId: req.params.cellId,
        dependencies: Array.from(graph.keys()),
        count: graph.size,
      });
    } catch (err) {
      logger.error('Error fetching dependencies', { cellId: req.params.cellId }, err instanceof Error ? err : new Error(String(err)));
      res.status(500).json({ success: false, error: 'Failed to fetch dependencies' });
    }
  });

  app.get('/api/cells/type/:type', (req: Request, res: Response) => {
    try {
      const cells = knowledgeRepository.getCellsByType(req.params.type);
      res.json({
        success: true,
        type: req.params.type,
        cells: cells.map((c) => ({ id: c.id, description: c.description })),
        count: cells.length,
      });
    } catch (err) {
      logger.error('Error fetching cells by type', { type: req.params.type }, err instanceof Error ? err : new Error(String(err)));
      res.status(500).json({ success: false, error: 'Failed to fetch cells' });
    }
  });

  app.post('/api/render/3d/holocube', async (req: Request, res: Response) => {
    try {
      const cellRequest: CellRequest = {
        cellId: 'render-3d-holocube-v1',
        operation: req.body.operation || 'render',
        payload: req.body.payload || {},
        context: req.body.context,
      };

      const response = await handleRender3D(cellRequest);
      res.json(response);
    } catch (err) {
      logger.error('Error in Render3D', {}, err instanceof Error ? err : new Error(String(err)));
      res.status(500).json({
        success: false,
        error: {
          code: 'RENDER_3D_ERROR',
          message: 'Failed to process render request',
        },
      });
    }
  });

  app.post('/api/render/4d/hypercube', async (req: Request, res: Response) => {
    try {
      const cellRequest: CellRequest = {
        cellId: 'render-4d-hypercube-v1',
        operation: req.body.operation || 'create-hypercube',
        payload: req.body.payload || {},
        context: req.body.context,
      };

      const response = await handleRender4D(cellRequest);
      res.json(response);
    } catch (err) {
      logger.error('Error in Render4D', {}, err instanceof Error ? err : new Error(String(err)));
      res.status(500).json({
        success: false,
        error: {
          code: 'RENDER_4D_ERROR',
          message: 'Failed to process render request',
        },
      });
    }
  });

  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      cells: knowledgeRepository.getAllCells().length,
    });
  });

  app.get('/api/repo/metadata', (req: Request, res: Response) => {
    try {
      const metadata = knowledgeRepository.exportMetadata();
      res.json({ success: true, data: metadata });
    } catch (err) {
      logger.error('Error fetching metadata', {}, err instanceof Error ? err : new Error(String(err)));
      res.status(500).json({ success: false, error: 'Failed to fetch metadata' });
    }
  });

  app.get('/api/repo/export', (req: Request, res: Response) => {
    try {
      const json = knowledgeRepository.exportAsJSON();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(`Content-Disposition`, `attachment; filename="tamv-repo-${Date.now()}.json"`);
      res.send(json);
    } catch (err) {
      logger.error('Error exporting repository', {}, err instanceof Error ? err : new Error(String(err)));
      res.status(500).json({ success: false, error: 'Failed to export repository' });
    }
  });

  app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });

  app.use((err: Error, req: Request, res: Response) => {
    logger.error('Unhandled error', { path: req.path }, err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  });

  return app;
}
