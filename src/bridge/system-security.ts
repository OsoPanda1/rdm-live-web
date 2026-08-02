import { shutdownProtocol, contextIsolation } from '@/security';
import { safeBus as eventBus } from '@/core/infra/event-bus';
import { publish, subscribe } from '@/core/events/bus';
import { logger } from '@/lib/logger';

// Constantes de eventos y modos para evitar cadenas mágicas
const SYSTEM_EVENTS = {
  MODE_CHANGED: 'rdm.system.mode-changed.v1',
  SECURITY_ISOLATE: 'rdm:security:isolate',
} as const;

const SYSTEM_MODES = {
  EMERGENCY: 'EMERGENCY',
} as const;

// Interfaces y Type Guards para validación segura en tiempo de ejecución
interface ModeChangedPayload {
  mode: string;
}

interface SecurityIsolatePayload {
  contextId: string;
}

function isModeChangedPayload(payload: unknown): payload is ModeChangedPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'mode' in payload &&
    typeof (payload as ModeChangedPayload).mode === 'string'
  );
}

function isSecurityIsolatePayload(payload: unknown): payload is SecurityIsolatePayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'contextId' in payload &&
    typeof (payload as SecurityIsolatePayload).contextId === 'string'
  );
}

let connected = false;

/**
 * Conecta los listeners de seguridad del sistema de forma idempotente y segura.
 */
export function connectSystemSecurity(): void {
  if (connected) {
    logger.warn('[BRIDGE:SECURITY] Intento de reconexión ignorado (ya conectado)');
    return;
  }

  connected = true;

  // Suscripción al cambio de modo del sistema
  subscribe(SYSTEM_EVENTS.MODE_CHANGED, (event) => {
    try {
      if (!isModeChangedPayload(event.payload)) {
        logger.error('[BRIDGE:SECURITY] Payload inválido recibido en mode-changed', { payload: event.payload });
        return;
      }

      const { mode } = event.payload;

      if (mode === SYSTEM_MODES.EMERGENCY) {
        shutdownProtocol.engage({
          level: 'SYSTEM',
          reason: 'Modo EMERGENCY activado por core',
        });
        logger.warn('[BRIDGE:SECURITY] Shutdown protocol activado por modo EMERGENCY');
      }
    } catch (error) {
      logger.error('[BRIDGE:SECURITY] Error procesando evento mode-changed', { error });
    }
  });

  // Suscripción al aislamiento de contexto por evento de bus
  eventBus.on(SYSTEM_EVENTS.SECURITY_ISOLATE, async (payload: unknown) => {
    try {
      if (!isSecurityIsolatePayload(payload)) {
        logger.error('[BRIDGE:SECURITY] Payload inválido recibido en security:isolate', { payload });
        return;
      }

      const { contextId } = payload;
      
      await contextIsolation.isolate(contextId);
      logger.info('[BRIDGE:SECURITY] Contexto aislado exitosamente por evento', { contextId });
    } catch (error) {
      logger.error('[BRIDGE:SECURITY] Error crítico al intentar aislar contexto', { error });
    }
  });

  logger.info('[BRIDGE:SECURITY] Bridge de seguridad conectado correctamente');
}
