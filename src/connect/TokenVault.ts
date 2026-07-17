import type { TokenRecord, ConnectSubject, ConnectTokenResponse, ConnectorConfig } from './types';
import { federationBus } from '@/federaciones/FederationBus';

async function hashToken(token: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

class TokenVault {
  private records = new Map<string, TokenRecord>();

  async issue(
    connector: ConnectorConfig,
    subject: ConnectSubject,
    scopes: string[] = [],
    installationId?: string,
  ): Promise<ConnectTokenResponse> {
    const raw = `${connector.uid}:${Date.now()}:${crypto.randomUUID().replace(/-/g, '')}`;
    const id = `tok-${(await hashToken(raw)).slice(0, 12)}`;
    const expiresAt = Date.now() + 3600_000;

    const record: TokenRecord = {
      id,
      connectorUid: connector.uid,
      subject,
      tokenHash: await hashToken(raw),
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
    const h = await hashToken(token);
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
