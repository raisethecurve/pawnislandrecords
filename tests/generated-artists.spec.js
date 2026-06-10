const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright");

const generatedArtistRoutes = [
  {
    path: "artists/rhea-mauro/",
    name: "Rhea Mauro",
    expectedCopy: "soul-rooted singer-songwriter"
  },
  {
    path: "artists/quiet-filter/",
    name: "Quiet Filter",
    expectedCopy: "stoner doom"
  }
];

function formatAxeViolation(violation) {
  const nodes = violation.nodes
    .slice(0, 3)
    .map((node) => node.target.join(" "))
    .join("; ");
  return `${violation.id} [${violation.impact}]: ${violation.help} (${nodes})`;
}

async function expectNoHorizontalOverflow(page) {
  const overflowing = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;

    return Array.from(document.body.querySelectorAll("*"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return {
          selector: element.id || element.getAttribute("class") || element.tagName.toLowerCase(),
          left: Math.floor(rect.left),
          right: Math.ceil(rect.right),
          visible:
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== "none" &&
            style.visibility !== "hidden"
        };
      })
      .filter((item) => item.visible && (item.left < -2 || item.right > viewportWidth + 2))
      .slice(0, 8);
  });

  expect(overflowing).toEqual([]);
}

test.describe("generated canonical project pages", () => {
  test("artist index renders as a production project roster", async ({ page }) => {
    const response = await page.goto("artists/", { waitUntil: "domcontentloaded" });

    expect(response && response.status()).toBeLessThan(400);
    await expect(page).toHaveTitle("Projects | Pawn Island Records");
    await expect(page.locator("h1")).toContainText("Pawn Island Records Projects");
    await expect(page.locator(".seo-roster-card")).toHaveCount(9);
    await expect(page.locator('a[href="/artists/rhea-mauro/"]')).not.toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("Open Visual Page");
    await expectNoHorizontalOverflow(page);
  });

  for (const route of generatedArtistRoutes) {
    test(`${route.name} canonical page is production-ready`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });

      expect(response && response.status(), route.path).toBeLessThan(400);
      await expect(page.locator("h1")).toContainText(route.name);
      await expect(page.locator("body")).toContainText("Catalog Project");
      await expect(page.locator("body")).toContainText(route.expectedCopy);
      await expect(page.locator(".seo-artist-visual img")).toHaveAttribute("src", /media\.pawnislandrecords\.com|\/media\//);
      await expect(page.locator(".seo-release-card")).not.toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://www.pawnislandrecords.com/${route.path}`
      );

      const hiddenPreviewLinks = await page.locator('a[href*="artist.html"], a[href*="preview=full"]').count();
      expect(hiddenPreviewLinks).toBe(0);

      const seriousViolations = (await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze()).violations.filter((violation) => ["serious", "critical"].includes(violation.impact));

      expect(seriousViolations.map(formatAxeViolation)).toEqual([]);
      await expectNoHorizontalOverflow(page);
    });
  }
});
