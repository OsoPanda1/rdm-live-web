// server/src/routes/music.ts
import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";

type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  description: string | null;
  audioUrl: string;
  coverUrl: string;
  active: boolean;
  createdAt: string;
};

const router = Router();
const tracks = new Map<string, MusicTrack>();

router.get("/", (_req, res) => {
  res.json([...tracks.values()].filter((track) => track.active));
});

router.post("/", requireAdmin, (req, res) => {
  const { title, artist, description, audioUrl, coverUrl } = req.body as Partial<MusicTrack>;

  if (!title || !artist || !audioUrl || !coverUrl) {
    res.status(400).json({ error: "title, artist, audioUrl y coverUrl son requeridos" });
    return;
  }

  const track: MusicTrack = {
    id: crypto.randomUUID(),
    title,
    artist,
    description: description ?? null,
    audioUrl,
    coverUrl,
    active: true,
    createdAt: new Date().toISOString(),
  };

  tracks.set(track.id, track);
  res.status(201).json(track);
});

router.patch("/:id/toggle", requireAdmin, (req, res) => {
  const { id } = req.params as { id: string };
  const track = tracks.get(id);
  if (!track) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  track.active = !track.active;
  tracks.set(track.id, track);
  res.json(track);
});

export default router;
