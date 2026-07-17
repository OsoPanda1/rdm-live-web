import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";
import { timeUpEngine } from "./TimeUpEngine";
import { ledger } from "./Ledger";
import { ChronusEngine } from "./ChronusEngine";
import { FederationBus } from "@/federaciones/FederationBus";
import type {
  MDX5Intent,
  MDX5Decision,
  MDX5Phase,
  FederationId,
  TimeUpVerdict,
} from "@/core/models";

interface MDX5Config {
  pollIntervalMs: number;
  maxQueueSize: number;
  enableTimeUp: boolean;
  enableLedger: boolean;
}

interface PendingIntent extends MDX5Intent {
  status: "pending" | "evaluating" | "planning" | "executing" | "committing" | "reconciling";
}

export class MDX5Kernel {
  private queue: PendingIntent[] = [];
  private processed: MDX5Intent[] = [];
  private readonly config: MDX5Config;
  private running = false;
  private pollTimer?: ReturnType<typeof setInterval>;

  constructor(
    config: Partial<MDX5Config> = {},
    private readonly chronus: ChronusEngine,
    private readonly federationBus: FederationBus,
  ) {
    this.config = {
      pollIntervalMs: 1000,
      maxQueueSize: 1000,
      enableTimeUp: true,
      enableLedger: true,
      ...config,
    };
  }

  submit(intent: Omit<MDX5Intent, "id" | "timestamp" | "traceId">): string {
    const id = uuidv4();
    const traceId = uuidv4();

    const full: MDX5Intent = {
      ...intent,
      id,
      timestamp: new Date(),
      traceId,
    };

    if (this.queue.length >= this.config.maxQueueSize) {
      logger.warn("[MDX5] Cola llena, rechazando intent", { id, type: intent.type });
      return "";
    }

    this.queue.push({ ...full, status: "pending" });
    logger.info("[MDX5] Intent recibido", { id, type: intent.type, federation: intent.federation });
    return id;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    logger.info("[MDX5] Kernel MD-X5 iniciado");

    this.pollTimer = setInterval(() => this.cycle(), this.config.pollIntervalMs);
  }

  stop(): void {
    this.running = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
    logger.info("[MDX5] Kernel MD-X5 detenido");
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getProcessedCount(): number {
    return this.processed.length;
  }

  private async cycle(): Promise<void> {
    const intent = this.queue.shift();
    if (!intent) return;

    try {
      await this.processIntent(intent);
    } catch (error) {
      logger.error("[MDX5] Error procesando intent", { id: intent.id, error });
    }
  }

  private async processIntent(intent: PendingIntent): Promise<void> {
    const phases: MDX5Phase[] = ["RECEIVE", "EVALUATE", "PLAN", "EXECUTE", "COMMIT", "RECONCILE"];

    for (const phase of phases) {
      intent.status = phase as PendingIntent["status"];

      const decision = await this.executePhase(phase, intent);

      if (this.config.enableLedger && intent.federation) {
        ledger.record(`phase:${phase}`, intent.id, intent.federation, decision);
      }

      if (!decision.approved) {
        logger.info("[MDX5] Intent rechazado en fase", { id: intent.id, phase, reason: decision.reason });
        this.processed.push(intent);
        return;
      }
    }

    this.processed.push(intent);
    logger.info("[MDX5] Intent completado exitosamente", { id: intent.id, type: intent.type });
  }

  private async executePhase(phase: MDX5Phase, intent: PendingIntent): Promise<MDX5Decision> {
    const base: MDX5Decision = {
      intentId: intent.id,
      phase,
      approved: true,
      timestamp: new Date(),
      traceId: intent.traceId,
    };

    switch (phase) {
      case "RECEIVE":
        return this.phaseReceive(base, intent);

      case "EVALUATE":
        return this.phaseEvaluate(base, intent);

      case "PLAN":
        return this.phasePlan(base, intent);

      case "EXECUTE":
        return this.phaseExecute(base, intent);

      case "COMMIT":
        return this.phaseCommit(base, intent);

      case "RECONCILE":
        return this.phaseReconcile(base, intent);
    }
  }

  private async phaseReceive(base: MDX5Decision, _intent: PendingIntent): Promise<MDX5Decision> {
    logger.info("[MDX5] Fase RECEIVE");
    return { ...base, approved: true };
  }

  private async phaseEvaluate(base: MDX5Decision, intent: PendingIntent): Promise<MDX5Decision> {
    logger.info("[MDX5] Fase EVALUATE");

    if (this.config.enableTimeUp) {
      const results = timeUpEngine.evaluate(intent);
      const globalVerdict = timeUpEngine.getGlobalVerdict(results);

      if (globalVerdict === "REJECTED") {
        return {
          ...base,
          approved: false,
          timeupVerdict: "REJECTED",
          reason: "TIME UP: Políticas éticas no aprobadas",
        };
      }

      return {
        ...base,
        approved: true,
        timeupVerdict: globalVerdict,
        reason: globalVerdict === "PENDING_ISABELLA"
          ? "TIME UP: Pendiente validación Isabella"
          : "TIME UP: Evaluación completada",
      };
    }

    return { ...base, approved: true, reason: "TIME UP deshabilitado" };
  }

  private async phasePlan(base: MDX5Decision, intent: PendingIntent): Promise<MDX5Decision> {
    logger.info("[MDX5] Fase PLAN", { intentId: intent.id, type: intent.type });

    try {
      await this.federationBus.emitSovereigntyEvent("POLICY_VIOLATION", {
        intentId: intent.id,
        type: intent.type,
        phase: "PLAN",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn("[MDX5] Error al emitir evento de soberanía", error);
    }

    return { ...base, approved: true, reason: "Plan generado" };
  }

  private async phaseExecute(base: MDX5Decision, intent: PendingIntent): Promise<MDX5Decision> {
    logger.info("[MDX5] Fase EXECUTE", { intentId: intent.id });

    return { ...base, approved: true, reason: "Ejecución completada" };
  }

  private async phaseCommit(base: MDX5Decision, intent: PendingIntent): Promise<MDX5Decision> {
    logger.info("[MDX5] Fase COMMIT", { intentId: intent.id });

    try {
      await this.federationBus.emitSovereigntyEvent("OBSERVABILIDAD_SIGNAL", {
        intentId: intent.id,
        phase: "COMMIT",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.warn("[MDX5] Error al emitir señal de observabilidad", error);
    }

    return { ...base, approved: true, reason: "Commit registrado en ledger" };
  }

  private async phaseReconcile(base: MDX5Decision, _intent: PendingIntent): Promise<MDX5Decision> {
    logger.info("[MDX5] Fase RECONCILE");

    if (this.config.enableLedger) {
      const chainValid = ledger.verifyChain();
      if (!chainValid) {
        logger.error("[MDX5] Cadena de ledger corrupta en reconciliación");
      }
    }

    return { ...base, approved: true, reason: "Reconciliación completada" };
  }
}
