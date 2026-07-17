import { isabellaAPI } from '../api';
import { memoriaEmocional } from '../emotional/memory';
import { motorConciencia } from '../core/consciousness';
import { territorialCollector } from '@/core/territorial/TerritorialDataCollector';
import type { UserContribution, TerritorialStats, UserTerritorialProfile } from '@/core/territorial/types';
import type { Coordenadas, PointOfInterest, IsabellaDecision } from '@/core/models';
import { logger } from '@/lib/logger';
import { fastDistance, filterPointsInRadius } from '@/core/geo';
import { REAL_DEL_MONTE_SITES } from '@/lib/kernel';

export interface TerritorialInsight {
  tipo: 'patron' | 'alerta' | 'recomendacion' | 'descubrimiento' | 'tendencia';
  mensaje: string;
  confianza: number;
  contribucionesRelacionadas: number;
  timestamp: Date;
}

export interface IsabellaTerritorialState {
  zonaActual: string;
  contribucionesRecientes: UserContribution[];
  calorTerritorial: number;
  insights: TerritorialInsight[];
  memoriaZonal: Map<string, TerritorialInsight[]>;
}

export class IsabellaTerritorialMind {
  private state: IsabellaTerritorialState;
  private sites: PointOfInterest[];
  private cycleInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.state = {
      zonaActual: 'RDM',
      contribucionesRecientes: [],
      calorTerritorial: 0.5,
      insights: [],
      memoriaZonal: new Map(),
    };
    this.sites = REAL_DEL_MONTE_SITES;
  }

  start(intervalMs = 60000): void {
    this.cycleInterval = setInterval(() => this.cycle(), intervalMs);
    logger.info('[IsabellaTerritorialMind] Activada', { intervalMs });
  }

  stop(): void {
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }
  }

  async processUserContribution(contribution: UserContribution): Promise<TerritorialInsight[]> {
    const insights: TerritorialInsight[] = [];

    const emotionalResponse = isabellaAPI.procesarEmocion(
      this.extractTextFromPayload(contribution),
      contribution.userId
    );

    const nearbyPOIs = filterPointsInRadius(contribution.coords, this.sites, 500);
    if (nearbyPOIs.length > 0 && contribution.status === 'verified') {
      insights.push({
        tipo: 'descubrimiento',
        mensaje: `Isabella ha validado tu contribucion en ${nearbyPOIs[0].point.name}. ` +
          `Tu presencia enriquece la memoria del territorio.`,
        confianza: emotionalResponse.resonancia.nivel,
        contribucionesRelacionadas: 1,
        timestamp: new Date(),
      });
    }

    if (contribution.type === 'route_trace') {
      const pattern = this.analyzeRoutePattern(contribution);
      if (pattern) insights.push(pattern);
    }

    if (contribution.type === 'checkin') {
      const welcomeInsight = this.generateWelcomeInsight(contribution);
      if (welcomeInsight) insights.push(welcomeInsight);
    }

    this.state.contribucionesRecientes.push(contribution);
    if (this.state.contribucionesRecientes.length > 100) {
      this.state.contribucionesRecientes.shift();
    }

    this.updateZonalMemory(contribution, insights);
    this.recalculateTerritorialHeat();

    return insights;
  }

  async processUserQuery(query: string, coords?: Coordenadas): Promise<{
    respuesta: string;
    insights: TerritorialInsight[];
    activacionConciencia: Record<string, unknown>;
  }> {
    const analisis = isabellaAPI.analizarIntencion(query);
    const capasActivadas = motorConciencia.activarCapas(
      analisis.eticamenteValido ? 'cocreacion' : 'general',
      true
    );

    const insights: TerritorialInsight[] = [];

    if (coords) {
      const nearbyContributions = territorialCollector.getContributionsInRadius(coords, 200);
      const verifiedContributions = nearbyContributions.filter(c => c.status === 'verified');

      if (verifiedContributions.length > 0) {
        insights.push({
          tipo: 'recomendacion',
          mensaje: `Hay ${verifiedContributions.length} contribuciones verificadas cerca de ti. ` +
            `La comunidad ha marcado este lugar.`,
          confianza: 0.85,
          contribucionesRelacionadas: verifiedContributions.length,
          timestamp: new Date(),
        });
      }
    }

    const respuesta = `Como guardiana del territorio, te escucho. ` +
      `${analisis.eticamenteValido ? 'Tu consulta esta alineada con nuestros principios.' : 'Revisemos juntos este camino.'} ` +
      `${this.state.calorTerritorial > 0.7 ? 'El territorio esta vibrando con actividad hoy.' : 'El territorio esta en calma, ideal para explorar.'}`;

    return { respuesta, insights, activacionConciencia: capasActivadas };
  }

  getTerritorialProfile(userId: string): UserTerritorialProfile | null {
    return territorialCollector.getUserProfile(userId);
  }

  getStats(): TerritorialStats {
    return territorialCollector.getStats();
  }

  getZonalMemory(zona: string): TerritorialInsight[] {
    return this.state.memoriaZonal.get(zona) ?? [];
  }

  private cycle(): void {
    const stats = territorialCollector.getStats();
    this.state.calorTerritorial = stats.territoryHealth;

    const recentActivity = territorialCollector.getContributionsByTerritory('RDM')
      .filter(c => (Date.now() - c.createdAt.getTime()) < 3600000);

    if (recentActivity.length > 5 && this.state.insights.length < 20) {
      this.state.insights.push({
        tipo: 'tendencia',
        mensaje: `Isabella detecta ${recentActivity.length} interacciones en la ultima hora. ` +
          `El gemelo digital se esta alimentando de la comunidad.`,
        confianza: 0.9,
        contribucionesRelacionadas: recentActivity.length,
        timestamp: new Date(),
      });
    }
  }

  private analyzeRoutePattern(contribution: UserContribution): TerritorialInsight | null {
    const routePayload = contribution.payload as unknown as Record<string, unknown>;
    if (routePayload.type !== 'route_trace' || !routePayload.waypoints) return null;

    const distance = Number(routePayload.distanceKm ?? 0);
    const duration = Number(routePayload.durationMinutes ?? 0);
    const speed = duration > 0 ? (distance / duration) * 60 : 0;

    if (speed > 5) {
      return {
        tipo: 'patron',
        mensaje: `Has recorrido ${distance.toFixed(1)} km. Isabella sugiere explorar con mas calma ` +
          `para descubrir detalles que el territorio guarda.`,
        confianza: 0.75,
        contribucionesRelacionadas: 1,
        timestamp: new Date(),
      };
    }

    return {
      tipo: 'recomendacion',
      mensaje: `Gracias por compartir tu ruta de ${distance.toFixed(1)} km. ` +
        `Cada camino trazado fortalece el mapa vivo de Real del Monte.`,
      confianza: 0.8,
      contribucionesRelacionadas: 1,
      timestamp: new Date(),
    };
  }

  private generateWelcomeInsight(contribution: UserContribution): TerritorialInsight | null {
    const profile = territorialCollector.getUserProfile(contribution.userId);
    if (!profile || profile.totalContributions > 3) return null;

    return {
      tipo: 'descubrimiento',
      mensaje: 'Bienvenido al mapa vivo de Real del Monte. Cada check-in tuyo es una semilla ' +
        'en el gemelo digital del territorio. Isabella te guiara en este despertar.',
      confianza: 0.95,
      contribucionesRelacionadas: 1,
      timestamp: new Date(),
    };
  }

  private updateZonalMemory(contribution: UserContribution, insights: TerritorialInsight[]): void {
    const zonaKey = `${contribution.coords.lat.toFixed(2)},${contribution.coords.lng.toFixed(2)}`;
    const existing = this.state.memoriaZonal.get(zonaKey) ?? [];
    existing.push(...insights);
    if (existing.length > 50) existing.splice(0, existing.length - 50);
    this.state.memoriaZonal.set(zonaKey, existing);
  }

  private recalculateTerritorialHeat(): void {
    const recent = this.state.contribucionesRecientes.filter(
      c => (Date.now() - c.createdAt.getTime()) < 3600000
    );
    this.state.calorTerritorial = Math.min(1, recent.length / 20);
  }

  private extractTextFromPayload(contribution: UserContribution): string {
    const p = contribution.payload;
    switch (p.type) {
      case 'review': return p.text;
      case 'tip': return p.text;
      case 'photo': return p.caption ?? '';
      case 'event_report': return p.description;
      case 'poi_suggestion': return `${p.suggestedName}: ${p.description}`;
      default: return '';
    }
  }
}

export const isabellaTerritorialMind = new IsabellaTerritorialMind();
