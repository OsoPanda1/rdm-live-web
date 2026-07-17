function getCrypto(): Crypto {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c?.getRandomValues) {
    throw new Error("Secure crypto API unavailable in this runtime");
  }
  return c;
}

export function secureRandomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError("maxExclusive must be a positive integer");
  }
  const crypto = getCrypto();
  const range = 0x100000000;
  const limit = range - (range % maxExclusive);
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % maxExclusive;
  }
}

export function secureRandomFloat(): number {
  const crypto = getCrypto();
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  return (buf[0] * 0x200000 + (buf[1] >>> 11)) / 2 ** 53;
}

export function secureRandomId(byteLength = 16): string {
  const crypto = getCrypto();
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let b64: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (globalThis as any).Buffer !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    b64 = (globalThis as any).Buffer.from(bytes).toString("base64");
  } else {
    b64 = btoa(String.fromCharCode(...bytes));
  }
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function secureRandomHex(byteLength = 16): string {
  const crypto = getCrypto();
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
