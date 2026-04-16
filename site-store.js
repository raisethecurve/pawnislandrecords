(function () {
  const STORAGE_KEY = "pawn-island-site-v2";
  const seed = deepClone(window.PAWN_PUBLIC_DATA || {});

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function slugify(text, fallback) {
    const normalized = String(text || fallback || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return normalized || String(fallback || "entry");
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

  function normalizeTrack(track, index) {
    return {
      title: String((track && track.title) || `Track ${index + 1}`).trim(),
      runtime: String((track && track.runtime) || "").trim(),
      youtubeId: String((track && track.youtubeId) || "").trim()
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

  function normalizePlatform(platform, index) {
    return {
      label: String((platform && platform.label) || `Platform ${index + 1}`).trim(),
      url: String((platform && platform.url) || "").trim()
    };
  }

  function normalizeRelease(release, index, artists) {
    const title = String((release && release.title) || `Release ${index + 1}`).trim();
    const firstArtistSlug = artists[0] ? artists[0].slug : "artist";
    const requestedArtistSlug = String((release && release.artist) || firstArtistSlug).trim();
    const validArtistSlug = artists.some((artist) => artist.slug === requestedArtistSlug)
      ? requestedArtistSlug
      : firstArtistSlug;

    return {
      slug: slugify(release && release.slug ? release.slug : title, `release-${index + 1}`),
      artist: validArtistSlug,
      title,
      type: String((release && release.type) || "Single").trim(),
      vibe: String((release && release.vibe) || "").trim(),
      year: String((release && release.year) || "").trim(),
      accent: String((release && release.accent) || "#b77924").trim(),
      cover: String((release && release.cover) || "").trim(),
      description: String((release && release.description) || "").trim(),
      platforms: ensureArray(release && release.platforms)
        .map(normalizePlatform)
        .filter((platform) => platform.label || platform.url),
      tracks: ensureArray(release && release.tracks).map(normalizeTrack)
    };
  }

  function normalizeMerch(item, index, artists) {
    const title = String((item && item.title) || `Merch ${index + 1}`).trim();
    const firstArtistSlug = artists[0] ? artists[0].slug : "artist";
    const requestedArtistSlug = String((item && item.artist) || firstArtistSlug).trim();
    const validArtistSlug = artists.some((artist) => artist.slug === requestedArtistSlug)
      ? requestedArtistSlug
      : firstArtistSlug;

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
    const label = {
      name: String((base.label && base.label.name) || "Pawn Island Records").trim(),
      tagline: String((base.label && base.label.tagline) || "").trim(),
      intro: String((base.label && base.label.intro) || "").trim(),
      featuredReleaseSlug: String(
        (base.label && base.label.featuredReleaseSlug) || ""
      ).trim(),
      platformPresets: uniqueTextList(
        base.label && base.label.platformPresets
          ? base.label.platformPresets
          : seed.label && seed.label.platformPresets
      )
    };

    const artists = ensureArray(base.artists).length
      ? ensureArray(base.artists).map(normalizeArtist)
      : ensureArray(seed.artists).map(normalizeArtist);
    const releases = ensureArray(base.releases).length
      ? ensureArray(base.releases).map((release, index) =>
          normalizeRelease(release, index, artists)
        )
      : ensureArray(seed.releases).map((release, index) =>
          normalizeRelease(release, index, artists)
        );
    const merch = ensureArray(base.merch).length
      ? ensureArray(base.merch).map((item, index) => normalizeMerch(item, index, artists))
      : ensureArray(seed.merch).map((item, index) => normalizeMerch(item, index, artists));

    if (
      (!label.featuredReleaseSlug ||
        !releases.some((release) => release.slug === label.featuredReleaseSlug)) &&
      releases[0]
    ) {
      label.featuredReleaseSlug = releases[0].slug;
    }

    return {
      label,
      artists,
      releases,
      merch
    };
  }

  function readStoredData() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function load() {
    return normalizeData(readStoredData() || seed);
  }

  function save(nextData) {
    const normalized = normalizeData(nextData);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.PAWN_SITE_DATA = normalized;
    return normalized;
  }

  function update(updater) {
    const current = load();
    const next = typeof updater === "function" ? updater(deepClone(current)) : updater;
    return save(next);
  }

  function reset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Keep reset resilient even if storage is unavailable.
    }

    window.PAWN_SITE_DATA = normalizeData(seed);
    return window.PAWN_SITE_DATA;
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

  function removeBySlug(list, slug) {
    return list.filter((entry) => entry.slug !== slug);
  }

  function exportJson(data) {
    return JSON.stringify(normalizeData(data || load()), null, 2);
  }

  function exportScript(data) {
    return `window.PAWN_PUBLIC_DATA = ${exportJson(data || load())};\n`;
  }

  window.PAWN_SITE_STORE = {
    deepClone,
    slugify,
    load,
    save,
    update,
    reset,
    normalizeData,
    upsertBySlug,
    removeBySlug,
    exportJson,
    exportScript
  };

  window.PAWN_SITE_DATA = load();
})();
