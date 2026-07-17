import { logger } from "@/lib/logger";
import { mdx5 } from "@/kernel/index";
import { knowledgeEngine } from "@/isabella/knowledge/KnowledgeAbsorptionEngine";
import { ledger } from "@/kernel/engine/Ledger";

export type ShutdownLevel = "GRACEFUL" | "EMERGENCY" | "CRITICAL_FAILURE";

interface ShutdownEvent {
  level: ShutdownLevel;
  reason: string;
  initiatedBy: string;
  timestamp: Date;
  stages: ShutdownStage[];
}

interface ShutdownStage {
  name: string;
  status: "PENDING" | "COMPLETED" | "SKIPPED" | "FAILED";
  durationMs: number;
}

export class ShutdownProtocol {
  private shutdownInProgress = false;
  private lastShutdown: ShutdownEvent | null = null;

  async initiate(level: ShutdownLevel, reason: string, initiatedBy = "SYSTEM"): Promise<ShutdownEvent> {
    if (this.shutdownInProgress) {
      logger.warn("[SHUTDOWN] Apagado ya en progreso");
      throw new Error("Shutdown already in progress");
    }

    this.shutdownInProgress = true;
    const startTime = Date.now();
    const stages: ShutdownStage[] = [];

    logger.info("[SHUTDOWN] Iniciando apagado", { level, reason, initiatedBy });

    stages.push(await this.stopKernel(level));
    stages.push(await this.stopKnowledgeEngine(level));
    stages.push(await this.verifyLedger(level));
    stages.push(await this.flushPending(level));
    stages.push(await this.closeConnections(level));

    const event: ShutdownEvent = {
      level,
      reason,
      initiatedBy,
      timestamp: new Date(),
      stages,
    };

    this.lastShutdown = event;
    this.shutdownInProgress = false;

    const totalDuration = Date.now() - startTime;
    logger.info("[SHUTDOWN] Apagado completado", { level, totalDurationMs: totalDuration });

    return event;
  }

  isShuttingDown(): boolean {
    return this.shutdownInProgress;
  }

  getLastShutdown(): ShutdownEvent | null {
    return this.lastShutdown;
  }

  private async stopKernel(level: ShutdownLevel): Promise<ShutdownStage> {
    const start = Date.now();
    try {
      if (level === "GRACEFUL") {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      mdx5.stop();
      return { name: "stopKernel", status: "COMPLETED", durationMs: Date.now() - start };
    } catch (error) {
      return { name: "stopKernel", status: "FAILED", durationMs: Date.now() - start };
    }
  }

  private async stopKnowledgeEngine(level: ShutdownLevel): Promise<ShutdownStage> {
    const start = Date.now();
    try {
      knowledgeEngine.stop();
      return { name: "stopKnowledgeEngine", status: "COMPLETED", durationMs: Date.now() - start };
    } catch (error) {
      return { name: "stopKnowledgeEngine", status: level === "CRITICAL_FAILURE" ? "SKIPPED" : "FAILED", durationMs: Date.now() - start };
    }
  }

  private async verifyLedger(level: ShutdownLevel): Promise<ShutdownStage> {
    const start = Date.now();
    try {
      const valid = ledger.verifyChain();
      if (!valid && level !== "CRITICAL_FAILURE") {
        logger.error("[SHUTDOWN] Ledger corrupto durante apagado");
      }
      return { name: "verifyLedger", status: "COMPLETED", durationMs: Date.now() - start };
    } catch (error) {
      return { name: "verifyLedger", status: "SKIPPED", durationMs: Date.now() - start };
    }
  }

  private async flushPending(level: ShutdownLevel): Promise<ShutdownStage> {
    const start = Date.now();
    try {
      if (level === "GRACEFUL") {
        const queueSize = mdx5.getQueueSize();
        if (queueSize > 0) {
          logger.info("[SHUTDOWN] Esperando drenaje de cola", { queueSize });
          await new Promise(resolve => setTimeout(resolve, Math.min(queueSize * 10, 3000)));
        }
      }
      return { name: "flushPending", status: "COMPLETED", durationMs: Date.now() - start };
    } catch (error) {
      return { name: "flushPending", status: "FAILED", durationMs: Date.now() - start };
    }
  }

  private async closeConnections(level: ShutdownLevel): Promise<ShutdownStage> {
    const start = Date.now();
    try {
      if (level === "GRACEFUL") {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      return { name: "closeConnections", status: "COMPLETED", durationMs: Date.now() - start };
    } catch (error) {
      return { name: "closeConnections", status: "FAILED", durationMs: Date.now() - start };
    }
  }
}

export const shutdownProtocol = new ShutdownProtocol();
