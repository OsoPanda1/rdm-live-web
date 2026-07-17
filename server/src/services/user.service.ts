import { db } from "../lib/store.js";
import { appendBookpiNarrative, emitMsrEvent } from "./audit.service.js";

export function ensureProfile(userId: string) {
  const existing = db.profiles.get(userId);
  if (existing) {
    return existing;
  }

  const profile = {
    userId,
    displayName: `Usuario ${userId.slice(0, 6)}`,
    interests: ["patrimonio", "gastronomía"],
    socialLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.profiles.set(userId, profile);
  return profile;
}

export function updateProfile(input: {
  userId: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  interests?: string[];
  socialLinks?: string[];
}) {
  const current = ensureProfile(input.userId);
  const updated = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  db.profiles.set(input.userId, updated);

  emitMsrEvent({
    layer: "L5",
    category: "profile.updated",
    summary: "Perfil actualizado",
    payload: { userId: input.userId },
  });

  appendBookpiNarrative({
    title: "Actualización de perfil",
    narrative: `El usuario ${input.userId} actualizó su perfil público.`,
    tags: ["profile", "identity"],
  });

  return updated;
}

export function listUsers() {
  return [...db.users.values()].map((user) => ({ id: user.id, email: user.email, role: user.role }));
}
