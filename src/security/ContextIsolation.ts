import { logger } from "@/lib/logger";

interface IsolatedSession {
  sessionId: string;
  userId: string;
  contextToken: string;
  createdAt: Date;
  expiresAt: Date;
  data: Map<string, unknown>;
  allowedActions: Set<string>;
  lastAccess: Date;
}

export class ContextIsolation {
  private sessions: Map<string, IsolatedSession> = new Map();
  private readonly sessionTimeoutMs: number;

  constructor(sessionTimeoutMinutes = 30) {
    this.sessionTimeoutMs = sessionTimeoutMinutes * 60 * 1000;
  }

  async createSession(userId: string): Promise<IsolatedSession> {
    const enc = new TextEncoder();
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const seedHex = Array.from(seed).map((b) => b.toString(16).padStart(2, "0")).join("");
    const sessionIdBuf = await crypto.subtle.digest("SHA-256", enc.encode(`${userId}:${seedHex}:${Date.now()}`));
    const sessionId = Array.from(new Uint8Array(sessionIdBuf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
    const tokenBuf = await crypto.subtle.digest("SHA-256", enc.encode(`${sessionId}:${userId}`));
    const contextToken = Array.from(new Uint8Array(tokenBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");

    const session: IsolatedSession = {
      sessionId,
      userId,
      contextToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.sessionTimeoutMs),
      data: new Map(),
      allowedActions: new Set(),
      lastAccess: new Date(),
    };

    this.sessions.set(sessionId, session);
    this.cleanup();

    logger.info("[CONTEXT] Sesión creada", { sessionId: sessionId.slice(0, 8), userId: userId.slice(0, 8) });
    return session;
  }

  getSession(sessionId: string): IsolatedSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (Date.now() > session.expiresAt.getTime()) {
      this.sessions.delete(sessionId);
      logger.warn("[CONTEXT] Sesión expirada", { sessionId: sessionId.slice(0, 8) });
      return null;
    }

    session.lastAccess = new Date();
    return session;
  }

  validateContextToken(sessionId: string, token: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    return session.contextToken === token;
  }

  setSessionData(sessionId: string, key: string, value: unknown): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    session.data.set(key, value);
    return true;
  }

  getSessionData(sessionId: string, key: string): unknown {
    const session = this.getSession(sessionId);
    if (!session) return null;
    return session.data.get(key);
  }

  allowAction(sessionId: string, action: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    session.allowedActions.add(action);
    return true;
  }

  canExecute(sessionId: string, action: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;
    return session.allowedActions.has(action);
  }

  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
    logger.info("[CONTEXT] Sesión destruida", { sessionId: sessionId.slice(0, 8) });
  }

  destroyUserSessions(userId: string): void {
    let count = 0;
    for (const [sessionId, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        count++;
      }
    }
    logger.info("[CONTEXT] Sesiones de usuario destruidas", { userId: userId.slice(0, 8), count });
  }

  getActiveSessionCount(): number {
    this.cleanup();
    return this.sessions.size;
  }

  private cleanup(): void {
    const now = Date.now();
    let expired = 0;
    for (const [sessionId, session] of this.sessions) {
      if (now > session.expiresAt.getTime()) {
        this.sessions.delete(sessionId);
        expired++;
      }
    }
    if (expired > 0) {
      logger.debug("[CONTEXT] Sesiones expiradas limpiadas", { count: expired });
    }
  }
}

export const contextIsolation = new ContextIsolation();
