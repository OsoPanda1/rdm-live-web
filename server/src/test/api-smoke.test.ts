import test from "node:test";
import assert from "node:assert/strict";
import type { startServer as startServerType } from "../index.js";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-with-at-least-32-characters";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/rdmx_test";
process.env.PUBLIC_BASE_URL = "http://localhost:5173";
process.env.CORS_ALLOWED_ORIGINS = "http://localhost:5173";

const TEST_PORT = 8899;
const base = `http://127.0.0.1:${TEST_PORT}`;

let server: ReturnType<typeof startServerType> | null = null;
let token = "";

test.before(async () => {
  const { startServer } = await import("../index.js");
  server = startServer(TEST_PORT);
});

test.after(async () => {
  await new Promise<void>((resolve, reject) => {
    server?.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
});

test("register + login + profile + economy flow", async () => {
  const registerEmail = `smoke-${Date.now()}@rdmx.dev`;

  const registerRes = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: registerEmail, password: "Password123!", role: "VISITOR" }),
  });
  assert.equal(registerRes.status, 201);
  const registerPayload = (await registerRes.json()) as { token: string };
  token = registerPayload.token;
  assert.ok(token.length > 10);

  const profileRes = await fetch(`${base}/api/profiles/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(profileRes.status, 200);

  const economyRes = await fetch(`${base}/api/economy/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(economyRes.status, 200);
});

test("realito + content + digital twins endpoints", async () => {
  const contentRes = await fetch(`${base}/api/content/routes`);
  assert.equal(contentRes.status, 200);

  const realitoRes = await fetch(`${base}/api/realito/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "quiero comer pastes" }),
  });
  assert.equal(realitoRes.status, 200);

  const twinsRes = await fetch(`${base}/api/digital-twins/models`);
  assert.equal(twinsRes.status, 200);
});
