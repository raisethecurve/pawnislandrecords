(function () {
  const ui = window.PAWN_UI;
  const data = ui.data;
  const featured = ui.getFeaturedRelease();
  const featuredArtist = featured ? ui.getArtist(featured.artist) : data.artists[0] || null;

  const searchInput = document.getElementById("catalog-search");
  const artistFilter = document.getElementById("catalog-artist");
  const grid = document.getElementById("catalog-grid");
  const summary = document.getElementById("catalog-summary");

  if (ui.setMetaDescription) {
    ui.setMetaDescription(
      "Browse the Pawn Island Records release catalog by artist, title, vibe, or track."
    );
  }

  if (ui.applyExperienceTheme && (featured || featuredArtist)) {
    ui.applyExperienceTheme({
      accent: (featured && featured.accent) || (featuredArtist && featuredArtist.accent) || "#d8c7a1",
      image: (featured && featured.cover) || (featuredArtist && featuredArtist.image) || ""
    });
  }

  function populateArtistFilter() {
    artistFilter.innerHTML = `
      <option value="all">All artists</option>
      ${data.artists
        .map((artist) => `<option value="${artist.slug}">${artist.name}</option>`)
        .join("")}
    `;
  }

  function filteredReleases() {
    const query = searchInput.value.trim().toLowerCase();
    const artistSlug = artistFilter.value;

    return data.releases.filter((release) => {
      const artist = ui.getArtist(release.artist);
      const matchesArtist = artistSlug === "all" || release.artist === artistSlug;
      const haystack = [
        release.title,
        release.vibe,
        release.type,
        artist ? artist.name : "",
        ...(release.tracks || []).map((track) => track.title)
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query || haystack.includes(query);

      return matchesArtist && matchesQuery;
    });
  }

  function render() {
    const releases = filteredReleases();

    summary.textContent = `${releases.length} release${releases.length === 1 ? "" : "s"} shown`;

    if (!releases.length) {
      grid.innerHTML = `
        <article class="empty-state">
          <h2>No releases match this view.</h2>
          <p>Try another artist filter or a broader search.</p>
        </article>
      `;
      return;
    }

    grid.innerHTML = releases
      .map((release) => {
        const artist = ui.getArtist(release.artist);
        const platforms = release.platforms.slice(0, 3);

        return `
          <article class="release-card reveal">
            <div class="cover-frame">
              <img src="${release.cover}" alt="${release.title} cover art" />
            </div>
            <div class="release-card__body">
              <p class="eyebrow">${release.type}</p>
              <h3>${release.title}</h3>
              <p class="release-card__meta">${artist ? artist.name : ""} / ${release.year}</p>
              <p class="release-card__summary">${release.description}</p>
              <div class="chip-row">
                <span class="mini-chip">${release.vibe}</span>
                <span class="mini-chip">${release.tracks.length} tracks</span>
              </div>
              <div class="chip-row">
                ${platforms.length
                  ? platforms.map((platform) => `<span class="mini-chip">${platform.label}</span>`).join("")
                  : '<span class="mini-chip">Platform destinations appear here as they go live</span>'}
              </div>
              <div class="release-card__footer">
                <a class="text-button" href="release.html?release=${release.slug}">Release Page</a>
                <a class="text-button" href="artist.html?artist=${release.artist}&view=public">Artist Page</a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    ui.revealOnScroll();
  }

  populateArtistFilter();
  searchInput.addEventListener("input", render);
  artistFilter.addEventListener("change", render);
  render();
})();
