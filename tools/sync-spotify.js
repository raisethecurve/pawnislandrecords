#!/usr/bin/env node

const {
  loadSourceCatalog,
  loadSpotifyCache,
  parseSpotifyUrl,
  spotifyEmbedUrl,
  spotifyPublicUrl,
  writeJson,
  spotifyCachePath
} = require("./catalog-data");

const source = loadSourceCatalog();
const cache = loadSpotifyCache();
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const now = new Date().toISOString();

function sourceEntries(records) {
  return Object.entries(records || {})
    .map(([slug, record]) => ({ slug, record, spotify: parseSpotifyUrl(record && record.spotifyUrl) }))
    .filter((entry) => entry.spotify);
}

function sourceTrackEntries(releaseSlug, tracks) {
  if (!tracks || typeof tracks !== "object" || Array.isArray(tracks)) {
    return [];
  }

  return Object.entries(tracks)
    .map(([title, record]) => ({ releaseSlug, title, record, spotify: parseSpotifyUrl(record && record.spotifyUrl) }))
    .filter((entry) => entry.spotify && entry.spotify.type === "track");
}

async function requestToken() {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed with ${response.status}`);
  }

  const body = await response.json();
  return body.access_token;
}

async function spotifyGet(token, path) {
  const response = await fetch(`https://api.spotify.com/v1/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Spotify GET /${path} failed with ${response.status}`);
  }

  return response.json();
}

function normalizeArtist(body) {
  return {
    id: body.id || "",
    type: "artist",
    name: body.name || "",
    url: (body.external_urls && body.external_urls.spotify) || spotifyPublicUrl("artist", body.id),
    genres: Array.isArray(body.genres) ? body.genres : [],
    images: Array.isArray(body.images) ? body.images : [],
    fetchedAt: now
  };
}

function normalizeTrack(body) {
  return {
    id: body.id || "",
    type: "track",
    name: body.name || "",
    url: (body.external_urls && body.external_urls.spotify) || spotifyPublicUrl("track", body.id),
    embedUrl: spotifyEmbedUrl("track", body.id),
    durationMs: body.duration_ms || 0,
    explicit: Boolean(body.explicit),
    externalIds: body.external_ids || {},
    fetchedAt: now
  };
}

function normalizeAlbum(body) {
  return {
    id: body.id || "",
    type: "album",
    name: body.name || "",
    url: (body.external_urls && body.external_urls.spotify) || spotifyPublicUrl("album", body.id),
    embedUrl: spotifyEmbedUrl("album", body.id),
    releaseDate: body.release_date || "",
    totalTracks: body.total_tracks || 0,
    externalIds: body.external_ids || {},
    images: Array.isArray(body.images) ? body.images : [],
    tracks: body.tracks && Array.isArray(body.tracks.items)
      ? body.tracks.items.map((track) => ({
          id: track.id || "",
          type: "track",
          name: track.name || "",
          url: track.id ? spotifyPublicUrl("track", track.id) : "",
          embedUrl: track.id ? spotifyEmbedUrl("track", track.id) : "",
          durationMs: track.duration_ms || 0,
          explicit: Boolean(track.explicit),
          externalIds: track.external_ids || {},
          fetchedAt: now
        }))
      : [],
    fetchedAt: now
  };
}

async function main() {
  const artistSeeds = sourceEntries(source.artists).filter((entry) => entry.spotify.type === "artist");
  const releaseSeeds = sourceEntries(source.releases).filter((entry) => entry.spotify.type === "album" || entry.spotify.type === "track");
  const trackSeeds = Object.entries(source.releases || {}).flatMap(([releaseSlug, record]) => {
    return sourceTrackEntries(releaseSlug, record && record.tracks);
  });
  const seedCount = artistSeeds.length + releaseSeeds.length + trackSeeds.length;

  if (!seedCount) {
    console.log("No Spotify seeds found in data/source-catalog.json.");
    return;
  }

  if (!clientId || !clientSecret) {
    throw new Error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET before running the Spotify sync.");
  }

  const token = await requestToken();
  const nextCache = {
    version: 1,
    fetchedAt: now,
    artists: { ...(cache.artists || {}) },
    releases: { ...(cache.releases || {}) },
    tracks: { ...(cache.tracks || {}) }
  };

  for (const seed of artistSeeds) {
    const body = await spotifyGet(token, `artists/${encodeURIComponent(seed.spotify.id)}`);
    nextCache.artists[seed.slug] = normalizeArtist(body);
    console.log(`Synced artist ${seed.slug}`);
  }

  for (const seed of releaseSeeds) {
    const body = await spotifyGet(token, `${seed.spotify.type}s/${encodeURIComponent(seed.spotify.id)}`);
    nextCache.releases[seed.slug] = seed.spotify.type === "album" ? normalizeAlbum(body) : normalizeTrack(body);
    console.log(`Synced release ${seed.slug}`);
  }

  for (const seed of trackSeeds) {
    const body = await spotifyGet(token, `tracks/${encodeURIComponent(seed.spotify.id)}`);
    nextCache.tracks[`${seed.releaseSlug}:${seed.title}`] = normalizeTrack(body);
    console.log(`Synced track ${seed.releaseSlug}:${seed.title}`);
  }

  writeJson(spotifyCachePath, nextCache);
  console.log(`Wrote ${spotifyCachePath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
