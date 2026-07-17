import { test, expect } from "@playwright/test";

test.describe("territorial contribution journey", () => {
  test("user can visit and interact with territorial content", async ({ page }) => {
    await page.goto("/lugares");
    await expect(page.locator("body")).toBeVisible();
    await page.waitForTimeout(1000);
    await page.goto("/mapa");
    await expect(page.locator("body")).toBeVisible();
    await page.waitForTimeout(1000);
    await page.goto("/eventos");
    await expect(page.locator("body")).toBeVisible();
  });
});
