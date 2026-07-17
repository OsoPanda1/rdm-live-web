// ============================================================================
// MD-X4 Render Engine — dual hexagonal pipeline scheduler.
// ============================================================================

import { randomUUID } from "node:crypto";
import type { RenderJob } from "./tenochtitlan.types.js";

const jobs: RenderJob[] = [];

export function submitRender(input: { scene: string; resolution?: string }): RenderJob[] {
  const ts = new Date().toISOString();
  const a: RenderJob = {
    id: randomUUID(),
    pipeline: "hex-A",
    scene: input.scene,
    resolution: input.resolution ?? "3840x2160",
    fps: 60,
    status: "rendering",
    startedAt: ts,
  };
  const b: RenderJob = { ...a, id: randomUUID(), pipeline: "hex-B" };
  jobs.unshift(a, b);
  // Simulate completion async
  setTimeout(() => {
    a.status = "done";
    a.completedAt = new Date().toISOString();
    b.status = "done";
    b.completedAt = new Date().toISOString();
  }, 1500);
  return [a, b];
}

export function listRenders(limit = 20): RenderJob[] {
  return jobs.slice(0, limit);
}

export function renderStats() {
  const total = jobs.length;
  const done = jobs.filter((j) => j.status === "done").length;
  const rendering = jobs.filter((j) => j.status === "rendering").length;
  return { total, done, rendering, pipelines: ["hex-A", "hex-B"] };
}
