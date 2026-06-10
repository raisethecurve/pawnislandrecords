const RELEASE_TIMEZONE = "America/New_York";
const RELEASE_SWITCH_HOUR = 4;

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status: init.status || 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      ...(init.headers || {})
    }
  });
}

function text(value, fallback = "") {
  const resolved = String(value || "").trim();
  return resolved || String(fallback || "").trim();
}

function normalizeReleaseDateValue(value) {
  const normalized = text(value);
  const match = normalized.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);

  if (!match) {
    return "";
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "";
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

function newYorkDateTime(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: RELEASE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const parts = formatter.formatToParts(date).reduce((result, part) => {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }

    return result;
  }, {});

  return {
    hour: Number(parts.hour || 0),
    ymd: `${parts.year || "0000"}-${parts.month || "00"}-${parts.day || "00"}`
  };
}

function releaseSwitchHour(release) {
  const configuredHour = Number(release && release.releaseHour);

  if (Number.isFinite(configuredHour) && configuredHour >= 0 && configuredHour <= 23) {
    return configuredHour;
  }

  return RELEASE_SWITCH_HOUR;
}

function releaseTimeLabel(release) {
  return text(release && (release.releaseTime || release.releaseTimeLabel));
}

function releaseIsLiveInNewYork(release, now) {
  const releaseDate = normalizeReleaseDateValue(release && release.releaseDate);

  if (!releaseDate) {
    return false;
  }

  const current = newYorkDateTime(now);

  if (current.ymd > releaseDate) {
    return true;
  }

  if (current.ymd < releaseDate) {
    return false;
  }

  return current.hour >= releaseSwitchHour(release);
}

function hasLivePath(release) {
  const spotifyUrl = text(release && release.spotify && release.spotify.url);
  const tooFmUrl = text(release && (release.tooFmUrl || release.toofmUrl || release.campaignUrl));
  const platforms = Array.isArray(release && release.platforms) ? release.platforms : [];

  return Boolean(spotifyUrl || tooFmUrl || platforms.some((platform) => text(platform && platform.url)));
}

function releaseState(release, now) {
  const status = text(release && release.status).toLowerCase();
  const hasDate = Boolean(normalizeReleaseDateValue(release && release.releaseDate));
  const switchedLive = hasDate ? releaseIsLiveInNewYork(release, now) : false;
  const dateGovernedStatus = new Set(["", "live", "upcoming", "scheduled", "announced"]);

  if (hasDate && dateGovernedStatus.has(status)) {
    return switchedLive ? "live" : "upcoming";
  }

  if (status === "live") {
    return "live";
  }

  if (status === "upcoming" || status === "scheduled" || status === "announced") {
    return "upcoming";
  }

  if (hasLivePath(release)) {
    return "live";
  }

  return "catalog";
}

function formatReleaseDate(value) {
  const normalized = normalizeReleaseDateValue(value);

  if (!normalized) {
    return "";
  }

  const [year, month, day] = normalized.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function releaseStatusLabel(state) {
  if (state === "upcoming") {
    return "Forthcoming";
  }

  if (state === "live") {
    return "Out Now";
  }

  return "Catalog";
}

function releaseAvailabilityText(release, state) {
  const formattedDate = formatReleaseDate(release && release.releaseDate);
  const timeLabel = releaseTimeLabel(release);
  const datedTime = formattedDate && timeLabel ? `${formattedDate} at ${timeLabel}` : formattedDate;

  if (state === "upcoming") {
    return datedTime ? `Releases ${datedTime}` : "Release date coming soon";
  }

  if (state === "live") {
    return datedTime ? `Released ${datedTime}` : "Out now";
  }

  return formattedDate ? `Cataloged ${formattedDate}` : "";
}

function releaseCtaLabel(state) {
  return state === "upcoming" ? "Pre-save now" : "Play now";
}

function decorateRelease(release, now) {
  const state = releaseState(release, now);
  const status = state === "live" || state === "upcoming" ? state : release.status;

  return {
    ...release,
    status,
    computedStatus: state,
    computedStatusLabel: releaseStatusLabel(state),
    availabilityText: releaseAvailabilityText(release, state),
    ctaLabel: releaseCtaLabel(state)
  };
}

function extractPublicData(source) {
  const match = String(source || "").match(/window\.PAWN_PUBLIC_DATA\s*=\s*([\s\S]*?);\s*$/);

  if (!match) {
    throw new Error("public-data.js does not contain a PAWN_PUBLIC_DATA assignment.");
  }

  return JSON.parse(match[1]);
}

function parseNow(request) {
  const url = new URL(request.url);
  const requestedNow = url.searchParams.get("now");
  const parsed = requestedNow ? new Date(requestedNow) : new Date();

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function normalizePublicData(data, now) {
  const releases = Array.isArray(data && data.releases) ? data.releases : [];

  return {
    ...data,
    releaseComputedAt: now.toISOString(),
    releaseTimezone: RELEASE_TIMEZONE,
    releases: releases.map((release) => decorateRelease(release, now))
  };
}

export async function onRequestOptions() {
  return jsonResponse({}, { status: 204 });
}

export async function onRequestGet(context) {
  try {
    const assetUrl = new URL("/public-data.js", context.request.url);
    const assetResponse = await context.env.ASSETS.fetch(assetUrl);

    if (!assetResponse.ok) {
      return jsonResponse(
        {
          error: "public_data_unavailable",
          message: "Unable to read public-data.js from the deployed Pages assets."
        },
        { status: 502 }
      );
    }

    const now = parseNow(context.request);
    const publicData = extractPublicData(await assetResponse.text());
    const data = normalizePublicData(publicData, now);

    return jsonResponse(
      {
        source: "pawn-public-data-edge",
        generatedAt: now.toISOString(),
        timezone: RELEASE_TIMEZONE,
        data
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300"
        }
      }
    );
  } catch (error) {
    return jsonResponse(
      {
        error: "public_data_error",
        message: error && error.message ? error.message : "Unable to normalize public release data."
      },
      { status: 500 }
    );
  }
}
