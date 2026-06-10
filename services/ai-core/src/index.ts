/**
 * @ai-core — Façade del servicio de inteligencia (Etapa 2).
 * Agrupa Isabella, Realito y el motor de decisión territorial.
 * Los módulos con APIs solapadas se exportan bajo namespace propio.
 */
export * as DecisionEngine from "@/ai/decision-engine";
export * as IsabellaGuardian from "@/core/ai/isabella-guardian";
export * as IsabellaTamvBase from "@/features/ai/isabellaTamvBase";
export * from "@/features/ai";

export * from "./isabella-guardian";
