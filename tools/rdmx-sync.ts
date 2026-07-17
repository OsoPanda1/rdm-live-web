#!/usr/bin/env tsx
// ============================================================================
// RDM Digital OS — Submodule Sync Script
// Pulls latest changes from all 8 ecosystem repos
// ============================================================================

import { execSync } from "child_process";
import { existsSync } from "fs";

interface ModuleRef {
  id: string;
  repo: string;
  path: string;
}

const MODULES: ModuleRef[] = [
  {
    id: "real-del-monte-explorer",
    repo: "https://github.com/OsoPanda1/real-del-monte-explorer.git",
    path: ".",
  },
  {
    id: "real-del-monte-twin",
    repo: "https://github.com/OsoPanda1/real-del-monte-twin.git",
    path: "packages/real-del-monte-twin",
  },
  {
    id: "rdm-digital-core",
    repo: "https://github.com/OsoPanda1/rdm-digital-2dbd42b0.git",
    path: "packages/rdm-digital-core",
  },
  {
    id: "rdm-smart-city-os",
    repo: "https://github.com/OsoPanda1/rdm-smart-city-os.git",
    path: "packages/rdm-smart-city-os",
  },
  {
    id: "real-del-monte-elevated",
    repo: "https://github.com/OsoPanda1/real-del-monte-elevated.git",
    path: "packages/real-del-monte-elevated",
  },
  {
    id: "citemesh-roots",
    repo: "https://github.com/OsoPanda1/citemesh-roots.git",
    path: "packages/citemesh-roots",
  },
  {
    id: "genesis-digytamv-nexus",
    repo: "https://github.com/OsoPanda1/genesis-digytamv-nexus.git",
    path: "packages/genesis-digytamv-nexus",
  },
  {
    id: "civilizational-core",
    repo: "https://github.com/OsoPanda1/civilizational-core.git",
    path: "packages/civilizational-core",
  },
  {
    id: "quantum-system-tamv",
    repo: "https://github.com/OsoPanda1/quantum-system-tamv.git",
    path: "packages/quantum-system-tamv",
  },
  {
    id: "rdm-digital-nodo-cero",
    repo: "https://github.com/OsoPanda1/rdm-digital-nodo-cero.git",
    path: "packages/rdm-digital-nodo-cero",
  },
  {
    id: "real-del-monte-explorer-11b3982a",
    repo: "https://github.com/OsoPanda1/real-del-monte-explorer-11b3982a.git",
    path: "packages/real-del-monte-explorer-11b3982a",
  },
  {
    id: "rdm-digital-2026",
    repo: "https://github.com/OsoPanda1/RDM-DIGITAL2026.git",
    path: "packages/rdm-digital-2026",
  },
];

function run(cmd: string, cwd?: string): string {
  try {
    return execSync(cmd, { stdio: "pipe", cwd, encoding: "utf-8" }).trim();
  } catch (e: unknown) {
    const err = e as { stderr?: string };
    console.error(`  ⚠ Command failed: ${cmd}`);
    if (err.stderr) console.error(`    ${err.stderr.trim()}`);
    return "";
  }
}

function isGitWorkTree(cwd: string): boolean {
  return existsSync(cwd) && run("git rev-parse --is-inside-work-tree", cwd) === "true";
}

function getShortHash(cwd: string): string {
  if (!isGitWorkTree(cwd)) return "";
  return run("git rev-parse --short HEAD", cwd);
}

function syncSubmodules(): void {
  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║   RDM Digital OS — Ecosystem Sync                ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");

  // Init submodules if they exist
  console.log("→ Initializing submodules...");
  run("git submodule update --init --recursive");

  for (const mod of MODULES) {
    if (mod.path === ".") continue;

    console.log(`\n── ${mod.id} ──`);
    console.log(`   Path: ${mod.path}`);

    if (!existsSync(mod.path)) {
      console.log("   ⚠ Path missing — skipping residual ecosystem reference");
      continue;
    }

    const hash = getShortHash(mod.path);
    if (hash) {
      console.log(`   Current: ${hash}`);
      console.log("   Pulling latest...");
      run("git fetch --all && git pull --rebase", mod.path);
      const newHash = getShortHash(mod.path);
      console.log(`   Updated: ${newHash}${hash === newHash ? " (no changes)" : " ✓"}`);
    } else {
      console.log("   ⚠ Not initialized — skipping");
    }
  }

  console.log(
    "\n✅ Sync complete. Review git status and commit intentionally if submodule pointers changed.\n",
  );
}

function showStatus(): void {
  console.log("\n📊 Module Status:\n");
  for (const mod of MODULES) {
    const hash = mod.path === "." ? getShortHash(".") : getShortHash(mod.path);
    const status = hash ? `✓ ${hash}` : "✗ not initialized";
    console.log(`  ${mod.id.padEnd(30)} ${status}`);
  }
  console.log();
}

const command = process.argv[2] ?? "sync";

switch (command) {
  case "sync":
    syncSubmodules();
    break;
  case "status":
    showStatus();
    break;
  default:
    console.log("Usage: tsx tools/rdmx-sync.ts [sync|status]");
}
