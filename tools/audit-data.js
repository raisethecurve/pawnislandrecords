#!/usr/bin/env node

const {
  applySourceAndCache,
  buildAudit,
  loadPublicData,
  loadSourceCatalog,
  loadSpotifyCache
} = require("./catalog-data");

const source = loadSourceCatalog();
const cache = loadSpotifyCache();
const data = applySourceAndCache(loadPublicData(), source, cache);
const audit = buildAudit(data, source, cache);
const asJson = process.argv.includes("--json");

if (asJson) {
  console.log(JSON.stringify(audit, null, 2));
  process.exit(0);
}

function line(label, value) {
  console.log(`${label.padEnd(28)} ${value}`);
}

function list(label, values) {
  const items = values || [];
  console.log(`\n${label} (${items.length})`);
  if (!items.length) {
    console.log("  none");
    return;
  }

  items.forEach((item) => console.log(`  - ${item}`));
}

console.log("Pawn Island Records Data Truth Audit");
console.log("====================================");
line("Artists", audit.counts.artists);
line("Releases", audit.counts.releases);
line("Live releases", audit.counts.live);
line("Upcoming releases", audit.counts.upcoming);
line("Ready EPKs", audit.counts.readyEpks);
line("Held EPKs", audit.counts.holdEpks);
line("Spotify cache fetched", audit.cache.fetchedAt || "not fetched");
line("Cached artists", audit.cache.artists);
line("Cached releases", audit.cache.releases);
line("Cached tracks", audit.cache.tracks);

list("Ready EPKs", audit.readyEpks);
list("Held EPKs", audit.holdEpks);
list("Missing Spotify artist seeds", audit.missing.spotifyArtistSeeds);
list("Missing Spotify release seeds", audit.missing.spotifyReleaseSeeds);
list("Missing primary embeds", audit.missing.primaryEmbeds);
list("Missing track lists", audit.missing.tracks);
list("Placeholder-risk artist copy", audit.placeholderRisk.artists);
list("Placeholder-risk release copy", audit.placeholderRisk.releases);
