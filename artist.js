(function () {
  const ui = window.PAWN_UI;
  const artistSlug = ui.getSearchParam("artist");
  const artist = ui.getArtist(artistSlug);

  const titleMount = document.getElementById("artist-title");
  const laneMount = document.getElementById("artist-lane");
  const headlineMount = document.getElementById("artist-headline");
  const summaryMount = document.getElementById("artist-summary");
  const storyHeading = document.getElementById("artist-story-heading");
  const storyMount = document.getElementById("artist-story");
  const heroCover = document.getElementById("artist-hero-cover");
  const featureLinks = document.getElementById("artist-feature-links");
  const releaseNav = document.getElementById("artist-release-nav");
  const releaseDetail = document.getElementById("artist-release-detail");
  const mediaPanel = document.getElementById("artist-media-panel");
  const platformPanel = document.getElementById("artist-platform-panel");

  if (!artist) {
    document.getElementById("artist-page").innerHTML = `
      <section class="surface-panel">
        <article class="empty-state">
          <h2>Artist not found.</h2>
          <p>Return to the roster to choose another artist page.</p>
          <a class="button" href="artists.html">Back to Artists</a>
        </article>
      </section>
    `;
    ui.revealOnScroll();
    return;
  }

  const releases = ui.getArtistReleases(artist.slug);
  const requestedReleaseSlug = ui.getSearchParam("release");
  let activeReleaseSlug = releases.some((release) => release.slug === requestedReleaseSlug)
    ? requestedReleaseSlug
    : (releases[0] ? releases[0].slug : "");

  function currentRelease() {
    return ui.getRelease(activeReleaseSlug) || releases[0] || null;
  }

  function releaseUrl(release) {
    return `release.html?release=${encodeURIComponent(release.slug)}`;
  }

  function artistUrl(release) {
    return `artist.html?artist=${encodeURIComponent(artist.slug)}&release=${encodeURIComponent(release.slug)}`;
  }

  function youtubeEmbedUrl(videoId) {
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  function platformLinksMarkup(release) {
    const platforms = ui.getLivePlatforms(release);

    if (!platforms.length) {
      return '<p class="artist-world__empty-copy">Platform links will appear here as destinations go live.</p>';
    }

    return `
      <div class="artist-world__platform-strip">
        ${platforms
          .map(
            (platform) => `
              <a
                class="artist-world__platform-link"
                href="${platform.url}"
                target="_blank"
                rel="noreferrer"
                aria-label="${platform.label}"
                title="${platform.label}"
              >
                <span class="artist-world__platform-icon" aria-hidden="true">
                  ${platform.icon || `<span>${platform.label.slice(0, 1)}</span>`}
                </span>
              </a>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderHero() {
    const release = currentRelease();

    document.title = `${artist.name} | Pawn Island Records`;
    if (ui.setMetaDescription) {
      ui.setMetaDescription(
        `${artist.name}. ${artist.headline || artist.summary || "Explore the artist page and current release."}`
      );
    }

    titleMount.textContent = artist.name;
    laneMount.textContent = artist.lane;
    headlineMount.textContent = artist.headline;
    summaryMount.textContent = artist.summary;
    storyHeading.textContent = artist.headline || artist.name;
    storyMount.textContent = artist.story || artist.summary;

    featureLinks.innerHTML = `
      ${release ? `<a class="button" href="${releaseUrl(release)}">Open Current Release</a>` : ""}
      ${
        artist.slug === "matt-freeman"
          ? `
            <a class="button button--ghost" href="about.html">About Matthew</a>
            <a class="button button--ghost" href="process.html">Creative Process</a>
          `
          : `<a class="button button--ghost" href="catalog.html">Browse Catalog</a>`
      }
    `;

    heroCover.innerHTML = `
      <div class="artist-world__portrait">
        <div class="cover-frame">
          ${
              ui.artworkImageMarkup({
                src: artist.image,
                title: artist.name,
                subtitle: artist.lane || "Artist page",
                accent: artist.accent,
                alt: `${artist.name} artwork`,
                loading: "eager"
            })
          }
        </div>
      </div>
    `;

    ui.hydrateArtwork(heroCover);
  }

  function renderReleaseNav() {
    if (!releases.length) {
      releaseNav.innerHTML = `
        <article class="info-card">
          <h2>No releases yet.</h2>
          <p class="detail-copy">This artist page will expand as new releases arrive.</p>
        </article>
      `;
      return;
    }

    releaseNav.innerHTML = releases
      .map(
        (release) => `
          <button
            type="button"
            class="artist-world__release-card ${release.slug === activeReleaseSlug ? "is-active" : ""}"
            data-release="${release.slug}"
            aria-pressed="${release.slug === activeReleaseSlug ? "true" : "false"}"
          >
            <span
              class="artist-world__release-card-media"
              data-release-link="${releaseUrl(release)}"
              title="Open ${release.title} release page"
            >
              ${
                ui.artworkImageMarkup({
                  src: release.cover,
                  title: release.title,
                  subtitle: artist.name,
                  accent: release.accent || artist.accent,
                  alt: `${release.title} cover art`
                })
              }
            </span>
            <span class="artist-world__release-card-copy">
              <strong>${release.title}</strong>
              <span>${[release.type, release.year].filter(Boolean).join(" / ")}</span>
            </span>
          </button>
        `
      )
      .join("");

    ui.hydrateArtwork(releaseNav);
  }

  function renderReleaseDetail() {
    const release = currentRelease();

    if (!release) {
      releaseDetail.innerHTML = `
        <div class="empty-state">
          <h2>No release selected.</h2>
          <p>This artist page will populate once releases are attached.</p>
        </div>
      `;
      return;
    }

    const livePlatforms = ui.getLivePlatforms(release);
    const vibeTags = String(release.vibe || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 4);

    releaseDetail.innerHTML = `
      <p class="eyebrow">Selected Release</p>
      <h2>${release.title}</h2>
      <p class="artist-world__release-meta">${[release.type, release.year].filter(Boolean).join(" / ")}</p>
      <p class="detail-copy">${release.description || artist.summary || ""}</p>
      <div class="chip-row">
        ${vibeTags.map((tag) => `<span class="chip">${tag}</span>`).join("")}
        <span class="chip">${release.tracks.length} track${release.tracks.length === 1 ? "" : "s"}</span>
        ${livePlatforms.length ? `<span class="chip">${livePlatforms.length} live platform${livePlatforms.length === 1 ? "" : "s"}</span>` : ""}
      </div>
      <div class="hero-actions">
        <a class="button" href="${releaseUrl(release)}">Open Release Page</a>
        <a class="button button--ghost" href="catalog.html">Browse All Releases</a>
      </div>
    `;
  }

  function renderMediaPanel() {
    const release = currentRelease();

    if (!release) {
      mediaPanel.innerHTML = `
        <p class="eyebrow">Media</p>
        <h2>Selected media will appear here.</h2>
      `;
      return;
    }

    const youtubeId = ui.preferredYoutubeId(release);
    const primaryEmbed = ui.primaryEmbed(release);

    if (youtubeId) {
      mediaPanel.innerHTML = `
        <p class="eyebrow">Visual</p>
        <h2>${release.title}</h2>
        <div class="artist-world__video-frame">
          <iframe
            src="${youtubeEmbedUrl(youtubeId)}"
            title="${release.title} by ${artist.name}"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `;
      return;
    }

    if (primaryEmbed.url) {
      mediaPanel.innerHTML = `
        <p class="eyebrow">Audio</p>
        <h2>${primaryEmbed.label || release.title}</h2>
        <div class="artist-world__embed-frame artist-world__embed-frame--audio">
          <iframe
            src="${primaryEmbed.url}"
            title="${primaryEmbed.label || release.title} embed"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          ></iframe>
        </div>
      `;
      return;
    }

    mediaPanel.innerHTML = `
      <p class="eyebrow">Visual</p>
      <h2>${release.title}</h2>
      <a
        class="artist-world__still-frame"
        href="${releaseUrl(release)}"
        aria-label="Open ${release.title} release page"
      >
        ${
          ui.artworkImageMarkup({
            src: release.cover,
            title: release.title,
            subtitle: artist.name,
            accent: release.accent || artist.accent,
            alt: `${release.title} cover art`,
            format: "landscape"
          })
        }
      </a>
    `;

    ui.hydrateArtwork(mediaPanel);
  }

  function renderPlatformPanel() {
    const release = currentRelease();

    if (!release) {
      platformPanel.innerHTML = `
        <p class="eyebrow">Listen</p>
        <h2>No release selected.</h2>
      `;
      return;
    }

    platformPanel.innerHTML = `
      <p class="eyebrow">Listen + Tracklist</p>
      <h2>Move deeper into ${release.title}.</h2>
      ${platformLinksMarkup(release)}
      <ol class="artist-world__tracklist">
        ${release.tracks.slice(0, 8).map((track) => `<li>${track.title}</li>`).join("")}
      </ol>
    `;
  }

  function applyTheme() {
    const release = currentRelease();

    ui.applyExperienceTheme({
      accent: (release && release.accent) || artist.accent,
      image: (release && release.cover) || artist.image,
      title: (release && release.title) || artist.name,
      subtitle: release ? artist.name : (artist.lane || "Artist page")
    });
  }

  releaseNav.addEventListener("click", (event) => {
    const releaseLink = event.target.closest("[data-release-link]");

    if (releaseLink) {
      window.location.href = releaseLink.getAttribute("data-release-link");
      return;
    }

    const button = event.target.closest("[data-release]");

    if (!button) {
      return;
    }

    activeReleaseSlug = button.getAttribute("data-release");
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("release", activeReleaseSlug);
    window.history.replaceState({}, "", nextUrl);

    renderReleaseNav();
    renderReleaseDetail();
    renderMediaPanel();
    renderPlatformPanel();
    applyTheme();
  });

  renderHero();
  renderReleaseNav();
  renderReleaseDetail();
  renderMediaPanel();
  renderPlatformPanel();
  applyTheme();
  ui.revealOnScroll();
})();
