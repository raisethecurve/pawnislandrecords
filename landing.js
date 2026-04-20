(function () {
  const fallbackData = {
    label: {
      platformPresets: []
    },
    artists: [],
    releases: []
  };
  const ui = window.PAWN_UI || null;
  const data = (ui && ui.data) || window.PAWN_PUBLIC_DATA || fallbackData;
  const artistLookup = new Map((data.artists || []).map((artist) => [artist.slug, artist]));
  const releases = (data.releases || []).map((release, index) => {
    const artist = artistLookup.get(release.artist) || null;
    const vibeTags = String(release.vibe || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const laneTags = artist
      ? String(artist.lane || "")
          .split("/")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];

    return {
      slug: String(release.slug || `release-${index + 1}`).trim(),
      artist: artist ? artist.name : String(release.artist || "").trim(),
      artistSlug: artist ? artist.slug : "",
      title: String(release.title || `Release ${index + 1}`).trim(),
      type: String(release.type || "Release").trim(),
      year: String(release.year || "").trim(),
      cover: String(release.cover || (artist && artist.image) || "").trim(),
      accent: String(release.accent || (artist && artist.accent) || "#d8c7a1").trim(),
      summary: String(release.description || (artist && artist.summary) || "").trim(),
      tags: [...new Set([...vibeTags, ...laneTags])].slice(0, 4)
    };
  });

  const state = {
    activeIndex: 0,
    timer: null,
    reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    showingPrimary: true,
    touchStartX: 0
  };

  const bgActive = document.getElementById("bg-active");
  const bgBuffer = document.getElementById("bg-buffer");
  const releaseIndex = document.getElementById("release-index");
  const releaseKicker = document.getElementById("release-kicker");
  const releaseTitle = document.getElementById("release-title");
  const releaseArtist = document.getElementById("release-artist");
  const releaseSummary = document.getElementById("release-summary");
  const releaseTags = document.getElementById("release-tags");
  const openRelease = document.getElementById("open-release");
  const openArtist = document.getElementById("open-artist");
  const prevStage = document.getElementById("prev-stage");
  const activeStage = document.getElementById("active-stage");
  const nextStage = document.getElementById("next-stage");
  const prevButton = document.getElementById("prev-release");
  const nextButton = document.getElementById("next-release");
  const inlineReleaseIndex = document.getElementById("release-index-inline");
  const heroMark = document.getElementById("coverflow");

  function syncViewportHeight() {
    document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
  }

  function releaseUrl(release) {
    return `release.html?release=${encodeURIComponent(release.slug)}`;
  }

  function artistUrl(release) {
    return release.artistSlug
      ? `artist.html?artist=${encodeURIComponent(release.artistSlug)}`
      : "roster.html";
  }

  function hexToRgba(hex, alpha) {
    const normalized = String(hex || "#d8c7a1").replace("#", "");
    const safe = normalized.length === 3
      ? normalized
          .split("")
          .map((value) => value + value)
          .join("")
      : normalized;
    const red = Number.parseInt(safe.slice(0, 2), 16);
    const green = Number.parseInt(safe.slice(2, 4), 16);
    const blue = Number.parseInt(safe.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function setBackdropImage(url) {
    const incoming = state.showingPrimary ? bgBuffer : bgActive;
    const outgoing = state.showingPrimary ? bgActive : bgBuffer;

    incoming.style.backgroundImage = `url("${url}")`;
    incoming.classList.add("experience__image--active");
    outgoing.classList.remove("experience__image--active");
    state.showingPrimary = !state.showingPrimary;
  }

  function stageMarkup(release, label, options) {
    const config = options || {};
    const wrapperTag = config.link ? "a" : "div";
    const href = config.link ? ` href="${releaseUrl(release)}"` : "";
    const cta = config.link
      ? '<span class="coverflow__slide-cta">Open release</span>'
      : "";
    const artwork = ui && ui.artworkImageMarkup
      ? ui.artworkImageMarkup({
          src: release.cover,
          title: release.title,
          subtitle: release.artist,
          accent: release.accent,
          alt: `${release.title} cover art`,
          loading: config.loading === "eager" ? "eager" : "lazy",
          fetchPriority: config.loading === "eager" ? "high" : "low",
          sizes: "(min-width: 1100px) 28rem, (min-width: 720px) 42vw, 92vw"
        })
      : `<img src="${release.cover}" alt="${release.title} cover art" />`;

    return `
      <${wrapperTag} class="coverflow__slide-link"${href}>
        <div class="coverflow__slide-inner">
          ${artwork}
          <div class="coverflow__slide-label">
            <strong>${release.title}</strong>
            <span>${label}</span>
            ${cta}
          </div>
        </div>
      </${wrapperTag}>
    `;
  }

  function renderCoverflow() {
    const total = releases.length;
    const previousIndex = (state.activeIndex - 1 + total) % total;
    const nextIndex = (state.activeIndex + 1) % total;
    const previous = releases[previousIndex];
    const active = releases[state.activeIndex];
    const next = releases[nextIndex];

    prevStage.innerHTML = stageMarkup(previous, previous.artist, { link: true });
    prevStage.dataset.targetIndex = String(previousIndex);

    activeStage.innerHTML = stageMarkup(
      active,
      active.year ? `${active.type} / ${active.year}` : active.type,
      { link: true, loading: "eager" }
    );

    nextStage.innerHTML = stageMarkup(next, next.artist, { link: true });
    nextStage.dataset.targetIndex = String(nextIndex);

    if (ui && ui.hydrateArtwork) {
      ui.hydrateArtwork(prevStage);
      ui.hydrateArtwork(activeStage);
      ui.hydrateArtwork(nextStage);
    }
  }

  function renderActiveRelease() {
    const release = releases[state.activeIndex];

    if (!release) {
      return;
    }

    setBackdropImage(
      ui && ui.resolveArtwork
        ? ui.resolveArtwork(release.cover, {
            title: release.title,
            subtitle: release.artist,
            accent: release.accent,
            format: "landscape"
          })
        : release.cover
    );
    renderCoverflow();

    releaseKicker.textContent = release.year ? `${release.type} / ${release.year}` : `${release.type} / Release`;
    releaseTitle.textContent = release.title;
    releaseArtist.textContent = release.artist;
    releaseSummary.textContent = release.summary;
    releaseTags.innerHTML = release.tags.map((tag) => `<span class="chip">${tag}</span>`).join("");
    releaseIndex.textContent = `${String(state.activeIndex + 1).padStart(2, "0")} / ${String(releases.length).padStart(2, "0")}`;
    if (inlineReleaseIndex) {
      inlineReleaseIndex.textContent = releaseIndex.textContent;
    }
    document.documentElement.style.setProperty("--release-glow", hexToRgba(release.accent, 0.22));
    document.documentElement.style.setProperty("--release-accent", release.accent);
    openRelease.href = releaseUrl(release);
    openArtist.href = artistUrl(release);
  }

  function setActiveRelease(index) {
    const total = releases.length;
    state.activeIndex = (index + total) % total;
    renderActiveRelease();
  }

  function nextRelease() {
    setActiveRelease(state.activeIndex + 1);
  }

  function previousRelease() {
    setActiveRelease(state.activeIndex - 1);
  }

  function restartCycle() {
    if (state.reduceMotion) {
      return;
    }

    clearInterval(state.timer);
    state.timer = window.setInterval(() => {
      nextRelease();
    }, 5200);
  }

  function bindControls() {
    prevButton.addEventListener("click", () => {
      previousRelease();
      restartCycle();
    });

    nextButton.addEventListener("click", () => {
      nextRelease();
      restartCycle();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        nextRelease();
        restartCycle();
      } else if (event.key === "ArrowLeft") {
        previousRelease();
        restartCycle();
      }
    });

    window.addEventListener("resize", syncViewportHeight);
    window.addEventListener("orientationchange", syncViewportHeight);
  }

  function bindTilt() {
    if (!heroMark || state.reduceMotion) {
      return;
    }

    let frameRequested = false;
    let pointerX = 0;
    let pointerY = 0;
    let bounds = null;

    const refreshBounds = () => {
      bounds = heroMark.getBoundingClientRect();
    };

    const updateTilt = () => {
      frameRequested = false;

      if (!bounds) {
        refreshBounds();
      }

      const x = (pointerX - bounds.left) / bounds.width;
      const y = (pointerY - bounds.top) / bounds.height;
      const tiltX = (x - 0.5) * 8;
      const tiltY = (0.5 - y) * 8;

      heroMark.style.setProperty("--tilt-x", tiltX.toFixed(2));
      heroMark.style.setProperty("--tilt-y", tiltY.toFixed(2));
    };

    heroMark.addEventListener("mouseenter", refreshBounds);
    window.addEventListener("resize", refreshBounds);

    heroMark.addEventListener("mousemove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (frameRequested) {
        return;
      }

      frameRequested = true;
      window.requestAnimationFrame(updateTilt);
    });

    heroMark.addEventListener("mouseleave", () => {
      heroMark.style.setProperty("--tilt-x", "0");
      heroMark.style.setProperty("--tilt-y", "0");
    });
  }

  function bindSwipe() {
    if (!heroMark) {
      return;
    }

    heroMark.addEventListener("touchstart", (event) => {
      const touch = event.changedTouches[0];
      state.touchStartX = touch ? touch.clientX : 0;
    }, { passive: true });

    heroMark.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0];
      const endX = touch ? touch.clientX : 0;
      const delta = endX - state.touchStartX;

      if (Math.abs(delta) < 40) {
        return;
      }

      if (delta < 0) {
        nextRelease();
      } else {
        previousRelease();
      }

      restartCycle();
    }, { passive: true });
  }

  function renderEmptyState() {
    prevButton.disabled = true;
    nextButton.disabled = true;
    releaseKicker.textContent = "Catalog";
    releaseTitle.textContent = "Releases coming into focus.";
    releaseArtist.textContent = "Label catalog";
    releaseSummary.textContent =
      "Add public releases to the shared catalog and the landing page will stage them here automatically.";
    releaseTags.innerHTML = "";
    releaseIndex.textContent = "00 / 00";
    if (inlineReleaseIndex) {
      inlineReleaseIndex.textContent = "00 / 00";
    }
    openRelease.href = "catalog.html";
    openArtist.href = "roster.html";
    document.documentElement.style.setProperty("--release-glow", hexToRgba("#d8c7a1", 0.18));
    document.documentElement.style.setProperty("--release-accent", "#d8c7a1");
  }

  function init() {
    syncViewportHeight();

    if (!releases.length) {
      renderEmptyState();
      return;
    }

    renderActiveRelease();
    bindControls();
    bindTilt();
    bindSwipe();
    restartCycle();
  }

  init();
})();
