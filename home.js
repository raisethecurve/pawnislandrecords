(function () {
  const ui = window.PAWN_UI;
  const data = ui.data;
  const featured = ui.getFeaturedRelease();
  const featuredArtist = featured ? ui.getArtist(featured.artist) : null;

  const statsGrid = document.getElementById("home-stats");
  const featuredMount = document.getElementById("featured-release-mount");
  const quickLinks = document.getElementById("quick-links");
  const heroCover = document.getElementById("hero-feature-cover");

  function renderStats() {
    statsGrid.innerHTML = `
      <article class="hero-stat">
        <strong>${data.artists.length}</strong>
        <span>Artist projects</span>
      </article>
      <article class="hero-stat">
        <strong>${data.releases.length}</strong>
        <span>Release worlds</span>
      </article>
      <article class="hero-stat">
        <strong>${ui.trackCount()}</strong>
        <span>Tracks listed</span>
      </article>
    `;
  }

  function renderFeatured() {
    if (!featured || !featuredArtist) {
      featuredMount.innerHTML = `
        <article class="empty-state">
          <h2>No featured release selected.</h2>
          <p>Choose a release in the catalog editor to feature it on the homepage.</p>
        </article>
      `;
      return;
    }

    if (heroCover) {
      heroCover.src = featured.cover;
      heroCover.alt = `${featured.title} cover art`;
    }

    featuredMount.innerHTML = `
      <div class="featured-feature reveal">
        <div class="cover-frame">
          <img src="${featured.cover}" alt="${featured.title} cover art" />
        </div>
        <article class="release-detail">
          <p class="eyebrow">Featured Release</p>
          <h2>${featured.title}</h2>
          <p class="release-card__meta">${featuredArtist.name} / ${featured.type} / ${featured.year}</p>
          <p class="detail-copy">${featured.description}</p>
          <div class="chip-row">
            <span class="chip">${featured.vibe}</span>
            <span class="chip">${featured.tracks.length} tracks</span>
            <span class="chip">${featuredArtist.lane}</span>
          </div>
          <ol class="tracklist">
            ${featured.tracks
              .slice(0, 5)
              .map((track) => `<li>${track.title}</li>`)
              .join("")}
          </ol>
          ${
            featured.platforms.length
              ? `<div class="platform-row">
                  ${featured.platforms
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
          <div class="hero-actions">
            <a class="button" href="artist.html?artist=${featuredArtist.slug}&view=public">Open Artist Page</a>
            <a class="button button--ghost" href="catalog.html">Browse All Releases</a>
          </div>
        </article>
      </div>
    `;
  }

  function renderQuickLinks() {
    const primaryArtists = data.artists.slice(0, 4);

    quickLinks.innerHTML = primaryArtists
      .map(
        (artist) => `
          <article class="info-card reveal">
            <div class="stack-inline">
              <span class="mini-chip">${artist.lane}</span>
            </div>
            <h3>${artist.name}</h3>
            <p class="detail-copy">${artist.summary}</p>
            <div class="row-actions">
              <a class="text-button" href="artist.html?artist=${artist.slug}&view=public">Public</a>
              <a class="text-button" href="artist.html?artist=${artist.slug}&view=industry">Industry</a>
              <a class="text-button" href="artist.html?artist=${artist.slug}&view=press">Press Kit</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  renderStats();
  renderFeatured();
  renderQuickLinks();
  ui.revealOnScroll();
})();
