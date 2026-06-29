// ============================================================================
// RDM Digital OS — Digital Twin Engine v3
// Tourism twins, semantic models, XR/WebGPU scenes, Chronus & Decision adapters
// ============================================================================

import { db, type BusinessRecord } from "../lib/store.js";
import {
  chronusEngine,
  type ContextoCivilizatorio,
  type SaturationResult,
} from "../domain/chronus-engine.js";
import {
  decisionStore,
  type DecisionStore,
  type DecisionStoreSaveInput,
} from "../core/decision-store.js";

// ---------------------------------------------------------------------------
// 1. Domain types
// ---------------------------------------------------------------------------

export type TwinSource =
  | "azure-dtdl"
  | "azure-explorer"
  | "eclipse-ditto"
  | "awsim"
  | "forge-digital-twin"
  | "facechain"
  | "awesome-digital-twins";

export interface TwinCapability {
  id: string;
  name: string;
  source: TwinSource;
  description: string;
}

export interface TwinPropertySchema {
  name: string;
  schema: "string" | "integer" | "double" | "boolean";
  writable: boolean;
}

export interface TwinTelemetrySchema {
  name: string;
  schema: "double" | "integer";
  unit?: "percent" | "minute" | "count";
}

export interface TwinModel {
  id: string;
  displayName: string;
  description: string;
  dtdlContext: string;
  semanticType: string;
  properties: TwinPropertySchema[];
  telemetry: TwinTelemetrySchema[];
  capabilities: TwinCapability[];
}

// ---------------------------------------------------------------------------
// 2. Scene system (WebGL/WebXR/WebGPU) + factory
// ---------------------------------------------------------------------------

export type TwinRenderer = "webgl" | "webxr" | "webgpu";
export type TwinStylePreset = "heritage" | "festival" | "nature";

export interface TwinSceneProfile {
  renderer: TwinRenderer;
  stylePreset: TwinStylePreset;
  pbr: boolean;
  hdri: string;
  postprocess: string[];
  webgpuPreferred?: boolean;
  xrRequired?: boolean;
}

export interface SceneFactoryOptions {
  category?: string;
  allowExperimentalWebGPU?: boolean;
}

const BASE_SCENE: TwinSceneProfile = {
  renderer: "webgl",
  stylePreset: "heritage",
  pbr: true,
  hdri: "silver-mist",
  postprocess: ["bloom"],
};

const SCENE_PRESETS: Readonly<Record<string, TwinSceneProfile>> = {
  cultura: {
    renderer: "webxr",
    stylePreset: "heritage",
    pbr: true,
    hdri: "silver-dawn",
    postprocess: ["bloom", "ambient-occlusion"],
    xrRequired: false,
  },
  gastronomia: {
    renderer: "webgl",
    stylePreset: "festival",
    pbr: true,
    hdri: "golden-evening",
    postprocess: ["color-grading"],
  },
  ecoturismo: {
    renderer: "webxr",
    stylePreset: "nature",
    pbr: true,
    hdri: "misty-forest",
    postprocess: ["volumetric-fog", "ssr"],
    xrRequired: false,
  },
};

/**
 * Detecta si el entorno actual soporta WebGPU de forma segura.
 */
function canUseWebGPU(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return false;
  }
  return "gpu" in navigator;
}

/**
 * Fábrica de escenas para twins con valores seguros por defecto.
 */
export function createTwinSceneProfile(
  opts: SceneFactoryOptions = {},
): TwinSceneProfile {
  const base =
    (opts.category && SCENE_PRESETS[opts.category]) || BASE_SCENE;

  const allowWebGPU = opts.allowExperimentalWebGPU === true && canUseWebGPU();

  if (!allowWebGPU) {
    return { ...base, webgpuPreferred: false };
  }

  return {
    ...base,
    renderer: "webgpu",
    webgpuPreferred: true,
  };
}

// ---------------------------------------------------------------------------
// 3. Twin instance model
// ---------------------------------------------------------------------------

export type TwinWeather = "clear" | "rain" | "fog";

export interface TwinState {
  desired: Record<string, string | number | boolean>;
  reported: Record<string, string | number | boolean>;
  telemetry: {
    occupancy: number;
    avgStayMinutes: number;
    queueMinutes: number;
    [key: string]: number;
  };
}

export interface TwinGraphLinks {
  incoming: string[];
  outgoing: string[];
}

export type TwinAvatarStyle = "realista" | "cinematico";

export interface TwinGuideAvatar {
  style: TwinAvatarStyle;
  locale: "es-MX";
  voice: string;
}

export interface TwinInstance {
  id: string;
  modelId: string;
  businessId: string;
  name: string;
  tags: string[];
  state: TwinState;
  scene: TwinSceneProfile;
  graph: TwinGraphLinks;
  guideAvatar: TwinGuideAvatar;
  updatedAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// 4. Semantic model(s)
// ---------------------------------------------------------------------------

const twinModels: readonly TwinModel[] = [
  {
    id: "dtmi:rdmx:tourism:heritage.poi;1",
    displayName: "Heritage Point of Interest",
    description:
      "Modelo semántico para minas, museos, plazas y parroquias históricas.",
    dtdlContext: "dtmi:dtdl:context;3",
    semanticType: "rdmx:tourism:poi",
    properties: [
      { name: "status", schema: "string", writable: true },
      { name: "capacity", schema: "integer", writable: true },
      { name: "weatherSensitivity", schema: "double", writable: false },
    ],
    telemetry: [
      { name: "occupancy", schema: "double", unit: "percent" },
      { name: "avgStayMinutes", schema: "double", unit: "minute" },
      { name: "queueMinutes", schema: "double", unit: "minute" },
    ],
    capabilities: [
      {
        id: "semantic-modeling",
        name: "Modelado semántico DTDL",
        source: "azure-dtdl",
        description:
          "Contratos de propiedades y telemetría validados por tipo.",
      },
      {
        id: "graph-navigation",
        name: "Navegación de grafo",
        source: "azure-explorer",
        description:
          "Relaciones visibles entre comercios, rutas y eventos.",
      },
      {
        id: "policy-sync",
        name: "Shadow desired/reported",
        source: "eclipse-ditto",
        description:
          "Sincroniza estado deseado vs observado para auditoría operativa.",
      },
      {
        id: "scene-rendering",
        name: "Pipeline visual inmersivo",
        source: "forge-digital-twin",
        description: "Perfil visual con PBR/HDRI para contexto turístico.",
      },
      {
        id: "avatar-guide",
        name: "Guía avatar personalizada",
        source: "facechain",
        description:
          "Define estilo visual y voz del guía Realito para cada gemelo.",
      },
      {
        id: "scenario-simulation",
        name: "Simulación de escenarios",
        source: "awsim",
        description:
          "Ensaya clima/flujo de visitantes para ajuste de rutas.",
      },
      {
        id: "federated-catalog",
        name: "Catálogo de capacidades",
        source: "awesome-digital-twins",
        description:
          "Base para incorporar conectores y frameworks futuros.",
      },
    ],
  },
] as const;

// ---------------------------------------------------------------------------
// 5. Public API: list models / ensure & list twins
// ---------------------------------------------------------------------------

export function listTwinModels(): readonly TwinModel[] {
  return twinModels;
}

export function ensureBusinessTwin(business: BusinessRecord): TwinInstance {
  const existing = [...db.digitalTwins.values()].find(
    (twin) => twin.businessId === business.id,
  ) as TwinInstance | undefined;

  if (existing) return existing;

  const id = `twin-${business.id}`;
  const now = new Date().toISOString();

  const twin: TwinInstance = {
    id,
    modelId: twinModels[0].id,
    businessId: business.id,
    name: business.name,
    tags: [business.category, "real-del-monte"],
    state: {
      desired: {
        status: "open",
        targetOccupancy: 70,
      },
      reported: {
        status: business.isActive ? "open" : "closed",
      },
      telemetry: {
        occupancy: 25,
        avgStayMinutes: 35,
        queueMinutes: 5,
      },
    },
    scene: createTwinSceneProfile({
      category: business.category,
      allowExperimentalWebGPU: true,
    }),
    graph: {
      incoming: ["destination-real-del-monte"],
      outgoing: ["route-centro-historico", `business-${business.id}`],
    },
    guideAvatar: {
      style: "realista",
      locale: "es-MX",
      voice: "realito-mercurio",
    },
    updatedAt: now,
  };

  db.digitalTwins.set(id, twin);
  return twin;
}

export function listTwinInstances(): TwinInstance[] {
  return [...db.digitalTwins.values()] as TwinInstance[];
}

// ---------------------------------------------------------------------------
// 6. Scenario simulation & operational score
// ---------------------------------------------------------------------------

export interface TwinScenarioInput {
  twinId: string;
  weather: TwinWeather;
  projectedVisitors: number;
}

export interface TwinScenarioResult {
  twin: TwinInstance;
  occupancy: number;
  queueMinutes: number;
}

function computeWeatherPenalty(weather: TwinWeather): number {
  switch (weather) {
    case "rain":
      return -15;
    case "fog":
      return -8;
    case "clear":
    default:
      return 0;
  }
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

/**
 * Simula un escenario de clima/visitantes sobre un twin
 * y actualiza su telemetría.
 */
export function simulateTwinScenario(
  input: TwinScenarioInput,
): TwinScenarioResult | null {
  const twin = db.digitalTwins.get(input.twinId) as TwinInstance | undefined;
  if (!twin) {
    return null;
  }

  const penalty = computeWeatherPenalty(input.weather);
  const rawOccupancy = (input.projectedVisitors / 120) * 100 + penalty;
  const occupancy = clampPercent(rawOccupancy);
  const queueMinutes = Math.max(0, Math.round(occupancy / 6));

  twin.state.telemetry.occupancy = Number(occupancy.toFixed(2));
  twin.state.telemetry.queueMinutes = queueMinutes;
  twin.state.reported.status = occupancy > 90 ? "saturated" : "open";
  twin.updatedAt = new Date().toISOString();

  const eventId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `twin-event-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  db.twinEvents.set(eventId, {
    id: eventId,
    twinId: twin.id,
    kind: "scenario_simulation",
    payload: {
      weather: input.weather,
      projectedVisitors: input.projectedVisitors,
      occupancy: twin.state.telemetry.occupancy,
      queueMinutes,
    },
    createdAt: new Date().toISOString(),
  });

  return { twin, occupancy, queueMinutes };
}

/**
 * Calcula un score operativo 0–5 basado en ocupación y fila.
 */
export function computeTwinOperationalScore(
  twin: TwinInstance | undefined,
): number {
  if (!twin) return 0;

  const occupancy = twin.state.telemetry.occupancy ?? 0;
  const queue = twin.state.telemetry.queueMinutes ?? 0;
  const experience = Math.max(0, 100 - occupancy * 0.4 - queue * 1.8);
  return Number((experience / 20).toFixed(2));
}

// ---------------------------------------------------------------------------
// 7. Chronus adapter: Twin → SaturationResult
// ---------------------------------------------------------------------------

export interface TwinChronusContext {
  civilizatorio: ContextoCivilizatorio;
  activosEnZona: number;
}

export interface TwinChronusAdapterConfig {
  highSensitivityWeatherMultiplier: number;
  scenarioSimulationEventId: string;
}

export class TwinChronusAdapter {
  private readonly chronus: typeof chronusEngine;
  private readonly config: TwinChronusAdapterConfig;

  constructor(config: TwinChronusAdapterConfig, engine = chronusEngine) {
    this.chronus = engine;
    this.config = config;
  }

  private hasCapability(model: TwinModel, id: TwinCapability["id"]): boolean {
    return model.capabilities.some((c) => c.id === id);
  }

  private buildContextForTwin(
    twin: TwinInstance,
    model: TwinModel,
    base: TwinChronusContext,
  ): TwinChronusContext {
    let adjusted = { ...base };

    if (this.hasCapability(model, "scenario-simulation")) {
      if (
        !adjusted.civilizatorio.eventos_activos.includes(
          this.config.scenarioSimulationEventId,
        )
      ) {
        adjusted.civilizatorio = {
          ...adjusted.civilizatorio,
          eventos_activos: [
            ...adjusted.civilizatorio.eventos_activos,
            this.config.scenarioSimulationEventId,
          ],
        };
      }
    }

    const weatherSensitivity =
      typeof twin.state.desired["weatherSensitivity"] === "number"
        ? (twin.state.desired["weatherSensitivity"] as number)
        : typeof twin.state.reported["weatherSensitivity"] === "number"
        ? (twin.state.reported["weatherSensitivity"] as number)
        : 1;

    if (weatherSensitivity > 1.0) {
      adjusted = {
        ...adjusted,
        activosEnZona: Math.round(
          adjusted.activosEnZona * this.config.highSensitivityWeatherMultiplier,
        ),
      };
    }

    return adjusted;
  }

  public calcularSaturacionParaTwin(
    twin: TwinInstance,
    model: TwinModel,
    baseContext: TwinChronusContext,
  ): SaturationResult {
    const adjusted = this.buildContextForTwin(twin, model, baseContext);

    return this.chronus.calcularSaturacionZonal(
      twin.id,
      adjusted.civilizatorio,
      adjusted.activosEnZona,
    );
  }
}

// ---------------------------------------------------------------------------
// 8. Decision adapter: TwinScenarioResult → DecisionStore
// ---------------------------------------------------------------------------

export type DecisionEventKind =
  | "ROUTING"
  | "PRIORITIZATION"
  | "ALERTING"
  | "RECOMMENDATION";

export interface TwinDecisionAdapterConfig {
  defaultTerritoryId: string;
  decisionKind: DecisionEventKind;
}

export class TwinScenarioDecisionAdapter {
  private readonly store: DecisionStore;
  private readonly config: TwinDecisionAdapterConfig;

  constructor(
    store: DecisionStore,
    config: TwinDecisionAdapterConfig,
  ) {
    this.store = store;
    this.config = config;
  }

  private buildTraceId(twin: TwinInstance): string {
    return `twin-sim-${twin.id}-${Date.now()}`;
  }

  public recordScenarioDecision(result: TwinScenarioResult): string {
    const { twin, occupancy, queueMinutes } = result;

    const operationalScore = computeTwinOperationalScore(twin);
    const territoryId = this.config.defaultTerritoryId;
    const traceId = this.buildTraceId(twin);

    const saveInput: DecisionStoreSaveInput = {
      traceId,
      intent: "twin_scenario_simulation",
      score: operationalScore / 5,
      territory: territoryId,
      metadata: {
        kind: this.config.decisionKind,
        source: "digital-twin-engine",
        notes: `Simulación para twin ${twin.id} con ocupación ${occupancy.toFixed(
          1,
        )}% y fila ${queueMinutes} min.`,
      },
    };

    this.store.save(saveInput);
    return traceId;
  }
}

// ---------------------------------------------------------------------------
// 9. DTDL validation service contract
// ---------------------------------------------------------------------------

export interface DtdlValidationIssue {
  code: "ERROR" | "WARNING";
  path: string;
  message: string;
}

export interface DtdlValidationResult {
  valid: boolean;
  issues: DtdlValidationIssue[];
}

export interface DtdlValidationService {
  validateRawModel(dtdlJson: string): Promise<DtdlValidationResult>;
  validateTwinModel(model: TwinModel): Promise<DtdlValidationResult>;
}

export class NoopDtdlValidationService implements DtdlValidationService {
  async validateRawModel(): Promise<DtdlValidationResult> {
    return { valid: true, issues: [] };
  }

  async validateTwinModel(): Promise<DtdlValidationResult> {
    return { valid: true, issues: [] };
  }
}

// ---------------------------------------------------------------------------
// 10. Shared singletons/config
// ---------------------------------------------------------------------------

export const twinChronusAdapter = new TwinChronusAdapter({
  highSensitivityWeatherMultiplier: 1.2,
  scenarioSimulationEventId: "twin-scenario-simulation",
});

export const twinScenarioDecisionAdapter = new TwinScenarioDecisionAdapter(
  decisionStore,
  {
    defaultTerritoryId: "real-del-monte",
    decisionKind: "PRIORITIZATION",
  },
);

export const dtdlValidationService = new NoopDtdlValidationService();
