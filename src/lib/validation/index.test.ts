import { describe, it, expect } from 'vitest';
import {
  coordsSchema,
  paginationSchema,
  contributionSchema,
  feedbackSchema,
  querySchema,
  validate,
} from './index';

describe('coordsSchema', () => {
  it('accepts valid coordinates', () => {
    expect(() => coordsSchema.parse({ lat: 20.1, lng: -98.7 })).not.toThrow();
  });

  it('rejects out-of-range lat', () => {
    expect(() => coordsSchema.parse({ lat: 100, lng: 0 })).toThrow();
  });
});

describe('paginationSchema', () => {
  it('applies defaults', () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('coerces string numbers', () => {
    const result = paginationSchema.parse({ page: '3', limit: '10' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
  });
});

describe('feedbackSchema', () => {
  it('accepts valid feedback', () => {
    const result = feedbackSchema.parse({ rating: 4, comment: 'Great!' });
    expect(result.rating).toBe(4);
  });

  it('rejects empty territory', () => {
    expect(() => feedbackSchema.parse({ territory: '' })).toThrow();
  });
});

describe('validate helper', () => {
  it('returns parsed data on success', () => {
    const data = validate(paginationSchema, { page: 2 });
    expect(data.page).toBe(2);
  });

  it('throws ApiError on failure', () => {
    expect(() => validate(coordsSchema, { lat: 999 })).toThrow('Datos inválidos');
  });
});
