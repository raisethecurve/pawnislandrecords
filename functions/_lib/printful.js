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
  if (error instanceof ConfigError) {
    return jsonResponse(
      {
        error: "printful_not_configured",
        message: "Printful API access is not configured for this environment."
      },
      { status: 503 }
    );
  }

  if (error instanceof PrintfulError) {
    return jsonResponse(
      {
        error: "printful_request_failed",
        status: error.status,
        message: "Printful could not complete this request."
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
    name: cleanText(product.name, "Printful product", 120),
    thumbnailUrl: cleanText(product.thumbnail_url || product.thumbnail, "", 500),
    variants: positiveInt(product.variants, 0),
    synced: positiveInt(product.synced, 0),
    isIgnored: Boolean(product.is_ignored),
    source: "printful"
  };
}

export function normalizeSyncVariant(variant) {
  return {
    id: String(variant.id || variant.sync_variant_id || variant.external_id || ""),
    syncVariantId: positiveInt(variant.id || variant.sync_variant_id),
    externalId: cleanText(variant.external_id, "", 80),
    catalogVariantId: positiveInt(variant.variant_id || variant.catalog_variant_id),
    name: cleanText(variant.name, "Variant", 140),
    retailPrice: cleanMoney(variant.retail_price || variant.price),
    currency: cleanText(variant.currency, "USD", 8),
    sku: cleanText(variant.sku, "", 80),
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

  return {
    product: normalizeStoreProduct(syncProduct),
    variants: variants.map(normalizeSyncVariant).filter((variant) => variant.id)
  };
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
      throw new Error("Each shipping item needs a Printful catalog variant.");
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
      throw new Error("Each order item needs a synced Printful variant.");
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
