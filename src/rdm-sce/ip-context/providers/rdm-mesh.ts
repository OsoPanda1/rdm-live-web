import type { GeolocationProvider, Jurisdiction, IPContext } from "../provider"

interface MeshNode {
  ipRange: string
  location: { lat: number; lng: number }
  nodeId: string
  federationId: number
}

export class RdmMeshProvider implements GeolocationProvider {
  private meshTopology: MeshNode[] = []
  private healthy = true
  private latency = 0

  constructor(
    private name_: string = "rdm_internal_ip_mesh",
    private endpoint: string = "http://mesh.rdm.local:8400",
  ) {}

  name(): string { return this.name_ }
  priority(): number { return 20 }

  isHealthy(): boolean { return this.healthy }
  markUnhealthy(): void { this.healthy = false }
  markHealthy(): void { this.healthy = true }
  setLatency(ms: number): void { this.latency = ms }

  jurisdiction(): Jurisdiction {
    return {
      allowedCountries: ["MX"],
      requiresLocalHosting: true,
      priorityRank: 20,
    }
  }

  async resolve(_ctx: AbortSignal, ip: string): Promise<IPContext | null> {
    const node = this.findNode(ip)
    if (!node) return null
    return {
      ip,
      countryCode: "MX",
      regionCode: "HGO",
      city: "Mineral del Monte",
      latitude: node.location.lat,
      longitude: node.location.lng,
      asn: 0,
      isp: `Red TAMV Mesh - Nodo ${node.nodeId}`,
      threatScore: 0,
      isProxy: false,
      dataSovereigntyZone: "MX_Local",
      resolvedAt: new Date(),
    }
  }

  private findNode(ip: string): MeshNode | undefined {
    const parts = ip.split(".").map(Number)
    if (parts.length !== 4) return undefined
    const ipNum = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
    return this.meshTopology.find(n => {
      const [base, mask] = n.ipRange.split("/")
      const bParts = base.split(".").map(Number)
      const baseNum = ((bParts[0] << 24) | (bParts[1] << 16) | (bParts[2] << 8) | bParts[3]) >>> 0
      const maskBits = parseInt(mask)
      const shift = 32 - maskBits
      return (ipNum >>> shift) === (baseNum >>> shift)
    })
  }

  loadMesh(topology: MeshNode[]): void {
    this.meshTopology = topology
  }
}
