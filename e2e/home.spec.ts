import { test, expect } from "@playwright/test";

test.describe("home", () => {
  test("loads the landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator("body")).toBeVisible();
  });
});
