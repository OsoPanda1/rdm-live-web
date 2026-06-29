export type Telemetry = {
  crowdLevel?: number;
  weather?: string;
  openStatus?: boolean;
  flowIndex?: number;
  avgStayMinutes?: number;
  queueMinutes?: number;
  [key: string]: unknown;
};

export type TwinProperties = {
  immersion?: "L1" | "L2" | "L3";
  type?: string;
  category?: string;
  narrative?: string;
  visibilityFlags?: string[];
  [key: string]: unknown;
};

export type TwinType = "PLACE_TWIN" | "MERCHANT_TWIN" | "ROUTE_TWIN" | "AGENT_TWIN";

export type TwinContext = {
  id: string;
  modelType: TwinType;
  sourceId: string;
  name: string;
  lat: number;
  lng: number;
  tags: string[];
  immersionLevel: number;
  popularityScore: number;
  telemetry: Telemetry;
  properties: TwinProperties;
};

export type UserPreferences = {
  durationHours?: number;
  availableMinutes?: number;
  favoriteType?: string;
  interests?: string[];
  maxCrowdLevel?: number;
  withChildren?: boolean;
  mobilityConstraints?: boolean;
  intensity?: "LOW" | "MEDIUM" | "HIGH";
};

export type ChatMessageDTO = {
  from: "user" | "realito";
  text: string;
};

export interface PlannedStop {
  twinId: string;
  name: string;
  order: number;
  etaMinutes: number;
  dwellMinutes: number;
  type: string;
  crowdLevel: number;
  immersion: string;
}

export interface RouteObjectives {
  distanceKm: number;
  diversityScore: number;
  crowdPenalty: number;
  merchantBalance: number;
  totalDurationMinutes: number;
}

export interface PlannedRoute {
  id: string;
  label: string;
  fitnessScore: number;
  confidenceScore: number;
  objectives: RouteObjectives;
  stops: PlannedStop[];
  geneticGen: string;
  explanation: string;
}

export type RealitoIntent =
  | "ROUTES"
  | "GASTRONOMY"
  | "HISTORY"
  | "ADVENTURE"
  | "EVENTS"
  | "CULTURE"
  | "COMMUNITY"
  | "HELP";

export interface SuggestedAction {
  label: string;
  action: string;
  payload?: Record<string, unknown>;
}

export interface RealitoChatResponse {
  reply: string;
  intent: RealitoIntent;
  suggestedActions: SuggestedAction[];
  gaSuggestion?: PlannedRoute | null;
  engine: string;
  visualStyle?: string;
  twinNodesQueried: number;
  interactionId?: string;
  trace?: {
    interactionId: string;
    source: string;
  };
}
