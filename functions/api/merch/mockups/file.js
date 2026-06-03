import {
  apiErrorResponse,
  emptyOptionsResponse,
  jsonResponse
} from "../../../_lib/printful.js";
import {
  findMockupStorageBinding,
  isMockupAssetKey
} from "../../../_lib/mockup-storage.js";

export async function onRequestOptions() {
  return emptyOptionsResponse();
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const key = url.searchParams.get("key") || "";

    if (!isMockupAssetKey(key)) {
      return jsonResponse({ error: "invalid_mockup_asset_key" }, { status: 400 });
    }

    const binding = findMockupStorageBinding(context);

    if (!binding.bucket) {
      return jsonResponse(
        {
          error: "mockup_storage_not_configured",
          message: "No R2 bucket binding found for merch mockups."
        },
        { status: 503 }
      );
    }

    const object = await binding.bucket.get(key);

    if (!object) {
      return jsonResponse({ error: "mockup_asset_not_found" }, { status: 404 });
    }

    const headers = new Headers();

    if (typeof object.writeHttpMetadata === "function") {
      object.writeHttpMetadata(headers);
    }

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", contentTypeForKey(key));
    }

    if (!headers.has("Cache-Control")) {
      headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    }

    if (object.httpEtag) {
      headers.set("ETag", object.httpEtag);
    }

    return new Response(object.body, { headers });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

function contentTypeForKey(key) {
  const normalized = key.toLowerCase();

  if (normalized.endsWith(".png")) {
    return "image/png";
  }

  if (normalized.endsWith(".webp")) {
    return "image/webp";
  }

  return "image/jpeg";
}
