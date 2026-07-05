import { useState, useCallback, useRef, useEffect } from "react";

export interface VoiceClip {
  id: string;
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface VoiceEngineState {
  queue: VoiceClip[];
  currentClipId: string | null;
  isPlaying: boolean;
  isPaused: boolean;
  isSpeaking: boolean;
}

export function useIsabellaVoiceEngine() {
  const [state, setState] = useState<VoiceEngineState>({
    queue: [],
    currentClipId: null,
    isPlaying: false,
    isPaused: false,
    isSpeaking: false,
  });

  const queueRef = useRef<VoiceClip[]>([]);
  const currentRef = useRef<string | null>(null);
  const speakingRef = useRef(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  const syncState = useCallback(() => {
    setState({
      queue: [...queueRef.current],
      currentClipId: currentRef.current,
      isPlaying: queueRef.current.length > 0,
      isPaused: false,
      isSpeaking: speakingRef.current,
    });
  }, []);

  const playClip = useCallback(
    (clip: VoiceClip) => {
      const synth = synthRef.current;
      if (!synth) return;

      synth.cancel();
      currentRef.current = clip.id;
      speakingRef.current = true;
      syncState();

      const utterance = new SpeechSynthesisUtterance(clip.text);
      if (clip.voice) {
        const voices = synth.getVoices();
        const voiceName = clip.voice;
        const found = voices.find(
          (v) => v.name === voiceName || v.lang.startsWith(voiceName),
        );
        if (found) utterance.voice = found;
      }
      utterance.rate = clip.rate ?? 1;
      utterance.pitch = clip.pitch ?? 1;
      utterance.volume = clip.volume ?? 1;

      utterance.onend = () => {
        speakingRef.current = false;
        queueRef.current = queueRef.current.filter((c) => c.id !== clip.id);
        currentRef.current = null;
        syncState();

        if (queueRef.current.length > 0) {
          const next = queueRef.current[0];
          playClip(next);
        }
      };

      utterance.onerror = () => {
        speakingRef.current = false;
        queueRef.current = queueRef.current.filter((c) => c.id !== clip.id);
        currentRef.current = null;
        syncState();

        if (queueRef.current.length > 0) {
          const next = queueRef.current[0];
          playClip(next);
        }
      };

      synth.speak(utterance);
    },
    [syncState],
  );

  const enqueue = useCallback(
    (clip: VoiceClip) => {
      queueRef.current = [...queueRef.current, clip];
      syncState();

      if (!speakingRef.current && queueRef.current.length === 1) {
        playClip(clip);
      }
    },
    [syncState, playClip],
  );

  const speak = useCallback(
    (text: string, options?: Partial<Omit<VoiceClip, "id" | "text">>) => {
      const clip: VoiceClip = {
        id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        ...options,
      };
      enqueue(clip);
      return clip.id;
    },
    [enqueue],
  );

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    queueRef.current = [];
    currentRef.current = null;
    speakingRef.current = false;
    syncState();
  }, [syncState]);

  const pause = useCallback(() => {
    synthRef.current?.pause();
    setState((s) => ({ ...s, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    synthRef.current?.resume();
    setState((s) => ({ ...s, isPaused: false }));
  }, []);

  const removeFromQueue = useCallback(
    (clipId: string) => {
      queueRef.current = queueRef.current.filter((c) => c.id !== clipId);
      syncState();
    },
    [syncState],
  );

  return {
    ...state,
    speak,
    enqueue,
    stop,
    pause,
    resume,
    removeFromQueue,
  };
}
