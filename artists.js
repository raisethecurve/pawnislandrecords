(function () {
  const ui = window.PAWN_UI;
  const grid = document.getElementById("artists-grid");
  const featured = ui.getFeaturedRelease();
  const featuredArtist = featured ? ui.getArtist(featured.artist) : ui.data.artists[0] || null;

  if (ui.setMetaDescription) {
    ui.setMetaDescription(
      "Browse the Pawn Island Records roster and open each artist's public, industry, press, or merch world."
    );
  }

  if (ui.applyExperienceTheme && featuredArtist) {
    ui.applyExperienceTheme({
      accent: (featured && featured.accent) || featuredArtist.accent,
      image: (featured && featured.cover) || featuredArtist.image
    });
  }

  grid.innerHTML = ui.data.artists
    .map((artist) => {
      const releases = ui.getArtistReleases(artist.slug);
      const leadRelease = releases[0];

      return `
        <article class="artist-card reveal">
          <div class="cover-frame">
            <img src="${artist.image}" alt="${artist.name} artwork" />
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
              <a class="text-button" href="artist.html?artist=${artist.slug}&view=public">Public</a>
              <a class="text-button" href="artist.html?artist=${artist.slug}&view=industry">Industry</a>
              <a class="text-button" href="artist.html?artist=${artist.slug}&view=press">Press Kit</a>
              <a class="text-button" href="artist.html?artist=${artist.slug}&view=merch">Merch</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  ui.revealOnScroll();
})();
