const data = window.PAWN_DATA;

const state = {
  search: "",
  status: "all",
  artist: "all",
  genre: "all",
  selectedArtist: data.artists[0] ? data.artists[0].slug : null,
  activeTrackKey: null
};

const releaseGrid = document.getElementById("release-grid");
const artistGrid = document.getElementById("artist-grid");
const artistSelector = document.getElementById("artist-selector");
const artistProfile = document.getElementById("artist-profile");
const vaultSummary = document.getElementById("vault-summary");
const vaultGrid = document.getElementById("vault-grid");
const merchPreviewGrid = document.getElementById("merch-preview-grid");
const roadmapGrid = document.getElementById("roadmap-grid");
const platformChipList = document.getElementById("platform-chip-list");
const controlSummary = document.getElementById("control-summary");
const controlGrid = document.getElementById("control-grid");
const resultsSummary = document.getElementById("results-summary");
const searchInput = document.getElementById("search-input");
const artistFilter = document.getElementById("artist-filter");
const genreFilter = document.getElementById("genre-filter");
const modal = document.getElementById("media-modal");
const modalTitle = document.getElementById("media-modal-title");
const modalSubtitle = document.getElementById("media-modal-subtitle");
const modalVideo = document.getElementById("media-modal-video");
const modalLyrics = document.getElementById("media-modal-lyrics");
const modalDownloads = document.getElementById("media-modal-downloads");

const artistMap = new Map(data.artists.map((artist) => [artist.slug, artist]));
const releaseMap = new Map(data.releases.map((release) => [release.slug, release]));

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function getInitials(text) {
  return text
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function countTracks(releases) {
  return releases.reduce((total, release) => total + release.tracks.length, 0);
}

function getArtistDisplayName(artistSlug) {
  if (artistSlug === "label") {
    return data.label.name;
  }

  const artist = artistMap.get(artistSlug);
  return artist ? artist.name : artistSlug;
}

function uniqueGenres() {
  return [...new Set(data.releases.flatMap((release) => release.genres))].sort();
}

function getAllTracks() {
  return data.releases.flatMap((release) =>
    release.tracks.map((track) => ({
      key: `${release.slug}::${track.slug}`,
      release,
      track,
      artist: artistMap.get(release.artist)
    }))
  );
}

function getTrackRecord(trackKey) {
  return getAllTracks().find((item) => item.key === trackKey) || null;
}

function allPlatforms() {
  const releasePlatforms = data.releases.flatMap((release) => {
    const directLinks = release.links
      .filter((link) => link.url)
      .map((link) => link.label);
    const presaveLinks =
      release.presave && release.presave.url ? [release.presave.label] : [];
    const youtubeCoverage = hasYouTubeCoverage(release) ? ["YouTube"] : [];
    return [...directLinks, ...presaveLinks, ...youtubeCoverage];
  });

  return [...new Set([...data.label.supportedPlatforms, ...releasePlatforms])];
}

function getStatusLabel(status) {
  if (status === "out") {
    return "Out now";
  }

  if (status === "presave") {
    return "Pre-save";
  }

  return "Archive";
}

function isSingle(release) {
  return release.type.toLowerCase() === "single";
}

function formatList(items) {
  if (items.length === 0) {
    return "nothing";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function hasYouTubeCoverage(release) {
  const releaseLink = release.links.find(
    (link) => link.label === "YouTube" && Boolean(link.url)
  );
  const trackVideo = release.tracks.some((track) => Boolean(track.youtubeId));

  return Boolean(releaseLink || trackVideo);
}

function getArtistReleases(artistSlug) {
  return data.releases
    .filter((release) => release.artist === artistSlug)
    .sort((left, right) => new Date(right.releaseDate) - new Date(left.releaseDate));
}

function getLatestRelease(releases) {
  return releases[0] || null;
}

function getUpcomingRelease(releases) {
  return releases.find((release) => release.status === "presave") || null;
}

function getExpectedPlatforms(release) {
  if (release.expectedPlatforms && release.expectedPlatforms.length) {
    return release.expectedPlatforms;
  }

  if (release.status === "presave") {
    return [release.presave ? release.presave.label : "Too.fm pre-save"];
  }

  return data.label.defaultStreamingPlatforms;
}

function getActualPlatforms(release) {
  const directLinks = release.links
    .filter((link) => Boolean(link.url))
    .map((link) => link.label);
  const presaveLinks =
    release.presave && release.presave.url ? [release.presave.label] : [];
  const youtubeCoverage = hasYouTubeCoverage(release) ? ["YouTube"] : [];

  return [...new Set([...directLinks, ...presaveLinks, ...youtubeCoverage])];
}

function getMissingPlatforms(release) {
  const actualPlatforms = getActualPlatforms(release);
  return getExpectedPlatforms(release).filter(
    (platform) => !actualPlatforms.includes(platform)
  );
}

function getCoveragePercent(release) {
  const expectedPlatforms = getExpectedPlatforms(release);

  if (expectedPlatforms.length === 0) {
    return 100;
  }

  const livePlatformCount = expectedPlatforms.filter((platform) =>
    getActualPlatforms(release).includes(platform)
  ).length;

  return Math.round((livePlatformCount / expectedPlatforms.length) * 100);
}

function getReleaseActionText(release) {
  const missingPlatforms = getMissingPlatforms(release);

  if (missingPlatforms.length === 0) {
    return release.status === "presave"
      ? "Pre-save is live for this stage. Add release-day streaming links when they exist."
      : "Platform coverage is complete for the destinations tracked right now.";
  }

  return `Add ${formatList(missingPlatforms)} to finish this rollout stage.`;
}

function getArtistStats(artistSlug) {
  const releases = getArtistReleases(artistSlug);

  return {
    releases,
    releaseCount: releases.length,
    trackCount: countTracks(releases),
    outCount: releases.filter((release) => release.status === "out").length,
    presaveCount: releases.filter((release) => release.status === "presave").length,
    latestRelease: getLatestRelease(releases),
    upcomingRelease: getUpcomingRelease(releases)
  };
}

function getCatalogDownloadCount() {
  return getAllTracks().filter((item) => item.track.fanDownloads.length > 0).length;
}

function getSuperfanConfiguredCount() {
  return getAllTracks().filter((item) => {
    const djCheckout = item.track.superfan.djPackage
      ? item.track.superfan.djPackage.checkoutUrl
      : "";
    return Boolean(item.track.superfan.checkoutUrl || djCheckout);
  }).length;
}

function getLyricsCount() {
  return getAllTracks().filter((item) => Boolean(item.track.lyrics)).length;
}

function populateFilters() {
  data.artists.forEach((artist) => {
    const option = document.createElement("option");
    option.value = artist.slug;
    option.textContent = artist.name;
    artistFilter.append(option);
  });

  uniqueGenres().forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.append(option);
  });
}

function renderStats() {
  document.getElementById("artist-count").textContent = data.artists.length;
  document.getElementById("release-count").textContent = data.releases.length;
  document.getElementById("track-count").textContent = countTracks(data.releases);
  document.getElementById("presave-count").textContent = data.releases.filter(
    (release) => release.status === "presave"
  ).length;
}

function renderSpotlight() {
  const spotlight =
    data.releases.find((release) => release.status === "presave") ||
    [...data.releases].sort(
      (left, right) => new Date(right.releaseDate) - new Date(left.releaseDate)
    )[0];

  if (!spotlight) {
    document.getElementById("spotlight-status").textContent = "Catalog ready for real data";
    document.getElementById("spotlight-title").textContent = "Add your first real release";
    document.getElementById("spotlight-meta").textContent =
      "Use the admin page to replace the demo catalog with live releases.";
    document.getElementById("spotlight-description").textContent =
      "Once a real release is saved, this spotlight can automatically feature your next pre-save or latest drop.";
    document.getElementById("spotlight-initials").textContent = "PI";
    document.getElementById("spotlight-links").innerHTML =
      '<a class="button" href="admin.html">Open Data Entry</a>';
    return;
  }

  const artist = artistMap.get(spotlight.artist);
  const spotlightLinks = document.getElementById("spotlight-links");
  const firstTrack = spotlight.tracks[0];

  document.getElementById("spotlight-status").textContent =
    spotlight.status === "presave" ? "Upcoming campaign" : "Latest catalog moment";
  document.getElementById("spotlight-title").textContent = spotlight.title;
  document.getElementById("spotlight-meta").textContent = `${artist.name} | ${
    spotlight.type
  } | ${formatDate(spotlight.releaseDate)}`;
  document.getElementById("spotlight-description").textContent =
    spotlight.description;
  document.getElementById("spotlight-initials").textContent = getInitials(
    spotlight.title
  );

  const spotlightCover = document.getElementById("spotlight-cover");
  spotlightCover.style.setProperty("--card-accent-1", spotlight.palette[0]);
  spotlightCover.style.setProperty("--card-accent-2", spotlight.palette[1]);

  spotlightLinks.innerHTML = "";

  const linksToRender =
    spotlight.status === "presave" && spotlight.presave
      ? [spotlight.presave]
      : spotlight.links.filter((link) => link.url);

  if (linksToRender.length === 0) {
    const note = document.createElement("p");
    note.className = "link-note";
    note.textContent =
      spotlight.status === "presave" && spotlight.presave
        ? spotlight.presave.note
        : "Add a live streaming destination here when this release is ready.";
    spotlightLinks.append(note);
    return;
  }

  linksToRender.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.className = "pill-link";
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.href = link.url;
    anchor.textContent = link.label;
    spotlightLinks.append(anchor);
  });

  if (firstTrack) {
    const button = document.createElement("button");
    button.className = "button button--ghost button--small";
    button.type = "button";
    button.dataset.openTrack = `${spotlight.slug}::${firstTrack.slug}`;
    button.textContent = "Open Lyrics + Video";
    spotlightLinks.append(button);
  }
}

function renderArtists() {
  artistGrid.innerHTML = "";

  data.artists.forEach((artist) => {
    const stats = getArtistStats(artist.slug);
    const card = document.createElement("article");
    card.className = "artist-card";

    card.innerHTML = `
      <div class="artist-card__swatch" style="--card-accent-1: ${artist.palette[0]}; --card-accent-2: ${artist.palette[1]};">
        <span>${artist.lane}</span>
      </div>
      <div class="artist-card__header">
        <h3>${artist.name}</h3>
        <span class="tag tag--muted">${artist.moods.join(" / ")}</span>
      </div>
      <p class="artist-card__summary">${artist.summary}</p>
      <div class="tag-row">
        <span class="tag">${stats.releaseCount} release${stats.releaseCount === 1 ? "" : "s"}</span>
        <span class="tag">${stats.trackCount} track${stats.trackCount === 1 ? "" : "s"}</span>
        ${
          stats.upcomingRelease
            ? '<span class="tag">pre-save active</span>'
            : '<span class="tag tag--muted">no live campaign yet</span>'
        }
      </div>
      <div class="artist-card__actions">
        <button class="button button--ghost button--small" type="button" data-artist-focus="${artist.slug}">
          Open dossier
        </button>
        <button class="button button--small" type="button" data-artist-filter="${artist.slug}">
          Show releases
        </button>
      </div>
    `;

    artistGrid.append(card);
  });
}

function renderArtistDossier() {
  if (!state.selectedArtist && data.artists[0]) {
    state.selectedArtist = data.artists[0].slug;
  }

  const artist = artistMap.get(state.selectedArtist);

  if (!artist) {
    artistSelector.innerHTML = "";
    artistProfile.innerHTML = "";
    return;
  }

  const stats = getArtistStats(artist.slug);
  const recentTracks = [...new Set(stats.releases.flatMap((release) => release.tracks))]
    .slice(0, 5)
    .map((track) => `<li>${track.title}</li>`)
    .join("");
  const recentReleases = stats.releases
    .slice(0, 3)
    .map(
      (release) => `
        <li>
          <strong>${release.title}</strong>
          <span>${release.type} | ${formatDate(release.releaseDate)}</span>
        </li>
      `
    )
    .join("");

  artistSelector.innerHTML = data.artists
    .map((entry) => {
      const entryStats = getArtistStats(entry.slug);
      const isActive = entry.slug === artist.slug;

      return `
        <button
          class="artist-selector__button${isActive ? " is-active" : ""}"
          type="button"
          data-artist-focus="${entry.slug}"
          aria-pressed="${isActive ? "true" : "false"}"
        >
          <span class="artist-selector__name">${entry.name}</span>
          <span class="artist-selector__lane">${entry.lane}</span>
          <span class="artist-selector__meta">${entryStats.releaseCount} release${
            entryStats.releaseCount === 1 ? "" : "s"
          } | ${entryStats.trackCount} track${entryStats.trackCount === 1 ? "" : "s"}</span>
        </button>
      `;
    })
    .join("");

  artistProfile.innerHTML = `
    <div class="artist-profile__hero">
      <div class="artist-profile__cover" style="--card-accent-1: ${artist.palette[0]}; --card-accent-2: ${artist.palette[1]};">
        <span>${getInitials(artist.name)}</span>
      </div>
      <div class="artist-profile__intro">
        <p class="eyebrow">Selected artist</p>
        <h3>${artist.name}</h3>
        <p class="artist-profile__headline">${artist.headline}</p>
        <div class="tag-row">
          ${artist.moods.map((mood) => `<span class="tag">${mood}</span>`).join("")}
          ${artist.signatures.map((signature) => `<span class="tag tag--muted">${signature}</span>`).join("")}
        </div>
      </div>
    </div>
    <div class="artist-profile__actions">
      <button class="button" type="button" data-artist-filter="${artist.slug}">
        Filter catalog to ${artist.name}
      </button>
      <button class="button button--ghost" type="button" data-jump="#vault">
        Jump to vault
      </button>
    </div>
    <div class="artist-profile__stats">
      <article class="mini-stat">
        <span class="mini-stat__value">${stats.releaseCount}</span>
        <span class="mini-stat__label">Releases loaded</span>
      </article>
      <article class="mini-stat">
        <span class="mini-stat__value">${stats.trackCount}</span>
        <span class="mini-stat__label">Tracks represented</span>
      </article>
      <article class="mini-stat">
        <span class="mini-stat__value">${stats.outCount}</span>
        <span class="mini-stat__label">Out now</span>
      </article>
      <article class="mini-stat">
        <span class="mini-stat__value">${stats.presaveCount}</span>
        <span class="mini-stat__label">Campaigns active</span>
      </article>
    </div>
    <div class="artist-profile__split">
      <div class="artist-profile__panel">
        <p class="eyebrow">World</p>
        <p>${artist.story}</p>
        <p class="artist-profile__focus-label">Current focus</p>
        <p>${artist.currentFocus}</p>
      </div>
      <div class="artist-profile__panel">
        <p class="eyebrow">Recent catalog</p>
        <ul class="profile-list">
          ${recentReleases || "<li>No releases added yet.</li>"}
        </ul>
        <p class="artist-profile__focus-label">Track highlights</p>
        <ul class="track-list">
          ${recentTracks || "<li>Add releases in data.js to populate this view.</li>"}
        </ul>
      </div>
      <div class="artist-profile__panel">
        <p class="eyebrow">EPK readiness</p>
        <div class="status-list">
          ${artist.epk
            .map(
              (item) => `
                <span class="status-chip status-chip--${item.status}">
                  ${item.label}: ${item.status}
                </span>
              `
            )
            .join("")}
        </div>
        <p class="artist-profile__focus-label">Release pulse</p>
        <div class="release-pulse">
          <div class="release-pulse__item">
            <strong>Latest</strong>
            <span>${
              stats.latestRelease
                ? `${stats.latestRelease.title} | ${formatDate(stats.latestRelease.releaseDate)}`
                : "No release loaded"
            }</span>
          </div>
          <div class="release-pulse__item">
            <strong>Upcoming</strong>
            <span>${
              stats.upcomingRelease
                ? `${stats.upcomingRelease.title} | campaign active`
                : "No pre-save currently loaded"
            }</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function releaseMatchesFilters(release, artist) {
  const trackTerms = release.tracks.map((track) => track.title);
  const matchesSearch =
    state.search.length === 0 ||
    [
      release.title,
      artist.name,
      artist.lane,
      artist.headline,
      ...release.genres,
      ...(release.tags || []),
      ...artist.moods,
      ...trackTerms
    ]
      .join(" ")
      .toLowerCase()
      .includes(state.search);

  const matchesStatus =
    state.status === "all" || release.status === state.status;
  const matchesArtist =
    state.artist === "all" || release.artist === state.artist;
  const matchesGenre =
    state.genre === "all" || release.genres.includes(state.genre);

  return matchesSearch && matchesStatus && matchesArtist && matchesGenre;
}

function getTrackRowMarkup(release, track) {
  const trackKey = `${release.slug}::${track.slug}`;
  const fanDownloadMarkup = track.fanDownloads.length
    ? track.fanDownloads
        .map(
          (download) =>
            `<a class="pill-link pill-link--small" href="${download.url}" download>${download.label}</a>`
        )
        .join("")
    : '<span class="tag tag--muted">fan downloads pending</span>';
  const superfanMarkup = track.superfan.checkoutUrl
    ? `<a class="pill-link pill-link--small" href="${track.superfan.checkoutUrl}" target="_blank" rel="noreferrer">Unlock superfan</a>`
    : '<span class="tag tag--muted">connect superfan checkout</span>';

  return `
    <article class="track-row">
      <div class="track-row__meta">
        <strong>${track.title}</strong>
        <span>${track.runtime}</span>
      </div>
      <div class="track-row__actions">
        <button
          class="button button--ghost button--small"
          type="button"
          data-open-track="${trackKey}"
        >
          Lyrics + Video
        </button>
        ${fanDownloadMarkup}
        ${superfanMarkup}
      </div>
    </article>
  `;
}

function getTrackPanelMarkup(release) {
  const trackList = `<div class="track-stack">${release.tracks
    .map((track) => getTrackRowMarkup(release, track))
    .join("")}</div>`;

  if (isSingle(release)) {
    return `
      <div class="track-panel track-panel--open">
        <p class="track-panel__label">Track list (${release.tracks.length})</p>
        ${trackList}
      </div>
    `;
  }

  return `
    <details>
      <summary>Track list (${release.tracks.length})</summary>
      ${trackList}
    </details>
  `;
}

function renderCatalog() {
  const filteredReleases = data.releases.filter((release) =>
    releaseMatchesFilters(release, artistMap.get(release.artist))
  );

  const summaryTrackCount = countTracks(filteredReleases);

  resultsSummary.textContent = `${filteredReleases.length} release${
    filteredReleases.length === 1 ? "" : "s"
  } found | ${summaryTrackCount} track${
    summaryTrackCount === 1 ? "" : "s"
  } represented`;

  releaseGrid.innerHTML = "";

  if (filteredReleases.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
      "No releases match the current filters yet. Try broadening the search or add new release entries in admin.html.";
    releaseGrid.append(empty);
    return;
  }

  filteredReleases
    .sort((left, right) => new Date(right.releaseDate) - new Date(left.releaseDate))
    .forEach((release) => {
      const artist = artistMap.get(release.artist);
      const expectedPlatforms = getExpectedPlatforms(release);
      const livePlatforms = getActualPlatforms(release);
      const card = document.createElement("article");
      card.className = "release-card";

      const linksMarkup = release.links.length
        ? release.links
            .map((link) => {
              if (!link.url) {
                return `<span class="tag tag--muted">${link.label} link pending</span>`;
              }

              return `<a class="pill-link" href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`;
            })
            .join("")
        : "";

      const presaveMarkup = release.presave
        ? release.presave.url
          ? `<a class="pill-link" href="${release.presave.url}" target="_blank" rel="noreferrer">${release.presave.label}</a>`
          : `<p class="link-note">${release.presave.note}</p>`
        : "";

      card.innerHTML = `
        <div class="release-card__cover" style="--card-accent-1: ${release.palette[0]}; --card-accent-2: ${release.palette[1]};">
          <span>${getInitials(release.title)}</span>
        </div>
        <div class="release-card__eyebrow">
          <span class="badge badge--${release.status}">${getStatusLabel(release.status)}</span>
          <span class="tag tag--muted">${release.type}</span>
        </div>
        <div class="release-card__header">
          <h3>${release.title}</h3>
          <div class="release-card__meta">
            <span>${artist.name}</span>
            <span>${formatDate(release.releaseDate)}</span>
          </div>
        </div>
        <p class="release-card__description">${release.description}</p>
        <div class="tag-row">
          ${release.genres.map((genre) => `<span class="tag">${genre}</span>`).join("")}
          <span class="tag tag--muted">${livePlatforms.length}/${expectedPlatforms.length} destinations live</span>
        </div>
        ${getTrackPanelMarkup(release)}
        <div class="release-card__links">
          ${presaveMarkup}
          ${linksMarkup}
        </div>
      `;

      releaseGrid.append(card);
    });
}

function renderVault() {
  const allTracks = getAllTracks();

  vaultSummary.innerHTML = `
    <article class="stat-card">
      <span class="stat-card__value">${getCatalogDownloadCount()}</span>
      <span class="stat-card__label">Tracks with MP3 and FLAC fan formats wired</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${getLyricsCount()}</span>
      <span class="stat-card__label">Tracks with lyric text loaded</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${allTracks.filter((item) => Boolean(item.track.youtubeId)).length}</span>
      <span class="stat-card__label">Tracks with live YouTube IDs connected</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${getSuperfanConfiguredCount()}</span>
      <span class="stat-card__label">Premium checkout links configured</span>
    </article>
  `;

  vaultGrid.innerHTML = "";

  if (allTracks.length === 0) {
    vaultGrid.innerHTML =
      '<div class="empty-state">No tracks are loaded yet. Add a release in admin.html and its tracks will appear here automatically.</div>';
    return;
  }

  allTracks.forEach((item) => {
    const card = document.createElement("article");
    card.className = "vault-card";

    card.innerHTML = `
      <div class="vault-card__header">
        <div>
          <p class="eyebrow">Track access</p>
          <h3>${item.track.title}</h3>
        </div>
        <span class="tag tag--muted">${item.track.runtime}</span>
      </div>
      <p class="vault-card__meta">${item.artist.name} | ${item.release.title}</p>
      <div class="tag-row">
        <span class="tag">${item.track.lyrics ? "lyrics loaded" : "lyrics pending"}</span>
        <span class="tag ${item.track.youtubeId ? "tag--ready" : "tag--muted"}">${
          item.track.youtubeId ? "YouTube live" : "YouTube ID pending"
        }</span>
      </div>
      <div class="vault-card__actions">
        <button
          class="button button--ghost button--small"
          type="button"
          data-open-track="${item.key}"
        >
          Open track lounge
        </button>
        ${item.track.fanDownloads
          .map(
            (download) =>
              `<a class="button button--small" href="${download.url}" download>${download.label}</a>`
          )
          .join("")}
      </div>
      <div class="vault-card__superfan">
        <strong>${item.track.superfan.title}</strong>
        <p>${item.track.superfan.description}</p>
        <div class="vault-card__superfan-actions">
          <span class="tag">${item.track.superfan.price}</span>
          <span class="tag tag--muted">${item.track.superfan.provider}</span>
          ${
            item.track.superfan.checkoutUrl
              ? `<a class="pill-link pill-link--small" href="${item.track.superfan.checkoutUrl}" target="_blank" rel="noreferrer">Unlock superfan</a>`
              : '<span class="tag tag--muted">checkout link needed</span>'
          }
        </div>
        ${
          item.track.superfan.djPackage
            ? `
              <div class="vault-card__dj">
                <strong>${item.track.superfan.djPackage.title}</strong>
                <p>${item.track.superfan.djPackage.description}</p>
                <div class="vault-card__superfan-actions">
                  <span class="tag">${item.track.superfan.djPackage.price}</span>
                  <span class="tag tag--ready">${item.track.superfan.djPackage.format}</span>
                  ${
                    item.track.superfan.djPackage.checkoutUrl
                      ? `<a class="pill-link pill-link--small" href="${item.track.superfan.djPackage.checkoutUrl}" target="_blank" rel="noreferrer">Unlock DJ pack</a>`
                      : '<span class="tag tag--muted">connect DJ pack checkout</span>'
                  }
                </div>
              </div>
            `
            : ""
        }
      </div>
    `;

    vaultGrid.append(card);
  });
}

function renderMerchPreview() {
  if (!merchPreviewGrid) {
    return;
  }

  merchPreviewGrid.innerHTML = "";

  if (data.merch.length === 0) {
    merchPreviewGrid.innerHTML =
      '<div class="empty-state">No merch items are loaded yet. Add merch entries later through the catalog workflow or keep this lane hidden until you are ready.</div>';
    return;
  }

  data.merch.slice(0, 4).forEach((item) => {
    const artist = item.artist === "label" ? null : artistMap.get(item.artist);
    const accentOne = artist ? artist.palette[0] : "#ffd12a";
    const accentTwo = artist ? artist.palette[1] : "#2457ff";
    const card = document.createElement("article");
    card.className = "merch-card";

    card.innerHTML = `
      <div
        class="merch-card__swatch"
        style="--merch-accent-1: ${accentOne}; --merch-accent-2: ${accentTwo};"
      >
        <span>${item.imageLabel}</span>
      </div>
      <div class="merch-card__meta">
        <span class="tag">${item.category}</span>
        <span class="tag tag--muted">${item.status}</span>
      </div>
      <div class="merch-card__copy">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
      <div class="merch-card__footer">
        <span class="tag">${item.price}</span>
        <span class="tag tag--muted">${getArtistDisplayName(item.artist)}</span>
      </div>
      <div class="merch-card__actions">
        ${
          item.url
            ? `<a class="button" href="${item.url}" target="_blank" rel="noreferrer">Buy merch</a>`
            : '<a class="button button--ghost" href="merch.html">View merch plan</a>'
        }
      </div>
    `;

    merchPreviewGrid.append(card);
  });
}

function renderModalTrack(trackRecord) {
  if (!trackRecord) {
    return;
  }

  state.activeTrackKey = trackRecord.key;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modalTitle.textContent = trackRecord.track.title;
  modalSubtitle.textContent = `${trackRecord.artist.name} | ${trackRecord.release.title} | ${trackRecord.track.runtime}`;
  modalLyrics.textContent =
    trackRecord.track.lyrics || "Add the full lyric text in data.js for this track.";

  if (trackRecord.track.youtubeId) {
    modalVideo.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${trackRecord.track.youtubeId}"
        title="${trackRecord.track.title} YouTube video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    `;
  } else {
    modalVideo.innerHTML = `
      <div class="video-frame__empty">
        <strong>YouTube ID pending</strong>
        <p>Add a track-level YouTube ID in <code>data.js</code> to embed the video here.</p>
      </div>
    `;
  }

  modalDownloads.innerHTML = `
    <article class="download-card">
      <p class="eyebrow">Fan downloads</p>
      <h3>Give listeners format choice</h3>
      <div class="download-card__actions">
        ${trackRecord.track.fanDownloads
          .map(
            (download) =>
              `<a class="button" href="${download.url}" download>${download.label} | ${download.format}</a>`
          )
          .join("")}
      </div>
    </article>
    <article class="download-card">
      <p class="eyebrow">Superfan unlock</p>
      <h3>${trackRecord.track.superfan.title}</h3>
      <p>${trackRecord.track.superfan.description}</p>
      <div class="tag-row">
        <span class="tag">${trackRecord.track.superfan.price}</span>
        <span class="tag tag--muted">${trackRecord.track.superfan.provider}</span>
      </div>
      ${
        trackRecord.track.superfan.checkoutUrl
          ? `<a class="button button--ghost" href="${trackRecord.track.superfan.checkoutUrl}" target="_blank" rel="noreferrer">Unlock offer</a>`
          : '<span class="tag tag--muted">Connect a paywall checkout URL to activate this offer.</span>'
      }
      ${
        trackRecord.track.superfan.djPackage
          ? `
            <div class="download-card__dj">
              <p class="eyebrow">Direct to DJ</p>
              <h3>${trackRecord.track.superfan.djPackage.title}</h3>
              <p>${trackRecord.track.superfan.djPackage.description}</p>
              <div class="tag-row">
                <span class="tag">${trackRecord.track.superfan.djPackage.price}</span>
                <span class="tag tag--ready">${trackRecord.track.superfan.djPackage.format}</span>
              </div>
              ${
                trackRecord.track.superfan.djPackage.checkoutUrl
                  ? `<a class="button" href="${trackRecord.track.superfan.djPackage.checkoutUrl}" target="_blank" rel="noreferrer">Unlock DJ pack</a>`
                  : '<span class="tag tag--muted">Connect checkout for DJ WAV delivery.</span>'
              }
            </div>
          `
          : ""
      }
    </article>
  `;
}

function closeModal() {
  modal.hidden = true;
  modalVideo.innerHTML = "";
  modalLyrics.textContent = "";
  modalDownloads.innerHTML = "";
  document.body.classList.remove("modal-open");
  state.activeTrackKey = null;
}

function renderControlRoom() {
  const readyReleases = data.releases.filter(
    (release) => getMissingPlatforms(release).length === 0
  ).length;
  const totalMissingPlatforms = data.releases.reduce(
    (total, release) => total + getMissingPlatforms(release).length,
    0
  );
  const presaveReady = data.releases.filter(
    (release) => release.status === "presave" && getMissingPlatforms(release).length === 0
  ).length;
  const representedArtists = new Set(data.releases.map((release) => release.artist)).size;

  controlSummary.innerHTML = `
    <article class="stat-card">
      <span class="stat-card__value">${readyReleases}</span>
      <span class="stat-card__label">Releases ready for this stage</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${totalMissingPlatforms}</span>
      <span class="stat-card__label">Destination slots still missing</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${presaveReady}</span>
      <span class="stat-card__label">Pre-save campaigns fully linked</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${representedArtists}</span>
      <span class="stat-card__label">Artist projects represented</span>
    </article>
  `;

  controlGrid.innerHTML = "";

  if (data.releases.length === 0) {
    controlGrid.innerHTML =
      '<div class="empty-state">No releases are loaded yet, so there is nothing to score for rollout readiness. Add real catalog entries in admin.html first.</div>';
    return;
  }

  [...data.releases]
    .sort((left, right) => {
      if (left.status === "presave" && right.status !== "presave") {
        return -1;
      }

      if (left.status !== "presave" && right.status === "presave") {
        return 1;
      }

      return new Date(right.releaseDate) - new Date(left.releaseDate);
    })
    .forEach((release) => {
      const artist = artistMap.get(release.artist);
      const expectedPlatforms = getExpectedPlatforms(release);
      const livePlatforms = getActualPlatforms(release);
      const missingPlatforms = getMissingPlatforms(release);
      const coveragePercent = getCoveragePercent(release);
      const card = document.createElement("article");
      card.className = "control-card";

      card.innerHTML = `
        <div class="control-card__header">
          <div>
            <p class="eyebrow">Release readiness</p>
            <h3>${release.title}</h3>
          </div>
          <span class="badge badge--${release.status}">${getStatusLabel(release.status)}</span>
        </div>
        <p class="control-card__meta">${artist.name} | ${release.type} | ${formatDate(
          release.releaseDate
        )}</p>
        <div class="control-card__progress">
          <div class="progress-bar" aria-hidden="true">
            <span style="width: ${coveragePercent}%;"></span>
          </div>
          <p>${livePlatforms.length} of ${expectedPlatforms.length} tracked destinations live</p>
        </div>
        <div class="tag-row">
          ${expectedPlatforms.map((platform) => {
            const isLive = livePlatforms.includes(platform);
            return `<span class="tag ${isLive ? "tag--ready" : "tag--muted"}">${platform}</span>`;
          }).join("")}
        </div>
        <p class="control-card__action">${getReleaseActionText(release)}</p>
        ${
          missingPlatforms.length
            ? `<p class="control-card__missing">Still missing: ${formatList(missingPlatforms)}</p>`
            : '<p class="control-card__missing control-card__missing--ready">Nothing missing for the currently tracked destinations.</p>'
        }
      `;

      controlGrid.append(card);
    });
}

function renderRoadmap() {
  roadmapGrid.innerHTML = "";

  data.roadmap.forEach((item) => {
    const card = document.createElement("article");
    card.className = "roadmap-card";
    card.innerHTML = `
      <div class="roadmap-card__header">
        <p class="eyebrow">Next feature</p>
        <span class="tag tag--muted">${item.status}</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    `;
    roadmapGrid.append(card);
  });
}

function renderPlatforms() {
  platformChipList.innerHTML = "";

  allPlatforms().forEach((platform) => {
    const chip = document.createElement("span");
    chip.className = "platform-chip";
    chip.textContent = platform;
    platformChipList.append(chip);
  });
}

function setArtistFilter(artistSlug) {
  state.artist = artistSlug;
  artistFilter.value = artistSlug;
  renderCatalog();
}

function setSelectedArtist(artistSlug) {
  if (!artistMap.has(artistSlug)) {
    return;
  }

  state.selectedArtist = artistSlug;
  renderArtistDossier();
}

function bindEvents() {
  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderCatalog();
  });

  artistFilter.addEventListener("change", (event) => {
    state.artist = event.target.value;

    if (event.target.value !== "all") {
      state.selectedArtist = event.target.value;
      renderArtistDossier();
    }

    renderCatalog();
  });

  genreFilter.addEventListener("change", (event) => {
    state.genre = event.target.value;
    renderCatalog();
  });

  document.querySelectorAll(".status-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.status = button.dataset.status;
      document
        .querySelectorAll(".status-tab")
        .forEach((tab) => {
          tab.classList.remove("is-active");
          tab.setAttribute("aria-selected", "false");
        });
      button.classList.add("is-active");
      button.setAttribute("aria-selected", "true");
      renderCatalog();
    });
  });

  document.addEventListener("click", (event) => {
    const focusButton = event.target.closest("[data-artist-focus]");

    if (focusButton) {
      setSelectedArtist(focusButton.dataset.artistFocus);
      document
        .getElementById("artist-dossier")
        .scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const filterButton = event.target.closest("[data-artist-filter]");

    if (filterButton) {
      const artistSlug = filterButton.dataset.artistFilter;
      setSelectedArtist(artistSlug);
      setArtistFilter(artistSlug);
      document
        .getElementById("catalog")
        .scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const jumpButton = event.target.closest("[data-jump]");

    if (jumpButton) {
      const target = document.querySelector(jumpButton.dataset.jump);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      return;
    }

    const openTrackButton = event.target.closest("[data-open-track]");

    if (openTrackButton) {
      const trackRecord = getTrackRecord(openTrackButton.dataset.openTrack);
      renderModalTrack(trackRecord);
      return;
    }

    if (event.target.closest("[data-close-modal]")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}

function setupReveal() {
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
      threshold: 0.2
    }
  );

  document.querySelectorAll(".reveal").forEach((section) => {
    observer.observe(section);
  });
}

function init() {
  populateFilters();
  renderStats();
  renderSpotlight();
  renderArtists();
  renderArtistDossier();
  renderCatalog();
  renderVault();
  renderMerchPreview();
  renderControlRoom();
  renderPlatforms();
  renderRoadmap();
  bindEvents();
  setupReveal();
}

init();
