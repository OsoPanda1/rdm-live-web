// src/quantum/pennylane-bridge.ts — Hybrid Quantum-Classical ML for Isabella
// Connects to PennyLane REST API server for quantum circuit execution

type QuantumCircuit = {
  qubits: number
  depth: number
  gates: Array<{ name: string; qubits: number[]; params?: number[] }>
}

type QuantumResult = {
  statevector?: number[]
  probabilities?: number[]
  expectationValue?: number
  samples?: number[][]
  executionTimeMs: number
}

type PennylaneConfig = {
  endpoint: string
  apiKey?: string
  timeoutMs: number
  device: "default.qubit" | "lightning.qubit" | "qiskit.aer" | "cirq.simulator"
}

// Circuit templates for Isabella use cases
const CIRCUIT_TEMPLATES = {
  classification: {
    qubits: 4,
    depth: 3,
    gates: [
      { name: "Hadamard", qubits: [0, 1, 2, 3] },
      { name: "CNOT", qubits: [0, 1] },
      { name: "CNOT", qubits: [2, 3] },
      { name: "RY", qubits: [0], params: [0.5] },
      { name: "RY", qubits: [1], params: [0.3] },
      { name: "RY", qubits: [2], params: [0.7] },
      { name: "RY", qubits: [3], params: [0.1] },
      { name: "CNOT", qubits: [1, 2] },
      { name: "Measure", qubits: [0, 1, 2, 3] },
    ],
  },
  optimization: {
    qubits: 6,
    depth: 4,
    gates: [
      { name: "RX", qubits: [0], params: [0.1] },
      { name: "RX", qubits: [1], params: [0.2] },
      { name: "RX", qubits: [2], params: [0.3] },
      { name: "RX", qubits: [3], params: [0.4] },
      { name: "RX", qubits: [4], params: [0.5] },
      { name: "RX", qubits: [5], params: [0.6] },
      { name: "ZZ", qubits: [0, 1] },
      { name: "ZZ", qubits: [2, 3] },
      { name: "ZZ", qubits: [4, 5] },
      { name: "Measure", qubits: [0, 1, 2, 3, 4, 5] },
    ],
  },
  grover: {
    qubits: 3,
    depth: 6,
    gates: [
      { name: "Hadamard", qubits: [0, 1, 2] },
      { name: "Oracle", qubits: [0, 1, 2] },
      { name: "Diffusion", qubits: [0, 1, 2] },
      { name: "Oracle", qubits: [0, 1, 2] },
      { name: "Diffusion", qubits: [0, 1, 2] },
      { name: "Measure", qubits: [0, 1, 2] },
    ],
  },
}

export type CircuitTemplateName = keyof typeof CIRCUIT_TEMPLATES

export class PennylaneBridge {
  private config: PennylaneConfig
  private circuitCache = new Map<string, QuantumResult>()

  constructor(config?: Partial<PennylaneConfig>) {
    this.config = {
      endpoint: config?.endpoint ?? "http://localhost:5000/quantum",
      apiKey: config?.apiKey,
      timeoutMs: config?.timeoutMs ?? 30000,
      device: config?.device ?? "default.qubit",
    }
  }

  get endpoint(): string {
    return this.config.endpoint
  }

  set endpoint(url: string) {
    this.config.endpoint = url
  }

  // Execute a quantum circuit against the PennyLane REST API
  async execute(circuit: QuantumCircuit): Promise<QuantumResult> {
    const cacheKey = JSON.stringify(circuit)
    const cached = this.circuitCache.get(cacheKey)
    if (cached) return cached

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (this.config.apiKey) headers["Authorization"] = `Bearer ${this.config.apiKey}`

    const startTime = performance.now()

    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          circuit,
          device: this.config.device,
          shots: 1024,
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`PennyLane API error (${response.status}): ${errorText}`)
      }

      const result: QuantumResult = await response.json()
      result.executionTimeMs = performance.now() - startTime
      this.circuitCache.set(cacheKey, result)
      return result
    } catch (err) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        throw new Error("PennyLane API request timed out")
      }
      throw err
    }
  }

  // Get a predefined circuit template
  getTemplate(name: CircuitTemplateName): QuantumCircuit {
    const template = CIRCUIT_TEMPLATES[name]
    if (!template) throw new Error(`Unknown circuit template: ${name}`)
    return template
  }

  // Execute a template circuit
  async executeTemplate(name: CircuitTemplateName, params?: number[]): Promise<QuantumResult> {
    const circuit = this.getTemplate(name)
    if (params && circuit.gates) {
      const paramGates = circuit.gates.filter((g) => g.name.startsWith("R"))
      paramGates.forEach((gate, i) => {
        if (params[i] !== undefined) gate.params = [params[i]]
      })
    }
    return this.execute(circuit)
  }

  // Clear execution cache
  clearCache(): void {
    this.circuitCache.clear()
  }

  // Check if the PennyLane REST API is reachable
  async healthCheck(): Promise<boolean> {
    try {
      const baseUrl = this.config.endpoint.replace(/\/quantum.*$/, "")
      const response = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Singleton instance for Isabella
let bridgeInstance: PennylaneBridge | null = null

export function getPennylaneBridge(config?: Partial<PennylaneConfig>): PennylaneBridge {
  if (!bridgeInstance) bridgeInstance = new PennylaneBridge(config)
  return bridgeInstance
}
