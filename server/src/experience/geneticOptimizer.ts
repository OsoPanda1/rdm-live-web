// ================================================================
// RDM Digital OS v3 — Genetic Route Optimizer
// Multi-objective evolutionary algorithm for antifragile routes
// ================================================================

import crypto from "crypto";
import type {
  TwinContext,
  UserPreferences,
  PlannedStop,
  PlannedRoute,
  RouteObjectives,
} from "./types.js";

// Haversine distance in km
function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Calculate total route distance
function routeDistanceKm(stops: TwinContext[]): number {
  let total = 0;
  for (let i = 1; i < stops.length; i++) {
    total += haversineKm(
      stops[i - 1].lat, stops[i - 1].lng,
      stops[i].lat, stops[i].lng,
    );
  }
  return total;
}

// Diversity: how many unique types/categories are represented
function diversityScore(stops: TwinContext[]): number {
  const types = new Set(stops.map((s) => s.properties.type ?? s.modelType));
  return types.size / Math.max(stops.length, 1);
}

// Crowd penalty: sum of crowd levels above threshold
function crowdPenalty(stops: TwinContext[], maxCrowd: number): number {
  return stops.reduce((acc, s) => {
    const crowd = s.telemetry.crowdLevel ?? 0;
    return acc + Math.max(0, crowd - maxCrowd);
  }, 0);
}

// Merchant balance: ratio of merchant twins in route
function merchantBalance(stops: TwinContext[]): number {
  const merchants = stops.filter((s) => s.modelType === "MERCHANT_TWIN").length;
  const ratio = merchants / Math.max(stops.length, 1);
  // Ideal: 20-40% merchants
  if (ratio >= 0.2 && ratio <= 0.4) return 1;
  return 1 - Math.abs(ratio - 0.3) * 2;
}

// Evaluate fitness of a candidate route
function evaluateFitness(
  candidate: TwinContext[],
  prefs: UserPreferences,
): { fitness: number; objectives: RouteObjectives } {
  const maxCrowd = prefs.maxCrowdLevel ?? 0.85;
  const dist = routeDistanceKm(candidate);
  const div = diversityScore(candidate);
  const crowd = crowdPenalty(candidate, maxCrowd);
  const merchant = merchantBalance(candidate);

  // Estimated duration: 25 min avg per stop + walking time (5 km/h ~ turismo relajado) [web:360][web:363]
  const walkingMin = (dist / 5) * 60;
  const dwellMin = candidate.length * 25;
  const totalMin = walkingMin + dwellMin;

  // Time fit: penalize si excede el tiempo disponible
  const availMin =
    prefs.availableMinutes ??
    (prefs.durationHours !== undefined ? prefs.durationHours * 60 : 180);
  const timeFit =
    totalMin <= availMin
      ? 1
      : Math.max(0, 1 - (totalMin - availMin) / availMin);

  // Interest affinity
  const interests = prefs.interests ?? [];
  let interestHits = 0;
  if (interests.length > 0) {
    candidate.forEach((s) => {
      const tags = s.tags.map((t) => t.toUpperCase());
      const type = (s.properties.type ?? "").toUpperCase();
      if (
        interests.some(
          (i) =>
            tags.includes(i.toUpperCase()) ||
            type.includes(i.toUpperCase()),
        )
      ) {
        interestHits++;
      }
    });
  }
  const interestScore =
    interests.length > 0
      ? interestHits / Math.max(candidate.length, 1)
      : 0.5;

  // Immersion bonus
  const immersionAvg =
    candidate.reduce((a, s) => a + s.immersionLevel, 0) /
    Math.max(candidate.length, 1);

  // Multi-objective weighted fitness (suma ~ 0-80+)
  const fitness =
    div * 25 + // diversity: 0-25
    (1 - Math.min(crowd, 1)) * 20 + // low crowd: 0-20
    merchant * 15 + // merchant balance: 0-15
    timeFit * 20 + // time fit: 0-20
    interestScore * 15 + // interest affinity: 0-15
    immersionAvg * 5 + // immersion: 0-5
    candidate.length * 2; // more stops = slightly better

  return {
    fitness,
    objectives: {
      distanceKm: Math.round(dist * 100) / 100,
      diversityScore: Math.round(div * 100) / 100,
      crowdPenalty: Math.round(crowd * 100) / 100,
      merchantBalance: Math.round(merchant * 100) / 100,
      totalDurationMinutes: Math.round(totalMin),
    },
  };
}

// Generate random route from available twins
function randomRoute(twins: TwinContext[], maxStops: number): TwinContext[] {
  const shuffled = [...twins].sort(() => Math.random() - 0.5);
  const count = Math.min(
    Math.max(2, Math.floor(Math.random() * maxStops) + 2),
    shuffled.length,
  );
  return shuffled.slice(0, count);
}

// Crossover: take first half of parent A, fill rest from parent B
function crossover(a: TwinContext[], b: TwinContext[]): TwinContext[] {
  const half = Math.ceil(a.length / 2);
  const child = a.slice(0, half);
  const childIds = new Set(child.map((s) => s.id));
  for (const stop of b) {
    if (!childIds.has(stop.id)) {
      child.push(stop);
      childIds.add(stop.id);
    }
    if (child.length >= Math.max(a.length, b.length)) break;
  }
  return child;
}

// Mutation: swap a random stop with one from the pool
function mutate(route: TwinContext[], pool: TwinContext[]): TwinContext[] {
  if (route.length === 0 || Math.random() > 0.3) return route;
  const result = [...route];
  const idx = Math.floor(Math.random() * result.length);
  const routeIds = new Set(result.map((s) => s.id));
  const candidates = pool.filter((t) => !routeIds.has(t.id));
  if (candidates.length > 0) {
    result[idx] = candidates[Math.floor(Math.random() * candidates.length)];
  }
  return result;
}

// ================================================================
// Main optimizer entry point
// ================================================================

export const optimizeRoute = async (
  userPreferences: UserPreferences,
  twinsContext: TwinContext[],
): Promise<PlannedRoute> => {
  const placeTwins = twinsContext.filter(
    (t) => t.modelType === "PLACE_TWIN" || t.modelType === "MERCHANT_TWIN",
  );

  if (placeTwins.length === 0) {
    return {
      id: crypto.randomUUID(),
      label: "Sin datos suficientes",
      fitnessScore: 0,
      confidenceScore: 0,
      geneticGen: "GA-FALLBACK",
      explanation:
        "No hay gemelos digitales activos para construir una ruta.",
      objectives: {
        distanceKm: 0,
        diversityScore: 0,
        crowdPenalty: 0,
        merchantBalance: 0,
        totalDurationMinutes: 0,
      },
      stops: [],
    };
  }

  const availMin =
    userPreferences.availableMinutes ??
    (userPreferences.durationHours !== undefined
      ? userPreferences.durationHours * 60
      : 180);
  const maxStops = Math.min(
    Math.ceil(availMin / 30),
    placeTwins.length,
  );

  // GA parameters
  const POPULATION_SIZE = 40;
  const GENERATIONS = 25;
  const ELITE_COUNT = 4;

  // 1. Generate initial population
  let population: TwinContext[][] = Array.from(
    { length: POPULATION_SIZE },
    () => randomRoute(placeTwins, maxStops),
  );

  // 2. Evolve
  for (let gen = 0; gen < GENERATIONS; gen++) {
    const evaluated = population.map((route) => ({
      route,
      ...evaluateFitness(route, userPreferences),
    }));
    evaluated.sort((a, b) => b.fitness - a.fitness);

    const nextGen: TwinContext[][] = evaluated
      .slice(0, ELITE_COUNT)
      .map((e) => e.route);

    while (nextGen.length < POPULATION_SIZE) {
      const parentA =
        evaluated[
          Math.floor(Math.random() * Math.min(10, evaluated.length))
        ].route;
      const parentB =
        evaluated[
          Math.floor(Math.random() * Math.min(10, evaluated.length))
        ].route;
      let child = crossover(parentA, parentB);
      child = mutate(child, placeTwins);
      nextGen.push(child);
    }

    population = nextGen;
  }

  // 3. Select best
  const finalEval = population.map((route) => ({
    route,
    ...evaluateFitness(route, userPreferences),
  }));
  finalEval.sort((a, b) => b.fitness - a.fitness);

  const best = finalEval[0];
  const confidence = Math.max(0, Math.min(1, best.fitness / 80));

  // Build planned stops with ETAs
  let cumulativeMin = 0;
  const stops: PlannedStop[] = best.route.map((twin, idx) => {
    const dwellMin = twin.modelType === "MERCHANT_TWIN" ? 20 : 30;
    if (idx > 0) {
      const dist = haversineKm(
        best.route[idx - 1].lat,
        best.route[idx - 1].lng,
        twin.lat,
        twin.lng,
      );
      cumulativeMin += (dist / 5) * 60; // 5 km/h walking
    }
    const stop: PlannedStop = {
      twinId: twin.id,
      name: twin.name,
      order: idx + 1,
      etaMinutes: Math.round(cumulativeMin),
      dwellMinutes: dwellMin,
      type: (twin.properties.type as string) ?? twin.modelType,
      crowdLevel: (twin.telemetry.crowdLevel as number) ?? 0,
      immersion: (twin.properties.immersion as string) ?? "L1",
    };
    cumulativeMin += dwellMin;
    return stop;
  });

  return {
    id: crypto.randomUUID(),
    label: `Ruta optimizada (${stops.length} paradas)`,
    fitnessScore: Math.round(best.fitness * 100) / 100,
    confidenceScore: Math.round(confidence * 100) / 100,
    geneticGen: `RDM-X-GA-v3.${GENERATIONS}gen`,
    explanation:
      `Ruta generada con algoritmo genético (${GENERATIONS} generaciones, ` +
      `población ${POPULATION_SIZE}). Optimiza diversidad temática, baja ` +
      `saturación, balance comercio/cultura y ajuste temporal.`,
    objectives: best.objectives,
    stops,
  };
};

// Legacy compatibility
export const calculateFitness = (
  route: TwinContext[],
  userPrefs: UserPreferences,
): number => {
  return evaluateFitness(route, userPrefs).fitness;
};
