// src/isabella/quantum/MenteCuantica.ts — Quantum cognition module for Isabella
// Integrates PennyLane circuits + PQC into Isabella's consciousness pipeline

import { PostQuantumCryptoV2, getPQC, initPQC } from "@/quantum/pqc"
import { PennylaneBridge, getPennylaneBridge } from "@/quantum/pennylane-bridge"
import type { CircuitTemplateName } from "@/quantum/pennylane-bridge"

export type QuantumCapability =
  | "pqc_kyber"
  | "pqc_dilithium"
  | "qml_classify"
  | "qml_optimize"
  | "qml_grover"

export type QuantumState = {
  ready: boolean
  activeCapabilities: QuantumCapability[]
  pqcProvider: string
  pennylaneReachable: boolean
  lastCircuitExecMs: number
  circuitCount: number
}

export class MenteCuantica {
  private pqc: PostQuantumCryptoV2
  private pennylane: PennylaneBridge
  private _ready = false
  private _capabilities: Set<QuantumCapability> = new Set()
  private _lastCircuitMs = 0
  private _circuitCount = 0

  constructor() {
    this.pqc = getPQC()
    this.pennylane = getPennylaneBridge()
  }

  async init(): Promise<boolean> {
    const pqcReady = await initPQC()
    if (pqcReady) {
      this._capabilities.add("pqc_kyber")
      this._capabilities.add("pqc_dilithium")
    }

    const plReachable = await this.pennylane.healthCheck()
    if (plReachable) {
      this._capabilities.add("qml_classify")
      this._capabilities.add("qml_optimize")
      this._capabilities.add("qml_grover")
    }

    this._ready = pqcReady || plReachable
    return this._ready
  }

  get state(): QuantumState {
    return {
      ready: this._ready,
      activeCapabilities: Array.from(this._capabilities),
      pqcProvider: this.pqc.provider,
      pennylaneReachable: this._capabilities.has("qml_classify"),
      lastCircuitExecMs: this._lastCircuitMs,
      circuitCount: this._circuitCount,
    }
  }

  get isReady(): boolean {
    return this._ready
  }

  // --- PQC operations ---

  async pqcKeygen(identity?: string) {
    return this.pqc.keygen(identity)
  }

  async pqcEncapsulate(publicKey: string) {
    return this.pqc.encapsulate(publicKey)
  }

  async pqcDecapsulate(kemCiphertext: string, secretKey: string) {
    return this.pqc.decapsulate(kemCiphertext, secretKey)
  }

  async pqcEncrypt(plaintext: string, sharedSecret: string) {
    return this.pqc.encrypt(plaintext, sharedSecret)
  }

  async pqcDecrypt(cipher: { ciphertext: string; iv: string; tag: string }, sharedSecret: string) {
    return this.pqc.decrypt(cipher, sharedSecret)
  }

  async pqcSign(data: string, secretKey: string) {
    return this.pqc.sign(data, secretKey)
  }

  async pqcVerify(data: string, signature: string, publicKey: string) {
    return this.pqc.verify(data, signature, publicKey)
  }

  // --- QML operations ---

  async executeCircuit(name: CircuitTemplateName, params?: number[]) {
    const start = performance.now()
    const result = await this.pennylane.executeTemplate(name, params)
    this._lastCircuitMs = performance.now() - start
    this._circuitCount++
    return result
  }

  async classify(features: number[]): Promise<{ label: string; confidence: number }> {
    const result = await this.executeCircuit("classification", features)
    const probs = result.probabilities ?? []
    const maxIdx = probs.indexOf(Math.max(...probs))
    return {
      label: `class_${maxIdx}`,
      confidence: probs[maxIdx] ?? 0,
    }
  }

  async optimize(params: number[]): Promise<{ solution: number[]; value: number }> {
    const result = await this.executeCircuit("optimization", params)
    return {
      solution: result.samples?.[0]?.map(Number) ?? [],
      value: result.expectationValue ?? 0,
    }
  }

  async search(target: string): Promise<{ found: boolean; amplitude: number }> {
    const result = await this.executeCircuit("grover")
    return {
      found: (result.probabilities?.[0] ?? 0) > 0.5,
      amplitude: result.probabilities?.[0] ?? 0,
    }
  }
}

export const menteCuantica = new MenteCuantica()
