import express, { Request, Response } from "express";
import { spawn } from "node:child_process";
import { logger } from "@/lib/logger"; // Asegúrate de tener tu logger centralizado

const app = express();
app.use(express.json());

// Configuración de umbrales
const ROLLBACK_TRIGGERS = ["HighFallbackRate", "HighLatencyP95"];
const SCRIPT_PATH = "/opt/rdmx/scripts/rollback_last_release.sh";

/**
 * Ejecución asíncrona no bloqueante
 */
async function triggerRollback(reason: string) {
  logger.warn("[AUTO-REMEDIATE] Iniciando rollback...", { reason });

  const child = spawn(SCRIPT_PATH, [], { stdio: "inherit" });

  child.on("close", (code) => {
    if (code === 0) {
      logger.info("[AUTO-REMEDIATE] Rollback completado con éxito");
    } else {
      logger.error(`[AUTO-REMEDIATE] Rollback falló con código ${code}`);
    }
  });

  child.on("error", (err) => {
    logger.error("[AUTO-REMEDIATE] Error crítico al ejecutar el script", { err });
  });
}

app.post("/alerts", async (req: Request, res: Response) => {
  // 1. Validación robusta del payload
  const alerts = req.body?.alerts;
  if (!Array.isArray(alerts)) {
    return res.status(400).json({ error: "Payload inválido: 'alerts' es requerido" });
  }

  // 2. Identificación de causas
  const activeAlerts = alerts.map((a: any) => a?.labels?.alertname).filter(Boolean);
  const shouldRollback = activeAlerts.some((name: string) => ROLLBACK_TRIGGERS.includes(name));

  if (shouldRollback) {
    // Disparamos sin esperar a que termine para no bloquear la respuesta HTTP
    triggerRollback(activeAlerts.join(", "));
    return res.status(202).json({ message: "Proceso de remediación iniciado" });
  }

  res.status(200).json({ message: "No se requiere acción" });
});

app.listen(8081, () => {
  logger.info("AutoRemediate operativo en puerto 8081");
});
