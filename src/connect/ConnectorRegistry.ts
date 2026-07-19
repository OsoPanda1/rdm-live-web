import type { ConnectorConfig, Installation, ConnectTokenRequest, ConnectTokenResponse } from './types';
import { federationBus } from '@/federaciones/FederationBus';
import { tokenVault } from './TokenVault';
import { logger } from '@/lib/logger';

class ConnectorRegistry {
  private readonly connectors = new Map<string, ConnectorConfig>();

  /**
   * Registra un conector. Lanza error si el ID ya existe para evitar sobrescrituras accidentales.
   */
  register(config: Omit<ConnectorConfig, 'createdAt'>): ConnectorConfig {
    if (this.connectors.has(config.uid)) {
      throw new Error(`[CONNECTOR] El UID ${config.uid} ya está registrado.`);
    }

    const full: ConnectorConfig = { ...config, createdAt: Date.now() };
    this.connectors.set(config.uid, Object.freeze(full));
    
    logger.info("[CONNECTOR] Registrado", { uid: config.uid, type: config.type });
    return full;
  }

  get(uid: string): ConnectorConfig | undefined {
    return this.connectors.get(uid);
  }

  unregister(uid: string): boolean {
    const ok = this.connectors.delete(uid);
    if (ok) logger.info("[CONNECTOR] Desregistrado", { uid });
    return ok;
  }

  /**
   * Refactorizado para manejar errores de forma limpia y tipada.
   */
  async getToken(
    connectorUid: string,
    subject: ConnectTokenRequest['subject'],
    options: { scopes?: string[]; installationId?: string } = {},
  ): Promise<ConnectTokenResponse | null> {
    const connector = this.connectors.get(connectorUid);
    
    if (!connector) {
      logger.error(`[CONNECTOR] Intento de acceso a inexistente: ${connectorUid}`);
      return null;
    }

    try {
      federationBus.emit({
        type: 'TOKEN_REQUESTED',
        source: 'ANUBIS',
        payload: { connectorUid, subjectType: subject.type },
        traceId: `tok-req-${connectorUid}-${Date.now()}`,
      });

      return await tokenVault.issue(connector, subject, options.scopes, options.installationId);
    } catch (err) {
      logger.error(`[CONNECTOR] Error emitiendo token para ${connectorUid}`, { err });
      return null;
    }
  }

  /**
   * Uso de inmutabilidad para actualizar instalaciones.
   */
  addInstallation(connectorUid: string, installation: Installation): void {
    const connector = this.connectors.get(connectorUid);
    
    if (!connector) {
      throw new Error(`[CONNECTOR] ${connectorUid} no encontrado`);
    }

    // Actualización inmutable para asegurar integridad del estado
    const updatedConnector = {
      ...connector,
      installations: [...(connector.installations ?? []), installation]
    };

    this.connectors.set(connectorUid, Object.freeze(updatedConnector));

    federationBus.emit({
      type: 'INSTALLATION_ADDED',
      source: 'ANUBIS',
      payload: { connectorUid, installationId: installation.id, tenantId: installation.tenantId },
      traceId: `inst-${installation.id}`,
    });
  }

  list(): readonly ConnectorConfig[] {
    return Object.freeze(Array.from(this.connectors.values()));
  }

  getStats() {
    const values = Array.from(this.connectors.values());
    return {
      totalConnectors: this.connectors.size,
      connectorTypes: Array.from(new Set(values.map((c) => c.type))),
    };
  }
}

export const connectorRegistry = new ConnectorRegistry();
