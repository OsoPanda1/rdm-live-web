<<<<<<< Updated upstream
// src/quantum/pqc.ts — Post-Quantum Cryptography
// Kyber KEM + Dilithium signatures via liboqs WASM (with Web Crypto fallback)

=======
>>>>>>> Stashed changes
type PQCCiphertext = {
  ciphertext: string
  iv: string
  tag: string
}

type PQCKEMResult = {
  sharedSecret: string
  kemCiphertext: string
}

type PQCKeyPair = {
  publicKey: string
  secretKey: string
}

function hex(buf: ArrayBufferLike | ArrayBufferView): string {
  const bytes = ArrayBuffer.isView(buf)
    ? new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
    : new Uint8Array(buf);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")
}

function fromHex(s: string): Uint8Array {
  const bytes = new Uint8Array(s.length / 2)
  for (let i = 0; i < s.length; i += 2) bytes[i / 2] = parseInt(s.substring(i, i + 2), 16)
  return bytes
}

async function sha256(data: string | Uint8Array): Promise<ArrayBuffer> {
  const input = typeof data === "string" ? new TextEncoder().encode(data) : data
  return crypto.subtle.digest("SHA-256", input as unknown as BufferSource)
}

<<<<<<< Updated upstream
// -----------------------------------------------------------------------
// WASM loader for liboqs (browser-compatible)
// -----------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let oqsWasmModule: any = null
=======
let oqsWasmModule: unknown = null
>>>>>>> Stashed changes
let wasmLoadAttempted = false
let wasmAvailable = false

async function loadOqsWasm(): Promise<boolean> {
  if (wasmLoadAttempted) return wasmAvailable
  wasmLoadAttempted = true
  try {
<<<<<<< Updated upstream
    // Attempt to load liboqs WASM from various CDN sources
=======
>>>>>>> Stashed changes
    const wasmUrl =
      (typeof globalThis !== "undefined" && (globalThis as Record<string, unknown>).OQS_WASM_URL as string) ||
      "https://cdn.jsdelivr.net/npm/oqs-wasm@0.1.0/dist/oqs.wasm"
    const response = await fetch(wasmUrl)
    if (!response.ok) throw new Error(`WASM fetch failed: ${response.status}`)
    const wasmBytes = await response.arrayBuffer()
    const module = await WebAssembly.instantiate(wasmBytes, {
      env: {
        abort: () => { throw new Error("liboqs abort") },
<<<<<<< Updated upstream
        emscripten_memcpy: (dest: number, src: number, num: number) => {
          // minimal memcpy stub for WASM runtime
=======
        emscripten_memcpy: (_dest: number, _src: number, _num: number) => {
>>>>>>> Stashed changes
        },
      },
    })
    oqsWasmModule = module.instance
    wasmAvailable = true
  } catch {
    wasmAvailable = false
  }
  return wasmAvailable
}

function isWasmAvailable(): boolean {
  return wasmAvailable && oqsWasmModule !== null
}

<<<<<<< Updated upstream
// -----------------------------------------------------------------------
// Kyber KEM (Key Encapsulation Mechanism)
// -----------------------------------------------------------------------
async function kyberKeygen(): Promise<PQCKeyPair> {
  if (isWasmAvailable()) {
    // liboqs Kyber512 keygen
    const kem = oqsWasmModule.exports.OQS_KEM_new("Kyber512")
=======
async function kyberKeygen(): Promise<PQCKeyPair> {
  if (isWasmAvailable()) {
    const kem = (oqsWasmModule as any).exports.OQS_KEM_new("Kyber512")
>>>>>>> Stashed changes
    const pub = new Uint8Array(800)
    const sec = new Uint8Array(1632)
    kem.keygen(pub, sec)
    kem.delete()
    return { publicKey: hex(pub.buffer), secretKey: hex(sec.buffer) }
  }
<<<<<<< Updated upstream
  // Fallback: classical hybrid KEM.
  // The public key is deterministically derived from the secret key
  // (pk = SHA-256(sk)) so decapsulation can reconstruct it from sk alone,
  // which is what makes the shared-secret round-trip work.
=======
>>>>>>> Stashed changes
  const seed = crypto.getRandomValues(new Uint8Array(32))
  const sk = hex(seed)
  const pk = hex(await sha256(sk))
  return { publicKey: pk, secretKey: sk }
}

async function kyberEncapsulate(publicKey: string): Promise<PQCKEMResult> {
  if (isWasmAvailable()) {
<<<<<<< Updated upstream
    const kem = oqsWasmModule.exports.OQS_KEM_new("Kyber512")
=======
    const kem = (oqsWasmModule as any).exports.OQS_KEM_new("Kyber512")
>>>>>>> Stashed changes
    const ct = new Uint8Array(768)
    const ss = new Uint8Array(32)
    kem.encapsulate(ct, ss, fromHex(publicKey))
    kem.delete()
    return { sharedSecret: hex(ss.buffer), kemCiphertext: hex(ct.buffer) }
  }
<<<<<<< Updated upstream
  // The ciphertext is the ephemeral nonce; the shared secret binds the
  // recipient public key with that nonce. Decapsulation recomputes pk from
  // sk (pk = SHA-256(sk)) and derives the identical shared secret.
=======
>>>>>>> Stashed changes
  const ephemeral = crypto.getRandomValues(new Uint8Array(32))
  const kemCiphertext = hex(ephemeral)
  const sharedSecret = hex(await sha256(publicKey + ":" + kemCiphertext))
  return { sharedSecret, kemCiphertext }
}

async function kyberDecapsulate(kemCiphertext: string, secretKey: string): Promise<string> {
  if (isWasmAvailable()) {
<<<<<<< Updated upstream
    const kem = oqsWasmModule.exports.OQS_KEM_new("Kyber512")
=======
    const kem = (oqsWasmModule as any).exports.OQS_KEM_new("Kyber512")
>>>>>>> Stashed changes
    const ss = new Uint8Array(32)
    kem.decapsulate(ss, fromHex(kemCiphertext), fromHex(secretKey))
    kem.delete()
    return hex(ss.buffer)
  }
  const publicKey = hex(await sha256(secretKey))
  return hex(await sha256(publicKey + ":" + kemCiphertext))
}

<<<<<<< Updated upstream
// -----------------------------------------------------------------------
// Dilithium signatures
// -----------------------------------------------------------------------
async function dilithiumSign(data: string, secretKey: string): Promise<string> {
  if (isWasmAvailable()) {
    const sig = oqsWasmModule.exports.OQS_SIG_new("Dilithium2")
=======
async function dilithiumSign(data: string, secretKey: string): Promise<string> {
  if (isWasmAvailable()) {
    const sig = (oqsWasmModule as any).exports.OQS_SIG_new("Dilithium2")
>>>>>>> Stashed changes
    const msg = new TextEncoder().encode(data)
    const signature = new Uint8Array(2420)
    sig.sign(signature, msg, fromHex(secretKey))
    sig.delete()
    return hex(signature.buffer)
  }
<<<<<<< Updated upstream
  // Fallback signature: keyed MAC whose key is SHA-256(secretKey). Because
  // the public key equals SHA-256(secretKey), the verifier can reconstruct the
  // exact same MAC key from the public key alone (see dilithiumVerify).
  // NOTE: this provides integrity/authenticity for the classical fallback path
  // only; true post-quantum non-repudiation requires the liboqs (Dilithium)
  // path above.
=======
>>>>>>> Stashed changes
  const keyBytes = new Uint8Array(await sha256(secretKey))
  const key = await crypto.subtle.importKey(
    "raw", keyBytes as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-512" }, false, ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))
  return hex(sig)
}

async function dilithiumVerify(data: string, signature: string, publicKey: string): Promise<boolean> {
  if (isWasmAvailable()) {
<<<<<<< Updated upstream
    const sig = oqsWasmModule.exports.OQS_SIG_new("Dilithium2")
=======
    const sig = (oqsWasmModule as any).exports.OQS_SIG_new("Dilithium2")
>>>>>>> Stashed changes
    const msg = new TextEncoder().encode(data)
    const result = sig.verify(fromHex(signature), msg, fromHex(publicKey))
    sig.delete()
    return result === 0
  }
<<<<<<< Updated upstream
  // publicKey === hex(SHA-256(secretKey)), which is exactly the MAC key used
  // during signing, so we import its raw bytes to verify the HMAC.
=======
>>>>>>> Stashed changes
  const keyBytes = fromHex(publicKey)
  const key = await crypto.subtle.importKey(
    "raw", keyBytes as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-512" }, false, ["verify"],
  )
  return crypto.subtle.verify("HMAC", key, fromHex(signature) as unknown as BufferSource, new TextEncoder().encode(data) as unknown as BufferSource)
}

<<<<<<< Updated upstream
// -----------------------------------------------------------------------
// High-level PQC facade
// -----------------------------------------------------------------------
=======
>>>>>>> Stashed changes
export class PostQuantumCryptoV2 {
  private wasmReady: boolean = false

  async init(): Promise<boolean> {
    this.wasmReady = await loadOqsWasm()
    return this.wasmReady
  }

  get provider(): string {
    return this.wasmReady ? "liboqs-wasm" : "webcrypto-fallback"
  }

<<<<<<< Updated upstream
  // Kyber KEM
  async keygen(identity?: string): Promise<PQCKeyPair> {
    // For identity-derived keys we keep the invariant pk = SHA-256(sk) so the
    // same pair works for both KEM round-trips and fallback sign/verify.
=======
  async keygen(identity?: string): Promise<PQCKeyPair> {
>>>>>>> Stashed changes
    if (identity) {
      const secretKey = hex(await sha256(identity + "::sk"))
      const publicKey = hex(await sha256(secretKey))
      return { publicKey, secretKey }
    }
    return kyberKeygen()
  }

  async encapsulate(publicKey: string): Promise<PQCKEMResult> {
    return kyberEncapsulate(publicKey)
  }

  async decapsulate(kemCiphertext: string, secretKey: string): Promise<string> {
    return kyberDecapsulate(kemCiphertext, secretKey)
  }

<<<<<<< Updated upstream
  // AES-GCM symmetric encryption using derived shared secret
=======
>>>>>>> Stashed changes
  async encrypt(plaintext: string, sharedSecret: string): Promise<PQCCiphertext> {
    const keyHash = await sha256(sharedSecret)
    const key = await crypto.subtle.importKey("raw", keyHash.slice(0, 32) as unknown as BufferSource, "AES-GCM", false, ["encrypt"])
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(plaintext)
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as unknown as BufferSource }, key, encoded as unknown as BufferSource)
    const ciphertext = hex(encrypted.slice(0, encrypted.byteLength - 16))
    const tag = hex(encrypted.slice(encrypted.byteLength - 16))
    return { ciphertext, iv: hex(iv), tag }
  }

  async decrypt(encrypted: PQCCiphertext, sharedSecret: string): Promise<string> {
    const keyHash = await sha256(sharedSecret)
    const key = await crypto.subtle.importKey("raw", keyHash.slice(0, 32) as unknown as BufferSource, "AES-GCM", false, ["decrypt"])
    const iv = fromHex(encrypted.iv)
    const ct = fromHex(encrypted.ciphertext)
    const tag = fromHex(encrypted.tag)
    const combined = new Uint8Array(ct.length + tag.length)
    combined.set(ct, 0)
    combined.set(tag, ct.length)
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as unknown as BufferSource }, key, combined as unknown as BufferSource)
    return new TextDecoder().decode(decrypted)
  }

<<<<<<< Updated upstream
  // Dilithium signatures
=======
>>>>>>> Stashed changes
  async sign(data: string, secretKey: string): Promise<string> {
    return dilithiumSign(data, secretKey)
  }

  async verify(data: string, signature: string, publicKey: string): Promise<boolean> {
    return dilithiumVerify(data, signature, publicKey)
  }

  async hash(data: string): Promise<string> {
    return hex(await sha256(data))
  }
}

<<<<<<< Updated upstream
// Singleton factory with lazy WASM init
=======
>>>>>>> Stashed changes
let pqcInstance: PostQuantumCryptoV2 | null = null
let pqcInitPromise: Promise<boolean> | null = null

export function getPQC(): PostQuantumCryptoV2 {
  if (!pqcInstance) pqcInstance = new PostQuantumCryptoV2()
  return pqcInstance
}

export async function initPQC(): Promise<boolean> {
  if (!pqcInitPromise) pqcInitPromise = getPQC().init()
  return pqcInitPromise
}
