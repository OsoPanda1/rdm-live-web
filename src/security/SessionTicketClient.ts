export interface SessionTicket {
  sessionId: string;
  expiresAt: string;
}

export class SessionTicketClient {
  private current?: SessionTicket;

  constructor(private readonly baseUrl: string) {}

  get isActive(): boolean {
    if (!this.current) return false;
    return Date.now() < new Date(this.current.expiresAt).getTime();
  }

  get sessionId(): string | undefined {
    return this.current?.sessionId;
  }

  public setTicket(ticket: SessionTicket): void {
    this.current = ticket;
  }

  public clearTicket(): void {
    this.current = undefined;
  }

  public attachToHeaders(headers: Record<string, string>): Record<string, string> {
    if (!this.isActive || !this.current) return headers;
    return {
      ...headers,
      "x-rdm-session-id": this.current.sessionId,
    };
  }

  public fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    if (this.isActive && this.current) {
      headers.set("x-rdm-session-id", this.current.sessionId);
    }
    return fetch(input, { ...init, headers });
  }
}
