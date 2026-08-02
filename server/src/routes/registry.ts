import type { Router as ExpressRouter } from "express";

export type ApiLayer = "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";

export interface ApiRouteMount {
  path: string;
  router: ExpressRouter;
  layer: ApiLayer;
  domain: string;
}

export function listApiRouteMounts(mounts: ApiRouteMount[]) {
  return mounts.map(({ path, layer, domain }) => ({ path, layer, domain }));
}
