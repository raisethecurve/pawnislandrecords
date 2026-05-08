const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const maxPublicImageBytes = Number(process.env.PAWN_IMAGE_MAX_BYTES || 700 * 1024);
const failures = [];
const imageReferences = new Map();

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function localAssetPath(value) {
  const text = String(value || "").trim();

  if (
    !text ||
    /^(?:https?:)?\/\//i.test(text) ||
    /^(?:data:|blob:|mailto:|tel:|javascript:)/i.test(text) ||
    !/\.(?:png|jpe?g|webp|gif|svg)$/i.test(text)
  ) {
    return "";
  }

  return text.split(/[?#]/)[0].replace(/^\/+/, "");
}

function addImageReference(value, label) {
  const asset = localAssetPath(value);

  if (!asset) {
    return;
  }

  if (!imageReferences.has(asset)) {
    imageReferences.set(asset, []);
  }

  imageReferences.get(asset).push(label);
}

function loadWindowObject(fileName, key) {
  const source = fs.readFileSync(path.join(root, fileName), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: fileName });
  return sandbox.window[key];
}

function checkPublicDataImages() {
  const data = loadWindowObject("public-data.js", "PAWN_PUBLIC_DATA") || {};

  for (const artist of data.artists || []) {
    addImageReference(artist.image, `artist ${artist.slug}`);
  }

  for (const release of data.releases || []) {
    addImageReference(release.cover, `release ${release.slug}`);
  }

  for (const item of data.merch || []) {
    addImageReference(item.image, `merch ${item.slug}`);
  }

  for (const playlist of (data.label && data.label.discoveryPlaylists) || []) {
    addImageReference(playlist.image, `playlist ${playlist.title}`);
  }

  [
    "assets/brand/pawnisland-1200.jpg",
    "assets/brand/pawnisland-512.jpg",
    "assets/brand/pawnisland-256.jpg"
  ].forEach((asset) => addImageReference(asset, "core brand image"));
}

function checkImageBudgets() {
  for (const [asset, labels] of imageReferences) {
    const absolute = path.join(root, asset);

    if (!absolute.startsWith(root) || !fs.existsSync(absolute)) {
      failures.push(`${asset}: referenced by ${labels.join(", ")} but missing`);
      continue;
    }

    const stats = fs.statSync(absolute);

    if (stats.size > maxPublicImageBytes) {
      failures.push(
        `${asset}: ${stats.size} bytes exceeds ${maxPublicImageBytes} byte public image budget (${labels.join(", ")})`
      );
    }
  }
}

function checkIframePolicies(fileName) {
  const source = fs.readFileSync(path.join(root, fileName), "utf8");
  const iframePattern = /<iframe\b[\s\S]*?>/gi;
  let match;

  while ((match = iframePattern.exec(source))) {
    const tag = match[0];

    if (!/\bloading\s*=/.test(tag)) {
      failures.push(`${fileName}: iframe is missing an explicit loading policy`);
    }

    if (/open\.spotify\.com|youtube\.com\/embed|\$\{/.test(tag) && !/data-media-embed/.test(tag)) {
      failures.push(`${fileName}: media iframe is missing data-media-embed hydration`);
    }
  }
}

checkPublicDataImages();
checkImageBudgets();
["index.html", "site-ui.js"].forEach(checkIframePolicies);

if (failures.length) {
  console.error(`Performance budget check failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Performance budget check passed for ${imageReferences.size} public image asset(s) at ${maxPublicImageBytes} bytes.`
  );
}
