#!/usr/bin/env tsx
/**
 * ============================================================================
 * RDM Digital OS — Submodule Sync Script (Versión Robusta)
 * Sincroniza y actualiza todos los repositorios del ecosistema de forma segura.
 * ============================================================================
 */

import { execSync } from "child_process";
import { existsSync } from "fs";

interface ModuleRef {
  readonly id: string;
  readonly repo: string;
  readonly path: string;
}

// Colores ANSI para una salida estructurada en consola
const COLOR = {
  RESET: "\x1b[0m",
  INFO: "\x1b[1;34m",
  SUCCESS: "\x1b[1;32m",
  WARN: "\x1b[1;33m",
  ERROR: "\x1b[1;31m",
} as const;

const log = {
  info: (msg: string) => console.log(`${COLOR.INFO}[INFO]${COLOR.RESET} ${msg}`),
  success: (msg: string) => console.log(`${COLOR.SUCCESS}[OK]${COLOR.RESET} ${msg}`),
  warn: (msg: string) => console.log(`${COLOR.WARN}[WARN]${COLOR.RESET} ${msg}`),
  error: (msg: string) => console.error(`${COLOR.ERROR}[ERROR]${COLOR.RESET} ${msg}`),
};

const MODULES: readonly ModuleRef[] = [
  { id: "real-del-monte-explorer", repo: "https://github.com/OsoPanda1/real-del-monte-explorer.git", path: "." },
  { id: "real-del-monte-twin", repo: "https://github.com/OsoPanda1/real-del-monte-twin.git", path: "packages/real-del-monte-twin" },
  { id: "rdm-digital-core", repo: "https://github.com/OsoPanda1/rdm-digital-2dbd42b0.git", path: "packages/rdm-digital-core" },
  { id: "rdm-smart-city-os", repo: "https://github.com/OsoPanda1/rdm-smart-city-os.git", path: "packages/rdm-smart-city-os" },
  { id: "real-del-monte-elevated", repo: "https://github.com/OsoPanda1/real-del-monte-elevated.git", path: "packages/real-del-monte-elevated" },
  { id: "citemesh-roots", repo: "https://github.com/OsoPanda1/citemesh-roots.git", path: "packages/citemesh-roots" },
  { id: "genesis-digytamv-nexus", repo: "https://github.com/OsoPanda1/genesis-digytamv-nexus.git", path: "packages/genesis-digytamv-nexus" },
  { id: "civilizational-core", repo: "https://github.com/OsoPanda1/civilizational-core.git", path: "packages/civilizational-core" },
  { id: "quantum-system-tamv", repo: "https://github.com/OsoPanda1/quantum-system-tamv.git", path: "packages/quantum-system-tamv" },
  { id: "rdm-digital-nodo-cero", repo: "https://github.com/OsoPanda1/rdm-digital-nodo-cero.git", path: "packages/rdm-digital-nodo-cero" },
  { id: "real-del-monte-explorer-11b3982a", repo: "https://github.com/OsoPanda1/real-del-monte-explorer-11b3982a.git", path: "packages/real-del-monte-explorer-11b3982a" },
  { id: "rdm-digital-2026", repo: "https://github.com/OsoPanda1/RDM-DIGITAL2026.git", path: "packages/rdm-digital-2026" },
] as const;

/**
 * Ejecuta comandos del sistema con protección de timeout y control de errores.
 */
function run(cmd: string, cwd?: string): string {
  try {
    return execSync(cmd, { stdio: "pipe", cwd, encoding: "utf-8", timeout: 30000 }).trim();
  } catch (e: unknown) {
    const err = e as { stderr?: string; message?: string };
    log.error(`Fallo en comando: ${cmd}`);
    if (err.stderr) {
      console.error(`    ${err.stderr.trim()}`);
    } else if (err.message) {
      console.error(`    ${err.message}`);
    }
    return "";
  }
}

/**
 * Comprueba si la ruta especificada es un árbol de trabajo Git válido.
 */
function isGitWorkTree(cwd: string): boolean {
  if (!existsSync(cwd)) return false;
  return run("git rev-parse --is-inside-work-tree", cwd) === "true";
}

/**
 * Obtiene el hash corto actual del repositorio.
 */
function getShortHash(cwd: string): string {
  if (!isGitWorkTree(cwd)) return "";
  return run("git rev-parse --short HEAD", cwd);
}

/**
 * Sincroniza e inicializa todos los submódulos de la lista de forma controlada.
 */
function syncSubmodules(): void {
  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║   RDM Digital OS — Ecosystem Sync (Robusto)       ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");

  log.info("Inicializando submódulos recursivamente...");
  run("git submodule update --init --recursive");

  let successCount = 0;
  let skippedCount = 0;

  for (const mod of MODULES) {
    if (mod.path === ".") continue;

    console.log(`\n── [Módulo] ${mod.id} ──`);
    log.info(`Ruta: ${mod.path}`);

    if (!existsSync(mod.path)) {
      log.warn("Ruta ausente — omitiendo referencia residual del ecosistema.");
      skippedCount++;
      continue;
    }

    const currentHash = getShortHash(mod.path);
    if (!currentHash) {
      log.warn("No inicializado correctamente — omitiendo.");
      skippedCount++;
      continue;
    }

    log.info(`Hash actual: ${currentHash}`);
    log.info("Obteniendo cambios remotos (fetch & pull --rebase)...");
    
    run("git fetch --all --prune && git pull --rebase", mod.path);
    const newHash = getShortHash(mod.path);

    if (currentHash === newHash) {
      log.success(`Sin cambios nuevos (${newHash})`);
    } else {
      log.success(`Actualizado: ${currentHash} -> ${newHash} ✓`);
    }
    successCount++;
  }

  console.log("\n───────────────────────────────────────────────────");
  log.success(`Sincronización completa. Módulos procesados: ${successCount} | Omitidos: ${skippedCount}`);
  console.log("💡 Revisa 'git status' y confirma tus cambios intencionalmente si los punteros cambiaron.\n");
}

/**
 * Muestra el estado actual formateado de los submódulos.
 */
function showStatus(): void {
  console.log("\n📊 Estado Actual de Módulos del Ecosistema:\n");
  console.log(`  ${"ID DE MÓDULO".padEnd(36)} ${"ESTADO / HASH"}`);
  console.log("  " + "─".repeat(54));

  for (const mod of MODULES) {
    const hash = getShortHash(mod.path);
    const status = hash ? `✓ ${hash}` : "✗ no inicializado";
    console.log(`  ${mod.id.padEnd(36)} ${status}`);
  }
  console.log();
}

// Manejo de argumentos CLI
const command = process.argv[2] ?? "sync";

switch (command) {
  case "sync":
    syncSubmodules();
    break;
  case "status":
    showStatus();
    break;
  default:
    log.error("Comando no reconocido.");
    console.log("Uso: tsx tools/rdmx-sync.ts [sync|status]");
    process.exit(1);
}
