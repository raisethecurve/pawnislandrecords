import {
  apiErrorResponse,
  assertMerchRequestLimit,
  assertSameOriginRequest,
  cleanText,
  emptyOptionsResponse,
  jsonResponse,
  printfulFetch,
  readJsonObject,
  resultArray,
  sanitizeRecipient,
  sanitizeShippingItems
} from "../../_lib/printful.js";

export async function onRequestOptions() {
  return emptyOptionsResponse();
}

export async function onRequestPost(context) {
  try {
    assertSameOriginRequest(context);
    assertMerchRequestLimit(context, { limit: 30, windowMs: 60 * 1000 });
    const body = await readJsonObject(context.request);
    const payload = {
      recipient: sanitizeRecipient(body.recipient, { requireFullAddress: false }),
      items: sanitizeShippingItems(body.items),
      currency: cleanText(body.currency, "USD", 3).toUpperCase()
    };
    const response = await printfulFetch(context, "/shipping/rates", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return jsonResponse({
      source: "printful-v1-shipping-rates",
      rates: resultArray(response.data)
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
