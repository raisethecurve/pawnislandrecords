import {
  apiErrorResponse,
  emptyOptionsResponse,
  jsonResponse
} from "../../../_lib/printful.js";
import { readMockupManifest } from "../../../_lib/mockup-storage.js";

export async function onRequestOptions() {
  return emptyOptionsResponse();
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const body = Object.fromEntries(url.searchParams.entries());
    const result = await readMockupManifest(context, body);
    const hasStorage = Boolean(result.storage && result.storage.enabled);

    return jsonResponse(
      {
        source: "r2-merch-mockups",
        action: "assets",
        ...result
      },
      {
        status: hasStorage ? 200 : 503,
        headers: {
          "Cache-Control": hasStorage ? "public, max-age=60, s-maxage=300" : "no-store"
        }
      }
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
