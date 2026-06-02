#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { loadPublicData, releaseListenUrl, isEpkReady } = require("./catalog-data");

const root = path.resolve(__dirname, "..");
const siteOrigin = "https://www.pawnislandrecords.com";
const generatedAt = "2026-05-27";
const founderName = "Matthew H. Freeman";
const founderAliases = ["Matthew Freeman", "Matt Freeman"];
const defaultImage = "assets/brand/pawnisland-1200.jpg";

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
    .map((part) => text(part))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return value || fallback;
}

function truncate(value, maxLength = 220) {
  const clean = text(value).replace(/\s+/g, " ");
  if (clean.length <= maxLength) {
    return clean;
  }
  return `${clean.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}.`;
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

function releaseDateLabel(release) {
  const date = text(release.releaseDate);
  if (!date) {
    return "";
  }
  return date;
}

function releaseType(release) {
  return /single/i.test(text(release.type)) ? "MusicRecording" : "MusicAlbum";
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
    image: absoluteUrl(defaultImage),
    founder: {
      "@id": `${siteOrigin}/about.html#matthew-h-freeman`
    },
    description: "Official independent label and project-world home for music written and built by Matthew H. Freeman.",
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
    jobTitle: "Founder, songwriter, and release-world builder"
  };
}

function graph(data, items) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(data), founderSchema(), ...ensureArray(items)].filter(Boolean)
  };
}

function layout({ title, description, canonical, image, body, structuredData, ogType = "website" }) {
  const pageTitle = `${title} | Pawn Island Records`;
  const fullDescription = truncate(description);
  const fullImage = absoluteUrl(image || defaultImage);
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
      <main class="label-main" id="main">
        <section class="panel-shell">
          ${body}
        </section>
      </main>
    </div>
  </body>
</html>
`;
}

function ctaLink(href, label, modifier = "button--ghost") {
  return `<a class="button ${modifier}" href="${escapeAttr(href)}">${escapeHtml(label)}</a>`;
}

function actionRow(links) {
  const items = ensureArray(links).filter(Boolean);
  return `<div class="action-row">
${items.map((item) => `              ${item}`).join("\n")}
            </div>`;
}

function renderReleaseList(releases, artistLookup) {
  if (!releases.length) {
    return "<p>No public releases are listed yet.</p>";
  }

  return `<ul class="seo-list">
${releases.map((release) => {
  const artist = artistLookup.get(release.artist);
  const meta = [artist && artist.name, release.type, releaseDateLabel(release)].filter(Boolean).join(" / ");
  return `          <li><a href="/releases/${escapeAttr(release.slug)}/">${escapeHtml(release.title)}</a>${meta ? ` <span>${escapeHtml(meta)}</span>` : ""}</li>`;
}).join("\n")}
        </ul>`;
}

function artistSchema(data, artist, releases) {
  return {
    "@type": "MusicGroup",
    "@id": `${artistUrl(artist)}#artist`,
    name: artist.name,
    url: artistUrl(artist),
    image: absoluteUrl(imageForArtist(artist)),
    description: text(artist.pressBio || artist.story || artist.summary),
    genre: text(artist.lane),
    memberOf: {
      "@id": `${siteOrigin}/#organization`
    },
    album: releases.slice(0, 12).map((release) => ({
      "@type": releaseType(release),
      name: release.title,
      url: releaseUrl(release),
      datePublished: text(release.releaseDate),
      image: absoluteUrl(imageForRelease(release, artist))
    }))
  };
}

function releaseSchema(data, release, artist) {
  return {
    "@type": releaseType(release),
    "@id": `${releaseUrl(release)}#release`,
    name: release.title,
    url: releaseUrl(release),
    image: absoluteUrl(imageForRelease(release, artist)),
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
    description: text(release.description),
    potentialAction: releaseListenUrl(release)
      ? {
          "@type": "ListenAction",
          target: releaseListenUrl(release)
        }
      : undefined
  };
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

function writeArtistPage(data, artist, releases, artistLookup) {
  const description = compactDescription([
    `${artist.name} is a Pawn Island Records project.`,
    artist.headline || artist.summary,
    artist.lane ? `Lane: ${artist.lane}.` : ""
  ], `Official Pawn Island Records project page for ${artist.name}.`);
  const body = `${breadcrumb([{ href: "/", label: "Home" }, { href: "/artists/", label: "Artists" }, { label: artist.name }])}
          <article class="about-copy">
            <p class="section-kicker">Official Project</p>
            <h1>${escapeHtml(artist.name)}</h1>
            <p class="about-copy__body"><strong>${escapeHtml(text(artist.lane, "Independent project"))}</strong></p>
            <p class="about-copy__body">${escapeHtml(text(artist.story || artist.summary, description))}</p>
            <p class="about-copy__body">${escapeHtml(artist.name)} is part of Pawn Island Records, the independent label and release-world home founded by ${escapeHtml(founderName)}.</p>
            ${actionRow([
              ctaLink("/roster.html", "View Roster", "button--primary"),
              ctaLink(`/artist.html?artist=${artist.slug}&preview=full`, "Open Visual Page"),
              isEpkReady(artist, data) ? ctaLink(`/press/${artist.slug}/`, "Press Kit") : ""
            ])}
          </article>
          <section class="artist-discography" aria-labelledby="discography-title">
            <div class="rail-header">
              <div>
                <p class="section-kicker">Discography</p>
                <h2 id="discography-title">${escapeHtml(artist.name)} Releases</h2>
              </div>
            </div>
            ${renderReleaseList(releases, artistLookup)}
          </section>`;

  writeFile(relativeArtistPath(artist), layout({
    title: artist.name,
    description,
    canonical: artistUrl(artist),
    image: imageForArtist(artist),
    body,
    ogType: "profile",
    structuredData: graph(data, [
      artistSchema(data, artist, releases),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteOrigin}/` },
          { "@type": "ListItem", position: 2, name: "Artists", item: `${siteOrigin}/artists/` },
          { "@type": "ListItem", position: 3, name: artist.name, item: artistUrl(artist) }
        ]
      }
    ])
  }));
}

function writeReleasePage(data, release, artist) {
  const description = compactDescription([
    `${release.title} by ${artist ? artist.name : "Pawn Island Records"}.`,
    releaseDateLabel(release) ? `Released ${releaseDateLabel(release)}.` : "",
    release.description,
    "Official Pawn Island Records release page."
  ], `Official Pawn Island Records release page for ${release.title}.`);
  const listenUrl = releaseListenUrl(release);
  const body = `${breadcrumb([
    { href: "/", label: "Home" },
    { href: "/releases/", label: "Releases" },
    { label: release.title }
  ])}
          <article class="about-copy">
            <p class="section-kicker">Official Release</p>
            <h1>${escapeHtml(release.title)}</h1>
            <p class="about-copy__body"><strong>${escapeHtml([artist && artist.name, release.type, releaseDateLabel(release)].filter(Boolean).join(" / "))}</strong></p>
            <p class="about-copy__body">${escapeHtml(text(release.description, description))}</p>
            <p class="about-copy__body">Released by Pawn Island Records, the independent label founded by ${escapeHtml(founderName)}.</p>
            ${actionRow([
              listenUrl ? ctaLink(listenUrl, "Listen / Pre-save", "button--primary") : "",
              artist ? ctaLink(`/artists/${artist.slug}/`, `Open ${artist.name}`) : "",
              ctaLink(`/release.html?release=${release.slug}&preview=full`, "Open Visual Page")
            ])}
          </article>
          <aside class="artist-page-visual">
            <img src="/${escapeAttr(imageForRelease(release, artist))}" alt="${escapeAttr(`${release.title} cover artwork`)}" width="800" height="800" loading="lazy" decoding="async" />
          </aside>`;

  writeFile(relativeReleasePath(release), layout({
    title: `${release.title} | ${artist ? artist.name : "Release"}`,
    description,
    canonical: releaseUrl(release),
    image: imageForRelease(release, artist),
    body,
    ogType: /single/i.test(text(release.type)) ? "music.song" : "music.album",
    structuredData: graph(data, [
      releaseSchema(data, release, artist),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteOrigin}/` },
          { "@type": "ListItem", position: 2, name: "Releases", item: `${siteOrigin}/releases/` },
          { "@type": "ListItem", position: 3, name: release.title, item: releaseUrl(release) }
        ]
      }
    ])
  }));
}

function writePressPage(data, artist, releases) {
  const latest = releases[0] || null;
  const description = compactDescription([
    `${artist.name} press kit.`,
    artist.pressBio || artist.summary,
    latest ? `Current release context includes ${latest.title}.` : ""
  ], `Official press kit for ${artist.name} at Pawn Island Records.`);
  const body = `${breadcrumb([{ href: "/", label: "Home" }, { href: "/press/", label: "Press" }, { label: artist.name }])}
          <article class="about-copy">
            <p class="section-kicker">Official Press Kit</p>
            <h1>${escapeHtml(artist.name)} Press Kit</h1>
            <p class="about-copy__body">${escapeHtml(text(artist.pressBio || artist.summary, description))}</p>
            <p class="about-copy__body">For press, playlist, booking, or business inquiries, contact Pawn Island Records directly at pawnisland@outlook.com.</p>
            ${actionRow([
              ctaLink("mailto:pawnisland@outlook.com", "Email Press", "button--primary"),
              ctaLink(`/artists/${artist.slug}/`, "Project Page"),
              ctaLink(`/epk.html?artist=${artist.slug}&preview=full`, "Open Visual Kit")
            ])}
          </article>
          <section class="artist-discography" aria-labelledby="press-releases-title">
            <div class="rail-header">
              <div>
                <p class="section-kicker">Release Context</p>
                <h2 id="press-releases-title">${escapeHtml(artist.name)} Releases</h2>
              </div>
            </div>
            ${renderReleaseList(releases, new Map([[artist.slug, artist]]))}
          </section>`;

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
        mainEntity: artistSchema(data, artist, releases)
      }
    ])
  }));
}

function writeArtistIndex(data, artists, artistLookup, releasesByArtist) {
  const body = `${breadcrumb([{ href: "/", label: "Home" }, { label: "Artists" }])}
          <article class="about-copy">
            <p class="section-kicker">Official Roster</p>
            <h1>Pawn Island Records Artists</h1>
            <p class="about-copy__body">The official project roster for Pawn Island Records, an independent label founded by ${escapeHtml(founderName)}.</p>
          </article>
          <section class="artist-discography" aria-labelledby="artist-index-title">
            <div class="rail-header">
              <div>
                <p class="section-kicker">Projects</p>
                <h2 id="artist-index-title">Project Worlds</h2>
              </div>
            </div>
            <ul class="seo-list">
${artists.map((artist) => {
  const count = ensureArray(releasesByArtist.get(artist.slug)).length;
  return `              <li><a href="/artists/${escapeAttr(artist.slug)}/">${escapeHtml(artist.name)}</a> <span>${escapeHtml(text(artist.lane, "Independent project"))} / ${count} release${count === 1 ? "" : "s"}</span></li>`;
}).join("\n")}
            </ul>
          </section>`;

  writeFile("artists/index.html", layout({
    title: "Artists",
    description: "Official Pawn Island Records artist and project roster, including Rhea Mauro, High Ground, Velvet Orchard, Quiet Filter, Resunant, Matt Freeman, Blackout State, Crick Kinnard, and second watch.",
    canonical: `${siteOrigin}/artists/`,
    image: defaultImage,
    body,
    structuredData: graph(data, [
      {
        "@type": "CollectionPage",
        "@id": `${siteOrigin}/artists/#collection`,
        name: "Pawn Island Records Artists",
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

function writeReleaseIndex(data, releases, artistLookup) {
  const body = `${breadcrumb([{ href: "/", label: "Home" }, { label: "Releases" }])}
          <article class="about-copy">
            <p class="section-kicker">Official Catalog</p>
            <h1>Pawn Island Records Releases</h1>
            <p class="about-copy__body">Official release pages for the Pawn Island Records catalog.</p>
            <div class="action-row">${ctaLink("/catalog.html?preview=full", "Open Visual Catalog", "button--primary")}</div>
          </article>
          <section class="artist-discography" aria-labelledby="release-index-title">
            <div class="rail-header">
              <div>
                <p class="section-kicker">Catalog</p>
                <h2 id="release-index-title">Releases</h2>
              </div>
            </div>
            ${renderReleaseList(releases, artistLookup)}
          </section>`;

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
          itemListElement: releases.map((release, index) => ({
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

function writePressIndex(data, readyArtists) {
  const body = `${breadcrumb([{ href: "/", label: "Home" }, { label: "Press" }])}
          <article class="about-copy">
            <p class="section-kicker">Official Press</p>
            <h1>Pawn Island Records Press</h1>
            <p class="about-copy__body">Approved press kit pages for public-ready Pawn Island Records projects.</p>
          </article>
          <section class="artist-discography" aria-labelledby="press-index-title">
            <div class="rail-header">
              <div>
                <p class="section-kicker">Kits</p>
                <h2 id="press-index-title">Press Kits</h2>
              </div>
            </div>
            <ul class="seo-list">
${readyArtists.map((artist) => `              <li><a href="/press/${escapeAttr(artist.slug)}/">${escapeHtml(artist.name)} Press Kit</a> <span>${escapeHtml(text(artist.lane, "Independent project"))}</span></li>`).join("\n")}
            </ul>
          </section>`;

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
      <image:loc>${escapeHtml(absoluteUrl(image))}</image:loc>
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
      return sitemapEntry(releaseUrl(release), text(release.status).toLowerCase() === "live" ? "0.82" : "0.72", imageForRelease(release, artist));
    }),
    ...readyArtists.map((artist) => sitemapEntry(pressUrl(artist), "0.65", imageForArtist(artist)))
  ];

  writeFile("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join("\n")}
</urlset>
`);
}

function writeLlmsTxt(data, artists, releases, readyArtists) {
  const lines = [
    "# Pawn Island Records",
    "",
    "Official site: https://www.pawnislandrecords.com/",
    `Founder and writer: ${founderName}`,
    `Also referenced as: ${founderAliases.join(", ")}`,
    "Description: Pawn Island Records is an independent label and multi-project release world for music written and built by Matthew H. Freeman.",
    "Contact: pawnisland@outlook.com",
    "",
    "Canonical public pages:",
    "- Home: https://www.pawnislandrecords.com/",
    "- About: https://www.pawnislandrecords.com/about.html",
    "- Roster: https://www.pawnislandrecords.com/roster.html",
    "- Artists: https://www.pawnislandrecords.com/artists/",
    "- Releases: https://www.pawnislandrecords.com/releases/",
    "- Connect: https://www.pawnislandrecords.com/connect.html",
    "",
    "Official project pages:",
    ...artists.map((artist) => `- ${artist.name}: ${artistUrl(artist)} - ${text(artist.lane, "Independent project")}`),
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

  writeArtistIndex(data, artists, artistLookup, releasesByArtist);
  writeReleaseIndex(data, releases, artistLookup);
  writePressIndex(data, readyArtists);

  for (const artist of artists) {
    writeArtistPage(data, artist, ensureArray(releasesByArtist.get(artist.slug)), artistLookup);
  }

  for (const release of releases) {
    writeReleasePage(data, release, artistLookup.get(release.artist));
  }

  for (const artist of readyArtists) {
    writePressPage(data, artist, ensureArray(releasesByArtist.get(artist.slug)));
  }

  writeSitemap(data, artists, releases, readyArtists, artistLookup);
  writeLlmsTxt(data, artists, releases, readyArtists);

  console.log(`Generated SEO artifacts for ${artists.length} artists, ${releases.length} releases, and ${readyArtists.length} press kit(s).`);
}

main();
