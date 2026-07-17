import { describe, it, expect } from 'vitest';
import { connectorRegistry } from '@/connect/ConnectorRegistry';
import { tokenVault } from '@/connect/TokenVault';
import { triggerRouter } from '@/connect/TriggerRouter';

describe('Native Connect System (ANUBIS + PHOENIX)', () => {
  it('debe registrar un conector OAuth', () => {
    const connector = connectorRegistry.register({
      uid: 'slack/rdm-community',
      type: 'oauth',
      name: 'Slack RDM Community',
      auth: {
        clientId: 'test-client',
        clientSecret: 'test-secret',
        tokenEndpoint: 'https://slack.com/api/oauth.token',
        authorizationEndpoint: 'https://slack.com/oauth/authorize',
        redirectUri: 'https://rdm.app/connect/callback',
        scopes: ['chat:write', 'users:read'],
      },
    });

    expect(connector.uid).toBe('slack/rdm-community');
    expect(connectorRegistry.get('slack/rdm-community')).toBeDefined();
  });

  it('debe emitir token desde TokenVault', async () => {
    const connector = connectorRegistry.get('slack/rdm-community')!;
    const response = await tokenVault.issue(connector, { type: 'app' }, ['chat:write']);

    expect(response.token).toBeDefined();
    expect(response.expiresAt).toBeGreaterThan(Date.now());
    expect(response.connector.uid).toBe('slack/rdm-community');
  });

  it('debe verificar token emitido', async () => {
    const connector = connectorRegistry.get('slack/rdm-community')!;
    const { token } = await tokenVault.issue(connector, { type: 'user', id: 'test-user' }, ['users:read']);

    const record = await tokenVault.verify(token);
    expect(record).not.toBeNull();
    expect(record!.subject).toEqual({ type: 'user', id: 'test-user' });
  });

  it('debe revocar token', async () => {
    const connector = connectorRegistry.get('slack/rdm-community')!;
    const { token } = await tokenVault.issue(connector, { type: 'app' });

    const before = await tokenVault.verify(token);
    expect(before).not.toBeNull();

    const tokenId = before!.id;
    const revoked = await tokenVault.revoke(tokenId);
    expect(revoked).toBe(true);

    const after = await tokenVault.verify(token);
    expect(after).toBeNull();
  });

  it('debe rechazar token para conector inexistente', async () => {
    const result = await connectorRegistry.getToken('slack/nonexistent', { type: 'app' });
    expect(result).toBeNull();
  });

  it('debe registrar destino de trigger en PHOENIX', () => {
    triggerRouter.register({
      id: 'trig-rdm-slack-events',
      project: 'rdm-digital-hub',
      branch: 'main',
      path: '/api/slack-events',
      environment: 'production',
    });

    const destinations = triggerRouter.list();
    expect(destinations.length).toBeGreaterThan(0);
    expect(destinations.some(d => d.id === 'trig-rdm-slack-events')).toBe(true);
  });

  it('debe reenviar eventos trigger', async () => {
    await triggerRouter.forward({
      id: 'evt-test-001',
      type: 'slack:message',
      connectorUid: 'slack/rdm-community',
      payload: { text: 'hola mundo' },
      timestamp: new Date().toISOString(),
    });
  });

  it('debe reportar estadísticas', () => {
    const vaultStats = tokenVault.getStats();
    expect(vaultStats.activeTokens).toBeGreaterThanOrEqual(0);

    const registryStats = connectorRegistry.getStats();
    expect(registryStats.totalConnectors).toBeGreaterThanOrEqual(1);
  });
});
