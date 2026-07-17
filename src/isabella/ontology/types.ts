export type FederationId = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ThemeId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type AbstractionLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface OntologyFederation {
  id: FederationId;
  code: string;
  name: string;
  description: string;
  chromaticRange: string[];
  hexPrimary: string;
  responsibility: string;
}

export interface OntologyTheme {
  id: ThemeId;
  code: string;
  name: string;
  description: string;
}

export interface OntologyNode {
  nodeId: string;
  parentNodeId: string | null;
  federationId: FederationId;
  themeId: ThemeId;
  nodeName: string;
  chromaticHex: string;
  abstractionLevel: AbstractionLevel;
  semanticRules: SemanticRules;
  createdAt: string;
}

export interface SemanticRules {
  allowExternalInference: boolean;
  axiom?: boolean;
}

export interface AlignmentInput {
  federationId: FederationId;
  themeId: ThemeId;
  abstractionLevel: AbstractionLevel;
}

export interface AlignmentResult {
  index: number;
  federationScore: number;
  themeScore: number;
  passed: boolean;
  blockedBy: string | null;
}

export interface TimeUpVerdict {
  allowed: boolean;
  reason: string | null;
  containedFederation: FederationId | null;
  violatedRule: string | null;
}

export const FEDERATION_WEIGHTS: Record<FederationId, number> = {
  1: 0.25,
  2: 0.15,
  3: 0.20,
  4: 0.20,
  5: 0.05,
  6: 0.10,
  7: 0.05,
};

export const THEME_WEIGHTS: Record<ThemeId, number> = {
  1: 0.15,
  2: 0.15,
  3: 0.10,
  4: 0.10,
  5: 0.15,
  6: 0.10,
  7: 0.10,
  8: 0.10,
  9: 0.05,
};

export const FEDERATION_CHROMATIC: Record<FederationId, { primary: string; name: string }> = {
  1: { primary: "#1a1a2e", name: "Core & Kernel" },
  2: { primary: "#4a0e4e", name: "Mesh & Conectividad" },
  3: { primary: "#0f766e", name: "Territorial" },
  4: { primary: "#d4a017", name: "Cognitiva" },
  5: { primary: "#4b5563", name: "Interfaz (Nexo)" },
  6: { primary: "#3730a3", name: "Criptográfica" },
  7: { primary: "#047857", name: "Resiliencia" },
};
