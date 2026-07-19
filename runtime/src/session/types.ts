import type { RiskLevel } from "../manifest/types.js";

export interface SessionTicket {
  sessionId: string;
  subjectId: string;
  roles: string[];
  federationId: string;
  riskLevel: RiskLevel;
  issuedAt: Date;
  expiresAt: Date;
  originalToken?: string;
  signature: string;
}

export interface SessionConfig {
  ttlMs: number;
  maxSessions: number;
  signingKey: Buffer;
}

export interface CreateTicketOptions {
  subjectId: string;
  federationId: string;
  roles: string[];
  riskLevel: RiskLevel;
  originalToken?: string;
}
