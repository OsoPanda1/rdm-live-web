import { test, expect } from "../playwright-fixture";

const MAP_HASH = "#mapa" as const;
const GEO_BTN_TESTID = "geo-center-btn";
const GEO_BANNER_TESTID = "geo-banner";

test.describe("Geolocation flow on Centrar en mí", () => {
  test.beforeEach(async ({ page }) => {
    // Punto de entrada único: raíz del nodo.
    await page.goto("/");
  });

  test("granted: button switches to 'Centrar en mí' state", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({
      latitude: 20.141,
      longitude: -98.6735,
    });

    const btn = page.getByTestId(GEO_BTN_TESTID);

    await btn.scrollIntoViewIfNeeded();
    await expect(btn, "El botón de geolocalización debe ser visible").toBeVisible();

    await btn.click();

    await expect(btn).toHaveAttribute("data-geo-status", "granted", {
      timeout: 10_000,
    });

    // No debe quedar ningún banner de error/denied en estado "granted"
    await expect(
      page.getByTestId(GEO_BANNER_TESTID),
      "No se espera banner de error en flujo concedido",
    ).toHaveCount(0);

    // Opcional: comprobar que el mapa recibió foco / hash
    await expect(page).toHaveURL((url) =>
      url.hash === "" || url.hash === MAP_HASH,
    );
  });

  test("denied: shows denied banner", async ({ page, context }) => {
    await context.clearPermissions();

    // Forzamos PERMISSION_DENIED a nivel API, aislado al contexto actual.
    await page.addInitScript(() => {
      const geo = navigator.geolocation;
      if (!geo) return;

      const deniedError: GeolocationPositionError = {
        code: 1,
        message: "denied",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      };

      // @ts-expect-error override para entorno de test
      navigator.geolocation.getCurrentPosition = (
        _success: PositionCallback,
        error?: PositionErrorCallback,
      ) => {
        error?.(deniedError);
      };
    });

    const btn = page.getByTestId(GEO_BTN_TESTID);
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toBeVisible();

    await btn.click();

    const banner = page.getByTestId(GEO_BANNER_TESTID);

    await expect(
      banner,
      "Debe mostrarse un banner cuando se deniega el permiso de geolocalización",
    ).toBeVisible({ timeout: 10_000 });

    await expect(banner).toHaveAttribute("data-geo-status", "denied");
  });

  test("error/unsupported: shows unsupported banner when geolocation API missing", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      // Eliminamos soporte de geolocalización sólo para este contexto.
      Object.defineProperty(navigator, "geolocation", {
        value: undefined,
        configurable: true,
      });
    });

    const btn = page.getByTestId(GEO_BTN_TESTID);
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toBeVisible();

    await btn.click();

    const banner = page.getByTestId(GEO_BANNER_TESTID);

    await expect(
      banner,
      "Debe mostrarse un banner cuando la API de geolocalización no está disponible",
    ).toBeVisible({ timeout: 10_000 });

    const status = await banner.getAttribute("data-geo-status");
    expect(
      ["unsupported", "error"],
      `Estado inesperado para data-geo-status: "${status}"`,
    ).toContain(status);
  });
});
