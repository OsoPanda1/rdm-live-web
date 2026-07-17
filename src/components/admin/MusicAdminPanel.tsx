import { useEffect, useState, useCallback, useMemo } from "react";
import { Upload, Music as MusicIcon, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/hooks/useUserRole";
import { logger } from "@/lib/logger";

type Track = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  audio_url: string | null;
  duration_seconds: number;
  is_active: boolean;
};

const DEFAULT_ARTIST = "TAMV ONLINE Records";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function probeDuration(file: File): Promise<number> {
  return new Promise<number>((resolve) => {
    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 180;
      resolve(Math.round(duration));
    };
    audio.onerror = () => resolve(180);
  });
}

export function MusicAdminPanel() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState(DEFAULT_ARTIST);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  const canPublish = useMemo(
    () => !!file && title.trim().length > 0 && !uploading,
    [file, title, uploading],
  );

  const loadTracks = useCallback(async () => {
    try {
      setLoadingList(true);
      const { data, error } = await supabase
        .from("music_tracks")
        .select("id,slug,title,artist,audio_url,duration_seconds,is_active")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setTracks((data ?? []) as Track[]);
    } catch (error) {
      logger.error("Error loading music tracks", { error });
      toast.error("No se pudo cargar la playlist");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadTracks();
  }, [loadTracks]);

  const handleUpload = useCallback(async () => {
    if (!file || !title.trim()) {
      toast.error("Título y archivo requeridos");
      return;
    }

    setUploading(true);
    try {
      const trimmedTitle = title.trim();
      const trimmedArtist = artist.trim() || DEFAULT_ARTIST;

      const slug = slugify(trimmedTitle) || `track-${Date.now()}`;
      const extension = file.name.split(".").pop() || "mp3";
      const path = `${slug}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("music-uploads")
        .upload(path, file, {
          upsert: false,
          contentType: file.type || "audio/mpeg",
        });

      if (uploadError) throw uploadError;

      const { data: signed, error: signedError } = await supabase.storage
        .from("music-uploads")
        .createSignedUrl(path, 60 * 60 * 24 * 365);

      if (signedError) throw signedError;

      const audio_url = signed?.signedUrl ?? null;
      const duration_seconds = await probeDuration(file);

      const { error: insertError } = await supabase.from("music_tracks").insert({
        slug,
        title: trimmedTitle,
        artist: trimmedArtist,
        audio_url,
        duration_seconds,
        is_active: true,
        moods: ["donacion", "territorial"],
        territories: ["real-del-monte"],
      });

      if (insertError) throw insertError;

      await logAudit("music.upload", "music_tracks", { slug, title: trimmedTitle });

      toast.success("Pista publicada");
      setFile(null);
      setTitle("");
      setArtist(DEFAULT_ARTIST);
      void loadTracks();
    } catch (error) {
      logger.error("Error uploading track", { error });
      const message =
        error instanceof Error ? error.message : "Error al subir la pista";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }, [artist, file, title, loadTracks]);

  const toggleActive = useCallback(
    async (track: Track) => {
      try {
        const nextActive = !track.is_active;
        const { error } = await supabase
          .from("music_tracks")
          .update({ is_active: nextActive })
          .eq("id", track.id);

        if (error) throw error;

        await logAudit("music.toggle", "music_tracks", {
          id: track.id,
          active: nextActive,
        });

        setTracks((prev) =>
          prev.map((t) =>
            t.id === track.id ? { ...t, is_active: nextActive } : t,
          ),
        );
      } catch (error) {
        logger.error("Error toggling track active state", { error });
        toast.error("No se pudo actualizar el estado de la pista");
      }
    },
    [],
  );

  const remove = useCallback(async (track: Track) => {
    const confirmed = window.confirm(`¿Eliminar "${track.title}"?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("music_tracks")
        .delete()
        .eq("id", track.id);

      if (error) throw error;

      await logAudit("music.delete", "music_tracks", {
        id: track.id,
        title: track.title,
      });

      setTracks((prev) => prev.filter((t) => t.id !== track.id));
      toast.success("Pista eliminada");
    } catch (error) {
      logger.error("Error removing track", { error });
      toast.error("No se pudo eliminar la pista");
    }
  }, []);

  return (
    <section className="glass-card space-y-4 rounded-2xl border border-gold/20 p-5">
      <header className="flex items-center gap-2">
        <MusicIcon className="h-4 w-4 text-gold" />
        <div>
          <h3 className="font-display text-sm font-semibold">
            Playlist administrable
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Sube música original. Toda pista activa será escuchada por los
            usuarios con un botón de donación visible (mín. 25 MXN).
          </p>
        </div>
      </header>

      <div className="grid gap-2 md:grid-cols-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título de la pista"
          className="rounded-xl border border-border/30 bg-background/60 px-3 py-2 text-sm outline-none focus:border-gold/60"
        />
        <input
          value={artist}
          onChange={(event) => setArtist(event.target.value)}
          placeholder="Artista"
          className="rounded-xl border border-border/30 bg-background/60 px-3 py-2 text-sm outline-none focus:border-gold/60"
        />
      </div>

      <input
        type="file"
        accept="audio/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="block w-full text-xs file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gold/20 file:px-3 file:py-1.5 file:text-gold"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] text-muted-foreground">
          {file ? `Archivo seleccionado: ${file.name}` : "Ningún archivo seleccionado"}
        </span>
        <button
          onClick={handleUpload}
          disabled={!canPublish}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold/80 via-gold to-amber-400 px-4 py-2 text-xs font-semibold text-primary-foreground shadow-gold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          Publicar pista
        </button>
      </div>

      <div className="mt-4">
        {loadingList ? (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Cargando playlist…
          </div>
        ) : tracks.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Aún no hay pistas publicadas.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border/20">
            {tracks.map((track) => (
              <li
                key={track.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-medium">
                    {track.title}
                  </p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {track.artist} ·{" "}
                    {track.audio_url ? "audio disponible" : "sin audio"}
                    {track.duration_seconds
                      ? ` · ${track.duration_seconds}s`
                      : null}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleActive(track)}
                    className={[
                      "rounded-lg px-2 py-1 text-[10px] font-mono border transition",
                      track.is_active
                        ? "border-emerald/40 text-emerald-400"
                        : "border-border/30 text-muted-foreground",
                    ].join(" ")}
                  >
                    {track.is_active ? "Activa" : "Oculta"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(track)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-500/30 px-2 py-1 text-red-400 transition hover:bg-red-500/5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
