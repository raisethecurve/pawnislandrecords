(function () {
  const store = window.PAWN_CATALOG_STORE;
  const youtubeStats = window.PAWN_YOUTUBE_STATS;

  if (!store || !youtubeStats) {
    return;
  }

  const elements = {
    apiKey: document.getElementById("youtube-api-key"),
    saveKey: document.getElementById("save-youtube-api-key"),
    clearKey: document.getElementById("clear-youtube-api-key"),
    refresh: document.getElementById("refresh-youtube-stats"),
    download: document.getElementById("download-youtube-publish-script"),
    keyNote: document.getElementById("youtube-key-note"),
    coverageTags: document.getElementById("youtube-coverage-tags"),
    status: document.getElementById("youtube-status"),
    summary: document.getElementById("youtube-stats-summary"),
    trendList: document.getElementById("youtube-trend-list")
  };

  if (
    !elements.apiKey ||
    !elements.saveKey ||
    !elements.clearKey ||
    !elements.refresh ||
    !elements.download ||
    !elements.keyNote ||
    !elements.coverageTags ||
    !elements.status ||
    !elements.summary ||
    !elements.trendList
  ) {
    return;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getCatalog() {
    return store.loadCatalog();
  }

  function setStatus(message, tone) {
    elements.status.textContent = message;
    elements.status.dataset.tone = tone || "info";
  }

  function syncKeyInput() {
    elements.apiKey.value = youtubeStats.getApiKey();
    elements.keyNote.textContent = youtubeStats.getApiKey()
      ? "A YouTube API key is saved in this browser for staff use."
      : "No browser-saved YouTube API key detected yet.";
  }

  function renderCoverageTags(dashboard) {
    const tags = [
      `${dashboard.tracksWithIds}/${dashboard.totalTracks} tracks have YouTube IDs`,
      `${dashboard.trackedVideos} unique video IDs tracked`,
      `${dashboard.sourceLabel} pulse source`,
      dashboard.fetchedAt
        ? `Last refresh ${youtubeStats.formatDateTime(dashboard.fetchedAt)}`
        : "No stats refresh yet"
    ];

    elements.coverageTags.innerHTML = tags
      .map((label) => `<span class="tag tag--muted">${escapeHtml(label)}</span>`)
      .join("");
  }

  function renderSummary(dashboard) {
    elements.summary.innerHTML = `
      <article class="stat-card">
        <span class="stat-card__value">${dashboard.trackedVideos}</span>
        <span class="stat-card__label">Unique YouTube videos tracked</span>
      </article>
      <article class="stat-card">
        <span class="stat-card__value">${dashboard.tracksMissingIds}</span>
        <span class="stat-card__label">Tracks still missing a YouTube ID</span>
      </article>
      <article class="stat-card">
        <span class="stat-card__value">${youtubeStats.formatNumber(dashboard.totalViews, {
          compact: true
        })}</span>
        <span class="stat-card__label">Total published views across fetched videos</span>
      </article>
      <article class="stat-card">
        <span class="stat-card__value">${youtubeStats.formatDelta(dashboard.totalViewDelta, {
          compact: true
        })}</span>
        <span class="stat-card__label">Views gained since the previous snapshot</span>
      </article>
      <article class="stat-card">
        <span class="stat-card__value">${dashboard.videosWithGrowth}</span>
        <span class="stat-card__label">Videos showing positive movement</span>
      </article>
      <article class="stat-card">
        <span class="stat-card__value">${dashboard.unresolvedVideoIds.length}</span>
        <span class="stat-card__label">IDs with no API result yet</span>
      </article>
    `;
  }

  function renderTrendList(dashboard) {
    if (dashboard.totalTracks === 0) {
      elements.trendList.innerHTML =
        '<div class="empty-state">No tracks are loaded yet. Add releases first, then the YouTube pulse can track them.</div>';
      return;
    }

    if (dashboard.trackedVideos === 0) {
      elements.trendList.innerHTML =
        '<div class="empty-state">No track-level YouTube IDs are stored yet. Add a <code>youtubeId</code> to each track you want included in the DSP pulse.</div>';
      return;
    }

    if (dashboard.fetchedVideos === 0) {
      elements.trendList.innerHTML =
        '<div class="empty-state">YouTube IDs are present, but there is no live snapshot yet. Save a YouTube API key and click <code>Refresh Stats</code> to build the first pulse.</div>';
      return;
    }

    const rows = dashboard.trendingVideos.map((entry) => {
      const metrics = [
        `${youtubeStats.formatDelta(entry.delta.viewCount, {
          compact: true
        })} views`,
        `${youtubeStats.formatNumber(entry.statistics.likeCount)} likes`,
        `${youtubeStats.formatNumber(entry.statistics.commentCount)} comments`
      ];

      if (entry.channelTitle) {
        metrics.push(entry.channelTitle);
      }

      return `
        <article class="entry-row">
          <div class="entry-row__body">
            <p class="eyebrow">YouTube pulse</p>
            <h3>${escapeHtml(entry.primary.trackTitle)}</h3>
            <p class="entry-row__meta">
              ${escapeHtml(entry.primary.artistName)} | ${escapeHtml(
                entry.primary.releaseTitle
              )} | ${youtubeStats.formatNumber(entry.statistics.viewCount)} total views
            </p>
            <div class="trend-metrics">
              ${metrics
                .map((label, index) =>
                  `<span class="tag${index === 0 ? "" : " tag--muted"}">${escapeHtml(label)}</span>`
                )
                .join("")}
            </div>
          </div>
          <div class="entry-row__actions">
            <a class="button button--ghost" href="${entry.url}" target="_blank" rel="noreferrer">
              Open Video
            </a>
          </div>
        </article>
      `;
    });

    if (dashboard.unresolvedVideoIds.length) {
      rows.push(`
        <article class="entry-row">
          <div class="entry-row__body">
            <p class="eyebrow">Attention</p>
            <h3>${dashboard.unresolvedVideoIds.length} video ID${
        dashboard.unresolvedVideoIds.length === 1 ? "" : "s"
      } need a second look</h3>
            <p class="entry-row__meta">
              The API did not return data for these IDs: ${escapeHtml(
                dashboard.unresolvedVideoIds.slice(0, 6).join(", ")
              )}${dashboard.unresolvedVideoIds.length > 6 ? "..." : ""}
            </p>
          </div>
        </article>
      `);
    }

    elements.trendList.innerHTML = rows.join("");
  }

  function renderDashboard() {
    const dashboard = youtubeStats.getDashboard(getCatalog(), {
      limit: 8
    });

    renderCoverageTags(dashboard);
    renderSummary(dashboard);
    renderTrendList(dashboard);

    return dashboard;
  }

  function setBusy(isBusy) {
    [elements.saveKey, elements.clearKey, elements.refresh, elements.download].forEach(
      (button) => {
        button.disabled = isBusy;
      }
    );
  }

  function saveKey() {
    const key = elements.apiKey.value.trim();

    if (!key) {
      setStatus("Paste a YouTube API key before saving it.", "warning");
      return;
    }

    youtubeStats.setApiKey(key);
    syncKeyInput();
    setStatus("Saved the YouTube API key in this browser only.", "success");
  }

  function clearKey() {
    youtubeStats.clearApiKey();
    syncKeyInput();
    setStatus("Cleared the browser-saved YouTube API key.", "info");
  }

  async function refreshStats() {
    const key = elements.apiKey.value.trim() || youtubeStats.getApiKey();

    if (!key) {
      setStatus("Save a YouTube API key first, then refresh the live stats.", "warning");
      return;
    }

    youtubeStats.setApiKey(key);
    syncKeyInput();
    setBusy(true);
    setStatus("Refreshing live YouTube stats for the current catalog...", "info");

    try {
      await youtubeStats.refreshCatalogStats(getCatalog(), key);
      const dashboard = renderDashboard();

      setStatus(
        dashboard.fetchedVideos
          ? `Refreshed YouTube stats for ${dashboard.fetchedVideos} catalog video${
              dashboard.fetchedVideos === 1 ? "" : "s"
            }.`
          : "YouTube refresh ran, but no catalog videos were available yet.",
        "success"
      );
    } catch (error) {
      setStatus(
        `Could not refresh YouTube stats: ${error && error.message ? error.message : "Unknown error."}`,
        "warning"
      );
    } finally {
      setBusy(false);
    }
  }

  function downloadPublishedSnapshot() {
    const dashboard = youtubeStats.getDashboard(getCatalog(), {
      limit: 1
    });

    if (!dashboard.fetchedVideos) {
      setStatus(
        "Refresh YouTube stats first so there is a snapshot to publish into the repo.",
        "warning"
      );
      return;
    }

    const blob = new Blob([youtubeStats.exportPublishedScript(getCatalog())], {
      type: "application/javascript"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "youtube-stats-published.js";
    anchor.click();
    URL.revokeObjectURL(url);

    setStatus(
      "Downloaded youtube-stats-published.js. Replace the repo file with it when you want the public site to show this YouTube pulse by default.",
      "success"
    );
  }

  function handleStorageChange(event) {
    if (
      event.key === youtubeStats.storageKeys.apiKey ||
      event.key === youtubeStats.storageKeys.snapshot ||
      event.key === store.storageKey
    ) {
      syncKeyInput();
      renderDashboard();
    }
  }

  function bindEvents() {
    elements.saveKey.addEventListener("click", saveKey);
    elements.clearKey.addEventListener("click", clearKey);
    elements.refresh.addEventListener("click", refreshStats);
    elements.download.addEventListener("click", downloadPublishedSnapshot);

    window.addEventListener("pawncatalogchange", renderDashboard);
    window.addEventListener("pawnyoutubestatschange", renderDashboard);
    window.addEventListener("storage", handleStorageChange);
  }

  function init() {
    syncKeyInput();
    const dashboard = renderDashboard();

    if (!dashboard.trackedVideos) {
      setStatus("Add track-level YouTube IDs and the live pulse will start filling in.", "info");
    } else if (!dashboard.fetchedVideos) {
      setStatus("Save a YouTube API key and refresh stats to build the first pulse.", "info");
    } else {
      setStatus(
        `Showing the latest ${dashboard.sourceLabel.toLowerCase()} YouTube pulse from ${youtubeStats.formatDateTime(
          dashboard.fetchedAt
        )}.`,
        "info"
      );
    }

    bindEvents();
  }

  init();
})();
