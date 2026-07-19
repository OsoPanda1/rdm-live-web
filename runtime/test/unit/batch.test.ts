import { describe, it, expect, beforeEach } from "vitest";
import { Batcher } from "../../src/router/batch.js";
import type { InvocationContext, InvocationResult } from "../../src/sandbox/types.js";

describe("Batcher", () => {
  let batcher: Batcher;
  let processedBatches: InvocationContext[][] = [];

  beforeEach(() => {
    processedBatches = [];
    batcher = new Batcher(
      { enabled: true, maxBatchWindowMs: 50, maxBatchSize: 5 },
      async (batch) => {
        processedBatches.push(batch);
        return batch.map(() => ({
          statusCode: 200,
          payload: { batched: true },
          latencyMs: 5,
        } as InvocationResult));
      },
    );
    batcher.start();
  });

  it("processes single invocation", async () => {
    const result = await batcher.submit({
      pluginId: "test",
      sessionTicketId: "sess-1",
      operation: "ping",
      payload: { id: 1 },
      deadlineMs: 1000,
    });

    expect(result.statusCode).toBe(200);
    expect((result.payload as Record<string, unknown>).batched).toBe(true);
  }, 10000);

  it("batches multiple invocations of same key", async () => {
    const results = await Promise.all([
      batcher.submit({ pluginId: "test", sessionTicketId: "s", operation: "ping", payload: { id: 1 }, deadlineMs: 1000 }),
      batcher.submit({ pluginId: "test", sessionTicketId: "s", operation: "ping", payload: { id: 2 }, deadlineMs: 1000 }),
      batcher.submit({ pluginId: "test", sessionTicketId: "s", operation: "ping", payload: { id: 3 }, deadlineMs: 1000 }),
    ]);

    expect(results).toHaveLength(3);
    expect(processedBatches.length).toBeGreaterThanOrEqual(1);
    expect(processedBatches.flat()).toHaveLength(3);
  }, 10000);

  it("separates batches by plugin/operation key", async () => {
    const r1 = batcher.submit({ pluginId: "a", sessionTicketId: "s", operation: "op1", payload: {}, deadlineMs: 1000 });
    const r2 = batcher.submit({ pluginId: "b", sessionTicketId: "s", operation: "op2", payload: {}, deadlineMs: 1000 });

    const results = await Promise.all([r1, r2]);
    expect(results).toHaveLength(2);
    expect(processedBatches.length).toBeGreaterThanOrEqual(2);
  }, 10000);

  it("flushes at max batch size", async () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      batcher.submit({ pluginId: "full", sessionTicketId: "s", operation: "flush", payload: { i }, deadlineMs: 1000 }),
    );

    const results = await Promise.all(items);
    expect(results).toHaveLength(5);
    const batch = processedBatches.find((b) => b.length === 5);
    expect(batch).toBeDefined();
  }, 10000);
});
