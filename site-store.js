(function () {
  const STORAGE_KEY = "pawn-island-site-v2";
  const LEGACY_FEATURED_RELEASE_SLUG = "velvet-orchard-lights-on";
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

  function normalizeReleaseDate(value) {
    const raw = String(value || "").trim();

    if (!raw) {
      return "";
    }

    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    const shortMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);

    if (!shortMatch) {
      return "";
    }

    const year = shortMatch[3].length === 2 ? `20${shortMatch[3]}` : shortMatch[3];
    return `${year.padStart(4, "0")}-${shortMatch[1].padStart(2, "0")}-${shortMatch[2].padStart(2, "0")}`;
  }

  function normalizeReleaseStatus(value) {
    const normalized = String(value || "").trim().toLowerCase();

    if (["live", "upcoming", "scheduled", "announced", "catalog", "archived"].includes(normalized)) {
      return normalized;
    }

    return normalized || "catalog";
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
      merchIntro: String((artist && artist.merchIntro) || "").trim(),
      epkTagline: String((artist && artist.epkTagline) || "").trim(),
      pressQuote: String((artist && artist.pressQuote) || "").trim(),
      liveShowNote: String((artist && artist.liveShowNote) || "").trim(),
      bookingNote: String((artist && artist.bookingNote) || "").trim(),
      priorityMarkets: uniqueTextList(artist && artist.priorityMarkets)
    };
  }

  function normalizePlatform(platform, index) {
    return {
      label: String((platform && platform.label) || `Platform ${index + 1}`).trim(),
      url: String((platform && platform.url) || "").trim()
    };
  }

  function matchesReleaseSlug(release, slug) {
    const requestedSlug = String(slug || "").trim();

    if (!requestedSlug) {
      return false;
    }

    if (String((release && release.slug) || "").trim() === requestedSlug) {
      return true;
    }

    const aliases = Array.isArray(release && release.aliases) ? release.aliases : [];
    return aliases.some((alias) => String(alias || "").trim() === requestedSlug);
  }

  function findSeedRelease(release, index) {
    const releaseObject = release && typeof release === "object" ? release : {};
    const requestedSlug = String((releaseObject && releaseObject.slug) || "").trim();
    const requestedTitle = String((releaseObject && releaseObject.title) || "").trim().toLowerCase();

    return (
      ensureArray(seed.releases).find((candidate, candidateIndex) => {
        if (requestedSlug && matchesReleaseSlug(candidate, requestedSlug)) {
          return true;
        }

        if (
          requestedTitle &&
          String((candidate && candidate.title) || "")
            .trim()
            .toLowerCase() === requestedTitle
        ) {
          return true;
        }

        return !requestedSlug && !requestedTitle && candidateIndex === index;
      }) || null
    );
  }

  function normalizeRelease(release, index, artists, seedRelease) {
    const base = release && typeof release === "object" ? release : {};
    const fallback = seedRelease && typeof seedRelease === "object" ? seedRelease : {};
    const title = String((base.title || fallback.title || `Release ${index + 1}`)).trim();
    const firstArtistSlug = artists[0] ? artists[0].slug : "artist";
    const requestedArtistSlug = String((base.artist || fallback.artist || firstArtistSlug)).trim();
    const validArtistSlug = artists.some((artist) => artist.slug === requestedArtistSlug)
      ? requestedArtistSlug
      : firstArtistSlug;
    const slug = slugify(base.slug || fallback.slug || title, `release-${index + 1}`);
    const aliases = uniqueTextList([
      ...ensureArray(fallback.aliases),
      ...ensureArray(fallback.previousSlugs),
      ...ensureArray(base.aliases),
      ...ensureArray(base.previousSlugs)
    ]).filter((alias) => alias !== slug);

    return {
      slug,
      aliases,
      artist: validArtistSlug,
      title,
      type: String((base.type || fallback.type || "Single")).trim(),
      vibe: String((base.vibe || fallback.vibe || "")).trim(),
      year: String((base.year || fallback.year || "")).trim(),
      status: normalizeReleaseStatus(base.status || fallback.status),
      releaseDate: normalizeReleaseDate(base.releaseDate || fallback.releaseDate),
      accent: String((base.accent || fallback.accent || "#b77924")).trim(),
      cover: String((base.cover || fallback.cover || "")).trim(),
      description: String((base.description || fallback.description || "")).trim(),
      tooFmUrl: String(
        (
          base.tooFmUrl ||
          base.toofmUrl ||
          base.campaignUrl ||
          fallback.tooFmUrl ||
          fallback.toofmUrl ||
          fallback.campaignUrl ||
          ""
        )
      ).trim(),
      campaignUrl: String(
        (
          base.campaignUrl ||
          base.tooFmUrl ||
          base.toofmUrl ||
          fallback.campaignUrl ||
          fallback.tooFmUrl ||
          fallback.toofmUrl ||
          ""
        )
      ).trim(),
      primaryEmbedLabel: String((base.primaryEmbedLabel || fallback.primaryEmbedLabel || "")).trim(),
      primaryEmbedUrl: String((base.primaryEmbedUrl || fallback.primaryEmbedUrl || "")).trim(),
      youtubeId: String((base.youtubeId || fallback.youtubeId || "")).trim(),
      platforms: ensureArray(base.platforms !== undefined ? base.platforms : fallback.platforms)
        .map(normalizePlatform)
        .filter((platform) => platform.label || platform.url),
      tracks: ensureArray(base.tracks !== undefined ? base.tracks : fallback.tracks).map(normalizeTrack)
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
    const baseLabel = base.label && typeof base.label === "object" ? base.label : {};
    const seedLabel = seed.label && typeof seed.label === "object" ? seed.label : {};
    const storedFeaturedReleaseSlug = String(baseLabel.featuredReleaseSlug || "").trim();
    const seedFeaturedReleaseSlug = String(seedLabel.featuredReleaseSlug || "").trim();
    const normalizedLaunchMode = String(baseLabel.launchMode || seedLabel.launchMode || "full")
      .trim()
      .toLowerCase();
    const label = {
      name: String(baseLabel.name || seedLabel.name || "Pawn Island Records").trim(),
      tagline: String(baseLabel.tagline || seedLabel.tagline || "").trim(),
      intro: String(baseLabel.intro || seedLabel.intro || "").trim(),
      launchMode: normalizedLaunchMode || "full",
      featuredReleaseSlug:
        storedFeaturedReleaseSlug && storedFeaturedReleaseSlug !== LEGACY_FEATURED_RELEASE_SLUG
          ? storedFeaturedReleaseSlug
          : seedFeaturedReleaseSlug,
      identityLine: String((baseLabel.identityLine || seedLabel.identityLine) || "").trim(),
      aboutText: String(
        (baseLabel.aboutText || baseLabel.about || seedLabel.aboutText || seedLabel.about || "")
      ).trim(),
      about: String(
        (baseLabel.about || baseLabel.aboutText || seedLabel.about || seedLabel.aboutText || "")
      ).trim(),
      ethos: String((baseLabel.ethos || seedLabel.ethos || "")).trim(),
      featuredCampaignTitle: String(
        (baseLabel.featuredCampaignTitle || seedLabel.featuredCampaignTitle || "")
      ).trim(),
      featuredCampaignSummary: String(
        (baseLabel.featuredCampaignSummary || seedLabel.featuredCampaignSummary || "")
      ).trim(),
      featuredCampaignUrl: String(
        (
          baseLabel.featuredCampaignUrl ||
          baseLabel.campaignUrl ||
          seedLabel.featuredCampaignUrl ||
          seedLabel.campaignUrl ||
          ""
        )
      ).trim(),
      campaignUrl: String(
        (
          baseLabel.campaignUrl ||
          baseLabel.featuredCampaignUrl ||
          seedLabel.campaignUrl ||
          seedLabel.featuredCampaignUrl ||
          ""
        )
      ).trim(),
      defaultTooFmUrl: String((baseLabel.defaultTooFmUrl || seedLabel.defaultTooFmUrl || ""))
        .trim(),
      catalogPlaylistUrl: String(
        (
          baseLabel.catalogPlaylistUrl ||
          baseLabel.playlistUrl ||
          baseLabel.catalogPlaylistLink ||
          seedLabel.catalogPlaylistUrl ||
          seedLabel.playlistUrl ||
          seedLabel.catalogPlaylistLink ||
          ""
        )
      ).trim(),
      streamingPlatforms: uniqueTextList(
        baseLabel.streamingPlatforms ? baseLabel.streamingPlatforms : seedLabel.streamingPlatforms
      ),
      timeline: ensureArray(baseLabel.timeline).length
        ? deepClone(baseLabel.timeline)
        : deepClone(seedLabel.timeline || []),
      platformPresets: uniqueTextList(
        baseLabel.platformPresets ? baseLabel.platformPresets : seedLabel.platformPresets
      )
    };

    const artists = ensureArray(base.artists).length
      ? ensureArray(base.artists).map(normalizeArtist)
      : ensureArray(seed.artists).map(normalizeArtist);
    const releases = ensureArray(base.releases).length
      ? ensureArray(base.releases).map((release, index) =>
          normalizeRelease(release, index, artists, findSeedRelease(release, index))
        )
      : ensureArray(seed.releases).map((release, index) =>
          normalizeRelease(release, index, artists, release)
        );
    const merch = ensureArray(base.merch).length
      ? ensureArray(base.merch).map((item, index) => normalizeMerch(item, index, artists))
      : ensureArray(seed.merch).map((item, index) => normalizeMerch(item, index, artists));

    const featuredRelease = releases.find((release) =>
      matchesReleaseSlug(release, label.featuredReleaseSlug)
    );

    if (featuredRelease) {
      label.featuredReleaseSlug = featuredRelease.slug;
    } else if (releases[0]) {
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
