import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRDMAuth } from "@/contexts/RDMAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Music, Upload, Trash2, Play, Pause, Loader2 } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string | null;
  description: string | null;
  storage_path: string;
  mime_type: string;
  duration_seconds: number | null;
  size_bytes: number | null;
  created_at: string;
}

const ACCEPTED = ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac"];

export default function MusicaAdmin() {
  const { user, hasRole, loading: authLoading } = useRDMAuth();
  const { toast } = useToast();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isAdmin = hasRole("admin");

  const loadSongs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setSongs((data ?? []) as Song[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadSongs();
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps -- intentional: fetch on auth state

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8">
        <Card><CardContent className="p-8 text-center">
          <h2 className="text-2xl font-display mb-2">Acceso restringido</h2>
          <p className="text-muted-foreground">Requiere rol de administrador.</p>
        </CardContent></Card>
      </div>
    );
  }

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast({ title: "Faltan datos", description: "Título y archivo son obligatorios.", variant: "destructive" });
      return;
    }
    if (!ACCEPTED.includes(file.type) && !/\.(mp3|m4a)$/i.test(file.name)) {
      toast({ title: "Formato no soportado", description: "Solo MP3 o M4A.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("songs").upload(path, file, {
        contentType: file.type || (ext === "m4a" ? "audio/mp4" : "audio/mpeg"),
        upsert: false,
      });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("songs").insert({
        title: title.trim(),
        artist: artist.trim() || null,
        description: description.trim() || null,
        storage_path: path,
        mime_type: file.type || (ext === "m4a" ? "audio/mp4" : "audio/mpeg"),
        size_bytes: file.size,
        uploaded_by: user.id,
      });
      if (insErr) throw insErr;

      toast({ title: "Canción subida", description: title });
      setTitle(""); setArtist(""); setDescription(""); setFile(null);
      const input = document.getElementById("song-file") as HTMLInputElement | null;
      if (input) input.value = "";
      loadSongs();
    } catch (e: unknown) {
      toast({ title: "Error al subir", description: e instanceof Error ? e.message : "Error desconocido", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handlePlay = async (song: Song) => {
    if (playingId === song.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    const { data, error } = await supabase.storage.from("songs").createSignedUrl(song.storage_path, 3600);
    if (error || !data) {
      toast({ title: "Error", description: error?.message ?? "No se pudo cargar", variant: "destructive" });
      return;
    }
    setAudioUrl(data.signedUrl);
    setPlayingId(song.id);
    setTimeout(() => audioRef.current?.play(), 50);
  };

  const handleDelete = async (song: Song) => {
    if (!confirm(`¿Eliminar "${song.title}"?`)) return;
    await supabase.storage.from("songs").remove([song.storage_path]);
    const { error } = await supabase.from("songs").delete().eq("id", song.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Eliminada" }); loadSongs(); }
  };

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Music className="h-7 w-7 text-accent" />
        <h1 className="text-3xl font-display">Panel de Música</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Subir nueva canción</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Título *" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Artista" value={artist} onChange={(e) => setArtist(e.target.value)} />
          <Textarea placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input
            id="song-file"
            type="file"
            accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a,audio/aac"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button onClick={handleUpload} disabled={uploading || !file || !title.trim()}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Subir
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Canciones ({songs.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : songs.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aún no hay canciones.</p>
          ) : (
            <ul className="space-y-2">
              {songs.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-md border border-border/50 p-3">
                  <Button size="icon" variant="ghost" onClick={() => handlePlay(s)}>
                    {playingId === s.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{s.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.artist ?? "—"} · {s.mime_type} · {(s.size_bytes ? (s.size_bytes / 1024 / 1024).toFixed(2) : "?")} MB
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(s)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="mt-4 w-full"
              onEnded={() => setPlayingId(null)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
