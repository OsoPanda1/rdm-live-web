import { describe, it, expect } from 'vitest';
import { orion } from '@/isabella/skills/orion';
import { sophia } from '@/isabella/skills/sophia';
import { argus } from '@/isabella/skills/argus';
import { mnemos } from '@/isabella/skills/mnemos';
import { lumen } from '@/isabella/skills/lumen';

describe('ISA-API Skills Integration', () => {
  it('ORION debe buscar artefactos de conocimiento', async () => {
    const result = await orion.search(
      { contextId: 'test', query: 'Real del Monte minería', scopes: ['territorial'] },
      { userId: 'test', sessionId: 's1', isAuthenticated: false, permissions: [] },
    );
    expect(result.artifacts.length).toBeGreaterThan(0);
    expect(result.relations).toBeDefined();
  });

  it('SOPHIA debe sintetizar investigación', async () => {
    const result = await sophia.research(
      { researchRequest: 'Historia minera de Real del Monte', sources: ['test'], depthLevel: 1, constraints: {} },
      { userId: 'test', sessionId: 's1', isAuthenticated: false, permissions: [], traceId: 'test-trace' },
    );
    expect(result.summary).toBeDefined();
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it('ARGUS debe simular escenarios', async () => {
    const result = await argus.simulate(
      { scenarioDefinition: { action: 'abrir_tienda', domain: 'campana_turistica', target: 'RDM', parameters: {} }, timeHorizon: 'corto', dimensions: ['cultural', 'economic'], constraints: {} },
      { userId: 'test', sessionId: 's1', isAuthenticated: false, permissions: [], traceId: 'test-trace' },
    );
    expect(result.simulations.length).toBeGreaterThan(0);
    expect(result.riskProfile).toBeDefined();
  });

  it('MNEMOS debe tener estadísticas de canon', () => {
    const stats = mnemos.getStats();
    expect(stats.totalEntries).toBeGreaterThanOrEqual(0);
    expect(stats.categories).toBeDefined();
  });

  it('LUMEN debe evaluar acciones contra la constitución', async () => {
    const result = await lumen.evaluate(
      {
        actionRequest: { actionId: 'test-1', actionType: 'test', target: 'system', payload: {}, initiatedBy: 'test' },
        policyContext: { applicablePolicies: ['lumen-001'], riskLevel: 'bajo' },
      },
      { userId: 'test', sessionId: 's1', isAuthenticated: false, permissions: [], traceId: 'test-trace', timestamp: new Date() },
    );
    expect(result.decision).toBeDefined();
    expect(result.violations).toBeDefined();
  });
});
