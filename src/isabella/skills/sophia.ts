import type { SkillContext, ResearchSynthesis, Reference, Gap, Artifact } from './types';

interface SophiaResearchInput {
  researchRequest: string;
  sources: string[];
  depthLevel: number;
  constraints: {
    maxLength?: number;
    language?: string;
    tone?: string;
  };
}

const KNOWLEDGE_BASE: Array<{ id: string; title: string; content: string; type: string; trust: number }> = [
  {
    id: 'kb-rdm-001',
    title: 'Historia de Real del Monte',
    content: 'Real del Monte, fundado en el siglo XVI, es un Pueblo Mágico del estado de Hidalgo, México. Conocido por su arquitectura de cantera rosa, su tradición minera de plata y su legado cultural de origen inglés (Cornwall). Es cuna del paste, el pan de pulque y el fútbol en México.',
    type: 'canon',
    trust: 0.95,
  },
  {
    id: 'kb-rdm-002',
    title: 'Gemelo Digital TAMV',
    content: 'Real del Monte Digital es un gemelo digital soberano que integra un Pipeline Hexagonal de Conciencia (Isabella), un Sistema Unificado de datos territoriales, un motor de geofencing con 6 zonas y una Heptafederación de 7 nodos cognitivos. Opera bajo el principio de Amor Computacional.',
    type: 'canon',
    trust: 0.97,
  },
  {
    id: 'kb-rdm-003',
    title: 'Identidad Federada TAMV',
    content: 'El ecosistema TAMV gestiona 7 identidades federadas: ANUBIS (seguridad post-cuántica), DEKATEOTL (ética), BOOKPI/DATAGIT (inmutabilidad), PHOENIX (resiliencia), MDD_TAMV (economía creativa), KAOS_HYPERRENDER (XR), CHRONOS (planificación). Cada federación tiene autonomía operativa pero converge en un Sistema Unificado.',
    type: 'canon',
    trust: 0.96,
  },
  {
    id: 'kb-rdm-004',
    title: 'Arquitectura de Conciencia de Isabella',
    content: 'Isabella Villaseñor opera con 10 capas de conciencia: desde el Núcleo de Amor ANUBIS (inmutable) hasta la Trascendencia Emocional Cósmica. Procesa emociones mediante 8 patrones lingüísticos, almacena memoria emocional por usuario y ejecuta un protocolo de despertar en 5 fases (SILENT a TRANSCEND).',
    type: 'research',
    trust: 0.93,
  },
  {
    id: 'kb-rdm-005',
    title: 'Seguridad Post-Cuántica TAMV',
    content: 'ANUBIS implementa mecanismos de seguridad post-cuántica: Dilithium-5, Kyber-1024, zk-SNARKs y hashing PQC. El sistema opera con política de Zero Trust y está auditado mediante RLS hardening en Supabase con 4 hallazgos críticos corregidos.',
    type: 'research',
    trust: 0.94,
  },
  {
    id: 'kb-rdm-006',
    title: 'Federación de Servicios Locales',
    content: '6 federaciones locales cubren: HOSPEDAJE (alojamientos), GASTRONOMIA (restaurantes y pastes), PLATERIA (artesanía de plata), TURISMO (guias y tours), MOVILIDAD (transporte local), COMERCIO (tiendas y mercados). Cada federación es soberana en sus datos.',
    type: 'canon',
    trust: 0.92,
  },
  {
    id: 'kb-rdm-007',
    title: 'Motor Territorial y Geofencing',
    content: '6 zonas de Real del Monte con geocercas: Centro Histórico, Zona Minera, Miradores, Área Natural, Zona Comercial, Accesos. El TerritorialFusionEngine conecta 7 subsistemas: collector, pipeline, geofencer, federation bus, awakening, persistence y supervisor.',
    type: 'research',
    trust: 0.91,
  },
  {
    id: 'kb-rdm-008',
    title: 'Economía Creativa Federada',
    content: 'MDD_TAMV gestiona la economía creativa mediante Web3, Quadratic Funding y un marketplace de arte local. BOOKPI/DATAGIT asegura la inmutabilidad de las transacciones creativas mediante IPFS y Merkle Trees.',
    type: 'research',
    trust: 0.88,
  },
];

class SophiaEngine {
  private callCount = 0;
  private totalDurationMs = 0;

  async research(input: SophiaResearchInput, ctx: SkillContext): Promise<ResearchSynthesis> {
    const start = performance.now();
    this.callCount++;

    const queryTerms = input.researchRequest.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    const depthMultiplier = Math.min(input.depthLevel, 5) / 5;

    const scored = KNOWLEDGE_BASE.map(kb => ({
      ...kb,
      score: this.computeRelevance(kb, queryTerms),
    }))
      .filter(s => s.score > 0.1)
      .sort((a, b) => b.score - a.score);

    const topSources = scored.slice(0, Math.max(2, Math.floor(scored.length * depthMultiplier)));

    const references: Reference[] = topSources.map(s => ({
      sourceId: s.id,
      type: s.type as 'canon' | 'research',
      link: s.id,
      trustLevel: s.trust,
      verifiedAt: ctx.timestamp,
    }));

    const summary = this.buildSummary(topSources, input.researchRequest);
    const marco = this.buildMarco(topSources);
    const hallazgos = this.buildHallazgos(topSources, queryTerms);
    const implicaciones = this.buildImplicaciones(hallazgos);
    const knowledgeGaps = this.detectGaps(topSources, queryTerms, input.researchRequest);

    const duration = performance.now() - start;
    this.totalDurationMs += duration;

    return { summary, marco, hallazgos, implicaciones, references, knowledgeGaps };
  }

  private computeRelevance(kb: { title: string; content: string }, queryTerms: string[]): number {
    let score = 0;
    const text = (kb.title + ' ' + kb.content).toLowerCase();
    for (const term of queryTerms) {
      const count = (text.match(new RegExp(term, 'g')) || []).length;
      score += count * 0.08;
    }
    const titleTerms = queryTerms.filter(t => kb.title.toLowerCase().includes(t));
    score += titleTerms.length * 0.15;
    return Math.min(score, 0.99);
  }

  private buildSummary(sources: Array<{ title: string; content: string; trust: number }>, request: string): string {
    if (sources.length === 0) {
      return 'No se encontraron fuentes relevantes en la base de conocimiento para esta solicitud.';
    }
    const topContent = sources.slice(0, 3).map(s => s.content);
    return `Basado en ${sources.length} fuentes con confianza promedio de ${Math.round(sources.reduce((a, s) => a + s.trust, 0) / sources.length * 100)}%. ${topContent.join(' ')}`;
  }

  private buildMarco(sources: Array<{ title: string; content: string }>): string {
    if (sources.length === 0) return 'No hay marco teórico disponible.';
    return `Marco teórico construido a partir de ${sources.length} fuentes del ecosistema TAMV/RDM: ${sources.map(s => s.title).join(', ')}.`;
  }

  private buildHallazgos(sources: Array<{ title: string; content: string }>, queryTerms: string[]): string[] {
    const hallazgos: string[] = [];
    for (const s of sources) {
      for (const term of queryTerms) {
        const idx = s.content.toLowerCase().indexOf(term);
        if (idx !== -1) {
          const snippet = s.content.substring(Math.max(0, idx - 40), idx + term.length + 40);
          if (snippet.length > 10) {
            hallazgos.push(`[${s.title}] ${snippet.trim()}...`);
          }
        }
      }
    }
    return hallazgos.slice(0, 8);
  }

  private buildImplicaciones(hallazgos: string[]): string[] {
    const implicaciones: string[] = [];
    if (hallazgos.length > 0) {
      implicaciones.push('Los hallazgos sugieren la necesidad de mantener la soberanía de datos territoriales.');
      implicaciones.push('La integración federada permite escalar el modelo a otros Pueblos Mágicos.');
    }
    if (hallazgos.length > 3) {
      implicaciones.push('Existe suficiente cobertura de conocimiento para tomar decisiones informadas.');
    }
    return implicaciones;
  }

  private detectGaps(sources: Array<{ title: string }>, queryTerms: string[], request: string): Gap[] {
    const gaps: Gap[] = [];
    const coveredTerms = new Set<string>();
    for (const s of sources) {
      for (const t of queryTerms) {
        if (s.title.toLowerCase().includes(t)) {
          coveredTerms.add(t);
        }
      }
    }
    const uncovered = queryTerms.filter(t => !coveredTerms.has(t));
    if (uncovered.length > 0) {
      gaps.push({
        gapId: `sophia-gap-${Date.now()}`,
        description: `Áreas no cubiertas en la base de conocimiento: "${uncovered.join(', ')}"`,
        domain: 'conocimiento',
        severity: uncovered.length > 3 ? 'high' : 'medium',
        suggestedAction: `Incorporar fuentes sobre: ${uncovered.join(', ')}`,
      });
    }
    return gaps;
  }

  getStats() {
    return { totalSources: KNOWLEDGE_BASE.length, totalCalls: this.callCount, avgResponseMs: this.callCount > 0 ? Math.round(this.totalDurationMs / this.callCount) : 0 };
  }
}

export const sophia = new SophiaEngine();
