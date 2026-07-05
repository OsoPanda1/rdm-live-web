// ============================================================================
// YUN Manifest Artifacts — genera JSON derivados para observabilidad
// ============================================================================

import {
  RDMX_MODULES,
  type RepoModule,
  type YunDomain,
  type FederationId,
  type ResilienceMode,
  type CriticalityLevel,
} from "./rdmxManifest";

// ─── Types ──────────────────────────────────────────────────────────────────

interface YunAccessMatrixEntry {
  moduleId: string;
  yunDomain: YunDomain | null;
  federation: FederationId | null;
  sensitivity: "P0" | "P1" | "P2";
  criticality: CriticalityLevel;
}

interface YunEventsMapEntry {
  moduleId: string;
  produces: string[];
  consumes: string[];
}

interface FederationResilienceEntry {
  federation: FederationId;
  modules: {
    id: string;
    supportedModes: ResilienceMode[];
  }[];
}

interface YunModuleSummary {
  totalModules: number;
  byDomain: Record<string, number>;
  byFederation: Record<string, number>;
  bySensitivity: Record<string, number>;
  byCriticality: Record<string, number>;
  byStatus: Record<string, number>;
}

// ─── Generadores ────────────────────────────────────────────────────────────

export const buildYunAccessMatrix = (
  modules: RepoModule[],
): YunAccessMatrixEntry[] =>
  modules.map((m) => ({
    moduleId: m.id,
    yunDomain: m.yun.domain,
    federation: m.yun.federation,
    sensitivity: m.yun.sensitivity,
    criticality: m.criticality,
  }));

export const buildYunEventsMap = (
  modules: RepoModule[],
): YunEventsMapEntry[] =>
  modules.map((m) => ({
    moduleId: m.id,
    produces: m.yun.events.produces,
    consumes: m.yun.events.consumes,
  }));

export const buildFederationResilience = (
  modules: RepoModule[],
): FederationResilienceEntry[] => {
  const byFed = new Map<FederationId, FederationResilienceEntry>();

  for (const m of modules) {
    const fed = m.yun.federation;
    if (!fed) continue;

    if (!byFed.has(fed)) {
      byFed.set(fed, { federation: fed, modules: [] });
    }

    byFed.get(fed)!.modules.push({
      id: m.id,
      supportedModes: m.yun.resilience.supportedModes,
    });
  }

  return Array.from(byFed.values());
};

export const buildYunModuleSummary = (
  modules: RepoModule[],
): YunModuleSummary => {
  const byDomain: Record<string, number> = {};
  const byFederation: Record<string, number> = {};
  const bySensitivity: Record<string, number> = {};
  const byCriticality: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const m of modules) {
    const d = m.yun.domain ?? "none";
    byDomain[d] = (byDomain[d] ?? 0) + 1;

    const f = m.yun.federation ?? "none";
    byFederation[f] = (byFederation[f] ?? 0) + 1;

    bySensitivity[m.yun.sensitivity] =
      (bySensitivity[m.yun.sensitivity] ?? 0) + 1;
    byCriticality[m.criticality] =
      (byCriticality[m.criticality] ?? 0) + 1;
    byStatus[m.status] = (byStatus[m.status] ?? 0) + 1;
  }

  return {
    totalModules: modules.length,
    byDomain,
    byFederation,
    bySensitivity,
    byCriticality,
    byStatus,
  };
};

// ─── Export all artifacts as a single object ────────────────────────────────

export const generateAllArtifacts = () => ({
  accessMatrix: buildYunAccessMatrix(RDMX_MODULES),
  eventsMap: buildYunEventsMap(RDMX_MODULES),
  federationResilience: buildFederationResilience(RDMX_MODULES),
  summary: buildYunModuleSummary(RDMX_MODULES),
});
