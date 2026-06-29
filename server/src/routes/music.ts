// server/src/routes/music.ts
import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAdmin } from "../middleware/requireAdmin"; // asumiendo middleware admin

const prisma = new PrismaClient();
const router = express.Router();

// --- Configuración Multer (uploads de audio + cover) ---

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const safeBase = base.replace(/[^a-z0-9-_]/gi, "_");
    cb(null, `${safeBase}-${Date.now()}${ext.toLowerCase()}`);
  },
});

const allowedAudioExt = [".mp3", ".wav", ".ogg"];
const allowedImageExt = [".jpg", ".jpeg", ".png", ".webp"];

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const isAudio = file.fieldname === "audio" && allowedAudioExt.includes(ext);
  const isImage = file.fieldname === "cover" && allowedImageExt.includes(ext);

  if (!isAudio && !isImage) {
    return cb(new Error("Tipo de archivo no permitido"), false);
  }

  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// --- Rutas públicas ---

// Obtener todas las pistas activas
router.get("/", async (_req, res, next) => {
  try {
    const tracks = await prisma.musicTrack.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(tracks);
  } catch (err) {
    next(err);
  }
});

// --- Rutas admin ---

// Crear pista (subida de audio + cover)
router.post(
  "/",
  requireAdmin,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const { title, artist, description } = req.body;

      if (!title || !artist) {
        return res.status(400).json({ error: "title y artist son requeridos" });
      }

      const audioFile = (req.files as any)?.audio?.[0];
      const coverFile = (req.files as any)?.cover?.[0];

      if (!audioFile || !coverFile) {
        return res.status(400).json({ error: "audio y cover son requeridos" });
      }

      const audioUrl = `/uploads/${audioFile.filename}`;
      const coverUrl = `/uploads/${coverFile.filename}`;

      const track = await prisma.musicTrack.create({
        data: {
          title,
          artist,
          description: description || null,
          audioUrl,
          coverUrl,
        },
      });

      res.status(201).json(track);
    } catch (err) {
      next(err);
    }
  },
);

// Activar / desactivar pista
router.patch("/:id/toggle", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const track = await prisma.musicTrack.findUnique({ where: { id } });
    if (!track) return res.status(404).json({ error: "Not found" });

    const updated = await prisma.musicTrack.update({
      where: { id },
      data: { active: !track.active },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
