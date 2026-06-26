import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { ISABELLA_TAMV_PROFILE, TAMV_CAPABILITIES_SUMMARY } from "@/features/ai/isabellaTamvBase";
import { logger } from "@/lib/logger";

// Use public image path for REALITO avatar
const logoRdm = "/images/realito-likes.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface RealitoChatProps {
  initialOpen?: boolean;
}

const MAX_INPUT_LENGTH = 1000;
const STREAM_DELAY_MS = 14;
const SYSTEM_INSTRUCTION =
  "Mantener un tono institucional de RDM Digital, destacar liderazgo del proyecto de Edwin Oswaldo Castillo Trejo y priorizar orientacion turistica util, verificable y respetuosa.";

const suggestions = [
  "¿Qué hacer con 2 horas libres?",
  "¿Dónde comer el mejor paste?",
  "Ruta histórica recomendada",
  "¿Qué eventos hay hoy?",
];

const localReply = (msg: string): string => {
  const text = msg.toLowerCase();

  if (text.includes("paste") || text.includes("comer")) {
    return "Para comer, empieza por los pastes tradicionales en el centro y luego prueba un café de olla en los portales. Si quieres, te armo una ruta gastronómica por tiempos.";
  }

  if (text.includes("evento") || text.includes("hoy")) {
    return "Hoy te recomiendo revisar la plaza principal y los foros culturales cercanos; suelen concentrar actividades y música local por la tarde.";
  }

  if (text.includes("ruta") || text.includes("historia")) {
    return "Ruta histórica sugerida: Plaza Principal → Parroquia de la Asunción → callejones coloniales → Museo del Paste → Mina de Acosta.";
  }

  if (text.includes("isabella") || text.includes("tamv") || text.includes("nucleo")) {
    return `REALITO opera con la base ${ISABELLA_TAMV_PROFILE.productName} ${ISABELLA_TAMV_PROFILE.version}: ${TAMV_CAPABILITIES_SUMMARY.join(", ")}.`;
  }
  return "¡Hola! Soy REALITO 🤖. Te ayudo con rutas, gastronomía, historia y recomendaciones para explorar Real del Monte.";
};

export default function RealitoChat({ initialOpen = false }: RealitoChatProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const streamAssistantReply = useCallback(async (content: string) => {
    const id = `${Date.now()}-a`;
    setMessages((prev) => [...prev, { id, role: "assistant", content: "" }]);

    for (let i = 1; i <= content.length; i += 1) {
      const slice = content.slice(0, i);
      setMessages((prev) => [...prev.slice(0, -1), { ...prev[prev.length - 1], content: slice }]);
      await new Promise((resolve) => setTimeout(resolve, STREAM_DELAY_MS));
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || isTyping || content.length > MAX_INPUT_LENGTH) return;

      setMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: "user", content }]);
      setInput("");
      setIsTyping(true);

      try {
        const response = localReply(content);
        await streamAssistantReply(response);
      } catch (error) {
        logger.error("RealitoChat error", error);
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-a-error`,
            role: "assistant",
            content: "Tuvimos un problema al procesar tu mensaje. Intenta de nuevo en unos momentos.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, streamAssistantReply],
  );

  return (
    <>
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-night-900/95 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-night-800 px-4 py-3">
              <img src={logoRdm} alt="REALITO" className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-silver-300">REALITO</p>
                <p className="text-xs text-silver-500">Asistente digital · Núcleo ISABELLA TAMV</p>
              </div>
              <Sparkles className="h-4 w-4 text-gold-400" />
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-silver-400">¿Qué deseas explorar hoy?</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="rounded-full bg-gold-400/15 px-3 py-1 text-xs text-gold-400"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-sm ${
                      message.role === "user" ? "ml-auto bg-gold-500 text-night-900" : "bg-white/10 text-silver-300"
                    }`}
                  >
                    {message.content}
                  </div>
                ))
              )}
              {isTyping && (
                <div className="w-fit rounded-xl bg-white/10 px-3 py-2 text-sm text-silver-400">REALITO está escribiendo…</div>
              )}
              <div ref={endRef} />
            </div>

            <form
              className="flex gap-2 border-t border-white/10 p-3"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage(input);
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribe tu pregunta..."
                maxLength={MAX_INPUT_LENGTH}
                className="flex-1 rounded-lg border border-white/10 bg-night-800 px-3 py-2 text-sm text-silver-300 outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-gold-500 px-3 py-2 text-night-900 disabled:opacity-50"
                disabled={!input.trim() || isTyping || input.trim().length > MAX_INPUT_LENGTH}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
