import type { SkillContext, CanonicalEntry, Evidence, KnowledgeGraph, Artifact, Relation } from './types';

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

interface MnemosRecordInput {
  event: Record<string, unknown>;
  category: 'patrimonio' | 'politica_publica' | 'innovacion' | 'memoria_comunitaria';
  evidence: Array<{ type: string; content: string }>;
  retentionPolicy: 'permanente' | 'largo_plazo' | 'rotativa';
}

class MnemosEngine {
  private entries: Map<string, CanonicalEntry> = new Map();
  private callCount = 0;
  private totalDurationMs = 0;

  async record(input: MnemosRecordInput, ctx: SkillContext): Promise<{ recordId: string; canonicalEntry: CanonicalEntry; traceGraph: { relatedRecords: string[] } }> {
    const start = performance.now();
    this.callCount++;

    const recordId = `mem-${Date.now()}-${simpleHash(JSON.stringify(input.event)).slice(0, 8)}`;

    const evidence: Evidence[] = input.evidence.map((e, i) => ({
      evidenceId: `ev-${recordId}-${i}`,
      type: e.type as Evidence['type'],
      content: e.content,
      hash: simpleHash(e.content),
      verifiedAt: ctx.timestamp,
    }));

    const entry: CanonicalEntry = {
      recordId,
      title: (input.event as { title?: string })?.title ?? `Registro ${input.category} - ${ctx.timestamp.toISOString().slice(0, 10)}`,
      category: input.category,
      event: input.event,
      evidence,
      timestamp: ctx.timestamp,
      authorId: ctx.userId,
      retentionPolicy: input.retentionPolicy,
      immutable: input.retentionPolicy === 'permanente',
    };

    this.entries.set(recordId, entry);

    const relatedRecords: string[] = [];
    for (const [existingId, existing] of this.entries) {
      if (existingId !== recordId && existing.category === input.category) {
        relatedRecords.push(existingId);
      }
    }

    const duration = performance.now() - start;
    this.totalDurationMs += duration;

    return { recordId, canonicalEntry: entry, traceGraph: { relatedRecords } };
  }

  async getRecord(recordId: string): Promise<CanonicalEntry | null> {
    return this.entries.get(recordId) ?? null;
  }

  async getKnowledgeGraph(ctx: SkillContext): Promise<KnowledgeGraph> {
    const nodes: Artifact[] = [];
    const edges: Relation[] = [];

    for (const [id, entry] of this.entries) {
      nodes.push({
        artifactId: id,
        title: entry.title,
        summary: `Registro categoría: ${entry.category}, evidencias: ${entry.evidence.length}`,
        source: 'mnemos',
        confidenceScore: 0.95,
        timestamp: entry.timestamp,
        tags: [entry.category, entry.retentionPolicy],
        metadata: { evidenceCount: entry.evidence.length, immutable: entry.immutable },
      });
    }

    const entriesByCategory = new Map<string, string[]>();
    for (const [id, entry] of this.entries) {
      const cat = entriesByCategory.get(entry.category) ?? [];
      cat.push(id);
      entriesByCategory.set(entry.category, cat);
    }
    for (const [, ids] of entriesByCategory) {
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          edges.push({
            sourceId: ids[i],
            targetId: ids[j],
            type: 'misma_categoria',
            strength: 0.7,
            direction: 'bidirectional',
          });
        }
      }
    }

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        density: nodes.length > 0 ? Math.round((edges.length / (nodes.length * (nodes.length - 1) / 2)) * 1000) / 1000 : 0,
      },
    };
  }

  getStats() {
    return {
      totalEntries: this.entries.size,
      totalCalls: this.callCount,
      avgResponseMs: this.callCount > 0 ? Math.round(this.totalDurationMs / this.callCount) : 0,
      categories: Array.from(new Set(Array.from(this.entries.values()).map(e => e.category))),
    };
  }
}

export const mnemos = new MnemosEngine();
