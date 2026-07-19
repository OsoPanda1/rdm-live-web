import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";
import type { SessionTicket, SessionConfig, CreateTicketOptions } from "./types.js";

interface CacheEntry {
  ticket: SessionTicket;
  expiresAt: number;
}

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionError";
  }
}

const ERR_NOT_FOUND = new SessionError("Session not found");
const ERR_EXPIRED = new SessionError("Session expired");
const ERR_CAPACITY = new SessionError("Session capacity reached");
const ERR_INVALID_SIGN = new SessionError("Invalid session signature");

export class SessionManager {
  private cache: Map<string, CacheEntry>;
  private readonly config: SessionConfig;

  constructor(config: SessionConfig) {
    this.config = config;
    this.cache = new Map();
  }

  issue(opts: CreateTicketOptions): SessionTicket {
    if (this.cache.size >= this.config.maxSessions) {
      this.evictExpired();
      if (this.cache.size >= this.config.maxSessions) {
        throw ERR_CAPACITY;
      }
    }

    const sessionId = randomUUID();
    const now = Date.now();
    const ticket: SessionTicket = {
      sessionId,
      subjectId: opts.subjectId,
      roles: opts.roles,
      federationId: opts.federationId,
      riskLevel: opts.riskLevel,
      issuedAt: new Date(now),
      expiresAt: new Date(now + this.config.ttlMs),
      originalToken: opts.originalToken,
      signature: "",
    };
    ticket.signature = this.sign(ticket);

    this.cache.set(sessionId, {
      ticket,
      expiresAt: now + this.config.ttlMs,
    });

    return ticket;
  }

  validate(sessionId: string): SessionTicket {
    const entry = this.cache.get(sessionId);
    if (!entry) throw ERR_NOT_FOUND;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(sessionId);
      throw ERR_EXPIRED;
    }

    const expectedSig = this.sign(entry.ticket);
    if (!timingSafeEqual(Buffer.from(entry.ticket.signature), Buffer.from(expectedSig))) {
      this.cache.delete(sessionId);
      throw ERR_INVALID_SIGN;
    }

    return entry.ticket;
  }

  revokeSession(sessionId: string): void {
    this.cache.delete(sessionId);
  }

  revokeSubject(subjectId: string): void {
    for (const [id, entry] of this.cache) {
      if (entry.ticket.subjectId === subjectId) {
        this.cache.delete(id);
      }
    }
  }

  stats(): { active: number; capacity: number } {
    this.evictExpired();
    return {
      active: this.cache.size,
      capacity: this.config.maxSessions,
    };
  }

  private sign(ticket: SessionTicket): string {
    const payload = `${ticket.sessionId}:${ticket.subjectId}:${ticket.roles.join(",")}:${ticket.federationId}:${ticket.expiresAt.getTime()}`;
    return createHmac("sha256", this.config.signingKey).update(payload).digest("hex");
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [id, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(id);
      }
    }
  }
}
