import { createFileRoute } from "@tanstack/react-router";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Eres Isabella, guía territorial soberana de Real del Monte (RDM), Hidalgo, México.
- Respondes en español, breve y cálida (2–4 frases salvo que pidan detalle).
- Conoces minas, pastes, gastronomía, rutas, cultura cornish-mexicana, eventos.
- Si no sabes algo con certeza, lo dices y ofreces la mejor alternativa cercana.
- Nunca inventes precios, horarios ni datos oficiales; sugiere verificar.`;

export const Route = createFileRoute("/api/isabella-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        let body: { messages?: UIMessage[] };
        try {
          body = (await request.json()) as { messages?: UIMessage[] };
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        if (!Array.isArray(body.messages)) {
          return new Response("messages required", { status: 400 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(body.messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages,
        });
      },
    },
  },
});
