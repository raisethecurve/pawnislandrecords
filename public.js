const publicData = window.PAWN_PUBLIC_DATA;

const artistMap = new Map(
  publicData.artists.map((artist) => [artist.slug, artist])
);
const releaseMap = new Map(
  publicData.releases.map((release) => [release.slug, release])
);

const heroMontage = document.getElementById("hero-montage");
const projectTicker = document.getElementById("project-ticker");
const featuredGrid = document.getElementById("featured-grid");
const artistGrid = document.getElementById("artist-grid");
const releaseNav = document.getElementById("release-nav");
const releasePanel = document.getElementById("release-panel");

const statProjects = document.getElementById("stat-projects");
const statReleases = document.getElementById("stat-releases");
const statTracks = document.getElementById("stat-tracks");

let activeReleaseSlug =
  publicData.heroMontage[0] || publicData.releases[0]?.slug || null;

function getArtist(slug) {
  return artistMap.get(slug);
}

function getRelease(slug) {
  return releaseMap.get(slug);
}

function countTracks() {
  return publicData.releases.reduce(
    (total, release) => total + release.tracks.length,
    0
  );
}

function renderStats() {
  statProjects.textContent = String(publicData.artists.length);
  statReleases.textContent = String(publicData.releases.length);
  statTracks.textContent = String(countTracks());
}

function renderTicker() {
  projectTicker.innerHTML = publicData.artists
    .map(
      (artist) =>
        `<span class="ticker-chip" style="--chip-accent:${artist.accent}">${artist.name}</span>`
    )
    .join("");
}

function renderHeroMontage() {
  heroMontage.innerHTML = publicData.heroMontage
    .map((slug, index) => {
      const release = getRelease(slug);
      const artist = getArtist(release.artist);
      const variantClass =
        index === 0
          ? "hero-shot hero-shot--large"
          : index === 1
            ? "hero-shot hero-shot--tall"
            : "hero-shot";

      return `
        <article class="${variantClass}" style="--accent:${release.accent}">
          <img
            src="${release.image}"
            alt="${release.title} artwork"
            style="object-position:${release.imagePosition}"
          />
          <div class="hero-shot__overlay">
            <span>${artist.name}</span>
            <strong>${release.title}</strong>
          </div>
        </article>
      `;
    })
    .join("");
}

function createTrackPreview(tracks, limit = 3) {
  return tracks
    .slice(0, limit)
    .map((track) => `<li>${track}</li>`)
    .join("");
}

function renderFeatured() {
  const featuredReleases = publicData.releases.filter((release) => release.featured);

  featuredGrid.innerHTML = featuredReleases
    .map((release, index) => {
      const artist = getArtist(release.artist);
      const cardClass = index === 0 ? "feature-card feature-card--wide" : "feature-card";

      return `
        <article class="${cardClass}" style="--accent:${release.accent}">
          <div class="feature-card__media">
            <img
              src="${release.image}"
              alt="${release.title} artwork"
              loading="lazy"
              style="object-position:${release.imagePosition}"
            />
          </div>
          <div class="feature-card__body">
            <p class="eyebrow">${release.status}</p>
            <h3>${release.title}</h3>
            <p class="feature-card__meta">${artist.name} / ${release.format}</p>
            <p class="feature-card__summary">${release.summary}</p>
            <ol class="feature-card__tracks">
              ${createTrackPreview(release.tracks)}
            </ol>
            <button
              class="button button--secondary"
              type="button"
              data-release-target="${release.slug}"
              data-scroll-target="listening-room"
            >
              Open In Listening Room
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderArtists() {
  artistGrid.innerHTML = publicData.artists
    .map((artist) => {
      const release = getRelease(artist.releaseSlug);

      return `
        <article class="artist-card" style="--accent:${artist.accent}">
          <div class="artist-card__media">
            <img
              src="${artist.image}"
              alt="${artist.name} artwork"
              loading="lazy"
              style="object-position:${artist.imagePosition}"
            />
          </div>
          <div class="artist-card__body">
            <p class="eyebrow">Project</p>
            <h3>${artist.name}</h3>
            <p class="artist-card__lane">${artist.lane}</p>
            <p class="artist-card__summary">${artist.summary}</p>
            <div class="artist-card__footer">
              <span class="artist-card__release">Current world: ${release.title}</span>
              <button
                class="text-link"
                type="button"
                data-release-target="${release.slug}"
                data-scroll-target="listening-room"
              >
                View tracks
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderReleaseNav() {
  releaseNav.innerHTML = publicData.releases
    .map((release) => {
      const artist = getArtist(release.artist);
      const isActive = release.slug === activeReleaseSlug;

      return `
        <button
          class="release-nav__button${isActive ? " is-active" : ""}"
          type="button"
          data-release-target="${release.slug}"
          aria-pressed="${isActive}"
        >
          <span class="release-nav__title">${release.title}</span>
          <span class="release-nav__meta">${artist.name} / ${release.format}</span>
        </button>
      `;
    })
    .join("");
}

function renderReleasePanel(slug) {
  const release = getRelease(slug);
  const artist = getArtist(release.artist);

  releasePanel.innerHTML = `
    <div class="release-panel__media">
      <img
        src="${release.image}"
        alt="${release.title} artwork"
        style="object-position:${release.imagePosition}"
      />
    </div>
    <div class="release-panel__body">
      <p class="eyebrow">Listening Room</p>
      <h3>${release.title}</h3>
      <p class="release-panel__meta">${artist.name} / ${release.format}</p>
      <p class="release-panel__summary">${release.summary}</p>
      <div class="release-panel__chips">
        <span class="info-chip">${release.status}</span>
        <span class="info-chip">${release.tracks.length} tracks listed</span>
        <span class="info-chip">${artist.lane}</span>
      </div>
      <p class="release-panel__note">${release.note}</p>
      <ol class="tracklist">
        ${release.tracks.map((track) => `<li>${track}</li>`).join("")}
      </ol>
    </div>
  `;
}

function setActiveRelease(slug, shouldScroll) {
  activeReleaseSlug = slug;
  renderReleaseNav();
  renderReleasePanel(slug);

  if (shouldScroll) {
    const section = document.getElementById("listening-room");
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function bindInteractions() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-release-target]");

    if (!trigger) {
      return;
    }

    const slug = trigger.getAttribute("data-release-target");
    const shouldScroll = Boolean(trigger.getAttribute("data-scroll-target"));

    if (!releaseMap.has(slug)) {
      return;
    }

    setActiveRelease(slug, shouldScroll);
  });
}

function bindReveal() {
  const items = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.18
    }
  );

  items.forEach((item) => observer.observe(item));
}

function init() {
  renderStats();
  renderTicker();
  renderHeroMontage();
  renderFeatured();
  renderArtists();
  renderReleaseNav();

  if (activeReleaseSlug) {
    renderReleasePanel(activeReleaseSlug);
  }

  bindInteractions();
  bindReveal();
}

init();
