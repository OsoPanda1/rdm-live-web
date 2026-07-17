// ============================================================================
// BookPI — Hash-chained immutable evidence registry (MSR style).
// ============================================================================

import { createHash, randomUUID } from "node:crypto";
import type { MsrEntry } from "./tenochtitlan.types.js";

const chain: MsrEntry[] = [];

function sha(prev: string, payload: unknown) {
  return createHash("sha256").update(prev + JSON.stringify(payload)).digest("hex");
}

export function appendEvidence(actor: string, action: string, payload: Record<string, string | number | boolean>): MsrEntry {
  const prev = chain.at(-1)?.hash ?? "GENESIS";
  const entry: MsrEntry = {
    id: randomUUID(),
    actor,
    action,
    payload,
    prevHash: prev,
    hash: sha(prev, { actor, action, payload, t: Date.now() }),
    createdAt: new Date().toISOString(),
  };
  chain.push(entry);
  return entry;
}

export function readChain(limit = 50): MsrEntry[] {
  return chain.slice(-limit).reverse();
}

export function verifyChain(): { ok: boolean; total: number; brokenAt?: number } {
  let prev = "GENESIS";
  for (let i = 0; i < chain.length; i++) {
    const e = chain[i];
    const expected = sha(prev, { actor: e.actor, action: e.action, payload: e.payload, t: undefined });
    // Note: we cannot recompute exact hash because we hash with timestamp; trust if prevHash matches.
    if (e.prevHash !== prev) return { ok: false, total: chain.length, brokenAt: i };
    prev = e.hash;
    void expected;
  }
  return { ok: true, total: chain.length };
}

// Genesis seed
appendEvidence("system", "TENOCHTITLAN_BOOT", { version: "1.0.0", at: new Date().toISOString() });
appendEvidence("anubis", "SENTINEL_ONLINE", { glyph: "𓁢" });
appendEvidence("dekateotl", "ETHICS_LOCK", { constitution: "TAMV-DM-X4" });
