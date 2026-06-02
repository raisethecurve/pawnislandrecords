import {
  apiErrorResponse,
  cleanText,
  emptyOptionsResponse,
  jsonResponse,
  printfulFetch,
  readJson,
  resultObject,
  sanitizeOrderItems,
  sanitizeRecipient,
  shortOrderId
} from "../../_lib/printful.js";

export async function onRequestOptions() {
  return emptyOptionsResponse();
}

export async function onRequestPost(context) {
  try {
    if (context.env.MERCH_DRAFT_ORDERS_ENABLED !== "true") {
      return jsonResponse(
        {
          error: "draft_orders_disabled",
          message: "Draft Printful orders are disabled for this environment."
        },
        { status: 403 }
      );
    }

    const body = await readJson(context.request);
    const payload = {
      external_id: cleanText(body.external_id, shortOrderId(), 32),
      recipient: sanitizeRecipient(body.recipient),
      items: sanitizeOrderItems(body.items),
      shipping: cleanText(body.shipping, "STANDARD", 40),
      notes: "Pawn Island Records merch MVP draft order. Confirm manually after payment is collected."
    };
    const response = await printfulFetch(context, "/orders?confirm=false", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const order = resultObject(response.data);

    return jsonResponse({
      source: "printful-v1-draft-order",
      order: {
        id: order.id || null,
        externalId: order.external_id || payload.external_id,
        status: order.status || "draft",
        dashboardUrl: order.dashboard_url || ""
      }
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
