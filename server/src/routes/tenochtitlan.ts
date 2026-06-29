// ============================================================================
// /api/tenochtitlan — public surface for the sovereign kernel.
// ============================================================================

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { readSentinels, readRadars, pingSentinel } from "../services/tenochtitlan/sentinels.js";
import { readNodes, getNode } from "../services/tenochtitlan/nodes.js";
import { listIdentities, createIdentity, decayDignity, adjustReputation } from "../services/tenochtitlan/identity.js";
import { appendEvidence, readChain, verifyChain } from "../services/tenochtitlan/bookpi.js";
import { submitRender, listRenders, renderStats } from "../services/tenochtitlan/render.js";

const tenochtitlanRouter = Router();

tenochtitlanRouter.get("/", (_req: Request, res: Response) => {
  const sentinels = readSentinels();
  const nodes = readNodes();
  const radars = readRadars();
  const online = nodes.filter((n) => n.status === "online").length;
  res.json({
    name: "System Tenochtitlán",
    glyph: "🜂",
    version: "1.0.0",
    bootedAt: new Date().toISOString(),
    summary: {
      sentinels: sentinels.length,
      sentinelsOnline: sentinels.filter((s) => s.status === "online").length,
      radars: radars.length,
      nodes: nodes.length,
      nodesOnline: online,
      avgHealth: Math.round(nodes.reduce((acc, n) => acc + n.health, 0) / nodes.length),
    },
    pantheon: sentinels.map((s) => ({ id: s.id, glyph: s.glyph, name: s.name, status: s.status })),
  });
});

tenochtitlanRouter.get("/sentinels", (_req, res) => res.json({ items: readSentinels() }));
tenochtitlanRouter.get("/radars", (_req, res) => res.json({ items: readRadars() }));
tenochtitlanRouter.get("/nodes", (_req, res) => {
  const items = readNodes();
  const byCluster = items.reduce<Record<string, number>>((acc, n) => {
    acc[n.cluster] = (acc[n.cluster] ?? 0) + 1;
    return acc;
  }, {});
  res.json({ total: items.length, byCluster, items });
});
tenochtitlanRouter.get("/nodes/:code", (req, res) => {
  try {
    res.json(getNode(req.params.code));
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

const pingSchema = z.object({ kind: z.enum(["signal", "threat", "consensus"]).optional() });
tenochtitlanRouter.post("/sentinels/:id/ping", (req, res) => {
  const parsed = pingSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: "INVALID_BODY" });
  try {
    const result = pingSentinel(req.params.id, parsed.data.kind);
    appendEvidence(req.params.id, "SENTINEL_PING", { kind: parsed.data.kind ?? "signal" });
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

tenochtitlanRouter.get("/identity", (_req, res) => res.json({ items: listIdentities() }));
const identitySchema = z.object({ username: z.string().min(3).max(40), role: z.enum(["CITIZEN", "CUSTODIAN", "SYSTEM", "ARCHITECT"]).optional() });
tenochtitlanRouter.post("/identity", (req, res) => {
  const parsed = identitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const record = createIdentity(parsed.data);
  appendEvidence(record.username, "IDENTITY_CREATED", { did: record.did, role: record.role });
  res.status(201).json(record);
});
tenochtitlanRouter.post("/identity/decay", (_req, res) => {
  const result = decayDignity();
  appendEvidence("system", "DIGNITY_DECAY_RUN", { affected: result.affected });
  res.json(result);
});
const repSchema = z.object({ delta: z.number().int().min(-100).max(100) });
tenochtitlanRouter.post("/identity/:id/reputation", (req, res) => {
  const parsed = repSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const record = adjustReputation(req.params.id, parsed.data.delta);
    appendEvidence(record.username, "REPUTATION_ADJUSTED", { delta: parsed.data.delta });
    res.json(record);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

tenochtitlanRouter.get("/bookpi/chain", (req, res) => {
  const limit = Math.min(200, Number.parseInt(String(req.query.limit ?? "50"), 10) || 50);
  res.json({ items: readChain(limit) });
});
tenochtitlanRouter.get("/bookpi/verify", (_req, res) => res.json(verifyChain()));
const evSchema = z.object({
  actor: z.string().min(1),
  action: z.string().min(1),
  payload: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});
tenochtitlanRouter.post("/bookpi", (req, res) => {
  const parsed = evSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const e = appendEvidence(parsed.data.actor, parsed.data.action, parsed.data.payload ?? {});
  res.status(201).json(e);
});

const renderSchema = z.object({ scene: z.string().min(1), resolution: z.string().optional() });
tenochtitlanRouter.post("/render", (req, res) => {
  const parsed = renderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const jobs = submitRender(parsed.data);
  appendEvidence("mdx4", "RENDER_DISPATCHED", { scene: parsed.data.scene, jobs: jobs.length });
  res.status(202).json({ jobs });
});
tenochtitlanRouter.get("/render", (_req, res) => res.json({ stats: renderStats(), items: listRenders() }));

export default tenochtitlanRouter;
