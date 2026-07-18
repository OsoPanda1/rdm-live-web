import type { SovereigntyPolicy } from "../types"
import type { Jurisdiction, GeolocationProvider } from "./provider"

export function buildSovereigntyJurisdiction(
  policy: SovereigntyPolicy,
): Jurisdiction {
  const base: Jurisdiction = {
    allowedCountries: policy.governance_mode === "strict_sovereignty" ? ["MX"] : ["MX", "*"],
    requiresLocalHosting: policy.enforce_local_encryption,
    priorityRank: policy.governance_mode === "strict_sovereignty" ? 100 : 50,
  }
  return base
}

export function filterProvidersByPolicy(
  providers: GeolocationProvider[],
  policy: SovereigntyPolicy,
  ip: string,
): GeolocationProvider[] {
  const applicable = providers.filter(p => {
    const matchesRule = policy.provider_selection_rules.some(rule => {
      if (rule.condition.includes("offline_autonomous") || rule.condition.includes("degraded_isolation")) {
        return p.jurisdiction().requiresLocalHosting
      }
      if (rule.condition.includes("threat_level")) {
        return rule.target_providers?.includes(p.name())
      }
      return true
    })
    return matchesRule
  })
  return applicable.length > 0 ? applicable : providers
}

export function obfuscateIp(ip: string, mask: string): string {
  if (mask === "/24") {
    const parts = ip.split(".")
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`
    }
  }
  if (mask === "/16") {
    const parts = ip.split(".")
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.0.0`
    }
  }
  return ip
}
