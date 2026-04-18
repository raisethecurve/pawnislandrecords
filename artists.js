(function () {
  const ui = window.PAWN_UI;
  const grid = document.getElementById("artists-grid");
  const featured = ui.getFeaturedRelease();
  const featuredArtist = featured ? ui.getArtist(featured.artist) : ui.data.artists[0] || null;

  if (ui.setMetaDescription) {
    ui.setMetaDescription(
      "Browse the Pawn Island Records roster and move directly into each artist page or current release."
    );
  }

  if (ui.applyExperienceTheme && featuredArtist) {
    ui.applyExperienceTheme({
      accent: (featured && featured.accent) || featuredArtist.accent,
      image: (featured && featured.cover) || featuredArtist.image,
      title: (featured && featured.title) || featuredArtist.name,
      subtitle: featured ? featuredArtist.name : (featuredArtist.lane || "Artist roster")
    });
  }

  grid.innerHTML = ui.data.artists
    .map((artist) => {
      const releases = ui.getArtistReleases(artist.slug);
      const leadRelease = releases[0];

      return `
        <article class="artist-card reveal">
          <div class="cover-frame">
            ${
              ui.artworkImageMarkup({
                src: artist.image,
                title: artist.name,
                subtitle: artist.lane || "Artist page",
                accent: artist.accent,
                alt: `${artist.name} artwork`
              })
            }
          </div>
          <div class="artist-card__body">
            <p class="eyebrow">Artist</p>
            <h3>${artist.name}</h3>
            <p class="artist-card__lane">${artist.lane}</p>
            <p class="artist-card__summary">${artist.summary}</p>
            <div class="chip-row">
              <span class="mini-chip">${releases.length} release${releases.length === 1 ? "" : "s"}</span>
              ${leadRelease ? `<span class="mini-chip">${leadRelease.title}</span>` : ""}
            </div>
            <div class="artist-card__footer">
              <a class="text-button" href="artist.html?artist=${artist.slug}">Artist Page</a>
              ${
                leadRelease
                  ? `<a class="text-button" href="release.html?release=${leadRelease.slug}">Open Release</a>`
                  : ""
              }
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  ui.hydrateArtwork(grid);
  ui.revealOnScroll();
})();
