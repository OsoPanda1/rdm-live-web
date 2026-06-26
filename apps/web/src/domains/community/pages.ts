/**
 * apps/web — Dominio Comunidad (social, perfil, gamificación, donativos).
 *
 * Objetivos:
 * - Entradas lazy‑loaded fuertemente tipadas.
 * - Agrupación semántica por surface (social, perfil, gamificación, donativos).
 * - Utilidades de preload/prefetch para mejorar fluidez percibida.
 */

import {
  lazy,
  type ComponentType,
  type LazyExoticComponent,
} from "react";

/** Dominio lógico de cada surface, útil para telemetría, routing y feature flags. */
export type CommunitySurfaceDomain =
  | "comunidad"
  | "social"
  | "perfil"
  | "gamificacion"
  | "donativos";

/** Metadatos por surface para orquestación (routing, prefetch, UX). */
export interface CommunitySurfaceDescriptor {
  id: string;
  domain: CommunitySurfaceDomain;
  label: string;
  /**
   * Prioridad relativa para prefetch:
   *  - "high": rutas muy frecuentes o críticas (feed, perfil).
   *  - "medium": rutas usadas con frecuencia moderada.
   *  - "low": rutas de flujo secundario (pantallas de gracias, etc.).
   */
  prefetchPriority: "high" | "medium" | "low";
}

/**
 * typedLazy — wrapper genérico para React.lazy con tipos fuertes.
 */
function typedLazy<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(loader) as LazyExoticComponent<T>;
}

/**
 * Utilidades internas de preload — usan dynamic import a nivel de módulo.[web:52][web:56]
 */
const preloadMap = {
  Comunidad: () => import("@/pages/Comunidad"),
  ComunidadPage: () => import("@/pages/ComunidadPage"),
  RedSocial: () => import("@/pages/RedSocial"),
  Feed: () => import("@/pages/Feed"),
  Perfil: () => import("@/pages/Perfil"),
  Leaderboard: () => import("@/pages/Leaderboard"),
  Donar: () => import("@/pages/Donar"),
  Apoya: () => import("@/pages/Apoya"),
  GraciasDonativo: () => import("@/pages/GraciasDonativo"),
} as const;

/**
 * API pública de prefetch:
 * - prefetchSurface(id): prefetch dirigido por id.
 * - prefetchByDomain(domain): prefetch por dominio lógico (ej. "social").[web:52]
 */

export type CommunitySurfaceId = keyof typeof preloadMap;

export function prefetchSurface(id: CommunitySurfaceId): void {
  void preloadMap[id]();
}

export function prefetchByDomain(domain: CommunitySurfaceDomain): void {
  const ids = Object.entries(communitySurfaces)
    .filter(([, d]) => d.domain === domain)
    .map(([id]) => id as CommunitySurfaceId);

  for (const id of ids) {
    void preloadMap[id]();
  }
}

/**
 * Descriptores de surfaces — una especie de “catálogo” central.
 * Esto ayuda a routers, menús, telemetría y prefetch heurístico.[web:51][web:58]
 */
export const communitySurfaces: Record<CommunitySurfaceId, CommunitySurfaceDescriptor> = {
  Comunidad: {
    id: "Comunidad",
    domain: "comunidad",
    label: "Comunidad",
    prefetchPriority: "medium",
  },
  ComunidadPage: {
    id: "ComunidadPage",
    domain: "comunidad",
    label: "Comunidad (page)",
    prefetchPriority: "medium",
  },
  RedSocial: {
    id: "RedSocial",
    domain: "social",
    label: "Red social",
    prefetchPriority: "high",
  },
  Feed: {
    id: "Feed",
    domain: "social",
    label: "Feed",
    prefetchPriority: "high",
  },
  Perfil: {
    id: "Perfil",
    domain: "perfil",
    label: "Perfil",
    prefetchPriority: "high",
  },
  Leaderboard: {
    id: "Leaderboard",
    domain: "gamificacion",
    label: "Leaderboard",
    prefetchPriority: "medium",
  },
  Donar: {
    id: "Donar",
    domain: "donativos",
    label: "Donar",
    prefetchPriority: "high",
  },
  Apoya: {
    id: "Apoya",
    domain: "donativos",
    label: "Apoya",
    prefetchPriority: "medium",
  },
  GraciasDonativo: {
    id: "GraciasDonativo",
    domain: "donativos",
    label: "Gracias por tu donativo",
    prefetchPriority: "low",
  },
};

/**
 * Entradas lazy‑loaded por surface.
 *
 * Nota:
 * - Usar con <Suspense> y, si es posible, ErrorBoundary por dominio.[web:56]
 */

export const Comunidad = typedLazy(
  () => preloadMap.Comunidad()
);

export const ComunidadPage = typedLazy(
  () => preloadMap.ComunidadPage()
);

export const RedSocial = typedLazy(
  () => preloadMap.RedSocial()
);

export const Feed = typedLazy(
  () => preloadMap.Feed()
);

export const Perfil = typedLazy(
  () => preloadMap.Perfil()
);

export const Leaderboard = typedLazy(
  () => preloadMap.Leaderboard()
);

export const Donar = typedLazy(
  () => preloadMap.Donar()
);

export const Apoya = typedLazy(
  () => preloadMap.Apoya()
);

export const GraciasDonativo = typedLazy(
  () => preloadMap.GraciasDonativo()
);
