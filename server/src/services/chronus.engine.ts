// ============================================================================
// RDM Digital OS — Chronus Engine (v2)
// Motor de cálculo de saturación zonal en tiempo real
// ============================================================================

export type Clima = "despejado" | "lluvia" | "niebla_densa";

export interface ContextoCivilizatorio {
  clima: Clima;
  eventos_activos: string[];
  turistas_concurrentes: number;
}

export interface SaturationResult {
  polygonId: string;
  presion: number; // 0.0–1.0
  alerta: boolean;
  timestamp: string; // ISO-8601
}

/**
 * Configuración del motor. Permite tunear sin tocar la lógica.
 */
export interface ChronusConfig {
  maxActivosPorZona: number;
  maxTuristas: number;
  umbralAlerta: number; // 0–1
  climaMultipliers: Record<Clima, number>;
  eventoBonus: number;
  maxTensorConcurrencia: number; // 0–1
  enableWarnings: boolean;
}

const DEFAULT_CHRONUS_CONFIG: ChronusConfig = {
  maxActivosPorZona: 1_000,
  maxTuristas: 10_000,
  umbralAlerta: 0.85,
  climaMultipliers: {
    despejado: 1.0,
    lluvia: 1.2,
    niebla_densa: 1.4,
  },
  eventoBonus: 0.15,
  maxTensorConcurrencia: 0.25,
  enableWarnings: true,
};

export class ChronusEngine {
  private readonly config: ChronusConfig;

  constructor(config: Partial<ChronusConfig> = {}) {
    this.config = { ...DEFAULT_CHRONUS_CONFIG, ...config };
  }

  /**
   * Normaliza y acota un valor numérico.
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Calcula saturación para un polígono.
   * Devuelve una presión normalizada 0.0–1.0.
   */
  public calcularSaturacionZonal(
    polygonId: string,
    contexto: ContextoCivilizatorio,
    activosEnZona: number = 0,
  ): SaturationResult {
    const {
      maxActivosPorZona,
      maxTuristas,
      climaMultipliers,
      eventoBonus,
      maxTensorConcurrencia,
      umbralAlerta,
      enableWarnings,
    } = this.config;

    const activosClamped = this.clamp(
      Number.isFinite(activosEnZona) ? activosEnZona : 0,
      0,
      maxActivosPorZona,
    );

    const turistasClamped = this.clamp(
      Number.isFinite(contexto.turistas_concurrentes)
        ? contexto.turistas_concurrentes
        : 0,
      0,
      maxTuristas,
    );

    const clima: Clima =
      contexto.clima === "lluvia" || contexto.clima === "niebla_densa"
        ? contexto.clima
        : "despejado";

    const densidadFisica = activosClamped / maxActivosPorZona;

    const multiplicadorClima = climaMultipliers[clima] ?? 1.0;

    const tensorEventos =
      Array.isArray(contexto.eventos_activos) &&
      contexto.eventos_activos.length > 0
        ? eventoBonus
        : 0;

    const tensorConcurrencia = this.clamp(
      turistasClamped / maxTuristas,
      0,
      maxTensorConcurrencia,
    );

    const cargaBase = densidadFisica * multiplicadorClima;
    const cargaFinal = cargaBase + tensorEventos + tensorConcurrencia;

    const presion = this.clamp(cargaFinal, 0, 1);

    const alerta = presion > umbralAlerta;

    if (alerta && enableWarnings) {
      // En producción puedes enchufar aquí un logger externo.
       
      console.warn(
        `[CHRONUS] ALERTA: Saturación crítica (${(presion * 100).toFixed(
          1,
        )}%) en Zona ${polygonId}`,
      );
    }

    return {
      polygonId,
      presion,
      alerta,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calcula saturación para múltiples zonas en un solo paso.
   */
  public calcularSaturacionMultiple(
    zonas: Array<{ id: string; activos: number }>,
    contexto: ContextoCivilizatorio,
  ): SaturationResult[] {
    if (!Array.isArray(zonas) || zonas.length === 0) return [];
    return zonas.map((z) =>
      this.calcularSaturacionZonal(z.id, contexto, z.activos),
    );
  }

  /**
   * Exponer config efectiva (útil para debug/control panel).
   */
  public getConfig(): ChronusConfig {
    return this.config;
  }
}

/**
 * Instancia compartida del motor, con configuración por defecto.
 * Si en algún punto quieres distintas políticas (ej. entorno de pruebas),
 * puedes crear nuevas instancias con new ChronusEngine({ ... }).
 */
export const chronusEngine = new ChronusEngine();
