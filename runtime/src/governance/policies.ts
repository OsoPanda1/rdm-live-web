import type { RuntimeManifest, PluginConfig } from "../manifest/types.js";

export interface PolicyChange {
  timestamp: string;
  changedBy: string;
  section: string;
  previousValue: unknown;
  newValue: unknown;
  approvedBy: string[];
}

export class GovernanceController {
  private changeLog: PolicyChange[] = [];

  validateManifestChange(
    current: RuntimeManifest,
    proposed: RuntimeManifest,
    changedBy: string,
  ): { allowed: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (proposed.security_global_defaults.zero_trust_level !== current.security_global_defaults.zero_trust_level) {
      if (this.isRelaxed(proposed.security_global_defaults.zero_trust_level, current.security_global_defaults.zero_trust_level)) {
        reasons.push("Cannot relax zero_trust_level without multi-federation approval");
      }
    }

    if (proposed.security_global_defaults.deny_by_default_on_ambiguity === false) {
      reasons.push("Cannot disable deny_by_default_on_ambiguity without explicit federation council vote");
    }

    if (proposed.security_global_defaults.allow_dynamic_loading === true) {
      reasons.push("Cannot enable allow_dynamic_loading without security audit");
    }

    return {
      allowed: reasons.length === 0,
      reasons,
    };
  }

  recordChange(change: PolicyChange): void {
    this.changeLog.push(change);
  }

  private isRelaxed(proposed: string, current: string): boolean {
    const order = ["STRICT", "STANDARD", "PERMISSIVE"];
    return order.indexOf(proposed) > order.indexOf(current);
  }
}

export function getEffectiveRoles(plugin: PluginConfig): string[] {
  if (plugin.allowed_roles.includes("*")) {
    return ["admin", "operator", "viewer"];
  }
  return plugin.allowed_roles;
}

export function isFederationAllowed(plugin: PluginConfig, federationId: string): boolean {
  if (plugin.allowed_federations.includes("*")) return true;
  return plugin.allowed_federations.includes(federationId);
}
