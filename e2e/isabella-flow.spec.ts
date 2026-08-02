/**
 * ============================================================================
 * RDM Digital OS — End-to-End Test: Isabella Chat Flow
 * Pruebas automatizadas con Playwright para el widget de chat de Isabella AI.
 * ============================================================================
 */

import { test, expect } from "@playwright/test";

test.describe("Isabella Chat Flow — E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal del ecosistema antes de cada prueba
    await page.goto("/");
  });

  test("el widget de chat carga correctamente, acepta entrada y recibe respuesta", async ({ page }) => {
    // Localizar el campo de entrada del chat mediante expresiones regulares flexibles
    const chatInput = page.getByPlaceholder(/escribe|pregunta|habla|message/i).first();
    
    // Verificar visibilidad inicial con tiempo de espera adecuado
    await expect(chatInput).toBeVisible({ timeout: 10000 });

    // Simular escritura de mensaje por parte del usuario
    const testMessage = "¿Qué lugares me recomiendas en Real del Monte?";
    await chatInput.fill(testMessage);
    await chatInput.press("Enter");

    // Validar que el mensaje del usuario se renderiza en la interfaz
    const userMessageBubble = page.getByText(testMessage);
    await expect(userMessageBubble).toBeVisible({ timeout: 5000 });

    // Esperar de forma resiliente la respuesta del asistente (evitando tiempos muertos fijos)
    const assistantResponse = page.locator(".bg-card").filter({ hasText: /recomiendo|lugar|minas|pueblo/i }).last();
    await expect(assistantResponse).toBeVisible({ timeout: 15000 });
  });
});
