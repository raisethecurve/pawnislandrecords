const { test, expect } = require("@playwright/test");

function testImage(label, fill) {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
      <rect width="320" height="320" fill="${fill}" />
      <text x="160" y="164" text-anchor="middle" font-family="Arial" font-size="28" fill="#111">${label}</text>
    </svg>
  `)}`;
}

const mockProducts = [
  {
    id: "tee-1",
    name: "Velvet Orchard - Borrowed Brightness 2 Tee",
    thumbnailUrl: testImage("Product 1", "#f7f4ec"),
    variants: 6
  },
  {
    id: "tee-2",
    name: "Velvet Orchard - Borrowed Brightness Tee",
    thumbnailUrl: testImage("Product 2", "#f3d6e7"),
    variants: 6
  },
  {
    id: "tee-3",
    name: "Resunant - Midnight Revival - Summoning Tee",
    thumbnailUrl: testImage("Product 3", "#111111"),
    variants: 6
  },
  {
    id: "tee-4",
    name: "Resunant - Midnight Revival - Neon Communion Tee",
    thumbnailUrl: testImage("Product 4", "#fff7cf"),
    variants: 6
  },
  {
    id: "tee-5",
    name: "Quiet Filter - Ember Mire - Wall Tee",
    thumbnailUrl: testImage("Product 5", "#d7e1ed"),
    variants: 6
  }
];

function withStandalone(routePath) {
  const url = new URL(routePath, "http://pawn.local/");
  url.searchParams.set("standalone", "1");
  return `${url.pathname.replace(/^\//, "")}${url.search}${url.hash}`;
}

async function mockMerchApi(page) {
  await page.route(/\/api\/merch\/products\?status=synced$/, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ products: mockProducts })
    });
  });

  await page.route(/\/api\/merch\/products\/[^/?]+$/, async (route) => {
    const productId = route.request().url().split("/").pop();
    const product = mockProducts.find((item) => item.id === productId) || mockProducts[0];

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        product,
        images: [
          {
            id: `${product.id}-photo`,
            url: product.thumbnailUrl,
            thumbnailUrl: product.thumbnailUrl,
            label: `${product.name} product photo`,
            type: "image"
          }
        ],
        variants: [
          {
            name: `${product.name} / M`,
            retailPrice: "28.00",
            currency: "USD",
            isSynced: true,
            catalogVariantId: 1001
          }
        ]
      })
    });
  });
}

test.describe("merch discovery", () => {
  test.beforeEach(async ({ page }) => {
    await mockMerchApi(page);
  });

  test("opens on the full catalog by default", async ({ page }) => {
    await page.goto(withStandalone("merch.html"), { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-printful-mode='catalog']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".merch-toolbar")).toBeVisible();
    await expect(page.locator("#printful-results-summary")).toContainText("All designs: 5 of 5 products shown");
    await expect(page.locator("[data-printful-product-card]")).toHaveCount(5);
  });

  test("keeps featured rack as a shorter alternate view", async ({ page }) => {
    await page.goto(withStandalone("merch.html?view=featured"), { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-printful-mode='featured']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".merch-toolbar")).toBeVisible();
    await expect(page.locator("#printful-results-summary")).toContainText("Featured rack: 4 of 5 matching designs shown.");
    await expect(page.locator("[data-printful-product-card]")).toHaveCount(4);
  });

  test("keeps artwork assets separate from API product photos", async ({ page }) => {
    await page.goto(withStandalone("merch.html?product=tee-1"), { waitUntil: "domcontentloaded" });

    await expect(page.locator([".merch-card", "__mockup"].join(""))).toHaveCount(0);
    await expect(page.locator(".merch-product-detail .merch-gallery-thumb[data-printful-gallery-image-id='artwork']")).toBeVisible();
    await expect(page.locator(".merch-product-detail .merch-gallery-thumb[data-printful-gallery-image-id='product-thumbnail']")).toBeVisible();

    await page.locator(".merch-product-detail .merch-gallery-thumb[data-printful-gallery-image-id='product-thumbnail']").click();
    await expect(page.locator(".merch-product-detail .merch-gallery-image")).toHaveAttribute("src", mockProducts[0].thumbnailUrl);
    await expect(page.locator(".merch-product-gallery .merch-gallery-stage .merch-design-plate")).toHaveCount(0);
    await expect(page.locator(".merch-product-gallery .merch-gallery-thumb[data-printful-gallery-image-id='artwork'] .merch-design-plate")).toHaveCount(1);
  });
});
