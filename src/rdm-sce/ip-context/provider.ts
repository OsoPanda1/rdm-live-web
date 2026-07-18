export interface IPContext {
  ip: string
  countryCode: string
  regionCode: string
  city: string
  latitude: number
  longitude: number
  asn: number
  isp: string
  threatScore: number
  isProxy: boolean
  dataSovereigntyZone: string
  resolvedAt: Date
}

export interface Jurisdiction {
  allowedCountries: string[]
  requiresLocalHosting: boolean
  priorityRank: number
}

export interface GeolocationProvider {
  name(): string
  resolve(ctx: AbortSignal, ip: string): Promise<IPContext | null>
  priority(): number
  isHealthy(): boolean
  jurisdiction(): Jurisdiction
}
