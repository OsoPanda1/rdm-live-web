export function computeLocalRetention(localFlow: number, totalFlow: number): number {
  if (totalFlow <= 0 || localFlow <= 0) return 0;
  const pct = (localFlow / totalFlow) * 100;
  return Math.max(0, Math.min(100, pct));
}
