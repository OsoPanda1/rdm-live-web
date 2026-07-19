import type { RiskLevel, PluginConfig } from "../manifest/types.js";
import type { SessionTicket } from "../session/types.js";

export interface SecurityContext {
  authenticated: boolean;
  subjectId?: string;
  roles: string[];
  federationId?: string;
  riskLevel: RiskLevel;
  sessionCached: boolean;
}

export interface IdentityValidationResult {
  valid: boolean;
  context?: SecurityContext;
  error?: string;
  shouldIssueTicket?: boolean;
}

export interface ExecutionValidationResult {
  allowed: boolean;
  error?: string;
  sandboxProfile?: string;
}

export interface TokenPayload {
  sub: string;
  role?: string;
  federation_id?: string;
  exp?: number;
  [key: string]: unknown;
}
