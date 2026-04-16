(function () {
  const store = window.PAWN_CATALOG_STORE;
  const youtubeStats = window.PAWN_YOUTUBE_STATS;
  const summary = document.getElementById("youtube-pulse-summary");
  const grid = document.getElementById("youtube-pulse-grid");

  if (!store || !youtubeStats || !summary || !grid) {
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

  function renderEmptyState(message) {
    grid.innerHTML = `<div class="empty-state">${message}</div>`;
  }

  function renderPulse() {
    const dashboard = youtubeStats.getDashboard(getCatalog(), {
      limit: 4
    });

    summary.innerHTML = `
      <article class="stat-card">
        <span class="stat-card__value">${dashboard.trackedVideos}</span>
        <span class="stat-card__label">Unique catalog videos tracked</span>
      </article>
      <article class="stat-card">
        <span class="stat-card__value">${youtubeStats.formatNumber(dashboard.totalViews, {
          compact: true
        })}</span>
        <span class="stat-card__label">Published snapshot total views</span>
      </article>
      <article class="stat-card">
        <span class="stat-card__value">${youtubeStats.formatDelta(dashboard.totalViewDelta, {
          compact: true
        })}</span>
        <span class="stat-card__label">Views gained since last refresh</span>
      </article>
      <article class="stat-card">
        <span class="stat-card__value">${dashboard.sourceLabel}</span>
        <span class="stat-card__label">${
          dashboard.fetchedAt
            ? `Last refresh ${youtubeStats.formatDateTime(dashboard.fetchedAt)}`
            : "No published pulse yet"
        }</span>
      </article>
    `;

    if (dashboard.totalTracks === 0) {
      renderEmptyState(
        "No tracks are loaded yet. Add releases in the admin page and this YouTube pulse will populate automatically."
      );
      return;
    }

    if (dashboard.trackedVideos === 0) {
      renderEmptyState(
        "Track-level YouTube IDs are still missing from the catalog, so the public pulse has nothing to show yet."
      );
      return;
    }

    if (!dashboard.fetchedVideos) {
      renderEmptyState(
        "A published YouTube snapshot has not been generated yet. Refresh stats in admin and publish `youtube-stats-published.js` to surface live momentum here."
      );
      return;
    }

    grid.innerHTML = dashboard.trendingVideos
      .map(
        (entry) => `
          <article class="control-card">
            <div class="control-card__header">
              <div>
                <p class="eyebrow">YouTube pulse</p>
                <h3>${escapeHtml(entry.primary.trackTitle)}</h3>
              </div>
              <span class="tag">${youtubeStats.formatDelta(entry.delta.viewCount, {
                compact: true
              })} views</span>
            </div>
            <p class="control-card__meta">
              ${escapeHtml(entry.primary.artistName)} | ${escapeHtml(entry.primary.releaseTitle)}
            </p>
            <div class="tag-row">
              <span class="tag">${youtubeStats.formatNumber(entry.statistics.viewCount)} views</span>
              <span class="tag tag--muted">${youtubeStats.formatNumber(
                entry.statistics.likeCount
              )} likes</span>
              <span class="tag tag--muted">${youtubeStats.formatNumber(
                entry.statistics.commentCount
              )} comments</span>
            </div>
            <p class="control-card__action">
              ${
                entry.channelTitle
                  ? `Live on ${escapeHtml(entry.channelTitle)}.`
                  : "Published video snapshot available."
              }
            </p>
            <div class="control-card__footer">
              <a class="pill-link" href="${entry.url}" target="_blank" rel="noreferrer">
                Watch on YouTube
              </a>
              <span class="tag tag--muted">${dashboard.sourceLabel} snapshot</span>
            </div>
          </article>
        `
      )
      .join("");
  }

  function handleStorageChange(event) {
    if (event.key === youtubeStats.storageKeys.snapshot || event.key === store.storageKey) {
      renderPulse();
    }
  }

  function bindEvents() {
    window.addEventListener("pawncatalogchange", renderPulse);
    window.addEventListener("pawnyoutubestatschange", renderPulse);
    window.addEventListener("storage", handleStorageChange);
  }

  renderPulse();
  bindEvents();
})();
