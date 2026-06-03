import { cleanText, positiveInt } from "./printful.js";

const MOCKUP_NAMESPACE = "merch/mockups/v1";
const GLOBAL_MANIFEST_KEY = `${MOCKUP_NAMESPACE}/manifest.json`;
const STORAGE_BINDINGS = ["MERCH_MOCKUP_BUCKET", "MOCKUP_BUCKET", "R2_BUCKET"];

export function mockupStorageStatus(context) {
  const binding = findMockupStorageBinding(context);
  const publicBaseUrl = cleanText(
    context.env.MERCH_MOCKUP_PUBLIC_BASE_URL || context.env.MOCKUP_PUBLIC_BASE_URL,
    "",
    500
  );
  const assetProxyBaseUrl = mockupAssetProxyBaseUrl(context);

  return {
    enabled: Boolean(binding.bucket),
    binding: binding.name || "",
    publicBaseUrl,
    assetProxyBaseUrl,
    namespace: MOCKUP_NAMESPACE,
    manifestKey: GLOBAL_MANIFEST_KEY,
    stored: [],
    failed: [],
    message: binding.bucket
      ? "Storage is available. Use the store action after a completed task."
      : "No R2 bucket binding found. Add MERCH_MOCKUP_BUCKET, MOCKUP_BUCKET, or R2_BUCKET to store mockups."
  };
}

export function buildMockupStorageContext(body, { productId = null, payload = null, taskKey = "", task = null } = {}) {
  const catalogProductId = positiveInt(
    body.catalogProductId || body.catalog_product_id || body.productId || body.product_id || productId,
    productId
  );
  const syncProductId = cleanText(
    body.syncProductId ||
      body.sync_product_id ||
      body.storeProductId ||
      body.store_product_id ||
      body.merchProductId ||
      body.merch_product_id,
    catalogProductId ? `catalog-${catalogProductId}` : "product",
    120
  );
  const productKey = productKeyFor(syncProductId);
  const catalogVariantIds = intList(
    body.catalogVariantIds ||
      body.catalog_variant_ids ||
      body.variantIds ||
      body.variant_ids ||
      (payload && payload.variant_ids),
    []
  );
  const viewOptions = textList(
    body.options || body.mockupOptions || body.mockup_options || (payload && payload.options),
    []
  );
  const styleGroups = textList(
    body.option_groups ||
      body.optionGroups ||
      body.mockupOptionGroups ||
      body.mockup_option_groups ||
      (payload && payload.option_groups),
    []
  );
  const designSlug = slugPart(body.designSlug || body.design_slug || body.designName || body.design_name || "design");
  const designName = cleanText(body.designName || body.design_name, designSlug, 160);
  const variantScope = cleanText(
    body.variantScope ||
      body.variant_scope ||
      body.colorScope ||
      body.color_scope ||
      body.color ||
      (catalogVariantIds.length ? `variant-${catalogVariantIds.join("-")}` : ""),
    "all-variants",
    160
  );
  const placements = placementList(body, payload);
  const taskStatus = cleanText(task && task.status, "", 80);

  return {
    productKey,
    productId: syncProductId,
    syncProductId,
    productTitle: cleanText(body.productTitle || body.product_title, "", 180),
    artist: cleanText(body.artist, "", 120),
    drop: cleanText(body.drop, "", 120),
    catalogProductId,
    catalogVariantIds,
    variantScope,
    variantSlug: slugPart(variantScope),
    designSlug,
    designName,
    designSourceUrl: publicUrl(
      body.designSourceUrl ||
        body.design_source_url ||
        body.frontImageUrl ||
        body.front_image_url ||
        firstPayloadFileUrl(payload),
      ""
    ),
    scenario: cleanText(body.scenario, "manual", 80),
    placement: placements.join(", ") || "front",
    placementSlug: slugPart(placements.join("-") || "front"),
    view: viewOptions.join(", ") || "Front",
    viewSlug: slugPart(body.viewSlug || body.view_slug || viewOptions.join("-") || "front"),
    style: styleGroups.join(", ") || "Flat",
    styleSlug: slugPart(body.styleSlug || body.style_slug || styleGroups.join("-") || "flat"),
    format: cleanText(body.format, "", 8).toLowerCase(),
    width: positiveInt(body.width, null),
    taskKey: cleanText(taskKey || body.taskKey || body.task_key || (task && task.task_key), "", 180),
    taskStatus,
    generatedAt: new Date().toISOString(),
    cacheControl: cleanText(
      body.cacheControl || body.cache_control,
      "public, max-age=86400, stale-while-revalidate=604800",
      180
    )
  };
}

export async function readMockupManifest(context, body = {}) {
  const binding = findMockupStorageBinding(context);
  const status = mockupStorageStatus(context);

  if (!binding.bucket) {
    return {
      storage: status,
      manifestKey: "",
      manifest: null
    };
  }

  const requestedProductId = cleanText(
    body.syncProductId ||
      body.sync_product_id ||
      body.storeProductId ||
      body.store_product_id ||
      body.merchProductId ||
      body.merch_product_id ||
      body.productKey ||
      body.product_key ||
      body.productId ||
      body.product_id,
    "",
    120
  );
  const manifestKey = requestedProductId
    ? productManifestKey(productKeyFor(requestedProductId))
    : GLOBAL_MANIFEST_KEY;

  return {
    storage: status,
    manifestKey,
    manifest: await readJsonFromBucket(binding.bucket, manifestKey, null)
  };
}

export async function storeMockupImages(context, images, storageContext) {
  const binding = findMockupStorageBinding(context);
  const status = mockupStorageStatus(context);

  if (!binding.bucket) {
    return status;
  }

  if (!images.length) {
    return {
      ...status,
      message: "The completed task did not include mockup URLs to store."
    };
  }

  const publicBaseUrl = status.publicBaseUrl.replace(/\/+$/, "");
  const assetProxyBaseUrl = status.assetProxyBaseUrl;
  const stored = [];
  const failed = [];

  for (const [index, image] of images.entries()) {
    const sourceUrl = publicUrl(image.url, "");

    if (!sourceUrl) {
      continue;
    }

    try {
      const response = await fetch(sourceUrl);

      if (!response.ok) {
        failed.push({ url: sourceUrl, status: response.status });
        continue;
      }

      const contentType = cleanText(response.headers.get("Content-Type"), "image/jpeg", 120);
      const extension = extensionFor(sourceUrl, contentType);
      const record = buildAssetRecord(storageContext, image, {
        index,
        sourceUrl,
        contentType,
        extension,
        publicBaseUrl,
        assetProxyBaseUrl
      });

      await binding.bucket.put(record.r2Key, response.body, {
        httpMetadata: {
          contentType,
          cacheControl: storageContext.cacheControl
        },
        customMetadata: {
          productId: storageContext.productId,
          catalogProductId: String(storageContext.catalogProductId || ""),
          taskKey: storageContext.taskKey,
          designSlug: storageContext.designSlug,
          variantScope: storageContext.variantScope,
          sourceUrl,
          generatedAt: storageContext.generatedAt
        }
      });

      stored.push(record);
    } catch (error) {
      failed.push({
        url: sourceUrl,
        message: error && error.message ? error.message : "Storage failed"
      });
    }
  }

  const manifests = stored.length
    ? await writeMockupManifests(binding.bucket, storageContext, stored)
    : {
        globalManifestKey: GLOBAL_MANIFEST_KEY,
        productManifestKey: productManifestKey(storageContext.productKey)
      };

  return {
    ...status,
    stored,
    failed,
    manifests,
    message: stored.length
      ? "Stored generated mockups in R2 and updated mockup manifests."
      : "No generated mockups were stored."
  };
}

export function findMockupStorageBinding(context) {
  for (const name of STORAGE_BINDINGS) {
    const bucket = context.env[name];

    if (bucket && typeof bucket.put === "function") {
      return { name, bucket };
    }
  }

  return { name: "", bucket: null };
}

export function isMockupAssetKey(key) {
  return /^merch\/mockups\/v1\/products\/[a-z0-9][a-z0-9./-]*\.(jpe?g|png|webp)$/i.test(String(key || ""));
}

export function mockupAssetProxyBaseUrl(context) {
  try {
    return new URL("/api/merch/mockups/file", context.request.url).toString();
  } catch (error) {
    return "";
  }
}

export function mockupAssetUrlForKey(context, key) {
  const publicBaseUrl = cleanText(
    context.env.MERCH_MOCKUP_PUBLIC_BASE_URL || context.env.MOCKUP_PUBLIC_BASE_URL,
    "",
    500
  ).replace(/\/+$/, "");

  if (publicBaseUrl) {
    return `${publicBaseUrl}/${key}`;
  }

  const proxyBaseUrl = mockupAssetProxyBaseUrl(context);

  return proxyBaseUrl ? `${proxyBaseUrl}?key=${encodeURIComponent(key)}` : "";
}

function buildAssetRecord(storageContext, image, { index, sourceUrl, contentType, extension, publicBaseUrl, assetProxyBaseUrl }) {
  const sort = index + 1;
  const indexPart = String(sort).padStart(2, "0");
  const role = slugPart(image.type || image.label || "mockup");
  const fileName = `${storageContext.viewSlug}-${role}-${indexPart}.${extension}`;
  const r2Key = [
    MOCKUP_NAMESPACE,
    "products",
    storageContext.productKey,
    "designs",
    storageContext.designSlug,
    "variants",
    storageContext.variantSlug,
    storageContext.styleSlug,
    fileName
  ].join("/");
  const url = publicBaseUrl
    ? `${publicBaseUrl}/${r2Key}`
    : assetProxyBaseUrl
      ? `${assetProxyBaseUrl}?key=${encodeURIComponent(r2Key)}`
      : "";

  return {
    id: [
      storageContext.productKey,
      storageContext.designSlug,
      storageContext.variantSlug,
      storageContext.styleSlug,
      storageContext.viewSlug,
      role,
      indexPart
    ].join(":"),
    productId: storageContext.productId,
    syncProductId: storageContext.syncProductId,
    productTitle: storageContext.productTitle,
    artist: storageContext.artist,
    drop: storageContext.drop,
    catalogProductId: storageContext.catalogProductId,
    catalogVariantIds: storageContext.catalogVariantIds,
    designSlug: storageContext.designSlug,
    designName: storageContext.designName,
    designSourceUrl: storageContext.designSourceUrl,
    variantScope: storageContext.variantScope,
    placement: storageContext.placement,
    view: storageContext.view,
    style: storageContext.style,
    role,
    sort,
    r2Key,
    key: r2Key,
    url,
    publicUrl: url,
    sourceMockupUrl: sourceUrl,
    sourceUrl,
    sourceTaskKey: storageContext.taskKey,
    taskStatus: storageContext.taskStatus,
    label: cleanText(image.label, "", 160),
    contentType,
    generatedAt: storageContext.generatedAt,
    source: "printful-v1-mockup-generator"
  };
}

async function writeMockupManifests(bucket, storageContext, records) {
  const productKey = storageContext.productKey;
  const productKeyPath = productManifestKey(productKey);
  const productManifest = await readJsonFromBucket(bucket, productKeyPath, {
    version: 1,
    productKey,
    productId: storageContext.productId,
    syncProductId: storageContext.syncProductId,
    catalogProductId: storageContext.catalogProductId,
    assets: []
  });
  const existingAssets = new Map(
    (Array.isArray(productManifest.assets) ? productManifest.assets : []).map((asset) => [asset.id || asset.r2Key, asset])
  );

  records.forEach((record) => existingAssets.set(record.id || record.r2Key, record));

  productManifest.version = 1;
  productManifest.productKey = productKey;
  productManifest.productId = storageContext.productId;
  productManifest.syncProductId = storageContext.syncProductId;
  productManifest.productTitle = storageContext.productTitle;
  productManifest.artist = storageContext.artist;
  productManifest.drop = storageContext.drop;
  productManifest.catalogProductId = storageContext.catalogProductId;
  productManifest.updatedAt = storageContext.generatedAt;
  productManifest.assets = Array.from(existingAssets.values()).sort(compareAssets);

  await putJson(bucket, productKeyPath, productManifest, storageContext.cacheControl);

  const globalManifest = await readJsonFromBucket(bucket, GLOBAL_MANIFEST_KEY, {
    version: 1,
    namespace: MOCKUP_NAMESPACE,
    products: []
  });
  const products = new Map(
    (Array.isArray(globalManifest.products) ? globalManifest.products : []).map((product) => [
      product.productKey || product.productId || product.syncProductId,
      product
    ])
  );
  const publicAssets = productManifest.assets.filter((asset) => asset.url);
  const latestAsset = productManifest.assets[productManifest.assets.length - 1] || records[records.length - 1];

  products.set(productKey, {
    productKey,
    productId: storageContext.productId,
    syncProductId: storageContext.syncProductId,
    productTitle: storageContext.productTitle,
    artist: storageContext.artist,
    drop: storageContext.drop,
    catalogProductId: storageContext.catalogProductId,
    assetCount: productManifest.assets.length,
    publicAssetCount: publicAssets.length,
    latestAssetUrl: latestAsset ? latestAsset.url : "",
    latestAssetKey: latestAsset ? latestAsset.r2Key : "",
    manifestKey: productKeyPath,
    updatedAt: storageContext.generatedAt
  });

  globalManifest.version = 1;
  globalManifest.namespace = MOCKUP_NAMESPACE;
  globalManifest.updatedAt = storageContext.generatedAt;
  globalManifest.products = Array.from(products.values()).sort((a, b) =>
    String(a.productTitle || a.productKey).localeCompare(String(b.productTitle || b.productKey))
  );

  await putJson(bucket, GLOBAL_MANIFEST_KEY, globalManifest, storageContext.cacheControl);

  return {
    globalManifestKey: GLOBAL_MANIFEST_KEY,
    productManifestKey: productKeyPath
  };
}

function compareAssets(a, b) {
  return [
    String(a.designSlug || "").localeCompare(String(b.designSlug || "")),
    String(a.variantScope || "").localeCompare(String(b.variantScope || "")),
    String(a.style || "").localeCompare(String(b.style || "")),
    String(a.view || "").localeCompare(String(b.view || "")),
    Number(a.sort || 0) - Number(b.sort || 0)
  ].find((value) => value !== 0) || 0;
}

async function readJsonFromBucket(bucket, key, fallback) {
  const object = await bucket.get(key);

  if (!object) {
    return fallback;
  }

  try {
    return JSON.parse(await object.text());
  } catch (error) {
    return fallback;
  }
}

async function putJson(bucket, key, value, cacheControl) {
  await bucket.put(key, JSON.stringify(value, null, 2), {
    httpMetadata: {
      contentType: "application/json; charset=utf-8",
      cacheControl
    }
  });
}

function productManifestKey(productKey) {
  return `${MOCKUP_NAMESPACE}/products/${productKey}/manifest.json`;
}

function productKeyFor(input) {
  return slugPart(input || "product");
}

function placementList(body, payload) {
  const requested = textList(body.placements || body.placement, []);
  const payloadPlacements = Array.isArray(payload && payload.files)
    ? payload.files.map((file) => cleanText(file && file.placement, "", 80)).filter(Boolean)
    : [];
  const placements = requested.length ? requested : payloadPlacements;

  return Array.from(new Set(placements.length ? placements : ["front"]));
}

function firstPayloadFileUrl(payload) {
  const file = Array.isArray(payload && payload.files) ? payload.files.find((item) => item && item.image_url) : null;
  return file ? file.image_url : "";
}

function intList(input, fallback) {
  const values = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];
  const parsed = values
    .map((value) => positiveInt(value, null))
    .filter(Boolean)
    .slice(0, 50);

  return parsed.length ? parsed : fallback;
}

function textList(input, fallback) {
  const values = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];
  const parsed = values
    .map((value) => cleanText(value, "", 160))
    .filter(Boolean)
    .slice(0, 30);

  return parsed.length ? parsed : fallback;
}

function publicUrl(input, fallback) {
  const value = cleanText(input, fallback, 1000);

  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }

    return url.toString();
  } catch (error) {
    return "";
  }
}

function extensionFor(url, contentType) {
  const pathExtension = cleanText(new URL(url).pathname.split(".").pop(), "", 8).toLowerCase();

  if (["jpg", "jpeg", "png", "webp"].includes(pathExtension)) {
    return pathExtension === "jpeg" ? "jpg" : pathExtension;
  }

  if (contentType.includes("png")) {
    return "png";
  }

  if (contentType.includes("webp")) {
    return "webp";
  }

  return "jpg";
}

function slugPart(input) {
  return cleanText(input, "mockup", 160)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "mockup";
}
