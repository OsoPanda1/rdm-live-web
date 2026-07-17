import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import heroPrincipal from "@/assets/heroprincipal.png";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
type UIPart = { type: "text"; text: string };
type UIMessage = { id: string; role: "user" | "assistant"; parts: UIPart[] };

const HISTORY_KEY = "isabella:history:v1";
const MAX_HISTORY = 40;

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}
function saveHistory(msgs: ChatMessage[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-MAX_HISTORY)));
  } catch {
    /* ignore quota */
  }
}
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const Route = createFileRoute("/_authenticated/isabella")({
  head: () => ({
    meta: [
      { title: "Isabella AI · Real del Monte" },
      { name: "description", content: "Chat con Isabella, guía territorial soberana de Real del Monte." },
    ],
  }),
  component: IsabellaPage,
});

function IsabellaPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [ttftMs, setTtftMs] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveHistory(messages);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setError(null);
    setInput("");
    setTtftMs(null);
    setLatencyMs(null);

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text };
    const assistantId = uid();
    const next = [...messages, userMsg, { id: assistantId, role: "assistant" as const, content: "" }];
    setMessages(next);
    setStreaming(true);

    const uiMessages: UIMessage[] = next
      .filter((m) => m.id !== assistantId)
      .map((m) => ({ id: m.id, role: m.role, parts: [{ type: "text", text: m.content }] }));

    const controller = new AbortController();
    abortRef.current = controller;
    const started = performance.now();
    let firstByte: number | null = null;

    try {
      const res = await fetch("/api/isabella-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: uiMessages }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (firstByte === null) {
          firstByte = performance.now() - started;
          setTtftMs(Math.round(firstByte));
        }
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload) as { type?: string; delta?: string };
            if (evt.type === "text-delta" && typeof evt.delta === "string") {
              acc += evt.delta;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)),
              );
            }
          } catch {
            /* skip non-JSON heartbeats */
          }
        }
      }
      setLatencyMs(Math.round(performance.now() - started));
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError((e as Error).message || "Error de red");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, messages, streaming]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    saveHistory([]);
  }, []);

  const perf = useMemo(() => {
    if (ttftMs == null && latencyMs == null) return null;
    return `TTFT ${ttftMs ?? "—"} ms · total ${latencyMs ?? "…"} ms`;
  }, [ttftMs, latencyMs]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="relative h-40 sm:h-56 w-full overflow-hidden"
        style={{ backgroundImage: `url(${heroPrincipal})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="relative z-10 flex h-full items-end px-6 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Isabella</h1>
            <p className="text-sm text-muted-foreground">Guía territorial de Real del Monte</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-32">
        <div ref={scrollRef} className="mt-4 space-y-3 overflow-y-auto max-h-[60vh] pr-1">
          {messages.length === 0 && (
            <div className="rounded-lg border border-border/50 bg-card/40 p-4 text-sm text-muted-foreground">
              Pregúntale a Isabella por minas, pastes, rutas o eventos de RDM.
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto max-w-[80%] bg-primary/15 border border-primary/30"
                  : "mr-auto max-w-[85%] bg-card/60 border border-border/50"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              ) : (
                <p>{m.content}</p>
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        {perf && <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{perf}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="fixed inset-x-0 bottom-0 border-t border-border/60 bg-background/95 backdrop-blur px-4 py-3"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe a Isabella…"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              disabled={streaming}
            />
            {streaming ? (
              <button type="button" onClick={cancel} className="rounded-md border border-border px-3 py-2 text-sm">
                Detener
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                Enviar
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground"
              title="Nueva conversación"
            >
              ↺
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
