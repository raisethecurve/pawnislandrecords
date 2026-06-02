import {
  apiErrorResponse,
  emptyOptionsResponse,
  jsonResponse,
  normalizeDetailedProduct,
  printfulFetch
} from "../../../_lib/printful.js";

export async function onRequestOptions() {
  return emptyOptionsResponse();
}

export async function onRequestGet(context) {
  try {
    const id = String(context.params.id || "");

    if (!/^@?[A-Za-z0-9_-]+$/.test(id)) {
      return jsonResponse({ error: "invalid_product_id" }, { status: 400 });
    }

    const response = await printfulFetch(context, `/store/products/${encodeURIComponent(id)}`);

    return jsonResponse(normalizeDetailedProduct(response.data), {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300"
      }
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
