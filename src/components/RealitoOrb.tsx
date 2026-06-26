// @ts-nocheck
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, ShieldCheck, Activity } from "lucide-react";
import { applyDecisionToHeptafederation, getTelemetry, getGlobalHealth } from "@/lib/heptafederation";
import { useIsabellaSSE } from "@/hooks/useIsabellaSSE";
import ReactMarkdown from "react-markdown";
import { useCivicEvent } from "@/hooks/useCivicEvent";
import { logger } from "@/lib/logger";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = import.meta.env.VITE_ISABELLA_URL
  ? `${import.meta.env.VITE_ISABELLA_URL}/urban-chat`
  : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/realito-chat`;

export function RealitoOrb() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy **Realito**, tu guía cognitivo de Real del Monte. Pregúntame sobre comida, historia, aventura, hospedaje o cultura. 🏔️",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { decision, connectionState } = useIsabellaSSE();
  const emit = useCivicEvent();

  const modules = useMemo(() => applyDecisionToHeptafederation(decision ?? undefined), [decision]);
  const telemetry = getTelemetry(modules);
  const globalHealth = getGlobalHealth(modules);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const body = import.meta.env.VITE_ISABELLA_URL
        ? { text: userMsg.content, context: { traceId: decision?.traceId } }
        : {
            traceId: decision?.traceId,
            territory: decision?.territory ?? "RDM",
            decision,
            messages: allMessages
              .filter((m) => m.id !== "welcome")
              .map((m) => ({ role: m.role, content: m.content })),
          };

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        throw new Error("Stream failed");
      }

      if (import.meta.env.VITE_ISABELLA_URL) {
        const data = await resp.json();
        const response = data.response ?? "ISABELLA no pudo responder en este momento.";
        setMessages((prev) => [
          ...prev,
          { id: `a_${Date.now()}`, role: "assistant", content: response },
        ]);
        await emit({
          type: "AI_INTERACTION",
          federation: "MDD_TAMV",
          payload: {
            text: userMsg.content,
            intent: data.intent ?? "CHARLA_GENERAL",
            sentiment: data.sentiment ?? "neutral",
          },
          source: "WEB_PORTAL",
          correlationId: decision?.traceId,
        });
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        throw new Error("Stream failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const assistantId = `a_${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const upsert = (chunk: string) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.id !== assistantId) return prev;
          return [...prev.slice(0, -1), { ...last, content: assistantContent }];
        });
      };

      let streamEnded = false;
      while (!streamEnded) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.slice(line.startsWith("data: ") ? 6 : 5).trim();
          if (!jsonStr) continue;
          if (jsonStr === "[DONE]") {
            streamEnded = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      await emit({
        type: "AI_INTERACTION",
        federation: "MDD_TAMV",
        payload: {
          text: userMsg.content,
          intent: "CHAT_STREAM",
          response: assistantContent,
        },
        source: "WEB_PORTAL",
        correlationId: decision?.traceId,
      });
    } catch (e) {
      logger.error("Realito error:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content:
            "La bruma de la sierra interrumpió la señal. Explora el centro histórico y sus minas tradicionales mientras reconecto. ⛏️",
        },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-accent flex items-center justify-center orb-pulse hover:scale-110 transition-transform shadow-2xl"
          >
            <Sparkles className="w-6 h-6 text-accent-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[560px] rounded-2xl glass shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center relative">
                    <Sparkles className="w-5 h-5 text-accent-foreground" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background bg-success" />
                  </div>
                  <div>
                    <p className="text-sm font-display font-bold">Realito AI</p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      Núcleo Heptafederado · v4.1
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {telemetry.map((t) => (
                  <div
                    key={t.id}
                    className="flex-1 group relative"
                    title={`${t.label}: ${t.status}%`}
                  >
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${t.status}%`,
                          background:
                          t.status > 95
                              ? "hsl(var(--success))"
                              : t.status > 85
                              ? "hsl(var(--accent))"
                              : "hsl(var(--destructive))",
                        }}
                      />
                    </div>
                  </div>
                ))}
                <span className="text-[9px] text-muted-foreground font-body ml-1">
                  {(globalHealth * 100).toFixed(0)}%
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground font-body">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-accent" />
                  PQC · Kyber-1024
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-accent" />
                  SSE: {connectionState}
                </span>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-body ${
                      msg.role === "user"
                        ? "bg-accent text-accent-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-accent [&_h3]:text-base [&_h3]:font-display [&_h3]:mb-2">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: i * 0.2,
                          }}
                          className="w-1.5 h-1.5 rounded-full bg-accent"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="¿Qué quieres explorar?"
                  disabled={isLoading}
                  className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm font-body outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-accent-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
