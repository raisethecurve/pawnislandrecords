(function () {
  const STORAGE_KEY = "pawn-island-records-catalog-v1";
  const seedData = deepClone(window.PAWN_DATA || {});
  const publishedData = deepClone(window.PAWN_PUBLISHED_CATALOG || null);

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function dispatchCatalogChange(action, catalog) {
    try {
      window.dispatchEvent(
        new CustomEvent("pawncatalogchange", {
          detail: {
            action,
            catalog: deepClone(catalog)
          }
        })
      );
    } catch (error) {
      // Ignore event dispatch issues so catalog storage remains resilient.
    }
  }

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function uniqueTextList(values) {
    return [...new Set(ensureArray(values).map((value) => String(value).trim()).filter(Boolean))];
  }

  function slugify(text, fallback) {
    const normalized = String(text || fallback || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return normalized || String(fallback || "entry");
  }

  function normalizePalette(value) {
    const palette = ensureArray(value).filter(Boolean);

    return [palette[0] || "#ffd12a", palette[1] || "#2457ff"];
  }

  function normalizeLink(link) {
    return {
      label: String((link && link.label) || "Platform").trim(),
      url: String((link && link.url) || "").trim()
    };
  }

  function normalizePresave(presave, status) {
    if (!isObject(presave) && status !== "presave") {
      return null;
    }

    const base = isObject(presave) ? presave : {};

    return {
      label: String(base.label || "Too.fm pre-save").trim(),
      url: String(base.url || "").trim(),
      note: String(
        base.note || "Add the Too Lost link here so fans can save the release before it goes live."
      ).trim()
    };
  }

  function normalizeFanDownload(download, trackSlug, format) {
    const fallbackFormat = format || (download && download.format) || "MP3";
    const normalizedFormat = String(fallbackFormat).trim().toUpperCase();

    return {
      label: String((download && download.label) || `Fan ${normalizedFormat}`).trim(),
      format: normalizedFormat,
      size: String((download && download.size) || "").trim(),
      url: String((download && download.url) || "").trim()
    };
  }

  function normalizeDjPackage(djPackage) {
    if (!isObject(djPackage)) {
      return null;
    }

    const values = {
      title: String(djPackage.title || "Direct To DJ WAV Pack").trim(),
      description: String(djPackage.description || "").trim(),
      format: String(djPackage.format || "24-bit WAV").trim(),
      price: String(djPackage.price || "").trim(),
      checkoutUrl: String(djPackage.checkoutUrl || "").trim()
    };

    const hasValue = Object.values(values).some(Boolean);
    return hasValue ? values : null;
  }

  function normalizeSuperfan(superfan) {
    const base = isObject(superfan) ? superfan : {};

    return {
      title: String(base.title || "Superfan Exclusive").trim(),
      description: String(base.description || "").trim(),
      price: String(base.price || "").trim(),
      provider: String(base.provider || "Connect checkout").trim(),
      checkoutUrl: String(base.checkoutUrl || "").trim(),
      djPackage: normalizeDjPackage(base.djPackage)
    };
  }

  function normalizeTrack(track, index) {
    const title = String((track && track.title) || `Track ${index + 1}`).trim();
    const slug = slugify(track && track.slug ? track.slug : title, `track-${index + 1}`);
    const fanDownloads = ensureArray(track && track.fanDownloads)
      .map((download) => normalizeFanDownload(download, slug))
      .filter((download) => download.label || download.url || download.format);

    return {
      slug,
      title,
      runtime: String((track && track.runtime) || "").trim(),
      youtubeId: String((track && track.youtubeId) || "").trim(),
      lyrics: String((track && track.lyrics) || "").trim(),
      fanDownloads,
      superfan: normalizeSuperfan(track && track.superfan)
    };
  }

  function normalizeArtist(artist, index) {
    const name = String((artist && artist.name) || `Artist ${index + 1}`).trim();

    return {
      slug: slugify(artist && artist.slug ? artist.slug : name, `artist-${index + 1}`),
      name,
      lane: String((artist && artist.lane) || "Independent project").trim(),
      moods: uniqueTextList(artist && artist.moods),
      summary: String((artist && artist.summary) || "").trim(),
      headline: String((artist && artist.headline) || "").trim(),
      story: String((artist && artist.story) || "").trim(),
      currentFocus: String((artist && artist.currentFocus) || "").trim(),
      signatures: uniqueTextList(artist && artist.signatures),
      epk: ensureArray(artist && artist.epk).map((item) => ({
        label: String((item && item.label) || "Asset").trim(),
        status: String((item && item.status) || "needed").trim()
      })),
      palette: normalizePalette(artist && artist.palette)
    };
  }

  function normalizeRelease(release, index, fallbackArtists, defaultPlatforms) {
    const title = String((release && release.title) || `Release ${index + 1}`).trim();
    const artistList = fallbackArtists.length ? fallbackArtists : seedData.artists || [];
    const fallbackArtistSlug = artistList[0] ? artistList[0].slug : "label";
    const requestedArtistSlug = String((release && release.artist) || fallbackArtistSlug).trim();
    const resolvedArtistSlug = artistList.some((artist) => artist.slug === requestedArtistSlug)
      ? requestedArtistSlug
      : fallbackArtistSlug;
    const status = String((release && release.status) || "out").trim() || "out";
    const tracks = ensureArray(release && release.tracks).map((track, trackIndex) =>
      normalizeTrack(track, trackIndex)
    );

    return {
      slug: slugify(release && release.slug ? release.slug : title, `release-${index + 1}`),
      title,
      artist: resolvedArtistSlug,
      type: String((release && release.type) || "Single").trim(),
      status,
      releaseDate: String((release && release.releaseDate) || "").trim(),
      genres: uniqueTextList(release && release.genres),
      tags: uniqueTextList(release && release.tags),
      description: String((release && release.description) || "").trim(),
      palette: normalizePalette(release && release.palette),
      expectedPlatforms: uniqueTextList(
        release && release.expectedPlatforms
          ? release.expectedPlatforms
          : status === "presave"
            ? ["Too.fm pre-save"]
            : defaultPlatforms
      ),
      links: ensureArray(release && release.links).map(normalizeLink),
      presave: normalizePresave(release && release.presave, status),
      tracks
    };
  }

  function normalizeMerch(item, index) {
    return {
      slug: slugify(item && item.slug ? item.slug : item && item.title, `merch-${index + 1}`),
      title: String((item && item.title) || `Merch ${index + 1}`).trim(),
      artist: String((item && item.artist) || "label").trim(),
      category: String((item && item.category) || "Merch").trim(),
      price: String((item && item.price) || "").trim(),
      description: String((item && item.description) || "").trim(),
      status: String((item && item.status) || "Concept").trim(),
      imageLabel: String((item && item.imageLabel) || "Merch mockup").trim(),
      url: String((item && item.url) || "").trim()
    };
  }

  function normalizeRoadmap(item, index) {
    return {
      title: String((item && item.title) || `Roadmap Item ${index + 1}`).trim(),
      status: String((item && item.status) || "Next").trim(),
      body: String((item && item.body) || "").trim()
    };
  }

  function normalizeCatalog(input) {
    const incoming = isObject(input) ? input : {};
    const label = {
      ...deepClone(seedData.label || {}),
      ...(isObject(incoming.label) ? incoming.label : {})
    };
    const brandKit = {
      ...deepClone(seedData.brandKit || {}),
      ...(isObject(incoming.brandKit) ? incoming.brandKit : {})
    };
    const artistsSource = Array.isArray(incoming.artists) ? incoming.artists : seedData.artists || [];
    const artists = artistsSource.map((artist, index) => normalizeArtist(artist, index));
    const releasesSource = Array.isArray(incoming.releases) ? incoming.releases : seedData.releases || [];
    const merchSource = Array.isArray(incoming.merch) ? incoming.merch : seedData.merch || [];
    const roadmapSource = Array.isArray(incoming.roadmap) ? incoming.roadmap : seedData.roadmap || [];
    const defaultPlatforms = uniqueTextList(label.defaultStreamingPlatforms);

    return {
      label,
      brandKit,
      artists,
      releases: releasesSource.map((release, index) =>
        normalizeRelease(release, index, artists, defaultPlatforms)
      ),
      merch: merchSource.map((item, index) => normalizeMerch(item, index)),
      roadmap: roadmapSource.map((item, index) => normalizeRoadmap(item, index))
    };
  }

  function getStoredCatalog() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function loadCatalog() {
    return normalizeCatalog(getStoredCatalog() || publishedData || seedData);
  }

  function saveCatalog(nextCatalog) {
    const normalized = normalizeCatalog(nextCatalog);
    window.PAWN_DATA = normalized;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      dispatchCatalogChange("save", normalized);
      return normalized;
    }

    dispatchCatalogChange("save", normalized);
    return normalized;
  }

  function resetCatalog() {
    const normalized = normalizeCatalog(publishedData || seedData);

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      dispatchCatalogChange("reset", normalized);
      return normalized;
    }

    window.PAWN_DATA = normalized;
    dispatchCatalogChange("reset", normalized);
    return normalized;
  }

  function updateCatalog(updater) {
    const current = loadCatalog();
    const next = typeof updater === "function" ? updater(deepClone(current)) : updater;
    return saveCatalog(next);
  }

  function clearCatalog(options) {
    const settings = isObject(options) ? options : {};

    return updateCatalog((current) => {
      const next = deepClone(current);

      if (settings.clearArtists) {
        next.artists = [];
      }

      if (settings.clearReleases !== false) {
        next.releases = [];
      }

      if (settings.clearMerch) {
        next.merch = [];
      }

      return next;
    });
  }

  function removeDemoReleases() {
    return updateCatalog((current) => {
      const next = deepClone(current);
      const removedReleaseSlugs = new Set();

      next.releases = next.releases.filter((release) => {
        const looksLikeDemo =
          release.slug.includes("-demo") ||
          release.description.toLowerCase().includes("demo ") ||
          release.description.toLowerCase().startsWith("demo");

        if (looksLikeDemo) {
          removedReleaseSlugs.add(release.slug);
        }

        return !looksLikeDemo;
      });

      next.merch = next.merch.filter((item) => {
        if (item.slug.includes("-demo")) {
          return false;
        }

        const description = item.description.toLowerCase();
        return !description.includes("poster mockup") && !description.includes("hoodie mockup");
      });

      return next;
    });
  }

  function exportCatalog() {
    return JSON.stringify(loadCatalog(), null, 2);
  }

  function exportPublishedScript() {
    return `window.PAWN_PUBLISHED_CATALOG = ${JSON.stringify(
      loadCatalog(),
      null,
      2
    )};\n`;
  }

  window.PAWN_SEED_DATA = deepClone(seedData);
  window.PAWN_DATA = loadCatalog();
  window.PAWN_CATALOG_STORE = {
    storageKey: STORAGE_KEY,
    slugify,
    loadCatalog,
    saveCatalog,
    updateCatalog,
    resetCatalog,
    clearCatalog,
    removeDemoReleases,
    exportCatalog,
    exportPublishedScript,
    hasSavedCatalog() {
      return Boolean(getStoredCatalog());
    },
    hasPublishedCatalog() {
      return isObject(publishedData);
    },
    getSourceLabel() {
      if (getStoredCatalog()) {
        return "Browser";
      }

      if (isObject(publishedData)) {
        return "Published";
      }

      return "Seed";
    }
  };
})();
