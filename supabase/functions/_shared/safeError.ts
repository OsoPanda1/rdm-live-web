export function safeError(error: unknown, context: string) {
  const ref = `err_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 8)}`;
  console.error(`[${context}] ref=${ref}`, error);
  return { ok: false, error: { code: "internal_error", message: "Internal error", ref } };
}
