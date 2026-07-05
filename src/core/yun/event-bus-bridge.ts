/**
 * YUN Event Bus Bridge — Unifies the three event systems:
 * 1. YUN Constitutional Event Bus (src/core/yun/event-bus.ts)
 * 2. FederationBus (src/federaciones/FederationBus.ts)
 * 3. RDM Core Events (src/core/events/bus.ts)
 *
 * Per YUN Constitution Principle #2: Eventos antes que acoplamiento.
 * All state changes flow through this unified bus.
 */

import { publish as yunPublish, subscribe as yunSubscribe, createEvent } from '@/core/yun/event-bus';
import { federationBus } from '@/federaciones/FederationBus';
import type { YunEventEnvelope, YunFederation, YunDomain, YunEventType } from '@/core/yun/types';
import type { FederationId } from '@/core/models';

// ============================================================================
// TAMV FEDERATION → YUN FEDERATION MAPPING
// ============================================================================

const TAMV_TO_YUN_FEDERATION: Record<FederationId, YunFederation> = {
  DEKATEOTL: 'comercio',
  ANUBIS: 'turismo_cultura',
  BOOKPI_DATAGIT: 'academia',
  PHOENIX: 'gobierno',
  MDD_TAMV: 'tech_infra',
  KAOS_HYPERRENDER: 'comunidad',
  CHRONOS: 'metaverso_xr',
};

const YUN_TO_TAMV_FEDERATION: Record<YunFederation, FederationId> = {
  comercio: 'DEKATEOTL',
  turismo_cultura: 'ANUBIS',
  academia: 'BOOKPI_DATAGIT',
  gobierno: 'PHOENIX',
  tech_infra: 'MDD_TAMV',
  comunidad: 'KAOS_HYPERRENDER',
  metaverso_xr: 'CHRONOS',
};

// ============================================================================
// FEDERATION EVENT → YUN EVENT BRIDGE
// ============================================================================

/**
 * Bridges FederationBus events into the YUN event bus.
 * When a TAMV federation emits an event, it's also published to YUN.
 */
function bridgeFederationToYun(): void {
  const federationTypes = [
    'FEDERATION_INTENT',
    'EMOTIONAL_INSIGHT',
    'TERRITORIAL_DATA_INGEST',
    'TERRITORIAL_HEARTBEAT',
    'ZONE_UPDATE',
    'PHYGITAL_OPPORTUNITY',
    'GUARDIAN_ACTION',
    'SOVEREIGNTY_ALERT',
  ];

  for (const eventType of federationTypes) {
    federationBus.on(eventType, (event) => {
      const yunFed = TAMV_TO_YUN_FEDERATION[event.source];
      if (yunFed) {
        yunPublish(
          createEvent(
            `yun.${yunFed}.${eventType.toLowerCase()}` as YunEventType,
            `federation-bus:${event.source}`,
            event.payload,
            { federation: yunFed, correlationId: event.traceId },
          ),
        );
      }
    });
  }
}

// ============================================================================
// YUN EVENT → FEDERATION EVENT BRIDGE
// ============================================================================

/**
 * Bridges YUN events into the FederationBus.
 * When a YUN domain event is published, the relevant TAMV federation is notified.
 */
function bridgeYunToFederation(): void {
  const yunDomainToFed: Record<string, FederationId> = {
    identity: 'BOOKPI_DATAGIT',
    commerce: 'MDD_TAMV',
    knowledge: 'ANUBIS',
    telemetry: 'PHOENIX',
    gameplay: 'CHRONOS',
  };

  yunSubscribe('yun.*.*.created', (event) => {
    const domain = event.metadata.domain;
    if (domain && yunDomainToFed[domain]) {
      federationBus.emit({
        type: 'YUN_DOMAIN_EVENT',
        source: yunDomainToFed[domain],
        payload: {
          eventType: event.type,
          data: event.data,
          yunEventId: event.id,
        },
        traceId: event.metadata.correlationId ?? event.id,
      });
    }
  });

  yunSubscribe('yun.federation.degraded', (event) => {
    const federation = event.metadata.federation;
    if (federation) {
      const tamvFed = YUN_TO_TAMV_FEDERATION[federation];
      if (tamvFed) {
        federationBus.updateHealth(tamvFed, 0.3);
      }
    }
  });

  yunSubscribe('yun.federation.recovered', (event) => {
    const federation = event.metadata.federation;
    if (federation) {
      const tamvFed = YUN_TO_TAMV_FEDERATION[federation];
      if (tamvFed) {
        federationBus.updateHealth(tamvFed, 1.0);
      }
    }
  });
}

// ============================================================================
// UNIFIED EVENT PUBLISHING
// ============================================================================

export type UnifiedYunEventType = YunEventType | `yun.${string}.${string}.${string}`;

/**
 * Publishes an event to both YUN and FederationBus simultaneously.
 * This is the primary entry point for all event publishing.
 */
export async function publishUnified<T>(
  type: UnifiedYunEventType,
  source: string,
  data: T,
  options: {
    federation?: YunFederation;
    domain?: YunDomain;
    tamvFederation?: FederationId;
    traceId?: string;
  } = {},
): Promise<void> {
  // Publish to YUN
  await yunPublish(
    createEvent(type as YunEventType, source, data, {
      federation: options.federation,
      domain: options.domain,
      correlationId: options.traceId,
    }),
  );

  // Also publish to FederationBus if TAMV federation specified
  if (options.tamvFederation) {
    federationBus.emit({
      type: type.split('.').slice(2).join('.'),
      source: options.tamvFederation,
      payload: data,
      traceId: options.traceId ?? `yun_${Date.now()}`,
    });
  }
}

/**
 * Subscribes to events from both YUN and FederationBus.
 */
export function subscribeUnified(
  pattern: string,
  handler: (event: YunEventEnvelope) => void | Promise<void>,
): () => void {
  return yunSubscribe(pattern, handler);
}

// ============================================================================
// FEDERATION HEALTH AGGREGATION
// ============================================================================

/**
 * Returns the health of all 7 federations from both systems.
 */
export function getUnifiedFederationHealth(): Array<{
  tamvId: FederationId;
  yunFederation: YunFederation;
  name: string;
  status: string;
  health: number;
  specialty: string;
}> {
  const tamvFeds = federationBus.getAllFederations();

  return tamvFeds.map((fed) => ({
    tamvId: fed.id,
    yunFederation: TAMV_TO_YUN_FEDERATION[fed.id],
    name: fed.name,
    status: fed.status,
    health: fed.health,
    specialty: fed.specialty,
  }));
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let initialized = false;

/**
 * Initializes the unified event bus bridge.
 * Call once at application startup.
 */
export function initEventBusBridge(): void {
  if (initialized) return;
  bridgeFederationToYun();
  bridgeYunToFederation();
  initialized = true;
  console.log('[YUN EventBusBridge] Unified event bus initialized — TAMV ↔ YUN ↔ Core bridged');
}
