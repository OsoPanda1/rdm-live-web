import { test, expect } from "@playwright/test";

test.describe("Isabella chat flow", () => {
  test("chat widget loads and accepts input", async ({ page }) => {
    await page.goto("/");
    const chatInput = page.getByPlaceholder(/escribe|pregunta|habla|message/i).first();
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    await chatInput.fill("¿Qué lugares me recomiendas?");
    await chatInput.press("Enter");
    await page.waitForTimeout(2000);
  });
});
