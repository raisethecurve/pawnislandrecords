const { test, expect } = require("@playwright/test");
const { shellSmokeRoutes, smokeRoutes } = require("../tools/routes");

function withStandalone(routePath) {
  const url = new URL(routePath, "http://pawn.local/");
  url.searchParams.set("standalone", "1");
  return `${url.pathname.replace(/^\//, "")}${url.search}${url.hash}`;
}

function screenshotName(route, projectName) {
  return `${projectName}-${route.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.png`;
}

test.describe("direct route smoke", () => {
  for (const route of smokeRoutes) {
    test(`${route.label} renders directly`, async ({ page }, testInfo) => {
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      const response = await page.goto(withStandalone(route.path), { waitUntil: "domcontentloaded" });

      expect(response && response.status(), route.path).toBeLessThan(400);
      await expect(page.locator("body")).toContainText(route.expectedText);
      await expect(page.locator("body")).not.toContainText("Loading project...");

      for (const absentText of route.absentText || []) {
        await expect(page.locator("body")).not.toContainText(absentText);
      }

      if (route.expectedTitle) {
        await expect(page).toHaveTitle(route.expectedTitle);
      }

      if (route.expectedMetaDescription) {
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
          "content",
          new RegExp(route.expectedMetaDescription)
        );
      }

      if (route.expectedCanonical) {
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", route.expectedCanonical);
      }

      if (route.expectedJsonLd) {
        const structuredData = page.locator('script[type="application/ld+json"]').first();
        await expect(structuredData).toHaveJSProperty("type", "application/ld+json");
        await expect.poll(() => structuredData.textContent()).toContain(route.expectedJsonLd);
      }

      await page.screenshot({
        path: testInfo.outputPath(screenshotName(route, testInfo.project.name)),
        fullPage: true
      });
      expect(pageErrors).toEqual([]);
    });
  }
});

test.describe("persistent shell smoke", () => {
  for (const route of shellSmokeRoutes) {
    test(`${route.label} renders inside shell`, async ({ page }) => {
      const response = await page.goto(`shell.html?page=${encodeURIComponent(route.path)}`, {
        waitUntil: "domcontentloaded"
      });

      expect(response && response.status(), route.path).toBeLessThan(400);
      await expect(page.locator("#site-shell-frame")).toBeVisible();
      await expect(page.frameLocator("#site-shell-frame").locator("body")).toContainText(route.expectedText);

      for (const absentText of route.absentText || []) {
        await expect(page.frameLocator("#site-shell-frame").locator("body")).not.toContainText(absentText);
      }
    });
  }
});
