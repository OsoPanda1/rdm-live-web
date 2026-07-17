export function createTraceId() {
  if (typeof crypto !== "undefined") {
    if ("randomUUID" in crypto) return crypto.randomUUID();
    if ("getRandomValues" in crypto) {
      const buf = new Uint8Array(16);
      (crypto as Crypto).getRandomValues(buf);
      return Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
    }
  }
  return `trace-${Date.now()}-${performance.now()}`;
}
