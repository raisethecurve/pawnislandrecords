#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { loadPublicData, releaseListenUrl, isEpkReady, approvedPressAssets } = require("./catalog-data");
const { publicAssetUrl } = require("./media-url");

const root = path.resolve(__dirname, "..");
const siteOrigin = "https://www.pawnislandrecords.com";
const releaseTimezone = "America/New_York";
const releaseSwitchHour = 4;
const generatedAt = dateStampInTimezone(new Date(), releaseTimezone);
const founderName = "Matthew H. Freeman";
const founderAliases = ["Matthew Freeman", "Matt Freeman"];
const publicFounderName = "Matt Freeman";
const defaultImage = "assets/brand/pawnisland-1200.jpg";
const contactEmail = "pawnisland@outlook.com";
const copyResourcePath = path.join(root, "data", "project-page-copy.json");

function dateStampInTimezone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date).reduce((result, part) => {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }

    return result;
  }, {});

  return `${parts.year || "0000"}-${parts.month || "00"}-${parts.day || "00"}`;
}

function text(value, fallback = "") {
  const resolved = String(value || "").trim();
  return resolved || String(fallback || "").trim();
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function stripMarkdown(value) {
  return String(value || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/<([^>]+)>/g, "$1")
    .trim();
}

function normalizeCopyKey(value) {
  return stripMarkdown(value)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function absoluteUrl(value) {
  const raw = text(value);
  if (!raw) {
    return `${siteOrigin}/`;
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  return new URL(raw.replace(/^\/+/, ""), `${siteOrigin}/`).toString();
}

function assetUrl(value) {
  return publicAssetUrl(value || defaultImage);
}

function sitePath(...parts) {
  return parts.filter(Boolean).map((part) => String(part).replace(/^\/+|\/+$/g, "")).join("/");
}

function pageUrl(relativePath) {
  return `${siteOrigin}/${relativePath.replace(/^\/+/, "").replace(/index\.html$/, "")}`;
}

function localPath(relativePath) {
  return path.join(root, relativePath);
}

function writeFile(relativePath, content) {
  const target = localPath(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function compactDescription(parts, fallback) {
  const value = ensureArray(parts)
    .map((part) => text(stripMarkdown(part)))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return value || fallback;
}

function truncate(value, maxLength = 220) {
  const clean = text(stripMarkdown(value)).replace(/\s+/g, " ");
  if (clean.length <= maxLength) {
    return clean;
  }
  const shortened = clean
    .slice(0, maxLength - 1)
    .replace(/\s+\S*$/, "")
    .replace(/\s+(?:and|or|with|of|the|a|an|to|in|for|by)$/i, "")
    .replace(/[,\s;:]+$/g, "");
  return /[.!?]$/.test(shortened) ? shortened : `${shortened}.`;
}

function artistUrl(artist) {
  return pageUrl(sitePath("artists", artist.slug, "index.html"));
}

function releaseUrl(release) {
  return pageUrl(sitePath("releases", release.slug, "index.html"));
}

function pressUrl(artist) {
  return pageUrl(sitePath("press", artist.slug, "index.html"));
}

function relativeArtistPath(artist) {
  return sitePath("artists", artist.slug, "index.html");
}

function relativeReleasePath(release) {
  return sitePath("releases", release.slug, "index.html");
}

function relativePressPath(artist) {
  return sitePath("press", artist.slug, "index.html");
}

function imageForArtist(artist) {
  return artist.image || defaultImage;
}

function imageForRelease(release, artist) {
  return release.cover || (artist && artist.image) || defaultImage;
}

function safeAccent(value) {
  const raw = text(value, "#ffcc00");
  return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(raw) ? raw : "#ffcc00";
}

function releaseDateValue(release) {
  const raw = text(release && release.releaseDate);
  const parsed = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizedReleaseDate(release) {
  const raw = text(release && release.releaseDate);
  const match = raw.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);

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

function releaseDateLabel(release) {
  const date = text(release && release.releaseDate);
  if (!date) {
    return "";
  }

  const parsed = Date.parse(date);
  if (!Number.isFinite(parsed)) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(parsed));
}

function releaseType(release) {
  return /single/i.test(text(release && release.type)) ? "MusicRecording" : "MusicAlbum";
}

function releaseStatus(release) {
  return text(release && release.status, "catalog").toLowerCase();
}

function generatedReleaseStatus(release) {
  const status = releaseStatus(release);
  const releaseDate = normalizedReleaseDate(release);
  const datedStatuses = new Set(["", "live", "upcoming", "scheduled", "announced"]);

  if (releaseDate && datedStatuses.has(status)) {
    return releaseDate <= generatedAt ? "live" : "upcoming";
  }

  return status;
}

function releaseStatusLabel(release) {
  const status = generatedReleaseStatus(release);
  if (status === "upcoming") {
    return "Forthcoming";
  }
  if (status === "live") {
    return "Out Now";
  }
  return "Catalog Note";
}

function releaseSortDescending(first, second) {
  return releaseDateValue(second) - releaseDateValue(first) || text(first.title).localeCompare(text(second.title));
}

function releaseSortAscending(first, second) {
  return releaseDateValue(first) - releaseDateValue(second) || text(first.title).localeCompare(text(second.title));
}

function splitReleaseGroups(releases) {
  const list = ensureArray(releases);
  return {
    upcoming: list.filter((release) => generatedReleaseStatus(release) === "upcoming").sort(releaseSortAscending),
    live: list.filter((release) => generatedReleaseStatus(release) === "live").sort(releaseSortDescending),
    catalog: list.filter((release) => !["upcoming", "live"].includes(generatedReleaseStatus(release))).sort(releaseSortDescending)
  };
}

function featuredReleaseForArtist(artist, releases) {
  const list = ensureArray(releases);
  const featuredSlug = text(artist && artist.featuredReleaseSlug);
  if (featuredSlug) {
    const selected = list.find((release) => release.slug === featuredSlug);
    if (selected) {
      return selected;
    }
  }

  const groups = splitReleaseGroups(list);
  return groups.upcoming[0] || groups.live[0] || list.find((release) => text(release.cover)) || list[0] || null;
}

function releaseAction(release) {
  const url = releaseListenUrl(release);
  if (!url) {
    return null;
  }
  return {
    label: generatedReleaseStatus(release) === "upcoming" ? "Pre-save / Listen" : "Listen Now",
    url
  };
}

function releaseMeta(release) {
  const trackCount = ensureArray(release && release.tracks).length;
  return [
    text(release && release.type, "Release"),
    releaseDateLabel(release) || text(release && release.year),
    trackCount ? `${trackCount} ${trackCount === 1 ? "track" : "tracks"}` : ""
  ].filter(Boolean);
}

function sameAsLinks(data) {
  return ensureArray(data.label && data.label.socialLinks)
    .map((link) => text(link && link.url))
    .filter((url) => /^https?:\/\//i.test(url));
}

function organizationSchema(data) {
  return {
    "@type": "Organization",
    "@id": `${siteOrigin}/#organization`,
    name: "Pawn Island Records",
    alternateName: "Pawn Island",
    url: `${siteOrigin}/`,
    logo: absoluteUrl("assets/brand/pawnisland-512.jpg"),
    image: assetUrl(defaultImage),
    founder: {
      "@id": `${siteOrigin}/about.html#matthew-h-freeman`
    },
    description: "Independent creative music imprint building a genre-fluid catalog around original lyrics, atmosphere, story, and human-directed project identities.",
    sameAs: sameAsLinks(data)
  };
}

function founderSchema() {
  return {
    "@type": "Person",
    "@id": `${siteOrigin}/about.html#matthew-h-freeman`,
    name: founderName,
    alternateName: founderAliases,
    url: `${siteOrigin}/about.html`,
    affiliation: {
      "@id": `${siteOrigin}/#organization`
    },
    jobTitle: "Founder, songwriter, and creative director"
  };
}

function graph(data, items) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(data), founderSchema(), ...ensureArray(items)].filter(Boolean)
  };
}

function loadCopyResource() {
  const fallback = {
    version: 1,
    label: {},
    projects: {},
    releases: {}
  };

  if (!fs.existsSync(copyResourcePath)) {
    return fallback;
  }

  try {
    return {
      ...fallback,
      ...JSON.parse(fs.readFileSync(copyResourcePath, "utf8"))
    };
  } catch (error) {
    throw new Error(`Unable to read ${path.relative(root, copyResourcePath)}: ${error.message}`);
  }
}

function projectCopyFor(copyResource, artist) {
  const entry = copyResource.projects && copyResource.projects[artist.slug] ? copyResource.projects[artist.slug] : {};
  const bioParagraphs = ensureArray(entry.bio).map(stripMarkdown).filter(Boolean);
  const hooks = ensureArray(entry.storyAngles).map(stripMarkdown).filter(Boolean);
  const emotionalLines = ensureArray(entry.emotionalLane).map(stripMarkdown).filter(Boolean);

  return {
    identity: text(entry.identity, artist.headline || artist.summary),
    lane: text(entry.lane, artist.lane || "Independent project"),
    summary: text(entry.summary, artist.summary || artist.headline),
    bioParagraphs: bioParagraphs.length ? bioParagraphs : [text(artist.story || artist.pressBio || artist.summary)],
    pressBio: text(entry.pressBio, artist.pressBio || artist.summary),
    hooks,
    emotionalLines,
    playlistDescription: text(entry.playlistDescription)
  };
}

function releaseCopyFor(copyResource, release) {
  if (!release) {
    return {
      description: "",
      inside: [],
      cta: ""
    };
  }

  const entry = copyResource.releases && copyResource.releases[release.slug] ? copyResource.releases[release.slug] : {};

  return {
    description: text(entry.description, release.description),
    inside: ensureArray(entry.inside).map(stripMarkdown).filter(Boolean),
    cta: text(entry.cta)
  };
}

function labelMarketingCopy(copyResource) {
  const label = copyResource.label || {};
  return {
    mission: text(label.mission, "Pawn Island Records is an independent creative music imprint built around genre-fluid project identities."),
    labelBio: ensureArray(label.bio).map(stripMarkdown).filter(Boolean),
    founderStory: ensureArray(label.founderStory).map(stripMarkdown).filter(Boolean),
    process: text(label.process)
  };
}

function navMarkup() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/roster.html", label: "Roster" },
    { href: "/artists/", label: "Projects" },
    { href: "/releases/", label: "Releases" },
    { href: "/connect.html", label: "Connect" },
    { href: "/about.html", label: "About" }
  ];

  return `<header class="label-header" aria-label="Site header">
          <a class="brand-mark" href="/" aria-label="Pawn Island Records home">
            <img src="/assets/brand/pawnisland-256.jpg" alt="" width="64" height="64" loading="eager" decoding="async" />
            <span class="brand-mark__copy">
              <strong>Pawn Island Records</strong>
              <span>Independent imprint</span>
            </span>
          </a>
          <nav class="label-nav" aria-label="Primary" style="--label-nav-columns: ${links.length}">
${links.map((link) => `            <a href="${escapeAttr(link.href)}">${escapeHtml(link.label)}</a>`).join("\n")}
          </nav>
        </header>`;
}

function layout({ title, description, canonical, image, body, structuredData, ogType = "website" }) {
  const pageTitle = `${title} | Pawn Island Records`;
  const fullDescription = truncate(description);
  const fullImage = assetUrl(image || defaultImage);
  const json = JSON.stringify(structuredData, null, 2).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeAttr(fullDescription)}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    <meta name="robots" content="index,follow" />
    <meta property="og:site_name" content="Pawn Island Records" />
    <meta property="og:type" content="${escapeAttr(ogType)}" />
    <meta property="og:title" content="${escapeAttr(pageTitle)}" />
    <meta property="og:description" content="${escapeAttr(fullDescription)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    <meta property="og:image" content="${escapeAttr(fullImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(pageTitle)}" />
    <meta name="twitter:description" content="${escapeAttr(fullDescription)}" />
    <meta name="twitter:image" content="${escapeAttr(fullImage)}" />
    <link rel="icon" type="image/jpeg" sizes="48x48" href="/assets/brand/pawnisland-048.jpg" />
    <link rel="apple-touch-icon" sizes="512x512" href="/assets/brand/pawnisland-512.jpg" />
    <link rel="stylesheet" href="/label-site.css" />
    <script type="application/ld+json">${json}</script>
  </head>
  <body data-page="seo">
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="label-page">
      ${navMarkup()}
      <main class="label-main" id="main">
        <section class="panel-shell seo-page-shell">
          ${body}
        </section>
      </main>
    </div>
  </body>
</html>
`;
}

function ctaLink(href, label, modifier = "button--ghost") {
  const url = text(href);
  const external = /^https?:\/\//i.test(url) && !url.startsWith(siteOrigin);
  const target = external ? ' target="_blank" rel="noreferrer"' : "";
  return `<a class="button ${modifier}" href="${escapeAttr(url)}"${target}>${escapeHtml(label)}</a>`;
}

function actionRow(links, modifier = "") {
  const items = ensureArray(links).filter(Boolean);
  if (!items.length) {
    return "";
  }
  return `<div class="action-row${modifier ? ` ${escapeAttr(modifier)}` : ""}">
${items.map((item) => `              ${item}`).join("\n")}
            </div>`;
}

function breadcrumb(items) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb">
${items.map((item, index) => {
  const isLast = index === items.length - 1;
  return isLast
    ? `          <span>${escapeHtml(item.label)}</span>`
    : `          <a href="${escapeAttr(item.href)}">${escapeHtml(item.label)}</a><span aria-hidden="true">/</span>`;
}).join("\n")}
        </nav>`;
}

function imageMarkup(src, alt, className = "", options = {}) {
  const loading = text(options.loading, "lazy");
  const decoding = text(options.decoding, "async");
  const fetchPriority = text(options.fetchpriority);
  return `<img${className ? ` class="${escapeAttr(className)}"` : ""} src="${escapeAttr(assetUrl(src))}" alt="${escapeAttr(alt)}" width="900" height="900" loading="${escapeAttr(loading)}" decoding="${escapeAttr(decoding)}"${fetchPriority ? ` fetchpriority="${escapeAttr(fetchPriority)}"` : ""} />`;
}

function tagList(items) {
  const tags = ensureArray(items).map(text).filter(Boolean);
  if (!tags.length) {
    return "";
  }
  return `<div class="seo-tag-list">
${tags.map((item) => `              <span>${escapeHtml(item)}</span>`).join("\n")}
            </div>`;
}

function platformLabelFromUrl(url) {
  const value = text(url).toLowerCase();
  if (value.includes("spotify.com")) {
    return "Spotify";
  }
  if (value.includes("youtube.com") || value.includes("youtu.be")) {
    return "YouTube";
  }
  if (value.includes("too.fm")) {
    return "Campaign Link";
  }
  if (value.includes("soundcloud.com")) {
    return "SoundCloud";
  }
  if (value.includes("music.apple.com")) {
    return "Apple Music";
  }
  return "Listen";
}

function releasePlatformLinks(release) {
  const links = [];
  const seen = new Set();

  function add(label, url) {
    const resolved = text(url);
    if (!resolved || seen.has(resolved)) {
      return;
    }
    seen.add(resolved);
    links.push({
      label: text(label, platformLabelFromUrl(resolved)),
      url: resolved
    });
  }

  ensureArray(release && release.platforms).forEach((platform) => add(platform && platform.label, platform && platform.url));
  add("Spotify", release && release.spotify && release.spotify.url);
  add(generatedReleaseStatus(release) === "upcoming" ? "Pre-save" : "Campaign", release && (release.tooFmUrl || release.toofmUrl || release.campaignUrl));
  return links;
}

function pressAssetTypeLabel(asset) {
  const type = text(asset && asset.type, "asset").toLowerCase();
  if (type === "image" || type === "photo") {
    return "Image";
  }
  if (type === "logo") {
    return "Logo";
  }
  if (type === "audio") {
    return "Audio";
  }
  if (type === "note") {
    return "Note";
  }
  return "Asset";
}

function pressAssetMeta(asset) {
  return [
    pressAssetTypeLabel(asset),
    text(asset && asset.usage),
    text(asset && asset.credit) ? `Credit: ${text(asset.credit)}` : ""
  ].filter(Boolean).join(" / ");
}

function pressAssetHref(asset) {
  return text(asset && (asset.url || asset.path));
}

function renderPressAssetGrid(assets) {
  const list = ensureArray(assets).filter(Boolean);
  if (!list.length) {
    return `<p>No public press assets are listed yet. Use the press contact for current campaign materials.</p>`;
  }

  return `<div class="seo-platform-grid">
${list.map((asset) => {
  const href = pressAssetHref(asset);
  const assetLink = href ? assetUrl(href) : `mailto:${contactEmail}`;
  return `                <a class="seo-platform-card" href="${escapeAttr(assetLink)}"${href ? ' target="_blank" rel="noreferrer"' : ""}>
                  <span>${escapeHtml(pressAssetTypeLabel(asset))}</span>
                  <strong>${escapeHtml(text(asset.label, "Approved press asset"))}</strong>
                  <em>${escapeHtml(pressAssetMeta(asset) || "Approved for public EPK use")}</em>
                </a>`;
}).join("\n")}
              </div>`;
}

function artistPlaylistMatches(data, artist) {
  const playlists = ensureArray(data.label && data.label.discoveryPlaylists);
  const projectKey = normalizeCopyKey(artist.name);
  const slugParts = text(artist.slug).split("-").filter((part) => part.length > 3);

  return playlists
    .filter((playlist) => {
      const haystack = normalizeCopyKey(`${playlist.title || ""} ${playlist.description || ""} ${playlist.category || ""}`);
      return haystack.includes(projectKey) || slugParts.some((part) => haystack.includes(part));
    })
    .slice(0, 4);
}

function releaseCardMarkup(release, artist, releaseCopy, index) {
  const action = releaseAction(release);
  const copy = releaseCopy || {};
  const description = text(copy.description, release.description);
  return `<article class="seo-release-card">
              <a class="seo-release-card__cover" href="/releases/${escapeAttr(release.slug)}/" aria-label="Open ${escapeAttr(release.title)} release page">
                ${imageMarkup(imageForRelease(release, artist), `${release.title} cover artwork`)}
              </a>
              <div class="seo-release-card__body">
                <p class="seo-card-kicker">${escapeHtml(releaseStatusLabel(release))}</p>
                <h3><a href="/releases/${escapeAttr(release.slug)}/">${escapeHtml(release.title)}</a></h3>
                <p class="seo-release-card__meta">${escapeHtml(releaseMeta(release).join(" / "))}</p>
                <p>${escapeHtml(description)}</p>
                ${actionRow([
                  action ? ctaLink(action.url, action.label, "button--toofm button--small") : "",
                  ctaLink(`/releases/${release.slug}/`, "Release Page", "button--ghost button--small")
                ])}
              </div>
            </article>`;
}

function releaseGroupId(artist, title) {
  return normalizeCopyKey(`${artist.slug}-${title}`);
}

function sectionNavMarkup(label, sections) {
  const links = ensureArray(sections).filter((section) => section && section.href && section.label);
  if (!links.length) {
    return "";
  }

  return `<nav class="seo-section-nav" aria-label="${escapeAttr(label)}">
${links.map((section) => `              <a href="${escapeAttr(section.href)}">${escapeHtml(section.label)}</a>`).join("\n")}
            </nav>`;
}

function renderReleaseGroup(title, releases, artist, copyStack) {
  if (!releases.length) {
    return "";
  }

  const groupId = releaseGroupId(artist, title);
  return `<section class="seo-artist-section" aria-labelledby="${escapeAttr(groupId)}">
            <div class="seo-section-heading">
              <p class="section-kicker">${escapeHtml(title)}</p>
              <h2 id="${escapeAttr(groupId)}">${escapeHtml(title)}</h2>
            </div>
            <div class="seo-release-grid">
${releases.map((release, index) => releaseCardMarkup(release, artist, releaseCopyFor(copyStack, release, artist), index)).join("\n")}
            </div>
          </section>`;
}

function artistSchema(data, artist, releases, projectCopy) {
  return {
    "@type": "MusicGroup",
    "@id": `${artistUrl(artist)}#project`,
    name: artist.name,
    url: artistUrl(artist),
    image: assetUrl(imageForArtist(artist)),
    description: text(projectCopy && (projectCopy.pressBio || projectCopy.summary), artist.pressBio || artist.story || artist.summary),
    genre: text(projectCopy && projectCopy.lane, artist.lane),
    memberOf: {
      "@id": `${siteOrigin}/#organization`
    },
    album: releases.slice(0, 12).map((release) => ({
      "@type": releaseType(release),
      name: release.title,
      url: releaseUrl(release),
      datePublished: text(release.releaseDate),
      image: assetUrl(imageForRelease(release, artist))
    }))
  };
}

function releaseSchema(data, release, artist, releaseCopy) {
  return {
    "@type": releaseType(release),
    "@id": `${releaseUrl(release)}#release`,
    name: release.title,
    url: releaseUrl(release),
    image: assetUrl(imageForRelease(release, artist)),
    byArtist: artist
      ? {
          "@type": "MusicGroup",
          name: artist.name,
          url: artistUrl(artist)
        }
      : undefined,
    recordLabel: {
      "@id": `${siteOrigin}/#organization`
    },
    datePublished: text(release.releaseDate),
    description: text(releaseCopy && releaseCopy.description, release.description),
    potentialAction: releaseListenUrl(release)
      ? {
          "@type": "ListenAction",
          target: releaseListenUrl(release)
        }
      : undefined
  };
}

function renderArtistPage(data, artist, releases, artistLookup, copyStack) {
  const projectCopy = projectCopyFor(copyStack, artist);
  const sortedReleases = [...ensureArray(releases)].sort(releaseSortDescending);
  const groups = splitReleaseGroups(sortedReleases);
  const featuredRelease = featuredReleaseForArtist(artist, sortedReleases);
  const featuredCopy = releaseCopyFor(copyStack, featuredRelease, artist);
  const featuredAction = releaseAction(featuredRelease);
  const playlists = artistPlaylistMatches(data, artist);
  const releaseCount = sortedReleases.length;
  const pressReady = isEpkReady(artist, data);
  const description = compactDescription([
    projectCopy.identity,
    projectCopy.summary,
    projectCopy.lane ? `Lane: ${projectCopy.lane}.` : ""
  ], `Official Pawn Island Records project page for ${artist.name}.`);
  const heroImage = imageForArtist(artist) || (featuredRelease && imageForRelease(featuredRelease, artist));
  const releaseSectionLinks = [
    groups.upcoming.length ? { href: `#${releaseGroupId(artist, "Forthcoming")}`, label: "Forthcoming" } : null,
    groups.live.length ? { href: `#${releaseGroupId(artist, "Out Now")}`, label: "Out Now" } : null,
    groups.catalog.length ? { href: `#${releaseGroupId(artist, "Catalog Notes")}`, label: "Catalog" } : null
  ].filter(Boolean);
  const pageSections = [
    featuredRelease ? { href: "#feature-release-title", label: "Feature" } : null,
    { href: "#project-story-title", label: "Story" },
    ...releaseSectionLinks,
    { href: "#listen-watch-title", label: "Listen" },
    { href: "#press-contact-title", label: pressReady ? "Press Kit" : "Press" }
  ].filter(Boolean);
  const body = `${breadcrumb([{ href: "/", label: "Home" }, { href: "/artists/", label: "Projects" }, { label: artist.name }])}
          <article class="seo-artist-page" style="--project-accent: ${escapeAttr(safeAccent(artist.accent))};">
            <section class="seo-artist-hero" aria-labelledby="project-title">
              <div class="seo-artist-copy">
                <p class="section-kicker">Catalog Project</p>
                <h1 id="project-title">${escapeHtml(artist.name)}</h1>
                <p class="seo-artist-identity">${escapeHtml(projectCopy.identity)}</p>
                <p class="seo-artist-summary">${escapeHtml(projectCopy.summary)}</p>
                ${tagList([
                  text(projectCopy.lane, "Independent project"),
                  `${releaseCount} ${releaseCount === 1 ? "release" : "releases"}`,
                  pressReady ? "Press kit public" : "Press by request"
                ])}
                ${actionRow([
                  featuredAction ? ctaLink(featuredAction.url, featuredAction.label, "button--primary") : "",
                  featuredRelease ? ctaLink(`/releases/${featuredRelease.slug}/`, "Latest Release") : "",
                  pressReady ? ctaLink(`/press/${artist.slug}/`, "Press Kit") : ctaLink(`mailto:${contactEmail}`, "Request Press Info"),
                  ctaLink("/artists/", "All Projects")
                ])}
                ${sectionNavMarkup(`${artist.name} page sections`, pageSections)}
              </div>
              <figure class="seo-artist-visual">
                ${imageMarkup(heroImage, `${artist.name} project artwork`, "", { loading: "eager", fetchpriority: "high" })}
                <figcaption>${escapeHtml(
                  featuredRelease
                    ? `${featuredRelease.title} currently anchors the ${artist.name} catalog page.`
                    : `${artist.name} will expand as more release context is confirmed.`
                )}</figcaption>
              </figure>
            </section>

            ${
              featuredRelease
                ? `<section class="seo-feature-release" aria-labelledby="feature-release-title">
              <div class="seo-feature-release__art">
                ${imageMarkup(imageForRelease(featuredRelease, artist), `${featuredRelease.title} cover artwork`, "", { loading: "eager" })}
              </div>
              <div class="seo-feature-release__copy">
                <p class="section-kicker">${escapeHtml(releaseStatusLabel(featuredRelease))}</p>
                <h2 id="feature-release-title">${escapeHtml(featuredRelease.title)}</h2>
                <p class="seo-release-card__meta">${escapeHtml(releaseMeta(featuredRelease).join(" / "))}</p>
                <p>${escapeHtml(text(featuredCopy.description, featuredRelease.description))}</p>
                ${featuredCopy.inside.length ? `<p>${escapeHtml(featuredCopy.inside[0])}</p>` : ""}
                ${actionRow([
                  featuredAction ? ctaLink(featuredAction.url, featuredAction.label, "button--primary") : "",
                  ctaLink(`/releases/${featuredRelease.slug}/`, "Release Page")
                ])}
              </div>
            </section>`
                : `<section class="seo-feature-release" aria-labelledby="feature-release-title">
              <div class="seo-feature-release__copy">
                <p class="section-kicker">Release Context</p>
                <h2 id="feature-release-title">Catalog details coming into focus</h2>
                <p>This project page is prepared for release artwork, listening links, and campaign details as soon as they are approved.</p>
                ${actionRow([ctaLink(`mailto:${contactEmail}`, "Request Current Info", "button--primary")])}
              </div>
            </section>`
            }

            <section class="seo-artist-section seo-artist-story" aria-labelledby="project-story-title">
              <div class="seo-section-heading">
                <p class="section-kicker">Project Identity</p>
                <h2 id="project-story-title">World and Sound</h2>
              </div>
              <div class="seo-copy-columns">
                <div>
${projectCopy.bioParagraphs.slice(0, 3).map((paragraph) => `                  <p>${escapeHtml(paragraph)}</p>`).join("\n")}
                </div>
                <aside class="seo-context-list" aria-label="${escapeAttr(artist.name)} story angles">
                  <h3>Story Angles</h3>
                  ${
                    projectCopy.hooks.length
                      ? `<ul>${projectCopy.hooks.slice(0, 5).map((hook) => `<li>${escapeHtml(hook)}</li>`).join("")}</ul>`
                      : `<p>${escapeHtml(text(artist.industryPitch, "More project context is available by request."))}</p>`
                  }
                </aside>
              </div>
            </section>

            ${renderReleaseGroup("Forthcoming", groups.upcoming, artist, copyStack)}
            ${renderReleaseGroup("Out Now", groups.live, artist, copyStack)}
            ${renderReleaseGroup("Catalog Notes", groups.catalog, artist, copyStack)}

            <section class="seo-artist-section" aria-labelledby="listen-watch-title">
              <div class="seo-section-heading">
                <p class="section-kicker">Listen / Watch</p>
                <h2 id="listen-watch-title">Project Paths</h2>
              </div>
              <div class="seo-platform-grid">
                ${
                  featuredRelease
                    ? releasePlatformLinks(featuredRelease).slice(0, 4).map((link) => `
                <a class="seo-platform-card" href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">
                  <span>${escapeHtml(link.label)}</span>
                  <strong>${escapeHtml(featuredRelease.title)}</strong>
                  <em>Open current release path</em>
                </a>`).join("")
                    : ""
                }
                ${playlists.map((playlist) => `
                <a class="seo-platform-card" href="${escapeAttr(playlist.url)}" target="_blank" rel="noreferrer">
                  <span>${escapeHtml(text(playlist.platform, "Playlist"))}</span>
                  <strong>${escapeHtml(playlist.title)}</strong>
                  <em>${escapeHtml(text(playlist.description, "Project playlist"))}</em>
                </a>`).join("")}
                ${
                  !releasePlatformLinks(featuredRelease).length && !playlists.length
                    ? `<article class="seo-platform-card seo-platform-card--empty">
                  <span>Contact</span>
                  <strong>Current links by request</strong>
                  <em>Use the label contact for approved listening paths and release links.</em>
                </article>`
                    : ""
                }
              </div>
            </section>

            <section class="seo-artist-section seo-press-module" aria-labelledby="press-contact-title">
              <div>
                <p class="section-kicker">${pressReady ? "Press Ready" : "Press By Request"}</p>
                <h2 id="press-contact-title">${pressReady ? "Approved press kit" : "Approved materials by request"}</h2>
                <p>${escapeHtml(
                  pressReady
                    ? text(projectCopy.pressBio, `${artist.name} press materials are public-ready.`)
                    : `${artist.name} press materials, credits, and campaign facts are available by request while the public kit is finalized.`
                )}</p>
              </div>
              ${actionRow([
                pressReady ? ctaLink(`/press/${artist.slug}/`, "Open Press Kit", "button--primary") : ctaLink(`mailto:${contactEmail}`, "Email Press", "button--primary"),
                ctaLink("/releases/", "Release Catalog"),
                ctaLink("/roster.html", "Public Roster")
              ])}
            </section>
          </article>`;

  writeFile(relativeArtistPath(artist), layout({
    title: artist.name,
    description,
    canonical: artistUrl(artist),
    image: imageForArtist(artist),
    body,
    ogType: "profile",
    structuredData: graph(data, [
      artistSchema(data, artist, sortedReleases, projectCopy),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteOrigin}/` },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${siteOrigin}/artists/` },
          { "@type": "ListItem", position: 3, name: artist.name, item: artistUrl(artist) }
        ]
      }
    ])
  }));
}

function renderArtistIndex(data, artists, artistLookup, releasesByArtist, copyStack) {
  const labelCopy = labelMarketingCopy(copyStack);
  const body = `${breadcrumb([{ href: "/", label: "Home" }, { label: "Projects" }])}
          <article class="seo-roster-page">
            <section class="seo-roster-hero" aria-labelledby="project-index-title">
              <p class="section-kicker">Official Roster</p>
              <h1 id="project-index-title">Pawn Island Records Projects</h1>
              <p>${escapeHtml(text(labelCopy.labelBio[0], "The official project roster for Pawn Island Records, an independent creative music imprint founded by Matt Freeman."))}</p>
            </section>
            <section class="seo-artist-section" aria-labelledby="project-worlds-title">
              <div class="seo-section-heading">
                <p class="section-kicker">Project Worlds</p>
                <h2 id="project-worlds-title">Catalog Lanes</h2>
              </div>
              <div class="seo-roster-grid">
${artists.map((artist, index) => {
  const releases = ensureArray(releasesByArtist.get(artist.slug)).sort(releaseSortDescending);
  const latest = featuredReleaseForArtist(artist, releases);
  const projectCopy = projectCopyFor(copyStack, artist);
  const releaseCount = releases.length;
  return `                <article class="seo-roster-card" style="--project-accent: ${escapeAttr(safeAccent(artist.accent))};">
                  <a class="seo-roster-card__media" href="/artists/${escapeAttr(artist.slug)}/" aria-label="Open ${escapeAttr(artist.name)} project page">
                    ${imageMarkup(imageForArtist(artist) || (latest && imageForRelease(latest, artist)), `${artist.name} project artwork`)}
                  </a>
                  <div class="seo-roster-card__copy">
                    <p class="seo-card-kicker">Project ${String(index + 1).padStart(2, "0")}</p>
                    <h3><a href="/artists/${escapeAttr(artist.slug)}/">${escapeHtml(artist.name)}</a></h3>
                    <p class="seo-roster-card__lane">${escapeHtml(text(projectCopy.lane, "Independent project"))}</p>
                    <p>${escapeHtml(projectCopy.summary)}</p>
                    ${tagList([
                      `${releaseCount} ${releaseCount === 1 ? "release" : "releases"}`,
                      latest ? `Latest: ${latest.title}` : "Catalog building",
                      isEpkReady(artist, data) ? "Press kit public" : "Press by request"
                    ])}
                    ${actionRow([
                      ctaLink(`/artists/${artist.slug}/`, "Project Page", "button--primary button--small"),
                      latest ? ctaLink(`/releases/${latest.slug}/`, "Latest Release", "button--ghost button--small") : ""
                    ])}
                  </div>
                </article>`;
}).join("\n")}
              </div>
            </section>
          </article>`;

  writeFile("artists/index.html", layout({
    title: "Projects",
    description: "Official Pawn Island Records project roster across electronic pop, hip-hop, singer-songwriter material, country blues, metal, stoner doom, pop-punk, and reflective writing.",
    canonical: `${siteOrigin}/artists/`,
    image: defaultImage,
    body,
    structuredData: graph(data, [
      {
        "@type": "CollectionPage",
        "@id": `${siteOrigin}/artists/#collection`,
        name: "Pawn Island Records Projects",
        url: `${siteOrigin}/artists/`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: artists.map((artist, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: artist.name,
            url: artistUrl(artist)
          }))
        }
      }
    ])
  }));
}

function renderReleaseList(releases, artistLookup, copyStack) {
  if (!releases.length) {
    return "<p>No public releases are listed yet.</p>";
  }

  return `<div class="seo-release-grid seo-release-grid--index">
${releases.map((release, index) => {
  const artist = artistLookup.get(release.artist);
  return releaseCardMarkup(release, artist, releaseCopyFor(copyStack, release, artist), index);
}).join("\n")}
        </div>`;
}

function releaseVisualNavMarkup() {
  return `<nav class="release-header__nav" aria-label="Primary">
            <a href="/index.html">Home</a>
            <a href="/roster.html">Roster</a>
            <a href="/catalog.html">Catalog</a>
            <a href="/connect.html">Connect</a>
            <a href="/about.html">About</a>
            <a href="/epks.html">Press</a>
          </nav>`;
}

function releaseChipMarkup(release) {
  const trackCount = ensureArray(release && release.tracks).length;
  const chips = [
    releaseStatusLabel(release),
    releaseDateLabel(release) ? `${generatedReleaseStatus(release) === "upcoming" ? "Releases" : "Released"} ${releaseDateLabel(release)}` : "",
    text(release && release.type),
    trackCount ? `${trackCount} ${trackCount === 1 ? "track" : "tracks"}` : "",
    ...String(release && release.vibe || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  ].filter(Boolean);

  return chips.map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join("");
}

function releasePrimaryEmbed(release) {
  const configured = text(release && release.primaryEmbedUrl);
  if (configured) {
    return {
      label: text(release && release.primaryEmbedLabel, "Official audio"),
      url: configured
    };
  }

  const spotifyEmbed = text(release && release.spotify && release.spotify.embedUrl);
  if (spotifyEmbed) {
    return {
      label: "Spotify",
      url: spotifyEmbed
    };
  }

  return {
    label: "Official audio",
    url: ""
  };
}

function preferredYoutubeId(release) {
  const direct = text(release && release.youtubeId);
  if (direct) {
    return direct;
  }

  const match = ensureArray(release && release.tracks).find((track) => text(track && track.youtubeId));
  return match ? text(match.youtubeId) : "";
}

function mediaFrameMarkup({ src, title, className, allowFullscreen = false }) {
  if (!src) {
    return "";
  }

  return `<div class="${escapeAttr(className)}">
              <iframe
                src="${escapeAttr(src)}"
                title="${escapeAttr(title)}"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                ${allowFullscreen ? "allowfullscreen" : ""}
              ></iframe>
            </div>`;
}

function releasePrimaryEmbedMarkup(release) {
  const embed = releasePrimaryEmbed(release);
  const action = releaseAction(release);
  return embed.url
    ? mediaFrameMarkup({
        src: embed.url,
        title: `${embed.label || release.title} embed`,
        className: "embed-frame embed-frame--audio"
      })
    : `<div class="embed-empty">
              <p class="eyebrow">Listen</p>
              <p>${escapeHtml(action ? "Open the official release path for the current listen, save, or pre-save destination." : "Official audio links will appear here as soon as they are confirmed.")}</p>
              ${action ? `<a class="action-link action-link--accent" href="${escapeAttr(action.url)}" target="_blank" rel="noreferrer">${escapeHtml(action.label)}</a>` : ""}
            </div>`;
}

function releaseYoutubeEmbedMarkup(release, artist) {
  const youtubeId = preferredYoutubeId(release);
  return youtubeId
    ? mediaFrameMarkup({
        src: `https://www.youtube.com/embed/${youtubeId}`,
        title: `${release.title} by ${artist ? artist.name : "Pawn Island Records"}`,
        className: "embed-frame",
        allowFullscreen: true
      })
    : `<div class="embed-empty">
              <p class="eyebrow">Visual</p>
              <p>No official visual is attached to this release yet. Use the listening path above for the current release destination.</p>
            </div>`;
}

function releaseTracklistMarkup(release) {
  const tracks = ensureArray(release && release.tracks);
  if (!tracks.length) {
    return "";
  }

  return tracks
    .map((track) => {
      const runtime = text(track && track.runtime);
      return `<li><span>${escapeHtml(text(track && track.title, "Untitled track"))}</span>${runtime ? ` <em>${escapeHtml(runtime)}</em>` : ""}</li>`;
    })
    .join("");
}

function releasePlatformStripMarkup(release) {
  const links = releasePlatformLinks(release);
  return links
    .slice(0, 6)
    .map((link) => `
              <a
                class="platform-logo-link"
                href="${escapeAttr(link.url)}"
                target="_blank"
                rel="noreferrer"
                aria-label="${escapeAttr(link.label)}"
                title="${escapeAttr(link.label)}"
              >
                <span class="platform-logo-link__icon" aria-hidden="true"><span>${escapeHtml(link.label.slice(0, 1))}</span></span>
              </a>`)
    .join("");
}

function relatedReleaseCards(data, release, artist) {
  const releases = ensureArray(data && data.releases);
  const sameArtist = releases
    .filter((entry) => entry.artist === release.artist && entry.slug !== release.slug)
    .sort(releaseSortDescending)
    .slice(0, 2);
  const fallback = sameArtist.length
    ? []
    : releases
        .filter((entry) => entry.artist !== release.artist)
        .sort(releaseSortDescending)
        .slice(0, 2);

  return [...sameArtist, ...fallback]
    .map((entry) => {
      const entryArtist = entry.artist === release.artist
        ? artist
        : ensureArray(data && data.artists).find((candidate) => candidate.slug === entry.artist);
      const eyebrow = entry.artist === release.artist && artist ? `More from ${artist.name}` : "From the catalog";

      return `<article class="footer-card">
              <span class="footer-card__eyebrow">${escapeHtml(eyebrow)}</span>
              <h3>${escapeHtml(entry.title)}</h3>
              <p>${escapeHtml(text(entry.description, entryArtist && entryArtist.name))}</p>
              <div class="footer-actions">
                <a class="action-link" href="/releases/${escapeAttr(entry.slug)}/">Open release</a>
              </div>
            </article>`;
    })
    .join("");
}

function releaseExperienceDocument({ release, artist, description, canonical, image, structuredData, ogType, releaseCopy, data }) {
  const pageTitle = `${release.title} | ${artist ? artist.name : "Release"} | Pawn Island Records`;
  const fullDescription = truncate(description);
  const fullImage = assetUrl(image || defaultImage);
  const json = JSON.stringify(structuredData, null, 2).replace(/</g, "\\u003c");
  const listenUrl = releaseListenUrl(release);
  const primaryEmbed = releasePrimaryEmbed(release);
  const youtubeId = preferredYoutubeId(release);
  const tracklist = releaseTracklistMarkup(release);
  const relatedCards = relatedReleaseCards(data, release, artist);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/jpeg" sizes="16x16" href="/assets/brand/pawnisland-016.jpg" />
    <link rel="icon" type="image/jpeg" sizes="48x48" href="/assets/brand/pawnisland-048.jpg" />
    <link rel="icon" type="image/jpeg" sizes="96x96" href="/assets/brand/pawnisland-096.jpg" />
    <link rel="icon" type="image/jpeg" sizes="256x256" href="/assets/brand/pawnisland-256.jpg" />
    <link rel="apple-touch-icon" sizes="512x512" href="/assets/brand/pawnisland-512.jpg" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta id="release-meta-description" name="description" content="${escapeAttr(fullDescription)}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    <meta name="robots" content="index,follow" />
    <meta property="og:site_name" content="Pawn Island Records" />
    <meta property="og:type" content="${escapeAttr(ogType || "music.album")}" />
    <meta property="og:title" content="${escapeAttr(pageTitle)}" />
    <meta property="og:description" content="${escapeAttr(fullDescription)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    <meta property="og:image" content="${escapeAttr(fullImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(pageTitle)}" />
    <meta name="twitter:description" content="${escapeAttr(fullDescription)}" />
    <meta name="twitter:image" content="${escapeAttr(fullImage)}" />
    <script type="application/ld+json">${json}</script>
    <script src="/site-shell-bootstrap.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/release.css" />
    <link rel="stylesheet" href="/site-audio.css" />
  </head>
  <body data-page="release" data-release-slug="${escapeAttr(release.slug)}">
    <a class="skip-link" href="#release-page">Skip to content</a>
    <div class="release-experience">
      <div class="release-experience__backdrop" aria-hidden="true">
        <div class="release-experience__image" id="release-backdrop" style="background-image: url('${escapeAttr(assetUrl(imageForRelease(release, artist)))}')"></div>
        <div class="release-experience__wash"></div>
        <div class="release-experience__grid"></div>
        <div class="release-experience__noise"></div>
        <div class="release-experience__vignette"></div>
        <div class="release-experience__beam"></div>
      </div>

      <main class="release-shell" id="release-page">
        <header class="release-header">
          <a class="brand-lockup" href="/index.html" aria-label="Pawn Island Records home">
            <img src="/assets/brand/pawnisland-256.jpg" alt="Pawn Island Records logo" width="60" height="60" loading="eager" decoding="async" fetchpriority="high" />
            <span class="brand-lockup__copy">
              <strong>Pawn Island</strong>
              <span>Release</span>
            </span>
          </a>
          ${releaseVisualNavMarkup()}
        </header>

        <section class="release-hero reveal is-visible">
          <div class="release-hero__media">
            <div class="release-cover">
              <img id="release-cover" src="${escapeAttr(assetUrl(imageForRelease(release, artist)))}" alt="${escapeAttr(`${release.title} cover art`)}" loading="eager" decoding="async" fetchpriority="high" />
            </div>
          </div>

          <article class="release-hero__content">
            <p class="eyebrow" id="release-kicker">${escapeHtml([releaseStatusLabel(release), releaseDateLabel(release)].filter(Boolean).join(" / ") || "Release")}</p>
            <h1 id="release-title">${escapeHtml(release.title)}</h1>
            <p class="release-hero__artist" id="release-artist">${escapeHtml(artist ? artist.name : "Pawn Island Records")}</p>
            <p class="release-hero__summary" id="release-summary">${escapeHtml(text(releaseCopy.description, release.description))}</p>
            <div class="release-hero__chips" id="release-chips">${releaseChipMarkup(release)}</div>
            <div class="release-hero__actions">
              ${listenUrl ? `<a class="action-link action-link--accent" href="${escapeAttr(listenUrl)}" target="_blank" rel="noreferrer">${escapeHtml(generatedReleaseStatus(release) === "upcoming" ? "Pre-save now" : "Play now")}</a>` : ""}
              ${artist ? `<a class="action-link" id="hero-artist-link" href="/artists/${escapeAttr(artist.slug)}/">Open project page</a>` : `<a class="action-link" id="hero-artist-link" href="/roster.html">Open roster</a>`}
            </div>
            <div class="platform-strip" id="release-platforms">${releasePlatformStripMarkup(release)}</div>
          </article>
        </section>

        <section class="release-media reveal is-visible">
          <article class="glass-panel">
            <p class="eyebrow">Official Audio</p>
            <h2 id="release-embed-heading">${escapeHtml(primaryEmbed.label || "Official audio")}</h2>
            <div id="release-primary-embed">${releasePrimaryEmbedMarkup(release)}</div>
          </article>

          <article class="glass-panel">
            <p class="eyebrow">Visual</p>
            <h2 id="release-video-heading">${escapeHtml(youtubeId ? `${release.title} visual` : "Official visual")}</h2>
            <div id="release-youtube-embed">${releaseYoutubeEmbedMarkup(release, artist)}</div>
          </article>
        </section>

        <section class="release-story reveal is-visible">
          <article class="glass-panel">
            <p class="eyebrow">Release</p>
            <h2 id="release-story-heading">${escapeHtml(`Inside ${release.title}`)}</h2>
            <p class="detail-copy" id="release-description">${escapeHtml(text(releaseCopy.inside[0], text(releaseCopy.description, release.description)))}</p>
            <ol class="tracklist" id="release-tracklist"${tracklist ? "" : " hidden"}>${tracklist}</ol>
          </article>

          <article class="glass-panel glass-panel--artist">
            <p class="eyebrow">Project</p>
            <h2 id="artist-name">${escapeHtml(artist ? artist.name : "Pawn Island Records")}</h2>
            <p class="artist-headline" id="artist-headline">${escapeHtml(text(artist && artist.headline, artist && artist.summary))}</p>
            <p class="detail-copy" id="artist-story">${escapeHtml(text(artist && artist.story, artist && artist.summary))}</p>
            ${artist ? `<a class="inline-link" id="artist-page-link" href="/artists/${escapeAttr(artist.slug)}/">Open project page</a>` : `<a class="inline-link" id="artist-page-link" href="/roster.html">Open roster</a>`}
          </article>
        </section>

        <section class="release-footer reveal is-visible" id="release-footer">
          <div class="release-footer__grid">
            <article class="footer-card">
              <span class="footer-card__eyebrow">Continue</span>
              <h3>${escapeHtml(artist ? artist.name : "Pawn Island Records")}</h3>
              <p>${escapeHtml(text(artist && artist.summary, "Move through the wider Pawn Island Records catalog."))}</p>
              <div class="footer-actions">
                ${artist ? `<a class="action-link" href="/artists/${escapeAttr(artist.slug)}/">Open project page</a>` : ""}
                <a class="action-link" href="/releases/">Full catalog</a>
              </div>
            </article>
            ${relatedCards}
          </div>
        </section>
      </main>
    </div>

    <script src="/public-data.js"></script>
    <script src="/site-ui.js"></script>
    <script src="/release.js"></script>
    <script src="/site-audio-config.js"></script>
    <script src="/site-audio.js"></script>
  </body>
</html>
`;
}

function renderReleasePage(data, release, artist, copyStack) {
  const releaseCopy = releaseCopyFor(copyStack, release, artist);
  const description = compactDescription([
    `${release.title} by ${artist ? artist.name : "Pawn Island Records"}.`,
    releaseDateLabel(release) ? `${generatedReleaseStatus(release) === "upcoming" ? "Releases" : "Released"} ${releaseDateLabel(release)}.` : "",
    releaseCopy.description || release.description,
    "Official Pawn Island Records release page."
  ], `Official Pawn Island Records release page for ${release.title}.`);

  writeFile(relativeReleasePath(release), releaseExperienceDocument({
    title: `${release.title} | ${artist ? artist.name : "Release"}`,
    description,
    canonical: releaseUrl(release),
    image: imageForRelease(release, artist),
    ogType: /single/i.test(text(release.type)) ? "music.song" : "music.album",
    structuredData: graph(data, [
      releaseSchema(data, release, artist, releaseCopy),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteOrigin}/` },
          { "@type": "ListItem", position: 2, name: "Releases", item: `${siteOrigin}/releases/` },
          { "@type": "ListItem", position: 3, name: release.title, item: releaseUrl(release) }
        ]
      }
    ]),
    release,
    artist,
    releaseCopy,
    data
  }));
}

function renderReleaseIndex(data, releases, artistLookup, copyStack) {
  const sortedReleases = [...releases].sort(releaseSortDescending);
  const body = `${breadcrumb([{ href: "/", label: "Home" }, { label: "Releases" }])}
          <article class="seo-roster-page">
            <section class="seo-roster-hero" aria-labelledby="release-index-title">
              <p class="section-kicker">Official Releases</p>
              <h1 id="release-index-title">Pawn Island Records Releases</h1>
              <p>Official release pages for the Pawn Island Records catalog, with project context, artwork, release dates, and current listening paths.</p>
            </section>
            <section class="seo-artist-section" aria-labelledby="release-list-title">
              <div class="seo-section-heading">
                <p class="section-kicker">Catalog</p>
                <h2 id="release-list-title">Releases</h2>
              </div>
              ${renderReleaseList(sortedReleases, artistLookup, copyStack)}
            </section>
          </article>`;

  writeFile("releases/index.html", layout({
    title: "Releases",
    description: "Official Pawn Island Records release catalog with project, release date, listening, and pre-save links.",
    canonical: `${siteOrigin}/releases/`,
    image: defaultImage,
    body,
    structuredData: graph(data, [
      {
        "@type": "CollectionPage",
        "@id": `${siteOrigin}/releases/#collection`,
        name: "Pawn Island Records Releases",
        url: `${siteOrigin}/releases/`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: sortedReleases.map((release, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: release.title,
            url: releaseUrl(release)
          }))
        }
      }
    ])
  }));
}

function renderPressPage(data, artist, releases, copyStack) {
  const projectCopy = projectCopyFor(copyStack, artist);
  const sortedReleases = [...ensureArray(releases)].sort(releaseSortDescending);
  const latest = featuredReleaseForArtist(artist, sortedReleases);
  const assets = approvedPressAssets(artist);
  const description = compactDescription([
    `${artist.name} press kit.`,
    projectCopy.pressBio || artist.pressBio || artist.summary,
    latest ? `Current release context includes ${latest.title}.` : ""
  ], `Official press kit for ${artist.name} at Pawn Island Records.`);
  const body = `${breadcrumb([{ href: "/", label: "Home" }, { href: "/press/", label: "Press" }, { label: artist.name }])}
          <article class="seo-roster-page">
            <section class="seo-release-hero" aria-labelledby="press-title">
              <div class="seo-release-hero__copy">
                <p class="section-kicker">Official Press Kit</p>
                <h1 id="press-title">${escapeHtml(artist.name)} Press Kit</h1>
                <p>${escapeHtml(text(projectCopy.pressBio, artist.pressBio || artist.summary))}</p>
                <p>For press, playlist, booking, or business inquiries, contact Pawn Island Records directly at ${escapeHtml(contactEmail)}.</p>
                ${actionRow([
                  ctaLink(`mailto:${contactEmail}`, "Email Press", "button--primary"),
                  ctaLink(`/epk.html?artist=${artist.slug}&preview=full`, "Visual Kit"),
                  ctaLink(`/artists/${artist.slug}/`, "Project Page"),
                  ctaLink("/press/", "All Press")
                ])}
              </div>
              <figure class="seo-release-hero__art">
                ${imageMarkup(imageForArtist(artist), `${artist.name} press artwork`)}
                <figcaption>${escapeHtml("Approved public press snapshot from verified project data.")}</figcaption>
              </figure>
            </section>
            <section class="seo-artist-section" aria-labelledby="press-releases-title">
              <div class="seo-section-heading">
                <p class="section-kicker">Release Context</p>
                <h2 id="press-releases-title">${escapeHtml(artist.name)} Releases</h2>
              </div>
              ${renderReleaseList(sortedReleases, new Map([[artist.slug, artist]]), copyStack)}
            </section>
            <section class="seo-artist-section" aria-labelledby="press-assets-title">
              <div class="seo-section-heading">
                <p class="section-kicker">Approved Assets</p>
                <h2 id="press-assets-title">Public Kit Files</h2>
              </div>
              ${renderPressAssetGrid(assets)}
            </section>
          </article>`;

  writeFile(relativePressPath(artist), layout({
    title: `${artist.name} Press Kit`,
    description,
    canonical: pressUrl(artist),
    image: imageForArtist(artist),
    body,
    structuredData: graph(data, [
      {
        "@type": "ProfilePage",
        "@id": `${pressUrl(artist)}#press-kit`,
        name: `${artist.name} Press Kit`,
        url: pressUrl(artist),
        mainEntity: artistSchema(data, artist, sortedReleases, projectCopy)
      }
    ])
  }));
}

function renderPressIndex(data, readyArtists, copyStack) {
  const releasesByArtist = new Map();
  ensureArray(data.releases).forEach((release) => {
    const key = text(release && release.artist);
    releasesByArtist.set(key, [...ensureArray(releasesByArtist.get(key)), release]);
  });
  const body = `${breadcrumb([{ href: "/", label: "Home" }, { label: "Press" }])}
          <article class="seo-roster-page">
            <section class="seo-roster-hero" aria-labelledby="press-index-title">
              <p class="section-kicker">Official Press</p>
              <h1 id="press-index-title">Pawn Island Records Press</h1>
              <p>Approved public press snapshots for Pawn Island Records projects. Additional kits and campaign details remain available by direct request.</p>
              ${actionRow([ctaLink(`mailto:${contactEmail}`, "Email Press", "button--primary")])}
            </section>
            <section class="seo-artist-section" aria-labelledby="press-kits-title">
              <div class="seo-section-heading">
                <p class="section-kicker">Kits</p>
                <h2 id="press-kits-title">Public Press Kits</h2>
              </div>
              <div class="seo-roster-grid">
${readyArtists.map((artist, index) => {
  const projectCopy = projectCopyFor(copyStack, artist);
  const releaseCount = ensureArray(releasesByArtist.get(artist.slug)).length;
  const assetCount = approvedPressAssets(artist).length;
  return `                <article class="seo-roster-card" style="--project-accent: ${escapeAttr(safeAccent(artist.accent))};">
                  <a class="seo-roster-card__media" href="/press/${escapeAttr(artist.slug)}/" aria-label="Open ${escapeAttr(artist.name)} press kit">
                    ${imageMarkup(imageForArtist(artist), `${artist.name} press artwork`)}
                  </a>
                  <div class="seo-roster-card__copy">
                    <p class="seo-card-kicker">Press ${String(index + 1).padStart(2, "0")}</p>
                    <h3><a href="/press/${escapeAttr(artist.slug)}/">${escapeHtml(artist.name)} Press Kit</a></h3>
                    <p class="seo-roster-card__lane">${escapeHtml(text(projectCopy.lane, "Independent project"))}</p>
                    <p>${escapeHtml(text(projectCopy.pressBio, artist.pressBio || artist.summary))}</p>
                    <p>${escapeHtml(`${releaseCount} linked ${releaseCount === 1 ? "release" : "releases"} / ${assetCount} approved ${assetCount === 1 ? "asset" : "assets"}`)}</p>
                    ${actionRow([
                      ctaLink(`/press/${artist.slug}/`, "Press Kit", "button--primary button--small"),
                      ctaLink(`/epk.html?artist=${artist.slug}&preview=full`, "Visual Kit", "button--ghost button--small"),
                      ctaLink(`/artists/${artist.slug}/`, "Project Page", "button--ghost button--small")
                    ])}
                  </div>
                </article>`;
}).join("\n")}
              </div>
            </section>
          </article>`;

  writeFile("press/index.html", layout({
    title: "Press",
    description: "Approved public press kit pages for Pawn Island Records projects.",
    canonical: `${siteOrigin}/press/`,
    image: defaultImage,
    body,
    structuredData: graph(data, [
      {
        "@type": "CollectionPage",
        "@id": `${siteOrigin}/press/#collection`,
        name: "Pawn Island Records Press",
        url: `${siteOrigin}/press/`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: readyArtists.map((artist, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${artist.name} Press Kit`,
            url: pressUrl(artist)
          }))
        }
      }
    ])
  }));
}

function sitemapEntry(loc, priority, image) {
  const imageBlock = image
    ? `
    <image:image>
      <image:loc>${escapeHtml(assetUrl(image))}</image:loc>
    </image:image>`
    : "";
  return `  <url>
    <loc>${escapeHtml(loc)}</loc>
    <lastmod>${generatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${imageBlock}
  </url>`;
}

function writeSitemap(data, artists, releases, readyArtists, artistLookup) {
  const entries = [
    sitemapEntry(`${siteOrigin}/`, "1.0", defaultImage),
    sitemapEntry(`${siteOrigin}/roster.html`, "0.9", defaultImage),
    sitemapEntry(`${siteOrigin}/artists/`, "0.9", defaultImage),
    sitemapEntry(`${siteOrigin}/releases/`, "0.9", defaultImage),
    sitemapEntry(`${siteOrigin}/connect.html`, "0.7", defaultImage),
    sitemapEntry(`${siteOrigin}/about.html`, "0.8", defaultImage),
    sitemapEntry(`${siteOrigin}/press/`, "0.6", defaultImage),
    ...artists.map((artist) => sitemapEntry(artistUrl(artist), "0.85", imageForArtist(artist))),
    ...releases.map((release) => {
      const artist = artistLookup.get(release.artist);
      return sitemapEntry(releaseUrl(release), generatedReleaseStatus(release) === "live" ? "0.82" : "0.72", imageForRelease(release, artist));
    }),
    ...readyArtists.map((artist) => sitemapEntry(pressUrl(artist), "0.65", imageForArtist(artist)))
  ];

  writeFile("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join("\n")}
</urlset>
`);
}

function writeLlmsTxt(data, artists, releases, readyArtists, copyStack) {
  const labelCopy = labelMarketingCopy(copyStack);
  const lines = [
    "# Pawn Island Records",
    "",
    "Official site: https://www.pawnislandrecords.com/",
    `Founder and writer: ${founderName}`,
    `Also referenced as: ${founderAliases.join(", ")}`,
    `Description: ${text(labelCopy.labelBio[0], "Pawn Island Records is an independent creative music imprint building a genre-fluid catalog around original lyrics, atmosphere, story, and human-directed project identities.")}`,
    "Contact: pawnisland@outlook.com",
    "",
    "Canonical public pages:",
    "- Home: https://www.pawnislandrecords.com/",
    "- About: https://www.pawnislandrecords.com/about.html",
    "- Roster: https://www.pawnislandrecords.com/roster.html",
    "- Projects: https://www.pawnislandrecords.com/artists/",
    "- Releases: https://www.pawnislandrecords.com/releases/",
    "- Connect: https://www.pawnislandrecords.com/connect.html",
    "",
    "Official project pages:",
    ...artists.map((artist) => {
      const copy = projectCopyFor(copyStack, artist);
      return `- ${artist.name}: ${artistUrl(artist)} - ${text(copy.identity, copy.lane || artist.lane)}`;
    }),
    "",
    "Official release pages:",
    ...releases.map((release) => `- ${release.title}: ${releaseUrl(release)}`),
    "",
    "Approved press pages:",
    ...(readyArtists.length ? readyArtists.map((artist) => `- ${artist.name} Press Kit: ${pressUrl(artist)}`) : ["- None currently public-ready."]),
    "",
    `Last updated: ${generatedAt}`
  ];

  writeFile("llms.txt", `${lines.join("\n")}\n`);
}

function main() {
  const data = loadPublicData();
  const copyStack = loadCopyResource();
  const artists = ensureArray(data.artists);
  const releases = ensureArray(data.releases);
  const artistLookup = new Map(artists.map((artist) => [artist.slug, artist]));
  const releasesByArtist = new Map();

  for (const release of releases) {
    if (!releasesByArtist.has(release.artist)) {
      releasesByArtist.set(release.artist, []);
    }
    releasesByArtist.get(release.artist).push(release);
  }

  const readyArtists = artists.filter((artist) => isEpkReady(artist, data));

  renderArtistIndex(data, artists, artistLookup, releasesByArtist, copyStack);
  renderReleaseIndex(data, releases, artistLookup, copyStack);
  renderPressIndex(data, readyArtists, copyStack);

  for (const artist of artists) {
    renderArtistPage(data, artist, ensureArray(releasesByArtist.get(artist.slug)), artistLookup, copyStack);
  }

  for (const release of releases) {
    renderReleasePage(data, release, artistLookup.get(release.artist), copyStack);
  }

  for (const artist of readyArtists) {
    renderPressPage(data, artist, ensureArray(releasesByArtist.get(artist.slug)), copyStack);
  }

  writeSitemap(data, artists, releases, readyArtists, artistLookup);
  writeLlmsTxt(data, artists, releases, readyArtists, copyStack);

  console.log(`Generated production project pages for ${artists.length} projects, ${releases.length} releases, and ${readyArtists.length} press kit(s).`);
}

main();
