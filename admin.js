const store = window.PAWN_CATALOG_STORE;

const elements = {
  summary: document.getElementById("admin-summary"),
  status: document.getElementById("catalog-status"),
  artistForm: document.getElementById("artist-form"),
  artistName: document.getElementById("artist-name"),
  artistSlug: document.getElementById("artist-slug"),
  artistLane: document.getElementById("artist-lane"),
  artistMoods: document.getElementById("artist-moods"),
  artistSummary: document.getElementById("artist-summary"),
  artistHeadline: document.getElementById("artist-headline"),
  artistStory: document.getElementById("artist-story"),
  artistFocus: document.getElementById("artist-focus"),
  artistSignatures: document.getElementById("artist-signatures"),
  artistColorOne: document.getElementById("artist-color-one"),
  artistColorTwo: document.getElementById("artist-color-two"),
  releaseForm: document.getElementById("release-form"),
  releaseTitle: document.getElementById("release-title"),
  releaseSlug: document.getElementById("release-slug"),
  releaseArtist: document.getElementById("release-artist"),
  releaseType: document.getElementById("release-type"),
  releaseStatus: document.getElementById("release-status"),
  releaseDate: document.getElementById("release-date"),
  releaseDescription: document.getElementById("release-description"),
  releaseGenres: document.getElementById("release-genres"),
  releaseTags: document.getElementById("release-tags"),
  releasePlatforms: document.getElementById("release-platforms"),
  releaseColorOne: document.getElementById("release-color-one"),
  releaseColorTwo: document.getElementById("release-color-two"),
  releaseSpotify: document.getElementById("release-spotify"),
  releaseApple: document.getElementById("release-apple"),
  releaseYouTube: document.getElementById("release-youtube"),
  releaseBandcamp: document.getElementById("release-bandcamp"),
  releaseAmazon: document.getElementById("release-amazon"),
  releaseYouTubeMusic: document.getElementById("release-youtube-music"),
  releasePresaveLabel: document.getElementById("release-presave-label"),
  releasePresaveUrl: document.getElementById("release-presave-url"),
  releasePresaveNote: document.getElementById("release-presave-note"),
  genreCloud: document.getElementById("genre-cloud"),
  tagCloud: document.getElementById("tag-cloud"),
  newGenreTag: document.getElementById("new-genre-tag"),
  newReleaseTag: document.getElementById("new-release-tag"),
  addGenreTag: document.getElementById("add-genre-tag"),
  addReleaseTag: document.getElementById("add-release-tag"),
  trackEditors: document.getElementById("track-editors"),
  addTrack: document.getElementById("add-track"),
  releaseList: document.getElementById("release-list"),
  removeDemoReleases: document.getElementById("remove-demo-releases"),
  clearReleaseCatalog: document.getElementById("clear-release-catalog"),
  resetSeedData: document.getElementById("reset-seed-data"),
  downloadJson: document.getElementById("download-json"),
  downloadPublishScript: document.getElementById("download-publish-script"),
  importJson: document.getElementById("import-json"),
  loadCurrentJson: document.getElementById("load-current-json"),
  importFile: document.getElementById("import-file"),
  catalogJson: document.getElementById("catalog-json")
};

const defaultGenreTags = [
  "Soul",
  "Country",
  "Singer-Songwriter",
  "Hip-Hop",
  "Rap",
  "Stoner Doom",
  "Alternative Rock",
  "Groove Metal",
  "Metal",
  "Rock",
  "Americana"
];

let catalog = store.loadCatalog();
let editingReleaseSlug = null;
let trackEditorCount = 0;
const tagState = {
  genres: new Set(),
  tags: new Set()
};

function parseCsv(value) {
  return [...new Set(String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean))];
}

function getArtistName(slug) {
  const artist = catalog.artists.find((entry) => entry.slug === slug);
  return artist ? artist.name : slug;
}

function setStatus(message, tone) {
  elements.status.textContent = message;
  elements.status.dataset.tone = tone || "info";
}

function buildSummaryCards() {
  const trackCount = catalog.releases.reduce(
    (total, release) => total + release.tracks.length,
    0
  );
  const sourceLabel = store.getSourceLabel();

  elements.summary.innerHTML = `
    <article class="stat-card">
      <span class="stat-card__value">${catalog.artists.length}</span>
      <span class="stat-card__label">Artists loaded</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${catalog.releases.length}</span>
      <span class="stat-card__label">Releases loaded</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${trackCount}</span>
      <span class="stat-card__label">Tracks loaded</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${catalog.merch.length}</span>
      <span class="stat-card__label">Merch items loaded</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${sourceLabel}</span>
      <span class="stat-card__label">Current data source</span>
    </article>
  `;
}

function populateArtistSelect() {
  elements.releaseArtist.innerHTML = "";

  if (catalog.artists.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Add an artist first";
    elements.releaseArtist.append(option);
    return;
  }

  catalog.artists.forEach((artist) => {
    const option = document.createElement("option");
    option.value = artist.slug;
    option.textContent = artist.name;
    elements.releaseArtist.append(option);
  });
}

function getGenrePool() {
  return [
    ...new Set([
      ...defaultGenreTags,
      ...catalog.releases.flatMap((release) => release.genres),
      ...tagState.genres
    ])
  ].sort();
}

function getTagPool() {
  return [
    ...new Set([
      ...catalog.releases.flatMap((release) => release.tags || []),
      ...tagState.tags
    ])
  ].sort();
}

function syncTagInput(kind) {
  const input = kind === "genres" ? elements.releaseGenres : elements.releaseTags;
  input.value = [...tagState[kind]].join(", ");
}

function renderTagCloud(kind) {
  const target = kind === "genres" ? elements.genreCloud : elements.tagCloud;
  const pool = kind === "genres" ? getGenrePool() : getTagPool();

  target.innerHTML = pool
    .map((tag) => {
      const selected = tagState[kind].has(tag);

      return `
        <button
          type="button"
          class="${selected ? "is-selected" : ""}"
          data-tag-kind="${kind}"
          data-tag-value="${tag}"
        >
          ${tag}
        </button>
      `;
    })
    .join("");
}

function refreshTagClouds() {
  syncTagInput("genres");
  syncTagInput("tags");
  renderTagCloud("genres");
  renderTagCloud("tags");
}

function updateTagStateFromInputs() {
  tagState.genres = new Set(parseCsv(elements.releaseGenres.value));
  tagState.tags = new Set(parseCsv(elements.releaseTags.value));
  refreshTagClouds();
}

function getEmptyTrack() {
  return {
    title: "",
    slug: "",
    runtime: "",
    youtubeId: "",
    lyrics: "",
    fanDownloads: [],
    superfan: {
      title: "",
      description: "",
      price: "",
      provider: "Connect checkout",
      checkoutUrl: "",
      djPackage: null
    }
  };
}

function createTrackEditor(trackData) {
  trackEditorCount += 1;
  const editor = document.createElement("article");
  const track = trackData || getEmptyTrack();
  const djPackage = track.superfan && track.superfan.djPackage ? track.superfan.djPackage : null;
  const mp3Download = (track.fanDownloads || []).find(
    (download) => download.format === "MP3"
  );
  const flacDownload = (track.fanDownloads || []).find(
    (download) => download.format === "FLAC"
  );

  editor.className = "track-editor";
  editor.dataset.trackEditor = String(trackEditorCount);
  editor.innerHTML = `
    <div class="track-editor__header">
      <div>
        <p class="eyebrow">Track Entry</p>
        <h3 data-track-heading>${track.title || `Track ${trackEditorCount}`}</h3>
      </div>
      <button class="button button--ghost" type="button" data-remove-track>
        Remove Track
      </button>
    </div>
    <div class="form-grid">
      <label class="field">
        <span>Track title</span>
        <input data-field="title" value="${track.title || ""}" />
      </label>
      <label class="field">
        <span>Slug</span>
        <input data-field="slug" value="${track.slug || ""}" placeholder="optional-auto-generated" />
      </label>
      <label class="field">
        <span>Runtime</span>
        <input data-field="runtime" value="${track.runtime || ""}" placeholder="3:42" />
      </label>
      <label class="field">
        <span>YouTube ID</span>
        <input data-field="youtubeId" value="${track.youtubeId || ""}" placeholder="video ID only" />
      </label>
      <label class="field field--full">
        <span>Lyrics</span>
        <textarea data-field="lyrics" rows="5">${track.lyrics || ""}</textarea>
      </label>
      <label class="field">
        <span>Fan MP3 URL</span>
        <input data-field="fanMp3Url" value="${mp3Download ? mp3Download.url : ""}" />
      </label>
      <label class="field">
        <span>Fan FLAC URL</span>
        <input data-field="fanFlacUrl" value="${flacDownload ? flacDownload.url : ""}" />
      </label>
      <label class="field">
        <span>Superfan title</span>
        <input data-field="superfanTitle" value="${track.superfan ? track.superfan.title : ""}" />
      </label>
      <label class="field">
        <span>Superfan price</span>
        <input data-field="superfanPrice" value="${track.superfan ? track.superfan.price : ""}" />
      </label>
      <label class="field">
        <span>Superfan provider</span>
        <input data-field="superfanProvider" value="${track.superfan ? track.superfan.provider : ""}" />
      </label>
      <label class="field">
        <span>Superfan checkout URL</span>
        <input data-field="superfanCheckout" value="${track.superfan ? track.superfan.checkoutUrl : ""}" />
      </label>
      <label class="field field--full">
        <span>Superfan description</span>
        <textarea data-field="superfanDescription" rows="3">${track.superfan ? track.superfan.description : ""}</textarea>
      </label>
      <label class="field">
        <span>DJ package title</span>
        <input data-field="djTitle" value="${djPackage ? djPackage.title : ""}" />
      </label>
      <label class="field">
        <span>DJ package format</span>
        <input data-field="djFormat" value="${djPackage ? djPackage.format : "24-bit WAV"}" />
      </label>
      <label class="field">
        <span>DJ package price</span>
        <input data-field="djPrice" value="${djPackage ? djPackage.price : ""}" />
      </label>
      <label class="field">
        <span>DJ package checkout URL</span>
        <input data-field="djCheckout" value="${djPackage ? djPackage.checkoutUrl : ""}" />
      </label>
      <label class="field field--full">
        <span>DJ package description</span>
        <textarea data-field="djDescription" rows="3">${djPackage ? djPackage.description : ""}</textarea>
      </label>
    </div>
  `;

  const titleInput = editor.querySelector('[data-field="title"]');
  titleInput.addEventListener("input", () => {
    const heading = editor.querySelector("[data-track-heading]");
    heading.textContent = titleInput.value.trim() || `Track ${editor.dataset.trackEditor}`;
  });

  editor.querySelector("[data-remove-track]").addEventListener("click", () => {
    editor.remove();

    if (elements.trackEditors.children.length === 0) {
      addTrackEditor();
    }
  });

  elements.trackEditors.append(editor);
}

function addTrackEditor(trackData) {
  createTrackEditor(trackData);
}

function resetArtistForm() {
  elements.artistForm.reset();
  elements.artistColorOne.value = "#ffd12a";
  elements.artistColorTwo.value = "#2457ff";
}

function resetReleaseForm() {
  editingReleaseSlug = null;
  elements.releaseForm.reset();
  elements.releaseStatus.value = "out";
  elements.releaseType.value = "Single";
  elements.releasePresaveLabel.value = "Too.fm pre-save";
  elements.releasePlatforms.value = "Spotify, Apple Music, YouTube";
  elements.releaseColorOne.value = "#ffd12a";
  elements.releaseColorTwo.value = "#2457ff";
  elements.trackEditors.innerHTML = "";
  tagState.genres = new Set();
  tagState.tags = new Set();
  refreshTagClouds();
  populateArtistSelect();
  addTrackEditor();
}

function upsertBySlug(list, nextItem) {
  const existingIndex = list.findIndex((item) => item.slug === nextItem.slug);

  if (existingIndex === -1) {
    return [...list, nextItem];
  }

  const nextList = [...list];
  nextList[existingIndex] = nextItem;
  return nextList;
}

function collectTrack(editor, index) {
  const value = (field) =>
    editor.querySelector(`[data-field="${field}"]`).value.trim();
  const title = value("title");

  if (!title) {
    return null;
  }

  const mp3Url = value("fanMp3Url");
  const flacUrl = value("fanFlacUrl");
  const fanDownloads = [];

  if (mp3Url) {
    fanDownloads.push({
      label: "Fan MP3",
      format: "MP3",
      size: "",
      url: mp3Url
    });
  }

  if (flacUrl) {
    fanDownloads.push({
      label: "Fan FLAC",
      format: "FLAC",
      size: "",
      url: flacUrl
    });
  }

  const djTitle = value("djTitle");
  const djDescription = value("djDescription");
  const djFormat = value("djFormat");
  const djPrice = value("djPrice");
  const djCheckout = value("djCheckout");
  const hasDjPackage = [djTitle, djDescription, djFormat, djPrice, djCheckout].some(Boolean);

  return {
    slug: value("slug") || store.slugify(title, `track-${index + 1}`),
    title,
    runtime: value("runtime"),
    youtubeId: value("youtubeId"),
    lyrics: value("lyrics"),
    fanDownloads,
    superfan: {
      title: value("superfanTitle"),
      description: value("superfanDescription"),
      price: value("superfanPrice"),
      provider: value("superfanProvider"),
      checkoutUrl: value("superfanCheckout"),
      djPackage: hasDjPackage
        ? {
            title: djTitle || "Direct To DJ WAV Pack",
            description: djDescription,
            format: djFormat || "24-bit WAV",
            price: djPrice,
            checkoutUrl: djCheckout
          }
        : null
    }
  };
}

function buildReleaseFromForm() {
  const title = elements.releaseTitle.value.trim();
  const type = elements.releaseType.value.trim();
  const tracks = [...elements.trackEditors.querySelectorAll(".track-editor")]
    .map((editor, index) => collectTrack(editor, index))
    .filter(Boolean);

  if (tracks.length === 0 && title) {
    tracks.push({
      slug: store.slugify(title, "track-1"),
      title,
      runtime: "",
      youtubeId: "",
      lyrics: "",
      fanDownloads: [],
      superfan: {
        title: "",
        description: "",
        price: "",
        provider: "Connect checkout",
        checkoutUrl: "",
        djPackage: null
      }
    });
  }

  const links = [
    { label: "Spotify", url: elements.releaseSpotify.value.trim() },
    { label: "Apple Music", url: elements.releaseApple.value.trim() },
    { label: "YouTube", url: elements.releaseYouTube.value.trim() },
    { label: "Bandcamp", url: elements.releaseBandcamp.value.trim() },
    { label: "Amazon Music", url: elements.releaseAmazon.value.trim() },
    { label: "YouTube Music", url: elements.releaseYouTubeMusic.value.trim() }
  ].filter((link) => link.url);

  const status = elements.releaseStatus.value;
  const presaveUrl = elements.releasePresaveUrl.value.trim();

  return {
    slug: elements.releaseSlug.value.trim() || store.slugify(title, "release"),
    title,
    artist: elements.releaseArtist.value,
    type,
    status,
    releaseDate: elements.releaseDate.value,
    genres: parseCsv(elements.releaseGenres.value),
    tags: parseCsv(elements.releaseTags.value),
    description: elements.releaseDescription.value.trim(),
    palette: [elements.releaseColorOne.value, elements.releaseColorTwo.value],
    expectedPlatforms: parseCsv(elements.releasePlatforms.value),
    links,
    presave:
      status === "presave" || presaveUrl
        ? {
            label: elements.releasePresaveLabel.value.trim() || "Too.fm pre-save",
            url: presaveUrl,
            note:
              elements.releasePresaveNote.value.trim() ||
              "Add the Too Lost link here so fans can save the release before it goes live."
          }
        : null,
    tracks
  };
}

function renderReleaseList() {
  const releases = [...catalog.releases].sort(
    (left, right) => new Date(right.releaseDate || 0) - new Date(left.releaseDate || 0)
  );

  if (releases.length === 0) {
    elements.releaseList.innerHTML =
      '<div class="empty-state">No releases are stored right now. Use "Start Empty Real Catalog" and then add the first live release above.</div>';
    return;
  }

  elements.releaseList.innerHTML = releases
    .map(
      (release) => `
        <article class="entry-row">
          <div class="entry-row__body">
            <p class="eyebrow">Release</p>
            <h3>${release.title}</h3>
            <p class="entry-row__meta">
              ${getArtistName(release.artist)} | ${release.type} | ${release.status} | ${
                release.releaseDate || "date pending"
              }
            </p>
            <div class="tag-row">
              <span class="tag">${release.tracks.length} track${
                release.tracks.length === 1 ? "" : "s"
              }</span>
              ${release.genres.map((genre) => `<span class="tag tag--muted">${genre}</span>`).join("")}
              ${(release.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
          </div>
          <div class="entry-row__actions">
            <button class="button button--ghost" type="button" data-edit-release="${release.slug}">
              Edit
            </button>
            <button class="button button--ghost" type="button" data-delete-release="${release.slug}">
              Delete
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

function refreshCatalogView() {
  catalog = store.loadCatalog();
  buildSummaryCards();
  populateArtistSelect();
  renderReleaseList();
  refreshTagClouds();
}

function saveArtist(event) {
  event.preventDefault();
  const name = elements.artistName.value.trim();

  if (!name) {
    setStatus("Artist name is required before saving.", "warning");
    return;
  }

  const artist = {
    slug: elements.artistSlug.value.trim() || store.slugify(name, "artist"),
    name,
    lane: elements.artistLane.value.trim(),
    moods: parseCsv(elements.artistMoods.value),
    summary: elements.artistSummary.value.trim(),
    headline: elements.artistHeadline.value.trim(),
    story: elements.artistStory.value.trim(),
    currentFocus: elements.artistFocus.value.trim(),
    signatures: parseCsv(elements.artistSignatures.value),
    epk: [],
    palette: [elements.artistColorOne.value, elements.artistColorTwo.value]
  };

  store.updateCatalog((current) => ({
    ...current,
    artists: upsertBySlug(current.artists, artist)
  }));

  refreshCatalogView();
  resetArtistForm();
  elements.releaseArtist.value = artist.slug;
  setStatus(`Saved artist "${artist.name}" to the browser catalog.`, "success");
}

function saveRelease(event) {
  event.preventDefault();
  const release = buildReleaseFromForm();

  if (!release.title) {
    setStatus("Release title is required before saving.", "warning");
    return;
  }

  if (!release.artist) {
    setStatus("Add an artist first, then assign the release to that artist.", "warning");
    return;
  }

  if (release.tracks.length === 0) {
    setStatus("Add at least one track before saving the release.", "warning");
    return;
  }

  store.updateCatalog((current) => ({
    ...current,
    releases: upsertBySlug(
      editingReleaseSlug
        ? current.releases.filter((entry) => entry.slug !== editingReleaseSlug)
        : current.releases,
      release
    )
  }));

  refreshCatalogView();
  resetReleaseForm();
  setStatus(`Saved release "${release.title}" to the browser catalog.`, "success");
}

function fillReleaseForm(releaseSlug) {
  const release = catalog.releases.find((entry) => entry.slug === releaseSlug);

  if (!release) {
    return;
  }

  editingReleaseSlug = release.slug;
  elements.releaseTitle.value = release.title;
  elements.releaseSlug.value = release.slug;
  elements.releaseArtist.value = release.artist;
  elements.releaseType.value = release.type;
  elements.releaseStatus.value = release.status;
  elements.releaseDate.value = release.releaseDate || "";
  elements.releaseDescription.value = release.description || "";
  elements.releaseGenres.value = (release.genres || []).join(", ");
  elements.releaseTags.value = (release.tags || []).join(", ");
  elements.releasePlatforms.value = (release.expectedPlatforms || []).join(", ");
  elements.releaseColorOne.value = release.palette && release.palette[0] ? release.palette[0] : "#ffd12a";
  elements.releaseColorTwo.value = release.palette && release.palette[1] ? release.palette[1] : "#2457ff";

  const linkMap = new Map((release.links || []).map((link) => [link.label, link.url]));
  elements.releaseSpotify.value = linkMap.get("Spotify") || "";
  elements.releaseApple.value = linkMap.get("Apple Music") || "";
  elements.releaseYouTube.value = linkMap.get("YouTube") || "";
  elements.releaseBandcamp.value = linkMap.get("Bandcamp") || "";
  elements.releaseAmazon.value = linkMap.get("Amazon Music") || "";
  elements.releaseYouTubeMusic.value = linkMap.get("YouTube Music") || "";

  elements.releasePresaveLabel.value =
    release.presave && release.presave.label ? release.presave.label : "Too.fm pre-save";
  elements.releasePresaveUrl.value =
    release.presave && release.presave.url ? release.presave.url : "";
  elements.releasePresaveNote.value =
    release.presave && release.presave.note ? release.presave.note : "";

  tagState.genres = new Set(release.genres || []);
  tagState.tags = new Set(release.tags || []);
  refreshTagClouds();

  elements.trackEditors.innerHTML = "";
  release.tracks.forEach((track) => addTrackEditor(track));

  document
    .getElementById("release-entry")
    .scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus(`Loaded "${release.title}" into the release form. Save again to update it.`, "info");
}

function deleteRelease(releaseSlug) {
  const release = catalog.releases.find((entry) => entry.slug === releaseSlug);

  if (!release) {
    return;
  }

  if (!window.confirm(`Delete "${release.title}" from the browser catalog?`)) {
    return;
  }

  store.updateCatalog((current) => ({
    ...current,
    releases: current.releases.filter((entry) => entry.slug !== releaseSlug)
  }));

  refreshCatalogView();

  if (editingReleaseSlug === releaseSlug) {
    resetReleaseForm();
  }

  setStatus(`Deleted "${release.title}" from the browser catalog.`, "success");
}

function removeDemoReleases() {
  store.removeDemoReleases();
  refreshCatalogView();
  setStatus("Removed demo-style releases from the browser catalog.", "success");
}

function clearReleaseCatalog() {
  if (
    !window.confirm(
      "Clear every current release from the browser catalog and start from an empty real-release slate?"
    )
  ) {
    return;
  }

  store.clearCatalog({ clearReleases: true, clearMerch: true });
  refreshCatalogView();
  resetReleaseForm();
  setStatus("Cleared releases and merch so you can start from an empty real catalog.", "success");
}

function resetSeedData() {
  if (
    !window.confirm(
      "Clear the browser override and return to the published catalog file, or the theme seed if no published file exists?"
    )
  ) {
    return;
  }

  store.resetCatalog();
  refreshCatalogView();
  resetReleaseForm();
  setStatus("Cleared the browser override and returned to the published or seed catalog.", "info");
}

function loadCurrentJson() {
  elements.catalogJson.value = store.exportCatalog();
  setStatus("Loaded the current catalog JSON into the editor.", "info");
}

function downloadCurrentJson() {
  const blob = new Blob([store.exportCatalog()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "pawn-island-records-catalog.json";
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus("Downloaded the current browser catalog as JSON.", "success");
}

function downloadPublishScript() {
  const blob = new Blob([store.exportPublishedScript()], {
    type: "application/javascript"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "catalog-published.js";
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus(
    "Downloaded catalog-published.js. Replace the repo file with it when you want the public site to use this catalog by default.",
    "success"
  );
}

function importJsonText() {
  const source = elements.catalogJson.value.trim();

  if (!source) {
    setStatus("Paste JSON into the import box first.", "warning");
    return;
  }

  let parsed;

  try {
    parsed = JSON.parse(source);
  } catch (error) {
    setStatus("That JSON could not be parsed. Check the format and try again.", "warning");
    return;
  }

  if (Array.isArray(parsed)) {
    store.updateCatalog((current) => ({
      ...current,
      releases: parsed
    }));
  } else {
    store.saveCatalog(parsed);
  }

  refreshCatalogView();
  setStatus("Imported JSON into the browser catalog.", "success");
}

function readImportFile(file) {
  const reader = new FileReader();

  reader.addEventListener("load", () => {
    elements.catalogJson.value = String(reader.result || "");
    setStatus(`Loaded "${file.name}" into the JSON editor.`, "info");
  });

  reader.readAsText(file);
}

function toggleTag(kind, value) {
  if (tagState[kind].has(value)) {
    tagState[kind].delete(value);
  } else {
    tagState[kind].add(value);
  }

  refreshTagClouds();
}

function addCustomTag(kind) {
  const input = kind === "genres" ? elements.newGenreTag : elements.newReleaseTag;
  const value = input.value.trim();

  if (!value) {
    return;
  }

  tagState[kind].add(value);
  input.value = "";
  refreshTagClouds();
}

function bindEvents() {
  elements.artistForm.addEventListener("submit", saveArtist);
  elements.releaseForm.addEventListener("submit", saveRelease);
  elements.addTrack.addEventListener("click", () => addTrackEditor());
  elements.removeDemoReleases.addEventListener("click", removeDemoReleases);
  elements.clearReleaseCatalog.addEventListener("click", clearReleaseCatalog);
  elements.resetSeedData.addEventListener("click", resetSeedData);
  elements.loadCurrentJson.addEventListener("click", loadCurrentJson);
  elements.downloadJson.addEventListener("click", downloadCurrentJson);
  elements.downloadPublishScript.addEventListener("click", downloadPublishScript);
  elements.importJson.addEventListener("click", importJsonText);
  elements.addGenreTag.addEventListener("click", () => addCustomTag("genres"));
  elements.addReleaseTag.addEventListener("click", () => addCustomTag("tags"));

  elements.releaseGenres.addEventListener("input", updateTagStateFromInputs);
  elements.releaseTags.addEventListener("input", updateTagStateFromInputs);

  elements.genreCloud.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tag-value]");

    if (!button) {
      return;
    }

    toggleTag("genres", button.dataset.tagValue);
  });

  elements.tagCloud.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tag-value]");

    if (!button) {
      return;
    }

    toggleTag("tags", button.dataset.tagValue);
  });

  elements.releaseList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-release]");

    if (editButton) {
      fillReleaseForm(editButton.dataset.editRelease);
      return;
    }

    const deleteButton = event.target.closest("[data-delete-release]");

    if (deleteButton) {
      deleteRelease(deleteButton.dataset.deleteRelease);
    }
  });

  elements.importFile.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];

    if (file) {
      readImportFile(file);
    }
  });
}

function init() {
  buildSummaryCards();
  populateArtistSelect();
  refreshTagClouds();
  renderReleaseList();
  resetArtistForm();
  resetReleaseForm();
  elements.catalogJson.value = store.exportCatalog();
  bindEvents();
  setStatus(
    "Start by clicking \"Remove Demo Releases\" or \"Start Empty Real Catalog,\" then add your live artists and releases. When the catalog looks right, download catalog-published.js to promote it into the repo.",
    "info"
  );
}

init();
