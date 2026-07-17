import { describe, it, expect } from "vitest"
import { PostQuantumCryptoV2, getPQC } from "../pqc"

describe("PostQuantumCryptoV2", () => {
  it("should generate key pair", async () => {
    const pqc = getPQC()
    const keys = await pqc.keygen()
    expect(keys.publicKey).toBeDefined()
    expect(keys.secretKey).toBeDefined()
    expect(keys.publicKey.length).toBeGreaterThan(0)
    expect(keys.secretKey.length).toBeGreaterThan(0)
  })

  it("should encapsulate and decapsulate shared secret", async () => {
    const pqc = getPQC()
    const alice = await pqc.keygen()
    const encapsulated = await pqc.encapsulate(alice.publicKey)
    expect(encapsulated.sharedSecret).toBeDefined()
    expect(encapsulated.kemCiphertext).toBeDefined()

    const bobSecret = await pqc.decapsulate(encapsulated.kemCiphertext, alice.secretKey)
    expect(bobSecret).toBe(encapsulated.sharedSecret)
  })

  it("should encrypt and decrypt", async () => {
    const pqc = getPQC()
    const alice = await pqc.keygen()
    const enc = await pqc.encapsulate(alice.publicKey)
    const plaintext = "Hello, Quantum World!"
    const cipher = await pqc.encrypt(plaintext, enc.sharedSecret)
    expect(cipher.ciphertext).toBeDefined()
    expect(cipher.iv).toBeDefined()
    expect(cipher.tag).toBeDefined()

    const bobSecret = await pqc.decapsulate(enc.kemCiphertext, alice.secretKey)
    const decrypted = await pqc.decrypt(cipher, bobSecret)
    expect(decrypted).toBe(plaintext)
  })

  it("should sign and verify", async () => {
    const pqc = getPQC()
    const keys = await pqc.keygen("test-identity")
    const data = "Message to sign"
    const signature = await pqc.sign(data, keys.secretKey)
    expect(signature).toBeDefined()

    const valid = await pqc.verify(data, signature, keys.publicKey)
    expect(valid).toBe(true)

    const tampered = await pqc.verify("TAMPERED", signature, keys.publicKey)
    expect(tampered).toBe(false)
  })

  it("should hash", async () => {
    const pqc = getPQC()
    const hash = await pqc.hash("test data")
    expect(hash).toBeDefined()
    expect(hash.length).toBe(64)
  })

  it("should init without error", async () => {
    const pqc = new PostQuantumCryptoV2()
    const ready = await pqc.init()
    // In test environment (no WASM), ready will be false but should not throw
    expect(typeof ready).toBe("boolean")
  })
})
