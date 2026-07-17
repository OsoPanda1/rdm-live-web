import { logger } from "@/lib/logger";
// ChronusEngine · Núcleo de gestión de presión turística para RDM Digital.
// Contexto: Real del Monte, turismo de alta densidad, clima complejo, eventos culturales.

export interface QueryableDb {
  query: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: Array<Record<string, unknown>> }>;
}

export interface PublishClient {
  publish: (channel: string, payload: string) => Promise<void>;
}

/** Condiciones contextuales del territorio en un instante dado. */
export type Clima =
  | "despejado"
  | "lluvia"
  | "niebla_densa";

export interface ContextoCivilizatorio {
  clima: Clima;
  eventos_activos: string[];
  turistas_concurrentes: number;
}

/** Resultado completo del cálculo de presión, no solo un número. */
export interface ResultadoSaturacion {
  /** Zona o polígono analizado. */
  polygonId: string;
  /** Presión normalizada [0,1]. */
  presion: number;
  /** Componentes internos de la presión para telemetría. */
  componentes: {
    densidadFisica: number;
    multiplicadorClima: number;
    tensorEventos: number;
    tensorConcurrencia: number;
  };
  /** Timestamp ISO del cálculo. */
  timestamp: string;
}

/** Configuración inyectable para adaptar el motor sin tocar la lógica. */
export interface ChronusConfig {
  /** Capacidad base (turistas) para normalizar densidad física. */
  capacidadBaseZona: number; // p.ej. 1000
  /** Umbral a partir del cual se activa protocolo de escape. */
  umbralEscape: number; // p.ej. 0.85
}

/** Dependencias necesarias para el engine (pueden mockearse en tests). */
export interface ChronusDeps {
  db: QueryableDb;
  pubsub: PublishClient;
  config?: Partial<ChronusConfig>;
}

/**
 * Motor principal de cálculo de presión zonal.
 *
 * RESPONSABILIDADES:
 * - Obtener densidad física de turistas en un polígono (zona de presión).
 * - Combinar factores físicos y contextuales en una presión normalizada [0,1].
 * - Disparar protocolos de mitigación cuando se exceden umbrales.
 */
export class ChronusEngine {
  private readonly db: QueryableDb;
  private readonly pubsub: PublishClient;
  private readonly config: ChronusConfig;

  constructor(deps: ChronusDeps) {
    this.db = deps.db;
    this.pubsub = deps.pubsub;

    this.config = {
      capacidadBaseZona: deps.config?.capacidadBaseZona ?? 1000,
      umbralEscape: deps.config?.umbralEscape ?? 0.85,
    };
  }

  /**
   * Calcula la presión de saturación de una zona.
   * Devuelve un objeto rico en lugar de un escalar opaco.
   */
  public async calcularSaturacionZonal(
    polygonId: string,
    contexto: ContextoCivilizatorio,
  ): Promise<ResultadoSaturacion> {
    const activos = await this.obtenerTuristasActivos(polygonId);
    const densidadFisica = this.normalizarDensidadFisica(activos);

    const multiplicadorClima = this.calcularMultiplicadorClima(contexto.clima);
    const tensorEventos = this.calcularTensorEventos(contexto.eventos_activos);
    const tensorConcurrencia = this.calcularTensorConcurrencia(
      contexto.turistas_concurrentes,
    );

    const cargaBase = densidadFisica * multiplicadorClima;
    const cargaFinal = cargaBase + tensorEventos + tensorConcurrencia;
    const presionNormalizada = this.clamp(cargaFinal, 0, 1);

    const resultado: ResultadoSaturacion = {
      polygonId,
      presion: presionNormalizada,
      componentes: {
        densidadFisica,
        multiplicadorClima,
        tensorEventos,
        tensorConcurrencia,
      },
      timestamp: new Date().toISOString(),
    };

    if (presionNormalizada >= this.config.umbralEscape) {
      await this.activarProtocoloEscape(resultado);
    } else {
      await this.publicarEstadoNoCritico(resultado);
    }

    return resultado;
  }

  /** Obtiene el número de turistas activos en una zona en los últimos 15 minutos. */
  private async obtenerTuristasActivos(polygonId: string): Promise<number> {
    const res = await this.db.query(
      `
        SELECT COUNT(*) AS activos
        FROM turistas_tracking
        WHERE ST_Contains(
                (SELECT limites FROM zonas_presion WHERE id = $1),
                geom_actual
              )
          AND last_ping > NOW() - INTERVAL '15 minutes'
      `,
      [polygonId],
    );

    const raw = res.rows[0]?.activos;
    const n = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? "0"), 10);

    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  /** Densidad física normalizada respecto a la capacidad base de la zona. */
  private normalizarDensidadFisica(activos: number): number {
    if (this.config.capacidadBaseZona <= 0) {
      return 0;
    }

    const ratio = activos / this.config.capacidadBaseZona;
    // Permite que zonas con saturación extrema contribuyan >1 antes de clamp.
    return ratio;
  }

  /** Modula el impacto del clima sobre la densidad. */
  private calcularMultiplicadorClima(clima: Clima): number {
    switch (clima) {
      case "niebla_densa":
        return 1.4;
      case "lluvia":
        return 1.2;
      case "despejado":
      default:
        return 1.0;
    }
  }

  /** Aumenta presión si hay eventos activos (ej. festival, bicentenario). */
  private calcularTensorEventos(eventos: string[]): number {
    if (!eventos.length) return 0;

    // Cada evento agrega 0.05 hasta un máximo de 0.20.
    const base = eventos.length * 0.05;
    return Math.min(0.20, base);
  }

  /** Aumenta presión según turistas concurrentes en todo el sistema. */
  private calcularTensorConcurrencia(turistas_concurrentes: number): number {
    if (turistas_concurrentes <= 0) return 0;

    // 10K turistas → 0.25 de presión adicional, con tope en 0.30.
    const ratio = turistas_concurrentes / 10_000;
    return Math.min(0.30, ratio * 0.25);
  }

  private clamp(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min;
    return Math.max(min, Math.min(max, value));
  }

  /** Publica un evento crítico de saturación. */
  private async activarProtocoloEscape(resultado: ResultadoSaturacion): Promise<void> {
    const { polygonId, presion, componentes, timestamp } = resultado;

    // Logging estructurado, idealmente reemplazable por tu capa de observabilidad.
    logger.warn(
      "[CHRONUS] ALERTA: Saturación crítica",
      { polygonId, presion, componentes, timestamp },
    );

    const payload = JSON.stringify({
      zona_saturada: polygonId,
      accion: "REDIRECCION_FLUJO",
      capas_afectadas: ["turismo", "movilidad"],
      presion,
      componentes,
      timestamp,
    });

    await this.pubsub.publish("SYSTEM_AUTOPOIESIS_ALERT", payload);
  }

  /** Publica estados no críticos para dashboards / analítica continua. */
  private async publicarEstadoNoCritico(resultado: ResultadoSaturacion): Promise<void> {
    const payload = JSON.stringify({
      tipo: "ESTADO_ZONAL",
      ...resultado,
    });

    await this.pubsub.publish("CHRONUS_ZONAL_STATE", payload);
  }
}
