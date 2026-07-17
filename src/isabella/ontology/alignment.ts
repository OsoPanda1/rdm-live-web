import {
  type AlignmentInput,
  type AlignmentResult,
  type FederationId,
  type ThemeId,
  FEDERATION_WEIGHTS,
  THEME_WEIGHTS,
} from "./types";

function federationBelonging(n: AlignmentInput, i: FederationId): number {
  return n.federationId === i ? 1 : 0;
}

function themeBelonging(n: AlignmentInput, j: ThemeId): number {
  return n.themeId === j ? 1 : 0;
}

export function calculateAlignmentIndex(n: AlignmentInput): number {
  const fedSum = (Object.keys(FEDERATION_WEIGHTS) as unknown as FederationId[]).reduce(
    (acc, i) => acc + FEDERATION_WEIGHTS[i] * federationBelonging(n, i),
    0,
  );

  const themeSum = (Object.keys(THEME_WEIGHTS) as unknown as ThemeId[]).reduce(
    (acc, j) => acc + THEME_WEIGHTS[j] * themeBelonging(n, j),
    0,
  );

  return fedSum * themeSum;
}

export function evaluateAlignment(n: AlignmentInput): AlignmentResult {
  const index = calculateAlignmentIndex(n);
  const federationScore = FEDERATION_WEIGHTS[n.federationId];
  const themeScore = THEME_WEIGHTS[n.themeId];

  if (federationScore === 0) {
    return { index, federationScore, themeScore, passed: false, blockedBy: `Federación ${n.federationId} no tiene peso asignado` };
  }
  if (themeScore === 0) {
    return { index, federationScore, themeScore, passed: false, blockedBy: `Eje temático ${n.themeId} no tiene peso asignado` };
  }

  const threshold = 0.01;
  const passed = index >= threshold;

  return {
    index,
    federationScore,
    themeScore,
    passed,
    blockedBy: passed ? null : `Índice de alineación ${index.toFixed(4)} por debajo del umbral ${threshold}`,
  };
}
