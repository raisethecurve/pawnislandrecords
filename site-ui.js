(function () {
  function currentData() {
    return window.PAWN_SITE_DATA || window.PAWN_PUBLIC_DATA || {
      label: {},
      artists: [],
      releases: [],
      merch: []
    };
  }

  function getArtist(slug) {
    return currentData().artists.find((artist) => artist.slug === slug) || null;
  }

  function getRelease(slug) {
    return currentData().releases.find((release) => release.slug === slug) || null;
  }

  function getArtistReleases(artistSlug) {
    return currentData().releases.filter((release) => release.artist === artistSlug);
  }

  function getArtistMerch(artistSlug) {
    return currentData().merch.filter((item) => item.artist === artistSlug);
  }

  function getFeaturedRelease() {
    const data = currentData();

    return (
      getRelease(data.label.featuredReleaseSlug) ||
      data.releases[0] ||
      null
    );
  }

  function trackCount() {
    const data = currentData();
    return data.releases.reduce((total, release) => total + release.tracks.length, 0);
  }

  function downloadText(filename, content, type) {
    const blob = new Blob([content], {
      type: type || "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function getSearchParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function normalizeView(value) {
    const validViews = ["public", "industry", "press", "merch"];
    return validViews.includes(value) ? value : "public";
  }

  function updateViewParam(view) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("view", view);
    window.history.replaceState({}, "", nextUrl);
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

  function applyExperienceTheme(options) {
    const settings = options && typeof options === "object" ? options : {};
    const accent = String(settings.accent || "#d8c7a1").trim();
    const image = String(settings.image || "").trim();
    const backdropId = String(settings.backdropId || "").trim();
    const backdrop =
      (backdropId && document.getElementById(backdropId)) ||
      document.getElementById("page-backdrop") ||
      document.getElementById("release-backdrop");

    document.documentElement.style.setProperty("--release-accent", accent);
    document.documentElement.style.setProperty("--release-accent-soft", hexToRgba(accent, 0.18));
    document.documentElement.style.setProperty("--release-glow", hexToRgba(accent, 0.18));
    document.documentElement.style.setProperty(
      "--page-backdrop-image",
      image ? `url("${image}")` : "none"
    );

    if (backdrop) {
      backdrop.style.backgroundImage = image ? `url("${image}")` : "";
    }
  }

  function setMetaDescription(content) {
    const meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      return;
    }

    meta.setAttribute("content", String(content || "").trim());
  }

  function revealOnScroll() {
    const items = document.querySelectorAll(".reveal");

    if (!items.length) {
      requestAnimationFrame(() => document.body.classList.add("is-ready"));
      return;
    }

    if (typeof window.IntersectionObserver !== "function") {
      items.forEach((item) => item.classList.add("is-visible"));
      requestAnimationFrame(() => document.body.classList.add("is-ready"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.16
      }
    );

    items.forEach((item) => observer.observe(item));
    requestAnimationFrame(() => document.body.classList.add("is-ready"));
  }

  const api = {
    getArtist,
    getRelease,
    getArtistReleases,
    getArtistMerch,
    getFeaturedRelease,
    trackCount,
    downloadText,
    getSearchParam,
    normalizeView,
    updateViewParam,
    hexToRgba,
    applyExperienceTheme,
    setMetaDescription,
    revealOnScroll
  };

  Object.defineProperty(api, "data", {
    enumerable: true,
    get: currentData
  });

  window.PAWN_UI = api;
})();
