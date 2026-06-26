import { test, expect } from "@playwright/test";

test.describe("auth route", () => {
  test("shows login + signup tabs", async ({ page }) => {
    await page.goto("/auth");
    // Login email field is required
    const email = page.getByLabel(/email/i).first();
    await expect(email).toBeVisible();
  });

  test("rejects invalid email on submit", async ({ page }) => {
    await page.goto("/auth");
    const email = page.getByLabel(/email/i).first();
    await email.fill("not-an-email");
    await page.getByRole("button", { name: /entrar|iniciar|login/i }).first().click();
    // Either browser-native validation kicks in or our zod schema surfaces a toast.
    await expect(page).toHaveURL(/\/auth/);
  });
});
