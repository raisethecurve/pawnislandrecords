import {
  apiErrorResponse,
  cleanText,
  emptyOptionsResponse,
  jsonResponse,
  printfulFetch,
  readJson,
  resultArray,
  sanitizeRecipient,
  sanitizeShippingItems
} from "../../_lib/printful.js";

export async function onRequestOptions() {
  return emptyOptionsResponse();
}

export async function onRequestPost(context) {
  try {
    const body = await readJson(context.request);
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
