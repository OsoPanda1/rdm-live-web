export interface XrGatewayEvent {
  id: string;
  topic: "telemetry" | "protocol" | "guardian";
  createdAt: string;
  payload: Record<string, unknown>;
}

const listeners = new Set<(event: XrGatewayEvent) => void>();
const replayBuffer: XrGatewayEvent[] = [];

export function publishXrGatewayEvent(event: Omit<XrGatewayEvent, "id" | "createdAt">) {
  const fullEvent: XrGatewayEvent = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...event,
  };

  replayBuffer.push(fullEvent);
  if (replayBuffer.length > 250) {
    replayBuffer.splice(0, replayBuffer.length - 250);
  }

  listeners.forEach((listener) => listener(fullEvent));
  return fullEvent;
}

export function subscribeXrGateway(listener: (event: XrGatewayEvent) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function listRecentXrGatewayEvents(limit = 50) {
  return replayBuffer.slice(-Math.max(1, Math.min(limit, 250)));
}
