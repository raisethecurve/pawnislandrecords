import {
  apiErrorResponse,
  assertMerchRequestLimit,
  assertSameOriginRequest,
  cleanText,
  emptyOptionsResponse,
  jsonResponse,
  normalizeMockupTaskImages,
  positiveInt,
  printfulFetch,
  readJsonObject,
  resultObject
} from "../../../_lib/printful.js";
import {
  buildMockupStorageContext,
  mockupStorageStatus,
  readMockupManifest,
  storeMockupImages
} from "../../../_lib/mockup-storage.js";

const DEFAULT_GHOST_DESIGN_URL = "https://files.cdn.printful.com/files/196/196b0b0ee595c3f631e8f7a90a5442e0_preview.png";
const DEFAULT_PRODUCT_ID = 438;
const DEFAULT_VARIANT_ID = 11546;
const DEFAULT_MOCKUP_OPTIONS = ["Front"];
const DEFAULT_MOCKUP_OPTION_GROUPS = ["Flat"];
const DEFAULT_POSITION = {
  area_width: 1800,
  area_height: 2400,
  width: 1800,
  height: 1800,
  top: 300,
  left: 0
};
const SCENARIOS = new Set(["ghost-front"]);
const ACTIONS = new Set(["create", "poll", "store", "manifest", "printfiles", "templates"]);

class MockupTestError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "MockupTestError";
    this.code = code;
    this.status = status;
  }
}

export async function onRequestOptions() {
  return emptyOptionsResponse();
}

export async function onRequestPost(context) {
  try {
    assertSameOriginRequest(context);
    assertMerchRequestLimit(context, { limit: 10, windowMs: 10 * 60 * 1000 });

    const body = await readJsonObject(context.request);
    const action = cleanText(body.action, "create", 40);

    if (!ACTIONS.has(action)) {
      throw new MockupTestError("invalid_mockup_action", "Choose create, poll, store, manifest, printfiles, or templates.");
    }

    if (action === "poll" || action === "store") {
      return pollTask(context, body, { storeImages: action === "store" || Boolean(body.storeImages) });
    }

    if (action === "manifest") {
      return fetchStoredManifest(context, body);
    }

    if (action === "printfiles" || action === "templates") {
      return fetchProductGeneratorInfo(context, body, action);
    }

    return createTask(context, body);
  } catch (error) {
    if (error instanceof MockupTestError) {
      return jsonResponse(
        {
          error: error.code,
          message: error.message
        },
        { status: error.status }
      );
    }

    return apiErrorResponse(error);
  }
}

async function createTask(context, body) {
  const productId = positiveInt(body.productId || body.product_id, DEFAULT_PRODUCT_ID);
  const payload = buildTaskPayload(body);
  const response = await printfulFetch(context, `/mockup-generator/create-task/${encodeURIComponent(productId)}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  const task = resultObject(response.data);
  const images = normalizeMockupTaskImages(task);
  const shouldStore = Boolean(body.storeImages) && cleanText(task.status, "", 40) === "completed";
  const storage = shouldStore
    ? await storeMockupImages(
        context,
        images,
        buildMockupStorageContext(body, {
          productId,
          payload,
          taskKey: task.task_key || body.taskKey,
          task
        })
      )
    : mockupStorageStatus(context);

  return jsonResponse({
    source: "printful-v1-mockup-generator",
    action: "create",
    productId,
    request: payload,
    task,
    images,
    storage
  });
}

async function pollTask(context, body, { storeImages = false } = {}) {
  const taskKey = cleanText(body.taskKey || body.task_key, "", 180);

  if (!taskKey) {
    throw new MockupTestError("missing_task_key", "A task key is required to poll or store mockups.");
  }

  const response = await printfulFetch(context, `/mockup-generator/task?task_key=${encodeURIComponent(taskKey)}`);
  const task = resultObject(response.data);
  const images = normalizeMockupTaskImages(task);
  const completed = cleanText(task.status, "", 40) === "completed";
  const storage = storeImages && completed
    ? await storeMockupImages(
        context,
        images,
        buildMockupStorageContext(body, {
          productId: positiveInt(body.productId || body.product_id, DEFAULT_PRODUCT_ID),
          taskKey,
          task
        })
      )
    : mockupStorageStatus(context);

  return jsonResponse({
    source: "printful-v1-mockup-generator",
    action: storeImages ? "store" : "poll",
    task,
    images,
    storage
  });
}

async function fetchStoredManifest(context, body) {
  const manifest = await readMockupManifest(context, body);

  return jsonResponse({
    source: "printful-v1-mockup-generator",
    action: "manifest",
    ...manifest
  });
}

async function fetchProductGeneratorInfo(context, body, action) {
  const productId = positiveInt(body.productId || body.product_id, DEFAULT_PRODUCT_ID);
  const endpoint = action === "templates" ? "templates" : "printfiles";
  const response = await printfulFetch(context, `/mockup-generator/${endpoint}/${encodeURIComponent(productId)}`);

  return jsonResponse({
    source: "printful-v1-mockup-generator",
    action,
    productId,
    result: resultObject(response.data)
  });
}

function buildTaskPayload(body) {
  const scenario = cleanText(body.scenario, "ghost-front", 80);
  const variantIds = intList(body.variantIds || body.variant_ids, [DEFAULT_VARIANT_ID]);
  const format = cleanText(body.format, "jpg", 8).toLowerCase() === "png" ? "png" : "jpg";
  const width = positiveInt(body.width, null);
  const payload = {
    variant_ids: variantIds,
    format,
    files: buildTaskFiles(body, scenario),
    options: textList(body.options || body.mockupOptions, DEFAULT_MOCKUP_OPTIONS),
    option_groups: textList(body.option_groups || body.optionGroups || body.mockupOptionGroups, DEFAULT_MOCKUP_OPTION_GROUPS)
  };

  if (width) {
    payload.width = Math.min(Math.max(width, 50), 2000);
  }

  if (body.product_options && typeof body.product_options === "object" && !Array.isArray(body.product_options)) {
    payload.product_options = body.product_options;
  }

  return payload;
}

function buildTaskFiles(body, scenario) {
  if (Array.isArray(body.files) && body.files.length) {
    const files = body.files.map(normalizeTaskFile).filter(Boolean);

    if (!files.length) {
      throw new MockupTestError("missing_mockup_files", "At least one valid placement file is required.");
    }

    if (!Boolean(body.allowBackPlacement) && files.some((file) => file.placement === "back")) {
      throw new MockupTestError(
        "back_placement_not_allowed",
        "Back placement is disabled for this temporary front-only test. Set allowBackPlacement only if a back print is intentional."
      );
    }

    return files;
  }

  if (!SCENARIOS.has(scenario)) {
    throw new MockupTestError("invalid_mockup_scenario", "Use ghost-front for the default front-only test.");
  }

  const frontImageUrl = publicUrl(body.frontImageUrl || body.front_image_url, DEFAULT_GHOST_DESIGN_URL);
  const position = normalizePosition(body.position);

  if (!frontImageUrl) {
    throw new MockupTestError("invalid_front_image_url", "A valid public front design URL is required.");
  }

  return [
    {
      placement: "front",
      image_url: frontImageUrl,
      position
    }
  ];
}

function normalizeTaskFile(file) {
  if (!file || typeof file !== "object") {
    return null;
  }

  const placement = cleanText(file.placement, "", 80);
  const imageUrl = publicUrl(file.image_url || file.imageUrl, "");

  if (!placement || !imageUrl) {
    return null;
  }

  return {
    placement,
    image_url: imageUrl,
    position: normalizePosition(file.position),
    options: Array.isArray(file.options) ? file.options : undefined
  };
}

function normalizePosition(input) {
  const source = input && typeof input === "object" ? input : {};
  const position = {};

  Object.entries(DEFAULT_POSITION).forEach(([key, fallback]) => {
    position[key] = key === "top" || key === "left"
      ? nonNegativeInt(source[key], fallback)
      : positiveInt(source[key], fallback);
  });

  return position;
}

function nonNegativeInt(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
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
    .slice(0, 20);

  return parsed.length ? parsed : fallback;
}

function textList(input, fallback) {
  const values = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];
  const parsed = values
    .map((value) => cleanText(value, "", 120))
    .filter(Boolean)
    .slice(0, 20);

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
