import {
  apiErrorResponse,
  emptyOptionsResponse,
  jsonResponse,
  normalizeStoreProduct,
  printfulFetch,
  resultArray
} from "../../_lib/printful.js";

const ALLOWED_STATUS = new Set(["all", "synced", "unsynced", "ignored", "imported", "discontinued", "out_of_stock"]);

export async function onRequestOptions() {
  return emptyOptionsResponse();
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const requestedStatus = url.searchParams.get("status") || "synced";
    const status = ALLOWED_STATUS.has(requestedStatus) ? requestedStatus : "synced";
    const response = await printfulFetch(context, `/store/products?status=${encodeURIComponent(status)}&limit=100`);
    const products = resultArray(response.data)
      .map(normalizeStoreProduct)
      .filter((product) => product.id && !product.isIgnored);

    return jsonResponse(
      {
        source: "printful-v1-sync-products",
        status,
        syncedAt: new Date().toISOString(),
        products
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300"
        }
      }
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
