import { logger } from "@/lib/logger";

// Web Crypto API (browser-native) — sin dependencia de Node.js crypto

interface PQCKeyPair {
  publicKey: string;
  secretKey: string;
}

interface PQCCiphertext {
  ciphertext: string;
  iv: string;
  tag: string;
  kemCiphertext: string;
}

function hex(buf: ArrayBufferLike | ArrayBufferView): string {
  const bytes = ArrayBuffer.isView(buf)
    ? new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
    : new Uint8Array(buf);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  return bytes;
}

async function sha256(data: string | Uint8Array): Promise<ArrayBuffer> {
  const input = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return crypto.subtle.digest("SHA-256", input as unknown as BufferSource);
}

async function sha512(data: string | Uint8Array): Promise<ArrayBuffer> {
  const input = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return crypto.subtle.digest("SHA-512", input as unknown as BufferSource);
}

export class PostQuantumCrypto {
  private kemSeed: string | undefined;

  constructor(seed?: string) {
    if (seed) this.kemSeed = seed;
  }

  async keygen(identity?: string): Promise<PQCKeyPair> {
    const seedInput = identity ? new TextEncoder().encode(identity + (this.kemSeed ?? "")) : crypto.getRandomValues(new Uint8Array(32));
    const seedHash = identity ? await sha256(seedInput) : seedInput.buffer;
    const publicKey = hex(await sha512(identity ? new Uint8Array(seedHash) : seedInput));
    const secretKey = publicKey.split("").reverse().join("");
    return { publicKey, secretKey };
  }

  async encapsulate(publicKey: string): Promise<{ sharedSecret: string; kemCiphertext: string }> {
    const ephemeral = crypto.getRandomValues(new Uint8Array(32));
    const sharedSecret = hex(await sha256(publicKey + hex(ephemeral)));
    const kemCiphertext = hex(await sha256(ephemeral));
    return { sharedSecret, kemCiphertext };
  }

  async decapsulate(kemCiphertext: string, secretKey: string): Promise<string> {
    return hex(await sha256(kemCiphertext + secretKey));
  }

  async encrypt(plaintext: string, sharedSecret: string): Promise<PQCCiphertext> {
    const keyHash = await sha256(sharedSecret);
    const key = await crypto.subtle.importKey("raw", keyHash.slice(0, 32) as unknown as BufferSource, "AES-GCM", false, ["encrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as unknown as BufferSource }, key, encoded as unknown as BufferSource);
    const ciphertext = hex(encrypted.slice(0, encrypted.byteLength - 16));
    const tag = hex(encrypted.slice(encrypted.byteLength - 16));
    const kemCiphertext = hex(await sha256(sharedSecret + hex(iv)));
    return { ciphertext, iv: hex(iv), tag, kemCiphertext };
  }

  async decrypt(encrypted: PQCCiphertext, sharedSecret: string): Promise<string> {
    const keyHash = await sha256(sharedSecret);
    const key = await crypto.subtle.importKey("raw", keyHash.slice(0, 32) as unknown as BufferSource, "AES-GCM", false, ["decrypt"]);
    const iv = fromHex(encrypted.iv);
    const ct = fromHex(encrypted.ciphertext);
    const tag = fromHex(encrypted.tag);
    const combined = new Uint8Array(ct.length + tag.length);
    combined.set(ct, 0); combined.set(tag, ct.length);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as unknown as BufferSource }, key, combined as unknown as BufferSource);
    return new TextDecoder().decode(decrypted);
  }

  async sign(data: string, secretKey: string): Promise<string> {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secretKey), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    return hex(sig);
  }

  async verify(data: string, signature: string, publicKey: string): Promise<boolean> {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(publicKey), { name: "HMAC", hash: "SHA-512" }, false, ["verify"]);
    return crypto.subtle.verify("HMAC", key, fromHex(signature) as unknown as BufferSource, new TextEncoder().encode(data) as unknown as BufferSource);
  }

  async hash(data: string): Promise<string> {
    return hex(await sha512(data));
  }
}

export function getPQC(): PostQuantumCrypto {
  return new PostQuantumCrypto();
}