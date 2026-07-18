import { describe, it, expect, beforeEach } from "vitest";

// ─── Core Federation Types ───────────────────────────────────────────────────

type FederationId =
  | "DEKATEOTL" | "ANUBIS" | "BOOKPI_DATAGIT" | "PHOENIX"
  | "MDD_TAMV" | "KAOS_HYPERRENDER" | "CHRONOS";

type FederationNumber = "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7";
type FederationStatus = "ACTIVE" | "IDLE" | "DEGRADED" | "OFFLINE";

interface FederationModule {
  id: FederationId;
  federationNumber: FederationNumber;
  name: string;
  specialty: string;
  stack: string[];
  role: string;
  status: FederationStatus;
  health: number;
  operationalScore: number;
  lastHeartbeat?: Date;
}

interface FederationEvent {
  id: string;
  type: string;
  source: FederationId;
  payload: unknown;
  timestamp: Date;
  traceId: string;
}

// ─── FederationBus (pure logic) ──────────────────────────────────────────────

function createFederationBus() {
  const federations = new Map<FederationId, FederationModule>();
  const handlers = new Map<string, Set<(event: FederationEvent) => void>>();
  const queues = new Map<FederationId, FederationEvent[]>();
  let eventCounter = 0;

  const FED_SPECS: Array<{
    id: FederationId; number: FederationNumber; name: string;
    specialty: string; stack: string[]; role: string;
  }> = [
    { id: "DEKATEOTL", number: "F1", name: "Federación de Datos (DATA)", specialty: "DATA - Vault / PostGIS / TimeSeries", stack: ["PostgreSQL", "PostGIS", "Tile38", "InfluxDB"], role: "Custodio de datos territoriales y memoria civilizatoria" },
    { id: "ANUBIS", number: "F2", name: "Federación de Inteligencia (INTEL)", specialty: "INTEL - Cognitive & Agentic AI", stack: ["Isabella AI", "LangChain", "VectorDB", "ONNX"], role: "Inteligencia cognitiva y procesamiento emocional" },
    { id: "BOOKPI_DATAGIT", number: "F3", name: "Federación de Seguridad (SEC)", specialty: "SEC - PQC / Zero-Trust / Q-Cells", stack: ["OpenFHE", "OPA/Rego", "OIDC", "Kyber/SPHINCS+"], role: "Seguridad post-cuántica y gobierno de identidad" },
    { id: "PHOENIX", number: "F4", name: "Federación de Gobernanza (GOV)", specialty: "GOV - Executable Governance", stack: ["OPA", "Cel", "Rego", "DID:key"], role: "Gobernanza ejecutable y políticas TIME UP" },
    { id: "MDD_TAMV", number: "F5", name: "Federación Económica (ECON)", specialty: "ECON - Economía local / phygital", stack: ["Stripe", "CATTLEYA", "TNX", "LedgerDB"], role: "Motor económico local y moneda interna" },
    { id: "KAOS_HYPERRENDER", number: "F6", name: "Federación Visual (VIS)", specialty: "VIS - GeoEngine 2D/3D", stack: ["Three.js", "Mapbox", "D5 Render", "WebGL"], role: "Renderizado geoespacial y visualización inmersiva" },
    { id: "CHRONOS", number: "F7", name: "Federación Territorial (TERRITORY)", specialty: "TERRITORY - Edge / IoT / Human mesh", stack: ["Meshtastic", "LoRa", "EdgeDB", "MQTT"], role: "Sensing territorial y malla humana" },
  ];

  function init() {
    for (const spec of FED_SPECS) {
      federations.set(spec.id, {
        id: spec.id,
        federationNumber: spec.number,
        name: spec.name,
        specialty: spec.specialty,
        stack: spec.stack,
        role: spec.role,
        status: "ACTIVE",
        health: 1.0,
        operationalScore: 1.0,
        lastHeartbeat: new Date(),
      });
      queues.set(spec.id, []);
    }
  }

  init();

  return {
    getFederation(id: FederationId) {
      return federations.get(id);
    },

    getAllFederations(): FederationModule[] {
      return Array.from(federations.values());
    },

    updateHealth(id: FederationId, health: number): void {
      const fed = federations.get(id);
      if (fed) {
        fed.health = Math.max(0, Math.min(1, health));
        fed.status = health > 0.8 ? "ACTIVE" : health > 0.5 ? "DEGRADED" : "IDLE";
        fed.lastHeartbeat = new Date();
      }
    },

    emit(event: { type: string; source: FederationId; payload: unknown; traceId: string }): FederationEvent {
      const fullEvent: FederationEvent = {
        id: `evt_${++eventCounter}`,
        type: event.type,
        source: event.source,
        payload: event.payload,
        timestamp: new Date(),
        traceId: event.traceId,
      };

      const q = queues.get(event.source);
      if (q) {
        q.push(fullEvent);
        if (q.length > 100) q.shift();
      }

      const hs = handlers.get(event.type);
      if (hs) {
        for (const h of hs) {
          try { h(fullEvent); } catch { /* handler error */ }
        }
      }

      return fullEvent;
    },

    on(eventType: string, handler: (event: FederationEvent) => void): () => void {
      if (!handlers.has(eventType)) handlers.set(eventType, new Set());
      handlers.get(eventType)!.add(handler);
      return () => { handlers.get(eventType)?.delete(handler); };
    },

    async ruteToFederation(intent: { id: string; type: string; payload: unknown; source: string; traceId: string }, target: FederationId): Promise<void> {
      const federation = federations.get(target);
      if (!federation) return;
      this.emit({ type: "FEDERATION_INTENT", source: target, payload: intent, traceId: intent.traceId });
    },

    async emitSovereigntyEvent(type: string, details: unknown): Promise<void> {
      this.emit({ type: "SOVEREIGNTY_ALERT", source: "PHOENIX", payload: { eventType: type, details }, traceId: `sovereignty_${Date.now()}` });
    },

    async broadcastToAll(eventType: string, payload: unknown, traceId: string): Promise<void> {
      for (const [fedId] of federations) {
        this.emit({ type: eventType, source: fedId, payload, traceId });
      }
    },

    getQueueLength(id: FederationId): number {
      return queues.get(id)?.length ?? 0;
    },

    getHealth(): { totalEvents: number; listenersByType: Record<string, number> } {
      const listenersByType: Record<string, number> = {};
      for (const [type, hs] of handlers) {
        listenersByType[type] = hs.size;
      }
      return {
        totalEvents: Array.from(queues.values()).reduce((sum, q) => sum + q.length, 0),
        listenersByType,
      };
    },

    getAllFederationIds(): FederationId[] {
      return FED_SPECS.map(s => s.id);
    },
  };
}

// ─── FederationBus Tests ─────────────────────────────────────────────────────

describe("FederationBus", () => {
  let bus: ReturnType<typeof createFederationBus>;

  beforeEach(() => {
    bus = createFederationBus();
  });

  it("initializes 7 federations", () => {
    const all = bus.getAllFederations();
    expect(all).toHaveLength(7);
  });

  it("each federation has correct F-number", () => {
    const all = bus.getAllFederations();
    const numbers = all.map(f => f.federationNumber).sort();
    expect(numbers).toEqual(["F1", "F2", "F3", "F4", "F5", "F6", "F7"]);
  });

  it("all federations start ACTIVE with health 1.0", () => {
    for (const fed of bus.getAllFederations()) {
      expect(fed.status).toBe("ACTIVE");
      expect(fed.health).toBe(1.0);
    }
  });

  it("getFederation returns the correct federation", () => {
    const fed = bus.getFederation("ANUBIS");
    expect(fed).toBeDefined();
    expect(fed!.name).toBe("Federación de Inteligencia (INTEL)");
    expect(fed!.stack).toContain("Isabella AI");
  });

  it("getFederation returns undefined for unknown id", () => {
    const fed = bus.getFederation("UNKNOWN" as any);
    expect(fed).toBeUndefined();
  });

  it("updateHealth changes health and status to DEGRADED at 0.6", () => {
    bus.updateHealth("ANUBIS", 0.6);
    const fed = bus.getFederation("ANUBIS")!;
    expect(fed.health).toBe(0.6);
    expect(fed.status).toBe("DEGRADED");
  });

  it("updateHealth changes status to IDLE at 0.3", () => {
    bus.updateHealth("MDD_TAMV", 0.3);
    const fed = bus.getFederation("MDD_TAMV")!;
    expect(fed.status).toBe("IDLE");
  });

  it("updateHealth clamps value to [0, 1]", () => {
    bus.updateHealth("PHOENIX", -0.5);
    expect(bus.getFederation("PHOENIX")!.health).toBe(0);
    bus.updateHealth("PHOENIX", 2.0);
    expect(bus.getFederation("PHOENIX")!.health).toBe(1);
  });

  it("updateHealth updates lastHeartbeat", () => {
    const before = bus.getFederation("CHRONOS")!.lastHeartbeat!.getTime();
    setTimeout(() => {}, 1);
    bus.updateHealth("CHRONOS", 1.0);
    const after = bus.getFederation("CHRONOS")!.lastHeartbeat!.getTime();
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it("emit creates event with id and timestamp", () => {
    const evt = bus.emit({ type: "TEST_EVENT", source: "ANUBIS", payload: { msg: "hello" }, traceId: "t1" });
    expect(evt.id).toBeDefined();
    expect(evt.timestamp).toBeInstanceOf(Date);
    expect(evt.source).toBe("ANUBIS");
    expect(evt.type).toBe("TEST_EVENT");
  });

  it("emit adds event to source queue", () => {
    bus.emit({ type: "E1", source: "DEKATEOTL", payload: {}, traceId: "t1" });
    expect(bus.getQueueLength("DEKATEOTL")).toBe(1);
  });

  it("emit calls registered handlers", () => {
    const calls: string[] = [];
    bus.on("USER_SIGNED_IN", (e) => calls.push(e.source));
    bus.emit({ type: "USER_SIGNED_IN", source: "MDD_TAMV", payload: {}, traceId: "t1" });
    expect(calls).toEqual(["MDD_TAMV"]);
  });

  it("emit calls multiple handlers for same event type", () => {
    let count = 0;
    bus.on("EVENT", () => count++);
    bus.on("EVENT", () => count++);
    bus.emit({ type: "EVENT", source: "ANUBIS", payload: {}, traceId: "t1" });
    expect(count).toBe(2);
  });

  it("on returns unsubscribe function", () => {
    let count = 0;
    const unsub = bus.on("EV", () => count++);
    bus.emit({ type: "EV", source: "ANUBIS", payload: {}, traceId: "t1" });
    expect(count).toBe(1);
    unsub();
    bus.emit({ type: "EV", source: "ANUBIS", payload: {}, traceId: "t2" });
    expect(count).toBe(1);
  });

  it("handler error does not crash the bus", () => {
    bus.on("ERR", () => { throw new Error("handler fail"); });
    let count = 0;
    bus.on("ERR", () => count++);
    expect(() => {
      bus.emit({ type: "ERR", source: "ANUBIS", payload: {}, traceId: "t1" });
    }).not.toThrow();
    expect(count).toBe(1);
  });

  it("emit caps queue at 100 events", () => {
    const fedId: FederationId = "CHRONOS";
    const spec = { type: "FLOOD", source: fedId as FederationId, payload: {}, traceId: "t" };
    for (let i = 0; i < 105; i++) {
      bus.emit(spec);
    }
    expect(bus.getQueueLength(fedId)).toBe(100);
  });

  it("broadcastToAll emits to all 7 federations", () => {
    const received = new Set<FederationId>();
    for (const id of bus.getAllFederationIds()) {
      bus.on("BROADCAST", (e) => received.add(e.source));
    }
    bus.broadcastToAll("BROADCAST", { alert: true }, "trace-b1");
    expect(received.size).toBe(7);
  });

  it("ruteToFederation emits FEDERATION_INTENT to target", () => {
    let captured: FederationEvent | null = null;
    bus.on("FEDERATION_INTENT", (e) => captured = e);
    bus.ruteToFederation({ id: "int-1", type: "commerce_query", payload: { amount: 50 }, source: "web", traceId: "t-r1" }, "MDD_TAMV");
    expect(captured).not.toBeNull();
    expect(captured!.source).toBe("MDD_TAMV");
    expect((captured!.payload as any).id).toBe("int-1");
  });

  it("ruteToFederation does nothing for unknown target", async () => {
    let captured = false;
    bus.on("FEDERATION_INTENT", () => captured = true);
    await bus.ruteToFederation({ id: "i", type: "t", payload: {}, source: "s", traceId: "t" }, "UNKNOWN" as any);
    expect(captured).toBe(false);
  });

  it("emitSovereigntyEvent emits SOVEREIGNTY_ALERT from PHOENIX", () => {
    let captured: FederationEvent | null = null;
    bus.on("SOVEREIGNTY_ALERT", (e) => captured = e);
    bus.emitSovereigntyEvent("NODE_FAILURE", { nodeId: "n1" });
    expect(captured).not.toBeNull();
    expect(captured!.source).toBe("PHOENIX");
    expect((captured!.payload as any).eventType).toBe("NODE_FAILURE");
    expect((captured!.payload as any).details).toEqual({ nodeId: "n1" });
  });

  it("getHealth returns total events and listener counts", () => {
    bus.on("A", () => {});
    bus.on("A", () => {});
    bus.on("B", () => {});
    bus.emit({ type: "A", source: "DEKATEOTL", payload: {}, traceId: "t1" });
    bus.emit({ type: "B", source: "ANUBIS", payload: {}, traceId: "t2" });
    const health = bus.getHealth();
    expect(health.totalEvents).toBeGreaterThanOrEqual(2);
    expect(health.listenersByType.A).toBe(2);
    expect(health.listenersByType.B).toBe(1);
  });

  it("getFederation includes stack and role", () => {
    const fed = bus.getFederation("BOOKPI_DATAGIT")!;
    expect(fed.specialty).toContain("PQC");
    expect(fed.role).toContain("Seguridad");
    expect(fed.stack).toContain("OPA/Rego");
  });
});

// ─── Territorial Federation Bridge ───────────────────────────────────────────

type FederationEvent2 = {
  type: string; source: FederationId; payload: any; traceId: string;
};

interface TerritorialFederationMap {
  contributionType: string;
  primaryFed: FederationId;
  secondaryFeds: FederationId[];
  eventType: string;
  priority: "low" | "normal" | "high" | "critical";
}

const TERRITORIAL_MAPS: TerritorialFederationMap[] = [
  { contributionType: "checkin", primaryFed: "CHRONOS", secondaryFeds: ["DEKATEOTL", "MDD_TAMV"], eventType: "TERRITORIAL_CHECKIN", priority: "normal" },
  { contributionType: "review", primaryFed: "ANUBIS", secondaryFeds: ["DEKATEOTL"], eventType: "TERRITORIAL_REVIEW", priority: "normal" },
  { contributionType: "photo", primaryFed: "KAOS_HYPERRENDER", secondaryFeds: ["DEKATEOTL"], eventType: "TERRITORIAL_PHOTO", priority: "low" },
  { contributionType: "rating", primaryFed: "MDD_TAMV", secondaryFeds: ["DEKATEOTL"], eventType: "TERRITORIAL_RATING", priority: "normal" },
  { contributionType: "tip", primaryFed: "ANUBIS", secondaryFeds: ["DEKATEOTL", "CHRONOS"], eventType: "TERRITORIAL_TIP", priority: "low" },
  { contributionType: "event_report", primaryFed: "PHOENIX", secondaryFeds: ["DEKATEOTL", "CHRONOS"], eventType: "TERRITORIAL_EVENT", priority: "high" },
  { contributionType: "route_trace", primaryFed: "CHRONOS", secondaryFeds: ["DEKATEOTL", "KAOS_HYPERRENDER"], eventType: "TERRITORIAL_ROUTE", priority: "normal" },
  { contributionType: "poi_suggestion", primaryFed: "DEKATEOTL", secondaryFeds: ["PHOENIX", "CHRONOS"], eventType: "TERRITORIAL_POI_SUGGESTION", priority: "high" },
];

function createTerritorialBridge(bus: ReturnType<typeof createFederationBus>) {
  return {
    routeContribution(contribution: { type: string; id: string; userId: string; coords: [number, number]; territorio: string; createdAt: string }) {
      const map = TERRITORIAL_MAPS.find(m => m.contributionType === contribution.type);
      if (!map) return;

      const traceId = `trace_${contribution.id}`;

      bus.emit({
        type: map.eventType,
        source: map.primaryFed,
        payload: {
          contributionId: contribution.id,
          userId: contribution.userId,
          type: contribution.type,
          coords: contribution.coords,
          territorio: contribution.territorio,
          timestamp: contribution.createdAt,
          traceId,
        },
        traceId,
      });

      for (const fed of map.secondaryFeds) {
        bus.emit({
          type: `${map.eventType}_SYNC`,
          source: fed,
          payload: {
            contributionId: contribution.id,
            type: contribution.type,
            coords: contribution.coords,
            sourceFed: map.primaryFed,
            traceId,
          },
          traceId,
        });
      }
    },

    routeTerritorialStats(stats: { userId: string; totalContributions: number; lastActive: string }) {
      bus.emit({
        type: "TERRITORIAL_STATS_UPDATE",
        source: "DEKATEOTL",
        payload: { stats, traceId: `stats_${Date.now()}` },
        traceId: `stats_${Date.now()}`,
      });
    },

    routeHeatMapUpdate(points: Array<{ lat: number; lng: number; weight: number }>) {
      bus.emit({
        type: "HEATMAP_UPDATE",
        source: "KAOS_HYPERRENDER",
        payload: { points, traceId: `heat_${Date.now()}` },
        traceId: `heat_${Date.now()}`,
      });
    },

    getFederationsForTerritory(territorio: string): FederationId[] {
      if (territorio === "RDM") {
        return ["DEKATEOTL", "ANUBIS", "CHRONOS", "KAOS_HYPERRENDER", "MDD_TAMV"];
      }
      return ["DEKATEOTL", "CHRONOS"];
    },
  };
}

describe("Territorial Federation Bridge", () => {
  it("routes checkin to CHRONOS primary with DEKATEOTL and MDD_TAMV secondary", () => {
    const bus = createFederationBus();
    const bridge = createTerritorialBridge(bus);
    const events: FederationEvent2[] = [];
    bus.on("TERRITORIAL_CHECKIN", (e) => events.push(e));
    bus.on("TERRITORIAL_CHECKIN_SYNC", (e) => events.push(e));

    bridge.routeContribution({
      type: "checkin", id: "c1", userId: "u1",
      coords: [20.1, -98.7], territorio: "RDM", createdAt: "2026-01-01",
    });

    const primaryEvents = events.filter(e => e.type === "TERRITORIAL_CHECKIN");
    expect(primaryEvents).toHaveLength(1);
    expect(primaryEvents[0].source).toBe("CHRONOS");
    expect(primaryEvents[0].payload.contributionId).toBe("c1");

    const syncEvents = events.filter(e => e.type === "TERRITORIAL_CHECKIN_SYNC");
    expect(syncEvents).toHaveLength(2);
    const syncSources = syncEvents.map(e => e.source).sort();
    expect(syncSources).toEqual(["DEKATEOTL", "MDD_TAMV"]);
  });

  it("routes photo to KAOS_HYPERRENDER with DEKATEOTL sync", () => {
    const bus = createFederationBus();
    const bridge = createTerritorialBridge(bus);
    const events: FederationEvent2[] = [];
    bus.on("TERRITORIAL_PHOTO", (e) => events.push(e));
    bus.on("TERRITORIAL_PHOTO_SYNC", (e) => events.push(e));

    bridge.routeContribution({
      type: "photo", id: "p1", userId: "u1",
      coords: [20.1, -98.7], territorio: "RDM", createdAt: "2026-01-01",
    });

    const primary = events.find(e => e.type === "TERRITORIAL_PHOTO")!;
    expect(primary.source).toBe("KAOS_HYPERRENDER");
    const sync = events.find(e => e.type === "TERRITORIAL_PHOTO_SYNC")!;
    expect(sync.source).toBe("DEKATEOTL");
  });

  it("routes event_report with high priority to PHOENIX", () => {
    const bus = createFederationBus();
    const bridge = createTerritorialBridge(bus);
    const map = TERRITORIAL_MAPS.find(m => m.contributionType === "event_report")!;
    expect(map.priority).toBe("high");
    expect(map.primaryFed).toBe("PHOENIX");
  });

  it("ignores unknown contribution types", () => {
    const bus = createFederationBus();
    const bridge = createTerritorialBridge(bus);
    let callCount = 0;
    bus.on("ANY", () => callCount++);

    bridge.routeContribution({
      type: "unknown_type", id: "x", userId: "u1",
      coords: [0, 0], territorio: "RDM", createdAt: "",
    });

    expect(callCount).toBe(0);
  });

  it("routeTerritorialStats emits TERRITORIAL_STATS_UPDATE from DEKATEOTL", () => {
    const bus = createFederationBus();
    const bridge = createTerritorialBridge(bus);
    let captured: FederationEvent2 | null = null;
    bus.on("TERRITORIAL_STATS_UPDATE", (e) => captured = e);

    bridge.routeTerritorialStats({ userId: "u1", totalContributions: 10, lastActive: "2026-01-01" });

    expect(captured).not.toBeNull();
    expect(captured!.source).toBe("DEKATEOTL");
    expect(captured!.payload.stats.totalContributions).toBe(10);
  });

  it("routeHeatMapUpdate emits HEATMAP_UPDATE from KAOS_HYPERRENDER", () => {
    const bus = createFederationBus();
    const bridge = createTerritorialBridge(bus);
    let captured: FederationEvent2 | null = null;
    bus.on("HEATMAP_UPDATE", (e) => captured = e);

    bridge.routeHeatMapUpdate([{ lat: 20.1, lng: -98.7, weight: 0.8 }]);

    expect(captured).not.toBeNull();
    expect(captured!.source).toBe("KAOS_HYPERRENDER");
    expect(captured!.payload.points).toHaveLength(1);
  });

  it("getFederationsForTerritory returns 5 federations for RDM", () => {
    const bridge = createTerritorialBridge(createFederationBus());
    const feds = bridge.getFederationsForTerritory("RDM");
    expect(feds).toEqual(["DEKATEOTL", "ANUBIS", "CHRONOS", "KAOS_HYPERRENDER", "MDD_TAMV"]);
  });

  it("getFederationsForTerritory returns 2 federations for unknown territory", () => {
    const bridge = createTerritorialBridge(createFederationBus());
    const feds = bridge.getFederationsForTerritory("OTHER");
    expect(feds).toEqual(["DEKATEOTL", "CHRONOS"]);
  });
});

// ─── Event Bus Bridge (pure mapping logic) ───────────────────────────────────

type YunFederation = "comercio" | "turismo_cultura" | "academia" | "gobierno" | "tech_infra" | "comunidad" | "metaverso_xr";

const TAMV_TO_YUN: Record<FederationId, YunFederation> = {
  DEKATEOTL: "comercio",
  ANUBIS: "turismo_cultura",
  BOOKPI_DATAGIT: "academia",
  PHOENIX: "gobierno",
  MDD_TAMV: "tech_infra",
  KAOS_HYPERRENDER: "comunidad",
  CHRONOS: "metaverso_xr",
};

const YUN_TO_TAMV: Record<YunFederation, FederationId> = {
  comercio: "DEKATEOTL",
  turismo_cultura: "ANUBIS",
  academia: "BOOKPI_DATAGIT",
  gobierno: "PHOENIX",
  tech_infra: "MDD_TAMV",
  comunidad: "KAOS_HYPERRENDER",
  metaverso_xr: "CHRONOS",
};

function mapTamvToYun(fedId: FederationId): YunFederation | undefined {
  return TAMV_TO_YUN[fedId];
}

function mapYunToTamv(yunFed: YunFederation): FederationId | undefined {
  return YUN_TO_TAMV[yunFed];
}

function aggregateHealth(tamvFeds: FederationModule[]) {
  return tamvFeds.map(fed => ({
    tamvId: fed.id,
    yunFederation: TAMV_TO_YUN[fed.id],
    name: fed.name,
    status: fed.status,
    health: fed.health,
    specialty: fed.specialty,
  }));
}

describe("Event Bus Bridge (mapping)", () => {
  it("maps all 7 TAMV federations to YUN federations", () => {
    const tamvIds: FederationId[] = ["DEKATEOTL", "ANUBIS", "BOOKPI_DATAGIT", "PHOENIX", "MDD_TAMV", "KAOS_HYPERRENDER", "CHRONOS"];
    for (const id of tamvIds) {
      expect(mapTamvToYun(id)).toBeDefined();
    }
  });

  it("maps all 7 YUN federations back to TAMV", () => {
    const yunFeds: YunFederation[] = ["comercio", "turismo_cultura", "academia", "gobierno", "tech_infra", "comunidad", "metaverso_xr"];
    for (const yf of yunFeds) {
      expect(mapYunToTamv(yf)).toBeDefined();
    }
  });

  it("round-trips correctly for every federation", () => {
    const tamvIds: FederationId[] = ["DEKATEOTL", "ANUBIS", "BOOKPI_DATAGIT", "PHOENIX", "MDD_TAMV", "KAOS_HYPERRENDER", "CHRONOS"];
    for (const id of tamvIds) {
      const yun = mapTamvToYun(id)!;
      const back = mapYunToTamv(yun)!;
      expect(back).toBe(id);
    }
  });

  it("aggregateHealth returns health for all 7 federations", () => {
    const bus = createFederationBus();
    const health = aggregateHealth(bus.getAllFederations());
    expect(health).toHaveLength(7);
    for (const h of health) {
      expect(h.tamvId).toBeDefined();
      expect(h.yunFederation).toBeDefined();
      expect(h.health).toBe(1.0);
      expect(h.status).toBe("ACTIVE");
    }
  });

  it("aggregateHealth reflects updated health values", () => {
    const bus = createFederationBus();
    bus.updateHealth("PHOENIX", 0.3);
    const health = aggregateHealth(bus.getAllFederations());
    const phoenix = health.find(h => h.tamvId === "PHOENIX")!;
    expect(phoenix.health).toBe(0.3);
    expect(phoenix.status).toBe("IDLE");
  });
});
