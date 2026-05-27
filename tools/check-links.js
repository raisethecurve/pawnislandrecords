const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { routes } = require("./routes");

const root = path.resolve(__dirname, "..");
const siteOrigin = "https://pawnislandrecords.com";
const ignoredDirectories = new Set([".git", "node_modules", "playwright-report", "test-results", "blob-report"]);
const failures = [];

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function fromRoot(filePath) {
  return toPosix(path.relative(root, filePath));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) ? [] : walk(absolute);
    }

    return [absolute];
  });
}

function report(source, target, message) {
  failures.push(`${source}: ${message} (${target})`);
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function isSkippableUrl(rawValue) {
  const value = decodeHtml(rawValue);

  return (
    !value ||
    value === "#" ||
    (/^(?:https?:)?\/\//i.test(value) && !value.startsWith(siteOrigin)) ||
    /^(?:mailto:|tel:|data:|blob:|javascript:)/i.test(value)
  );
}

function isUrlLikeAttribute(name, value) {
  if (name !== "content") {
    return true;
  }

  const text = decodeHtml(value);

  return /^(?:https:\/\/pawnislandrecords\.com\/|\/|\.{0,2}\/|[a-z0-9._-]+\.html(?:[?#].*)?|assets\/|media\/|downloads\/)/i.test(
    text
  );
}

function normalizeLocalTarget(rawValue, sourceFile) {
  const value = decodeHtml(rawValue);

  if (isSkippableUrl(value)) {
    return null;
  }

  if (value.startsWith(siteOrigin)) {
    const url = new URL(value);
    return {
      file: url.pathname.replace(/^\/+/, "") || "index.html",
      hash: url.hash.slice(1)
    };
  }

  if (value.startsWith("#")) {
    return {
      file: fromRoot(sourceFile),
      hash: value.slice(1)
    };
  }

  const [withoutHash, hash = ""] = value.split("#");
  const [withoutQuery] = withoutHash.split("?");
  const sourceDirectory = path.dirname(fromRoot(sourceFile));
  const base = withoutQuery.startsWith("/")
    ? withoutQuery.replace(/^\/+/, "")
    : toPosix(path.normalize(path.join(sourceDirectory, withoutQuery)));

  return {
    file: base || fromRoot(sourceFile),
    hash
  };
}

function hasId(html, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\bid=(["'])${escaped}\\1`).test(html);
}

function checkTarget(sourceFile, rawTarget) {
  const source = fromRoot(sourceFile);
  const target = normalizeLocalTarget(rawTarget, sourceFile);

  if (!target || !target.file) {
    return;
  }

  const normalizedFile = toPosix(path.normalize(target.file));
  const absoluteTarget = path.join(root, normalizedFile);

  if (!absoluteTarget.startsWith(root) || !fs.existsSync(absoluteTarget)) {
    report(source, rawTarget, "missing local file");
    return;
  }

  if (target.hash && /\.html$/i.test(normalizedFile)) {
    const html = fs.readFileSync(absoluteTarget, "utf8");

    if (!hasId(html, decodeURIComponent(target.hash))) {
      report(source, rawTarget, "missing anchor target");
    }
  }
}

function checkHtmlFile(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const attributePattern = /\b(href|src|poster|content)\s*=\s*(["'])(.*?)\2/g;
  const srcsetPattern = /\bsrcset\s*=\s*(["'])(.*?)\1/g;
  let match;

  while ((match = attributePattern.exec(html))) {
    if (isUrlLikeAttribute(match[1], match[3])) {
      checkTarget(filePath, match[3]);
    }
  }

  while ((match = srcsetPattern.exec(html))) {
    match[2]
      .split(",")
      .map((candidate) => candidate.trim().split(/\s+/)[0])
      .filter(Boolean)
      .forEach((candidate) => checkTarget(filePath, candidate));
  }
}

function checkCssFile(filePath) {
  const css = fs.readFileSync(filePath, "utf8");
  const urlPattern = /url\(\s*(["']?)(.*?)\1\s*\)/g;
  let match;

  while ((match = urlPattern.exec(css))) {
    checkTarget(filePath, match[2]);
  }
}

function loadWindowObject(fileName, key) {
  const source = fs.readFileSync(path.join(root, fileName), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: fileName });
  return sandbox.window[key];
}

function checkDataAsset(source, value, label) {
  const target = normalizeLocalTarget(value, path.join(root, source));

  if (!target) {
    return;
  }

  if (!exists(target.file)) {
    report(source, value, `missing data asset for ${label}`);
  }
}

function checkPublicData() {
  const data = loadWindowObject("public-data.js", "PAWN_PUBLIC_DATA");

  if (!data) {
    report("public-data.js", "window.PAWN_PUBLIC_DATA", "data object did not load");
    return;
  }

  const artistSlugs = new Set();
  const releaseSlugs = new Set();

  for (const artist of data.artists || []) {
    if (artistSlugs.has(artist.slug)) {
      report("public-data.js", artist.slug, "duplicate artist slug");
    }

    artistSlugs.add(artist.slug);
    checkDataAsset("public-data.js", artist.image, `artist ${artist.slug}`);

    for (const asset of artist.pressAssetRecords || []) {
      checkDataAsset("public-data.js", asset && (asset.path || asset.url), `artist ${artist.slug} press asset`);
    }
  }

  for (const release of data.releases || []) {
    if (releaseSlugs.has(release.slug)) {
      report("public-data.js", release.slug, "duplicate release slug");
    }

    releaseSlugs.add(release.slug);

    if (!artistSlugs.has(release.artist)) {
      report("public-data.js", release.slug, `unknown release artist ${release.artist}`);
    }

    checkDataAsset("public-data.js", release.cover, `release ${release.slug}`);
  }

  for (const item of data.merch || []) {
    if (item.artist && !artistSlugs.has(item.artist)) {
      report("public-data.js", item.slug, `unknown merch artist ${item.artist}`);
    }

    checkDataAsset("public-data.js", item.image, `merch ${item.slug}`);
  }

  for (const playlist of (data.label && data.label.discoveryPlaylists) || []) {
    checkDataAsset("public-data.js", playlist.image, `playlist ${playlist.title}`);
  }
}

function checkAudioConfig() {
  const config = loadWindowObject("site-audio-config.js", "PAWN_AUDIO_CONFIG");

  if (config && config.enabled) {
    checkDataAsset("site-audio-config.js", config.src, "site audio");
  }
}

function checkRouteInventory() {
  for (const route of routes) {
    const [file] = route.path.split(/[?#]/);

    if (!exists(file)) {
      report("tools/routes.js", route.path, "route inventory file is missing");
    }
  }
}

function routeFile(route) {
  return String(route.path || "").split(/[?#]/)[0];
}

function normalizeRobotsValue(value) {
  return String(value || "")
    .toLowerCase()
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(",");
}

function expectedRobotsForRoute(route) {
  if (route.classification === "public") {
    return "index,follow";
  }

  if (
    route.classification === "admin-only" ||
    route.classification === "internal-lab" ||
    route.classification === "retired"
  ) {
    return "noindex,nofollow";
  }

  return "noindex,follow";
}

function extractHtmlAttribute(tag, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i");
  const match = tag.match(pattern);
  return match ? decodeHtml(match[2]) : "";
}

function pageRobotsMeta(file) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const robotsTag = tags.find((tag) => extractHtmlAttribute(tag, "name").toLowerCase() === "robots");
  return normalizeRobotsValue(robotsTag ? extractHtmlAttribute(robotsTag, "content") : "");
}

function robotsTxtDisallowSet() {
  const source = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
  return new Set(
    source
      .split(/\r?\n/)
      .map((line) => line.replace(/#.*/, "").trim())
      .map((line) => line.match(/^disallow:\s*(\S*)/i))
      .filter(Boolean)
      .map((match) => match[1])
      .filter(Boolean)
  );
}

function sitemapPathSet() {
  const source = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const paths = new Set();
  const locPattern = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let match;

  while ((match = locPattern.exec(source))) {
    try {
      const url = new URL(match[1]);

      if (url.origin !== siteOrigin) {
        report("sitemap.xml", match[1], "sitemap URL has unexpected origin");
        continue;
      }

      paths.add(url.pathname === "/" ? "index.html" : url.pathname.replace(/^\/+/, ""));
    } catch (error) {
      report("sitemap.xml", match[1], "sitemap URL is invalid");
    }
  }

  return paths;
}

function robotsPathForFile(file) {
  return `/${file.replace(/^\/+/, "")}`;
}

function checkRoutePublicationPolicy() {
  const disallowed = robotsTxtDisallowSet();
  const sitemapPaths = sitemapPathSet();
  const checkedFiles = new Map();

  for (const route of routes) {
    const file = routeFile(route);
    const expectedRobots = expectedRobotsForRoute(route);
    const configuredRobots = normalizeRobotsValue(route.robots);

    if (!configuredRobots || configuredRobots === "implicit") {
      report("tools/routes.js", route.path, "route robots policy must be explicit");
    } else if (configuredRobots !== expectedRobots) {
      report("tools/routes.js", route.path, `route robots policy should be ${expectedRobots}`);
    }

    if (!checkedFiles.has(file) && exists(file)) {
      checkedFiles.set(file, pageRobotsMeta(file));
    }

    const pageRobots = checkedFiles.get(file) || "";

    if (pageRobots && pageRobots !== expectedRobots) {
      report(file, route.path, `page robots meta should be ${expectedRobots}`);
    } else if (!pageRobots) {
      report(file, route.path, "missing page robots meta");
    }

    const robotsPath = robotsPathForFile(file);
    const shouldBlockInRobotsTxt =
      route.classification === "admin-only" ||
      route.classification === "internal-lab" ||
      route.classification === "retired";
    const isBlockedInRobotsTxt = disallowed.has(robotsPath);

    if (shouldBlockInRobotsTxt && !isBlockedInRobotsTxt) {
      report("robots.txt", route.path, "admin/internal/retired route is not disallowed");
    } else if (!shouldBlockInRobotsTxt && isBlockedInRobotsTxt) {
      report("robots.txt", route.path, "non-internal route should not be disallowed");
    }

    const inSitemap = sitemapPaths.has(file);

    if (route.classification === "public" && !/[?#]/.test(route.path) && !inSitemap) {
      report("sitemap.xml", route.path, "public route is missing from sitemap");
    } else if (route.classification !== "public" && inSitemap) {
      report("sitemap.xml", route.path, "non-public route should not be in sitemap");
    }
  }
}

checkRouteInventory();
checkRoutePublicationPolicy();

for (const filePath of walk(root)) {
  if (/\.html$/i.test(filePath)) {
    checkHtmlFile(filePath);
  } else if (/\.css$/i.test(filePath)) {
    checkCssFile(filePath);
  }
}

checkPublicData();
checkAudioConfig();

if (failures.length) {
  console.error(`Link and asset check failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("Link and asset check passed.");
}
