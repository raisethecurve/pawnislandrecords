const PRINTFUL_API_BASE = "https://api.printful.com";

class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
}

class PrintfulError extends Error {
  constructor(status, body) {
    super("Printful request failed");
    this.name = "PrintfulError";
    this.status = status;
    this.body = body;
  }
}

class MerchRequestError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "MerchRequestError";
    this.code = code;
    this.status = status;
  }
}

export function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json; charset=utf-8");

  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", "no-store");
  }

  return new Response(JSON.stringify(body), {
    ...init,
    headers
  });
}

export function emptyOptionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    throw new Error("Invalid JSON body");
  }
}

export async function readJsonObject(request) {
  const body = await readJson(request);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new MerchRequestError("invalid_json_body", "JSON body must be an object.");
  }

  return body;
}

export function assertSameOriginRequest(context) {
  const request = context && context.request;
  const headers = request && request.headers;
  const origin = headers && headers.get("Origin") ? headers.get("Origin").trim() : "";
  const fetchSite = headers && headers.get("Sec-Fetch-Site") ? headers.get("Sec-Fetch-Site").trim().toLowerCase() : "";

  if (fetchSite === "cross-site") {
    throw new MerchRequestError("forbidden_origin", "Merch requests must come from this site.", 403);
  }

  if (!origin) {
    return;
  }

  let requestOrigin = "";

  try {
    requestOrigin = new URL(request.url).origin;
  } catch (error) {}

  if (requestOrigin && origin !== requestOrigin) {
    throw new MerchRequestError("forbidden_origin", "Merch requests must come from this site.", 403);
  }
}

export function cleanText(value, fallback = "", maxLength = 180) {
  const text = typeof value === "string" ? value.trim() : "";
  return (text || fallback).slice(0, maxLength);
}

export function positiveInt(value, fallback = null) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function cleanMoney(value) {
  const text = cleanText(value, "", 20);
  return /^\d+(\.\d{1,2})?$/.test(text) ? text : "";
}

export async function printfulFetch(context, pathname, init = {}) {
  const token = context.env.PRINTFUL_API_TOKEN || context.env.PRINTFUL_TOKEN;

  if (!token) {
    throw new ConfigError("PRINTFUL_API_TOKEN is not configured");
  }

  const url = new URL(pathname, PRINTFUL_API_BASE);
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (context.env.PRINTFUL_STORE_ID) {
    headers.set("X-PF-Store-Id", context.env.PRINTFUL_STORE_ID);
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers
  });
  const raw = await response.text();
  let data = {};

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch (error) {
      data = { raw };
    }
  }

  if (!response.ok) {
    throw new PrintfulError(response.status, data);
  }

  return {
    data,
    headers: response.headers
  };
}

export function apiErrorResponse(error) {
  if (error instanceof MerchRequestError) {
    return jsonResponse(
      {
        error: error.code,
        message: error.message
      },
      { status: error.status }
    );
  }

  if (error instanceof ConfigError) {
    return jsonResponse(
      {
        error: "printful_not_configured",
        message: "Merch service access is not configured for this environment."
      },
      { status: 503 }
    );
  }

  if (error instanceof PrintfulError) {
    return jsonResponse(
      {
        error: "printful_request_failed",
        status: error.status,
        message: "The merch service could not complete this request."
      },
      { status: 502 }
    );
  }

  return jsonResponse(
    {
      error: "merch_api_error",
      message: error && error.message ? error.message : "The merch API could not complete this request."
    },
    { status: 400 }
  );
}

export function resultArray(data) {
  if (Array.isArray(data && data.result)) {
    return data.result;
  }

  if (Array.isArray(data && data.data)) {
    return data.data;
  }

  return [];
}

export function resultNamedArray(data, key) {
  if (!key) {
    return resultArray(data);
  }

  if (Array.isArray(data && data.result && data.result[key])) {
    return data.result[key];
  }

  if (Array.isArray(data && data[key])) {
    return data[key];
  }

  return resultArray(data);
}

export function resultObject(data) {
  if (data && data.result && typeof data.result === "object") {
    return data.result;
  }

  if (data && data.data && typeof data.data === "object") {
    return data.data;
  }

  return {};
}

export function normalizeStoreProduct(product) {
  return {
    id: String(product.id || product.external_id || ""),
    externalId: cleanText(product.external_id, "", 80),
    name: cleanText(product.name, "Merch product", 120),
    thumbnailUrl: cleanText(product.thumbnail_url || product.thumbnail, "", 500),
    variants: positiveInt(product.variants, 0),
    synced: positiveInt(product.synced, 0),
    isIgnored: Boolean(product.is_ignored),
    source: "printful"
  };
}

export function normalizeCatalogCategory(category) {
  return {
    id: positiveInt(category && category.id),
    parentId: positiveInt(category && (category.parent_id || category.parentId)),
    title: cleanText(category && (category.title || category.name), "Catalog category", 120),
    imageUrl: cleanText(category && (category.image_url || category.imageUrl), "", 800)
  };
}

function normalizeTechnique(technique) {
  if (typeof technique === "string") {
    return {
      key: cleanText(technique, "", 80),
      name: cleanText(technique, "", 80)
    };
  }

  return {
    key: cleanText(technique && (technique.key || technique.name), "", 80),
    name: cleanText(technique && (technique.display_name || technique.displayName || technique.name || technique.key), "", 120)
  };
}

function normalizeColor(color) {
  if (typeof color === "string") {
    return {
      name: cleanText(color, "", 80),
      value: ""
    };
  }

  return {
    name: cleanText(color && (color.name || color.label), "", 80),
    value: cleanText(color && (color.value || color.hex || color.color_code || color.colorCode), "", 32)
  };
}

export function normalizeCatalogProduct(product) {
  const catalogProductId = positiveInt(product && product.id);
  const mainCategoryId = positiveInt(product && (product.main_category_id || product.mainCategoryId));
  const variantCount = positiveInt(product && (product.variant_count || product.variantCount), 0);
  const techniques = Array.isArray(product && product.techniques)
    ? product.techniques.map(normalizeTechnique).filter((technique) => technique.key || technique.name)
    : [];
  const colors = Array.isArray(product && product.colors)
    ? product.colors.map(normalizeColor).filter((color) => color.name || color.value)
    : [];
  const sizes = Array.isArray(product && product.sizes)
    ? product.sizes.map((size) => cleanText(size, "", 40)).filter(Boolean)
    : [];

  return {
    id: catalogProductId ? `catalog-${catalogProductId}` : "",
    catalogProductId,
    mainCategoryId,
    name: cleanText(product && (product.title || product.name), "Printful catalog product", 160),
    type: cleanText(product && (product.type_name || product.type), "", 120),
    typeKey: cleanText(product && product.type, "", 80),
    brand: cleanText(product && product.brand, "", 120),
    model: cleanText(product && product.model, "", 120),
    description: cleanText(product && product.description, "", 520),
    thumbnailUrl: cleanText(product && product.image, "", 800),
    currency: cleanText(product && product.currency, "USD", 8),
    variantCount,
    variants: variantCount,
    sizes,
    colors,
    techniques,
    placements: Array.isArray(product && product.placements)
      ? product.placements
          .map((placement) => cleanText(placement && (placement.placement || placement.name), "", 80))
          .filter(Boolean)
      : [],
    isDiscontinued: Boolean(product && (product.is_discontinued || product.isDiscontinued)),
    isPurchasable: false,
    source: "printful-catalog"
  };
}

function categoryAncestors(category, categoryMap) {
  const trail = [];
  const visited = new Set();
  let current = category;

  while (current && current.id && !visited.has(current.id)) {
    trail.unshift(current);
    visited.add(current.id);
    current = current.parentId ? categoryMap.get(current.parentId) : null;
  }

  return trail;
}

export function attachCatalogCategories(products, categories) {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  return products.map((product) => {
    const category = product.mainCategoryId ? categoryMap.get(product.mainCategoryId) : null;
    const trail = category ? categoryAncestors(category, categoryMap) : [];
    const top = trail[0] || category || null;
    const titles = trail.map((item) => item.title).filter(Boolean);

    return {
      ...product,
      category: category
        ? {
            ...category,
            path: titles,
            pathLabel: titles.join(" / "),
            topCategoryId: top ? top.id : category.id,
            topCategoryTitle: top ? top.title : category.title
          }
        : null
    };
  });
}

export function buildActiveCatalogTree(categories, products) {
  const productCounts = new Map();
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  products.forEach((product) => {
    if (!product.mainCategoryId) {
      return;
    }

    categoryAncestors(categoryMap.get(product.mainCategoryId), categoryMap).forEach((category) => {
      productCounts.set(category.id, (productCounts.get(category.id) || 0) + 1);
    });
  });

  function childrenFor(parentId) {
    return categories
      .filter((category) => (category.parentId || null) === (parentId || null))
      .map((category) => ({
        ...category,
        productCount: productCounts.get(category.id) || 0,
        children: childrenFor(category.id)
      }))
      .filter((category) => category.productCount > 0)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  return childrenFor(null);
}

export function normalizeImageCandidate(input, fallbackLabel = "Product image") {
  if (!input) {
    return null;
  }

  if (typeof input === "string") {
    const url = cleanText(input, "", 800);
    return url ? { url, thumbnailUrl: url, label: fallbackLabel, type: "image" } : null;
  }

  if (typeof input !== "object") {
    return null;
  }

  const url = cleanText(
    input.preview_url ||
      input.previewUrl ||
      input.mockup_file_url ||
      input.mockupFileUrl ||
      input.mockup_url ||
      input.mockupUrl ||
      input.url ||
      input.image_url ||
      input.imageUrl ||
      input.image ||
      input.src ||
      input.thumbnail_url ||
      input.thumbnailUrl ||
      input.thumbnail,
    "",
    800
  );
  const thumbnailUrl = cleanText(
    input.thumbnail_url ||
      input.thumbnailUrl ||
      input.thumbnail ||
      input.preview_url ||
      input.previewUrl ||
      input.mockup_file_url ||
      input.mockupFileUrl ||
      input.mockup_url ||
      input.mockupUrl ||
      input.url ||
      input.image_url ||
      input.imageUrl ||
      input.image ||
      input.src,
    url,
    800
  );

  if (!url) {
    return null;
  }

  return {
    id: cleanText(input.id || input.file_id || input.fileId || input.hash || url, url, 160),
    url,
    thumbnailUrl,
    label: cleanText(input.label || input.title || input.name || input.filename || input.type, fallbackLabel, 120),
    type: cleanText(input.type || input.placement || input.role, "image", 80)
  };
}

function addImageCandidate(images, candidate) {
  if (!candidate || !candidate.url) {
    return;
  }

  const key = candidate.url.toLowerCase();

  if (images.some((image) => image.url.toLowerCase() === key)) {
    return;
  }

  images.push(candidate);
}

function collectImageCandidates(images, source, fallbackLabel) {
  if (!source || typeof source !== "object") {
    return;
  }

  [
    source.thumbnail_url,
    source.thumbnail,
    source.preview_url,
    source.previewUrl,
    source.mockup_file_url,
    source.mockupFileUrl,
    source.mockup_url,
    source.mockupUrl,
    source.image_url,
    source.imageUrl,
    source.image,
    source.url
  ].forEach((value) => addImageCandidate(images, normalizeImageCandidate(value, fallbackLabel)));

  [
    source.files,
    source.images,
    source.mockups,
    source.previews,
    source.placements,
    source.product_images,
    source.productImages,
    source.preview_images,
    source.previewImages
  ]
    .filter(Array.isArray)
    .flat()
    .forEach((value) => addImageCandidate(images, normalizeImageCandidate(value, fallbackLabel)));
}

export function normalizeSyncVariant(variant) {
  return {
    id: String(variant.id || variant.sync_variant_id || variant.external_id || ""),
    syncVariantId: positiveInt(variant.id || variant.sync_variant_id),
    externalId: cleanText(variant.external_id, "", 80),
    catalogVariantId: positiveInt(variant.variant_id || variant.catalog_variant_id),
    catalogProductId: positiveInt(variant.product && variant.product.product_id),
    name: cleanText(variant.name, "Variant", 140),
    retailPrice: cleanMoney(variant.retail_price || variant.price),
    currency: cleanText(variant.currency, "USD", 8),
    sku: cleanText(variant.sku, "", 80),
    size: cleanText(variant.size || (variant.product && variant.product.size), "", 40),
    color: cleanText(variant.color || (variant.product && variant.product.color), "", 80),
    imageUrl: cleanText(variant.product && variant.product.image, "", 800),
    isSynced: variant.synced !== false && !variant.is_ignored
  };
}

export function normalizeDetailedProduct(data) {
  const result = resultObject(data);
  const syncProduct = result.sync_product || result.product || result;
  const variants = Array.isArray(result.sync_variants)
    ? result.sync_variants
    : Array.isArray(result.variants)
      ? result.variants
      : [];
  const images = [];

  collectImageCandidates(images, syncProduct, cleanText(syncProduct.name, "Product image", 120));
  variants.forEach((variant) => {
    collectImageCandidates(images, variant, cleanText(variant.name, "Product image", 120));
    collectImageCandidates(images, variant.product, cleanText(variant.name, "Product image", 120));
  });

  return {
    product: {
      ...normalizeStoreProduct(syncProduct),
      images
    },
    variants: variants.map(normalizeSyncVariant).filter((variant) => variant.id),
    images
  };
}

export function normalizeMockupTaskImages(task) {
  const result = task && task.result && typeof task.result === "object" ? task.result : task;
  const mockups = Array.isArray(result && result.mockups) ? result.mockups : [];
  const images = [];

  mockups.forEach((mockup) => {
    addImageCandidate(
      images,
      normalizeImageCandidate(
        mockup && (mockup.mockup_url || mockup.url || mockup.image_url),
        cleanText(mockup && (mockup.display_name || mockup.placement), "Generated product image", 120)
      )
    );

    const extras = Array.isArray(mockup && mockup.extra) ? mockup.extra : [];
    extras.forEach((extra) => {
      addImageCandidate(
        images,
        normalizeImageCandidate(extra, cleanText(extra && (extra.title || extra.option), "Generated product image", 120))
      );
    });
  });

  return images;
}

export function sanitizeRecipient(input, { requireFullAddress = true } = {}) {
  const recipient = {
    name: cleanText(input && input.name, "", 120),
    email: cleanText(input && input.email, "", 160),
    phone: cleanText(input && input.phone, "", 40),
    address1: cleanText(input && input.address1, "", 160),
    address2: cleanText(input && input.address2, "", 160),
    city: cleanText(input && input.city, "", 120),
    state_code: cleanText(input && input.state_code, "", 12).toUpperCase(),
    country_code: cleanText(input && input.country_code, "", 4).toUpperCase(),
    zip: cleanText(input && input.zip, "", 32)
  };

  if (!recipient.country_code) {
    throw new Error("Country is required.");
  }

  if (["US", "CA", "AU"].includes(recipient.country_code) && !recipient.state_code) {
    throw new Error("State or province is required for this country.");
  }

  if (requireFullAddress) {
    const required = ["name", "email", "address1", "city", "zip"];
    const missing = required.filter((key) => !recipient[key]);

    if (missing.length) {
      throw new Error("Name, email, street address, city, and postal code are required.");
    }
  }

  return Object.fromEntries(Object.entries(recipient).filter(([, value]) => value));
}

export function sanitizeShippingItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one item is required.");
  }

  if (items.length > 20) {
    throw new Error("Cart is too large for this merch request.");
  }

  return items.map((item) => {
    const quantity = Math.min(positiveInt(item && item.quantity, 1), 10);
    const catalogVariantId = positiveInt(item && (item.variant_id || item.catalogVariantId || item.catalog_variant_id));
    const externalVariantId = cleanText(item && (item.external_variant_id || item.externalVariantId), "", 80);
    const value = cleanMoney(item && item.value);
    const sanitized = { quantity };

    if (catalogVariantId) {
      sanitized.variant_id = catalogVariantId;
    } else if (externalVariantId) {
      sanitized.external_variant_id = externalVariantId;
    } else {
      throw new Error("Each shipping item needs a catalog variant.");
    }

    if (value) {
      sanitized.value = value;
    }

    return sanitized;
  });
}

export function sanitizeOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one item is required.");
  }

  if (items.length > 20) {
    throw new Error("Cart is too large for this merch request.");
  }

  return items.map((item) => {
    const quantity = Math.min(positiveInt(item && item.quantity, 1), 10);
    const syncVariantId = positiveInt(item && (item.sync_variant_id || item.syncVariantId));
    const externalVariantId = cleanText(item && (item.external_variant_id || item.externalVariantId), "", 80);
    const retailPrice = cleanMoney(item && (item.retail_price || item.retailPrice));
    const name = cleanText(item && item.name, "", 120);
    const sanitized = { quantity };

    if (syncVariantId) {
      sanitized.sync_variant_id = syncVariantId;
    } else if (externalVariantId) {
      sanitized.external_variant_id = externalVariantId;
    } else {
      throw new Error("Each order item needs an order-ready variant.");
    }

    if (retailPrice) {
      sanitized.retail_price = retailPrice;
    }

    if (name) {
      sanitized.name = name;
    }

    return sanitized;
  });
}

export function shortOrderId() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `pir_${Date.now().toString(36)}_${suffix}`.slice(0, 32);
}
