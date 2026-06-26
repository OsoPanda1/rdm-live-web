import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  let info: ReturnType<typeof vi.spyOn>;
  let warn: ReturnType<typeof vi.spyOn>;
  let err: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    info = vi.spyOn(console, "log").mockImplementation(() => {});
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    err = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("info writes through console.log with structured payload", () => {
    logger.info("hello", { foo: 1 });
    expect(info).toHaveBeenCalledTimes(1);
    const arg = info.mock.calls[0]![0];
    const parsed = typeof arg === "string" ? JSON.parse(arg) : arg;
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("hello");
    expect(parsed.foo).toBe(1);
  });

  it("warn writes through console.warn", () => {
    logger.warn("careful");
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("error writes through console.error and forwards to Sentry when present", () => {
    const captureException = vi.fn();
    (globalThis as unknown as { Sentry: unknown }).Sentry = { captureException };
    const e = new Error("boom");
    logger.error("failed", { error: e });
    expect(err).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledTimes(1);
    delete (globalThis as Record<string, unknown>).Sentry;
  });
});
