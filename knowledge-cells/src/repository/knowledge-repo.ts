/**
 * @file knowledge-repo.ts
 * @description Central repository for knowledge cells with dependency resolution
 */

import { KnowledgeRepo, KnowledgeCell, KnowledgeRelation } from '@types/knowledge-cell';
import { Logger } from '@utils/logger';
import { render3DHoloCube } from '@cells/render-3d-holocube/cell';
import { render4DHypercube } from '@cells/render-4d-hypercube/cell';

const logger = Logger.getInstance();

export class KnowledgeRepository {
  private repo: KnowledgeRepo;
  private cellCache: Map<string, KnowledgeCell> = new Map();

  constructor() {
    this.repo = this.initializeRepository();
    this.populateCells();
    this.validateDependencies();
  }

  private initializeRepository(): KnowledgeRepo {
    return {
      id: 'tamv-md-x4-v1',
      version: '1.0.0',
      cells: {},
      relations: [],
      aiExpertiseProfile:
        'Hyper-specialized in 3D/4D visual rendering, quantum multisensory integration, dynamic AI logic, and cinematographic effect composition. Optimize for perceptual coherence and immersive feedback.',
      orchestratorUrl: process.env.ORCHESTRATOR_URL || 'http://localhost:3000',
      metricsPort: parseInt(process.env.METRICS_PORT || '9090'),
      logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
      created: new Date(),
      updated: new Date(),
    };
  }

  private populateCells(): void {
    const cells = [render3DHoloCube, render4DHypercube];

    for (const cell of cells) {
      this.repo.cells[cell.id] = cell;
      this.cellCache.set(cell.id, cell);
    }

    logger.info('Knowledge repository initialized', {
      cellCount: Object.keys(this.repo.cells).length,
    });
  }

  private validateDependencies(): void {
    for (const [cellId, cell] of Object.entries(this.repo.cells)) {
      if (cell.dependencies) {
        for (const depId of cell.dependencies) {
          if (!this.repo.cells[depId]) {
            logger.warn(`Missing dependency: ${depId} required by ${cellId}`);
          }
        }
      }
    }
  }

  getCell(cellId: string): KnowledgeCell | undefined {
    return this.cellCache.get(cellId) || this.repo.cells[cellId];
  }

  getAllCells(): KnowledgeCell[] {
    return Object.values(this.repo.cells);
  }

  getCellsByType(type: string): KnowledgeCell[] {
    return Object.values(this.repo.cells).filter((cell) => cell.type === type);
  }

  addCell(cell: KnowledgeCell): void {
    this.repo.cells[cell.id] = cell;
    this.cellCache.set(cell.id, cell);
    this.repo.updated = new Date();
    logger.info(`Cell added: ${cell.id}`);
  }

  addRelation(relation: KnowledgeRelation): void {
    this.repo.relations.push(relation);
    this.repo.updated = new Date();
    logger.info(`Relation added: ${relation.from} -> ${relation.to} (${relation.relation})`);
  }

  getDependencyGraph(cellId: string): Map<string, KnowledgeCell> {
    const graph = new Map<string, KnowledgeCell>();
    const cell = this.getCell(cellId);

    if (!cell) {
      return graph;
    }

    const visited = new Set<string>();
    const queue = [cellId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;

      visited.add(current);
      const currentCell = this.getCell(current);

      if (currentCell) {
        graph.set(current, currentCell);

        if (currentCell.dependencies) {
          for (const dep of currentCell.dependencies) {
            if (!visited.has(dep)) {
              queue.push(dep);
            }
          }
        }
      }
    }

    return graph;
  }

  getRepository(): KnowledgeRepo {
    return this.repo;
  }

  exportAsJSON(): string {
    return JSON.stringify(this.repo, null, 2);
  }

  exportMetadata(): Record<string, unknown> {
    return {
      id: this.repo.id,
      version: this.repo.version,
      cellCount: Object.keys(this.repo.cells).length,
      relationCount: this.repo.relations.length,
      cellTypes: [...new Set(Object.values(this.repo.cells).map((c) => c.type))],
      created: this.repo.created,
      updated: this.repo.updated,
    };
  }
}

export const knowledgeRepository = new KnowledgeRepository();
