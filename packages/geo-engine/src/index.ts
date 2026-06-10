/**
 * @geo-engine — Façade del paquete de geo (Etapa 1).
 * Re-exporta desde la ubicación actual sin mover archivos todavía.
 * En la Etapa 2 los fuentes se moverán a packages/geo-engine/src/ y este
 * index pasará a ser el único punto de verdad.
 */
export * from "@/core/geo/haversine.fast";
export * from "@/core/geo/bbox";
export * from "@/core/geo/lru-cache";
export * from "@/core/geo/spatial-index";
export * from "@/core/geo/geo-unified";

export * from "./haversine";
