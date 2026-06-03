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
    variants: 1
  }
];

const mockCatalogProducts = [
  {
    id: "catalog-362",
    catalogProductId: 362,
    name: "Unisex Organic T-Shirt | Econscious EC1000",
    type: "T-Shirt",
    brand: "Econscious",
    model: "EC1000",
    thumbnailUrl: testImage("Catalog Tee", "#f7f4ec"),
    variantCount: 10,
    variants: 10,
    techniques: [{ key: "dtg", name: "DTG printing" }],
    category: {
      id: 24,
      parentId: 6,
      title: "T-Shirts",
      path: ["Apparel", "T-Shirts"],
      pathLabel: "Apparel / T-Shirts",
      topCategoryId: 6,
      topCategoryTitle: "Apparel"
    },
    isPurchasable: false,
    source: "printful-catalog"
  },
  {
    id: "catalog-901",
    catalogProductId: 901,
    name: "Gaming Mouse Pad",
    type: "Mouse Pad",
    brand: "",
    model: "",
    description: "A smooth desk surface for release art, logo marks, and workstation drops.",
    thumbnailUrl: testImage("Mouse Pad", "#dbeafe"),
    variantCount: 1,
    variants: 1,
    techniques: [{ key: "sublimation", name: "Sublimation" }],
    category: {
      id: 55,
      parentId: 50,
      title: "Mousepads",
      path: ["Accessories", "Desk Gear", "Mousepads"],
      pathLabel: "Accessories / Desk Gear / Mousepads",
      topCategoryId: 50,
      topCategoryTitle: "Accessories"
    },
    isPurchasable: false,
    source: "printful-catalog"
  },
  {
    id: "catalog-777",
    catalogProductId: 777,
    name: "Enhanced Matte Paper Poster",
    type: "Poster",
    thumbnailUrl: testImage("Poster", "#fff7cf"),
    variantCount: 5,
    variants: 5,
    techniques: [{ key: "digital", name: "Digital printing" }],
    category: {
      id: 71,
      parentId: 70,
      title: "Posters",
      path: ["Home & Living", "Wall Art", "Posters"],
      pathLabel: "Home & Living / Wall Art / Posters",
      topCategoryId: 70,
      topCategoryTitle: "Home & Living"
    },
    isPurchasable: false,
    source: "printful-catalog"
  }
];

function withStandalone(routePath) {
  const url = new URL(routePath, "http://pawn.local/");
  url.searchParams.set("standalone", "1");
  return `${url.pathname.replace(/^\//, "")}${url.search}${url.hash}`;
}

async function mockMerchApi(page) {
  const requests = {
    shipping: [],
    draftOrders: []
  };

  await page.route(/\/api\/merch\/products\?status=synced$/, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ products: mockProducts })
    });
  });

  await page.route(/\/api\/merch\/catalog$/, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        categories: [
          { id: 6, parentId: null, title: "Apparel" },
          { id: 24, parentId: 6, title: "T-Shirts" },
          { id: 50, parentId: null, title: "Accessories" },
          { id: 55, parentId: 50, title: "Mousepads" },
          { id: 70, parentId: null, title: "Home & Living" },
          { id: 71, parentId: 70, title: "Posters" },
          { id: 99, parentId: null, title: "Jewelry" }
        ],
        categoryTree: [
          {
            id: 6,
            title: "Apparel",
            productCount: 1,
            children: [{ id: 24, title: "T-Shirts", productCount: 1, children: [] }]
          },
          {
            id: 50,
            title: "Accessories",
            productCount: 1,
            children: [{ id: 55, title: "Mousepads", productCount: 1, children: [] }]
          },
          {
            id: 70,
            title: "Home & Living",
            productCount: 1,
            children: [{ id: 71, title: "Posters", productCount: 1, children: [] }]
          }
        ],
        products: mockCatalogProducts
      })
    });
  });

  await page.route(/\/api\/merch\/shipping-rates$/, async (route) => {
    const body = route.request().postDataJSON();
    requests.shipping.push(body);

    if (body && body.recipient && body.recipient.zip === "00000") {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({
          error: "printful_request_failed",
          message: "Shipping rates are temporarily unavailable."
        })
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        rates: [
          {
            id: "STANDARD",
            name: "Standard",
            rate: "6.95",
            currency: "USD",
            minDeliveryDays: 5,
            maxDeliveryDays: 8
          },
          {
            id: "EXPRESS",
            name: "Express",
            rate: "14.95",
            currency: "USD",
            minDeliveryDays: 2,
            maxDeliveryDays: 4
          }
        ]
      })
    });
  });

  await page.route(/\/api\/merch\/draft-order$/, async (route) => {
    const body = route.request().postDataJSON();
    requests.draftOrders.push(body);

    if (body && body.recipient && body.recipient.email === "disabled@example.com") {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          error: "draft_orders_disabled",
          message: "Draft Printful orders are disabled for this environment."
        })
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        order: {
          id: 9001,
          externalId: body && body.external_id,
          status: "draft",
          dashboardUrl: ""
        }
      })
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
            syncVariantId: 2001,
            retailPrice: "28.00",
            currency: "USD",
            isSynced: true,
            catalogVariantId: 1001
          }
        ]
      })
    });
  });

  return requests;
}

async function fillCheckoutForm(page, overrides = {}) {
  const form = page.locator("#printful-draft-order-form");
  const values = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "555-0100",
    address1: "12 Synth Lane",
    address2: "",
    city: "Kingston",
    state_code: "NY",
    country_code: "US",
    zip: "12401",
    ...overrides
  };

  await form.locator("[name='name']").fill(values.name);
  await form.locator("[name='email']").fill(values.email);
  await form.locator("[name='phone']").fill(values.phone);
  await form.locator("[name='address1']").fill(values.address1);
  await form.locator("[name='address2']").fill(values.address2);
  await form.locator("[name='city']").fill(values.city);
  await form.locator("[name='state_code']").fill(values.state_code);
  await form.locator("[name='country_code']").selectOption(values.country_code);
  await form.locator("[name='zip']").fill(values.zip);
  await form.locator("[name='policy']").check();
}

async function addCuratedProductToCart(page) {
  await page.goto(withStandalone("merch.html?product=tee-1"), { waitUntil: "domcontentloaded" });
  await expect(page.locator(".merch-product-detail")).toContainText("Borrowed Brightness Crest Tee");
  await page.locator(".merch-product-detail [data-printful-add-form]").evaluate((form) => form.requestSubmit());
  await expect(page.locator("#printful-cart-count")).toHaveText("1");
}

test.describe("merch discovery", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__merchEvents = [];
      window.addEventListener("pawnisland:merch-event", (event) => {
        window.__merchEvents.push(event.detail);
      });
    });
    page.merchApiRequests = await mockMerchApi(page);
  });

  test("opens on purchase-ready products by default", async ({ page }) => {
    await page.goto(withStandalone("merch.html"), { waitUntil: "domcontentloaded" });

    await expect(page.locator("#printful-category-filters [data-printful-filter='category'][data-printful-filter-value='all']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".merch-toolbar")).toBeVisible();
    await expect(page.locator("#printful-results-summary")).toContainText("Order-ready goods: 5 of 5 products shown");
    await expect(page.locator("[data-printful-product-card]")).toHaveCount(5);
    await expect(page.locator("[data-printful-product-card]").first()).toContainText("Borrowed Brightness Crest Tee");
    await expect(page.locator("[data-printful-mode='catalog']")).toHaveCount(0);
  });

  test("keeps featured rack as a shorter alternate view", async ({ page }) => {
    await page.goto(withStandalone("merch.html?view=featured"), { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-printful-mode='featured']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".merch-toolbar")).toBeVisible();
    await expect(page.locator("#printful-results-summary")).toContainText("Featured rack: 4 of 5 matching products shown.");
    await expect(page.locator("[data-printful-product-card]")).toHaveCount(4);
  });

  test("does not expose catalog mode without the internal flag", async ({ page }) => {
    await page.goto(withStandalone("merch.html?view=catalog"), { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-printful-mode='catalog']")).toHaveCount(0);
    await expect(page.locator("#printful-results-summary")).toContainText("Order-ready goods: 5 of 5 products shown");
    await expect(page.locator("#printful-product-category-filters")).not.toContainText("Mousepads");
  });

  test("keeps Printful catalog discovery behind the internal flag", async ({ page }) => {
    await page.goto(withStandalone("merch.html?internal=catalog&view=catalog"), { waitUntil: "domcontentloaded" });

    await expect(page.locator("[data-printful-mode='catalog']")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#printful-results-summary")).toContainText("Internal design catalog: 3 of 3 products shown");
    await expect(page.locator("#printful-product-category-filters")).toContainText("Desk Gear");
    await expect(page.locator("#printful-product-category-filters")).not.toContainText("Jewelry");

    await page.locator("#printful-product-category-filters [data-printful-filter='category'][data-printful-filter-value='desk-gear']").click();
    await expect(page.locator("#printful-results-summary")).toContainText("Internal design catalog: 1 of 3 products shown");
    await expect(page.locator("[data-printful-product-card]")).toHaveCount(1);
    await expect(page.locator("[data-printful-product-card]")).toContainText("Gaming Mouse Pad");

    await page.locator("[data-printful-product-link='catalog-901']").click();
    await expect(page.locator(".merch-product-detail")).toContainText("Request This Product");
    await expect(page.locator(".merch-product-detail")).not.toContainText("Add to Cart");
  });

  test("adds a curated product to the manual invoice request cart", async ({ page }) => {
    await page.goto(withStandalone("merch.html?product=tee-1"), { waitUntil: "domcontentloaded" });

    await expect(page.locator(".merch-product-detail")).toContainText("Borrowed Brightness Crest Tee");
    await expect(page.locator(".merch-product-detail")).toContainText("Add to Request");

    await page.locator(".merch-product-detail [data-printful-add-form]").evaluate((form) => form.requestSubmit());
    await expect(page.locator("#printful-cart-count")).toHaveText("1");
    await expect(page.locator(".merch-cart__items")).toContainText("Borrowed Brightness Crest Tee");
    await expect(page.locator(".merch-cart__items")).toContainText("$28.00");
    await expect(page.locator(".merch-policy-check")).toContainText("not a completed payment");

    const eventNames = await page.evaluate(() => window.__merchEvents.map((event) => event.name));
    expect(eventNames).toContain("view_store");
    expect(eventNames).toContain("view_item");
    expect(eventNames).toContain("add_to_cart");
  });

  test("adds one-option products directly without an option picker", async ({ page }) => {
    await page.goto(withStandalone("merch.html"), { waitUntil: "domcontentloaded" });

    const oneOptionCard = page.locator("[data-printful-product-card='tee-5']");
    await expect(oneOptionCard).toContainText("Add to Request");
    await expect(oneOptionCard).not.toContainText("Choose Options");

    await oneOptionCard.locator("[data-printful-direct-add-product='tee-5']").click();
    await expect(page.locator("#printful-cart-count")).toHaveText("1");
    await expect(page.locator(".merch-cart__items")).toContainText("Quiet Filter");
  });

  test("requires a shipping estimate before requesting an invoice", async ({ page }) => {
    await addCuratedProductToCart(page);
    await fillCheckoutForm(page);

    await page.locator("#printful-draft-order-form").evaluate((form) => form.requestSubmit());

    await expect(page.locator("#printful-cart-status")).toContainText("Estimate shipping before requesting an invoice.");
    const eventNames = await page.evaluate(() => window.__merchEvents.map((event) => event.name));
    expect(eventNames).toContain("checkout_error");
    expect(page.merchApiRequests.shipping).toHaveLength(0);
    expect(page.merchApiRequests.draftOrders).toHaveLength(0);
  });

  test("estimates shipping and creates a manual invoice request", async ({ page }) => {
    await addCuratedProductToCart(page);
    await fillCheckoutForm(page);

    await page.locator("[data-printful-estimate-shipping]").click();
    await expect(page.locator("#printful-shipping-select")).toBeVisible();
    await expect(page.locator("#printful-shipping-select")).toContainText("Standard");

    await page.locator("#printful-draft-order-form").evaluate((form) => form.requestSubmit());

    await expect(page.locator("#printful-cart-count")).toHaveText("0");
    await expect(page.locator(".merch-cart__notice")).toContainText("Order request received #9001");
    expect(page.merchApiRequests.shipping).toHaveLength(1);
    expect(page.merchApiRequests.draftOrders).toHaveLength(1);
    expect(page.merchApiRequests.draftOrders[0].shipping).toBe("STANDARD");
    expect(page.merchApiRequests.draftOrders[0].external_id).toMatch(/^pir_/);
    const eventNames = await page.evaluate(() => window.__merchEvents.map((event) => event.name));
    expect(eventNames).toEqual(expect.arrayContaining(["estimate_shipping", "begin_checkout", "submit_order_request"]));
  });

  test("keeps the cart available when shipping estimates fail", async ({ page }) => {
    await addCuratedProductToCart(page);
    await fillCheckoutForm(page, { zip: "00000" });

    await page.locator("[data-printful-estimate-shipping]").click();
    await expect(page.locator("#printful-cart-status")).toContainText("Shipping rates are temporarily unavailable.");
    await expect(page.locator("#printful-shipping-select")).toHaveCount(0);

    await page.locator("#printful-draft-order-form").evaluate((form) => form.requestSubmit());

    await expect(page.locator("#printful-cart-status")).toContainText("Estimate shipping before requesting an invoice.");
    await expect(page.locator("#printful-cart-count")).toHaveText("1");
    expect(page.merchApiRequests.draftOrders).toHaveLength(0);
  });

  test("surfaces draft-order failures without clearing the request cart", async ({ page }) => {
    await addCuratedProductToCart(page);
    await fillCheckoutForm(page, { email: "disabled@example.com" });

    await page.locator("[data-printful-estimate-shipping]").click();
    await expect(page.locator("#printful-shipping-select")).toBeVisible();

    await page.locator("#printful-draft-order-form").evaluate((form) => form.requestSubmit());

    await expect(page.locator("#printful-cart-status")).toContainText("Draft Printful orders are disabled for this environment.");
    await expect(page.locator("#printful-cart-count")).toHaveText("1");
    expect(page.merchApiRequests.draftOrders).toHaveLength(1);
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
