import { describe, it, expect } from 'vitest';
import { computeTimeTheme } from './useTimeTheme';

describe('computeTimeTheme', () => {
  it('returns day for 6-16', () => {
    expect(computeTimeTheme(new Date(2026, 0, 1, 6, 0, 0))).toBe('day');
    expect(computeTimeTheme(new Date(2026, 0, 1, 12, 0, 0))).toBe('day');
    expect(computeTimeTheme(new Date(2026, 0, 1, 16, 59, 59))).toBe('day');
  });

  it('returns evening for 17-20', () => {
    expect(computeTimeTheme(new Date(2026, 0, 1, 17, 0, 0))).toBe('evening');
    expect(computeTimeTheme(new Date(2026, 0, 1, 20, 59, 59))).toBe('evening');
  });

  it('returns night for 21-5', () => {
    expect(computeTimeTheme(new Date(2026, 0, 1, 21, 0, 0))).toBe('night');
    expect(computeTimeTheme(new Date(2026, 0, 1, 0, 0, 0))).toBe('night');
    expect(computeTimeTheme(new Date(2026, 0, 1, 5, 59, 59))).toBe('night');
  });
});
