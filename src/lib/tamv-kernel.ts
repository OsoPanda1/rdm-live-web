export type Federation =
  | "DEKATEOTL"
  | "ANUBIS"
  | "BOOKPI"
  | "PHOENIX"
  | "MDD_TAMV"
  | "KAOS"
  | "CHRONOS";

export type CivicEventType =
  | "TOURISM_INTERACTION"
  | "DICHO_CONSULTED"
  | "PAYMENT_COMPLETED"
  | "ALERT_SECURITY"
  | "CITY_FEEDBACK"
  | "SYSTEM_METRIC"
  | "AI_INTERACTION";

export interface CivicEvent<TPayload = unknown> {
  id: string;
  type: CivicEventType;
  federation: Federation;
  payload: TPayload;
  occurredAt: string;
  source: "WEB_PORTAL" | "EDGE_NODE" | "MOBILE_APP" | "BACKOFFICE";
  correlationId?: string;
}

type Handler = (event: CivicEvent) => Promise<void> | void;

export class FederationBus {
  private handlers: Handler[] = [];

  subscribe(handler: Handler) {
    this.handlers.push(handler);
  }

  async publish(event: CivicEvent) {
    await Promise.all(this.handlers.map((handler) => handler(event)));
  }
}

export const federationBus = new FederationBus();
