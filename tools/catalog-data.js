const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const publicDataPath = path.join(root, "public-data.js");
const sourceCatalogPath = path.join(root, "data", "source-catalog.json");
const spotifyCachePath = path.join(root, "data", "spotify-cache.json");

function text(value, fallback = "") {
  const resolved = String(value || "").trim();
  return resolved || String(fallback || "").trim();
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return deepClone(fallback);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function loadPublicData() {
  const source = fs.readFileSync(publicDataPath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: publicDataPath });
  return sandbox.window.PAWN_PUBLIC_DATA;
}

function serializePublicData(data) {
  return `window.PAWN_PUBLIC_DATA = ${JSON.stringify(data, null, 2)};\n`;
}

function writePublicData(data) {
  fs.writeFileSync(publicDataPath, serializePublicData(data));
}

function loadSourceCatalog() {
  return readJson(sourceCatalogPath, {
    version: 1,
    artists: {},
    releases: {}
  });
}

function loadSpotifyCache() {
  return readJson(spotifyCachePath, {
    version: 1,
    fetchedAt: "",
    artists: {},
    releases: {},
    tracks: {}
  });
}

function objectEntry(source, key) {
  if (!source) {
    return null;
  }

  if (Array.isArray(source)) {
    return source.find((entry) => text(entry && entry.slug) === key) || null;
  }

  return source[key] || null;
}

function normalizeLookupKey(value) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseSpotifyUrl(value) {
  const raw = text(value);

  if (!raw) {
    return null;
  }

  const uriMatch = raw.match(/^spotify:(artist|album|track):([A-Za-z0-9]+)$/i);
  if (uriMatch) {
    const type = uriMatch[1].toLowerCase();
    const id = uriMatch[2];
    return {
      type,
      id,
      url: spotifyPublicUrl(type, id),
      uri: `spotify:${type}:${id}`
    };
  }

  try {
    const url = new URL(raw);
    const match = url.hostname.includes("spotify.com")
      ? url.pathname.match(/^\/(artist|album|track)\/([A-Za-z0-9]+)/i)
      : null;

    if (!match) {
      return null;
    }

    const type = match[1].toLowerCase();
    const id = match[2];
    return {
      type,
      id,
      url: spotifyPublicUrl(type, id),
      uri: `spotify:${type}:${id}`
    };
  } catch (error) {
    return null;
  }
}

function spotifyPublicUrl(type, id) {
  return type && id ? `https://open.spotify.com/${type}/${id}` : "";
}

function spotifyEmbedUrl(type, id) {
  return type && id ? `https://open.spotify.com/embed/${type}/${id}?utm_source=generator` : "";
}

function durationLabel(durationMs) {
  const value = Number(durationMs);

  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  const totalSeconds = Math.round(value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function spotifyFromSeed(seed, existing, cached) {
  const parsed = parseSpotifyUrl(seed) || parseSpotifyUrl(existing && existing.url);
  const type = text(cached && cached.type, parsed && parsed.type);
  const id = text(cached && cached.id, parsed && parsed.id);
  const url = text(cached && cached.url, parsed && parsed.url);

  return {
    id,
    type,
    url,
    embedUrl: text(cached && cached.embedUrl, type && id && type !== "artist" ? spotifyEmbedUrl(type, id) : ""),
    genres: ensureArray(cached && cached.genres).map(text).filter(Boolean),
    fetchedAt: text(cached && cached.fetchedAt, existing && existing.fetchedAt)
  };
}

function normalizePressAssetRecord(record) {
  if (!record || typeof record !== "object") {
    const label = text(record);
    return label
      ? {
          label,
          path: "",
          url: "",
          type: "note",
          credit: "",
          approved: false
        }
      : null;
  }

  const label = text(record.label || record.title || record.path || record.url);

  if (!label) {
    return null;
  }

  return {
    label,
    path: text(record.path),
    url: text(record.url),
    type: text(record.type, "asset"),
    credit: text(record.credit),
    approved: Boolean(record.approved)
  };
}

function approvedPressAssets(artist) {
  return ensureArray(artist && artist.pressAssetRecords)
    .map(normalizePressAssetRecord)
    .filter((asset) => asset && asset.approved && (asset.path || asset.url || asset.type === "note"));
}

function hasPressContact(data) {
  return ensureArray(data && data.label && data.label.socialLinks).some((link) => {
    const key = text(link && link.key).toLowerCase();
    const url = text(link && link.url).toLowerCase();
    return key === "email" || url.startsWith("mailto:");
  });
}

function releaseListenUrl(release) {
  const spotifyUrl = text(release && release.spotify && release.spotify.url);
  const tooFmUrl = text(release && (release.tooFmUrl || release.toofmUrl || release.campaignUrl));
  const platformUrl = ensureArray(release && release.platforms).map((platform) => text(platform && platform.url)).find(Boolean);
  return spotifyUrl || tooFmUrl || platformUrl || "";
}

function releaseMediaUrl(release) {
  return text(release && release.primaryEmbedUrl) ||
    text(release && release.spotify && release.spotify.embedUrl) ||
    text(release && release.youtubeId) ||
    "";
}

function artistHasCurrentReleaseContext(artist, data) {
  return ensureArray(data && data.releases).some((release) => {
    return text(release && release.artist) === text(artist && artist.slug) && (releaseListenUrl(release) || releaseMediaUrl(release));
  });
}

function isEpkReady(artist, data) {
  return text(artist && artist.epkStatus, "hold").toLowerCase() === "ready" &&
    Boolean(text(artist && artist.pressBio)) &&
    Boolean(approvedPressAssets(artist).length) &&
    artistHasCurrentReleaseContext(artist, data) &&
    hasPressContact(data);
}

function mergeSpotifyPlatform(platforms, spotify) {
  const list = ensureArray(platforms)
    .filter((platform) => platform && text(platform.url))
    .map((platform) => ({
      label: text(platform.label, "Platform"),
      url: text(platform.url)
    }));

  if (!spotify || !spotify.url) {
    return list;
  }

  const hasSpotify = list.some((platform) => /spotify\.com/i.test(platform.url) || text(platform.label).toLowerCase() === "spotify");

  if (!hasSpotify) {
    list.unshift({
      label: "Spotify",
      url: spotify.url
    });
  }

  return list;
}

function normalizeTrackSource(sourceTracks, title) {
  const key = normalizeLookupKey(title);
  const direct = sourceTracks && typeof sourceTracks === "object" && !Array.isArray(sourceTracks)
    ? sourceTracks[title] || sourceTracks[key]
    : null;

  if (direct) {
    return direct;
  }

  return ensureArray(sourceTracks).find((track) => {
    return normalizeLookupKey(track && track.title) === key;
  }) || null;
}

function cacheTrackFor(cache, releaseSlug, title, albumRelease) {
  const directKey = `${releaseSlug}:${normalizeLookupKey(title)}`;
  const direct = cache && cache.tracks && cache.tracks[directKey];

  if (direct) {
    return direct;
  }

  const albumTracks = ensureArray(albumRelease && albumRelease.tracks);
  return albumTracks.find((track) => normalizeLookupKey(track && track.name) === normalizeLookupKey(title)) || null;
}

function applySourceAndCache(publicData, sourceCatalog, spotifyCache) {
  const data = deepClone(publicData);
  const source = sourceCatalog || loadSourceCatalog();
  const cache = spotifyCache || loadSpotifyCache();

  data.artists = ensureArray(data.artists).map((artist) => {
    const sourceArtist = objectEntry(source.artists, artist.slug) || {};
    const cachedArtist = (cache.artists && cache.artists[artist.slug]) || {};
    const spotify = spotifyFromSeed(sourceArtist.spotifyUrl, artist.spotify, cachedArtist);
    const sourcePress = sourceArtist.press || {};
    const pressAssetRecords = ensureArray(sourcePress.assets).map(normalizePressAssetRecord).filter(Boolean);

    return {
      ...artist,
      spotify: {
        id: spotify.id,
        url: spotify.url,
        genres: spotify.genres,
        fetchedAt: spotify.fetchedAt
      },
      epkStatus: text(sourceArtist.epkStatus, artist.epkStatus || "hold").toLowerCase() === "ready" ? "ready" : "hold",
      pressApproval: {
        bioApproved: Boolean(sourcePress.bioApproved),
        highlightsApproved: Boolean(sourcePress.highlightsApproved)
      },
      pressAssetRecords
    };
  });

  data.releases = ensureArray(data.releases).map((release) => {
    const sourceRelease = objectEntry(source.releases, release.slug) || {};
    const cachedRelease = (cache.releases && cache.releases[release.slug]) || {};
    const spotify = spotifyFromSeed(sourceRelease.spotifyUrl, release.spotify, cachedRelease);
    const externalIds = cachedRelease.externalIds || {};
    const identifiers = {
      ...(release.identifiers || {}),
      upc: text(externalIds.upc, release.identifiers && release.identifiers.upc)
    };
    const sourceTooFmUrl = text(sourceRelease.tooFmUrl);
    const sourceYoutubeId = text(sourceRelease.youtubeId);
    const nextRelease = {
      ...release,
      tooFmUrl: text(release.tooFmUrl || release.toofmUrl || release.campaignUrl, sourceTooFmUrl),
      youtubeId: text(release.youtubeId, sourceYoutubeId),
      spotify: {
        id: spotify.id,
        type: spotify.type,
        url: spotify.url,
        embedUrl: spotify.embedUrl,
        fetchedAt: spotify.fetchedAt
      },
      identifiers,
      platforms: mergeSpotifyPlatform(release.platforms, spotify),
      primaryEmbedUrl: text(release.primaryEmbedUrl, spotify.embedUrl),
      primaryEmbedLabel: text(release.primaryEmbedLabel, spotify.embedUrl ? "Spotify" : "")
    };
    const sourceTracks = sourceRelease.tracks || {};

    nextRelease.tracks = ensureArray(release.tracks).map((track) => {
      const sourceTrack = normalizeTrackSource(sourceTracks, track.title) || {};
      const cachedTrack = cacheTrackFor(cache, release.slug, track.title, cachedRelease) || {};
      const trackSpotify = spotifyFromSeed(sourceTrack.spotifyUrl, track.spotify, cachedTrack);
      const trackExternalIds = cachedTrack.externalIds || cachedTrack.external_ids || {};

      return {
        ...track,
        runtime: text(track.runtime, durationLabel(cachedTrack.durationMs || cachedTrack.duration_ms)),
        youtubeId: text(track.youtubeId, sourceTrack.youtubeId),
        spotify: {
          id: trackSpotify.id,
          type: trackSpotify.type,
          url: trackSpotify.url,
          embedUrl: trackSpotify.embedUrl,
          fetchedAt: trackSpotify.fetchedAt
        },
        identifiers: {
          ...(track.identifiers || {}),
          isrc: text(trackExternalIds.isrc, track.identifiers && track.identifiers.isrc)
        }
      };
    });

    return nextRelease;
  });

  return data;
}

function buildAudit(data, sourceCatalog, spotifyCache) {
  const source = sourceCatalog || loadSourceCatalog();
  const cache = spotifyCache || loadSpotifyCache();
  const artists = ensureArray(data.artists);
  const releases = ensureArray(data.releases);
  const artistSlugs = new Set(artists.map((artist) => artist.slug));
  const releaseSlugs = new Set(releases.map((release) => release.slug));
  const sourceArtistKeys = new Set(Object.keys(source.artists || {}));
  const sourceReleaseKeys = new Set(Object.keys(source.releases || {}));
  const readyArtists = artists.filter((artist) => isEpkReady(artist, data));
  const placeholderPattern = /\b(placeholder|coming soon|sample slot|room for specifics|available by request|gets written|behind the scenes)\b/i;

  return {
    counts: {
      artists: artists.length,
      releases: releases.length,
      live: releases.filter((release) => text(release.status).toLowerCase() === "live").length,
      upcoming: releases.filter((release) => text(release.status).toLowerCase() === "upcoming").length,
      readyEpks: readyArtists.length,
      holdEpks: artists.length - readyArtists.length
    },
    missing: {
      sourceArtists: artists.filter((artist) => !sourceArtistKeys.has(artist.slug)).map((artist) => artist.slug),
      sourceReleases: releases.filter((release) => !sourceReleaseKeys.has(release.slug)).map((release) => release.slug),
      unknownSourceArtists: [...sourceArtistKeys].filter((slug) => !artistSlugs.has(slug)),
      unknownSourceReleases: [...sourceReleaseKeys].filter((slug) => !releaseSlugs.has(slug)),
      spotifyArtistSeeds: artists.filter((artist) => !parseSpotifyUrl(objectEntry(source.artists, artist.slug) && objectEntry(source.artists, artist.slug).spotifyUrl)).map((artist) => artist.slug),
      spotifyReleaseSeeds: releases.filter((release) => !parseSpotifyUrl(objectEntry(source.releases, release.slug) && objectEntry(source.releases, release.slug).spotifyUrl)).map((release) => release.slug),
      primaryEmbeds: releases.filter((release) => !text(release.primaryEmbedUrl || (release.spotify && release.spotify.embedUrl))).map((release) => release.slug),
      tracks: releases.filter((release) => !ensureArray(release.tracks).length).map((release) => release.slug)
    },
    readyEpks: readyArtists.map((artist) => artist.slug),
    holdEpks: artists.filter((artist) => !isEpkReady(artist, data)).map((artist) => artist.slug),
    placeholderRisk: {
      artists: artists
        .filter((artist) => [artist.summary, artist.headline, artist.story, artist.pressBio].some((value) => placeholderPattern.test(text(value))))
        .map((artist) => artist.slug),
      releases: releases
        .filter((release) => [release.description].some((value) => placeholderPattern.test(text(value))))
        .map((release) => release.slug)
    },
    cache: {
      fetchedAt: text(cache.fetchedAt),
      artists: Object.keys(cache.artists || {}).length,
      releases: Object.keys(cache.releases || {}).length,
      tracks: Object.keys(cache.tracks || {}).length
    }
  };
}

module.exports = {
  root,
  publicDataPath,
  sourceCatalogPath,
  spotifyCachePath,
  text,
  ensureArray,
  readJson,
  writeJson,
  loadPublicData,
  writePublicData,
  serializePublicData,
  loadSourceCatalog,
  loadSpotifyCache,
  parseSpotifyUrl,
  spotifyPublicUrl,
  spotifyEmbedUrl,
  durationLabel,
  approvedPressAssets,
  hasPressContact,
  releaseListenUrl,
  releaseMediaUrl,
  isEpkReady,
  applySourceAndCache,
  buildAudit
};
