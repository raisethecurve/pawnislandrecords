const data = window.PAWN_DATA;

const state = {
  artist: "all",
  status: "all",
  focus: "all"
};

const artistMap = new Map(data.artists.map((artist) => [artist.slug, artist]));
const campaignArtistFilter = document.getElementById("campaign-artist-filter");
const campaignStatusFilter = document.getElementById("campaign-status-filter");
const campaignFocusFilter = document.getElementById("campaign-focus-filter");
const campaignGrid = document.getElementById("campaign-grid");
const campaignNotesGrid = document.getElementById("campaign-notes-grid");

function populateFilters() {
  data.artists.forEach((artist) => {
    const option = document.createElement("option");
    option.value = artist.slug;
    option.textContent = artist.name;
    campaignArtistFilter.append(option);
  });
}

function getCampaignVariants() {
  return data.releases.flatMap((release) => {
    const artist = artistMap.get(release.artist);
    const firstTrack = release.tracks[0];
    const focusSets = [
      {
        focus: "Narrative",
        title: `${release.title} | Story-first landing`,
        lead:
          artist.headline,
        cta:
          release.status === "presave" ? "Read the story and pre-save" : "Read the world and hear the track",
        metric: "Scroll depth and lyric engagement",
        summary:
          "Lead with the world of the project, a stronger artist statement, and a lyric or quote pullout before routing to music."
      },
      {
        focus: "Conversion",
        title: `${release.title} | Action-first landing`,
        lead:
          release.status === "presave"
            ? "Minimal copy, stronger urgency, and a clear pre-save rail."
            : "Lead with the one most important action: stream, buy, or download.",
        cta:
          release.status === "presave" ? "Pre-save now" : "Stream or download now",
        metric: "Primary CTA clicks",
        summary:
          "Use concise copy, repeated action placement, and a smaller information surface for faster campaign response."
      },
      {
        focus: "Video",
        title: `${release.title} | Video-first landing`,
        lead:
          firstTrack && firstTrack.youtubeId
            ? "Open with an embed, motion, and a cleaner right-rail for platform actions."
            : "Plan this variant around the YouTube premiere or official visualizer when the ID is ready.",
        cta: firstTrack && firstTrack.youtubeId ? "Watch the video" : "Queue the YouTube premiere",
        metric: "Video starts and downstream platform clicks",
        summary:
          "Use motion and media as the hook, then route into streaming, merch, and direct ownership after the first watch beat."
      }
    ];

    return focusSets.map((variant) => ({
      ...variant,
      release,
      artist
    }));
  });
}

function matchesFilters(item) {
  const matchesArtist =
    state.artist === "all" || item.release.artist === state.artist;
  const matchesStatus =
    state.status === "all" || item.release.status === state.status;
  const matchesFocus = state.focus === "all" || item.focus === state.focus;

  return matchesArtist && matchesStatus && matchesFocus;
}

function renderCampaigns() {
  const items = getCampaignVariants().filter(matchesFilters);

  if (items.length === 0) {
    campaignGrid.innerHTML =
      '<div class="empty-state">No campaign variants are available yet. Add real releases in admin.html and this lab will generate landing-page ideas from them.</div>';
    return;
  }

  campaignGrid.innerHTML = items
    .map(
      (item) => `
        <article class="campaign-card">
          <div class="campaign-card__meta">
            <span class="tag">${item.focus}</span>
            <span class="tag tag--muted">${item.release.status}</span>
          </div>
          <h3>${item.title}</h3>
          <p class="campaign-card__artist">${item.artist.name} | ${item.release.type}</p>
          <p>${item.lead}</p>
          <p>${item.summary}</p>
          <div class="tag-row">
            ${item.release.genres.map((genre) => `<span class="tag">${genre}</span>`).join("")}
          </div>
          <div class="campaign-card__footer">
            <span class="tag">${item.cta}</span>
            <span class="tag tag--muted">${item.metric}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderNotes() {
  const notes = [
    {
      title: "Narrative pages",
      body:
        "Best for artists where identity, mood, and lyrics carry the conversion. Use more copy and fewer exit points."
    },
    {
      title: "Conversion pages",
      body:
        "Best for pre-save pushes, release-week campaigns, and paid traffic where the user already knows roughly what they want."
    },
    {
      title: "Video pages",
      body:
        "Best when the YouTube asset is a strong opener. This version can also tee up merch and direct downloads after the first play."
    },
    {
      title: "Merch tie-ins",
      body:
        "Artist-specific merch can sit naturally beneath a landing page when it looks like an extension of the release world rather than a separate store."
    }
  ];

  campaignNotesGrid.innerHTML = notes
    .map(
      (item) => `
        <article class="brand-panel">
          <p class="eyebrow">Test principle</p>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </article>
      `
    )
    .join("");
}

function bindEvents() {
  campaignArtistFilter.addEventListener("change", (event) => {
    state.artist = event.target.value;
    renderCampaigns();
  });

  campaignStatusFilter.addEventListener("change", (event) => {
    state.status = event.target.value;
    renderCampaigns();
  });

  campaignFocusFilter.addEventListener("change", (event) => {
    state.focus = event.target.value;
    renderCampaigns();
  });
}

function init() {
  populateFilters();
  renderCampaigns();
  renderNotes();
  bindEvents();
}

init();
