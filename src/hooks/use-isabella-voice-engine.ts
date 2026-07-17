/**
 * Isabella AI Voice Engine — Real TTS Integration
 * Uses Web Speech API for client-side TTS with emotion-aware voice selection.
 * Integrates with Isabella's consciousness pipeline for contextual voice responses.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface VoiceClip {
  id: string;
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  emotion?: string;
  onEnd?: () => void;
}

interface VoiceEngineState {
  speaking: boolean;
  paused: boolean;
  queue: VoiceClip[];
  currentClip: VoiceClip | null;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
}

// Emotion → voice parameter mapping (Isabella's vocal signature: 220Hz, 145 WPM, neutral Mexican)
const EMOTION_VOICE_PARAMS: Record<string, { rate: number; pitch: number; volume: number }> = {
  neutral: { rate: 0.9, pitch: 1.0, volume: 1.0 },
  alegria: { rate: 1.0, pitch: 1.15, volume: 1.0 },
  tristeza: { rate: 0.75, pitch: 0.9, volume: 0.8 },
  miedo: { rate: 1.1, pitch: 1.2, volume: 0.7 },
  ira: { rate: 1.15, pitch: 1.1, volume: 1.0 },
  ansiedad: { rate: 1.05, pitch: 1.1, volume: 0.85 },
  soledad: { rate: 0.8, pitch: 0.95, volume: 0.75 },
  esperanza: { rate: 0.95, pitch: 1.05, volume: 0.9 },
  amor: { rate: 0.85, pitch: 1.0, volume: 0.95 },
};

function getEmotionParams(emotion?: string): { rate: number; pitch: number; volume: number } {
  if (!emotion) return EMOTION_VOICE_PARAMS.neutral;
  return EMOTION_VOICE_PARAMS[emotion] ?? EMOTION_VOICE_PARAMS.neutral;
}

function selectSpanishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // Prefer Mexican Spanish, then any Spanish
  const mexican = voices.find(v => v.lang === 'es-MX');
  if (mexican) return mexican;
  const spanish = voices.find(v => v.lang.startsWith('es'));
  if (spanish) return spanish;
  return voices[0] ?? null;
}

export function useIsabellaVoiceEngine() {
  const [state, setState] = useState<VoiceEngineState>({
    speaking: false,
    paused: false,
    queue: [],
    currentClip: null,
    supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    voices: [],
  });

  const queueRef = useRef<VoiceClip[]>([]);
  const currentClipRef = useRef<VoiceClip | null>(null);
  const processingRef = useRef(false);

  // Load available voices
  useEffect(() => {
    if (!state.supported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setState(prev => ({ ...prev, voices }));
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [state.supported]);

  const processQueue = useCallback(() => {
    if (processingRef.current || queueRef.current.length === 0) return;
    processingRef.current = true;

    const clip = queueRef.current[0]!;
    currentClipRef.current = clip;

    setState(prev => ({
      ...prev,
      speaking: true,
      paused: false,
      currentClip: clip,
      queue: [...queueRef.current.slice(1)],
    }));

    const utterance = new SpeechSynthesisUtterance(clip.text);
    const voice = selectSpanishVoice(state.voices);
    if (voice) utterance.voice = voice;
    utterance.lang = clip.lang ?? 'es-MX';

    const params = getEmotionParams(clip.emotion);
    utterance.rate = clip.rate ?? params.rate;
    utterance.pitch = clip.pitch ?? params.pitch;
    utterance.volume = clip.volume ?? params.volume;

    utterance.onend = () => {
      clip.onEnd?.();
      queueRef.current = queueRef.current.slice(1);
      currentClipRef.current = null;
      processingRef.current = false;

      setState(prev => ({
        ...prev,
        speaking: queueRef.current.length > 0,
        currentClip: null,
        queue: [...queueRef.current],
      }));

      // Process next clip
      if (queueRef.current.length > 0) {
        setTimeout(processQueue, 50);
      }
    };

    utterance.onerror = (event) => {
      console.error('[Isabella Voice] Error:', event.error);
      clip.onEnd?.();
      queueRef.current = queueRef.current.slice(1);
      currentClipRef.current = null;
      processingRef.current = false;

      setState(prev => ({
        ...prev,
        speaking: false,
        currentClip: null,
        queue: [...queueRef.current],
      }));

      if (queueRef.current.length > 0) {
        setTimeout(processQueue, 100);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [state.voices]);

  const speak = useCallback((text: string, options: { emotion?: string; rate?: number; pitch?: number } = {}) => {
    if (!state.supported) return;

    const clip: VoiceClip = {
      id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text,
      emotion: options.emotion,
      rate: options.rate,
      pitch: options.pitch,
    };

    // Stop current speech and clear queue
    window.speechSynthesis.cancel();
    queueRef.current = [clip];
    processingRef.current = false;

    setState(prev => ({
      ...prev,
      queue: [clip],
      currentClip: null,
    }));

    setTimeout(processQueue, 50);
  }, [state.supported, processQueue]);

  const enqueue = useCallback((clip: VoiceClip) => {
    if (!state.supported) return;
    queueRef.current.push(clip);
    setState(prev => ({
      ...prev,
      queue: [...queueRef.current],
    }));
    if (!processingRef.current) {
      processQueue();
    }
  }, [state.supported, processQueue]);

  const stop = useCallback(() => {
    if (!state.supported) return;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    processingRef.current = false;
    currentClipRef.current = null;
    setState(prev => ({
      ...prev,
      speaking: false,
      paused: false,
      queue: [],
      currentClip: null,
    }));
  }, [state.supported]);

  const pause = useCallback(() => {
    if (!state.supported) return;
    window.speechSynthesis.pause();
    setState(prev => ({ ...prev, paused: true }));
  }, [state.supported]);

  const resume = useCallback(() => {
    if (!state.supported) return;
    window.speechSynthesis.resume();
    setState(prev => ({ ...prev, paused: false }));
  }, [state.supported]);

  const removeFromQueue = useCallback((clipId: string) => {
    queueRef.current = queueRef.current.filter(c => c.id !== clipId);
    setState(prev => ({
      ...prev,
      queue: [...queueRef.current],
    }));
  }, []);

  return {
    speaking: state.speaking,
    paused: state.paused,
    queue: state.queue,
    currentClip: state.currentClip,
    supported: state.supported,
    speak,
    enqueue,
    stop,
    pause,
    resume,
    removeFromQueue,
  };
}
