(function () {
  const ui = window.PAWN_UI;
  const PUBLISHED_DATA = window.PAWN_PUBLIC_DATA || {
    label: {
      name: "Pawn Island Records",
      platformPresets: []
    },
    artists: [],
    releases: [],
    merch: []
  };

  const elements = {
    status: document.getElementById("editor-status"),
    stats: document.getElementById("editor-stats"),
    releaseForm: document.getElementById("release-form"),
    releaseTitle: document.getElementById("release-title"),
    releaseArtist: document.getElementById("release-artist"),
    releaseType: document.getElementById("release-type"),
    releaseYear: document.getElementById("release-year"),
    releaseVibe: document.getElementById("release-vibe"),
    releaseAccent: document.getElementById("release-accent"),
    releaseDescription: document.getElementById("release-description"),
    releaseYoutubeId: document.getElementById("release-youtube-id"),
    releasePrimaryEmbedLabel: document.getElementById("release-primary-embed-label"),
    releasePrimaryEmbedUrl: document.getElementById("release-primary-embed-url"),
    releaseCover: document.getElementById("release-cover"),
    releaseCoverUpload: document.getElementById("release-cover-upload"),
    releaseCoverPreview: document.getElementById("release-cover-preview"),
    inlineArtistFields: document.getElementById("inline-artist-fields"),
    inlineArtistName: document.getElementById("inline-artist-name"),
    inlineArtistLane: document.getElementById("inline-artist-lane"),
    inlineArtistSummary: document.getElementById("inline-artist-summary"),
    trackList: document.getElementById("track-list"),
    addTrack: document.getElementById("add-track"),
    platformPresets: document.getElementById("platform-presets"),
    platformList: document.getElementById("platform-list"),
    addPlatform: document.getElementById("add-platform"),
    releasePreview: document.getElementById("release-preview"),
    releaseList: document.getElementById("release-list"),
    resetReleaseForm: document.getElementById("reset-release-form"),
    artistForm: document.getElementById("artist-form"),
    artistProfileSelect: document.getElementById("artist-profile-select"),
    artistName: document.getElementById("artist-name"),
    artistLane: document.getElementById("artist-lane"),
    artistAccent: document.getElementById("artist-accent"),
    artistImage: document.getElementById("artist-image"),
    artistImageUpload: document.getElementById("artist-image-upload"),
    artistSummary: document.getElementById("artist-summary"),
    artistHeadline: document.getElementById("artist-headline"),
    artistStory: document.getElementById("artist-story"),
    artistIndustryPitch: document.getElementById("artist-industry-pitch"),
    artistPressBio: document.getElementById("artist-press-bio"),
    artistPressHighlights: document.getElementById("artist-press-highlights"),
    artistPressAssets: document.getElementById("artist-press-assets"),
    artistMerchIntro: document.getElementById("artist-merch-intro"),
    artistImagePreview: document.getElementById("artist-image-preview"),
    artistList: document.getElementById("artist-list"),
    resetArtistForm: document.getElementById("reset-artist-form"),
    downloadJson: document.getElementById("download-json"),
    downloadScript: document.getElementById("download-script"),
    loadJson: document.getElementById("load-json"),
    resetData: document.getElementById("reset-data"),
    importFile: document.getElementById("import-file"),
    importJson: document.getElementById("import-json"),
    catalogJson: document.getElementById("catalog-json")
  };

  const state = {
    editingReleaseSlug: "",
    editingArtistSlug: "",
    data: null
  };

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function uniqueTextList(values) {
    return [...new Set(
      ensureArray(values)
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )];
  }

  function slugify(text, fallback) {
    const normalized = String(text || fallback || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return normalized || String(fallback || "entry");
  }

  function normalizeTrack(track, index) {
    return {
      title: String((track && track.title) || `Track ${index + 1}`).trim(),
      runtime: String((track && track.runtime) || "").trim(),
      youtubeId: String((track && track.youtubeId) || "").trim()
    };
  }

  function normalizePlatform(platform, index) {
    return {
      label: String((platform && platform.label) || `Platform ${index + 1}`).trim(),
      url: String((platform && platform.url) || "").trim()
    };
  }

  function normalizeArtist(artist, index) {
    const name = String((artist && artist.name) || `Artist ${index + 1}`).trim();

    return {
      slug: slugify(artist && artist.slug ? artist.slug : name, `artist-${index + 1}`),
      name,
      lane: String((artist && artist.lane) || "").trim(),
      accent: String((artist && artist.accent) || "#b77924").trim(),
      image: String((artist && artist.image) || "").trim(),
      summary: String((artist && artist.summary) || "").trim(),
      headline: String((artist && artist.headline) || "").trim(),
      story: String((artist && artist.story) || "").trim(),
      industryPitch: String((artist && artist.industryPitch) || "").trim(),
      pressBio: String((artist && artist.pressBio) || "").trim(),
      pressHighlights: uniqueTextList(artist && artist.pressHighlights),
      pressAssets: uniqueTextList(artist && artist.pressAssets),
      merchIntro: String((artist && artist.merchIntro) || "").trim()
    };
  }

  function normalizeRelease(release, index, artists) {
    const artistSlug = String((release && release.artist) || (artists[0] && artists[0].slug) || "artist").trim();
    const validArtistSlug = artists.some((artist) => artist.slug === artistSlug)
      ? artistSlug
      : (artists[0] && artists[0].slug) || "artist";
    const title = String((release && release.title) || `Release ${index + 1}`).trim();

    return {
      slug: slugify(release && release.slug ? release.slug : `${validArtistSlug}-${title}`, `release-${index + 1}`),
      aliases: uniqueTextList(release && release.aliases),
      artist: validArtistSlug,
      title,
      type: String((release && release.type) || "Single").trim(),
      vibe: String((release && release.vibe) || "").trim(),
      year: String((release && release.year) || "").trim(),
      status: String((release && release.status) || "").trim(),
      releaseDate: String((release && release.releaseDate) || "").trim(),
      accent: String((release && release.accent) || "#b77924").trim(),
      cover: String((release && release.cover) || "").trim(),
      description: String((release && release.description) || "").trim(),
      tooFmUrl: String((release && (release.tooFmUrl || release.toofmUrl || release.campaignUrl)) || "").trim(),
      campaignUrl: String((release && (release.campaignUrl || release.tooFmUrl || release.toofmUrl)) || "").trim(),
      primaryEmbedLabel: String((release && release.primaryEmbedLabel) || "").trim(),
      primaryEmbedUrl: String((release && release.primaryEmbedUrl) || "").trim(),
      youtubeId: String((release && release.youtubeId) || "").trim(),
      platforms: ensureArray(release && release.platforms).map(normalizePlatform).filter((platform) => platform.label || platform.url),
      tracks: ensureArray(release && release.tracks).map(normalizeTrack).filter((track) => track.title)
    };
  }

  function normalizeMerch(item, index, artists) {
    const title = String((item && item.title) || `Merch ${index + 1}`).trim();
    const artistSlug = String((item && item.artist) || (artists[0] && artists[0].slug) || "artist").trim();
    const validArtistSlug = artists.some((artist) => artist.slug === artistSlug)
      ? artistSlug
      : (artists[0] && artists[0].slug) || "artist";

    return {
      slug: slugify(item && item.slug ? item.slug : title, `merch-${index + 1}`),
      artist: validArtistSlug,
      title,
      price: String((item && item.price) || "").trim(),
      description: String((item && item.description) || "").trim(),
      image: String((item && item.image) || "").trim(),
      url: String((item && item.url) || "").trim()
    };
  }

  function normalizeData(input) {
    const base = input && typeof input === "object" ? input : {};
    const label = base.label && typeof base.label === "object" ? base.label : {};
    const seedLabel = PUBLISHED_DATA.label && typeof PUBLISHED_DATA.label === "object" ? PUBLISHED_DATA.label : {};
    const hasArtists = Array.isArray(base.artists);
    const hasReleases = Array.isArray(base.releases);
    const hasMerch = Array.isArray(base.merch);
    const normalizedArtists = (hasArtists ? base.artists : PUBLISHED_DATA.artists).map(normalizeArtist);
    const releaseSource = hasReleases ? base.releases : PUBLISHED_DATA.releases;
    const merchSource = hasMerch ? base.merch : PUBLISHED_DATA.merch;
    const releases = ensureArray(releaseSource).map((release, index) => normalizeRelease(release, index, normalizedArtists));
    const merch = ensureArray(merchSource).map((item, index) => normalizeMerch(item, index, normalizedArtists));

    return {
      label: {
        name: String(label.name || seedLabel.name || "Pawn Island Records").trim(),
        tagline: String(label.tagline || seedLabel.tagline || "").trim(),
        intro: String(label.intro || seedLabel.intro || "").trim(),
        identityLine: String((label.identityLine || seedLabel.identityLine || "")).trim(),
        aboutText: String((label.aboutText || seedLabel.aboutText || "")).trim(),
        about: String((label.about || seedLabel.about || "")).trim(),
        ethos: String((label.ethos || seedLabel.ethos || "")).trim(),
        launchMode: String(label.launchMode || seedLabel.launchMode || "full").trim().toLowerCase(),
        featuredCampaignTitle: String((label.featuredCampaignTitle || seedLabel.featuredCampaignTitle || "")).trim(),
        featuredCampaignSummary: String((label.featuredCampaignSummary || seedLabel.featuredCampaignSummary || "")).trim(),
        featuredCampaignUrl: String((label.featuredCampaignUrl || seedLabel.featuredCampaignUrl || "")).trim(),
        campaignUrl: String((label.campaignUrl || seedLabel.campaignUrl || "")).trim(),
        defaultTooFmUrl: String((label.defaultTooFmUrl || seedLabel.defaultTooFmUrl || "")).trim(),
        catalogPlaylistUrl: String((label.catalogPlaylistUrl || seedLabel.catalogPlaylistUrl || "")).trim(),
        streamingPlatforms: uniqueTextList(
          Array.isArray(label.streamingPlatforms) ? label.streamingPlatforms : seedLabel.streamingPlatforms
        ),
        timeline: ensureArray(Array.isArray(label.timeline) ? label.timeline : seedLabel.timeline).map((item) => ({
          label: String((item && item.label) || "").trim(),
          title: String((item && item.title) || "").trim(),
          text: String((item && item.text) || "").trim()
        })),
        platformPresets: uniqueTextList(
          Array.isArray(label.platformPresets) ? label.platformPresets : seedLabel.platformPresets
        )
      },
      artists: normalizedArtists,
      releases,
      merch
    };
  }

  const seedData = normalizeData(PUBLISHED_DATA);

  function loadData() {
    if (!state.data) {
      state.data = deepClone(seedData);
    }

    return state.data;
  }

  function saveData(nextData) {
    state.data = normalizeData(nextData);
    return state.data;
  }

  function resetDataToSeed() {
    state.data = deepClone(seedData);
    return state.data;
  }

  function upsertBySlug(list, item) {
    const nextList = [...list];
    const existingIndex = nextList.findIndex((entry) => entry.slug === item.slug);

    if (existingIndex === -1) {
      nextList.push(item);
      return nextList;
    }

    nextList[existingIndex] = item;
    return nextList;
  }

  function exportJson(data) {
    return JSON.stringify(normalizeData(data || loadData()), null, 2);
  }

  function exportScript(data) {
    return `window.PAWN_PUBLIC_DATA = ${exportJson(data || loadData())};\n`;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function lineList(value) {
    return [...new Set(
      String(value || "")
        .split(/\r?\n/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    )];
  }

  function setStatus(message, tone) {
    elements.status.textContent = message;
    elements.status.dataset.tone = tone || "info";
  }

  function countTracks(releases) {
    return releases.reduce((total, release) => total + release.tracks.length, 0);
  }

  function countLinkedPlatforms(releases) {
    return releases.reduce((total, release) => total + release.platforms.length, 0);
  }

  function releaseRecencyValue(release, index) {
    const parsedDate = parseReleaseDateValue(release && release.releaseDate);

    if (parsedDate) {
      return parsedDate.getTime();
    }

    const year = Number.parseInt(String((release && release.year) || "").trim(), 10);

    if (Number.isFinite(year)) {
      return new Date(year, 11, 31).getTime();
    }

    return index;
  }

  function parseReleaseDateValue(value) {
    const raw = String(value || "").trim();
    const isoMatch = raw.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);

    if (!isoMatch) {
      return null;
    }

    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    const parsed = new Date(year, month - 1, day);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
      return null;
    }

    return parsed;
  }

  function releaseTypeWeightValue(release) {
    const weights = {
      album: 3,
      ep: 2,
      single: 1
    };

    return weights[String((release && release.type) || "").trim().toLowerCase()] || 0;
  }

  function releaseTieBreakKeyValue(release) {
    return [
      String((release && release.artist) || "").trim().toLowerCase(),
      String((release && release.title) || "").trim().toLowerCase(),
      String((release && release.slug) || "").trim().toLowerCase()
    ].join("::");
  }

  function compareReleaseTieBreakValue(left, right) {
    const typeDelta = releaseTypeWeightValue(right) - releaseTypeWeightValue(left);

    if (typeDelta) {
      return typeDelta;
    }

    return releaseTieBreakKeyValue(left).localeCompare(releaseTieBreakKeyValue(right));
  }

  function compareFeaturedReleaseValue(left, right, direction) {
    const multiplier = direction === "asc" ? 1 : -1;
    const leftDate = parseReleaseDateValue(left && left.releaseDate);
    const rightDate = parseReleaseDateValue(right && right.releaseDate);
    const dateDelta = (leftDate.getTime() - rightDate.getTime()) * multiplier;

    if (dateDelta) {
      return dateDelta;
    }

    return compareReleaseTieBreakValue(left, right);
  }

  function releaseStateValue(release) {
    return ui && ui.releaseState
      ? ui.releaseState(release)
      : String((release && release.status) || "").trim().toLowerCase();
  }

  function featuredRelease(data) {
    const datedReleases = data.releases.filter((release) => parseReleaseDateValue(release && release.releaseDate));
    const publishedDatedReleases = datedReleases
      .filter((release) => releaseStateValue(release) !== "upcoming")
      .sort((left, right) => compareFeaturedReleaseValue(left, right, "desc"));

    if (publishedDatedReleases.length) {
      return publishedDatedReleases[0];
    }

    const upcomingDatedReleases = datedReleases
      .filter((release) => releaseStateValue(release) === "upcoming")
      .sort((left, right) => compareFeaturedReleaseValue(left, right, "asc"));

    if (upcomingDatedReleases.length) {
      return upcomingDatedReleases[0];
    }

    return [...data.releases]
      .map((release, index) => ({
        release,
        recency: releaseRecencyValue(release, index)
      }))
      .sort((left, right) => right.recency - left.recency)
      .map((entry) => entry.release)[0] || null;
  }

  function downloadText(filename, content, type) {
    ui.downloadText(filename, content, type);
  }

  function coverPreviewMarkup(src, alt, options) {
    const settings = options && typeof options === "object" ? options : {};
    const artwork = ui && ui.artworkImageMarkup
      ? ui.artworkImageMarkup({
          src,
          title: settings.title || "Untitled artwork",
          subtitle: settings.subtitle || "Placeholder artwork",
          accent: settings.accent || "#d8c7a1",
          alt: alt || settings.title || "Artwork preview",
          format: settings.format || "square",
          loading: "eager"
        })
      : `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`;

    return `
      <div class="cover-frame">
        ${artwork}
      </div>
    `;
  }

  function getArtistNameForReleasePreview() {
    if (elements.releaseArtist.value === "__new__") {
      return elements.inlineArtistName.value.trim() || "New artist";
    }

    const data = loadData();
    const artist = data.artists.find((entry) => entry.slug === elements.releaseArtist.value);
    return artist ? artist.name : "Select artist";
  }

  function renderStats() {
    const data = loadData();
    const featured = featuredRelease(data);
    const featuredArtist = featured ? data.artists.find((artist) => artist.slug === featured.artist) : null;

    elements.stats.innerHTML = `
      <article class="stat-card">
        <strong>${data.artists.length}</strong>
        <span>Artist pages</span>
      </article>
      <article class="stat-card">
        <strong>${data.releases.length}</strong>
        <span>Releases</span>
      </article>
      <article class="stat-card">
        <strong>${countTracks(data.releases)}</strong>
        <span>Tracks</span>
      </article>
      <article class="stat-card">
        <strong>${countLinkedPlatforms(data.releases)}</strong>
        <span>Streaming links</span>
      </article>
      <article class="stat-card">
        <strong>${featured ? escapeHtml(featured.title) : "None set"}</strong>
        <span>${featuredArtist ? escapeHtml(featuredArtist.name) : "Most recent release"}</span>
      </article>
      <article class="stat-card">
        <strong>${data.merch.length}</strong>
        <span>Merch entries</span>
      </article>
    `;
  }

  function populateArtistSelects() {
    const data = loadData();

    elements.releaseArtist.innerHTML = `
      ${data.artists
        .map(
          (artist) =>
            `<option value="${escapeHtml(artist.slug)}">${escapeHtml(artist.name)}</option>`
        )
        .join("")}
      <option value="__new__">Create new artist...</option>
    `;

    elements.artistProfileSelect.innerHTML = `
      <option value="">Start new artist...</option>
      ${data.artists
        .map(
          (artist) =>
            `<option value="${escapeHtml(artist.slug)}">${escapeHtml(artist.name)}</option>`
        )
        .join("")}
    `;

    if (!data.artists.length) {
      elements.releaseArtist.value = "__new__";
    }

    toggleInlineArtistFields();
  }

  function toggleInlineArtistFields() {
    elements.inlineArtistFields.hidden = elements.releaseArtist.value !== "__new__";
  }

  function syncTrackLabel(item) {
    const title = item.querySelector('[data-field="title"]').value.trim();
    item.querySelector("[data-track-label]").textContent = title || "Track title pending";
  }

  function buildTrackItem(track) {
    const item = document.createElement("article");
    item.className = "track-item";
    item.innerHTML = `
      <div class="release-list__header">
        <div>
          <p class="eyebrow">Track</p>
          <p class="release-list__meta" data-track-label>Track title pending</p>
        </div>
        <button class="button button--ghost" type="button" data-remove-track>
          Remove
        </button>
      </div>
      <div class="track-item__grid">
        <label class="field">
          <span>Track title</span>
          <input data-field="title" />
        </label>
        <label class="field">
          <span>Runtime</span>
          <input data-field="runtime" placeholder="3:42" />
        </label>
        <label class="field">
          <span>YouTube video ID</span>
          <input data-field="youtubeId" placeholder="video-id-only" />
        </label>
      </div>
    `;

    item.querySelector('[data-field="title"]').value = track && track.title ? track.title : "";
    item.querySelector('[data-field="runtime"]').value = track && track.runtime ? track.runtime : "";
    item.querySelector('[data-field="youtubeId"]').value =
      track && track.youtubeId ? track.youtubeId : "";
    syncTrackLabel(item);
    return item;
  }

  function addTrackItem(track) {
    elements.trackList.append(buildTrackItem(track));
  }

  function ensureAtLeastOneTrack() {
    if (!elements.trackList.children.length) {
      addTrackItem();
    }
  }

  function syncPlatformLabel(item) {
    const label = item.querySelector('[data-field="label"]').value.trim();
    item.querySelector("[data-platform-label]").textContent = label || "Custom destination";
  }

  function buildPlatformItem(platform) {
    const item = document.createElement("article");
    item.className = "platform-item";
    item.innerHTML = `
      <div class="release-list__header">
        <div>
          <p class="eyebrow">Platform Link</p>
          <p class="release-list__meta" data-platform-label>Custom destination</p>
        </div>
        <button class="button button--ghost" type="button" data-remove-platform>
          Remove
        </button>
      </div>
      <div class="platform-item__grid">
        <label class="field">
          <span>Platform name</span>
          <input data-field="label" />
        </label>
        <label class="field field--full">
          <span>URL</span>
          <input data-field="url" placeholder="https://..." />
        </label>
      </div>
    `;

    item.querySelector('[data-field="label"]').value =
      platform && platform.label ? platform.label : "";
    item.querySelector('[data-field="url"]').value = platform && platform.url ? platform.url : "";
    syncPlatformLabel(item);
    return item;
  }

  function addPlatformItem(platform) {
    elements.platformList.append(buildPlatformItem(platform));
    renderPlatformPresets();
  }

  function renderPlatformPresets() {
    const data = loadData();
    const existingLabels = [...elements.platformList.querySelectorAll('[data-field="label"]')]
      .map((input) => input.value.trim().toLowerCase())
      .filter(Boolean);

    elements.platformPresets.innerHTML = data.label.platformPresets
      .map((label) => {
        const isAttached = existingLabels.includes(label.toLowerCase());

        return `
          <button
            class="chip-button ${isAttached ? "is-active" : ""}"
            type="button"
            data-platform-preset="${escapeHtml(label)}"
          >
            ${escapeHtml(label)}
          </button>
        `;
      })
      .join("");
  }

  function collectTracks() {
    return [...elements.trackList.querySelectorAll(".track-item")]
      .map((item) => ({
        title: item.querySelector('[data-field="title"]').value.trim(),
        runtime: item.querySelector('[data-field="runtime"]').value.trim(),
        youtubeId: item.querySelector('[data-field="youtubeId"]').value.trim()
      }))
      .filter((track) => track.title);
  }

  function collectPlatforms() {
    return [...elements.platformList.querySelectorAll(".platform-item")]
      .map((item) => ({
        label: item.querySelector('[data-field="label"]').value.trim(),
        url: item.querySelector('[data-field="url"]').value.trim()
      }))
      .filter((platform) => platform.label && platform.url);
  }

  function renderReleaseCoverPreview() {
    const src = elements.releaseCover.value.trim();
    elements.releaseCoverPreview.innerHTML = coverPreviewMarkup(src, "Release cover preview", {
      title: elements.releaseTitle.value.trim() || "Release cover",
      subtitle: getArtistNameForReleasePreview(),
      accent: elements.releaseAccent.value.trim() || "#d8c7a1"
    });
    ui.hydrateArtwork(elements.releaseCoverPreview);
  }

  function renderArtistImagePreview() {
    const src = elements.artistImage.value.trim();
    elements.artistImagePreview.innerHTML = coverPreviewMarkup(src, "Artist image preview", {
      title: elements.artistName.value.trim() || "Artist image",
      subtitle: elements.artistLane.value.trim() || "Artist world",
      accent: elements.artistAccent.value.trim() || "#ba7b2b"
    });
    ui.hydrateArtwork(elements.artistImagePreview);
  }

  function renderReleasePreview() {
    const title = elements.releaseTitle.value.trim() || "Release title";
    const artistName = getArtistNameForReleasePreview();
    const type = elements.releaseType.value || "Album";
    const year = elements.releaseYear.value.trim() || "Year";
    const vibe = elements.releaseVibe.value.trim() || "Album vibe";
    const description =
      elements.releaseDescription.value.trim() ||
      "Add release notes, mood, and context here to shape the release world.";
    const tracks = collectTracks();
    const platforms = collectPlatforms();
    const releaseVideoId = elements.releaseYoutubeId.value.trim();
    const primaryEmbedLabel = elements.releasePrimaryEmbedLabel.value.trim();
    const primaryEmbedUrl = elements.releasePrimaryEmbedUrl.value.trim();
    elements.releasePreview.innerHTML = `
      <article class="release-card">
        ${
          coverPreviewMarkup(elements.releaseCover.value.trim(), `${title} cover art preview`, {
            title,
            subtitle: artistName,
            accent: elements.releaseAccent.value.trim() || "#d8c7a1"
          })
        }
        <div class="release-card__body">
          <p class="eyebrow">${escapeHtml(type)}</p>
          <h3>${escapeHtml(title)}</h3>
          <p class="release-card__meta">
            ${escapeHtml(artistName)} / ${escapeHtml(year)}
          </p>
          <p class="release-card__summary">${escapeHtml(description)}</p>
          <div class="chip-row">
            <span class="mini-chip">${escapeHtml(vibe)}</span>
            <span class="mini-chip">${tracks.length} track${tracks.length === 1 ? "" : "s"}</span>
            <span class="mini-chip">${platforms.length} link${platforms.length === 1 ? "" : "s"}</span>
            ${primaryEmbedUrl ? `<span class="mini-chip">${escapeHtml(primaryEmbedLabel || "Primary embed")} attached</span>` : ""}
            ${releaseVideoId ? '<span class="mini-chip">Hero video attached</span>' : ""}
          </div>
        </div>
      </article>
    `;

    ui.hydrateArtwork(elements.releasePreview);
  }

  function renderReleaseList() {
    const data = loadData();
    const featured = featuredRelease(data);
    const featuredSlug = featured ? featured.slug : "";

    if (!data.releases.length) {
      elements.releaseList.innerHTML = `
        <article class="empty-state">
          <h2>No releases saved yet.</h2>
          <p>The first saved release will appear here for editing and recency-based homepage placement.</p>
        </article>
      `;
      return;
    }

    elements.releaseList.innerHTML = data.releases
      .map((release) => {
        const artist = data.artists.find((entry) => entry.slug === release.artist);

        return `
          <article class="release-list__item">
            <div class="release-list__header">
              <div>
                <p class="eyebrow">${escapeHtml(release.type)}</p>
                <h3>${escapeHtml(release.title)}</h3>
                <p class="release-list__meta">
                  ${escapeHtml(artist ? artist.name : release.artist)} / ${escapeHtml(release.year)}
                </p>
              </div>
              <div class="row-actions">
                ${
                  featuredSlug === release.slug
                    ? '<span class="chip">Most Recent</span>'
                    : ""
                }
                <button class="button button--ghost" type="button" data-edit-release="${escapeHtml(release.slug)}">
                  Edit
                </button>
                <button class="button button--ghost" type="button" data-delete-release="${escapeHtml(release.slug)}">
                  Delete
                </button>
              </div>
            </div>
            <div class="chip-row">
              <span class="mini-chip">${release.tracks.length} track${release.tracks.length === 1 ? "" : "s"}</span>
              <span class="mini-chip">${release.platforms.length} link${release.platforms.length === 1 ? "" : "s"}</span>
              ${release.vibe ? `<span class="mini-chip">${escapeHtml(release.vibe)}</span>` : ""}
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderArtistList() {
    const data = loadData();

    if (!data.artists.length) {
      elements.artistList.innerHTML = `
        <article class="empty-state">
          <h2>No artists saved yet.</h2>
          <p>Choose "Create new artist..." in the release form or build one here.</p>
        </article>
      `;
      return;
    }

    elements.artistList.innerHTML = data.artists
      .map(
        (artist) => {
          const leadRelease = data.releases.find((release) => release.artist === artist.slug);

          return `
          <article class="release-list__item">
            <div class="release-list__header">
              <div>
                <p class="eyebrow">Artist</p>
                <h3>${escapeHtml(artist.name)}</h3>
                <p class="release-list__meta">${escapeHtml(artist.lane)}</p>
              </div>
              <button class="button button--ghost" type="button" data-edit-artist="${escapeHtml(artist.slug)}">
                Edit
              </button>
            </div>
            <div class="row-actions">
              <a class="text-button" href="artist.html?artist=${escapeHtml(artist.slug)}">Open World</a>
              ${
                leadRelease
                  ? `<a class="text-button" href="release.html?release=${escapeHtml(leadRelease.slug)}">Open Release</a>`
                  : ""
              }
            </div>
          </article>
        `;
        }
      )
      .join("");
  }

  function resetReleaseForm() {
    const data = loadData();
    state.editingReleaseSlug = "";
    elements.releaseForm.reset();
    elements.releaseType.value = "Album";
    elements.releaseYear.value = String(new Date().getFullYear());
    elements.releaseAccent.value = "#ba7b2b";
    elements.releaseYoutubeId.value = "";
    elements.releasePrimaryEmbedLabel.value = "";
    elements.releasePrimaryEmbedUrl.value = "";
    elements.trackList.innerHTML = "";
    elements.platformList.innerHTML = "";
    populateArtistSelects();

    if (data.artists.length) {
      elements.releaseArtist.value = data.artists[0].slug;
      elements.releaseAccent.value = data.artists[0].accent || "#ba7b2b";
    } else {
      elements.releaseArtist.value = "__new__";
    }

    toggleInlineArtistFields();
    addTrackItem();
    addPlatformItem({ label: "Spotify", url: "" });
    addPlatformItem({ label: "Apple Music", url: "" });
    addPlatformItem({ label: "YouTube", url: "" });
    renderReleaseCoverPreview();
    renderReleasePreview();
  }

  function resetArtistForm() {
    elements.artistForm.reset();
    state.editingArtistSlug = "";
    elements.artistAccent.value = "#ba7b2b";
    elements.artistProfileSelect.value = "";
    renderArtistImagePreview();
  }

  function fillReleaseForm(releaseSlug) {
    const data = loadData();
    const release = data.releases.find((entry) => entry.slug === releaseSlug);

    if (!release) {
      return;
    }

    state.editingReleaseSlug = release.slug;
    elements.releaseTitle.value = release.title;
    elements.releaseArtist.value = release.artist;
    elements.releaseType.value = release.type;
    elements.releaseYear.value = release.year;
    elements.releaseVibe.value = release.vibe;
    elements.releaseAccent.value = release.accent || "#ba7b2b";
    elements.releaseDescription.value = release.description;
    elements.releaseYoutubeId.value = release.youtubeId || "";
    elements.releasePrimaryEmbedLabel.value = release.primaryEmbedLabel || "";
    elements.releasePrimaryEmbedUrl.value = release.primaryEmbedUrl || "";
    elements.releaseCover.value = release.cover;
    elements.inlineArtistName.value = "";
    elements.inlineArtistLane.value = "";
    elements.inlineArtistSummary.value = "";
    toggleInlineArtistFields();

    elements.trackList.innerHTML = "";
    release.tracks.forEach((track) => addTrackItem(track));
    ensureAtLeastOneTrack();

    elements.platformList.innerHTML = "";
    release.platforms.forEach((platform) => addPlatformItem(platform));
    renderPlatformPresets();
    renderReleaseCoverPreview();
    renderReleasePreview();
    document
      .getElementById("release-intake")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function fillArtistForm(artistSlug) {
    const data = loadData();
    const artist = data.artists.find((entry) => entry.slug === artistSlug);

    if (!artist) {
      return;
    }

    state.editingArtistSlug = artist.slug;
    elements.artistProfileSelect.value = artist.slug;
    elements.artistName.value = artist.name;
    elements.artistLane.value = artist.lane;
    elements.artistAccent.value = artist.accent || "#ba7b2b";
    elements.artistImage.value = artist.image;
    elements.artistSummary.value = artist.summary;
    elements.artistHeadline.value = artist.headline;
    elements.artistStory.value = artist.story;
    elements.artistIndustryPitch.value = artist.industryPitch;
    elements.artistPressBio.value = artist.pressBio;
    elements.artistPressHighlights.value = artist.pressHighlights.join("\n");
    elements.artistPressAssets.value = artist.pressAssets.join("\n");
    elements.artistMerchIntro.value = artist.merchIntro;
    renderArtistImagePreview();

    document
      .getElementById("artist-profiles")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function buildInlineArtist(data) {
    if (elements.releaseArtist.value !== "__new__") {
      return { data, artistSlug: elements.releaseArtist.value };
    }

    const name = elements.inlineArtistName.value.trim();

    if (!name) {
      throw new Error("A new artist name is required before saving this release.");
    }

    const summary = elements.inlineArtistSummary.value.trim();
    const slug = slugify(name, "artist");
    const artist = {
      slug,
      name,
      lane: elements.inlineArtistLane.value.trim(),
      accent: elements.releaseAccent.value,
      image: elements.releaseCover.value.trim(),
      summary,
      headline: summary || name,
      story: summary,
      industryPitch: summary,
      pressBio: summary,
      pressHighlights: [],
      pressAssets: [],
      merchIntro: `${name} merch can be added and refined from the artist profile editor.`
    };

    return {
      artistSlug: slug,
      data: {
        ...data,
        artists: upsertBySlug(data.artists, artist)
      }
    };
  }

  function saveRelease(event) {
    event.preventDefault();
    let data = loadData();
    const title = elements.releaseTitle.value.trim();
    const tracks = collectTracks();

    if (!title) {
      setStatus("Release title is required before saving.", "warning");
      return;
    }

    if (!tracks.length) {
      setStatus("Add at least one track title before saving the release.", "warning");
      return;
    }

    try {
      const inlineArtistResult = buildInlineArtist(data);
      data = inlineArtistResult.data;
      const artistSlug = inlineArtistResult.artistSlug;
      const artist = data.artists.find((entry) => entry.slug === artistSlug);
      const existingRelease = state.editingReleaseSlug
        ? data.releases.find((entry) => entry.slug === state.editingReleaseSlug)
        : null;
      const release = {
        slug: state.editingReleaseSlug || slugify(`${artistSlug}-${title}`, title),
        aliases: Array.isArray(existingRelease && existingRelease.aliases)
          ? [...new Set(existingRelease.aliases.map((alias) => String(alias || "").trim()).filter(Boolean))]
          : [],
        artist: artistSlug,
        title,
        type: elements.releaseType.value,
        vibe: elements.releaseVibe.value.trim(),
        year: elements.releaseYear.value.trim(),
        accent: elements.releaseAccent.value,
        cover: elements.releaseCover.value.trim(),
        description: elements.releaseDescription.value.trim(),
        primaryEmbedLabel: elements.releasePrimaryEmbedLabel.value.trim(),
        primaryEmbedUrl: elements.releasePrimaryEmbedUrl.value.trim(),
        youtubeId: elements.releaseYoutubeId.value.trim(),
        platforms: collectPlatforms(),
        tracks
      };

      const nextData = {
        ...data,
        releases: upsertBySlug(
          state.editingReleaseSlug
            ? data.releases.filter((entry) => entry.slug !== state.editingReleaseSlug)
            : data.releases,
          release
        )
      };

      saveData(nextData);
      renderAll();
      resetReleaseForm();
      elements.releaseArtist.value = artistSlug;
      toggleInlineArtistFields();
      renderReleasePreview();
      setStatus(`Saved "${release.title}" for ${artist ? artist.name : "the selected artist"}.`, "success");
    } catch (error) {
      setStatus(error.message, "warning");
    }
  }

  function saveArtist(event) {
    event.preventDefault();
    const data = loadData();
    const name = elements.artistName.value.trim();

    if (!name) {
      setStatus("Artist name is required before saving the profile.", "warning");
      return;
    }

    const existing = state.editingArtistSlug
      ? data.artists.find((entry) => entry.slug === state.editingArtistSlug)
      : null;

    const artist = {
      slug: existing ? existing.slug : slugify(name, "artist"),
      name,
      lane: elements.artistLane.value.trim(),
      accent: elements.artistAccent.value,
      image: elements.artistImage.value.trim(),
      summary: elements.artistSummary.value.trim(),
      headline: elements.artistHeadline.value.trim(),
      story: elements.artistStory.value.trim(),
      industryPitch: elements.artistIndustryPitch.value.trim(),
      pressBio: elements.artistPressBio.value.trim(),
      pressHighlights: lineList(elements.artistPressHighlights.value),
      pressAssets: lineList(elements.artistPressAssets.value),
      merchIntro: elements.artistMerchIntro.value.trim()
    };

    saveData({
      ...data,
      artists: upsertBySlug(data.artists, artist)
    });
    renderAll();
    resetArtistForm();
    elements.releaseArtist.value = artist.slug;
    toggleInlineArtistFields();
    renderReleasePreview();
    setStatus(`Saved artist profile for "${artist.name}".`, "success");
  }

  function deleteRelease(releaseSlug) {
    const data = loadData();
    const release = data.releases.find((entry) => entry.slug === releaseSlug);

    if (!release) {
      return;
    }

    if (!window.confirm(`Delete "${release.title}" from the current catalog?`)) {
      return;
    }

    const remainingReleases = data.releases.filter((entry) => entry.slug !== releaseSlug);
    saveData({
      ...data,
      releases: remainingReleases
    });

    renderAll();
    if (state.editingReleaseSlug === releaseSlug) {
      resetReleaseForm();
    }
    setStatus(`Deleted "${release.title}" from the current catalog.`, "success");
  }

  function importFromText() {
    const source = elements.catalogJson.value.trim();

    if (!source) {
      setStatus("Paste or load JSON into the preview box before importing.", "warning");
      return;
    }

    try {
      const parsed = JSON.parse(source);
      saveData(parsed);
      renderAll();
      resetReleaseForm();
      resetArtistForm();
      setStatus("Imported JSON into the current editor catalog.", "success");
    } catch (error) {
      setStatus("That JSON could not be parsed. Check the format and try again.", "warning");
    }
  }

  function readImportFile(file) {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      elements.catalogJson.value = String(reader.result || "");
      setStatus(`Loaded "${file.name}" into the JSON preview.`, "info");
    });

    reader.readAsText(file);
  }

  function readImageFile(targetInput, file, renderPreview) {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      targetInput.value = String(reader.result || "");
      renderPreview();
      renderReleasePreview();
    });

    reader.readAsDataURL(file);
  }

  function loadCurrentJson() {
    elements.catalogJson.value = exportJson(loadData());
    setStatus("Loaded the current catalog JSON into the preview box.", "info");
  }

  function downloadJson() {
    downloadText("pawn-island-records.json", exportJson(loadData()), "application/json");
    setStatus("Downloaded the current catalog as JSON.", "success");
  }

  function downloadScript() {
    downloadText(
      "public-data.js",
      exportScript(loadData()),
      "application/javascript"
    );
    setStatus("Downloaded a publish-ready public-data.js file.", "success");
  }

  function resetData() {
    if (!window.confirm("Reset the current editor catalog back to the seed data?")) {
      return;
    }

    resetDataToSeed();
    renderAll();
    resetReleaseForm();
    resetArtistForm();
    setStatus("Reset the current editor catalog back to the seed data.", "info");
  }

  function renderAll() {
    renderStats();
    populateArtistSelects();
    renderReleaseList();
    renderArtistList();
    renderPlatformPresets();
    elements.catalogJson.value = exportJson(loadData());
  }

  function bindEvents() {
    elements.releaseForm.addEventListener("submit", saveRelease);
    elements.artistForm.addEventListener("submit", saveArtist);
    elements.addTrack.addEventListener("click", () => {
      addTrackItem();
      renderReleasePreview();
    });
    elements.addPlatform.addEventListener("click", () => {
      addPlatformItem();
      renderReleasePreview();
    });
    elements.resetReleaseForm.addEventListener("click", resetReleaseForm);
    elements.resetArtistForm.addEventListener("click", resetArtistForm);
    elements.releaseArtist.addEventListener("change", () => {
      const data = loadData();
      const artist = data.artists.find((entry) => entry.slug === elements.releaseArtist.value);
      toggleInlineArtistFields();

      if (artist && !state.editingReleaseSlug) {
        elements.releaseAccent.value = artist.accent || "#ba7b2b";
      }

      renderReleasePreview();
    });
    elements.artistProfileSelect.addEventListener("change", () => {
      if (!elements.artistProfileSelect.value) {
        resetArtistForm();
        return;
      }

      fillArtistForm(elements.artistProfileSelect.value);
    });
    elements.releaseCover.addEventListener("input", () => {
      renderReleaseCoverPreview();
      renderReleasePreview();
    });
    elements.artistImage.addEventListener("input", renderArtistImagePreview);
    elements.releaseCoverUpload.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];

      if (file) {
        readImageFile(elements.releaseCover, file, renderReleaseCoverPreview);
      }
    });
    elements.artistImageUpload.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];

      if (file) {
        readImageFile(elements.artistImage, file, renderArtistImagePreview);
      }
    });
    elements.releaseForm.addEventListener("input", (event) => {
      if (event.target.closest(".track-item")) {
        syncTrackLabel(event.target.closest(".track-item"));
      }

      if (event.target.closest(".platform-item")) {
        syncPlatformLabel(event.target.closest(".platform-item"));
        renderPlatformPresets();
      }

      renderReleasePreview();
    });
    elements.platformPresets.addEventListener("click", (event) => {
      const button = event.target.closest("[data-platform-preset]");

      if (!button) {
        return;
      }

      const label = button.getAttribute("data-platform-preset");
      const exists = [...elements.platformList.querySelectorAll('[data-field="label"]')].some(
        (input) => input.value.trim().toLowerCase() === label.toLowerCase()
      );

      if (!exists) {
        addPlatformItem({ label, url: "" });
      }

      renderReleasePreview();
    });
    elements.trackList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-track]");

      if (!removeButton) {
        return;
      }

      removeButton.closest(".track-item").remove();
      ensureAtLeastOneTrack();
      renderReleasePreview();
    });
    elements.platformList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-platform]");

      if (!removeButton) {
        return;
      }

      removeButton.closest(".platform-item").remove();
      renderPlatformPresets();
      renderReleasePreview();
    });
    elements.releaseList.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit-release]");
      const deleteButton = event.target.closest("[data-delete-release]");

      if (editButton) {
        fillReleaseForm(editButton.getAttribute("data-edit-release"));
        return;
      }

      if (deleteButton) {
        deleteRelease(deleteButton.getAttribute("data-delete-release"));
        return;
      }
    });
    elements.artistList.addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-edit-artist]");

      if (editButton) {
        fillArtistForm(editButton.getAttribute("data-edit-artist"));
      }
    });
    elements.downloadJson.addEventListener("click", downloadJson);
    elements.downloadScript.addEventListener("click", downloadScript);
    elements.loadJson.addEventListener("click", loadCurrentJson);
    elements.resetData.addEventListener("click", resetData);
    elements.importJson.addEventListener("click", importFromText);
    elements.importFile.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];

      if (file) {
        readImportFile(file);
      }
    });
  }

  function init() {
    renderAll();
    resetReleaseForm();
    resetArtistForm();
    bindEvents();
    renderReleasePreview();
    renderArtistImagePreview();
    setStatus(
      "Start with a new release, or refine any existing artist profile. This editor now works in-memory for the current session, with import and export handling the handoff.",
      "info"
    );
    ui.revealOnScroll();
  }

  init();
})();
