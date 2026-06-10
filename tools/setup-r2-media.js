#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { defaultMediaOrigin } = require("./media-url");

const root = path.resolve(__dirname, "..");
const apiBase = "https://api.cloudflare.com/client/v4";
const defaultBucket = "pawn-island-records-media";
const defaultZoneName = "pawnislandrecords.com";

function usage() {
  console.log(`Usage: node tools/setup-r2-media.js [options]

Creates/verifies the R2 media bucket, applies CORS, and attaches the custom domain
through the Cloudflare API.

Required env:
  CLOUDFLARE_API_TOKEN       Cloudflare API token with R2 admin access.

Recommended env:
  CLOUDFLARE_ZONE_ID         Zone ID for pawnislandrecords.com.

Options:
  --bucket <name>            Defaults to PAWN_R2_BUCKET or ${defaultBucket}.
  --domain <hostname>        Defaults to media.pawnislandrecords.com.
  --zone <zone-name>         Defaults to ${defaultZoneName}.
  --help                     Show this help.
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

function apiUrl(pathname, params) {
  const url = new URL(pathname.replace(/^\/+/, ""), `${apiBase}/`);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim()) {
      url.searchParams.set(key, String(value).trim());
    }
  });

  return url.toString();
}

async function cloudflareApi(pathname, options = {}) {
  const token = String(process.env.CLOUDFLARE_API_TOKEN || "").trim();

  if (!token) {
    throw new Error("Missing CLOUDFLARE_API_TOKEN.");
  }

  const response = await fetch(apiUrl(pathname, options.searchParams), {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const messages = [
      ...(Array.isArray(data.errors) ? data.errors.map((error) => error && error.message) : []),
      ...(Array.isArray(data.messages) ? data.messages : [])
    ].filter(Boolean);
    const error = new Error(messages.join("; ") || `${options.method || "GET"} ${pathname} failed`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data.result;
}

async function resolveZoneId(zoneName) {
  const configured = String(process.env.CLOUDFLARE_ZONE_ID || "").trim();

  if (configured) {
    return configured;
  }

  const zones = await cloudflareApi("zones", { searchParams: { name: zoneName } });

  if (!Array.isArray(zones) || !zones.length || !zones[0].id) {
    throw new Error(`Set CLOUDFLARE_ZONE_ID; could not resolve zone ${zoneName}.`);
  }

  return zones[0].id;
}

async function bucketExists(accountId, bucket) {
  try {
    await cloudflareApi(`accounts/${accountId}/r2/buckets/${encodeURIComponent(bucket)}`);
    return true;
  } catch (error) {
    if (error.status === 404) {
      return false;
    }

    throw error;
  }
}

async function ensureBucket(accountId, bucket) {
  if (await bucketExists(accountId, bucket)) {
    console.log(`Bucket exists: ${bucket}`);
    return;
  }

  await cloudflareApi(`accounts/${accountId}/r2/buckets`, {
    method: "POST",
    body: {
      name: bucket,
      storageClass: "Standard"
    }
  });
  console.log(`Created bucket: ${bucket}`);
}

async function applyCors(accountId, bucket) {
  const corsPath = path.join(root, "config", "r2-cors.json");
  const cors = JSON.parse(fs.readFileSync(corsPath, "utf8"));

  await cloudflareApi(`accounts/${accountId}/r2/buckets/${encodeURIComponent(bucket)}/cors`, {
    method: "PUT",
    body: cors
  });
  console.log(`Applied CORS policy: ${corsPath}`);
}

async function customDomainExists(accountId, bucket, domain) {
  try {
    await cloudflareApi(
      `accounts/${accountId}/r2/buckets/${encodeURIComponent(bucket)}/domains/custom/${encodeURIComponent(domain)}`
    );
    return true;
  } catch (error) {
    if (error.status === 404) {
      return false;
    }

    throw error;
  }
}

async function ensureCustomDomain(accountId, bucket, zoneId, domain) {
  if (await customDomainExists(accountId, bucket, domain)) {
    console.log(`Custom domain exists: ${domain}`);
    return;
  }

  await cloudflareApi(`accounts/${accountId}/r2/buckets/${encodeURIComponent(bucket)}/domains/custom`, {
    method: "POST",
    body: {
      domain,
      enabled: true,
      zoneId,
      minTLS: "1.2"
    }
  });
  console.log(`Attached custom domain: ${domain}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    usage();
    return;
  }

  const bucket = readOption(args, "--bucket", process.env.PAWN_R2_BUCKET || defaultBucket).trim();
  const domain = readOption(args, "--domain", new URL(defaultMediaOrigin).hostname).trim();
  const zoneName = readOption(args, "--zone", defaultZoneName).trim();
  const accountId = String(process.env.CLOUDFLARE_ACCOUNT_ID || "").trim();

  if (!accountId) {
    throw new Error("Missing CLOUDFLARE_ACCOUNT_ID.");
  }

  const zoneId = await resolveZoneId(zoneName);

  await ensureBucket(accountId, bucket);
  await applyCors(accountId, bucket);
  await ensureCustomDomain(accountId, bucket, zoneId, domain);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
