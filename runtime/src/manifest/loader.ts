import { readFileSync, existsSync } from "node:fs";
import type { RuntimeManifest, ValidationResult } from "./types.js";

const REQUIRED_SECTIONS = [
  "manifest_version",
  "runtime_identity",
  "security_global_defaults",
  "trusted_domains",
  "failure_policies",
  "telemetry_policies",
  "performance_policies",
  "plugins",
] as const;

export function validateManifest(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Manifest must be a JSON object"] };
  }
  const manifest = data as Record<string, unknown>;

  for (const key of REQUIRED_SECTIONS) {
    if (!(key in manifest)) {
      errors.push(`Missing required section: ${key}`);
    }
  }

  if (manifest.plugins && Array.isArray(manifest.plugins)) {
    for (const plugin of manifest.plugins) {
      if (!plugin || typeof plugin !== "object") continue;
      const p = plugin as Record<string, unknown>;
      if (!p.id) errors.push("Plugin missing required field: id");
      if (!p.risk_level) errors.push(`Plugin ${p.id ?? "unknown"} missing risk_level`);
      if (!p.sandbox_profile) errors.push(`Plugin ${p.id ?? "unknown"} missing sandbox_profile`);
      if (!p.allowed_roles) errors.push(`Plugin ${p.id ?? "unknown"} missing allowed_roles`);
      if (!p.quotas) errors.push(`Plugin ${p.id ?? "unknown"} missing quotas`);
    }
  }

  return { valid: errors.length === 0, errors };
}

let cachedManifest: RuntimeManifest | null = null;

export function loadManifest(filePath?: string): RuntimeManifest {
  const path = filePath ?? new URL("../../config/rdm-runtime-manifest.json", import.meta.url).pathname;

  if (!existsSync(path)) {
    throw new Error(`Manifest not found at: ${path}`);
  }

  const raw = readFileSync(path, "utf-8");
  const data = JSON.parse(raw) as RuntimeManifest;

  const validation = validateManifest(data);
  if (!validation.valid) {
    throw new Error(`Manifest validation failed:\n  ${validation.errors.join("\n  ")}`);
  }

  cachedManifest = data;
  return data;
}

export function getManifest(): RuntimeManifest {
  if (!cachedManifest) {
    return loadManifest();
  }
  return cachedManifest;
}
