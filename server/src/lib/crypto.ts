import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGO = "aes-256-gcm";
const KEY = scryptSync(process.env.SOVEREIGN_GATEWAY_KEY || "rdmx-dev-key", "rdmx-salt", 32);

export function encryptPayload(payload: object): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, KEY, iv);
  const plaintext = JSON.stringify(payload);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptPayload(data: string): unknown {
  const input = Buffer.from(data, "base64");
  const iv = input.subarray(0, 12);
  const tag = input.subarray(12, 28);
  const ciphertext = input.subarray(28);

  const decipher = createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  return JSON.parse(decrypted);
}
