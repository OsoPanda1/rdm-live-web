import type { ConnectorConfig, ConnectorType, Installation, ConnectTokenRequest, ConnectTokenResponse } from './types';
import { federationBus } from '@/federaciones/FederationBus';
import { tokenVault } from './TokenVault';
import { logger } from '@/lib/logger';

class ConnectorRegistry {
  private connectors = new Map<string, ConnectorConfig>();

  register(config: Omit<ConnectorConfig, 'createdAt'>): ConnectorConfig {
    const full: ConnectorConfig = { ...config, createdAt: Date.now() };
    this.connectors.set(config.uid, full);

    federationBus.emit({
      type: 'CONNECTOR_REGISTERED',
      source: 'ANUBIS',
      payload: { uid: config.uid, type: config.type, name: config.name },
      traceId: `conn-reg-${config.uid}`,
    });

    return full;
  }

  get(uid: string): ConnectorConfig | undefined {
    return this.connectors.get(uid);
  }

  unregister(uid: string): boolean {
    const ok = this.connectors.delete(uid);
    if (ok) {
      federationBus.emit({
        type: 'CONNECTOR_UNREGISTERED',
        source: 'ANUBIS',
        payload: { uid },
        traceId: `conn-unreg-${uid}`,
      });
    }
    return ok;
  }

  async getToken(
    connectorUid: string,
    subject: ConnectTokenRequest['subject'],
    options?: { scopes?: string[]; installationId?: string },
  ): Promise<ConnectTokenResponse | null> {
    const connector = this.connectors.get(connectorUid);
    if (!connector) return null;

    federationBus.emit({
      type: 'TOKEN_REQUESTED',
      source: 'ANUBIS',
      payload: { connectorUid, subjectType: subject.type },
      traceId: `tok-req-${connectorUid}-${Date.now()}`,
    });

    return tokenVault.issue(connector, subject, options?.scopes, options?.installationId);
  }

  addInstallation(connectorUid: string, installation: Installation): void {
    const connector = this.connectors.get(connectorUid);
    if (!connector) {
      logger.warn(`[ConnectorRegistry] Connector ${connectorUid} not found`);
      return;
    }
    connector.installations = connector.installations ?? [];
    connector.installations.push(installation);

    federationBus.emit({
      type: 'INSTALLATION_ADDED',
      source: 'ANUBIS',
      payload: { connectorUid, installationId: installation.id, tenantId: installation.tenantId },
      traceId: `inst-${installation.id}`,
    });
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
