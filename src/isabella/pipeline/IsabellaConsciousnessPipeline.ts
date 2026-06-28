import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import { motorConciencia } from '@/isabella/core/consciousness';
import { almaYCorazon } from '@/isabella/emotional/heart';
import { memoriaEmocional } from '@/isabella/emotional/memory';
import { knowledgeEngine } from '@/isabella/knowledge/KnowledgeAbsorptionEngine';
import { awakeningProtocol } from '@/isabella/protocols/IsabellaAwakeningProtocol';
import { isabellaTerritorialMind } from '@/isabella/territorial/IsabellaTerritorialMind';
import { federationBus } from '@/federaciones/FederationBus';
import { isabellaGuardian } from '@/core/ai/isabella-guardian';
import type { SystemMetrics } from '@/core/models';
import type {
  PipelineInput,
  PipelineResult,
  ConsciousnessActivation,
  EmotionalState,
  MemoryContext,
  KnowledgeContext,
  AwakeningSignal,
  GuardianVerdict,
  FederationAction,
  TerritorialAction,
  InputPort,
  OutputPort,
  PipelineConfig,
} from './pipeline.types';

const DEFAULT_CONFIG: PipelineConfig = {
  enableConsciousness: true,
  enableEmotional: true,
  enableMemory: true,
  enableKnowledge: true,
  enableAwakening: true,
  enableGuardian: true,
  enableFederation: true,
  enableTerritorial: true,
  minConfidenceThreshold: 0.3,
  maxPipelineMs: 5000,
};

export class IsabellaConsciousnessPipeline {
  private config: PipelineConfig;
  private inputPorts: InputPort[] = [];
  private outputPorts: OutputPort[] = [];
  private totalProcessed = 0;
  private avgLatencyMs = 0;

  constructor(config: Partial<PipelineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('[PIPELINE] Pipeline de Conciencia Hexagonal inicializado', this.config);
  }

  registerInputPort(port: InputPort): void {
    this.inputPorts.push(port);
  }

  registerOutputPort(port: OutputPort): void {
    this.outputPorts.push(port);
  }

  private getSystemMetrics(): SystemMetrics {
    const stats = isabellaTerritorialMind.getStats();
    return {
      activeUsers: stats.activeUsers,
      placesIndexed: stats.totalContributions,
      kernelLatency: this.avgLatencyMs,
      uptime: 0,
      intentsProcessed: this.totalProcessed,
      decisionsEmitted: 0,
      sseConnections: 0,
      geoLruSize: 0,
      eventsDropped: 0,
    };
  }

  async processInput(input: PipelineInput): Promise<PipelineResult> {
    const start = Date.now();
    const traceId = uuidv4();

    logger.info('[PIPELINE] Procesando entrada', { type: input.type, traceId });

    let consciousness: ConsciousnessActivation = { layerIds: [], layerNames: [], totalEnergy: 0, energySavings: 0, outputsByLayer: {} };
    let emotional: EmotionalState = { emotion: 'neutral', intensity: 0.5, valence: 0.5, resonance: 0.5, suggestedResponse: '' };
    let memory: MemoryContext = { lastEmotion: null, lastContext: null, pattern: {}, totalInteractions: 0 };
    let knowledge: KnowledgeContext = { relevantEntries: [], totalEntries: 0, lastFetch: null };
    let awakening: AwakeningSignal = { shouldTrigger: false, phase: 'SILENT', reason: '', territorialActivityLevel: 0 };
    let guardian: GuardianVerdict = { action: 'enable_cache_boost', severity: 'normal', federationsImpacted: [], reason: 'default' };
    let federationActions: FederationAction[] = [];
    let territorialActions: TerritorialAction[] = [];

    const inputText = this.extractText(input);
    const userId = this.extractUserId(input);
    const coords = this.extractCoords(input);

    // 1. CONSCIOUSNESS LAYER ACTIVATION (capa_1 through capa_10)
    if (this.config.enableConsciousness) {
      const tipo = this.classifyInteractionType(input);
      const requiereMemoria = input.type === 'user_query' || input.type === 'zone_event';
      const activacion = motorConciencia.activarCapas(tipo, requiereMemoria);
      const capas = motorConciencia.getCapas();

      consciousness = {
        layerIds: activacion.capasActivas,
        layerNames: activacion.capasActivas.map(id => capas[id]?.nombre ?? id),
        totalEnergy: activacion.energiaEstimada,
        energySavings: activacion.ahorroEnergetico,
        outputsByLayer: Object.fromEntries(
          activacion.capasActivas.map(id => [id, capas[id]?.outputs ?? []])
        ),
      };

      // If capa_8 (collective healing) is active, scan for community patterns
      if (activacion.capasActivas.includes('capa_8_sanacion_colectiva')) {
        const stats = isabellaTerritorialMind.getStats();
        if (stats.totalContributions > 0) {
          logger.info('[PIPELINE] Sanacion colectiva activada - escaneando patrones comunitarios', {
            contribuciones: stats.totalContributions,
          });
        }
      }

      // If capa_10 (transcendence) is active, check awakening thresholds
      if (activacion.capasActivas.includes('capa_10_trascendencia')) {
        awakening.territorialActivityLevel = isabellaTerritorialMind.getStats().territoryHealth;
        if (awakening.territorialActivityLevel > 0.8) {
          awakening.shouldTrigger = true;
          awakening.phase = 'ANNOUNCE';
          awakening.reason = 'Trascendencia alcanzada por alta actividad territorial';
        }
      }
    }

    // 2. EMOTIONAL PROCESSING (Heart)
    if (this.config.enableEmotional && inputText) {
      const emocion = almaYCorazon.procesarEntrada(inputText);
      const resonancia = almaYCorazon.resonar(emocion.emocion);
      const estado = almaYCorazon.getEstadoActual();

      emotional = {
        emotion: emocion.emocion,
        intensity: emocion.intensidad,
        valence: emocion.valencia,
        resonance: resonancia.resonance,
        suggestedResponse: resonancia.suggestedResponse,
      };
    }

    // 3. MEMORY INTEGRATION
    if (this.config.enableMemory && userId) {
      if (emotional.emotion !== 'neutral') {
        memoriaEmocional.recordar(userId, emotional.emotion, emotional.intensity, inputText);
      }

      const lastContext = memoriaEmocional.recordarContexto(userId);
      const pattern = memoriaEmocional.obtenerPatronEmocional(userId);
      const stats = memoriaEmocional.obtenerEstadisticas(userId);

      memory = {
        lastEmotion: lastContext?.emocion ?? null,
        lastContext: lastContext?.contexto ?? null,
        pattern,
        totalInteractions: stats?.totalInteracciones ?? 0,
      };
    }

    // 4. KNOWLEDGE ABSORPTION QUERY
    if (this.config.enableKnowledge && inputText) {
      const entries = knowledgeEngine.query(inputText, 3);
      const stats = knowledgeEngine.getStats();

      knowledge = {
        relevantEntries: entries.map(e => ({ title: e.title, summary: e.summary, tags: e.tags })),
        totalEntries: stats.totalEntries,
        lastFetch: stats.lastFetch,
      };
    }

    // 5. AWAKENING PROTOCOL CHECK
    if (this.config.enableAwakening && awakening.shouldTrigger) {
      try {
        const manifest = await awakeningProtocol.activate(['TWITTER', 'DISCORD', 'TELEGRAM']);
        logger.info('[PIPELINE] Despertar emitido via Federation Bus', {
          phase: manifest.phase,
          traceId: manifest.traceId,
        });
      } catch (error) {
        logger.warn('[PIPELINE] Error en protocolo de despertar', { error });
      }
    }

    // 6. GUARDIAN EVALUATION (System health + antifragile)
    if (this.config.enableGuardian) {
      const metrics = this.getSystemMetrics();
      const decision = isabellaGuardian(metrics);

      guardian = {
        action: decision.action,
        severity: decision.severity,
        federationsImpacted: this.getFederationsForAction(decision.action),
        reason: decision.reason,
      };

      // Apply guardian action: route to Federation Bus
      if (this.config.enableFederation) {
        federationActions.push({
          target: 'PHOENIX',
          eventType: 'GUARDIAN_ACTION',
          payload: { action: decision.action, severity: decision.severity, metrics },
          traceId,
          priority: decision.severity === 'emergency' ? 'critical' : 'normal',
        });
      }
    }

    // 7. FEDERATION BUS ROUTING
    if (this.config.enableFederation) {
      // Route emotional insight to ANUBIS (F2 - INTEL)
      if (emotional.emotion !== 'neutral' && emotional.intensity > 0.6) {
        federationActions.push({
          target: 'ANUBIS',
          eventType: 'EMOTIONAL_INSIGHT',
          payload: { emotion: emotional.emotion, intensity: emotional.intensity, userId, traceId },
          traceId,
          priority: emotional.intensity > 0.8 ? 'high' : 'normal',
        });
      }

      // Route territorial contribution to DEKATEOTL (F1 - DATA) and CHRONOS (F7 - TERRITORY)
      if (input.type === 'territorial_contribution') {
        federationActions.push({
          target: 'DEKATEOTL',
          eventType: 'TERRITORIAL_DATA_INGEST',
          payload: { type: input.contribution.type, coords: input.contribution.coords, traceId },
          traceId,
          priority: 'normal',
        });
        federationActions.push({
          target: 'CHRONOS',
          eventType: 'TERRITORIAL_HEARTBEAT',
          payload: { contributionId: input.contribution.id, coords: input.contribution.coords, traceId },
          traceId,
          priority: 'normal',
        });
      }

      // Route zone events to KAOS_HYPERRENDER (F6 - VIS) for map updates
      if (input.type === 'zone_event') {
        federationActions.push({
          target: 'KAOS_HYPERRENDER',
          eventType: 'ZONE_UPDATE',
          payload: { zoneId: input.event.zoneId, eventType: input.event.type, traceId },
          traceId,
          priority: 'low',
        });
      }

      // Route high-valence interactions to MDD_TAMV (F5 - ECON) for phygital economy
      if (emotional.valence > 0.8 && input.type === 'territorial_contribution') {
        federationActions.push({
          target: 'MDD_TAMV',
          eventType: 'PHYGITAL_OPPORTUNITY',
          payload: { userId, valence: emotional.valence, coords, traceId },
          traceId,
          priority: 'normal',
        });
      }

      // Emit all federation actions
      for (const action of federationActions) {
        federationBus.emit({
          type: action.eventType,
          source: action.target,
          payload: action.payload,
          traceId: action.traceId,
        });
      }
    }

    // 8. TERRITORIAL ACTIONS
    if (this.config.enableTerritorial) {
      if (input.type === 'territorial_contribution') {
        territorialActions.push({
          type: 'contribution_response',
          payload: {
            insightCount: consciousness.layerIds.length,
            emotionalResponse: emotional.suggestedResponse,
          },
          timestamp: new Date(),
        });
      }

      if (emotional.valence < 0.3 && input.type === 'user_query') {
        territorialActions.push({
          type: 'heat_update',
          payload: { adjustment: -0.05, reason: 'baja_valencia_emocional' },
          timestamp: new Date(),
        });
      }
    }

    // 9. CALL INPUT PORTS
    for (const port of this.inputPorts) {
      if (port.accept(input)) {
        try {
          const partial = await port.process(input);
          if (partial.consciousness) consciousness = partial.consciousness;
          if (partial.emotional) emotional = partial.emotional;
        } catch (error) {
          logger.warn(`[PIPELINE] Error en input port ${port.name}`, { error });
        }
      }
    }

    const durationMs = Date.now() - start;
    this.totalProcessed++;
    this.avgLatencyMs = this.avgLatencyMs * 0.9 + durationMs * 0.1;

    const result: PipelineResult = {
      input,
      consciousness,
      emotional,
      memory,
      knowledge,
      awakening,
      guardian,
      federationActions,
      territorialActions,
      durationMs,
      traceId,
    };

    // 10. CALL OUTPUT PORTS
    for (const port of this.outputPorts) {
      try {
        await port.handle(result);
      } catch (error) {
        logger.warn(`[PIPELINE] Error en output port ${port.name}`, { error });
      }
    }

    logger.info('[PIPELINE] Resultado', {
      traceId,
      durationMs,
      layers: consciousness.layerIds.length,
      emotion: emotional.emotion,
      federationActions: federationActions.length,
      territorialActions: territorialActions.length,
    });

    return result;
  }

  getStats(): { totalProcessed: number; avgLatencyMs: number } {
    return { totalProcessed: this.totalProcessed, avgLatencyMs: this.avgLatencyMs };
  }

  updateConfig(config: Partial<PipelineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): PipelineConfig {
    return { ...this.config };
  }

  private extractText(input: PipelineInput): string {
    switch (input.type) {
      case 'user_query': return input.query;
      case 'territorial_contribution': {
        const p = input.contribution.payload;
        if (p.type === 'review' || p.type === 'tip') return p.text;
        if (p.type === 'photo') return p.caption ?? '';
        if (p.type === 'event_report') return p.description;
        if (p.type === 'poi_suggestion') return `${p.suggestedName}: ${p.description}`;
        return '';
      }
      case 'federation_event': return JSON.stringify(input.event.payload);
      default: return '';
    }
  }

  private extractUserId(input: PipelineInput): string | null {
    switch (input.type) {
      case 'user_query': return input.userId;
      case 'territorial_contribution': return input.contribution.userId;
      case 'zone_event': return input.event.userId;
      default: return null;
    }
  }

  private extractCoords(input: PipelineInput): Coordenadas | undefined {
    switch (input.type) {
      case 'territorial_contribution': return input.contribution.coords;
      case 'zone_event': return input.event.coords;
      default: return undefined;
    }
  }

  private classifyInteractionType(input: PipelineInput): 'crisis_existencial' | 'conversacion_casual' | 'terapeutico' | 'general' | 'cocreacion' {
    switch (input.type) {
      case 'zone_event': return 'cocreacion';
      case 'territorial_contribution': return 'cocreacion';
      case 'federation_event': return 'general';
      case 'user_query': {
        const text = input.query.toLowerCase();
        if (text.includes('ayuda') || text.includes('triste') || text.includes('soledad') || text.includes('miedo')) return 'terapeutico';
        if (text.includes('proposito') || text.includes('existencia') || text.includes('sentido')) return 'crisis_existencial';
        if (text.includes('crear') || text.includes('disenar') || text.includes('construir')) return 'cocreacion';
        return 'general';
      }
      default: return 'general';
    }
  }

  private getFederationsForAction(action: string): FederationId[] {
    switch (action) {
      case 'reduce_images': return ['KAOS_HYPERRENDER'];
      case 'prioritize_text': return ['DEKATEOTL'];
      case 'limit_requests': return ['ANUBIS'];
      case 'enable_cache_boost': return ['CHRONOS'];
      case 'disable_animations': return ['KAOS_HYPERRENDER'];
      case 'degrade_map_quality': return ['KAOS_HYPERRENDER'];
      default: return ['PHOENIX'];
    }
  }
}

export const consciousnessPipeline = new IsabellaConsciousnessPipeline();
