#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const {
  applySourceAndCache,
  buildAudit,
  durationLabel,
  isEpkReady,
  loadPublicData,
  loadSourceCatalog,
  loadSpotifyCache,
  parseSpotifyUrl,
  releaseListenUrl,
  spotifyEmbedUrl,
  sourceCatalogPath,
  text
} = require("./catalog-data");

const failures = [];
const warnings = [];
const launchGate = process.argv.includes("--launch-gate");

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function runFixtureChecks() {
  const artist = parseSpotifyUrl("spotify:artist:abc123");
  const album = parseSpotifyUrl("https://open.spotify.com/album/2up3OPMp9Tb4dAKM2erWXQ?si=test");
  const track = parseSpotifyUrl("https://open.spotify.com/track/27tmWIHA2BkQauKlFuDPQG");

  assert(artist && artist.type === "artist" && artist.id === "abc123", "fixture: spotify artist URI should parse");
  assert(album && album.type === "album" && album.id === "2up3OPMp9Tb4dAKM2erWXQ", "fixture: spotify album URL should parse");
  assert(track && track.type === "track" && track.id === "27tmWIHA2BkQauKlFuDPQG", "fixture: spotify track URL should parse");
  assert(!parseSpotifyUrl("https://example.com/track/nope"), "fixture: non-Spotify URL should not parse");
  assert(spotifyEmbedUrl("track", "abc123") === "https://open.spotify.com/embed/track/abc123?utm_source=generator", "fixture: Spotify embed URL should derive");
  assert(durationLabel(215000) === "3:35", "fixture: duration label should format milliseconds");
}

function validateSourceShape(source, data) {
  if (!fs.existsSync(sourceCatalogPath)) {
    fail("data/source-catalog.json is missing");
    return;
  }

  const artists = data.artists || [];
  const releases = data.releases || [];
  const sourceArtists = source.artists || {};
  const sourceReleases = source.releases || {};

  for (const artist of artists) {
    if (!sourceArtists[artist.slug]) {
      fail(`source catalog is missing artist ${artist.slug}`);
    }

    const seed = sourceArtists[artist.slug] && sourceArtists[artist.slug].spotifyUrl;
    if (seed && !parseSpotifyUrl(seed)) {
      fail(`artist ${artist.slug} has an invalid Spotify seed`);
    }
  }

  for (const release of releases) {
    if (!sourceReleases[release.slug]) {
      fail(`source catalog is missing release ${release.slug}`);
    }

    const seed = sourceReleases[release.slug] && sourceReleases[release.slug].spotifyUrl;
    if (seed && !parseSpotifyUrl(seed)) {
      fail(`release ${release.slug} has an invalid Spotify seed`);
    }
  }
}

function validatePublicData(data, source, audit) {
  const launchMode = text(data.label && data.label.launchMode, "full").toLowerCase();

  for (const artist of data.artists || []) {
    assert(artist.spotify && Array.isArray(artist.spotify.genres), `artist ${artist.slug} is missing spotify metadata shell`);
    assert(["ready", "hold"].includes(text(artist.epkStatus)), `artist ${artist.slug} has invalid epkStatus`);
    assert(Array.isArray(artist.pressAssetRecords), `artist ${artist.slug} is missing structured press assets`);

    const sourceStatus = source.artists && source.artists[artist.slug] && source.artists[artist.slug].epkStatus;
    if (sourceStatus === "ready" && !isEpkReady(artist, data)) {
      fail(`artist ${artist.slug} is marked EPK-ready but fails strict readiness`);
    }
  }

  for (const release of data.releases || []) {
    assert(release.spotify && typeof release.spotify === "object", `release ${release.slug} is missing spotify metadata shell`);
    assert(release.identifiers && typeof release.identifiers === "object", `release ${release.slug} is missing identifiers shell`);

    const state = text(release.status).toLowerCase();
    if (state === "live" && !releaseListenUrl(release)) {
      fail(`live release ${release.slug} has no listen path`);
    }

    if (state === "upcoming" && !text(release.releaseDate) && !releaseListenUrl(release)) {
      fail(`upcoming release ${release.slug} needs a release date or campaign/listen path`);
    }
  }

  if (launchGate || launchMode === "full") {
    if (audit.missing.spotifyArtistSeeds.length) {
      fail(`launch gate: ${audit.missing.spotifyArtistSeeds.length} artist Spotify seeds are missing`);
    }

    if (audit.missing.spotifyReleaseSeeds.length) {
      fail(`launch gate: ${audit.missing.spotifyReleaseSeeds.length} release Spotify seeds are missing`);
    }

    if (!audit.counts.readyEpks) {
      fail("launch gate: at least one EPK must be strict-ready");
    }
  } else {
    if (audit.missing.spotifyArtistSeeds.length) {
      warn(`${audit.missing.spotifyArtistSeeds.length} artist Spotify seeds are still missing before launch`);
    }

    if (audit.missing.spotifyReleaseSeeds.length) {
      warn(`${audit.missing.spotifyReleaseSeeds.length} release Spotify seeds are still missing before launch`);
    }
  }
}

runFixtureChecks();

const source = loadSourceCatalog();
const cache = loadSpotifyCache();
const data = applySourceAndCache(loadPublicData(), source, cache);
const audit = buildAudit(data, source, cache);

validateSourceShape(source, data);
validatePublicData(data, source, audit);

if (warnings.length) {
  console.warn(`Data readiness warnings (${warnings.length}):`);
  warnings.forEach((message) => console.warn(`- ${message}`));
}

if (failures.length) {
  console.error(`Data readiness check failed with ${failures.length} issue(s):`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log(`Data readiness check passed: ${audit.counts.readyEpks} strict-ready EPK(s), ${audit.counts.holdEpks} held.`);
}
