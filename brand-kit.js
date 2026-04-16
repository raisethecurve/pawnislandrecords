const data = window.PAWN_DATA;
const paletteGrid = document.getElementById("palette-grid");
const typeGrid = document.getElementById("type-grid");
const voiceGrid = document.getElementById("voice-grid");

function renderPalette() {
  paletteGrid.innerHTML = data.brandKit.palette
    .map(
      (color) => `
        <article class="brand-panel">
          <div
            class="palette-card__swatch"
            style="background: ${color.hex};"
            aria-label="${color.name} swatch"
          ></div>
          <p class="eyebrow">${color.token}</p>
          <h3>${color.name}</h3>
          <p class="brand-panel__meta">${color.hex}</p>
          <p>${color.use}</p>
        </article>
      `
    )
    .join("");
}

function renderTypography() {
  typeGrid.innerHTML = `
    <article class="brand-panel">
      <p class="eyebrow">Display face</p>
      <h3>${data.brandKit.typography.display}</h3>
      <p class="type-sample type-sample--display">One label. Many climates.</p>
      <p>${data.brandKit.typography.guidance[0]}</p>
    </article>
    <article class="brand-panel">
      <p class="eyebrow">Interface face</p>
      <h3>${data.brandKit.typography.interface}</h3>
      <p class="type-sample type-sample--interface">
        Release cards, filters, tags, and platform actions live here.
      </p>
      <p>${data.brandKit.typography.guidance[1]}</p>
    </article>
  `;
}

function renderVoice() {
  const artistPalettes = data.artists
    .map(
      (artist) => `
        <div class="artist-palette">
          <strong>${artist.name}</strong>
          <div class="artist-palette__chips">
            ${artist.palette
              .map(
                (color) =>
                  `<span class="artist-palette__chip" style="background: ${color};"></span>`
              )
              .join("")}
          </div>
        </div>
      `
    )
    .join("");

  voiceGrid.innerHTML = `
    <article class="brand-panel">
      <p class="eyebrow">Voice</p>
      <h3>Editorial direction</h3>
      <div class="voice-list">
        ${data.brandKit.voice
          .map((item) => `<span class="tag">${item}</span>`)
          .join("")}
      </div>
      <p>${data.brandKit.typography.guidance[2]}</p>
    </article>
    <article class="brand-panel">
      <p class="eyebrow">Glass treatment</p>
      <h3>Surface rules</h3>
      <ul class="profile-list">
        ${data.brandKit.glass.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </article>
    <article class="brand-panel field--full">
      <p class="eyebrow">Artist accents</p>
      <h3>Keep the label unified without flattening each project.</h3>
      <div class="artist-palette-grid">${artistPalettes}</div>
    </article>
  `;
}

function init() {
  renderPalette();
  renderTypography();
  renderVoice();
}

init();
