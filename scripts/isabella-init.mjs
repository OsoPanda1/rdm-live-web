#!/usr/bin/env node
/**
 * ============================================================================
 * RDM Digital OS — Isabella Bootstrap Initialization (Versión Blindada)
 * Inicializa y valida el esquema base de Isabella en Supabase de forma resiliente.
 * ============================================================================
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const NODE_ID = process.env.NODE_ID || "nodo-cero-web";
const ENV = ["production", "staging"].includes(process.env.NODE_ENV)
  ? process.env.NODE_ENV
  : "dev";

// Modo estricto opcional: si es "true", la falta de tablas críticas aborta la ejecución
const STRICT_MODE = process.env.STRICT_TABLE_CHECK === "true";

function log(message, data = {}) {
  const payload = {
    ts: new Date().toISOString(),
    node: NODE_ID,
    env: ENV,
    message,
    data,
  };
  console.log("[isabella:init]", JSON.stringify(payload));
}

/**
 * Ejecuta una operación asíncrona con reintentos y backoff exponencial.
 */
async function retryOperation(fn, retries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;
      log(`Intento ${attempt} fallido. Reintentando en ${delayMs}ms...`, { error: error.message });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= 2;
    }
  }
}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || !url.startsWith("http")) {
    log("Configuración de Supabase inválida o faltante", { urlProvided: !!url, keyProvided: !!key });
    throw new Error("SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorios y deben tener un formato válido.");
  }

  // Cliente optimizado para entornos CLI / Serverless (sin persistencia de sesión)
  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const tablesToCheck = [
    "ai_prompts_log",
    "isabella_ontology",
    "audit_log",
    "pipeline_results_unified",
    "territorial_data_collection",
    "metrics_aggregates",
  ];

  log("Iniciando validación de esquema para Isabella", { tablesToCheck });

  // Comprobación de tablas con tolerancia a fallos de red
  const tableInfo = await retryOperation(async () => {
    const { data, error } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .in("table_name", tablesToCheck);

    if (error) throw new Error(error.message);
    return data;
  });

  const existingTables = (tableInfo || []).map((t) => t.table_name);
  const missingTables = tablesToCheck.filter((t) => !existingTables.includes(t));

  log("Resultado de verificación de tablas", { existingTables, missingTables });

  if (missingTables.length > 0) {
    log("Alerta: Faltan tablas críticas para Isabella", { missingTables });
    if (STRICT_MODE) {
      throw new Error(`Modo estricto activado: Faltan tablas obligatorias: ${missingTables.join(", ")}`);
    }
  }

  // Registro del evento de bootstrap con trazabilidad robusta
  const bootstrapEvent = {
    node_id: NODE_ID,
    env: ENV,
    source: "isabella-init",
    model: "bootstrap",
    prompt: "ISABELLA_INIT",
    response: JSON.stringify({
      existingTables,
      missingTables,
      strictMode: STRICT_MODE,
    }),
    trace_id: `bootstrap-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  };

  await retryOperation(async () => {
    const { error } = await supabase.from("ai_prompts_log").insert(bootstrapEvent);
    if (error) throw new Error(error.message);
  });

  log("Inicialización de Isabella completada exitosamente", { bootstrapEventId: "ai_prompts_log" });
}

main().catch((err) => {
  log("Error fatal en la inicialización de Isabella", { error: err.message || String(err) });
  process.exit(1);
});
