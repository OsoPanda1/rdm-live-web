import { motion, AnimatePresence } from "framer-motion";
import { Bot, Brain, ShieldAlert, MapPin, Thermometer, TrendingUp, Sparkles, Send, Terminal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const capabilities = [
  { icon: MapPin, title: "Sugerencias Predictivas", description: "Recomienda negocios y experiencias premium según densidad de jugadores, tiempo de estancia y contexto climático.", accent: "gold" },
  { icon: TrendingUp, title: "Regulación Económica", description: "Ajusta valor virtual de minerales según saturación de zonas, redistribución de flujo y metas de la DAO.", accent: "electric" },
  { icon: ShieldAlert, title: "Protección Antifraude", description: "Detección de GPS spoofing, velocidades imposibles (>120 km/h) y bloqueo automático de minería sospechosa.", accent: "destructive" },
  { icon: Thermometer, title: "Energía de Zona", description: "Analiza densidad de jugadores, historial de consumo y contexto temporal para recomendar rutas óptimas.", accent: "teal" },
];

const accentStyles: Record<string, { border: string; icon: string; bg: string }> = {
  gold: { border: "border-gold/15 hover:border-gold/30", icon: "text-gold", bg: "bg-gold/10" },
  electric: { border: "border-electric/15 hover:border-electric/30", icon: "text-electric", bg: "bg-electric/10" },
  destructive: { border: "border-destructive/15 hover:border-destructive/30", icon: "text-destructive", bg: "bg-destructive/10" },
  teal: { border: "border-teal/15 hover:border-teal/30", icon: "text-teal", bg: "bg-teal/10" },
};

const quickPrompts = [
  "¿Dónde comer el mejor paste?",
  "Cuéntame la historia minera",
  "¿Qué rutas de senderismo hay?",
  "¿Cómo funciona Veta Soberana?",
];

export default function RealitoAI() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMsgs = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMsgs }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Error de conexión" }));
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${err.error || "Error al conectar con Realito AI"}` }]);
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Error de red. Intenta de nuevo." }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-[1400px]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
        <motion.div whileHover={{ rotate: 5, scale: 1.05 }} className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-electric glow-electric">
          <Bot className="h-7 w-7 text-white" />
        </motion.div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-1">Oráculo Cognitivo</p>
          <h1 className="text-4xl font-display font-bold tracking-tight">Realito AI</h1>
          <p className="text-sm font-body text-muted-foreground">Tu guía inteligente de Real del Monte</p>
        </div>
      </motion.div>

      {/* Architecture */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-7">
        <div className="flex items-center gap-2 mb-5">
          <Brain className="h-4 w-4 text-ore" />
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Arquitectura Cognitiva</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "FRAMEWORK", value: "Isabella", desc: "Motor cognitivo TAMV", color: "text-foreground" },
            { label: "INSTANCIA", value: "Realito AI", desc: "Entrenada para RDM", color: "text-electric" },
            { label: "RADARES", value: "Horus + Anubis", desc: "Seguimientos y seguridad", color: "text-gold" },
          ].map((block) => (
            <div key={block.label} className="glass rounded-2xl p-5 text-center hover:border-gold/15 transition-colors">
              <p className="text-[9px] font-mono text-muted-foreground tracking-widest">{block.label}</p>
              <p className={cn("mt-2 text-xl font-display font-bold", block.color)}>{block.value}</p>
              <p className="text-[11px] font-body text-muted-foreground mt-1">{block.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Capabilities grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {capabilities.map((cap) => {
          const styles = accentStyles[cap.accent];
          return (
            <motion.div key={cap.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={cn("glass rounded-2xl p-6 transition-all duration-300", styles.border)}>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl mb-4", styles.bg)}>
                <cap.icon className={cn("h-5 w-5", styles.icon)} />
              </div>
              <h3 className="text-xl font-display font-bold">{cap.title}</h3>
              <p className="mt-2 text-[13px] font-body text-muted-foreground leading-relaxed">{cap.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Live Chat Terminal */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-gold rounded-3xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gold/10">
          <Terminal className="h-3.5 w-3.5 text-gold/60" />
          <p className="text-[10px] font-mono text-gold/60 tracking-widest uppercase">Realito AI — Chat en Vivo</p>
          <div className="ml-auto flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald/60 animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-gold/40" />
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          </div>
        </div>

        {/* Messages */}
        <div className="p-6 space-y-4 font-mono text-sm max-h-[400px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="mx-auto h-8 w-8 text-gold/40 mb-4" />
              <p className="text-muted-foreground text-[13px] font-body">Pregúntame sobre Real del Monte</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {quickPrompts.map((p) => (
                  <button key={p} onClick={() => sendMessage(p)}
                    className="text-[11px] font-body px-3 py-1.5 rounded-full glass hover:border-gold/20 text-muted-foreground hover:text-gold transition-all">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                {msg.role === "user" ? (
                  <><span className="text-electric font-bold shrink-0">▸</span><span className="text-secondary-foreground">{msg.content}</span></>
                ) : (
                  <><Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" /><span className="leading-relaxed whitespace-pre-wrap">{msg.content}</span></>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 items-center">
              <Loader2 className="h-4 w-4 text-gold animate-spin" />
              <span className="text-muted-foreground text-[12px]">Realito está pensando...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gold/10 px-6 py-4">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-3">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading}
              placeholder="Pregunta a Realito..." className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 outline-none text-sm font-mono" />
            <button type="submit" disabled={isLoading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold hover:bg-gold/20 transition-colors disabled:opacity-30">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
