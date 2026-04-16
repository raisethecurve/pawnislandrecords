const data = window.PAWN_DATA;

const state = {
  search: "",
  artist: "all",
  category: "all",
  status: "all"
};

const artistMap = new Map(data.artists.map((artist) => [artist.slug, artist]));
const merchStats = document.getElementById("merch-stats");
const merchStoreGrid = document.getElementById("merch-store-grid");
const bundleGrid = document.getElementById("bundle-grid");
const merchResultsSummary = document.getElementById("merch-results-summary");
const merchSearch = document.getElementById("merch-search");
const merchArtistFilter = document.getElementById("merch-artist-filter");
const merchCategoryFilter = document.getElementById("merch-category-filter");

function getArtistDisplayName(artistSlug) {
  if (artistSlug === "label") {
    return data.label.name;
  }

  const artist = artistMap.get(artistSlug);
  return artist ? artist.name : artistSlug;
}

function getMerchAccent(item) {
  if (item.artist === "label") {
    return ["#ffd12a", "#2457ff"];
  }

  const artist = artistMap.get(item.artist);
  return artist ? artist.palette : ["#ffd12a", "#2457ff"];
}

function getAllTracks() {
  return data.releases.flatMap((release) =>
    release.tracks.map((track) => ({
      release,
      track,
      artist: artistMap.get(release.artist)
    }))
  );
}

function uniqueMerchArtists() {
  return [...new Set(data.merch.map((item) => item.artist))];
}

function uniqueMerchCategories() {
  return [...new Set(data.merch.map((item) => item.category))].sort();
}

function populateFilters() {
  uniqueMerchArtists().forEach((artistSlug) => {
    const option = document.createElement("option");
    option.value = artistSlug;
    option.textContent = getArtistDisplayName(artistSlug);
    merchArtistFilter.append(option);
  });

  uniqueMerchCategories().forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    merchCategoryFilter.append(option);
  });
}

function renderStats() {
  const artistSpecificDrops = data.merch.filter(
    (item) => item.artist !== "label"
  ).length;
  const liveItems = data.merch.filter((item) => item.status === "Live").length;
  const apparelCount = data.merch.filter(
    (item) => item.category === "Apparel"
  ).length;
  const djBundles = getAllTracks().filter(
    (item) => item.track.superfan && item.track.superfan.djPackage
  ).length;

  merchStats.innerHTML = `
    <article class="stat-card">
      <span class="stat-card__value">${data.merch.length}</span>
      <span class="stat-card__label">Merch items staged</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${artistSpecificDrops}</span>
      <span class="stat-card__label">Artist-led drops</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${apparelCount}</span>
      <span class="stat-card__label">Apparel concepts loaded</span>
    </article>
    <article class="stat-card">
      <span class="stat-card__value">${djBundles}</span>
      <span class="stat-card__label">Tracks with DJ-ready WAV upsell</span>
    </article>
  `;

  if (liveItems === 0) {
    merchStats.insertAdjacentHTML(
      "beforeend",
      `
        <article class="stat-card">
          <span class="stat-card__value">0</span>
          <span class="stat-card__label">Live storefront links connected so far</span>
        </article>
      `
    );
  }
}

function merchMatchesFilters(item) {
  const matchesSearch =
    state.search.length === 0 ||
    [item.title, item.description, item.category, getArtistDisplayName(item.artist)]
      .join(" ")
      .toLowerCase()
      .includes(state.search);

  const matchesArtist = state.artist === "all" || item.artist === state.artist;
  const matchesCategory =
    state.category === "all" || item.category === state.category;
  const matchesStatus = state.status === "all" || item.status === state.status;

  return matchesSearch && matchesArtist && matchesCategory && matchesStatus;
}

function renderMerch() {
  const items = data.merch.filter(merchMatchesFilters);

  merchResultsSummary.textContent = `${items.length} merch item${
    items.length === 1 ? "" : "s"
  } shown`;
  merchStoreGrid.innerHTML = "";

  if (items.length === 0) {
    merchStoreGrid.innerHTML =
      '<div class="empty-state">No merch matches the current filters yet. Add more items in <code>data.js</code> or broaden the search.</div>';
    return;
  }

  items.forEach((item) => {
    const [accentOne, accentTwo] = getMerchAccent(item);
    const article = document.createElement("article");
    article.className = "merch-card";

    article.innerHTML = `
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
            ? `<a class="button" href="${item.url}" target="_blank" rel="noreferrer">Buy now</a>`
            : '<span class="tag tag--muted">Connect a store URL to activate checkout</span>'
        }
      </div>
    `;

    merchStoreGrid.append(article);
  });
}

function renderBundles() {
  const bundleItems = getAllTracks().slice(0, 4);

  if (bundleItems.length === 0) {
    bundleGrid.innerHTML =
      '<div class="empty-state">No release bundles are available yet. Once real releases and tracks are loaded, bundle ideas will appear here automatically.</div>';
    return;
  }

  bundleGrid.innerHTML = bundleItems
    .map((item) => {
      const formats = item.track.fanDownloads.map((download) => download.format);
      const djPackage = item.track.superfan ? item.track.superfan.djPackage : null;

      return `
        <article class="bundle-card">
          <p class="eyebrow">Bundle concept</p>
          <h3>${item.track.title}</h3>
          <p class="bundle-card__meta">${item.artist.name} | ${item.release.title}</p>
          <p>
            Pair a merch item with immediate ${formats.join(" + ")} delivery and a
            premium collector lane for fans who want more than streaming.
          </p>
          <div class="tag-row">
            ${formats.map((format) => `<span class="tag">${format}</span>`).join("")}
            ${
              djPackage
                ? `<span class="tag tag--ready">${djPackage.format}</span>`
                : ""
            }
          </div>
          <div class="bundle-card__actions">
            <a class="button button--ghost" href="index.html#vault">View music offer</a>
            ${
              djPackage
                ? '<span class="tag tag--muted">Direct-to-DJ add-on ready to connect</span>'
                : '<span class="tag tag--muted">No DJ add-on configured yet</span>'
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function bindEvents() {
  merchSearch.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderMerch();
  });

  merchArtistFilter.addEventListener("change", (event) => {
    state.artist = event.target.value;
    renderMerch();
  });

  merchCategoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderMerch();
  });

  document.querySelectorAll("[data-merch-status]").forEach((button) => {
    button.addEventListener("click", () => {
      state.status = button.dataset.merchStatus;
      document.querySelectorAll("[data-merch-status]").forEach((tab) => {
        tab.classList.remove("is-active");
        tab.setAttribute("aria-selected", "false");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-selected", "true");
      renderMerch();
    });
  });
}

function init() {
  populateFilters();
  renderStats();
  renderMerch();
  renderBundles();
  bindEvents();
}

init();
