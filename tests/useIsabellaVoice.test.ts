/**
 * ============================================================================
 * RDM Digital OS — useIsabellaVoice Hook Tests (Versión Robusta y Tipada)
 * Pruebas unitarias para la síntesis de voz dual (Cloud / Local Web Speech)
 * ============================================================================
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useIsabellaVoice } from "@/hooks/useIsabellaVoice";

type EventListenerCallback = () => void;
type ListenersMap = Record<string, EventListenerCallback[]>;

class MockAudio {
  public src: string = "";
  public currentTime: number = 0;
  private listeners: ListenersMap = {};

  public addEventListener = vi.fn((type: string, cb: EventListenerCallback) => {
    this.listeners[type] ||= [];
    this.listeners[type].push(cb);
  });

  public removeEventListener = vi.fn((type: string, cb: EventListenerCallback) => {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter((fn) => fn !== cb);
  });

  private emit(type: string): void {
    if (!this.listeners[type]) return;
    this.listeners[type].forEach((fn) => fn());
  }

  public play = vi.fn().mockImplementation(async function (this: MockAudio) {
    this.emit("play");
    setTimeout(() => this.emit("ended"), 10);
    return Promise.resolve();
  });

  public pause = vi.fn();
}

class MockSpeechSynthesisUtterance {
  public text: string;
  public lang: string = "";
  public rate: number = 1;
  public pitch: number = 1;
  public volume: number = 1;
  public onstart: ((e: Event) => void) | null = null;
  public onend: ((e: Event) => void) | null = null;
  public onerror: ((e: Event) => void) | null = null;

  constructor(text = "") {
    this.text = text;
  }
}

interface MockSpeechSynthesis {
  cancel: ReturnType<typeof vi.fn>;
  speak: ReturnType<typeof vi.fn>;
}

describe("useIsabellaVoice", () => {
  let mockSpeechSynthesis: MockSpeechSynthesis;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockSpeechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
        if (utterance.onstart) utterance.onstart(new Event("start"));
        setTimeout(() => {
          if (utterance.onend) utterance.onend(new Event("end"));
        }, 10);
      }),
    };

    vi.stubGlobal("speechSynthesis", mockSpeechSynthesis);
    vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);
    vi.stubGlobal("Audio", MockAudio);

    // Asegurar compatibilidad tipada con window
    if (typeof window !== "undefined") {
      (window as unknown as { speechSynthesis: MockSpeechSynthesis }).speechSynthesis = mockSpeechSynthesis;
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
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
    const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ audioUrl: "https://example.com/audio.mp3", mode: "cloud" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

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
    const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 })
    );

    const { result } = renderHook(() =>
      useIsabellaVoice({ preferredMode: "cloud", consentAudio: true })
    );

    await act(async () => {
      await result.current.speak("Hola fallback", { federation: "F6" });
    });

    expect(result.current.queue.length).toBeGreaterThan(0);
    mockFetch.mockRestore();
  });

  it("cancelAll limpia cola y estado correctamente", () => {
    const { result } = renderHook(() =>
      useIsabellaVoice({ preferredMode: "local", consentAudio: true })
    );

    act(() => {
      result.current.speak("Hola 1");
      result.current.speak("Hola 2");
    });

    expect(result.current.queue.length).toBeGreaterThan(0);

    act(() => {
      result.current.cancelAll();
    });

    expect(result.current.queue.length).toBe(0);
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("switchMode cambia dinámicamente entre cloud y local", () => {
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
