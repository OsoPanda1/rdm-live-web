import { useCallback, useEffect, useRef, useState } from "react";

export type IsabellaVoiceMode = "local" | "cloud";

export interface IsabellaVoiceContext {
  federation?: "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7";
  useCase?: "turismo" | "comercio" | "gobernanza" | "comunidad" | "general";
  language?: string;
}

interface TtsIsabellaResponse {
  audioUrl: string;
  mode: IsabellaVoiceMode;
}

interface UseIsabellaVoiceOptions {
  preferredMode?: IsabellaVoiceMode;
  consentAudio?: boolean;
}

interface AudioClip {
  id: string;
  text: string;
  audioUrl?: string;
  mode: IsabellaVoiceMode;
  context?: IsabellaVoiceContext;
}

const TTS_ENDPOINT = import.meta.env.VITE_TTS_ENDPOINT || "/api/tts-isabella";

export function useIsabellaVoice(options: UseIsabellaVoiceOptions = {}) {
  const { preferredMode = "cloud", consentAudio = true } = options;

  const [mode, setMode] = useState<IsabellaVoiceMode>(preferredMode);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [queue, setQueue] = useState<AudioClip[]>([]);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef(false);
  const playNextFromQueueRef = useRef<() => void>(() => {});

  const hasWebSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

  // Removes the finished clip from the head of the queue and starts the next.
  const finishCurrentClip = useCallback(() => {
    isPlayingRef.current = false;
    setIsSpeaking(false);
    setQueue((prev) => prev.slice(1));
  }, []);

  const ensureAudioElement = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audioRef.current = audio;
      audio.addEventListener("ended", () => {
        isPlayingRef.current = false;
        setIsSpeaking(false);
        playNextFromQueueRef.current();
      });
      audio.addEventListener("error", () => {
        finishCurrentClip();
        setError("Error reproduciendo cloud TTS");
        playNextFromQueueRef.current();
      });
    }
  }, [finishCurrentClip]);

  const playNextFromQueue = useCallback(() => {
    // The currently-playing clip stays at the head of the queue while it plays
    // and is only removed once playback ends (see finishCurrentClip), so the
    // queue always reflects pending + in-flight clips.
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      if (isPlayingRef.current) return prev;

      const next = prev[0];
      isPlayingRef.current = true;
      setIsSpeaking(true);

      if (next.mode === "local") {
        if (!hasWebSpeech) {
          isPlayingRef.current = false;
          setIsSpeaking(false);
          setError("Web Speech API no disponible");
          return prev.slice(1);
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(next.text);
        speechUtteranceRef.current = utterance;
        utterance.lang = next.context?.language ?? "es-MX";
        if (next.context?.federation === "F6" || next.context?.useCase === "comunidad") {
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
        } else if (next.context?.federation === "F4" || next.context?.useCase === "comercio") {
          utterance.rate = 1.1;
          utterance.pitch = 1.05;
        }
        utterance.onstart = () => { isPlayingRef.current = true; setIsSpeaking(true); };
        utterance.onend = () => { finishCurrentClip(); playNextFromQueue(); };
        utterance.onerror = () => { finishCurrentClip(); setError("Error en síntesis local"); };
        window.speechSynthesis.speak(utterance);
        return prev;
      }

      if (next.mode === "cloud" && next.audioUrl) {
        ensureAudioElement();
        const audioEl = audioRef.current;
        if (!audioEl) {
          isPlayingRef.current = false;
          setIsSpeaking(false);
          return prev.slice(1);
        }
        audioEl.src = next.audioUrl;
        audioEl.currentTime = 0;
        audioEl.onplay = () => { isPlayingRef.current = true; setIsSpeaking(true); };
        audioEl.onended = () => { finishCurrentClip(); playNextFromQueue(); };
        audioEl.onerror = () => {
          finishCurrentClip();
          setError("Error reproduciendo cloud TTS");
          playNextFromQueueRef.current();
        };
        audioEl.play().catch(() => {
          finishCurrentClip();
          playNextFromQueueRef.current();
        });
        return prev;
      }

      isPlayingRef.current = false;
      setIsSpeaking(false);
      return prev.slice(1);
    });
  }, [hasWebSpeech, ensureAudioElement, finishCurrentClip]);

  // Keep ref in sync so ensureAudioElement can call playNextFromQueue without a dep cycle
  playNextFromQueueRef.current = playNextFromQueue;

  const fetchCloudTts = useCallback(async (
    text: string,
    context?: IsabellaVoiceContext
  ): Promise<TtsIsabellaResponse | null> => {
    try {
      const res = await fetch(TTS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          context: {
            federation: context?.federation ?? "F6",
            useCase: context?.useCase ?? "general",
            language: context?.language ?? "es-MX",
          },
        }),
      });
      if (!res.ok) throw new Error(`TTS request failed with status ${res.status}`);
      const data = (await res.json()) as TtsIsabellaResponse;
      if (!data.audioUrl) throw new Error("Edge Function no devolvió audioUrl");
      return { audioUrl: data.audioUrl, mode: data.mode ?? "cloud" };
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error en tts-isabella");
      return null;
    }
  }, []);

  const speak = useCallback(
    async (text: string, context?: IsabellaVoiceContext) => {
      setError(null);
      if (!consentAudio) {
        setError("Audio deshabilitado por configuración del usuario");
        return;
      }

      if (mode === "cloud") {
        const resp = await fetchCloudTts(text, context);
        const clip: AudioClip = {
          id: `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
          text,
          audioUrl: resp?.audioUrl,
          mode: resp ? "cloud" : (hasWebSpeech ? "local" : "cloud"),
          context,
        };
        setQueue((prev) => [...prev, clip]);
        if (!isPlayingRef.current) playNextFromQueue();
        return;
      }

      if (hasWebSpeech) {
        const clip: AudioClip = {
          id: `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
          text,
          mode: "local",
          context,
        };
        setQueue((prev) => [...prev, clip]);
        if (!isPlayingRef.current) playNextFromQueue();
        return;
      }

      const resp = await fetchCloudTts(text, context);
      if (resp?.audioUrl) {
        const clip: AudioClip = {
          id: `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
          text,
          audioUrl: resp.audioUrl,
          mode: "cloud",
          context,
        };
        setQueue((prev) => [...prev, clip]);
        if (!isPlayingRef.current) playNextFromQueue();
      }
    },
    [mode, consentAudio, hasWebSpeech, fetchCloudTts, playNextFromQueue]
  );

  const cancelAll = useCallback(() => {
    setQueue([]);
    isPlayingRef.current = false;
    setIsSpeaking(false);
    setError(null);
    if (hasWebSpeech) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [hasWebSpeech]);

  const switchMode = useCallback((nextMode: IsabellaVoiceMode) => {
    cancelAll();
    setMode(nextMode);
  }, [cancelAll]);

  useEffect(() => {
    return () => cancelAll();
  }, [cancelAll]);

  return { mode, isSpeaking, queue, error, speak, cancelAll, switchMode };
}
