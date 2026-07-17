import { db } from "../lib/store.js";

export function emitMsrEvent(input: {
  layer: "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7";
  category: string;
  summary: string;
  payload?: Record<string, string | number | boolean>;
}) {
  const id = crypto.randomUUID();
  db.msrEvents.set(id, {
    id,
    layer: input.layer,
    category: input.category,
    summary: input.summary,
    payload: input.payload ?? {},
    createdAt: new Date().toISOString(),
  });
  return id;
}

export function appendBookpiNarrative(input: { title: string; narrative: string; tags?: string[] }) {
  const id = crypto.randomUUID();
  db.bookpiNarratives.set(id, {
    id,
    title: input.title,
    narrative: input.narrative,
    tags: input.tags ?? [],
    createdAt: new Date().toISOString(),
  });
  return id;
}

export function listAuditFeed() {
  return {
    msr: [...db.msrEvents.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100),
    bookpi: [...db.bookpiNarratives.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100),
  };
}
