import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/lugares", "/eventos", "/mapa", "/historia", "/auth"];

for (const route of ROUTES) {
  test(`smoke: ${route} loads without runtime error`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(res?.ok() || res?.status() === 304).toBeTruthy();
    await page.waitForLoadState("networkidle").catch(() => {});
    expect(errors, `runtime errors on ${route}: ${errors.join("\n")}`).toHaveLength(0);
  });
}
