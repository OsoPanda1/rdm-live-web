import type { AiCompletionRequest, AiCompletionResponse, AiProvider } from "./index";
import { logger } from "@core-kernel/log";

export class GoogleGenAiProvider implements AiProvider {
  name = "google-genai";

  async complete(req: AiCompletionRequest): Promise<AiCompletionResponse> {
    logger.info("AI completion requested", {
      module: "ai-core",
      federation: "ai",
      model: req.model,
    });

    return {
      text: "Respuesta generada por Google GenAI (placeholder operacional).",
    };
  }
}
