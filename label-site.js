(function () {
  const ui = window.PAWN_UI || null;
  const data = (ui && ui.data) || window.PAWN_SITE_DATA || window.PAWN_PUBLIC_DATA || {
    label: {},
    artists: [],
    releases: []
  };

  const DEFAULT_TOOFM_URL = "https://too.fm/yn8xx7l";
  const DEFAULT_HOME_STREAMING_PLATFORMS = [
    "Spotify",
    "YouTube Music",
    "Apple Music",
    "Amazon Music",
    "iHeartRadio",
    "Pandora",
    "QQMusic",
    "Tidal"
  ];
  const DEFAULTS = {
    identityLine:
      "A discovery-led independent label space built for artist identity, direct listening, and clean release worlds.",
    featuredCampaignTitle: "Featured Campaign",
    featuredCampaignSummary:
      "Move from discovery to action through the label's live Too.fm campaign hub.",
    aboutText:
      "Pawn Island Records is an independent label built around distinct project identities, clear release worlds, and direct listening paths. New listeners should be able to move from curiosity to sound without friction, so every page is designed to feel immediate and readable. The label treats every artist as a separate entry point rather than flattening the roster into one generic style. The result is a catalog that feels unified by intent, not sameness.",
    ethos:
      "One label. Many projects. Every release gets enough room to feel intentional.",
    timeline: [
      {
        label: "01",
        title: "Build Distinct Artists",
        text: "Shape each project like its own world instead of forcing the roster into one narrow lane."
      },
      {
        label: "02",
        title: "Release With Clarity",
        text: "Connect every campaign to direct listening, clear artwork, and a focused path out to Too.fm."
      },
      {
        label: "03",
        title: "Keep Discovery Fast",
        text: "Make the catalog easy to browse so new listeners can move naturally from artist to release."
      }
    ]
  };

  const page = document.body.dataset.page || "";
  const artistLookup = new Map((data.artists || []).map((artist) => [artist.slug, artist]));
  const releases = Array.isArray(data.releases) ? [...data.releases] : [];
  const artists = Array.isArray(data.artists) ? [...data.artists] : [];
  const featuredRelease = (ui && ui.getFeaturedRelease && ui.getFeaturedRelease()) || releases[0] || null;

  function text(value, fallback) {
    const resolved = String(value || "").trim();
    return resolved || String(fallback || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isExternalUrl(value) {
    return /^https?:\/\//i.test(text(value, ""));
  }

  function syncViewportHeight() {
    document.documentElement.style.setProperty("--viewport-height", `${window.innerHeight}px`);
  }

  function artistForRelease(release) {
    return release ? artistLookup.get(release.artist) || null : null;
  }

  function latestReleaseForArtist(artistSlug) {
    return artistReleases(artistSlug)[0] || null;
  }

  function artistFilterUrl(artistSlug) {
    return `catalog.html?artist=${encodeURIComponent(artistSlug)}`;
  }

  function artistPageUrl(artistSlug, releaseSlug) {
    return `artist.html?artist=${encodeURIComponent(artistSlug)}${releaseSlug ? `&release=${encodeURIComponent(releaseSlug)}` : ""}`;
  }

  function epkPageUrl(artistSlug) {
    return `epk.html?artist=${encodeURIComponent(artistSlug)}`;
  }

  function artistReleases(artistSlug) {
    if (ui && ui.getArtistReleases) {
      return ui.getArtistReleases(artistSlug);
    }

    return releases.filter((release) => release.artist === artistSlug);
  }

  function releasePageUrl(slug) {
    return `release.html?release=${encodeURIComponent(slug)}`;
  }

  function primaryEmbedFor(release) {
    if (ui && ui.primaryEmbed) {
      return ui.primaryEmbed(release);
    }

    return {
      label: text(release && release.primaryEmbedLabel, ""),
      url: text(release && release.primaryEmbedUrl, "")
    };
  }

  function preferredYoutubeIdFor(release) {
    if (ui && ui.preferredYoutubeId) {
      return ui.preferredYoutubeId(release);
    }

    return text(release && release.youtubeId, "");
  }

  function youtubeEmbedUrl(videoId) {
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  function resolveTooFmUrl(release) {
    return text(
      release && (release.tooFmUrl || release.toofmUrl || release.campaignUrl),
      text(data.label && data.label.defaultTooFmUrl, DEFAULT_TOOFM_URL)
    );
  }

  function campaignUrl() {
    return text(
      data.label &&
        (data.label.featuredCampaignUrl ||
          data.label.campaignUrl ||
          data.label.defaultTooFmUrl),
      DEFAULT_TOOFM_URL
    );
  }

  function playlistUrl() {
    return text(
      data.label &&
        (data.label.catalogPlaylistUrl ||
          data.label.playlistUrl ||
          data.label.catalogPlaylistLink),
      "catalog.html"
    );
  }

  function labelIdentityLine() {
    return text(data.label && data.label.identityLine, DEFAULTS.identityLine);
  }

  function aboutCopy() {
    return text(
      data.label && (data.label.aboutText || data.label.about || data.label.intro),
      DEFAULTS.aboutText
    );
  }

  function aboutEthos() {
    return text(data.label && data.label.ethos, DEFAULTS.ethos);
  }

  function aboutTimeline() {
    const configured = Array.isArray(data.label && data.label.timeline) ? data.label.timeline : [];

    if (!configured.length) {
      return DEFAULTS.timeline;
    }

    return configured.map((item, index) => {
      if (typeof item === "string") {
        return {
          label: String(index + 1).padStart(2, "0"),
          title: item,
          text: ""
        };
      }

      return {
        label: text(item.label, String(index + 1).padStart(2, "0")),
        title: text(item.title || item.heading || item.name, `Step ${index + 1}`),
        text: text(item.text || item.copy || item.description, "")
      };
    });
  }

  function campaignTitle() {
    return text(data.label && data.label.featuredCampaignTitle, DEFAULTS.featuredCampaignTitle);
  }

  function campaignSummary() {
    return text(
      data.label && data.label.featuredCampaignSummary,
      DEFAULTS.featuredCampaignSummary
    );
  }

  function homeStreamingPlatforms() {
    const configured = Array.isArray(data.label && data.label.streamingPlatforms)
      ? data.label.streamingPlatforms.map((label) => text(label, "")).filter(Boolean)
      : [];
    const selected = configured.length ? configured : DEFAULT_HOME_STREAMING_PLATFORMS;

    return selected.map((label) => {
      const definition = ui && ui.getPlatformDefinition ? ui.getPlatformDefinition(label) : null;

      return {
        key: definition
          ? definition.key
          : text(label, "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
        label: definition ? definition.name : label,
        icon: definition ? definition.svg : ""
      };
    });
  }

  function artworkMarkup(source, titleValue, subtitleValue, index) {
    const accent = index % 2 === 0 ? "#ffcc00" : "#4169e1";
    const alt = `${titleValue} artwork`;

    if (ui && ui.artworkImageMarkup) {
      return ui.artworkImageMarkup({
        src: source,
        title: titleValue,
        subtitle: subtitleValue,
        accent,
        alt,
        loading: "lazy"
      });
    }

    return `<img src="${escapeHtml(source)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
  }

  function openAudioDock(options) {
    const settings = options || {};
    const docs = [];

    try {
      if (window.top && window.top.document) {
        docs.push(window.top.document);
      }
    } catch (error) {
      // Ignore top-window access failures.
    }

    docs.push(document);

    let dock = null;
    let toggle = null;

    docs.some((candidate) => {
      dock = candidate.querySelector(".site-audio");
      toggle = candidate.querySelector("[data-audio-toggle]");
      return Boolean(dock || toggle);
    });

    if (!dock && !toggle) {
      return;
    }

    if (settings.play && toggle) {
      const stateText = text(toggle.textContent).toLowerCase();

      if (stateText === "play" || stateText === "resume") {
        toggle.click();
      }
    }

    if (dock && typeof dock.scrollIntoView === "function") {
      try {
        dock.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest"
        });
      } catch (error) {
        dock.scrollIntoView();
      }
    }

    if (toggle && typeof toggle.focus === "function") {
      toggle.focus({ preventScroll: true });
    }
  }

  function bindAudioButtons() {
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-audio-focus]");

      if (!trigger) {
        return;
      }

      event.preventDefault();
      openAudioDock({ play: true });
    });
  }

  function setActiveNav() {
    const pageToHref = {
      home: "index.html",
      artists: "artists.html",
      artist: "artists.html",
      releases: "catalog.html",
      about: "about.html",
      epks: "epks.html",
      epk: "epks.html"
    };
    const activeHref = pageToHref[page];

    if (!activeHref) {
      return;
    }

    document.querySelectorAll(".label-nav a").forEach((link) => {
      const href = (link.getAttribute("href") || "").replace(/\?.*$/, "");

      if (href === activeHref) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function setupScrollFades() {
    const scrollers = document.querySelectorAll(".release-strip, .artist-strip");

    scrollers.forEach((el) => {
      const update = () => {
        const hasRight =
          el.scrollWidth > el.clientWidth + 2 &&
          el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
        const hasLeft = el.scrollLeft > 2;
        el.classList.toggle("has-scroll-right", hasRight);
        el.classList.toggle("has-scroll-left", hasLeft);
      };

      update();
      el.addEventListener("scroll", update, { passive: true });
    });
  }

  function renderHome() {
    const identityLine = document.getElementById("home-identity-line");
    const platformsNode = document.getElementById("home-platforms");
    const playlistLink = document.getElementById("home-playlist-link");
    const featuredReleaseLink = document.getElementById("home-featured-release-link");
    const featureStack = document.getElementById("home-feature-stack");
    const featuredArtist = artistForRelease(featuredRelease);

    if (identityLine) {
      identityLine.textContent = labelIdentityLine();
    }

    if (platformsNode) {
      platformsNode.innerHTML = homeStreamingPlatforms()
        .map(
          (platform) => `
            <div class="platform-chip platform-chip--${escapeHtml(platform.key || "platform")}" aria-label="${escapeHtml(platform.label)}">
              <span class="platform-chip__icon" aria-hidden="true">
                ${platform.icon || `<span>${escapeHtml(platform.label.slice(0, 1))}</span>`}
              </span>
              <span class="platform-chip__label">${escapeHtml(platform.label)}</span>
            </div>
          `
        )
        .join("");
    }

    if (playlistLink) {
      const nextPlaylistUrl = playlistUrl();
      const externalPlaylist = isExternalUrl(nextPlaylistUrl);

      playlistLink.href = nextPlaylistUrl;

      if (externalPlaylist) {
        playlistLink.target = "_blank";
        playlistLink.rel = "noreferrer";
        playlistLink.setAttribute("aria-label", "Open the Pawn Island catalog playlist");
      } else {
        playlistLink.removeAttribute("target");
        playlistLink.removeAttribute("rel");
        playlistLink.setAttribute("aria-label", "Browse the Pawn Island catalog");
      }
    }

    if (featuredReleaseLink && featuredRelease) {
      const featuredReleaseUrl = resolveTooFmUrl(featuredRelease);

      featuredReleaseLink.href = featuredReleaseUrl;
      featuredReleaseLink.target = isExternalUrl(featuredReleaseUrl) ? "_blank" : "_self";
      if (isExternalUrl(featuredReleaseUrl)) {
        featuredReleaseLink.rel = "noreferrer";
      } else {
        featuredReleaseLink.removeAttribute("rel");
      }
      featuredReleaseLink.setAttribute(
        "aria-label",
        `Open ${featuredRelease.title} by ${featuredArtist ? featuredArtist.name : "Pawn Island Records"} on Too.fm`
      );
    }

    if (featureStack) {
      const featureMarkup = featuredRelease
        ? `
          <article class="feature-card feature-card--featured">
            <div class="feature-card__visual">
              ${artworkMarkup(
                featuredRelease.cover,
                featuredRelease.title,
                featuredArtist ? featuredArtist.name : "Featured release",
                0
              )}
            </div>
            <div class="feature-card__body">
              <p class="feature-card__meta">Featured Release</p>
              <h2>${escapeHtml(featuredRelease.title)}</h2>
              <p>${escapeHtml(
                featuredArtist
                  ? `${featuredArtist.name} / ${featuredRelease.type} / ${featuredRelease.year}`
                  : featuredRelease.type
              )}</p>
              <p>${escapeHtml(text(featuredRelease.description, "Step into the current release world."))}</p>
              <div class="feature-card__actions">
                <a
                  class="button button--toofm button--small"
                  href="${escapeHtml(resolveTooFmUrl(featuredRelease))}"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on Too.fm
                </a>
                <a class="button button--ghost button--small" href="${escapeHtml(releasePageUrl(featuredRelease.slug))}">
                  Release Page
                </a>
              </div>
            </div>
          </article>
        `
        : `
          <article class="feature-card">
            <p class="feature-card__meta">Featured Release</p>
            <h2>Catalog In Motion</h2>
            <p>The next release world will appear here as soon as the public catalog is updated.</p>
          </article>
        `;

      featureStack.innerHTML = `
        ${featureMarkup}
        <div class="metric-row" aria-label="Label stats">
          <article class="metric-pill">
            <strong>${artists.length}</strong>
            <span>Artists</span>
          </article>
          <article class="metric-pill">
            <strong>${releases.length}</strong>
            <span>Releases</span>
          </article>
          <article class="metric-pill">
            <strong>${ui && ui.trackCount ? ui.trackCount() : 0}</strong>
            <span>Tracks</span>
          </article>
        </div>
      `;
    }
  }

  function renderArtists() {
    const collection = document.getElementById("artists-collection");

    if (!collection) {
      return;
    }

    collection.innerHTML = artists
      .map((artist, index) => {
        const latestRelease = latestReleaseForArtist(artist.slug);

        return `
          <article class="artist-card">
            <a
              class="artist-card__cover"
              href="${escapeHtml(artistPageUrl(artist.slug, latestRelease && latestRelease.slug))}"
              aria-label="Open ${escapeHtml(artist.name)} artist page"
            >
              ${artworkMarkup(
                "",
                artist.name,
                artist.lane || "Project placeholder",
                index
              )}
            </a>
            <p class="artist-card__index">Project ${String(index + 1).padStart(2, "0")}</p>
            <div>
              <h2>${escapeHtml(artist.name)}</h2>
              <p class="artist-card__genre">${escapeHtml(text(artist.lane, "Independent project"))}</p>
            </div>
            <p class="artist-card__description">
              ${escapeHtml(
                text(
                  artist.summary,
                  latestRelease
                    ? `${artist.name} is currently led by ${latestRelease.title}.`
                    : "Project summary coming into focus."
                )
              )}
            </p>
            <div class="card-actions">
              <a class="button button--ghost button--small" href="${escapeHtml(artistPageUrl(artist.slug, latestRelease && latestRelease.slug))}">
                Artist Page
              </a>
              ${
                latestRelease
                  ? `
                    <a
                      class="button button--toofm button--small"
                      href="${escapeHtml(resolveTooFmUrl(latestRelease))}"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Latest Release
                    </a>
                  `
                  : ""
              }
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderArtistPage() {
    const panel = document.getElementById("artist-page-panel");
    const artistSlug = new URLSearchParams(window.location.search).get("artist");
    const artist = artistSlug ? artistLookup.get(artistSlug) || null : null;

    if (!panel) {
      return;
    }

    if (!artist) {
      document.title = "Artist Not Found | Pawn Island Records";
      panel.innerHTML = `
        <article class="empty-card">
          <p>That artist page is not available yet. Head back to the roster and choose another project.</p>
          <div class="action-row">
            <a class="button button--ghost button--small" href="artists.html">Back to Artists</a>
          </div>
        </article>
      `;
      return;
    }

    const discography = artistReleases(artist.slug);
    const latestRelease = discography[0] || null;
    const spotifySample = discography.find((release) => primaryEmbedFor(release).url);
    const youtubeSample = discography.find((release) => preferredYoutubeIdFor(release));
    const galleryReleases = discography.slice(0, 20);
    const titleNode = document.getElementById("artist-page-title");
    const laneNode = document.getElementById("artist-page-lane");
    const headlineNode = document.getElementById("artist-page-headline");
    const bodyNode = document.getElementById("artist-page-body");
    const actionsNode = document.getElementById("artist-page-actions");
    const visualNode = document.getElementById("artist-page-visual");
    const discographyCopyNode = document.getElementById("artist-discography-copy");
    const discographyNode = document.getElementById("artist-discography");
    const embedsNode = document.getElementById("artist-embeds");

    document.title = `${artist.name} | Pawn Island Records`;

    if (ui && ui.setMetaDescription) {
      ui.setMetaDescription(
        `${artist.name}. ${artist.headline || artist.summary || "Explore the artist discography and sample listening embeds."}`
      );
    }

    const breadcrumb = document.createElement("nav");
    breadcrumb.setAttribute("aria-label", "Breadcrumb");
    breadcrumb.className = "breadcrumb";
    breadcrumb.innerHTML = `<a href="artists.html">\u2190 Artists</a><span aria-hidden="true"> / </span><span>${escapeHtml(artist.name)}</span>`;
    panel.insertBefore(breadcrumb, panel.firstElementChild);

    titleNode.textContent = artist.name;
    laneNode.textContent = text(artist.lane, "Independent project");
    headlineNode.textContent = text(artist.headline, artist.summary);
    bodyNode.textContent = text(artist.story, artist.summary);

    actionsNode.innerHTML = `
      ${
        latestRelease
          ? `
            <a
              class="button button--primary"
              href="${escapeHtml(resolveTooFmUrl(latestRelease))}"
              target="_blank"
              rel="noreferrer"
            >
              Listen Now
            </a>
          `
          : ""
      }
      ${
        latestRelease
          ? `
            <a
              class="button button--toofm"
              href="${escapeHtml(resolveTooFmUrl(latestRelease))}"
              target="_blank"
              rel="noreferrer"
            >
              Latest Release
            </a>
          `
          : ""
      }
      <a class="button button--ghost" href="${escapeHtml(epkPageUrl(artist.slug))}">Open Press Kit</a>
      <a class="button button--ghost" href="artists.html">Back to Artists</a>
    `;

    visualNode.innerHTML = `
      <div class="artist-page-visual__cover">
        ${artworkMarkup(
          artist.image || (latestRelease && latestRelease.cover) || "",
          artist.name,
          artist.lane || "Artist page",
          0
        )}
      </div>
      <p class="artist-page-visual__caption">
        ${
          latestRelease
            ? escapeHtml(`${latestRelease.title} anchors the current release focus for ${artist.name}.`)
            : escapeHtml(`${artist.name} will populate with release artwork and embeds as the catalog expands.`)
        }
      </p>
    `;

    discographyCopyNode.textContent = discography.length
      ? `${discography.length} release${discography.length === 1 ? "" : "s"} across the current project catalog.`
      : "No public releases are attached to this artist yet.";

    discographyNode.innerHTML = discography.length
      ? discography
          .map((release, index) => {
            const tags = [
              text(release.type, "Release"),
              text(release.year, ""),
              `${release.tracks.length} ${release.tracks.length === 1 ? "track" : "tracks"}`
            ].filter(Boolean);

            return `
              <article class="release-card">
                <a
                  class="release-card__cover"
                  href="${escapeHtml(releasePageUrl(release.slug))}"
                  aria-label="Open ${escapeHtml(release.title)} release page"
                >
                  ${artworkMarkup(
                    release.cover,
                    release.title,
                    artist.name,
                    index
                  )}
                </a>
                <p class="release-card__eyebrow">Release</p>
                <div>
                  <h2>${escapeHtml(release.title)}</h2>
                  <p class="release-card__artist">${escapeHtml([release.type, release.year].filter(Boolean).join(" / "))}</p>
                </div>
                <div class="release-card__tags">
                  ${tags
                    .slice(0, 3)
                    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
                    .join("")}
                </div>
                <div class="release-card__actions">
                  <a class="button button--ghost button--small" href="${escapeHtml(releasePageUrl(release.slug))}">
                    Open Release
                  </a>
                  <a
                    class="button button--toofm button--small"
                    href="${escapeHtml(resolveTooFmUrl(release))}"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open on Too.fm
                  </a>
                </div>
              </article>
            `;
          })
          .join("")
      : `
          <article class="empty-card">
            <p>This artist page is ready. Add releases to the catalog and the discography will appear here automatically.</p>
          </article>
        `;

    const spotifyEmbed = spotifySample ? primaryEmbedFor(spotifySample) : { label: "", url: "" };
    const youtubeId = youtubeSample ? preferredYoutubeIdFor(youtubeSample) : "";

    const views = [
      {
        key: "gallery",
        label: `Gallery${galleryReleases.length ? ` (${galleryReleases.length})` : ""}`
      }
    ];

    if (spotifyEmbed.url && spotifySample) {
      views.push({
        key: "spotify",
        label: "Spotify"
      });
    }

    if (youtubeId && youtubeSample) {
      views.push({
        key: "youtube",
        label: "YouTube"
      });
    }

    embedsNode.innerHTML = `
      <div class="artist-media-panel">
        <div class="artist-media-panel__views" id="artist-media-views">
          ${views
            .map(
              (view, index) => `
                <button
                  class="button button--ghost button--small ${index === 0 ? "is-active" : ""}"
                  type="button"
                  data-artist-view="${escapeHtml(view.key)}"
                  aria-pressed="${index === 0 ? "true" : "false"}"
                >
                  ${escapeHtml(view.label)}
                </button>
              `
            )
            .join("")}
        </div>
        <div class="artist-media-panel__stage" id="artist-media-stage"></div>
      </div>
    `;

    const mediaViews = document.getElementById("artist-media-views");
    const mediaStage = document.getElementById("artist-media-stage");
    let activeView = "gallery";

    function renderGalleryView() {
      if (!galleryReleases.length) {
        mediaStage.innerHTML = `
          <article class="empty-card">
            <p>No album covers are available for this artist yet.</p>
          </article>
        `;
        return;
      }

      mediaStage.innerHTML = `
        <div class="cover-gallery" aria-label="${escapeHtml(artist.name)} album cover gallery">
          ${galleryReleases
            .map(
              (release, index) => `
                <a
                  class="cover-gallery__item"
                  href="${escapeHtml(releasePageUrl(release.slug))}"
                  aria-label="Open ${escapeHtml(release.title)} release page"
                >
                  <div class="cover-gallery__image">
                    ${artworkMarkup(
                      release.cover,
                      release.title,
                      artist.name,
                      index
                    )}
                  </div>
                  <div class="cover-gallery__copy">
                    <strong>${escapeHtml(release.title)}</strong>
                    <span>${escapeHtml([release.type, release.year].filter(Boolean).join(" / "))}</span>
                  </div>
                </a>
              `
            )
            .join("")}
        </div>
      `;
    }

    function renderSpotifyView() {
      mediaStage.innerHTML = spotifyEmbed.url && spotifySample
        ? `
            <article class="embed-card">
              <p class="embed-card__label">Spotify Sample</p>
              <h2>${escapeHtml(spotifySample.title)}</h2>
              <p class="embed-card__eyebrow">${escapeHtml(`${spotifyEmbed.label || "Spotify"} embed from the artist discography.`)}</p>
              <div class="embed-card__frame embed-card__frame--audio">
                <iframe
                  src="${escapeHtml(spotifyEmbed.url)}"
                  title="${escapeHtml(spotifySample.title)} Spotify embed"
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                ></iframe>
              </div>
              <p class="embed-card__caption">${escapeHtml(text(spotifySample.description, artist.summary))}</p>
            </article>
          `
        : `
            <article class="empty-card">
              <p>No Spotify embed is available in the current artist data.</p>
            </article>
          `;
    }

    function renderYoutubeView() {
      mediaStage.innerHTML = youtubeId && youtubeSample
        ? `
            <article class="embed-card">
              <p class="embed-card__label">YouTube Sample</p>
              <h2>${escapeHtml(youtubeSample.title)}</h2>
              <p class="embed-card__eyebrow">Featured visual pulled from the available release media.</p>
              <div class="embed-card__frame embed-card__frame--video">
                <iframe
                  src="${escapeHtml(youtubeEmbedUrl(youtubeId))}"
                  title="${escapeHtml(youtubeSample.title)} YouTube embed"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
              <p class="embed-card__caption">${escapeHtml(text(youtubeSample.description, artist.summary))}</p>
            </article>
          `
        : `
            <article class="empty-card">
              <p>No YouTube embed is available in the current artist data.</p>
            </article>
          `;
    }

    function renderActiveArtistMediaView() {
      if (activeView === "spotify") {
        renderSpotifyView();
      } else if (activeView === "youtube") {
        renderYoutubeView();
      } else {
        renderGalleryView();
      }

      if (ui && ui.hydrateArtwork) {
        ui.hydrateArtwork(mediaStage);
      }
    }

    if (mediaViews) {
      mediaViews.addEventListener("click", (event) => {
        const button = event.target.closest("[data-artist-view]");

        if (!button) {
          return;
        }

        activeView = button.getAttribute("data-artist-view") || "gallery";
        mediaViews.querySelectorAll("[data-artist-view]").forEach((node) => {
          const selected = node === button;
          node.classList.toggle("is-active", selected);
          node.setAttribute("aria-pressed", selected ? "true" : "false");
        });
        renderActiveArtistMediaView();
      });
    }

    renderActiveArtistMediaView();

    if (ui && ui.applyExperienceTheme) {
      ui.applyExperienceTheme({
        accent: (latestRelease && latestRelease.accent) || artist.accent || "#ffcc00",
        image: (latestRelease && latestRelease.cover) || artist.image || "",
        title: artist.name,
        subtitle: text(artist.lane, "Artist page")
      });
    }
  }

  function renderEpkIndex() {
    const collection = document.getElementById("epk-collection");

    if (!collection) {
      return;
    }

    collection.innerHTML = artists
      .map((artist, index) => {
        const discography = artistReleases(artist.slug);
        const latestRelease = discography[0] || null;
        const pressAssets = Array.isArray(artist.pressAssets)
          ? artist.pressAssets.filter(Boolean)
          : [];
        const coverSource = artist.image || (latestRelease && latestRelease.cover) || "";
        const facts = [
          `${discography.length} ${discography.length === 1 ? "release" : "releases"}`,
          latestRelease ? `Latest: ${latestRelease.title}` : "Catalog in development",
          pressAssets.length ? `${pressAssets.length} press assets` : "Asset list open"
        ].filter(Boolean);

        return `
          <article class="press-card">
            <a
              class="press-card__cover"
              href="${escapeHtml(epkPageUrl(artist.slug))}"
              aria-label="Open ${escapeHtml(artist.name)} press kit"
            >
              ${artworkMarkup(
                coverSource,
                artist.name,
                artist.lane || "Artist press",
                index
              )}
            </a>
            <div class="press-card__body">
              <div class="press-card__header">
                <div>
                  <p class="press-card__eyebrow">Press ${String(index + 1).padStart(2, "0")}</p>
                  <h2>${escapeHtml(artist.name)}</h2>
                </div>
                <p class="press-card__genre">${escapeHtml(text(artist.lane, "Independent project"))}</p>
              </div>
              <p class="press-card__summary">
                ${escapeHtml(text(artist.pressBio, artist.summary))}
              </p>
              <div class="press-card__facts">
                ${facts
                  .slice(0, 3)
                  .map((item) => `<span>${escapeHtml(item)}</span>`)
                  .join("")}
              </div>
              <div class="card-actions">
                <a class="button button--primary button--small" href="${escapeHtml(epkPageUrl(artist.slug))}">
                  Open Press Kit
                </a>
                <a class="button button--ghost button--small" href="${escapeHtml(artistPageUrl(artist.slug, latestRelease && latestRelease.slug))}">
                  Artist Page
                </a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderEpkPage() {
    const panel = document.getElementById("epk-page-panel");
    const artistSlug = new URLSearchParams(window.location.search).get("artist");
    const artist = artistSlug ? artistLookup.get(artistSlug) || null : null;

    if (!panel) {
      return;
    }

    if (!artist) {
      document.title = "Press Kit Not Found | Pawn Island Records";
      panel.innerHTML = `
        <article class="empty-card">
          <p>That press kit is not available yet. Return to the press index and choose another project.</p>
          <div class="action-row">
            <a class="button button--ghost button--small" href="epks.html">Back to Press</a>
            <a class="button button--ghost button--small" href="artists.html">Back to Artists</a>
          </div>
        </article>
      `;
      return;
    }

    const discography = artistReleases(artist.slug);
    const latestRelease = discography[0] || null;
    const spotifySample = discography.find((release) => primaryEmbedFor(release).url);
    const youtubeSample = discography.find((release) => preferredYoutubeIdFor(release));
    const galleryReleases = discography.slice(0, 20);
    const pressHighlights = Array.isArray(artist.pressHighlights)
      ? artist.pressHighlights.filter(Boolean)
      : [];
    const pressAssets = Array.isArray(artist.pressAssets)
      ? artist.pressAssets.filter(Boolean)
      : [];
    const priorityMarkets = Array.isArray(artist.priorityMarkets)
      ? artist.priorityMarkets.filter(Boolean)
      : [];
    const spotifyEmbed = spotifySample ? primaryEmbedFor(spotifySample) : { label: "", url: "" };
    const youtubeId = youtubeSample ? preferredYoutubeIdFor(youtubeSample) : "";
    const titleNode = document.getElementById("epk-page-title");
    const laneNode = document.getElementById("epk-page-lane");
    const summaryNode = document.getElementById("epk-page-summary");
    const bodyNode = document.getElementById("epk-page-body");
    const actionsNode = document.getElementById("epk-page-actions");
    const visualNode = document.getElementById("epk-page-visual");
    const statsNode = document.getElementById("epk-page-stats");
    const stageCopyNode = document.getElementById("epk-stage-copy");
    const viewsNode = document.getElementById("epk-page-views");
    const stageNode = document.getElementById("epk-page-stage");
    const specifics = [
      {
        label: "Live History",
        value: text(
          artist.liveShowNote,
          `Add venue history, support slots, festival billing, or session details for ${artist.name}.`
        )
      },
      {
        label: "Press Quote",
        value: text(
          artist.pressQuote,
          "Add an editorial quote, testimonial, or artist-approved pull line here."
        )
      },
      {
        label: "Campaign Specifics",
        value: text(
          artist.bookingNote,
          latestRelease
            ? `Add rollout timing, team notes, and campaign specifics for ${latestRelease.title}.`
            : "Add rollout timing, team notes, and campaign specifics here."
        )
      }
    ];
    const views = [
      { key: "overview", label: "Overview" },
      { key: "bio", label: "Bio" },
      { key: "catalog", label: `Catalog${discography.length ? ` (${discography.length})` : ""}` },
      { key: "media", label: "Media" },
      { key: "assets", label: "Assets" }
    ];
    const viewDescriptions = {
      overview: "A fast project snapshot built from positioning, story angles, and open campaign placeholders.",
      bio: "Working language for press copy, artist framing, and direction-setting notes.",
      catalog: "Current release context plus a scrollable discography strip for quick reference.",
      media: "Available Spotify, YouTube, and cover-art materials for immediate preview.",
      assets: "What is already in the kit and where specific campaign details can be added next."
    };
    let activeView = "overview";

    function releaseStripMarkup(list) {
      if (!list.length) {
        return `
          <article class="empty-card">
            <p>No public releases are attached to this artist yet.</p>
          </article>
        `;
      }

      return `
        <div class="artist-strip epk-release-strip" aria-label="${escapeHtml(artist.name)} press kit release rail">
          ${list
            .map(
              (release, index) => `
                <a class="strip-card" href="${escapeHtml(releasePageUrl(release.slug))}">
                  <div class="strip-card__thumb">
                    ${artworkMarkup(
                      release.cover,
                      release.title,
                      artist.name,
                      index
                    )}
                  </div>
                  <div class="strip-card__content">
                    <strong>${escapeHtml(release.title)}</strong>
                    <p>${escapeHtml(
                      [
                        [release.type, release.year].filter(Boolean).join(" / "),
                        text(release.description, artist.summary)
                      ]
                        .filter(Boolean)
                        .join(" | ")
                    )}</p>
                    <span class="strip-card__link">Open Release</span>
                  </div>
                </a>
              `
            )
            .join("")}
        </div>
      `;
    }

    function galleryMarkup() {
      if (!galleryReleases.length) {
        return `
          <article class="empty-card">
            <p>No cover gallery is available yet.</p>
          </article>
        `;
      }

      return `
        <div class="cover-gallery" aria-label="${escapeHtml(artist.name)} album cover gallery">
          ${galleryReleases
            .map(
              (release, index) => `
                <a
                  class="cover-gallery__item"
                  href="${escapeHtml(releasePageUrl(release.slug))}"
                  aria-label="Open ${escapeHtml(release.title)} release page"
                >
                  <div class="cover-gallery__image">
                    ${artworkMarkup(
                      release.cover,
                      release.title,
                      artist.name,
                      index
                    )}
                  </div>
                  <div class="cover-gallery__copy">
                    <strong>${escapeHtml(release.title)}</strong>
                    <span>${escapeHtml([release.type, release.year].filter(Boolean).join(" / "))}</span>
                  </div>
                </a>
              `
            )
            .join("")}
        </div>
      `;
    }

    function renderOverviewView() {
      stageNode.innerHTML = `
        <div class="epk-overview-grid">
          <article class="epk-panel-card">
            <p class="embed-card__label">Industry Pitch</p>
            <h2>How The Project Lands</h2>
            <p class="epk-panel-card__copy">${escapeHtml(text(artist.industryPitch, artist.summary))}</p>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Story Angles</p>
            <h2>Editorial Hooks</h2>
            <ul class="epk-bullet-list">
              ${(pressHighlights.length ? pressHighlights : ["Add press angles and approved talking points."])
                .slice(0, 4)
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ul>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Specifics To Add</p>
            <h2>Open Slots</h2>
            <div class="epk-placeholder-list">
              ${specifics
                .map(
                  (item) => `
                    <article class="epk-mini-card">
                      <strong>${escapeHtml(item.label)}</strong>
                      <span>${escapeHtml(item.value)}</span>
                    </article>
                  `
                )
                .join("")}
            </div>
          </article>
        </div>
      `;
    }

    function renderBioView() {
      stageNode.innerHTML = `
        <div class="epk-detail-grid">
          <article class="epk-panel-card epk-panel-card--wide">
            <p class="embed-card__label">Press Bio</p>
            <h2>Working Artist Bio</h2>
            <p class="epk-panel-card__copy">${escapeHtml(text(artist.pressBio, artist.story || artist.summary))}</p>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Current World</p>
            <h2>Project Direction</h2>
            <p class="epk-panel-card__copy">${escapeHtml(text(artist.story, artist.headline || artist.summary))}</p>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Visual &amp; Market Notes</p>
            <h2>Room For Specifics</h2>
            <p class="epk-panel-card__copy">${escapeHtml(
              [
                text(artist.merchIntro, ""),
                priorityMarkets.length
                  ? `Priority markets: ${priorityMarkets.join(", ")}.`
                  : "Add target territories, priority publications, and live-market notes."
              ]
                .filter(Boolean)
                .join(" ")
            )}</p>
          </article>
        </div>
      `;
    }

    function renderCatalogView() {
      stageNode.innerHTML = latestRelease
        ? `
            <div class="epk-catalog-grid">
              <article class="epk-panel-card epk-panel-card--spotlight">
                <p class="embed-card__label">Latest Release</p>
                <h2>${escapeHtml(latestRelease.title)}</h2>
                <div class="epk-spotlight">
                  <div class="epk-spotlight__cover">
                    ${artworkMarkup(
                      latestRelease.cover,
                      latestRelease.title,
                      artist.name,
                      0
                    )}
                  </div>
                  <div class="epk-spotlight__copy">
                    <p class="epk-panel-card__copy">${escapeHtml(text(latestRelease.description, artist.summary))}</p>
                    <div class="release-card__tags">
                      ${[latestRelease.type, latestRelease.year, `${latestRelease.tracks.length} ${latestRelease.tracks.length === 1 ? "track" : "tracks"}`]
                        .filter(Boolean)
                        .map((item) => `<span class="tag">${escapeHtml(item)}</span>`)
                        .join("")}
                    </div>
                    <div class="feature-card__actions">
                      <a
                        class="button button--toofm button--small"
                        href="${escapeHtml(resolveTooFmUrl(latestRelease))}"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Latest Release
                      </a>
                      <a class="button button--ghost button--small" href="${escapeHtml(releasePageUrl(latestRelease.slug))}">
                        Release Page
                      </a>
                    </div>
                  </div>
                </div>
              </article>
              <article class="epk-panel-card">
                <p class="embed-card__label">Discography</p>
                <h2>Release Rail</h2>
                ${releaseStripMarkup(discography)}
              </article>
            </div>
          `
        : `
            <article class="empty-card">
              <p>This press kit is ready for release context. Add a public release and the catalog view will populate automatically.</p>
            </article>
          `;
    }

    function renderMediaView() {
      stageNode.innerHTML = `
        <div class="epk-media-grid">
          <article class="embed-card">
            <p class="embed-card__label">Spotify</p>
            <h2>${escapeHtml(spotifySample ? spotifySample.title : "Sample Slot")}</h2>
            <p class="embed-card__eyebrow">
              ${escapeHtml(
                spotifyEmbed.url
                  ? `${spotifyEmbed.label || "Spotify"} embed ready from the public discography.`
                  : "Add a Spotify embed URL to any release and it will appear here."
              )}
            </p>
            ${
              spotifyEmbed.url
                ? `
                  <div class="embed-card__frame embed-card__frame--audio">
                    <iframe
                      src="${escapeHtml(spotifyEmbed.url)}"
                      title="${escapeHtml(spotifySample.title)} Spotify embed"
                      loading="lazy"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    ></iframe>
                  </div>
                `
                : `
                  <div class="embed-card__placeholder">
                    <p>Spotify sample slot ready when a release embed is available.</p>
                  </div>
                `
            }
          </article>
          <article class="embed-card">
            <p class="embed-card__label">YouTube</p>
            <h2>${escapeHtml(youtubeSample ? youtubeSample.title : "Visual Slot")}</h2>
            <p class="embed-card__eyebrow">
              ${escapeHtml(
                youtubeId
                  ? "Release-level YouTube visual pulled from the current catalog."
                  : "Add a YouTube ID to any release and the video slot will appear here."
              )}
            </p>
            ${
              youtubeId
                ? `
                  <div class="embed-card__frame embed-card__frame--video">
                    <iframe
                      src="${escapeHtml(youtubeEmbedUrl(youtubeId))}"
                      title="${escapeHtml(youtubeSample.title)} YouTube embed"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>
                `
                : `
                  <div class="embed-card__placeholder embed-card__placeholder--video">
                    <p>YouTube visual slot ready when release media is attached.</p>
                  </div>
                `
            }
          </article>
          <article class="epk-panel-card epk-panel-card--gallery">
            <p class="embed-card__label">Artwork</p>
            <h2>Cover Gallery</h2>
            ${galleryMarkup()}
          </article>
        </div>
      `;
    }

    function renderAssetsView() {
      const readinessItems = [
        artist.pressBio ? "Working press bio is already populated." : "Add a press bio.",
        `${pressAssets.length} asset${pressAssets.length === 1 ? "" : "s"} currently listed.`,
        latestRelease ? `Latest release context is tied to ${latestRelease.title}.` : "Add a public release for campaign context.",
        spotifyEmbed.url ? "Spotify sample is live in the press kit." : "Spotify sample slot is still open.",
        youtubeId ? "YouTube sample is live in the press kit." : "YouTube sample slot is still open."
      ];

      stageNode.innerHTML = `
        <div class="epk-overview-grid">
          <article class="epk-panel-card">
            <p class="embed-card__label">Available Assets</p>
            <h2>What Is Listed</h2>
            <ul class="epk-bullet-list">
              ${(pressAssets.length ? pressAssets : ["Add high-resolution photos, one-sheets, and approved copy items."])
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ul>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Readiness</p>
            <h2>Current Kit Status</h2>
            <ul class="epk-bullet-list">
              ${readinessItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Next Specifics</p>
            <h2>Still To Add</h2>
            <ul class="epk-bullet-list">
              <li>Add recent press quotes or editorial pull lines.</li>
              <li>Add streaming, ticketing, or campaign metrics when they exist.</li>
              <li>Add live history, personnel credits, and official photo selections.</li>
            </ul>
          </article>
        </div>
      `;
    }

    function renderActiveEpkView() {
      if (stageCopyNode) {
        stageCopyNode.textContent = viewDescriptions[activeView] || viewDescriptions.overview;
      }

      if (activeView === "bio") {
        renderBioView();
      } else if (activeView === "catalog") {
        renderCatalogView();
      } else if (activeView === "media") {
        renderMediaView();
      } else if (activeView === "assets") {
        renderAssetsView();
      } else {
        renderOverviewView();
      }

      if (ui && ui.hydrateArtwork) {
        ui.hydrateArtwork(stageNode);
      }
    }

    document.title = `${artist.name} Press Kit | Pawn Island Records`;

    if (ui && ui.setMetaDescription) {
      ui.setMetaDescription(
        `${artist.name} press kit. ${artist.pressBio || artist.summary || artist.headline || "Press materials, release context, and artist positioning."}`
      );
    }

    titleNode.textContent = artist.name;
    laneNode.textContent = text(artist.lane, "Independent project");
    summaryNode.textContent = text(
      artist.epkTagline,
      artist.headline || artist.summary || artist.pressBio
    );
    bodyNode.textContent = text(artist.pressBio, artist.story || artist.summary);

    actionsNode.innerHTML = `
      ${
        latestRelease
          ? `
            <a
              class="button button--toofm"
              href="${escapeHtml(resolveTooFmUrl(latestRelease))}"
              target="_blank"
              rel="noreferrer"
            >
              Latest Release
            </a>
          `
          : ""
      }
      <a class="button button--ghost" href="${escapeHtml(artistPageUrl(artist.slug, latestRelease && latestRelease.slug))}">
        Artist Page
      </a>
      <a class="button button--ghost" href="epks.html">All Press</a>
    `;

    visualNode.innerHTML = `
      <div class="epk-page-visual__cover">
        ${artworkMarkup(
          artist.image || (latestRelease && latestRelease.cover) || "",
          artist.name,
          artist.lane || "Artist press",
          0
        )}
      </div>
      <p class="epk-page-visual__caption">
        ${escapeHtml(
          latestRelease
            ? `${latestRelease.title} currently anchors the press-facing world for ${artist.name}.`
            : `${artist.name} is ready for more release, live, and press-specific detail as it becomes available.`
        )}
      </p>
    `;

    statsNode.innerHTML = `
      <article class="metric-pill">
        <strong>${discography.length}</strong>
        <span>${discography.length === 1 ? "Release" : "Releases"}</span>
      </article>
      <article class="metric-pill">
        <strong>${pressAssets.length}</strong>
        <span>${pressAssets.length === 1 ? "Asset" : "Assets"}</span>
      </article>
      <article class="metric-pill">
        <strong>${spotifyEmbed.url || youtubeId ? "Live" : "Open"}</strong>
        <span>Media Slots</span>
      </article>
      <article class="metric-pill">
        <strong>${pressHighlights.length || 0}</strong>
        <span>Story Angles</span>
      </article>
    `;

    viewsNode.innerHTML = views
      .map(
        (view, index) => `
          <button
            class="button button--ghost button--small ${index === 0 ? "is-active" : ""}"
            type="button"
            data-epk-view="${escapeHtml(view.key)}"
            aria-pressed="${index === 0 ? "true" : "false"}"
          >
            ${escapeHtml(view.label)}
          </button>
        `
      )
      .join("");

    viewsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-epk-view]");

      if (!button) {
        return;
      }

      activeView = button.getAttribute("data-epk-view") || "overview";
      viewsNode.querySelectorAll("[data-epk-view]").forEach((node) => {
        const selected = node === button;
        node.classList.toggle("is-active", selected);
        node.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      renderActiveEpkView();
    });

    renderActiveEpkView();

    if (ui && ui.hydrateArtwork) {
      ui.hydrateArtwork(panel);
    }

    if (ui && ui.applyExperienceTheme) {
      ui.applyExperienceTheme({
        accent: (latestRelease && latestRelease.accent) || artist.accent || "#ffcc00",
        image: (latestRelease && latestRelease.cover) || artist.image || "",
        title: `${artist.name} Press Kit`,
        subtitle: text(artist.lane, "Artist press")
      });
    }
  }

  function renderReleases() {
    const collection = document.getElementById("releases-collection");
    const intro = document.getElementById("releases-intro");
    const resetLink = document.getElementById("release-filter-reset");
    const selectedArtistSlug = new URLSearchParams(window.location.search).get("artist");
    const selectedArtist = selectedArtistSlug ? artistLookup.get(selectedArtistSlug) || null : null;
    const visibleReleases = selectedArtist
      ? releases.filter((release) => release.artist === selectedArtist.slug)
      : releases;

    if (intro) {
      intro.textContent = selectedArtist
        ? `Showing ${visibleReleases.length} release${visibleReleases.length === 1 ? "" : "s"} for ${selectedArtist.name}.`
        : `${releases.length} release${releases.length === 1 ? "" : "s"} in the catalog.`;
    }

    if (resetLink) {
      resetLink.classList.toggle("is-hidden", !selectedArtist);
      if (selectedArtist) {
        resetLink.textContent = "\u2190 All releases";
      }
    }

    if (!collection) {
      return;
    }

    if (!visibleReleases.length) {
      collection.innerHTML = `
        <article class="empty-card">
          <p>No releases are attached to this artist filter yet.</p>
        </article>
      `;
      return;
    }

    collection.innerHTML = visibleReleases
      .map((release, index) => {
        const artist = artistForRelease(release);
        const metaLine = [
          text(release.type, "Release"),
          text(release.year, ""),
          release.tracks.length
            ? `${release.tracks.length} ${release.tracks.length === 1 ? "track" : "tracks"}`
            : ""
        ].filter(Boolean);
        const vibeLine = text(release.vibe, "");

        return `
          <article class="release-card release-card--catalog">
            <a
              class="release-card__cover"
              href="${escapeHtml(releasePageUrl(release.slug))}"
              aria-label="Open ${escapeHtml(release.title)} release page"
            >
              ${artworkMarkup(
                release.cover,
                release.title,
                artist ? artist.name : "Release",
                index
              )}
            </a>
            <p class="release-card__eyebrow">Release</p>
            <div>
              <h2>${escapeHtml(release.title)}</h2>
              <p class="release-card__artist">${escapeHtml(artist ? artist.name : "Pawn Island Records")}</p>
            </div>
            <div class="release-card__catalog-meta">
              <p class="release-card__meta-line">${escapeHtml(metaLine.join(" / "))}</p>
              ${
                vibeLine
                  ? `<p class="release-card__mood">${escapeHtml(vibeLine)}</p>`
                  : ""
              }
            </div>
            <div class="release-card__actions">
              <button class="button button--ghost button--small" type="button" data-audio-focus>
                Play
              </button>
              <a
                class="button button--toofm button--small"
                href="${escapeHtml(resolveTooFmUrl(release))}"
                target="_blank"
                rel="noreferrer"
              >
                Open on Too.fm
              </a>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderAbout() {
    const bodyCopy = document.getElementById("about-body-copy");
    const ethosLine = document.getElementById("about-ethos-line");
    const campaignLinkNode = document.getElementById("about-campaign-link");
    const timelineNode = document.getElementById("about-timeline");

    if (bodyCopy) {
      bodyCopy.textContent = aboutCopy();
    }

    if (ethosLine) {
      ethosLine.textContent = aboutEthos();
    }

    if (campaignLinkNode) {
      campaignLinkNode.href = campaignUrl();
    }

    if (timelineNode) {
      timelineNode.innerHTML = aboutTimeline()
        .slice(0, 3)
        .map(
          (item) => `
            <article class="timeline-item">
              <div class="timeline-item__marker">${escapeHtml(text(item.label, "00"))}</div>
              <div>
                <h2>${escapeHtml(text(item.title, "Label Motion"))}</h2>
                <p>${escapeHtml(text(item.text, ""))}</p>
              </div>
            </article>
          `
        )
        .join("");
    }
  }

  function hydrateArtwork() {
    if (ui && ui.hydrateArtwork) {
      ui.hydrateArtwork(document);
    }
  }

  function init() {
    syncViewportHeight();
    bindAudioButtons();
    setActiveNav();

    if (page === "home") {
      renderHome();
    } else if (page === "artists") {
      renderArtists();
    } else if (page === "artist") {
      renderArtistPage();
    } else if (page === "epks") {
      renderEpkIndex();
    } else if (page === "epk") {
      renderEpkPage();
    } else if (page === "releases") {
      renderReleases();
    } else if (page === "about") {
      renderAbout();
    }

    hydrateArtwork();
    requestAnimationFrame(setupScrollFades);
    window.addEventListener("resize", syncViewportHeight);
    window.addEventListener("orientationchange", syncViewportHeight);
  }

  init();
})();
