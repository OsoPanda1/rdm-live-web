import { supabaseAdmin } from "../integrations/supabase/admin";
import { logger } from "@/lib/logger";

export enum Federacion {
  HOSPEDAJE = "FED_HOSPEDAJE",
  GASTRONOMIA = "FED_GASTRONOMIA",
  MINERIA_PLATERIA = "FED_PLATERIA",
  TURISMO_ACTIVO = "FED_TURISMO",
  MOVILIDAD = "FED_MOVILIDAD",
  COMERCIO_LOCAL = "FED_COMERCIO",
  GOBIERNO_DIGITAL = "FED_GOBIERNO",
}

/** Eventos de CHECKIN para hospedaje. */
export interface CheckInPayload {
  turistaId: string;
  hotelId: string;
  noches: number;
}

/** Tipos de eventos “soberanía” para el dominio. */
export type SovereigntyEventType =
  | "ANOMALIA_DATOS"
  | "INTENTO_INTRUSION"
  | "POLICY_VIOLATION"
  | "OBSERVABILIDAD_SIGNAL";

export type BusChannel =
  | "CHECKIN_HOSPEDAJE"
  | "LSM_REALTIME_STREAM"
  | "SOVEREIGNTY_ALERTS"
  | "REALITO_TRIGGER";

export type MessageHandler = (channel: BusChannel, message: string) => void;

export interface PubSubClient {
  subscribe: (...channels: BusChannel[]) => Promise<void>;
  onMessage: (handler: MessageHandler) => void;
  publish: (channel: BusChannel, payload: string) => Promise<void>;
}

/**
 * Implementación in-memory para pruebas / local dev.
 * No persiste nada, pero respeta la interfaz PubSubClient.
 */
class InMemoryPubSubClient implements PubSubClient {
  private handlers: MessageHandler[] = [];

  async subscribe(..._channels: BusChannel[]): Promise<void> {
    return;
  }

  onMessage(handler: MessageHandler) {
    this.handlers.push(handler);
  }

  async publish(channel: BusChannel, payload: string): Promise<void> {
    for (const handler of this.handlers) {
      handler(channel, payload);
    }
  }
}

/** Tipos de eventos internos de FederationBus. */
type FederationEvent =
  | { type: "CHECKIN_HOSPEDAJE"; payload: CheckInPayload }
  | { type: "LSM_STREAM"; payload: unknown }
  | { type: "SOVEREIGNTY"; payload: unknown };

/**
 * FederationBus · Kernel federado para eventos transversales.
 *
 * Responsabilidades:
 * - Escuchar canales relevantes (check-in, LSM, soberanía).
 * - Transformar mensajes crudos (JSON string) en eventos tipados.
 * - Encadenar protocolos (retención, alerts, Realito).
 */
export class FederationBus {
  private readonly subscriber: PubSubClient;
  private readonly publisher: PubSubClient;

  constructor(pubSubClient?: PubSubClient) {
    const client = pubSubClient ?? new InMemoryPubSubClient();
    this.subscriber = client;
    this.publisher = client;
    void this.initListeners();
  }

  private async initListeners() {
    const channels: BusChannel[] = [
      "CHECKIN_HOSPEDAJE",
      "LSM_REALTIME_STREAM",
      "SOVEREIGNTY_ALERTS",
    ];

    try {
      await this.subscriber.subscribe(...channels);
    } catch (err) {
      logger.error("[FED-BUS] CRITICAL: Error inicializando kernel de federación", err);
    }

    this.subscriber.onMessage(async (channel, message) => {
      try {
        const event = this.parseEvent(channel, message);
        if (!event) return;

        switch (event.type) {
          case "CHECKIN_HOSPEDAJE":
            await this.handleCheckIn(event.payload);
            break;
          case "LSM_STREAM":
            this.handleLsmStream(event.payload);
            break;
          case "SOVEREIGNTY":
            this.handleSovereigntyEvent(event.payload);
            break;
        }
      } catch (error) {
        logger.error(`[FED-BUS] Error procesando canal ${channel}:`, error);
      }
    });
  }

  /** Intenta parsear el mensaje y mapearlo a un evento interno. */
  private parseEvent(channel: BusChannel, message: string): FederationEvent | null {
    let data: unknown;

    try {
      data = JSON.parse(message);
    } catch (error) {
      logger.warn("[FED-BUS] Mensaje no JSON en canal", channel, { message });
      return null;
    }

    switch (channel) {
      case "CHECKIN_HOSPEDAJE": {
        const payload = data as Partial<CheckInPayload>;
        if (!payload.turistaId || !payload.hotelId || typeof payload.noches !== "number") {
          logger.warn("[FED-BUS] Payload CHECKIN_HOSPEDAJE inválido", payload);
          return null;
        }
        return {
          type: "CHECKIN_HOSPEDAJE",
          payload: payload as CheckInPayload,
        };
      }
      case "LSM_REALTIME_STREAM":
        return { type: "LSM_STREAM", payload: data };
      case "SOVEREIGNTY_ALERTS":
        return { type: "SOVEREIGNTY", payload: data };
      default:
        return null;
    }
  }

  private async handleCheckIn(payload: CheckInPayload) {
    logger.info(
      "[FEDERACION] Protocolo de Retención :: Turista",
      payload.turistaId,
      "Hotel",
      payload.hotelId,
    );

    // En una versión futura, esto podría consultar Supabase / PG para ofertas contextuales.
    const oferta = await this.generarOfertaGastronomica(payload.hotelId);

    // Ledger aún en memoria, pero listo para persistir a supabaseAdmin.
    logger.info("[LEDGER] cross_sell_automatico", {
      turistaId: payload.turistaId,
      origen_federacion: Federacion.HOSPEDAJE,
      destino_federacion: Federacion.GASTRONOMIA,
      valor_estimado_mxn: payload.noches * 250,
      hotelId: payload.hotelId,
      oferta,
      protocol: "EOCT-KERNEL-B",
    });

    await this.publisher.publish(
      "REALITO_TRIGGER",
      JSON.stringify({
        turistaId: payload.turistaId,
        triggerType: "BIENVENIDA_CON_OFERTA",
        timestamp: new Date().toISOString(),
        ofertaData: oferta,
        visualStyle: "CRYSTAL_GLOW",
      }),
    );
  }

  private handleLsmStream(_payload: unknown) {
    // LSM: Layered Sensing Matrix (telemetría, mapa interactivo).[page:80][web:62]
    // Aquí podrías enrutar datos hacia Supabase, Influx, etc.
    logger.info("[LSM] Stream de telemetría procesado");
  }

  private handleSovereigntyEvent(payload: unknown) {
    // Hook para alertas de soberanía digital / policy engine.
    logger.info("[SOVEREIGNTY] Evento recibido", payload);
  }

  /** Genera oferta gastronómica base; fácilmente sustituible por consulta a Supabase. */
  private async generarOfertaGastronomica(hotelId: string) {
    // Stub: más adelante usar supabaseAdmin para extraer partners cercanos.
    // const { data } = await supabaseAdmin.from("restaurantes").select("*").match({ hotelId });
    return {
      origenHotel: hotelId,
      restaurante: "Paste_Minero_Reserva",
      descuento: "15%",
      vence_en_mins: 120,
      premium: true,
    };
  }

  /** Emite un evento de soberanía a través del bus. */
  public async emitSovereigntyEvent(type: SovereigntyEventType, details: unknown) {
    await this.publisher.publish(
      "SOVEREIGNTY_ALERTS",
      JSON.stringify({
        type,
        details,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}
