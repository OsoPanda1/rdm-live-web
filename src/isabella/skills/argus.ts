import type { SkillContext, SimulationResult, RiskProfile } from './types';

interface ArgusSimulationInput {
  scenarioDefinition: {
    action: string;
    domain: string;
    target: string;
    parameters: Record<string, unknown>;
  };
  timeHorizon: 'corto' | 'medio' | 'largo';
  dimensions: string[];
  constraints: {
    budget?: number;
    timeline?: number;
    dependencies?: string[];
    assumptions?: string[];
  };
}

const DIMENSION_WEIGHTS: Record<string, { cultural: number; social: number; economic: number; ethical: number; technical: number }> = {
  'politica_publica': { cultural: 0.3, social: 0.4, economic: 0.4, ethical: 0.5, technical: 0.2 },
  'feature_digital': { cultural: 0.2, social: 0.3, economic: 0.3, ethical: 0.3, technical: 0.6 },
  'campana_turistica': { cultural: 0.5, social: 0.4, economic: 0.6, ethical: 0.2, technical: 0.1 },
  'decision_comunidad': { cultural: 0.4, social: 0.5, economic: 0.3, ethical: 0.6, technical: 0.1 },
};

const TIME_ADJUSTMENT: Record<string, number> = {
  corto: 0.8,
  medio: 1.0,
  largo: 1.3,
};

class ArgusEngine {
  private callCount = 0;
  private totalDurationMs = 0;
  private simulationHistory: Array<{ input: string; outcomes: Record<string, number>; actual: Record<string, number> | null }> = [];

  async simulate(input: ArgusSimulationInput, ctx: SkillContext): Promise<{ simulations: SimulationResult[]; riskProfile: RiskProfile[]; recommendations: string[] }> {
    const start = performance.now();
    this.callCount++;

    const weights = DIMENSION_WEIGHTS[input.scenarioDefinition.domain] ?? { cultural: 0.3, social: 0.3, economic: 0.3, ethical: 0.3, technical: 0.3 };
    const timeFactor = TIME_ADJUSTMENT[input.timeHorizon] ?? 1.0;

    const simulations: SimulationResult[] = [];
    const risks: RiskProfile[] = [];

    for (const dim of input.dimensions) {
      const baseProb = (weights[dim as keyof typeof weights] ?? 0.3) * timeFactor;
      const confidence = 0.6 + (input.constraints.assumptions?.length ?? 0) * 0.05;
      const optimism = 0.5 + Math.random() * 0.2;

      simulations.push({
        scenarioId: `sim-${dim}-${Date.now()}`,
        dimension: dim,
        expectedOutcome: this.generateOutcome(dim, input.scenarioDefinition, baseProb),
        probability: Math.round(Math.min(baseProb + optimism * 0.2, 0.95) * 100) / 100,
        confidence: Math.round(Math.min(confidence, 0.95) * 100) / 100,
      });

      if (baseProb < 0.4) {
        risks.push({
          riskId: `risk-${dim}-${Date.now()}`,
          dimension: dim,
          probability: Math.round((1 - baseProb) * 100) / 100,
          severity: baseProb < 0.2 ? 'high' : 'medium',
          type: this.mapDimToRiskType(dim),
          mitigation: this.generateMitigation(dim, input.scenarioDefinition),
        });
      }
    }

    const recommendations = this.buildRecommendations(simulations, risks, input);

    const duration = performance.now() - start;
    this.totalDurationMs += duration;

    return { simulations, riskProfile: risks, recommendations };
  }

  private generateOutcome(dim: string, scenario: ArgusSimulationInput['scenarioDefinition'], prob: number): string {
    const outcomes: Record<string, string[]> = {
      economia: ['Incremento en flujo económico local', 'Estabilización de ingresos turísticos', 'Aumento en derrama económica'],
      cultura: ['Fortalecimiento de identidad local', 'Preservación de patrimonio cultural', 'Revitalización de tradiciones'],
      etica: ['Cumplimiento de principios isabellinos', 'Transparencia en procesos', 'Participación comunitaria'],
      infraestructura: ['Mejora en capacidad de servicio', 'Optimización de recursos técnicos', 'Escalabilidad del sistema'],
      social: ['Cohesión comunitaria', 'Inclusión digital', 'Distribución equitativa de beneficios'],
      technical: ['Estabilidad del sistema', 'Mejora en rendimiento', 'Reducción de latencia'],
    };
    const dimOutcomes = outcomes[dim] ?? ['Impacto neutral esperado'];
    return dimOutcomes[Math.floor(prob * dimOutcomes.length) % dimOutcomes.length];
  }

  private mapDimToRiskType(dim: string): RiskProfile['type'] {
    const map: Record<string, RiskProfile['type']> = {
      economia: 'economic',
      cultura: 'cultural',
      etica: 'ethical',
      infraestructura: 'technical',
      social: 'social',
      technical: 'technical',
    };
    return map[dim] ?? 'technical';
  }

  private generateMitigation(dim: string, scenario: ArgusSimulationInput['scenarioDefinition']): string {
    const mitigations: Record<string, string> = {
      economia: 'Implementar monitoreo trimestral de indicadores económicos locales.',
      cultura: 'Establecer consulta con la comunidad antes de implementar cambios culturales.',
      etica: 'Someter la decisión a evaluación de LUMEN con supervisión humana.',
      infraestructura: 'Realizar pruebas de carga y tener plan de rollback.',
      social: 'Asegurar canales de retroalimentación comunitaria durante la implementación.',
      technical: 'Tener redundancia operativa y plan de contingencia técnica.',
    };
    return mitigations[dim] ?? 'Evaluar riesgos adicionales antes de proceder.';
  }

  private buildRecommendations(sims: SimulationResult[], risks: RiskProfile[], input: ArgusSimulationInput): string[] {
    const recs: string[] = [];
    if (risks.length > 1) {
      recs.push('Se recomienda proceder con precaución debido a múltiples riesgos identificados.');
    }
    if (sims.some(s => s.probability > 0.7)) {
      recs.push('Las condiciones son favorables para la implementación en el horizonte temporal definido.');
    }
    if (input.timeHorizon === 'largo') {
      recs.push('Establecer hitos intermedios para validar supuestos en el camino.');
    }
    if (input.constraints.dependencies && input.constraints.dependencies.length > 0) {
      recs.push(`Asegurar que las dependencias (${input.constraints.dependencies.join(', ')}) estén resueltas antes de iniciar.`);
    }
    return recs;
  }

  getStats() {
    return { totalSimulations: this.callCount, historySize: this.simulationHistory.length, avgResponseMs: this.callCount > 0 ? Math.round(this.totalDurationMs / this.callCount) : 0 };
  }
}

export const argus = new ArgusEngine();
