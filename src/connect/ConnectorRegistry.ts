import type { ConnectorConfig, ConnectorType, Installation, ConnectTokenRequest, ConnectTokenResponse } from './types';
<<<<<<< Updated upstream
import { federationBus } from '@/federaciones/FederationBus';
=======
>>>>>>> Stashed changes
import { tokenVault } from './TokenVault';
import { logger } from '@/lib/logger';

class ConnectorRegistry {
  private connectors = new Map<string, ConnectorConfig>();

  register(config: Omit<ConnectorConfig, 'createdAt'>): ConnectorConfig {
    const full: ConnectorConfig = { ...config, createdAt: Date.now() };
    this.connectors.set(config.uid, full);
<<<<<<< Updated upstream

    federationBus.emit({
      type: 'CONNECTOR_REGISTERED',
      source: 'ANUBIS',
      payload: { uid: config.uid, type: config.type, name: config.name },
      traceId: `conn-reg-${config.uid}`,
    });

=======
    logger.info("[CONNECTOR] Registrado", { uid: config.uid, type: config.type, name: config.name });
>>>>>>> Stashed changes
    return full;
  }

  get(uid: string): ConnectorConfig | undefined {
    return this.connectors.get(uid);
  }

  unregister(uid: string): boolean {
    const ok = this.connectors.delete(uid);
<<<<<<< Updated upstream
    if (ok) {
      federationBus.emit({
        type: 'CONNECTOR_UNREGISTERED',
        source: 'ANUBIS',
        payload: { uid },
        traceId: `conn-unreg-${uid}`,
      });
    }
=======
    if (ok) logger.info("[CONNECTOR] Desregistrado", { uid });
>>>>>>> Stashed changes
    return ok;
  }

  async getToken(
    connectorUid: string,
    subject: ConnectTokenRequest['subject'],
    options?: { scopes?: string[]; installationId?: string },
  ): Promise<ConnectTokenResponse | null> {
    const connector = this.connectors.get(connectorUid);
    if (!connector) return null;
<<<<<<< Updated upstream

    federationBus.emit({
      type: 'TOKEN_REQUESTED',
      source: 'ANUBIS',
      payload: { connectorUid, subjectType: subject.type },
      traceId: `tok-req-${connectorUid}-${Date.now()}`,
    });

=======
>>>>>>> Stashed changes
    return tokenVault.issue(connector, subject, options?.scopes, options?.installationId);
  }

  addInstallation(connectorUid: string, installation: Installation): void {
    const connector = this.connectors.get(connectorUid);
    if (!connector) {
<<<<<<< Updated upstream
      logger.warn(`[ConnectorRegistry] Connector ${connectorUid} not found`);
=======
      logger.warn(`[CONNECTOR] ${connectorUid} no encontrado`);
>>>>>>> Stashed changes
      return;
    }
    connector.installations = connector.installations ?? [];
    connector.installations.push(installation);
<<<<<<< Updated upstream

    federationBus.emit({
      type: 'INSTALLATION_ADDED',
      source: 'ANUBIS',
      payload: { connectorUid, installationId: installation.id, tenantId: installation.tenantId },
      traceId: `inst-${installation.id}`,
    });
=======
>>>>>>> Stashed changes
  }

  list(): ConnectorConfig[] {
    return Array.from(this.connectors.values());
  }

  getStats() {
    return {
      totalConnectors: this.connectors.size,
      connectorTypes: Array.from(new Set(Array.from(this.connectors.values()).map(c => c.type))),
    };
  }
}

export const connectorRegistry = new ConnectorRegistry();
