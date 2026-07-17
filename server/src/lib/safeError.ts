export function safeError(error: unknown, context: string): {
  ok: false;
  error: { code: string; message: string; ref: string };
} {
  const ref = `err_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 8)}`;
  console.error(`[${context}] ref=${ref}`, error instanceof Error ? error.stack : error);
  return {
    ok: false,
    error: {
      code: "internal_error",
      message: "An internal error occurred. Please try again.",
      ref,
    },
  };
}
