import type { PluginConfig } from "../manifest/types.js";
import type { SessionManager } from "../session/manager.js";
import type {
  SecurityContext,
  IdentityValidationResult,
  ExecutionValidationResult,
  TokenPayload,
} from "./types.js";

export function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf-8");
}

export function validateIdentity(
  authHeader: string | null,
  sessionId: string | null,
  sessionManager: SessionManager,
): IdentityValidationResult {
  if (sessionId) {
    try {
      const ticket = sessionManager.validate(sessionId);
      return {
        valid: true,
        context: {
          authenticated: true,
          subjectId: ticket.subjectId,
          roles: ticket.roles,
          federationId: ticket.federationId,
          riskLevel: ticket.riskLevel,
          sessionCached: true,
        },
      };
    } catch {
      // Fall through to full validation
    }
  }

  if (!authHeader) {
    return { valid: false, error: "Missing authorization", shouldIssueTicket: false };
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return { valid: false, error: "Invalid authorization scheme", shouldIssueTicket: false };
  }

  const token = parts[1];
  try {
    const payload = decodeToken(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { valid: false, error: "Token expired", shouldIssueTicket: false };
    }

    return {
      valid: true,
      context: {
        authenticated: true,
        subjectId: payload.sub,
        roles: payload.role ? [payload.role] : [],
        federationId: payload.federation_id,
        riskLevel: "LOW",
        sessionCached: false,
      },
      shouldIssueTicket: true,
    };
  } catch (err) {
    return { valid: false, error: `Token validation failed: ${(err as Error).message}`, shouldIssueTicket: false };
  }
}

export function decodeToken(token: string): TokenPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  return JSON.parse(decodeBase64Url(parts[1])) as TokenPayload;
}

export function validateExecution(
  plugin: PluginConfig,
  context: SecurityContext,
): ExecutionValidationResult {
  if (!context.authenticated) {
    return { allowed: false, error: "Not authenticated" };
  }

  if (context.federationId && !plugin.allowed_federations.includes("*")) {
    if (!plugin.allowed_federations.includes(context.federationId)) {
      return { allowed: false, error: `Federation ${context.federationId} not allowed for plugin ${plugin.id}` };
    }
  }

  if (!plugin.allowed_roles.includes("*")) {
    const hasRole = context.roles.some((r) => plugin.allowed_roles.includes(r));
    if (!hasRole) {
      return { allowed: false, error: `Insufficient roles for plugin ${plugin.id}` };
    }
  }

  return {
    allowed: true,
    sandboxProfile: plugin.sandbox_profile,
  };
}
