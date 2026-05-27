#!/usr/bin/env node

const {
  applySourceAndCache,
  buildAudit,
  loadPublicData,
  loadSourceCatalog,
  loadSpotifyCache,
  writePublicData
} = require("./catalog-data");

const source = loadSourceCatalog();
const cache = loadSpotifyCache();
const nextData = applySourceAndCache(loadPublicData(), source, cache);

writePublicData(nextData);

const audit = buildAudit(nextData, source, cache);
console.log(`Generated public-data.js with ${audit.counts.artists} artists and ${audit.counts.releases} releases.`);
console.log(`${audit.counts.readyEpks} EPK(s) ready; ${audit.counts.holdEpks} held for press approval.`);
