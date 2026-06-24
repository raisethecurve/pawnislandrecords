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

async function dragPageUpWithTouch(page) {
  const client = await page.context().newCDPSession(page);

  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 196, y: 700, radiusX: 2, radiusY: 2, id: 1 }]
  });

  for (let step = 1; step <= 12; step += 1) {
    const y = 700 + ((300 - 700) * step) / 12;

    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: 196, y, radiusX: 2, radiusY: 2, id: 1 }]
    });
    await page.waitForTimeout(16);
  }

  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(200);
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

test.describe("home pending carousel", () => {
  test("keeps late-slide artwork inside the mobile viewport", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-only responsive regression");

    const targetTitles = ["Memories", "Melody of Rain"];
    const response = await page.goto(withStandalone("index.html"), { waitUntil: "domcontentloaded" });

    expect(response && response.status()).toBeLessThan(400);

    const targetSlideIndex = await page.evaluate((titles) => {
      const slides = Array.from(document.querySelectorAll(".pending-carousel__slide"));

      return slides.findIndex((slide) => {
        const slideTitles = Array.from(slide.querySelectorAll("h4")).map((heading) =>
          heading.textContent.trim()
        );
        return titles.every((title) => slideTitles.includes(title));
      });
    }, targetTitles);

    expect(targetSlideIndex).toBeGreaterThanOrEqual(0);

    await page.locator(`[data-pending-dot="${targetSlideIndex}"]`).click();
    await expect(page.locator(`[data-pending-slide="${targetSlideIndex}"]`)).toHaveAttribute(
      "aria-hidden",
      "false"
    );
    await page.waitForTimeout(550);

    const bounds = await page.evaluate((titles) => {
      const viewport = document.querySelector(".pending-carousel__viewport");
      const activeSlide = document.querySelector(".pending-carousel__slide[aria-hidden='false']");

      if (!viewport || !activeSlide) {
        return [];
      }

      const viewportRect = viewport.getBoundingClientRect();

      return titles.map((title) => {
        const card = Array.from(activeSlide.querySelectorAll(".pending-album")).find(
          (candidate) => candidate.querySelector("h4")?.textContent.trim() === title
        );
        const art = card && card.querySelector(".pending-album__art");
        const cardRect = card ? card.getBoundingClientRect() : null;
        const artRect = art ? art.getBoundingClientRect() : null;

        return {
          title,
          found: Boolean(card && art),
          viewportLeft: viewportRect.left,
          viewportRight: viewportRect.right,
          cardLeft: cardRect ? cardRect.left : 0,
          cardRight: cardRect ? cardRect.right : 0,
          artLeft: artRect ? artRect.left : 0,
          artRight: artRect ? artRect.right : 0
        };
      });
    }, targetTitles);

    expect(bounds).toHaveLength(targetTitles.length);

    for (const item of bounds) {
      expect(item.found, item.title).toBe(true);
      expect(item.cardLeft, item.title).toBeGreaterThanOrEqual(item.viewportLeft - 1);
      expect(item.cardRight, item.title).toBeLessThanOrEqual(item.viewportRight + 1);
      expect(item.artLeft, item.title).toBeGreaterThanOrEqual(item.viewportLeft - 1);
      expect(item.artRight, item.title).toBeLessThanOrEqual(item.viewportRight + 1);
    }
  });
});

test.describe("public routing scroll", () => {
  test("public pages keep one native document scroller", async ({ page }, testInfo) => {
    const response = await page.goto("roster.html", { waitUntil: "domcontentloaded" });

    expect(response && response.status()).toBeLessThan(400);
    await expect(page.locator("#site-shell-frame")).toHaveCount(0);
    await expect(page.locator("body")).toContainText("Roster & Projects");

    const canScroll = await page.evaluate(() => {
      const scroller = document.scrollingElement || document.documentElement;
      return scroller.scrollHeight > window.innerHeight;
    });

    expect(canScroll).toBe(true);

    if (testInfo.project.name === "mobile") {
      await dragPageUpWithTouch(page);
    } else {
      await page.mouse.wheel(0, 500);
    }

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  for (const route of shellSmokeRoutes) {
    test(`${route.label} has no nested vertical scroll container`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });

      expect(response && response.status(), route.path).toBeLessThan(400);
      await expect(page.locator("#site-shell-frame")).toHaveCount(0);

      const nestedScrollers = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("body *"))
          .map((element) => {
            const style = window.getComputedStyle(element);
            const overflowY = style.overflowY;

            if (!["auto", "scroll"].includes(overflowY)) {
              return null;
            }

            if (element.scrollHeight <= element.clientHeight + 2) {
              return null;
            }

            const id = element.id ? `#${element.id}` : "";
            const className =
              typeof element.className === "string" && element.className
                ? `.${element.className.trim().replace(/\s+/g, ".")}`
                : "";

            return `${element.tagName.toLowerCase()}${id}${className}`;
          })
          .filter(Boolean);
      });

      expect(nestedScrollers).toEqual([]);
    });
  }
});
