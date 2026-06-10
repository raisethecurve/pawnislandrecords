#!/usr/bin/env node

const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");
const path = require("node:path");
const { defaultMediaOrigin } = require("./media-url");

const root = path.resolve(__dirname, "..");
const defaultTimeoutMs = 12000;
const defaultConcurrency = 8;
const expectedTypes = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function usage() {
  console.log(`Usage: node tools/check-r2-media.js [options]

Checks that every local file under media/ is available from the configured media origin.

Options:
  --origin <url>        Defaults to PAWN_MEDIA_ORIGIN or ${defaultMediaOrigin}.
  --dir <path>          Local media directory. Defaults to PAWN_R2_MEDIA_DIR or media.
  --filter <text>       Check only paths containing this text.
  --concurrency <n>     Parallel requests. Defaults to ${defaultConcurrency}.
  --timeout <ms>        Per-request timeout. Defaults to ${defaultTimeoutMs}.
  --help                Show this help.
`);
}

function readOption(args, name, fallback = "") {
  const inline = args.find((arg) => arg.startsWith(`${name}=`));

  if (inline) {
    return inline.slice(name.length + 1);
  }

  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function numberOption(args, name, fallback) {
  const value = Number(readOption(args, name, fallback));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function expectedContentType(filePath) {
  return expectedTypes[path.extname(filePath).toLowerCase()] || "";
}

function commandValue(value) {
  return /[\s"'`]/.test(value) ? JSON.stringify(value) : value;
}

function requestUrl(url, method, timeoutMs) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const client = parsed.protocol === "http:" ? http : https;
    const request = client.request(
      parsed,
      {
        method,
        timeout: timeoutMs,
        headers: method === "GET" ? { Range: "bytes=0-0" } : undefined
      },
      (response) => {
        response.resume();
        response.on("end", () => {
          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode,
            contentType: response.headers["content-type"] || "",
            method
          });
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error("timeout"));
    });

    request.on("error", (error) => {
      resolve({
        ok: false,
        status: "ERR",
        error: error.message,
        method
      });
    });

    request.end();
  });
}

async function checkUrl(entry, timeoutMs) {
  const head = await requestUrl(entry.url, "HEAD", timeoutMs);
  const response = head.ok || [404, 403].includes(head.status) ? head : await requestUrl(entry.url, "GET", timeoutMs);
  const expectedType = expectedContentType(entry.file);
  const actualType = String(response.contentType || "").split(";")[0].toLowerCase();
  const contentTypeOk = !expectedType || !response.ok || actualType === expectedType;

  return {
    ...entry,
    ...response,
    expectedType,
    contentTypeOk
  };
}

async function mapConcurrent(items, concurrency, worker) {
  const results = new Array(items.length);
  let index = 0;

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (index < items.length) {
        const current = index;
        index += 1;
        results[current] = await worker(items[current]);
      }
    })
  );

  return results;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    usage();
    return;
  }

  const origin = readOption(args, "--origin", process.env.PAWN_MEDIA_ORIGIN || defaultMediaOrigin).replace(/\/+$/g, "");
  const mediaDir = path.resolve(root, readOption(args, "--dir", process.env.PAWN_R2_MEDIA_DIR || "media"));
  const filter = readOption(args, "--filter", "").trim().toLowerCase();
  const concurrency = numberOption(args, "--concurrency", defaultConcurrency);
  const timeoutMs = numberOption(args, "--timeout", defaultTimeoutMs);

  if (!origin) {
    console.error("Missing media origin. Pass --origin or set PAWN_MEDIA_ORIGIN.");
    process.exit(1);
  }

  if (!mediaDir.startsWith(root) || !fs.existsSync(mediaDir)) {
    console.error(`Media directory does not exist inside the repo: ${mediaDir}`);
    process.exit(1);
  }

  const entries = walk(mediaDir)
    .filter((file) => fs.statSync(file).isFile())
    .map((file) => {
      const relative = toPosix(path.relative(mediaDir, file));
      return {
        file,
        relative,
        url: new URL(relative, `${origin}/`).toString()
      };
    })
    .filter((entry) => !filter || entry.relative.toLowerCase().includes(filter));

  console.log(`Checking ${entries.length} media object(s) at ${origin}.`);

  const results = await mapConcurrent(entries, concurrency, (entry) => checkUrl(entry, timeoutMs));
  const failures = results.filter((result) => !result.ok || !result.contentTypeOk);

  for (const result of results) {
    if (!result.ok || !result.contentTypeOk) {
      const status = result.status === "ERR" ? `ERR ${result.error || ""}`.trim() : result.status;
      const typeMessage = result.contentTypeOk
        ? ""
        : ` expected ${result.expectedType}, got ${result.contentType || "no content type"}`;
      console.error(`MISS ${status} ${result.relative} -> ${result.url}${typeMessage}`);
    }
  }

  if (failures.length) {
    console.error(`R2 media check failed with ${failures.length} unavailable object(s).`);
    console.error("Upload missing objects with:");
    [...new Set(failures.map((failure) => path.basename(failure.relative)))].forEach((filter) => {
      console.error(`  npm run sync:r2:media -- --execute --filter ${commandValue(filter)}`);
    });
    process.exit(1);
  }

  console.log("R2 media check passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
