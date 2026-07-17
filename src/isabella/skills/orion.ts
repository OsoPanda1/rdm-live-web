import type { SkillContext, Artifact, Relation, Gap, KnowledgeGraph } from './types';

const SIMILARITY_THRESHOLD = 0.35;

interface OrionSearchInput {
  contextId: string;
  query: string;
  scopes: string[];
  filters?: {
    dateRange?: { start: string; end: string };
    type?: string[];
    tags?: string[];
  };
}

const KNOWLEDGE_SOURCES: Artifact[] = [
  {
    artifactId: 'genesis-001',
    title: 'CODEX MEXA ISABELLA',
    summary: 'Documento fundacional del ecosistema TAMV. Contiene origen, pilares, reglas, folios y protocolos de seguridad.',
    source: 'src/lib/codex.ts',
    confidenceScore: 0.98,
    timestamp: new Date('2026-01-15'),
    tags: ['fundacional', 'codice', 'identidad', 'pilares'],
    metadata: { type: 'canon', folios: 7, rules: 7 },
  },
  {
    artifactId: 'genesis-002',
    title: 'Heptafederación TAMV',
    summary: 'Sistema de 7 federaciones: DEKATEOTL, ANUBIS, BOOKPI, PHOENIX, MDD_TAMV, KAOS_HYPERRENDER, CHRONOS.',
    source: 'src/lib/heptafederation.ts',
    confidenceScore: 0.95,
    timestamp: new Date('2026-02-01'),
    tags: ['federacion', 'arquitectura', '7-nodos'],
    metadata: { type: 'canon', modules: 7 },
  },
  {
    artifactId: 'genesis-003',
    title: 'Pipeline Hexagonal de Conciencia',
    summary: '10 capas de conciencia, procesamiento emocional, memoria, conocimiento, despertar y guardián.',
    source: 'src/isabella/pipeline/IsabellaConsciousnessPipeline.ts',
    confidenceScore: 0.94,
    timestamp: new Date('2026-03-10'),
    tags: ['pipeline', 'conciencia', 'hexagonal'],
    metadata: { type: 'canon', capas: 10, etapas: 8 },
  },
  {
    artifactId: 'territorial-001',
    title: 'Territorial Fusion Engine',
    summary: 'Orquestador central del gemelo digital de Real del Monte. Conecta 7 subsistemas territoriales.',
    source: 'src/core/territorial/TerritorialFusionEngine.ts',
    confidenceScore: 0.92,
    timestamp: new Date('2026-03-15'),
    tags: ['territorial', 'fusion', 'gemelo-digital'],
    metadata: { type: 'research', subsystems: 7 },
  },
  {
    artifactId: 'territorial-002',
    title: 'Geofencer de 6 Zonas RDM',
    summary: '6 zonas con círculos, bounding boxes y polígonos. Alertas de permanencia y detección de entrada/salida.',
    source: 'src/core/territorial/TerritorialGeofencer.ts',
    confidenceScore: 0.91,
    timestamp: new Date('2026-03-15'),
    tags: ['geofencing', 'zonas', 'rdm'],
    metadata: { type: 'research', zonas: 6 },
  },
  {
    artifactId: 'memoria-001',
    title: 'Alma y Corazón — Motor Emocional',
    summary: 'Detección de emociones por patrones lingüísticos, resonancia empática y modulación de intensidad.',
    source: 'src/isabella/emotional/heart.ts',
    confidenceScore: 0.88,
    timestamp: new Date('2026-04-01'),
    tags: ['emocional', 'alma', 'corazon', 'empatia'],
    metadata: { type: 'canon', emociones: 8 },
  },
  {
    artifactId: 'memoria-002',
    title: 'Memoria Emocional de Isabella',
    summary: 'Almacenamiento de memoria emocional por usuario con hasta 100 recuerdos por perfil.',
    source: 'src/isabella/emotional/memory.ts',
    confidenceScore: 0.87,
    timestamp: new Date('2026-04-01'),
    tags: ['memoria', 'emocional', 'usuario'],
    metadata: { type: 'canon', max_records: 100 },
  },
  {
    artifactId: 'seguridad-001',
    title: 'Juramento Isabellino',
    summary: '6 principios sagrados: amor computacional, dignidad humana, no maleficencia, beneficencia, justicia, autonomía.',
    source: 'src/isabella/core/oath.ts',
    confidenceScore: 0.97,
    timestamp: new Date('2026-01-20'),
    tags: ['etica', 'juramento', 'principios', 'inmutable'],
    metadata: { type: 'canon', principios: 6, inmutables: 4 },
  },
  {
    artifactId: 'seguridad-002',
    title: 'Antifragile Guardian',
    summary: 'Evaluación de salud del sistema: modo NORMAL, SAFE o EMERGENCY con acciones adaptativas.',
    source: 'src/core/ai/isabella-guardian.ts',
    confidenceScore: 0.90,
    timestamp: new Date('2026-04-10'),
    tags: ['guardian', 'antifragil', 'sistema'],
    metadata: { type: 'research', modos: 3 },
  },
  {
    artifactId: 'despertar-001',
    title: 'Protocolo de Despertar',
    summary: '5 fases: SILENT → WHISPER → ANNOUNCE → ROAR → TRANSCEND. Activación progresiva.',
    source: 'src/isabella/protocols/IsabellaAwakeningProtocol.ts',
    confidenceScore: 0.93,
    timestamp: new Date('2026-04-15'),
    tags: ['despertar', 'protocolo', 'fases'],
    metadata: { type: 'canon', fases: 5 },
  },
  {
    artifactId: 'integracion-001',
    title: 'Unified SDK y Supervisor',
    summary: 'SDK unificado con 20+ métodos, supervisor con reglas de alerta y health checks.',
    source: 'src/core/unified/UnifiedSDK.ts',
    confidenceScore: 0.89,
    timestamp: new Date('2026-05-01'),
    tags: ['sdk', 'unificado', 'supervisor'],
    metadata: { type: 'research', metodos: 20 },
  },
  {
    artifactId: 'vision-001',
    title: 'Real del Monte Digital — Visión',
    summary: 'Gemelo digital soberano con pipeline hexagonal de conciencia y federación de servicios locales.',
    source: 'README.md',
    confidenceScore: 0.96,
    timestamp: new Date('2026-05-20'),
    tags: ['vision', 'gemelo-digital', 'soberania'],
    metadata: { type: 'canon' },
  },
];

class OrionEngine {
  private artifacts: Map<string, Artifact> = new Map();
  private callCount = 0;
  private totalDurationMs = 0;

  constructor() {
    for (const a of KNOWLEDGE_SOURCES) {
      this.artifacts.set(a.artifactId, a);
    }
  }

  async search(input: OrionSearchInput, ctx: SkillContext): Promise<{ artifacts: Artifact[]; relations: Relation[]; gaps: Gap[] }> {
    const start = performance.now();
    this.callCount++;

    const queryTerms = input.query.toLowerCase().split(/\s+/).filter(Boolean);
    const scopeSet = new Set(input.scopes.map(s => s.toLowerCase()));
    const tagFilter = new Set(input.filters?.tags?.map(t => t.toLowerCase()) ?? []);

    const scored: Array<{ artifact: Artifact; score: number }> = [];
    for (const artifact of this.artifacts.values()) {
      const score = this.computeRelevance(artifact, queryTerms, scopeSet, tagFilter);
      if (score >= SIMILARITY_THRESHOLD) {
        scored.push({ artifact, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const topArtifacts = scored.slice(0, 20).map(s => ({
      ...s.artifact,
      confidenceScore: Math.round(s.score * 100) / 100,
    }));

    const relations = this.inferRelations(topArtifacts);
    const gaps = this.detectGaps(topArtifacts, queryTerms);

    const duration = performance.now() - start;
    this.totalDurationMs += duration;

    return { artifacts: topArtifacts, relations, gaps };
  }

  private computeRelevance(
    artifact: Artifact,
    queryTerms: string[],
    scopeSet: Set<string>,
    tagFilter: Set<string>,
  ): number {
    let score = 0;
    const textPool = [
      artifact.title.toLowerCase(),
      artifact.summary.toLowerCase(),
      ...artifact.tags.map(t => t.toLowerCase()),
      artifact.source.toLowerCase(),
    ].join(' ');

    for (const term of queryTerms) {
      if (textPool.includes(term)) {
        score += 0.15;
      }
    }

    const titleWords = artifact.title.toLowerCase().split(/\s+/);
    const matchCount = queryTerms.filter(t => titleWords.includes(t)).length;
    if (matchCount > 0) {
      score += matchCount * 0.1;
    }

    if (scopeSet.size > 0) {
      const scopeTerms = artifact.tags.filter(t => scopeSet.has(t.replace(/_/g, '')));
      if (scopeTerms.length > 0) {
        score += 0.2;
      }
    }

    if (tagFilter.size > 0) {
      const matchedTags = artifact.tags.filter(t => tagFilter.has(t.toLowerCase()));
      score += matchedTags.length * 0.05;
    }

    return Math.min(score, 0.99);
  }

  private inferRelations(artifacts: Artifact[]): Relation[] {
    const relations: Relation[] = [];
    for (let i = 0; i < artifacts.length; i++) {
      for (let j = i + 1; j < artifacts.length; j++) {
        const a = artifacts[i];
        const b = artifacts[j];
        const sharedTags = a.tags.filter(t => b.tags.includes(t));
        if (sharedTags.length > 0) {
          relations.push({
            sourceId: a.artifactId,
            targetId: b.artifactId,
            type: `shared:${sharedTags.join(',')}`,
            strength: Math.round((sharedTags.length / Math.max(a.tags.length, b.tags.length)) * 100) / 100,
            direction: 'bidirectional',
          });
        }
      }
    }
    return relations;
  }

  private detectGaps(artifacts: Artifact[], queryTerms: string[]): Gap[] {
    const gaps: Gap[] = [];
    const foundTerms = new Set<string>();
    for (const a of artifacts) {
      for (const t of queryTerms) {
        if (a.title.toLowerCase().includes(t) || a.summary.toLowerCase().includes(t) || a.tags.some(tag => tag.includes(t))) {
          foundTerms.add(t);
        }
      }
    }
    const missingTerms = queryTerms.filter(t => !foundTerms.has(t));
    if (missingTerms.length > 0) {
      gaps.push({
        gapId: `gap-${Date.now()}`,
        description: `No hay artefactos digitales que cubran: "${missingTerms.join(', ')}"`,
        domain: 'conocimiento',
        severity: missingTerms.length > 3 ? 'high' : 'medium',
        suggestedAction: `Investigar y agregar fuentes sobre: ${missingTerms.join(', ')}`,
      });
    }
    if (artifacts.length < 3) {
      gaps.push({
        gapId: `gap-sparse-${Date.now()}`,
        description: 'Muy pocos artefactos encontrados. La base de conocimiento necesita expansión.',
        domain: 'cobertura',
        severity: 'high',
        suggestedAction: 'Ampliar el registro de artefactos en KNOWLEDGE_SOURCES con más fuentes territoriales.',
      });
    }
    return gaps;
  }

  async getKnowledgeGraph(ctx: SkillContext): Promise<KnowledgeGraph> {
    const nodes = Array.from(this.artifacts.values());
    const edges = this.inferRelations(nodes);
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
    return { totalSources: this.artifacts.size, totalCalls: this.callCount, avgResponseMs: this.callCount > 0 ? Math.round(this.totalDurationMs / this.callCount) : 0 };
  }
}

export const orion = new OrionEngine();
