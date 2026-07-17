import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FALLBACK_PLAYLIST } from "../data/playlist";

export interface Track {
  id?: string;
  slug: string;
  title: string;
  artist: string;
  cover_url?: string | null;
  audio_url?: string | null;
  duration_seconds: number;
  moods: string[];
  territories: string[];
  donation_url?: string | null;
}

export function useMusicPlayer({ autoplay = false }: { autoplay?: boolean } = {}) {
  const { data: tracks = FALLBACK_PLAYLIST as Track[] } = useQuery({
    queryKey: ["music_tracks"],
    queryFn: async (): Promise<Track[]> => {
      const { data, error } = await supabase
        .from("music_tracks")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error || !data || data.length === 0) return FALLBACK_PLAYLIST as Track[];
      return data as Track[];
    },
    staleTime: 60_000,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const currentTrack = tracks[currentIndex] ?? tracks[0];

  const cancelRAF = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const updateProgress = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.duration > 0) setProgress(a.currentTime / a.duration);
    if (!a.paused) rafRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const ensureAudio = useCallback(() => {
    if (!currentTrack?.audio_url) return null;
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.audio_url);
      audioRef.current.preload = "auto";
    } else if (!audioRef.current.src.endsWith(currentTrack.audio_url)) {
      audioRef.current.src = currentTrack.audio_url;
      audioRef.current.load();
    }
    audioRef.current.volume = volume;
    return audioRef.current;
  }, [currentTrack, volume]);

  const registerPlay = useCallback(async (trackId?: string) => {
    if (!trackId) return;
    try { await supabase.from("music_plays").insert({ track_id: trackId }); } catch {}
  }, []);

  const play = useCallback(async () => {
    const a = ensureAudio();
    if (!a) { setIsPlaying(true); return; } // sin audio_url: estado "playing" visual
    try {
      await a.play();
      setIsPlaying(true);
      cancelRAF();
      rafRef.current = requestAnimationFrame(updateProgress);
      registerPlay(currentTrack?.id);
    } catch {
      setIsPlaying(false);
    }
  }, [ensureAudio, updateProgress, currentTrack, registerPlay]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    cancelRAF();
  }, []);

  const togglePlay = useCallback(() => (isPlaying ? pause() : play()), [isPlaying, pause, play]);

  const seek = useCallback((ratio: number) => {
    const a = audioRef.current;
    const r = Math.min(Math.max(ratio, 0), 1);
    if (a && a.duration) { a.currentTime = a.duration * r; }
    setProgress(r);
  }, []);

  const setPlayerVolume = useCallback((v: number) => {
    const n = Math.min(Math.max(v, 0), 1);
    setVolume(n);
    if (audioRef.current) audioRef.current.volume = n;
  }, []);

  const next = useCallback(() => {
    pause(); setProgress(0);
    setCurrentIndex((i) => (i + 1) % tracks.length);
  }, [pause, tracks.length]);

  const previous = useCallback(() => {
    pause(); setProgress(0);
    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
  }, [pause, tracks.length]);

  const selectBySlug = useCallback((slug: string) => {
    const idx = tracks.findIndex((t) => t.slug === slug);
    if (idx >= 0) { pause(); setProgress(0); setCurrentIndex(idx); }
  }, [tracks, pause]);

  useEffect(() => () => { cancelRAF(); audioRef.current?.pause(); audioRef.current = null; }, []);
  useEffect(() => { if (autoplay && tracks.length) play(); }, [autoplay, tracks.length, play]);

  // simulated progress when no audio_url
  useEffect(() => {
    if (!isPlaying || currentTrack?.audio_url) return;
    const start = Date.now() - progress * currentTrack.duration_seconds * 1000;
    const id = window.setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const p = Math.min(elapsed / currentTrack.duration_seconds, 1);
      setProgress(p);
      if (p >= 1) { setIsPlaying(false); next(); }
    }, 250);
    return () => clearInterval(id);
  }, [isPlaying, currentTrack, next]); // eslint-disable-line

  return useMemo(() => ({
    tracks, currentTrack, currentIndex,
    isPlaying, progress, volume,
    play, pause, togglePlay, seek, setVolume: setPlayerVolume,
    next, previous, selectBySlug,
  }), [tracks, currentTrack, currentIndex, isPlaying, progress, volume, play, pause, togglePlay, seek, setPlayerVolume, next, previous, selectBySlug]);
}
