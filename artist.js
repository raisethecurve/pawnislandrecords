(function () {
  const ui = window.PAWN_UI;
  const artistSlug = ui.getSearchParam("artist");
  const artist = ui.getArtist(artistSlug);

  const titleMount = document.getElementById("artist-title");
  const metaMount = document.getElementById("artist-meta");
  const heroCover = document.getElementById("artist-hero-cover");
  const viewNav = document.getElementById("artist-view-nav");
  const releaseNav = document.getElementById("artist-release-nav");
  const releaseDetail = document.getElementById("artist-release-detail");
  const viewMount = document.getElementById("artist-view");

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

  document.title = `${artist.name} | Pawn Island Records`;
  if (ui.setMetaDescription) {
    ui.setMetaDescription(
      `${artist.name}. ${artist.headline || artist.summary || "Explore releases, artist story, platform links, and press materials."}`
    );
  }

  const releases = ui.getArtistReleases(artist.slug);
  const merchItems = ui.getArtistMerch(artist.slug);
  let activeView = ui.normalizeView(ui.getSearchParam("view"));
  let activeReleaseSlug = releases[0] ? releases[0].slug : "";
  let activeTrackIndex = 0;

  function youtubeEmbedUrl(youtubeId) {
    return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : "";
  }

  function currentRelease() {
    return ui.getRelease(activeReleaseSlug) || releases[0] || null;
  }

  function applyTheme() {
    const activeRelease = currentRelease();

    if (!ui.applyExperienceTheme) {
      return;
    }

    ui.applyExperienceTheme({
      accent: (activeRelease && activeRelease.accent) || artist.accent,
      image: (activeRelease && activeRelease.cover) || artist.image
    });
  }

  function renderHero() {
    titleMount.textContent = artist.name;
    metaMount.innerHTML = `
      <p class="eyebrow">${artist.lane}</p>
      <p class="detail-copy">${artist.headline}</p>
    `;
    heroCover.innerHTML = `
      <div class="cover-frame">
        <img src="${artist.image}" alt="${artist.name} artwork" />
      </div>
    `;
  }

  function renderViewNav() {
    const views = [
      { key: "public", label: "Public" },
      { key: "industry", label: "Industry" },
      { key: "press", label: "Press Kit" },
      { key: "merch", label: "Merch" }
    ];

    viewNav.innerHTML = views
      .map(
        (view) => `
          <button
            type="button"
            class="${view.key === activeView ? "is-active" : ""}"
            data-view="${view.key}"
          >
            ${view.label}
          </button>
        `
      )
      .join("");
  }

  function renderReleaseNav() {
    if (!releases.length) {
      releaseNav.innerHTML = `
        <article class="info-card">
          <h3>No releases yet</h3>
          <p class="detail-copy">
            Release pages will appear here as this artist's catalog grows.
          </p>
        </article>
      `;
      return;
    }

    releaseNav.innerHTML = releases
      .map(
        (release) => `
          <button
            type="button"
            class="${release.slug === activeReleaseSlug ? "is-active" : ""}"
            data-release="${release.slug}"
          >
            ${release.title}
          </button>
        `
      )
      .join("");
  }

  function renderReleaseDetail() {
    const release = currentRelease();

    if (!release) {
      releaseDetail.innerHTML = `
        <article class="empty-state">
          <h2>No releases listed yet.</h2>
          <p>Return soon to explore this artist's release world.</p>
        </article>
      `;
      return;
    }

    const safeTrackIndex = Math.min(activeTrackIndex, release.tracks.length - 1);
    activeTrackIndex = safeTrackIndex < 0 ? 0 : safeTrackIndex;
    const activeTrack = release.tracks[activeTrackIndex] || null;

    releaseDetail.innerHTML = `
      <div class="release-detail-grid">
        <div class="release-detail__cover">
          <img src="${release.cover}" alt="${release.title} cover art" />
        </div>
        <article class="release-detail__body">
          <p class="eyebrow">${release.type}</p>
          <h2>${release.title}</h2>
          <p class="release-card__meta">${release.year} / ${release.vibe}</p>
          <p class="detail-copy">${release.description}</p>
          <div class="chip-row">
            <span class="chip">${release.tracks.length} tracks</span>
            ${release.platforms.length
              ? release.platforms.map((platform) => `<span class="chip">${platform.label}</span>`).join("")
              : '<span class="chip">Platform destinations appear here as they go live</span>'}
          </div>
          <div class="platform-row">
            <a class="chip-button is-active" href="release.html?release=${release.slug}">Open Release Page</a>
          </div>
          ${
            release.platforms.length
              ? `<div class="platform-row">
                  ${release.platforms
                    .map(
                      (platform) => `
                        <a class="chip-button" href="${platform.url}" target="_blank" rel="noreferrer">
                          ${platform.label}
                        </a>
                      `
                    )
                    .join("")}
                </div>`
              : ""
          }
          <div class="tracks-stack">
            ${release.tracks
              .map(
                (track, index) => `
                  <button
                    type="button"
                    class="chip-button ${index === activeTrackIndex ? "is-active" : ""}"
                    data-track-index="${index}"
                  >
                    ${track.title}
                  </button>
                `
              )
              .join("")}
          </div>
          <div class="video-panel">
            ${
              activeTrack && activeTrack.youtubeId
                ? `<iframe src="${youtubeEmbedUrl(
                    activeTrack.youtubeId
                  )}" title="${activeTrack.title} video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                : `<div class="video-empty">
                    <p class="eyebrow">Track Video</p>
                    <p class="detail-copy">${
                      activeTrack
                        ? `An official video or visualizer for "${activeTrack.title}" can live here as it becomes available.`
                        : "Track videos appear here as they go live."
                    }</p>
                  </div>`
            }
          </div>
        </article>
      </div>
    `;

    applyTheme();
  }

  function renderPublicView() {
    const release = currentRelease();
    viewMount.innerHTML = `
      <article class="artist-view reveal">
        <p class="eyebrow">Public View</p>
        <div class="artist-view__columns">
          <div>
            <h2>${artist.headline}</h2>
            <p class="detail-copy">${artist.story}</p>
          </div>
          <div>
            <p class="detail-copy">${artist.summary}</p>
            ${
              release
                ? `<div class="chip-row">
                    <span class="chip">Current release: ${release.title}</span>
                    <span class="chip">${release.vibe}</span>
                  </div>`
                : ""
            }
          </div>
        </div>
      </article>
    `;
  }

  function renderIndustryView() {
    const release = currentRelease();
    viewMount.innerHTML = `
      <article class="artist-view reveal">
        <p class="eyebrow">Industry View</p>
        <div class="press-grid">
          <article class="info-card">
            <h2>${artist.name}</h2>
            <p class="detail-copy">${artist.industryPitch}</p>
            <div class="chip-row">
              <span class="chip">${artist.lane}</span>
              <span class="chip">${releases.length} release${releases.length === 1 ? "" : "s"}</span>
            </div>
          </article>
          <article class="info-card">
            <h2>${release ? release.title : "Release overview"}</h2>
            <p class="detail-copy">${
              release
                ? `${release.description} The release is framed around ${release.vibe}.`
                : "Add a release to populate the current artist overview."
            }</p>
          </article>
        </div>
      </article>
    `;
  }

  function renderPressView() {
    viewMount.innerHTML = `
      <article class="artist-view reveal">
        <p class="eyebrow">Press Kit</p>
        <div class="press-grid">
          <article class="info-card">
            <h2>Bio</h2>
            <p class="detail-copy">${artist.pressBio}</p>
          </article>
          <article class="info-card">
            <h2>Highlights</h2>
            <ul class="list-block">
              ${artist.pressHighlights.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </article>
          <article class="info-card">
            <h2>Available Assets</h2>
            <ul class="list-block">
              ${artist.pressAssets.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </article>
          <article class="info-card">
            <h2>Suggested Angle</h2>
            <p class="detail-copy">${artist.headline}</p>
          </article>
        </div>
      </article>
    `;
  }

  function renderMerchView() {
    viewMount.innerHTML = `
      <article class="artist-view reveal">
        <p class="eyebrow">Merch</p>
        <p class="detail-copy">${artist.merchIntro}</p>
        <div class="catalog-grid">
          ${
            merchItems.length
              ? merchItems
                  .map(
                    (item) => `
                      <article class="release-card">
                        <div class="cover-frame">
                          <img src="${item.image}" alt="${item.title}" />
                        </div>
                        <div class="release-card__body">
                          <h3>${item.title}</h3>
                          <p class="release-card__meta">${item.price || "Price on request"}</p>
                          <p class="release-card__summary">${item.description}</p>
                          ${
                            item.url
                              ? `<div class="row-actions"><a class="text-button" href="${item.url}" target="_blank" rel="noreferrer">Open Merch Link</a></div>`
                              : ""
                          }
                        </div>
                      </article>
                    `
                  )
                  .join("")
              : `<article class="empty-state"><h2>No merch listed yet.</h2><p>Add merch items in the site data to populate this view.</p></article>`
          }
        </div>
      </article>
    `;
  }

  function renderView() {
    if (activeView === "industry") {
      renderIndustryView();
    } else if (activeView === "press") {
      renderPressView();
    } else if (activeView === "merch") {
      renderMerchView();
    } else {
      renderPublicView();
    }
  }

  viewNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");

    if (!button) {
      return;
    }

    activeView = button.getAttribute("data-view");
    ui.updateViewParam(activeView);
    renderViewNav();
    renderView();
    ui.revealOnScroll();
  });

  releaseNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-release]");

    if (!button) {
      return;
    }

    activeReleaseSlug = button.getAttribute("data-release");
    activeTrackIndex = 0;
    renderReleaseNav();
    renderReleaseDetail();
  });

  releaseDetail.addEventListener("click", (event) => {
    const button = event.target.closest("[data-track-index]");

    if (!button) {
      return;
    }

    activeTrackIndex = Number(button.getAttribute("data-track-index")) || 0;
    renderReleaseDetail();
  });

  renderHero();
  renderViewNav();
  renderReleaseNav();
  renderReleaseDetail();
  renderView();
  applyTheme();
  ui.revealOnScroll();
})();
