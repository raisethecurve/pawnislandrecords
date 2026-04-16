(function () {
  const API_KEY_STORAGE_KEY = "pawn-island-records-youtube-api-key-v1";
  const SNAPSHOT_STORAGE_KEY = "pawn-island-records-youtube-stats-v1";
  const publishedSnapshot = normalizeSnapshot(
    deepClone(window.PAWN_PUBLISHED_YOUTUBE_STATS || null)
  );
  const fullNumberFormatter = new Intl.NumberFormat("en-US");
  const compactNumberFormatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  });

  function deepClone(value) {
    return value === null ? null : JSON.parse(JSON.stringify(value));
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

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function chunk(items, size) {
    const chunks = [];

    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }

    return chunks;
  }

  function readJsonStorage(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeJsonStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function readTextStorage(key) {
    try {
      return String(window.localStorage.getItem(key) || "").trim();
    } catch (error) {
      return "";
    }
  }

  function writeTextStorage(key, value) {
    const nextValue = String(value || "").trim();

    try {
      if (nextValue) {
        window.localStorage.setItem(key, nextValue);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      return nextValue;
    }

    return nextValue;
  }

  function removeStorageItem(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  function normalizeStatistics(statistics) {
    const base = isObject(statistics) ? statistics : {};

    return {
      viewCount: toNumber(base.viewCount),
      likeCount: toNumber(base.likeCount),
      commentCount: toNumber(base.commentCount)
    };
  }

  function normalizeSnapshotVideo(video, videoId) {
    const base = isObject(video) ? video : {};

    return {
      videoId,
      title: String(base.title || "").trim(),
      channelTitle: String(base.channelTitle || "").trim(),
      publishedAt: String(base.publishedAt || "").trim(),
      duration: String(base.duration || "").trim(),
      url: String(base.url || `https://www.youtube.com/watch?v=${videoId}`).trim(),
      statistics: normalizeStatistics(base.statistics),
      delta: normalizeStatistics(base.delta)
    };
  }

  function normalizeSnapshot(snapshot) {
    if (!isObject(snapshot)) {
      return null;
    }

    const rawVideos = isObject(snapshot.videos) ? snapshot.videos : {};
    const videos = {};

    Object.keys(rawVideos).forEach((key) => {
      const rawVideo = rawVideos[key];
      const videoId = String(key || (rawVideo && rawVideo.videoId) || "").trim();

      if (!videoId) {
        return;
      }

      videos[videoId] = normalizeSnapshotVideo(rawVideo, videoId);
    });

    const requestedVideoIds = uniqueTextList([
      ...Object.keys(videos),
      ...ensureArray(snapshot.requestedVideoIds),
      ...ensureArray(snapshot.missingVideoIds)
    ]);

    return {
      fetchedAt: String(snapshot.fetchedAt || "").trim(),
      source: "YouTube Data API v3",
      requestedVideoIds,
      missingVideoIds: requestedVideoIds.filter((videoId) => !videos[videoId]),
      videos
    };
  }

  function dispatchSnapshotChange(action, snapshot) {
    try {
      window.dispatchEvent(
        new CustomEvent("pawnyoutubestatschange", {
          detail: {
            action,
            snapshot: deepClone(snapshot)
          }
        })
      );
    } catch (error) {
      // Ignore event dispatch issues so the stats layer stays resilient.
    }
  }

  function getSnapshotSource() {
    if (readJsonStorage(SNAPSHOT_STORAGE_KEY)) {
      return "Browser";
    }

    if (publishedSnapshot) {
      return "Published";
    }

    return "None";
  }

  function loadSnapshot() {
    return normalizeSnapshot(readJsonStorage(SNAPSHOT_STORAGE_KEY) || publishedSnapshot);
  }

  function saveSnapshot(snapshot, action) {
    const normalized = normalizeSnapshot(snapshot);

    if (normalized) {
      writeJsonStorage(SNAPSHOT_STORAGE_KEY, normalized);
      dispatchSnapshotChange(action || "save", normalized);
      return normalized;
    }

    removeStorageItem(SNAPSHOT_STORAGE_KEY);
    dispatchSnapshotChange(action || "clear", null);
    return null;
  }

  function clearSnapshot() {
    removeStorageItem(SNAPSHOT_STORAGE_KEY);
    dispatchSnapshotChange("clear", publishedSnapshot);
    return loadSnapshot();
  }

  function getApiKey() {
    return readTextStorage(API_KEY_STORAGE_KEY);
  }

  function setApiKey(value) {
    return writeTextStorage(API_KEY_STORAGE_KEY, value);
  }

  function clearApiKey() {
    return writeTextStorage(API_KEY_STORAGE_KEY, "");
  }

  function compareDatesDesc(left, right) {
    return new Date(right || 0) - new Date(left || 0);
  }

  function collectCatalogVideos(catalog) {
    const artists = new Map(
      ensureArray(catalog && catalog.artists).map((artist) => [artist.slug, artist.name])
    );
    const releases = ensureArray(catalog && catalog.releases);
    const byVideoId = new Map();
    let totalTracks = 0;
    let tracksWithIds = 0;

    releases.forEach((release) => {
      ensureArray(release.tracks).forEach((track, trackIndex) => {
        totalTracks += 1;
        const videoId = String((track && track.youtubeId) || "").trim();

        if (!videoId) {
          return;
        }

        tracksWithIds += 1;

        if (!byVideoId.has(videoId)) {
          byVideoId.set(videoId, {
            videoId,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            usages: []
          });
        }

        byVideoId.get(videoId).usages.push({
          artistSlug: String((release && release.artist) || "label").trim(),
          artistName:
            artists.get(String((release && release.artist) || "label").trim()) ||
            String((release && release.artist) || "label").trim(),
          releaseSlug: String((release && release.slug) || "").trim(),
          releaseTitle: String((release && release.title) || "").trim(),
          releaseType: String((release && release.type) || "").trim(),
          releaseStatus: String((release && release.status) || "").trim(),
          releaseDate: String((release && release.releaseDate) || "").trim(),
          trackSlug: String((track && track.slug) || `track-${trackIndex + 1}`).trim(),
          trackTitle: String((track && track.title) || `Track ${trackIndex + 1}`).trim(),
          runtime: String((track && track.runtime) || "").trim(),
          hasLyrics: Boolean(track && track.lyrics),
          fanDownloadCount: ensureArray(track && track.fanDownloads).length,
          hasSuperfanOffer: Boolean(
            track &&
              track.superfan &&
              (track.superfan.checkoutUrl ||
                (track.superfan.djPackage && track.superfan.djPackage.checkoutUrl))
          )
        });
      });
    });

    const videos = [...byVideoId.values()]
      .map((entry) => {
        const usages = [...entry.usages].sort((left, right) =>
          compareDatesDesc(left.releaseDate, right.releaseDate)
        );

        return {
          videoId: entry.videoId,
          url: entry.url,
          usages,
          primary: usages[0] || null
        };
      })
      .sort((left, right) => {
        const leftDate = left.primary ? left.primary.releaseDate : "";
        const rightDate = right.primary ? right.primary.releaseDate : "";
        return compareDatesDesc(leftDate, rightDate);
      });

    return {
      totalTracks,
      tracksWithIds,
      tracksMissingIds: Math.max(totalTracks - tracksWithIds, 0),
      videos
    };
  }

  function compareVideosByTrend(left, right) {
    const deltaDifference = right.delta.viewCount - left.delta.viewCount;

    if (deltaDifference !== 0) {
      return deltaDifference;
    }

    const viewDifference = right.statistics.viewCount - left.statistics.viewCount;

    if (viewDifference !== 0) {
      return viewDifference;
    }

    return left.primary.trackTitle.localeCompare(right.primary.trackTitle);
  }

  function compareVideosByViews(left, right) {
    const viewDifference = right.statistics.viewCount - left.statistics.viewCount;

    if (viewDifference !== 0) {
      return viewDifference;
    }

    return compareVideosByTrend(left, right);
  }

  function buildDashboard(catalog, options) {
    const settings = isObject(options) ? options : {};
    const limit = toNumber(settings.limit) || 5;
    const snapshot = normalizeSnapshot(settings.snapshot || loadSnapshot());
    const catalogSummary = collectCatalogVideos(catalog);
    const snapshotVideos = snapshot ? snapshot.videos : {};
    const videos = catalogSummary.videos.map((entry) => {
      const video = snapshotVideos[entry.videoId] || null;

      return {
        videoId: entry.videoId,
        url: video ? video.url : entry.url,
        title: video && video.title ? video.title : entry.primary.trackTitle,
        channelTitle: video ? video.channelTitle : "",
        publishedAt: video ? video.publishedAt : "",
        duration: video ? video.duration : "",
        statistics: video
          ? video.statistics
          : {
              viewCount: 0,
              likeCount: 0,
              commentCount: 0
            },
        delta: video
          ? video.delta
          : {
              viewCount: 0,
              likeCount: 0,
              commentCount: 0
            },
        hasSnapshot: Boolean(video),
        primary: entry.primary,
        usages: entry.usages
      };
    });
    const rankedByTrend = [...videos].sort(compareVideosByTrend);
    const rankedByViews = [...videos].sort(compareVideosByViews);

    return {
      sourceLabel: getSnapshotSource(),
      fetchedAt: snapshot ? snapshot.fetchedAt : "",
      totalTracks: catalogSummary.totalTracks,
      tracksWithIds: catalogSummary.tracksWithIds,
      tracksMissingIds: catalogSummary.tracksMissingIds,
      trackedVideos: catalogSummary.videos.length,
      fetchedVideos: videos.filter((video) => video.hasSnapshot).length,
      unresolvedVideoIds: catalogSummary.videos
        .filter((entry) => !snapshotVideos[entry.videoId])
        .map((entry) => entry.videoId),
      totalViews: videos.reduce((total, video) => total + video.statistics.viewCount, 0),
      totalLikes: videos.reduce((total, video) => total + video.statistics.likeCount, 0),
      totalComments: videos.reduce((total, video) => total + video.statistics.commentCount, 0),
      totalViewDelta: videos.reduce((total, video) => total + video.delta.viewCount, 0),
      totalLikeDelta: videos.reduce((total, video) => total + video.delta.likeCount, 0),
      totalCommentDelta: videos.reduce((total, video) => total + video.delta.commentCount, 0),
      videosWithGrowth: videos.filter((video) => video.delta.viewCount > 0).length,
      topVideo: rankedByViews[0] || null,
      videos: rankedByTrend,
      trendingVideos: rankedByTrend.slice(0, limit)
    };
  }

  async function readResponseJson(response) {
    try {
      return await response.json();
    } catch (error) {
      return {};
    }
  }

  async function refreshCatalogStats(catalog, providedApiKey) {
    const apiKey = String(providedApiKey || getApiKey()).trim();

    if (!apiKey) {
      throw new Error("Save a YouTube Data API key first.");
    }

    const catalogSummary = collectCatalogVideos(catalog);
    const requestedVideoIds = catalogSummary.videos.map((entry) => entry.videoId);
    const previousSnapshot = loadSnapshot();
    const previousVideos = previousSnapshot ? previousSnapshot.videos : {};

    if (requestedVideoIds.length === 0) {
      return saveSnapshot(
        {
          fetchedAt: new Date().toISOString(),
          requestedVideoIds: [],
          missingVideoIds: [],
          videos: {}
        },
        "refresh"
      );
    }

    const items = [];

    for (const idChunk of chunk(requestedVideoIds, 50)) {
      const url = new URL("https://www.googleapis.com/youtube/v3/videos");
      url.searchParams.set("part", "snippet,statistics,contentDetails");
      url.searchParams.set("id", idChunk.join(","));
      url.searchParams.set("key", apiKey);

      const response = await fetch(url.toString());
      const payload = await readResponseJson(response);

      if (!response.ok) {
        const message =
          payload &&
          payload.error &&
          payload.error.message
            ? payload.error.message
            : `YouTube request failed with status ${response.status}.`;

        throw new Error(message);
      }

      items.push(...ensureArray(payload.items));
    }

    const itemMap = new Map();
    items.forEach((item) => {
      const videoId = String((item && item.id) || "").trim();

      if (videoId) {
        itemMap.set(videoId, item);
      }
    });

    const snapshot = {
      fetchedAt: new Date().toISOString(),
      requestedVideoIds,
      missingVideoIds: requestedVideoIds.filter((videoId) => !itemMap.has(videoId)),
      videos: {}
    };

    requestedVideoIds.forEach((videoId) => {
      const item = itemMap.get(videoId);

      if (!item) {
        return;
      }

      const statistics = normalizeStatistics(item.statistics);
      const previousStatistics = previousVideos[videoId]
        ? previousVideos[videoId].statistics
        : {
            viewCount: 0,
            likeCount: 0,
            commentCount: 0
          };

      snapshot.videos[videoId] = {
        videoId,
        title: String((item.snippet && item.snippet.title) || "").trim(),
        channelTitle: String((item.snippet && item.snippet.channelTitle) || "").trim(),
        publishedAt: String((item.snippet && item.snippet.publishedAt) || "").trim(),
        duration: String((item.contentDetails && item.contentDetails.duration) || "").trim(),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        statistics,
        delta: {
          viewCount: Math.max(0, statistics.viewCount - toNumber(previousStatistics.viewCount)),
          likeCount: Math.max(0, statistics.likeCount - toNumber(previousStatistics.likeCount)),
          commentCount: Math.max(
            0,
            statistics.commentCount - toNumber(previousStatistics.commentCount)
          )
        }
      };
    });

    return saveSnapshot(snapshot, "refresh");
  }

  function pruneSnapshotForCatalog(snapshot, catalog) {
    const normalizedSnapshot = normalizeSnapshot(snapshot);

    if (!normalizedSnapshot) {
      return null;
    }

    const requestedVideoIds = collectCatalogVideos(catalog).videos.map((entry) => entry.videoId);
    const videos = {};

    requestedVideoIds.forEach((videoId) => {
      if (normalizedSnapshot.videos[videoId]) {
        videos[videoId] = normalizedSnapshot.videos[videoId];
      }
    });

    return normalizeSnapshot({
      fetchedAt: normalizedSnapshot.fetchedAt,
      requestedVideoIds,
      missingVideoIds: requestedVideoIds.filter((videoId) => !videos[videoId]),
      videos
    });
  }

  function exportPublishedScript(catalog) {
    const snapshot = pruneSnapshotForCatalog(loadSnapshot(), catalog);
    return `window.PAWN_PUBLISHED_YOUTUBE_STATS = ${JSON.stringify(snapshot, null, 2)};\n`;
  }

  function formatNumber(value, options) {
    const settings = isObject(options) ? options : {};
    const compact = settings.compact === true;
    const formatter = compact ? compactNumberFormatter : fullNumberFormatter;
    return formatter.format(toNumber(value));
  }

  function formatDelta(value, options) {
    const normalizedValue = toNumber(value);

    if (normalizedValue <= 0) {
      return "No change";
    }

    return `+${formatNumber(normalizedValue, options)}`;
  }

  function formatDateTime(value) {
    if (!value) {
      return "Not refreshed yet";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(date);
  }

  window.PAWN_YOUTUBE_STATS = {
    storageKeys: {
      apiKey: API_KEY_STORAGE_KEY,
      snapshot: SNAPSHOT_STORAGE_KEY
    },
    getApiKey,
    setApiKey,
    clearApiKey,
    loadSnapshot,
    saveSnapshot,
    clearSnapshot,
    getSourceLabel: getSnapshotSource,
    collectCatalogVideos,
    getDashboard(catalog, options) {
      return buildDashboard(catalog, options);
    },
    refreshCatalogStats,
    exportPublishedScript,
    formatNumber,
    formatDelta,
    formatDateTime
  };
})();
