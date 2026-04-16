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

  function youtubeEmbedUrl(videoId) {
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  function youtubeWatchUrl(videoId) {
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";
  }

  function releaseUrl(slug) {
    return `release.html?release=${encodeURIComponent(slug)}`;
  }

  function artistUrl(slug) {
    return `artist.html?artist=${encodeURIComponent(slug)}&view=public`;
  }

  function splitVibe(text) {
    return String(text || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  function platformEntries() {
    const presets = Array.isArray(data.label && data.label.platformPresets)
      ? data.label.platformPresets
      : [];
    const linkedPlatforms = Array.isArray(release && release.platforms)
      ? release.platforms
      : [];
    const order = [...new Set([...presets, ...linkedPlatforms.map((item) => item.label)])];

    return order.map((label) => {
      const active = linkedPlatforms.find((item) => item.label === label);
      return {
        label,
        url: active ? active.url : ""
      };
    });
  }

  function preferredTrackIndex() {
    const tracks = Array.isArray(release && release.tracks) ? release.tracks : [];
    const videoIndex = tracks.findIndex((track) => Boolean(track.youtubeId));
    return videoIndex >= 0 ? videoIndex : 0;
  }

  function setVisualTheme() {
    const accent = (release && release.accent) || (artist && artist.accent) || "#d8c7a1";
    const backdropImage = String((release && release.cover) || (artist && artist.image) || "").trim();

    if (ui && ui.applyExperienceTheme) {
      ui.applyExperienceTheme({
        accent,
        image: backdropImage,
        backdropId: "release-backdrop"
      });
    }
  }

  function renderNotFound() {
    document.title = "Release Not Found | Pawn Island Records";
    page.innerHTML = `
      <section class="empty-state">
        <p class="eyebrow">Release</p>
        <h2>That release page is not available.</h2>
        <p>Return to the main stage to choose another project from the catalog.</p>
        <a class="action-link" href="index.html">Back to Homepage</a>
      </section>
    `;
  }

  if (!release || !artist) {
    renderNotFound();
    return;
  }

  const state = {
    activeTrackIndex: preferredTrackIndex()
  };

  const relatedReleases = ui && ui.getArtistReleases
    ? ui.getArtistReleases(artist.slug).filter((entry) => entry.slug !== release.slug)
    : (data.releases || []).filter((entry) => entry.artist === artist.slug && entry.slug !== release.slug);

  const releaseCover = document.getElementById("release-cover");
  const releaseKicker = document.getElementById("release-kicker");
  const releaseTitle = document.getElementById("release-title");
  const releaseArtist = document.getElementById("release-artist");
  const releaseSummary = document.getElementById("release-summary");
  const releaseChips = document.getElementById("release-chips");
  const releasePlatforms = document.getElementById("release-platforms");
  const releaseStoryHeading = document.getElementById("release-story-heading");
  const releaseDescription = document.getElementById("release-description");
  const artistName = document.getElementById("artist-name");
  const artistHeadline = document.getElementById("artist-headline");
  const artistStory = document.getElementById("artist-story");
  const artistPageLink = document.getElementById("artist-page-link");
  const headerArtistLink = document.getElementById("header-artist-link");
  const trackworldCopy = document.getElementById("trackworld-copy");
  const trackList = document.getElementById("track-list");
  const trackViewer = document.getElementById("track-viewer");
  const releaseFooter = document.getElementById("release-footer");
  const metaDescription = document.getElementById("release-meta-description");

  function renderHero() {
    const chips = [
      release.type,
      release.year,
      `${release.tracks.length} ${release.tracks.length === 1 ? "track" : "tracks"}`,
      ...splitVibe(release.vibe)
    ].filter(Boolean);
    const platformList = platformEntries();

    releaseCover.src = release.cover;
    releaseCover.alt = `${release.title} cover art`;
    releaseKicker.textContent = [release.type, release.year].filter(Boolean).join(" / ") || "Release";
    releaseTitle.textContent = release.title;
    releaseArtist.textContent = artist.name;
    releaseSummary.textContent = release.description || artist.summary || "";
    releaseChips.innerHTML = chips.map((chip) => `<span class="chip">${chip}</span>`).join("");
    releasePlatforms.innerHTML = platformList
      .map((platform) => {
        if (platform.url) {
          return `
            <a class="platform-pill platform-pill--live" href="${platform.url}" target="_blank" rel="noreferrer">
              <strong>${platform.label}</strong>
              <span>Open platform</span>
            </a>
          `;
        }

        return `
          <div class="platform-pill platform-pill--pending" aria-disabled="true">
            <strong>${platform.label}</strong>
            <span>Destination coming soon</span>
          </div>
        `;
      })
      .join("");
  }

  function renderStory() {
    releaseStoryHeading.textContent = `Inside ${release.title}`;
    releaseDescription.textContent = release.description || artist.summary || "";
    artistName.textContent = artist.name;
    artistHeadline.textContent = artist.headline || artist.summary || "";
    artistStory.textContent = artist.story || artist.summary || "";
    artistPageLink.href = artistUrl(artist.slug);
    headerArtistLink.href = artistUrl(artist.slug);
  }

  function renderTrackList() {
    trackList.innerHTML = release.tracks
      .map((track, index) => `
        <button
          class="track-button ${index === state.activeTrackIndex ? "is-active" : ""}"
          type="button"
          data-track-index="${index}"
        >
          <div class="track-button__topline">
            <span class="track-button__index">Track ${String(index + 1).padStart(2, "0")}</span>
            ${track.runtime ? `<span class="track-button__meta">${track.runtime}</span>` : ""}
          </div>
          <span class="track-button__title">${track.title}</span>
          <span class="track-button__meta">${track.youtubeId ? "Video ready" : "Video pending"}</span>
        </button>
      `)
      .join("");
  }

  function renderTrackViewer() {
    const track = release.tracks[state.activeTrackIndex];
    const videoCount = release.tracks.filter((entry) => Boolean(entry.youtubeId)).length;

    trackworldCopy.textContent = videoCount
      ? "Choose a track to move through the release with its connected video."
      : "The track layout is ready for official videos, visualizers, or performance clips as they go live.";

    if (!track) {
      trackViewer.innerHTML = `
        <div class="video-empty">
          <div class="video-empty__copy">
            <p class="eyebrow">Track</p>
            <h3>No track selected</h3>
            <p>Choose a track from the list to open its video panel.</p>
          </div>
        </div>
      `;
      return;
    }

    trackViewer.innerHTML = `
      <div class="trackviewer-panel__header">
        <p class="eyebrow">Selected Track</p>
        <h3>${track.title}</h3>
        <p class="track-meta">
          ${[
            release.title,
            track.runtime || "",
            track.youtubeId ? "Official video connected" : "Video slot ready"
          ].filter(Boolean).join(" / ")}
        </p>
      </div>
      ${
        track.youtubeId
          ? `<div class="video-frame">
              <iframe
                src="${youtubeEmbedUrl(track.youtubeId)}"
                title="${track.title} by ${artist.name}"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>`
          : `<div class="video-empty">
              <div class="video-empty__copy">
                <p class="eyebrow">Video</p>
                <h3>${track.title}</h3>
                <p>
                  This slot is ready for an official video, visualizer, or live performance once the
                  YouTube link is attached.
                </p>
              </div>
            </div>`
      }
      <div class="trackviewer-panel__actions">
        ${
          track.youtubeId
            ? `<a class="action-link" href="${youtubeWatchUrl(track.youtubeId)}" target="_blank" rel="noreferrer">Watch on YouTube</a>`
            : ""
        }
        <a class="action-link" href="${artistUrl(artist.slug)}">Open Artist Page</a>
      </div>
    `;
  }

  function renderFooter() {
    const relatedCards = relatedReleases.length
      ? relatedReleases.slice(0, 2).map((entry) => `
          <article class="footer-card">
            <span class="footer-card__eyebrow">More from ${artist.name}</span>
            <h3>${entry.title}</h3>
            <p>${entry.description || artist.summary || ""}</p>
            <div class="footer-actions">
              <a class="action-link" href="${releaseUrl(entry.slug)}">Open release</a>
            </div>
          </article>
        `).join("")
      : "";

    releaseFooter.innerHTML = `
      <div class="release-footer__grid">
        <article class="footer-card">
          <span class="footer-card__eyebrow">Continue</span>
          <h3>${artist.name}</h3>
          <p>${artist.summary || artist.headline || ""}</p>
          <div class="footer-actions">
            <a class="action-link" href="${artistUrl(artist.slug)}">Open artist page</a>
            <a class="action-link" href="index.html">Back to homepage</a>
          </div>
        </article>
        ${
          relatedCards ||
          `<article class="footer-card">
            <span class="footer-card__eyebrow">Catalog</span>
            <h3>Stay in the release world.</h3>
            <p>Return to the stage to move across the rest of the catalog.</p>
            <div class="footer-actions">
              <a class="action-link" href="index.html">Explore the homepage reel</a>
            </div>
          </article>`
        }
      </div>
    `;
  }

  function applyMeta() {
    document.title = `${release.title} | ${artist.name} | Pawn Island Records`;

    if (ui && ui.setMetaDescription) {
      ui.setMetaDescription(
        `${release.title} by ${artist.name}. ${release.description || artist.summary || "Explore the release, artist story, platform links, and track videos."}`
      );
    } else if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `${release.title} by ${artist.name}. ${release.description || artist.summary || "Explore the release, artist story, platform links, and track videos."}`
      );
    }
  }

  trackList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-track-index]");

    if (!button) {
      return;
    }

    state.activeTrackIndex = Number(button.getAttribute("data-track-index")) || 0;
    renderTrackList();
    renderTrackViewer();
  });

  setVisualTheme();
  applyMeta();
  renderHero();
  renderStory();
  renderTrackList();
  renderTrackViewer();
  renderFooter();

  if (ui && ui.revealOnScroll) {
    ui.revealOnScroll();
  } else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
  }
})();
