/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useIsabellaVoice } from "@/hooks/useIsabellaVoice";

class MockAudio {
  src = "";
  currentTime = 0;
  private listeners: Record<string, Array<() => void>> = {};
  addEventListener = vi.fn((type: string, cb: () => void) => {
    (this.listeners[type] ||= []).push(cb);
  });
  removeEventListener = vi.fn((type: string, cb: () => void) => {
    this.listeners[type] = (this.listeners[type] || []).filter((fn) => fn !== cb);
  });
  private emit(type: string) {
    (this.listeners[type] || []).forEach((fn) => fn());
  }
  play = vi.fn().mockImplementation(function (this: MockAudio) {
    this.emit("play");
    setTimeout(() => this.emit("ended"), 10);
    return Promise.resolve();
  });
  pause = vi.fn();
}

class MockSpeechSynthesisUtterance {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  volume = 1;
  onstart: ((e: Event) => void) | null = null;
  onend: ((e: Event) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  constructor(text = "") {
    this.text = text;
  }
}

describe("useIsabellaVoice", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Stub only the APIs the hook needs, keeping the jsdom `window`/document
    // intact so React and Testing Library continue to work.
    const speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
        // Fire start synchronously but end asynchronously, mirroring real
        // speech playback so the enqueued clip is observable while "playing".
        if (utterance.onstart) utterance.onstart(new Event("start"));
        setTimeout(() => { if (utterance.onend) utterance.onend(new Event("end")); }, 10);
      }),
    };
    vi.stubGlobal("speechSynthesis", speechSynthesis);
    (window as any).speechSynthesis = speechSynthesis;
    vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);
    vi.stubGlobal("Audio", MockAudio);
  });

  it("no habla si consentAudio=false", () => {
    const { result } = renderHook(() =>
      useIsabellaVoice({ preferredMode: "cloud", consentAudio: false })
    );

    act(() => {
      result.current.speak("Hola Real del Monte");
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.queue.length).toBe(0);
  });

  it("usa modo local si preferredMode=local y Web Speech disponible", () => {
    const { result } = renderHook(() =>
      useIsabellaVoice({ preferredMode: "local", consentAudio: true })
    );

    act(() => {
      result.current.speak("Hola local", { federation: "F6", useCase: "comunidad" });
    });

    expect(result.current.queue.length).toBeGreaterThan(0);
  });

  it("encola clips en modo cloud y llama al endpoint TTS", async () => {
    const mockFetch = vi.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: true,
      json: async () => ({ audioUrl: "https://example.com/audio.mp3", mode: "cloud" }),
    } as any);

    const { result } = renderHook(() =>
      useIsabellaVoice({ preferredMode: "cloud", consentAudio: true })
    );

    await act(async () => {
      await result.current.speak("Hola desde cloud", { federation: "F6" });
    });

    expect(mockFetch).toHaveBeenCalled();
    mockFetch.mockRestore();
  });

  it("hace fallback a local cuando Cloud TTS falla", async () => {
    vi.spyOn(globalThis, "fetch" as any).mockResolvedValue({
      ok: false,
      status: 500,
    } as any);

    const { result } = renderHook(() =>
      useIsabellaVoice({ preferredMode: "cloud", consentAudio: true })
    );

    await act(async () => {
      await result.current.speak("Hola fallback", { federation: "F6" });
    });

    expect(result.current.queue.length).toBeGreaterThan(0);
  });

  it("cancelAll limpia cola y estado", () => {
    const { result } = renderHook(() =>
      useIsabellaVoice({ preferredMode: "local", consentAudio: true })
    );

    act(() => {
      result.current.speak("Hola 1");
      result.current.speak("Hola 2");
    });

    const beforeQueue = result.current.queue.length;
    expect(beforeQueue).toBeGreaterThan(0);

    act(() => {
      result.current.cancelAll();
    });

    expect(result.current.queue.length).toBe(0);
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("switchMode cambia entre cloud y local", () => {
    const { result } = renderHook(() =>
      useIsabellaVoice({ preferredMode: "cloud", consentAudio: true })
    );

    expect(result.current.mode).toBe("cloud");

    act(() => {
      result.current.switchMode("local");
    });

    expect(result.current.mode).toBe("local");

    act(() => {
      result.current.switchMode("cloud");
    });

    expect(result.current.mode).toBe("cloud");
  });
});
