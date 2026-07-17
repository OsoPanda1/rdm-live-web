import { db } from "../lib/store.js";
import { emitMsrEvent } from "./audit.service.js";

export function createDreamspace(input: {
  ownerId: string;
  name: string;
  visibility: "public" | "private";
  sceneProfile: "heritage" | "festival" | "nature";
}) {
  const id = crypto.randomUUID();
  const dreamspace = {
    id,
    ownerId: input.ownerId,
    name: input.name,
    visibility: input.visibility,
    participants: [input.ownerId],
    sceneProfile: input.sceneProfile,
    createdAt: new Date().toISOString(),
  };
  db.dreamspaces.set(id, dreamspace);
  emitMsrEvent({ layer: "L4", category: "xr.dreamspace.created", summary: `Dreamspace ${input.name}`, payload: { dreamspaceId: id } });
  return dreamspace;
}

export function joinDreamspace(input: { dreamspaceId: string; userId: string }) {
  const dreamspace = db.dreamspaces.get(input.dreamspaceId);
  if (!dreamspace) return null;
  if (!dreamspace.participants.includes(input.userId)) {
    dreamspace.participants.push(input.userId);
  }
  return dreamspace;
}

export function listDreamspaces() {
  return [...db.dreamspaces.values()];
}

export function getXrScenePayload(dreamspaceId: string) {
  const dreamspace = db.dreamspaces.get(dreamspaceId);
  if (!dreamspace) return null;
  return {
    dreamspaceId: dreamspace.id,
    renderer: "webxr",
    profile: dreamspace.sceneProfile,
    postprocess: dreamspace.sceneProfile === "heritage" ? ["bloom", "ao"] : ["bloom"],
    hud: {
      minimalist: true,
      contextLabel: `Dreamspace · ${dreamspace.name}`,
    },
  };
}
