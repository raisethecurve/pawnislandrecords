(function () {
  const ui = window.PAWN_UI || null;
  const fallbackData = window.PAWN_SITE_DATA || window.PAWN_PUBLIC_DATA || {
    label: {
      platformPresets: []
    },
    artists: [],
    releases: []
  };
  const data = (ui && ui.data) || fallbackData;
  const search = new URLSearchParams(window.location.search);
  const releaseSlug = search.get("release");
  const release = ui && ui.getRelease
    ? ui.getRelease(releaseSlug)
    : (data.releases || []).find((entry) => entry.slug === releaseSlug) || null;
  const artist = release && ui && ui.getArtist
    ? ui.getArtist(release.artist)
    : (data.artists || []).find((entry) => entry.slug === (release ? release.artist : "")) || null;
  const page = document.getElementById("release-page");

  // release.js runs without label-site.js (release.html loads release.js instead).
  // The URL helpers below mirror the equivalents in label-site.js intentionally —
  // this file is self-contained so the release page has no dependency on the
  // main renderer bundle.
  function youtubeEmbedUrl(videoId) {
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  function releaseUrl(slug) {
    return `release.html?release=${encodeURIComponent(slug)}`;
  }

  function artistUrl(slug, releaseId) {
    return `artist.html?artist=${encodeURIComponent(slug)}${releaseId ? `&release=${encodeURIComponent(releaseId)}` : ""}`;
  }

  function epkUrl(slug) {
    return `epk.html?artist=${encodeURIComponent(slug)}`;
  }

  function text(value, fallback) {
    const resolved = String(value || "").trim();
    return resolved || String(fallback || "").trim();
  }

  const launchModeValue = text(data.label && data.label.launchMode, "full").toLowerCase();
  const isFullLaunchMode = launchModeValue === "full";

  function showCatalogPage() {
    return isFullLaunchMode;
  }

  function showPressPages() {
    return isFullLaunchMode;
  }

  function showReleasePages() {
    return isFullLaunchMode;
  }

  function publicNavLinks() {
    const links = [
      { href: "index.html", label: "Home" },
      { href: "roster.html", label: "Roster" }
    ];

    if (showCatalogPage()) {
      links.push({ href: "catalog.html", label: "Catalog" });
    }

    links.push({ href: "about.html", label: "About" });

    if (showPressPages()) {
      links.push({ href: "epks.html", label: "Press" });
    }

    return links;
  }

  function renderPrimaryNav() {
    const nav = document.querySelector(".release-header__nav");

    if (!nav) {
      return;
    }

    nav.innerHTML = publicNavLinks()
      .map(
        (link) => `
          <a href="${link.href}">${link.label}</a>
        `
      )
      .join("");
  }

  function splitVibe(text) {
    return String(text || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  function sortReleases(list) {
    return ui && ui.sortReleases ? ui.sortReleases(list) : [...list];
  }

  function releaseStatusValue(entry) {
    return ui && ui.releaseStatusLabel ? ui.releaseStatusLabel(entry) : "Release";
  }

  function releaseAvailability(entry) {
    return ui && ui.releaseAvailabilityText ? ui.releaseAvailabilityText(entry) : "";
  }

  function formatReleaseDateValue(value) {
    return ui && ui.formatReleaseDate ? ui.formatReleaseDate(value) : text(value, "");
  }

  function releaseCampaignUrl(entry) {
    return text(entry && (entry.tooFmUrl || entry.toofmUrl || entry.campaignUrl), "");
  }

  function releaseCta(entry) {
    const url = releaseCampaignUrl(entry);

    if (!url) {
      return null;
    }

    return {
      label: ui && ui.releaseCtaLabel ? ui.releaseCtaLabel(entry) : "Play now",
      url
    };
  }

  function renderNotFound() {
    document.title = "Release Not Found | Pawn Island Records";
    page.innerHTML = `
      <section class="empty-state">
        <p class="eyebrow">Release</p>
        <h2>That release page is not available.</h2>
        <p>Return to the homepage to choose another release from the catalog.</p>
        <a class="action-link" href="index.html">Back to Homepage</a>
      </section>
    `;
  }

  function renderLaunchHoldState(options) {
    const settings = options || {};
    const title = text(settings.title, "Release pages are staying private for launch.");
    const copy = text(
      settings.copy,
      "Fans can still use the live Too.fm links from the homepage and roster while the deeper release copy is being written."
    );
    const descriptionNode = document.getElementById("release-meta-description");

    document.title = `${title} | Pawn Island Records`;

    if (ui && ui.setMetaDescription) {
      ui.setMetaDescription(copy);
    } else if (descriptionNode) {
      descriptionNode.setAttribute("content", copy);
    }

    page.innerHTML = `
      <section class="empty-state">
        <p class="eyebrow">Launch Mode</p>
        <h2>${title}</h2>
        <p>${copy}</p>
        <div class="footer-actions">
          <a class="action-link" href="index.html">Home</a>
          <a class="action-link" href="roster.html">Roster</a>
          <a class="action-link" href="about.html">About</a>
        </div>
      </section>
    `;
  }

  renderPrimaryNav();

  if (!showReleasePages()) {
    renderLaunchHoldState();
    return;
  }

  if (!release || !artist) {
    renderNotFound();
    return;
  }

  const relatedReleases = sortReleases(
    ui && ui.getArtistReleases
      ? ui.getArtistReleases(artist.slug).filter((entry) => entry.slug !== release.slug)
      : (data.releases || []).filter((entry) => entry.artist === artist.slug && entry.slug !== release.slug)
  );

  const releaseCover = document.getElementById("release-cover");
  const releaseKicker = document.getElementById("release-kicker");
  const releaseTitle = document.getElementById("release-title");
  const releaseArtist = document.getElementById("release-artist");
  const releaseSummary = document.getElementById("release-summary");
  const releaseChips = document.getElementById("release-chips");
  const releasePlatforms = document.getElementById("release-platforms");
  const heroArtistLink = document.getElementById("hero-artist-link");
  const releaseEmbedHeading = document.getElementById("release-embed-heading");
  const releasePrimaryEmbed = document.getElementById("release-primary-embed");
  const releaseVideoHeading = document.getElementById("release-video-heading");
  const releaseYoutubeEmbed = document.getElementById("release-youtube-embed");
  const releaseStoryHeading = document.getElementById("release-story-heading");
  const releaseDescription = document.getElementById("release-description");
  const releaseTracklist = document.getElementById("release-tracklist");
  const artistName = document.getElementById("artist-name");
  const artistHeadline = document.getElementById("artist-headline");
  const artistStory = document.getElementById("artist-story");
  const artistPageLink = document.getElementById("artist-page-link");
  const releaseFooter = document.getElementById("release-footer");
  const metaDescription = document.getElementById("release-meta-description");

  function renderPlatforms() {
    const livePlatforms = ui.getLivePlatforms(release);

    releasePlatforms.innerHTML = livePlatforms
      .map(
        (platform) => `
          <a
            class="platform-logo-link"
            href="${platform.url}"
            target="_blank"
            rel="noreferrer"
            aria-label="${platform.label}"
            title="${platform.label}"
          >
            <span class="platform-logo-link__icon" aria-hidden="true">
              ${platform.icon || `<span>${platform.label.slice(0, 1)}</span>`}
            </span>
          </a>
        `
      )
      .join("");

    releasePlatforms.hidden = !livePlatforms.length;
  }

  function renderHero() {
    const availability = releaseAvailability(release);
    const campaignAction = releaseCta(release);
    const chips = [
      releaseStatusValue(release),
      availability,
      release.type,
      release.tracks.length
        ? `${release.tracks.length} ${release.tracks.length === 1 ? "track" : "tracks"}`
        : "",
      ...splitVibe(release.vibe)
    ].filter(Boolean);

    if (ui && ui.assignArtworkImage) {
      ui.assignArtworkImage(releaseCover, {
        src: release.cover,
        title: release.title,
        subtitle: artist.name,
        accent: release.accent || artist.accent,
        alt: `${release.title} cover art`,
        loading: "eager",
        fetchPriority: "high",
        sizes: "(min-width: 960px) 34rem, 92vw"
      });
    } else {
      releaseCover.src = release.cover;
      releaseCover.alt = `${release.title} cover art`;
    }
    releaseKicker.textContent = [
      releaseStatusValue(release),
      formatReleaseDateValue(release.releaseDate)
    ].filter(Boolean).join(" / ") || "Release";
    releaseTitle.textContent = release.title;
    releaseArtist.textContent = artist.name;
    releaseSummary.textContent = release.description || artist.summary || "";
    releaseChips.innerHTML = chips.map((chip) => `<span class="chip">${chip}</span>`).join("");
    heroArtistLink.parentElement.innerHTML = `
      ${
        campaignAction
          ? `
            <a
              class="action-link action-link--accent"
              href="${campaignAction.url}"
              target="_blank"
              rel="noreferrer"
            >
              ${campaignAction.label}
            </a>
          `
          : ""
      }
      <a class="action-link" href="${artistUrl(artist.slug, release.slug)}">Open project page</a>
    `;
    renderPlatforms();
  }

  function renderEmbeds() {
    const primaryEmbed = ui.primaryEmbed(release);
    const youtubeId = ui.preferredYoutubeId(release);

    releaseEmbedHeading.textContent = primaryEmbed.label || "Official audio";
    releaseVideoHeading.textContent = youtubeId ? `${release.title} visual` : "Official visual";

    releasePrimaryEmbed.innerHTML = primaryEmbed.url
      ? `
          <div class="embed-frame embed-frame--audio">
            <iframe
              src="${primaryEmbed.url}"
              title="${primaryEmbed.label || release.title} embed"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            ></iframe>
          </div>
        `
      : `
          <div class="embed-empty">
            <p class="eyebrow">Audio</p>
            <p>Official audio embed ready when a primary embed URL is added to this release.</p>
          </div>
        `;

    releaseYoutubeEmbed.innerHTML = youtubeId
      ? `
          <div class="embed-frame">
            <iframe
              src="${youtubeEmbedUrl(youtubeId)}"
              title="${release.title} by ${artist.name}"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        `
      : `
          <div class="embed-empty">
            <p class="eyebrow">Visual</p>
            <p>Official YouTube embed ready when a release-level video or track video is attached.</p>
          </div>
        `;
  }

  function renderStory() {
    releaseStoryHeading.textContent = `Inside ${release.title}`;
    releaseDescription.textContent = release.description || artist.summary || "";
    releaseTracklist.innerHTML = release.tracks.map((track) => `<li>${track.title}</li>`).join("");
    releaseTracklist.hidden = !release.tracks.length;

    artistName.textContent = artist.name;
    artistHeadline.textContent = artist.headline || artist.summary || "";
    artistStory.textContent = artist.story || artist.summary || "";
    artistPageLink.href = artistUrl(artist.slug, release.slug);
  }

  function renderFooter() {
    // Show up to 3 same-artist releases, then pad with cross-catalog releases if needed.
    const sameArtistCards = relatedReleases.slice(0, 3);
    const needMore = sameArtistCards.length < 1;
    const otherReleases = needMore
      ? (data.releases || [])
          .filter((entry) => entry.artist !== artist.slug && entry.slug !== release.slug)
          .slice(0, 2)
      : [];
    const footerReleases = [...sameArtistCards, ...otherReleases];

    const relatedCards = footerReleases
      .map((entry) => {
        const isSameArtist = entry.artist === artist.slug;
        const eyebrow = isSameArtist
          ? `More from ${artist.name}`
          : "From the catalog";
        const entryArtistName = isSameArtist
          ? artist.name
          : ((data.artists || []).find((a) => a.slug === entry.artist) || {}).name || "Pawn Island Records";

        return `
          <article class="footer-card">
            <span class="footer-card__eyebrow">${eyebrow}</span>
            <h3>${entry.title}</h3>
            <p>${entry.description || (isSameArtist ? artist.summary : entryArtistName) || ""}</p>
            <div class="footer-actions">
              <a class="action-link" href="${releaseUrl(entry.slug)}">Open release</a>
            </div>
          </article>
        `;
      })
      .join("");

    releaseFooter.innerHTML = `
      <div class="release-footer__grid">
        <article class="footer-card">
          <span class="footer-card__eyebrow">Continue</span>
          <h3>${artist.name}</h3>
          <p>${artist.summary || artist.headline || ""}</p>
          <div class="footer-actions">
            <a class="action-link" href="${artistUrl(artist.slug, release.slug)}">Open project page</a>
            <a class="action-link" href="${epkUrl(artist.slug)}">Open press kit</a>
            <a class="action-link" href="catalog.html?artist=${encodeURIComponent(artist.slug)}">Browse ${artist.name} releases</a>
            <a class="action-link" href="catalog.html">\u2190 Full catalog</a>
            ${
              artist.slug === "matt-freeman"
                ? '<a class="action-link" href="about.html">About Matthew</a><a class="action-link" href="process.html">Creative process</a>'
                : ""
            }
          </div>
        </article>
        ${
          relatedCards ||
          `<article class="footer-card">
            <span class="footer-card__eyebrow">Catalog</span>
            <h3>Keep moving through the catalog.</h3>
            <p>Return to the front page to move across the rest of the releases.</p>
            <div class="footer-actions">
              <a class="action-link" href="catalog.html">\u2190 Full catalog</a>
              <a class="action-link" href="index.html">Back to homepage</a>
            </div>
          </article>`
        }
      </div>
    `;
  }

  function setVisualTheme() {
    const accent = (release && release.accent) || (artist && artist.accent) || "#d8c7a1";
    const backdropImage = String((release && release.cover) || (artist && artist.image) || "").trim();

    if (ui && ui.applyExperienceTheme) {
      ui.applyExperienceTheme({
        accent,
        image: backdropImage,
        backdropId: "release-backdrop",
        title: release.title,
        subtitle: artist.name
      });
    }
  }

  function applyMeta() {
    document.title = `${release.title} | ${artist.name} | Pawn Island Records`;

    const metaDescriptionText = [
      `${release.title} by ${artist.name}.`,
      releaseAvailability(release) ? `${releaseAvailability(release)}.` : "",
      release.description || artist.summary || "Explore the release, official embeds, and platform destinations."
    ]
      .filter(Boolean)
      .join(" ");

    if (ui && ui.setMetaDescription) {
      ui.setMetaDescription(metaDescriptionText);
    } else if (metaDescription) {
      metaDescription.setAttribute("content", metaDescriptionText);
    }
  }

  setVisualTheme();
  applyMeta();
  renderHero();
  renderEmbeds();
  renderStory();
  renderFooter();

  if (ui && ui.revealOnScroll) {
    ui.revealOnScroll();
  } else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
  }
})();
