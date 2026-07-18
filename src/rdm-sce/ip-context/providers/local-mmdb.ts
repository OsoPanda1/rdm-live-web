import type { GeolocationProvider, Jurisdiction } from "../provider"
import type { IPContext } from "../provider"

export class LocalMmdbProvider implements GeolocationProvider {
  private healthy = true
  private dbPath: string
  private db: Record<string, Partial<IPContext>> = {}

  constructor(
    private name_: string = "maxmind_local_offline",
    dbPath = "/data/geoip/rdm.mmdb",
    offlineFallback?: Record<string, Partial<IPContext>>,
  ) {
    this.dbPath = dbPath
    if (offlineFallback) this.db = offlineFallback
  }

  name(): string { return this.name_ }
  priority(): number { return 10 }

  isHealthy(): boolean { return this.healthy }

  setHealthy(h: boolean): void { this.healthy = h }

  jurisdiction(): Jurisdiction {
    return {
      allowedCountries: ["MX", "*"],
      requiresLocalHosting: true,
      priorityRank: 10,
    }
  }

  async resolve(_ctx: AbortSignal, ip: string): Promise<IPContext | null> {
    const cached = this.db[ip]
    if (cached) {
      return {
        ip,
        countryCode: cached.countryCode ?? "MX",
        regionCode: cached.regionCode ?? "HGO",
        city: cached.city ?? "Mineral del Monte",
        latitude: cached.latitude ?? 20.1398,
        longitude: cached.longitude ?? -98.6727,
        asn: cached.asn ?? 0,
        isp: cached.isp ?? "Red TAMV Local",
        threatScore: cached.threatScore ?? 0,
        isProxy: cached.isProxy ?? false,
        dataSovereigntyZone: cached.dataSovereigntyZone ?? "MX_Local",
        resolvedAt: new Date(),
      }
    }
    return null
  }

  seed(data: Record<string, Partial<IPContext>>): void {
    this.db = { ...this.db, ...data }
  }
}
