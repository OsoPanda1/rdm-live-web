// ============================================================================
// TAMV Blockchain MSR — API Router
// Identity • Governance • Economy • AI Ethics • Metaverse • MSR Status
// Triple Federado: conceptual / legal / técnico
// ============================================================================
import { Router } from "express";
import { createHash, randomUUID } from "crypto";

const tamvRouter = Router();

// --- helpers ---------------------------------------------------------------
const sha256 = (input: string) => createHash("sha256").update(input).digest("hex");
const ts = () => new Date().toISOString();

// --- in-memory federated state (replaceable por Prisma/MSR adapter) --------
interface CitizenIdentity {
  id: string;
  did: string;
  alias: string;
  reputation: number;
  bookpiAnchor: string;
  createdAt: string;
}
interface Proposal {
  id: string;
  title: string;
  body: string;
  votesFor: number;
  votesAgainst: number;
  status: "open" | "ratified" | "rejected" | "halted";
  createdAt: string;
}
interface DecisionRecord {
  id: string;
  actorId: string;
  action: string;
  context: string;
  hash: string;
  signedAt: string;
}

const identities = new Map<string, CitizenIdentity>();
const proposals = new Map<string, Proposal>();
const decisions = new Map<string, DecisionRecord>();

// --- seed Nodo Cero --------------------------------------------------------
(function seed() {
  const founderId = "tamv-founder-eoct";
  identities.set(founderId, {
    id: founderId,
    did: `did:tamv:${sha256("edwin-oswaldo-castillo-trejo").slice(0, 40)}`,
    alias: "Anubis Villaseñor",
    reputation: 1000,
    bookpiAnchor: `ipfs://${sha256("nodo-cero-rdm")}`,
    createdAt: ts(),
  });
  proposals.set("p-genesis", {
    id: "p-genesis",
    title: "Acta Constitucional Nodo Cero — Real del Monte",
    body: "Ratificación del despliegue del Nodo Cero TAMV/RDM Digital con Trinidad Federada activa.",
    votesFor: 1,
    votesAgainst: 0,
    status: "ratified",
    createdAt: ts(),
  });
})();

// --- IDENTITY --------------------------------------------------------------
tamvRouter.get("/identity", (_req, res) => {
  res.json({ data: Array.from(identities.values()), totalItems: identities.size });
});

tamvRouter.post("/identity", (req, res) => {
  const { alias, seed } = req.body ?? {};
  if (!alias || typeof alias !== "string") {
    return res.status(400).json({ error: "alias requerido" });
  }
  const id = randomUUID();
  const did = `did:tamv:${sha256(seed ?? `${alias}-${id}`).slice(0, 40)}`;
  const citizen: CitizenIdentity = {
    id,
    did,
    alias,
    reputation: 10,
    bookpiAnchor: `ipfs://${sha256(`${id}-${alias}`)}`,
    createdAt: ts(),
  };
  identities.set(id, citizen);
  res.status(201).json(citizen);
});

// --- GOVERNANCE ------------------------------------------------------------
tamvRouter.get("/governance/proposals", (_req, res) => {
  res.json({ data: Array.from(proposals.values()), totalItems: proposals.size });
});

tamvRouter.post("/governance/proposals", (req, res) => {
  const { title, body } = req.body ?? {};
  if (!title || !body) return res.status(400).json({ error: "title y body requeridos" });
  const id = `p-${randomUUID().slice(0, 8)}`;
  const proposal: Proposal = {
    id,
    title,
    body,
    votesFor: 0,
    votesAgainst: 0,
    status: "open",
    createdAt: ts(),
  };
  proposals.set(id, proposal);
  res.status(201).json(proposal);
});

tamvRouter.post("/governance/proposals/:id/vote", (req, res) => {
  const { id } = req.params;
  const { support } = req.body ?? {};
  const p = proposals.get(id);
  if (!p) return res.status(404).json({ error: "proposal not found" });
  if (support) p.votesFor += 1;
  else p.votesAgainst += 1;
  if (p.votesFor >= 3 && p.votesFor > p.votesAgainst) p.status = "ratified";
  proposals.set(id, p);
  res.json(p);
});

// --- ECONOMY (20/30/50 Phoenix Rule) --------------------------------------
tamvRouter.post("/economy/distribute", (req, res) => {
  const profit = Number(req.body?.profit ?? 0);
  if (!Number.isFinite(profit) || profit <= 0) {
    return res.status(400).json({ error: "profit > 0 requerido" });
  }
  const distribution = {
    phoenixFund: +(profit * 0.2).toFixed(4),
    infraFund: +(profit * 0.3).toFixed(4),
    reserveFund: +(profit * 0.5).toFixed(4),
    totalProfit: profit,
    rule: "Phoenix-203050",
    timestamp: ts(),
  };
  res.json(distribution);
});

// --- AI ETHICS (DecisionRecord auditable) ----------------------------------
tamvRouter.post("/ai/decision", (req, res) => {
  const { actorId, action, context } = req.body ?? {};
  if (!actorId || !action) {
    return res.status(400).json({ error: "actorId y action requeridos" });
  }
  const id = randomUUID();
  const payload = `${actorId}|${action}|${context ?? ""}|${ts()}`;
  const record: DecisionRecord = {
    id,
    actorId,
    action,
    context: context ?? "",
    hash: sha256(payload),
    signedAt: ts(),
  };
  decisions.set(id, record);
  res.status(201).json(record);
});

tamvRouter.get("/ai/decisions", (_req, res) => {
  res.json({ data: Array.from(decisions.values()), totalItems: decisions.size });
});

// --- METAVERSE / DREAMSPACES ----------------------------------------------
tamvRouter.get("/metaverse/dreamspaces", (_req, res) => {
  res.json({
    data: [
      { id: "ds-rdm", name: "Real del Monte XR", layer: "L7", visitors: 1284, status: "live" },
      { id: "ds-mina", name: "Mina Acosta Twin", layer: "L3", visitors: 412, status: "live" },
      { id: "ds-isabella", name: "Sala Isabella XR", layer: "L4", visitors: 98, status: "live" },
    ],
    totalItems: 3,
  });
});

// --- MSR STATUS (Nodo Cero) -----------------------------------------------
tamvRouter.get("/msr/status", (_req, res) => {
  res.json({
    node: "TAMV-RDM-NODO-CERO",
    version: "1.0.0",
    federation: "Triple Federado (conceptual / legal / técnica)",
    layers: ["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"],
    protocols: ["BABAS", "Fénix Rex 4.0", "Chronus", "Autopoiesis", "BookPI", "ANUBIS-ZK"],
    quantumEncryption: true,
    msrBridge: "EVM-Sidechain (active)",
    bookpiAnchor: "ipfs://active",
    citizens: identities.size,
    proposals: proposals.size,
    decisions: decisions.size,
    timestamp: ts(),
  });
});

export default tamvRouter;
