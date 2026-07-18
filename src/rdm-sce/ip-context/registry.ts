import type { GeolocationProvider, IPContext, Jurisdiction } from "./provider"

export class ProviderRegistry {
  private providers: GeolocationProvider[] = []

  register(provider: GeolocationProvider): void {
    this.providers.push(provider)
    this.providers.sort((a, b) => b.priority() - a.priority())
  }

  unregister(name: string): void {
    this.providers = this.providers.filter(p => p.name() !== name)
  }

  async resolve(
    ip: string,
    options?: {
      targetCountry?: string
      requireSovereign?: boolean
      signal?: AbortSignal
    },
  ): Promise<IPContext> {
    const { targetCountry = "MX", requireSovereign = true, signal = new AbortSignal() } =
      options ?? {}

    const errors: string[] = []

    for (const provider of this.providers) {
      if (!provider.isHealthy()) continue

      const juris = provider.jurisdiction()
      if (requireSovereign && !juris.requiresLocalHosting) continue
      if (!this.matchesJurisdiction(juris, targetCountry)) continue

      try {
        const result = await provider.resolve(signal, ip)
        if (result) return result
      } catch (err) {
        errors.push(`${provider.name()}: ${(err as Error).message}`)
      }
    }

    throw new Error(
      `rdm-sce: No se pudo resolver IP ${ip} mediante proveedores soberanos. Errores: ${errors.join("; ")}`,
    )
  }

  getAllProviders(): GeolocationProvider[] {
    return [...this.providers]
  }

  getHealthyProviders(): GeolocationProvider[] {
    return this.providers.filter(p => p.isHealthy())
  }

  getProvider(name: string): GeolocationProvider | undefined {
    return this.providers.find(p => p.name() === name)
  }

  private matchesJurisdiction(juris: Jurisdiction, targetCountry: string): boolean {
    return juris.allowedCountries.some(c => c === targetCountry || c === "*")
  }
}

export const globalProviderRegistry = new ProviderRegistry()
