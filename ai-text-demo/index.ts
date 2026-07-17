// tools/ai/text-demo.ts
// Nodo de prueba de streaming de texto con GPT-5.4
// Integra cardinalización mínima, observabilidad y EOCT básico.

import { streamText } from "ai";
import "dotenv/config";

type FederationContext = {
  nodeId: string;
  federation: string;
  useCase: string;
  environment: "dev" | "staging" | "prod";
  operator: string;
};

type TelemetryEvent = {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
  context: FederationContext;
  data?: Record<string, unknown>;
};

const FEDERATION_CONTEXT: FederationContext = {
  nodeId: process.env.NODE_ID || "nodo-cero-cli",
  federation: "F5", // IA y Automatización
  useCase: "text-demo-gpt54",
  environment: (process.env.NODE_ENV as "dev" | "staging" | "prod") || "dev",
  operator: process.env.OPERATOR_ID || "local-operator",
};

function emitTelemetry(event: TelemetryEvent) {
  // Por ahora, log a stdout; en RDM podrías mandar esto al endpoint de telemetría
  const payload = {
    ...event,
    timestamp: event.timestamp,
    context: event.context,
  };
  // Cardinalidad controlada: un solo JSON por evento
  // eslint-disable-next-line no-console
  console.log("[telemetry]", JSON.stringify(payload));
}

async function main() {
  const startedAt = new Date().toISOString();

  if (!process.env.OPENAI_API_KEY) {
    emitTelemetry({
      level: "error",
      message: "OPENAI_API_KEY no está definida en el entorno",
      timestamp: startedAt,
      context: FEDERATION_CONTEXT,
    });
    throw new Error("OPENAI_API_KEY no está definida en el entorno");
  }

  emitTelemetry({
    level: "info",
    message: "Iniciando text-demo con GPT-5.4",
    timestamp: startedAt,
    context: FEDERATION_CONTEXT,
    data: {
      model: "openai/gpt-5.4",
      promptSummary: "Invent a new holiday...",
    },
  });

  const result = streamText({
    model: "openai/gpt-5.4",
    prompt: "Invent a new holiday and describe its traditions.",
  });

  let streamedChars = 0;

  try {
    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
      streamedChars += textPart.length;
    }

    process.stdout.write("\n");

    const usage = await result.usage;

    emitTelemetry({
      level: "info",
      message: "text-demo completado",
      timestamp: new Date().toISOString(),
      context: FEDERATION_CONTEXT,
      data: {
        streamedChars,
        usage,
      },
    });

    // eslint-disable-next-line no-console
    console.log("Token usage:", usage);
  } catch (err) {
    emitTelemetry({
      level: "error",
      message:
        err instanceof Error ? err.message : "Error desconocido en text-demo",
      timestamp: new Date().toISOString(),
      context: FEDERATION_CONTEXT,
      data: {
        streamedChars,
      },
    });
    throw err;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Error en text-demo:", err);
});
