export type AiCompletionRequest = {
  model: "default" | "creative" | "safe";
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
};

export type AiCompletionResponse = {
  text: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
};

export interface AiProvider {
  complete(req: AiCompletionRequest): Promise<AiCompletionResponse>;
  name: string;
}

let currentProvider: AiProvider | null = null;

export function registerAiProvider(provider: AiProvider) {
  currentProvider = provider;
}

export function getAiProvider(): AiProvider {
  if (!currentProvider) {
    throw new Error("No AI provider registered");
  }
  return currentProvider;
}

export function clearAiProviderForTests() {
  currentProvider = null;
}
