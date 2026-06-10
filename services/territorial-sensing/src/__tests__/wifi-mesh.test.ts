import { describe, expect, it } from "vitest";
import { fetchWifiMeshHealth } from "../wifi-mesh";

describe("territorial-sensing · fetchWifiMeshHealth", () => {
  it("devuelve nodos con estado operacional", async () => {
    const nodes = await fetchWifiMeshHealth();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].id).toMatch(/^node-/);
    expect(["online", "degraded", "offline"]).toContain(nodes[0].status);
  });
});
