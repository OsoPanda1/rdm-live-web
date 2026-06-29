import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { cacheGet, cacheSet } from "../../lib/cache.js";
import { encryptPayload } from "../../lib/crypto.js";
import { prisma } from "../../lib/prisma.js";
import { culturalGuardian } from "../../middleware/culturalGuardian.js";
import { executeSkillPlan, planFromPrompt } from "./sovereign.planner.js";

export type SovereignContext = {
  userId?: string;
  locale?: string;
  twin?: { id?: string; [key: string]: unknown };
  channel?: "realito" | "isabella" | "system" | string;
};

export class SovereignEngine {
  private static localModel = process.env.SOVEREIGN_LOCAL_MODEL || "phi3-mini";
  private static localCmd = process.env.SOVEREIGN_LOCAL_CMD || "ollama";

  static async processRequest(context: SovereignContext, prompt: string): Promise<string> {
    const key = cacheKeyFor(context, prompt);
    const cached = await cacheGet(key);
    if (typeof cached === "string") {
      return cached;
    }

    const startedAt = Date.now();
    let source: "local" | "gateway" | "skill-only" = "local";
    let rawResponse = "";

    try {
      const plan = await planFromPrompt(prompt, context);
      if (plan.kind === "skill-only") {
        rawResponse = await executeSkillPlan(plan, context);
        source = "skill-only";
      } else {
        rawResponse = await SovereignEngine.queryLocalSLM(context, plan.promptForModel);
        source = "local";
      }
    } catch (error) {
      console.warn("[SovereignEngine] local failure; using gateway", error);
      rawResponse = await SovereignEngine.queryExternalSecureGateway(context, prompt);
      source = "gateway";
    }

    const finalResponse = culturalGuardian(rawResponse, context);
    await cacheSet(key, finalResponse, 300);

    if (prisma) {
      const aiInteractionLog = (prisma as unknown as { aiInteractionLog?: { create: (input: unknown) => Promise<unknown> } }).aiInteractionLog;
      await aiInteractionLog
        ?.create({
          data: {
            userId: context.userId ?? "anon",
            channel: context.channel ?? "realito",
            sourceModel: source,
            prompt,
            response: finalResponse,
            latencyMs: Date.now() - startedAt,
          },
        })
        .catch((error: unknown) => {
          console.warn("[SovereignEngine] aiInteractionLog create failed", error);
        });
    }

    return finalResponse;
  }

  private static async queryLocalSLM(context: SovereignContext, prompt: string): Promise<string> {
    const fullPrompt = `${buildSystemPrompt(context)}\nUsuario: ${sanitizePrompt(prompt)}`;

    return await new Promise((resolve, reject) => {
      const proc = spawn(this.localCmd, ["run", this.localModel], { stdio: ["pipe", "pipe", "pipe"] });
      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf8");
      });

      proc.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8");
      });

      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Local SLM exited with code ${code}: ${stderr}`));
          return;
        }

        resolve(stdout.trim());
      });

      proc.stdin.write(fullPrompt);
      proc.stdin.end();
    });
  }

  private static async queryExternalSecureGateway(context: SovereignContext, prompt: string): Promise<string> {
    const url = process.env.SOVEREIGN_GATEWAY_URL;
    if (!url) {
      return "[Soberano] Modelo local no disponible y gateway externo no configurado.";
    }

    const payload = encryptPayload({
      context: {
        locale: context.locale || "es-MX",
        twinId: context.twin?.id,
        channel: context.channel || "realito",
      },
      prompt: anonymizePrompt(prompt),
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Gateway responded with ${response.status}`);
    }

    return (await response.text()).trim();
  }
}

function cacheKeyFor(context: SovereignContext, prompt: string): string {
  const hash = createHash("sha256");
  hash.update(`${context.userId || "anon"}|${context.channel || "realito"}|${prompt}`);
  return `sovereign:${hash.digest("hex")}`;
}

function sanitizePrompt(prompt: string): string {
  return prompt.replace(/\s+/g, " ").trim();
}

function anonymizePrompt(prompt: string): string {
  return prompt
    .replace(/[0-9]{6,}/g, "[NUM]")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/g, "[EMAIL]");
}

function buildSystemPrompt(context: SovereignContext): string {
  return [
    "Eres un agente AI local basado en TAMV MD-X4.",
    `Canal: ${context.channel ?? "realito"}.`,
    `Gemelo: ${JSON.stringify(context.twin ?? {})}`,
    "Prioriza hechos verificables de Real del Monte.",
    "Si no hay certeza, pide confirmación breve.",
  ].join("\n");
}
