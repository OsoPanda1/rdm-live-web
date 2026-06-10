import { describe, expect, it } from "vitest";
import { haversineKm } from "../haversine";

describe("geo-engine · haversineKm", () => {
  it("calcula 0 km para el mismo punto", () => {
    const d = haversineKm({ lat: 20, lon: -98 }, { lat: 20, lon: -98 });
    expect(d).toBeCloseTo(0, 5);
  });

  it("produce un valor razonable entre Real del Monte y Pachuca", () => {
    const rdm = { lat: 20.1368, lon: -98.6723 };
    const pachuca = { lat: 20.1011, lon: -98.7591 };
    const d = haversineKm(rdm, pachuca);
    expect(d).toBeGreaterThan(5);
    expect(d).toBeLessThan(20);
  });
});
