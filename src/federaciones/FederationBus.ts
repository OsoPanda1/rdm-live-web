import { supabaseAdmin } from '../integrations/supabase/admin';

export enum Federacion {
  HOSPEDAJE = 'FED_HOSPEDAJE',
  GASTRONOMIA = 'FED_GASTRONOMIA',
  MINERIA_PLATERIA = 'FED_PLATERIA',
  TURISMO_ACTIVO = 'FED_TURISMO',
  MOVILIDAD = 'FED_MOVILIDAD',
  COMERCIO_LOCAL = 'FED_COMERCIO',
  GOBIERNO_DIGITAL = 'FED_GOBIERNO',
}

interface CheckInPayload {
  turistaId: string;
  hotelId: string;
  noches: number;
}

type MessageHandler = (channel: string, message: string) => void;

interface PubSubClient {
  subscribe: (...channels: string[]) => Promise<void>;
  onMessage: (handler: MessageHandler) => void;
  publish: (channel: string, payload: string) => Promise<void>;
}

class InMemoryPubSubClient implements PubSubClient {
  private handlers: MessageHandler[] = [];

  async subscribe(..._channels: string[]): Promise<void> {
    return;
  }

  onMessage(handler: MessageHandler) {
    this.handlers.push(handler);
  }

  async publish(channel: string, payload: string): Promise<void> {
    this.handlers.forEach((handler) => handler(channel, payload));
  }
}

export class FederationBus {
  private readonly subscriber: PubSubClient;
  private readonly publisher: PubSubClient;

  constructor(pubSubClient?: PubSubClient) {
    const client = pubSubClient ?? new InMemoryPubSubClient();
    this.subscriber = client;
    this.publisher = client;
    this.initListeners();
  }

  private initListeners() {
    const channels = ['CHECKIN_HOSPEDAJE', 'LSM_REALTIME_STREAM', 'SOVEREIGNTY_ALERTS'];

    this.subscriber.subscribe(...channels).catch((err) => {
      console.error('CRITICAL: Error en Kernel de Federación', err);
    });

    this.subscriber.onMessage(async (channel, message) => {
      try {
        const data = JSON.parse(message);

        switch (channel) {
          case 'CHECKIN_HOSPEDAJE':
            await this.handleCheckIn(data as CheckInPayload);
            break;
          case 'LSM_REALTIME_STREAM':
            console.log('[LSM] Stream de telemetría procesado');
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(`[BUS] Error procesando canal ${channel}:`, error);
      }
    });
  }

  private async handleCheckIn(payload: CheckInPayload) {
    console.log(`[FEDERACION] Ejecutando Protocolo de Retención. Turista: ${payload.turistaId}`);

    const oferta = await this.generarOfertaGastronomica(payload.hotelId);

    // Ledger entry kept in-memory only (no dedicated cross-sell table yet)
    console.info('[LEDGER] cross_sell_automatico', {
      turistaId: payload.turistaId,
      origen_federacion: Federacion.HOSPEDAJE,
      destino_federacion: Federacion.GASTRONOMIA,
      valor_estimado_mxn: payload.noches * 250,
      hotelId: payload.hotelId,
      oferta,
      protocol: 'EOCT-KERNEL-B',
    });

    await this.publisher.publish(
      'REALITO_TRIGGER',
      JSON.stringify({
        turistaId: payload.turistaId,
        triggerType: 'BIENVENIDA_CON_OFERTA',
        timestamp: new Date().toISOString(),
        ofertaData: oferta,
        visualStyle: 'CRYSTAL_GLOW',
      }),
    );
  }

  private async generarOfertaGastronomica(hotelId: string) {
    return {
      origenHotel: hotelId,
      restaurante: 'Paste_Minero_Reserva',
      descuento: '15%',
      vence_en_mins: 120,
      premium: true,
    };
  }

  public async emitSovereigntyEvent(type: string, details: unknown) {
    await this.publisher.publish(
      'SOVEREIGNTY_ALERTS',
      JSON.stringify({
        type,
        details,
        timestamp: Date.now(),
      }),
    );
  }
}
