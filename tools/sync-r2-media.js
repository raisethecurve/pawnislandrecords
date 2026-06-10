#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { defaultMediaOrigin } = require("./media-url");

const root = path.resolve(__dirname, "..");
const defaultBucket = "pawn-island-records-media";
const defaultCacheControl = "public, max-age=86400, stale-while-revalidate=604800";

function usage() {
  console.log(`Usage: node tools/sync-r2-media.js [options]

Uploads files under media/ to Cloudflare R2 using object keys relative to media/.
Example: media/public/albums/rhea_hearth.png -> public/albums/rhea_hearth.png

Options:
  --execute                 Upload files. Omit for a dry run.
  --bucket <name>           R2 bucket name. Defaults to PAWN_R2_BUCKET or ${defaultBucket}.
  --dir <path>              Local media directory. Defaults to PAWN_R2_MEDIA_DIR or media.
  --prefix <key-prefix>     Optional R2 key prefix.
  --filter <text>           Upload only paths containing this text.
  --cache-control <value>   Cache-Control metadata for uploaded objects.
  --help                    Show this help.
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

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  return (
    {
      ".avif": "image/avif",
      ".gif": "image/gif",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".mp3": "audio/mpeg",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".webp": "image/webp"
    }[extension] || "application/octet-stream"
  );
}

function npxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

function runWrangler(args) {
  const result = spawnSync(npxCommand(), ["--yes", "wrangler", ...args], {
    cwd: root,
    stdio: "inherit"
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    usage();
    return;
  }

  const execute = args.includes("--execute");
  const bucket = readOption(args, "--bucket", process.env.PAWN_R2_BUCKET || defaultBucket).trim();
  const mediaDir = path.resolve(root, readOption(args, "--dir", process.env.PAWN_R2_MEDIA_DIR || "media"));
  const keyPrefix = readOption(args, "--prefix", process.env.PAWN_R2_PREFIX || "").replace(/^\/+|\/+$/g, "");
  const filter = readOption(args, "--filter", "").trim().toLowerCase();
  const cacheControl = readOption(
    args,
    "--cache-control",
    process.env.PAWN_R2_CACHE_CONTROL || defaultCacheControl
  ).trim();
  const mediaOrigin = (process.env.PAWN_MEDIA_ORIGIN || defaultMediaOrigin).replace(/\/+$/g, "");

  if (!bucket) {
    console.error("Missing bucket name. Pass --bucket or set PAWN_R2_BUCKET.");
    process.exit(1);
  }

  if (!mediaDir.startsWith(root) || !fs.existsSync(mediaDir)) {
    console.error(`Media directory does not exist inside the repo: ${mediaDir}`);
    process.exit(1);
  }

  const files = walk(mediaDir)
    .filter((file) => fs.statSync(file).isFile())
    .map((file) => {
      const relative = toPosix(path.relative(mediaDir, file));
      const key = [keyPrefix, relative].filter(Boolean).join("/");
      return { file, relative, key };
    })
    .filter((entry) => !filter || entry.relative.toLowerCase().includes(filter));

  console.log(`${execute ? "Uploading" : "Dry run for"} ${files.length} media object(s) to ${bucket}.`);

  files.forEach((entry) => {
    const objectPath = `${bucket}/${entry.key}`;
    const publicUrl = `${mediaOrigin}/${entry.key}`;
    console.log(`${execute ? "PUT" : "DRY"} ${objectPath} <- ${entry.relative}`);
    console.log(`    ${publicUrl}`);

    if (!execute) {
      return;
    }

    const wranglerArgs = [
      "r2",
      "object",
      "put",
      objectPath,
      "--file",
      entry.file,
      "--content-type",
      contentType(entry.file),
      "--cache-control",
      cacheControl,
      "--remote",
      "--force"
    ];

    if (process.env.PAWN_R2_JURISDICTION) {
      wranglerArgs.push("--jurisdiction", process.env.PAWN_R2_JURISDICTION);
    }

    runWrangler(wranglerArgs);
  });

  if (!execute) {
    console.log("Dry run only. Re-run with --execute after Cloudflare auth and bucket setup are ready.");
  }
}

main();
