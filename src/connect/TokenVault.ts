import type { TokenRecord, ConnectSubject, ConnectTokenResponse, ConnectorConfig } from './types';
import { federationBus } from '@/federaciones/FederationBus';

function hashToken(token: string): string {
  let h = 0;
  for (let i = 0; i < token.length; i++) {
    h = ((h << 5) - h) + token.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h).toString(16).padStart(16, '0');
}

class TokenVault {
  private records = new Map<string, TokenRecord>();

  async issue(
    connector: ConnectorConfig,
    subject: ConnectSubject,
    scopes: string[] = [],
    installationId?: string,
  ): Promise<ConnectTokenResponse> {
    const raw = `${connector.uid}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const id = `tok-${hashToken(raw).slice(0, 12)}`;
    const expiresAt = Date.now() + 3600_000;

    const record: TokenRecord = {
      id,
      connectorUid: connector.uid,
      subject,
      tokenHash: hashToken(raw),
      expiresAt,
      scopes,
      installationId,
      createdAt: Date.now(),
    };
    this.records.set(id, record);

    federationBus.emit({
      type: 'TOKEN_ISSUED',
      source: 'ANUBIS',
      payload: { tokenId: id, connectorUid: connector.uid, subject: subject.type, scopes },
      traceId: id,
    });

    return {
      token: raw,
      expiresAt,
      connector: { uid: connector.uid, type: connector.type, name: connector.name },
      installationId,
    };
  }

  async verify(token: string): Promise<TokenRecord | null> {
    const h = hashToken(token);
    for (const record of this.records.values()) {
      if (record.tokenHash === h && record.expiresAt > Date.now()) {
        return record;
      }
    }
    return null;
  }

  async revoke(tokenId: string): Promise<boolean> {
    const ok = this.records.delete(tokenId);
    if (ok) {
      federationBus.emit({
        type: 'TOKEN_REVOKED',
        source: 'ANUBIS',
        payload: { tokenId },
        traceId: `revoke-${tokenId}`,
      });
    }
    return ok;
  }

  getStats() {
    return {
      activeTokens: this.records.size,
      expiredTokens: Array.from(this.records.values()).filter(r => r.expiresAt <= Date.now()).length,
    };
  }
}

export const tokenVault = new TokenVault();
