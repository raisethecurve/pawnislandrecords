const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright");
const { accessibilitySmokeRoutes } = require("../tools/routes");

function withStandalone(routePath) {
  const url = new URL(routePath, "http://pawn.local/");
  url.searchParams.set("standalone", "1");
  return `${url.pathname.replace(/^\//, "")}${url.search}${url.hash}`;
}

function formatAxeViolation(violation) {
  const nodes = violation.nodes
    .slice(0, 3)
    .map((node) => node.target.join(" "))
    .join("; ");
  return `${violation.id} [${violation.impact}]: ${violation.help} (${nodes})`;
}

async function visiblePrimaryTargets(page) {
  return page.locator([
    ".label-nav a",
    ".release-header__nav a",
    ".shell-nav a",
    ".button",
    ".action-link",
    ".platform-logo-link",
    ".platform-chip",
    ".social-icon-link",
    ".catalog-filter-tab",
    ".merch-filter",
    ".pending-carousel__dot",
    ".site-audio__button",
    ".site-audio-tab[data-visible='true']",
    ".signal-card",
    ".playlist-card"
  ].join(",")).evaluateAll((elements) =>
    elements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const visible =
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          element.getAttribute("aria-hidden") !== "true";

        return {
          label:
            element.getAttribute("aria-label") ||
            element.textContent.trim().replace(/\s+/g, " ").slice(0, 80) ||
            element.className,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          visible
        };
      })
      .filter((target) => target.visible)
  );
}

async function expectPrimaryTargetsAreTouchable(page) {
  const targets = await visiblePrimaryTargets(page);
  const undersized = targets.filter((target) => target.width < 40 || target.height < 40);
  expect(undersized).toEqual([]);
}

async function expectNoHorizontalOverflow(page) {
  const overflowing = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const ignoredSelectors = [
      ".skip-link:not(:focus)",
      "#release-backdrop",
      ".site-audio[data-collapsed='true']",
      ".panel-shell::before",
      ".panel-shell::after"
    ];

    return Array.from(document.body.querySelectorAll("*"))
      .filter((element) => !ignoredSelectors.some((selector) => {
        try {
          return element.matches(selector);
        } catch (error) {
          return false;
        }
      }))
      .filter((element) => {
        let current = element.parentElement;

        while (current && current !== document.body) {
          if (current.matches(".pending-carousel__viewport")) {
            return false;
          }

          const style = window.getComputedStyle(current);
          if (["auto", "scroll"].includes(style.overflowX)) {
            return false;
          }
          current = current.parentElement;
        }

        return true;
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return {
          selector:
            element.id ||
            element.getAttribute("class") ||
            element.tagName.toLowerCase(),
          left: Math.floor(rect.left),
          right: Math.ceil(rect.right),
          width: Math.ceil(rect.width),
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

async function expectInitialFocusIsVisible(page) {
  await page.keyboard.press("Tab");
  const focusState = await page.evaluate(() => {
    const element = document.activeElement;
    if (!element || element === document.body) {
      return { active: false };
    }

    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const outlineWidth = Number.parseFloat(style.outlineWidth) || 0;
    const hasOutline = style.outlineStyle !== "none" && outlineWidth > 0;
    const hasShadow = style.boxShadow && style.boxShadow !== "none";
    const hasVisibleSize = rect.width > 0 && rect.height > 0;

    return {
      active: true,
      label: element.getAttribute("aria-label") || element.textContent.trim(),
      hasVisibleSize,
      hasVisibleFocus: hasOutline || hasShadow
    };
  });

  expect(focusState.active, "first Tab key press should focus an interactive element").toBe(true);
  expect(focusState.hasVisibleSize, `focused element should be visible: ${focusState.label || ""}`).toBe(true);
  expect(focusState.hasVisibleFocus, `focused element needs a visible focus style: ${focusState.label || ""}`).toBe(true);
}

test.describe("accessibility smoke", () => {
  for (const route of accessibilitySmokeRoutes) {
    test(`${route.label} has actionable accessibility coverage`, async ({ page }) => {
      const response = await page.goto(withStandalone(route.path), { waitUntil: "domcontentloaded" });

      expect(response && response.status(), route.path).toBeLessThan(400);
      await expect(page.locator("body")).toContainText(route.expectedText);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator('nav[aria-label="Primary"]')).toHaveCount(1);

      const seriousViolations = (await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .exclude("iframe")
        .analyze()).violations.filter((violation) => ["serious", "critical"].includes(violation.impact));

      expect(seriousViolations.map(formatAxeViolation)).toEqual([]);
      await expectInitialFocusIsVisible(page);
      await expectPrimaryTargetsAreTouchable(page);
      await expectNoHorizontalOverflow(page);
    });
  }
});
