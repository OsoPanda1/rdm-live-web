import { z } from 'zod';
import { ApiError, badRequest } from '@/lib/security/error-handler';

export { z };

export const coordsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const userIdSchema = z.string().min(1, 'userId requerido').max(100);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const contributionSchema = z.object({
  userId: userIdSchema,
  type: z.enum(['checkin', 'review', 'photo', 'rating', 'tip', 'event_report', 'route_trace', 'poi_suggestion']),
  coords: coordsSchema,
  territorio: z.string().min(1).max(50).default('RDM'),
  payload: z.record(z.unknown()),
  poiId: z.string().optional(),
});

export const feedbackSchema = z.object({
  territory: z.enum(['RDM', 'PACHUCA', 'HIDALGO']).default('RDM'),
  consent: z.boolean().nullable().default(null),
  rating: z.number().int().min(1).max(5).nullable().default(null),
  comment: z.string().max(280).default(''),
});

export const querySchema = z.object({
  text: z.string().min(1, 'text requerido').max(1000),
  userId: userIdSchema,
  coords: coordsSchema.optional(),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.flatten();
    throw badRequest('Datos inválidos', { fieldErrors: errors.fieldErrors, formErrors: errors.formErrors });
  }
  return result.data;
}
