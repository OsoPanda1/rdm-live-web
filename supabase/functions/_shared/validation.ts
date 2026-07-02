// Shared validation schemas for edge functions
// Using zod via ESM CDN

import { z } from "https://esm.sh/zod@3.24.3";

export const premiumCheckoutSchema = z.object({
  tier: z.enum(["99", "129"]).default("99"),
});

export const commerceCheckoutSchema = z.object({
  business_id: z.string().min(1, "business_id requerido"),
  tier: z.enum(["199", "299"]),
});

export const merchantPaymentSchema = z.object({
  category_id: z.string().uuid("category_id debe ser UUID"),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").max(100),
  description: z.string().min(10, "Descripción debe tener al menos 10 caracteres").max(2000),
  address: z.string().min(5, "Dirección debe tener al menos 5 caracteres").max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().max(20).optional().default(""),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  main_image: z.string().max(500).optional().default(""),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
});

export const awardPointsSchema = z.object({
  action: z.enum([
    "daily_login",
    "visit_place",
    "share_post",
    "upload_photo",
    "review_business",
    "complete_route",
    "attend_event",
    "refer_friend",
    "register_business",
    "memory_game_complete",
    "trivia_game_score_50",
    "trivia_game_score_80",
    "trivia_game_perfect",
    "daily_mining_strike",
    "mining_milestone_100",
    "mining_milestone_500",
  ]),
  metadata: z.record(z.unknown()).nullable().optional().default(null),
});
