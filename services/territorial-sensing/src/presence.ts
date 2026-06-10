import type { AggregatedPresence } from "./types";
import { logger } from "@core-kernel/log";

export async function aggregatePresence(
  fromIso: string,
  toIso: string,
): Promise<AggregatedPresence[]> {
  logger.info("Aggregating presence", {
    module: "territorial-sensing",
    federation: "analytics",
  });

  return [
    {
      zoneId: "centro-historico",
      avgDwellMinutes: 42,
      visitorCount: 180,
      tsRange: { from: fromIso, to: toIso },
    },
    {
      zoneId: "panteon-ingles",
      avgDwellMinutes: 35,
      visitorCount: 75,
      tsRange: { from: fromIso, to: toIso },
    },
  ];
}
