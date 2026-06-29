// ============================================================================
// ID-NVIDA + EOCT — Sovereign identity service with dignity decay.
// ============================================================================

import { randomUUID } from "node:crypto";
import type { IdentityRecord, Role } from "./tenochtitlan.types.js";

const identities = new Map<string, IdentityRecord>();

function seedDefaults() {
  if (identities.size > 0) return;
  const seed: Array<Omit<IdentityRecord, "id" | "did" | "createdAt">> = [
    { username: "edwin.castillo", role: "ARCHITECT", dignity: 100, reputation: 980, immutableUsername: true },
    { username: "isabella.kernel", role: "SYSTEM", dignity: 100, reputation: 1500, immutableUsername: true },
    { username: "anubis.guardian", role: "CUSTODIAN", dignity: 100, reputation: 1200, immutableUsername: true },
    { username: "real.del.monte", role: "CITIZEN", dignity: 96, reputation: 410, immutableUsername: true },
  ];
  for (const s of seed) {
    const id = randomUUID();
    identities.set(id, {
      id,
      did: `did:tamv:${id.slice(0, 12)}`,
      createdAt: new Date().toISOString(),
      ...s,
    });
  }
}
seedDefaults();

export function listIdentities(): IdentityRecord[] {
  return [...identities.values()];
}

export function createIdentity(input: { username: string; role?: Role }): IdentityRecord {
  const exists = [...identities.values()].find((i) => i.username === input.username);
  if (exists) return exists;
  const id = randomUUID();
  const record: IdentityRecord = {
    id,
    did: `did:tamv:${id.slice(0, 12)}`,
    username: input.username,
    role: input.role ?? "CITIZEN",
    dignity: 100,
    reputation: 0,
    immutableUsername: true,
    createdAt: new Date().toISOString(),
  };
  identities.set(id, record);
  return record;
}

export function decayDignity(): { affected: number; at: string } {
  let affected = 0;
  for (const i of identities.values()) {
    if (i.dignity > 0) {
      i.dignity = Math.max(0, i.dignity - 1);
      affected += 1;
    }
  }
  return { affected, at: new Date().toISOString() };
}

export function adjustReputation(id: string, delta: number) {
  const record = identities.get(id);
  if (!record) throw new Error(`IDENTITY_NOT_FOUND:${id}`);
  record.reputation = Math.max(0, record.reputation + delta);
  return record;
}
