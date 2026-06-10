/**
 * @economy — Façade del servicio de economía territorial (Etapa 2).
 * Catálogo de comercios + pasarela al motor de puntos (Supabase Edge Function `award-points`).
 * Stripe live + ledger se incorporan en Bloque C.
 */
export * from "@/lib/business-catalog";

/**
 * Cliente puente al edge function `award-points`.
 * Mantiene la firma estable mientras se construye el ledger interno.
 */
export type AwardPointsRequest = {
  action: string;
  points: number;
  metadata?: Record<string, unknown>;
};

export * from "./retention";
