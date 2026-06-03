const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const metadataPath = path.join(root, "data", "merch-products.json");
const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

const requiredFields = [
  "id",
  "publicTitle",
  "artist",
  "drop",
  "designName",
  "productFamily",
  "productType",
  "category",
  "sortPriority",
  "publicStatus",
  "thumbnailStrategy",
  "imageAlt",
  "productCopy",
  "detailCopy",
  "relatedGroup"
];

const products = Array.isArray(metadata.products) ? metadata.products : [];
const productsById = new Map(products.map((product) => [String(product.id || ""), product]));
const errors = [];

for (const id of metadata.expectedSyncProductIds || []) {
  if (!productsById.has(String(id))) {
    errors.push(`Missing metadata for synced Printful product ${id}.`);
  }
}

for (const product of products) {
  const label = product.id || product.publicTitle || "unknown product";

  for (const field of requiredFields) {
    const value = product[field];
    if (value === undefined || value === null || String(value).trim() === "") {
      errors.push(`${label} is missing ${field}.`);
    }
  }

  if (product.publicStatus === "public" && product.thumbnailStrategy === "artwork" && !product.artworkKey) {
    errors.push(`${label} uses artwork thumbnails but has no artworkKey.`);
  }

  if (!Array.isArray(product.matchNames) || product.matchNames.length === 0) {
    errors.push(`${label} needs at least one raw Printful matchNames entry.`);
  }
}

const publicTitles = new Map();
for (const product of products.filter((item) => item.publicStatus === "public")) {
  const key = String(product.publicTitle || "").toLowerCase();
  if (publicTitles.has(key)) {
    errors.push(`Duplicate public merch title "${product.publicTitle}" for ${publicTitles.get(key)} and ${product.id}.`);
  }
  publicTitles.set(key, product.id);
}

if (!metadata.launchPosture || metadata.launchPosture.checkoutModel !== "manual-order-request") {
  errors.push("launchPosture.checkoutModel must be manual-order-request for the current merch desk.");
}

if (!metadata.launchPosture || !metadata.launchPosture.supportEmail) {
  errors.push("launchPosture.supportEmail is required.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Merch metadata OK: ${products.length} products, ${metadata.expectedSyncProductIds.length} expected synced IDs.`);
