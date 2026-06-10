const { test, expect } = require("@playwright/test");

function withStandalone(routePath) {
  const url = new URL(routePath, "http://pawn.local/");
  url.searchParams.set("standalone", "1");
  return `${url.pathname.replace(/^\//, "")}${url.search}${url.hash}`;
}

test.describe("media embed resilience", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.PAWN_MEDIA_EMBED_SLOW_MS = 100;
      window.PAWN_MEDIA_EMBED_READY_MS = 2000;
      window.PAWN_MEDIA_EMBED_FAIL_MS = 2500;
    });
  });

  test("home Spotify embed exposes a fallback action when the player is slow", async ({ page }) => {
    await page.route("https://open.spotify.com/embed/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.abort();
    });
    await page.goto(withStandalone("index.html"), { waitUntil: "domcontentloaded" });

    const frame = page.locator(".hero-playlist-embed [data-media-embed-frame]");
    await expect(frame).toBeVisible();
    await expect(frame).toHaveAttribute("data-media-embed-bound", "true");

    await expect(frame).toHaveAttribute("data-embed-state", /slow|error/);
    await expect(frame.locator("[data-media-embed-status]")).toContainText("Spotify preview");
    await expect(frame.locator(".media-embed__action")).toHaveAttribute(
      "href",
      /open\.spotify\.com\/playlist\/6Ro52nZas5JxzVgQa353Cw/
    );
  });

  test("release YouTube embed exposes a fallback action when the player is slow", async ({ page }) => {
    await page.route("https://www.youtube.com/embed/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.abort();
    });
    await page.goto(withStandalone("releases/rhea-mauro-hearthblood/index.html"), {
      waitUntil: "domcontentloaded"
    });

    const frame = page.locator("#release-youtube-embed [data-media-embed-frame]");
    await frame.scrollIntoViewIfNeeded();
    await expect(frame).toBeVisible();
    await expect(frame).toHaveAttribute("data-media-embed-bound", "true");

    await expect(frame).toHaveAttribute("data-embed-state", /slow|error/);
    await expect(frame.locator("[data-media-embed-status]")).toContainText("YouTube preview");
    await expect(frame.locator(".media-embed__action")).toHaveAttribute("href", /youtube\.com\/watch\?v=ufrYH6hyT3Q/);
  });
});
