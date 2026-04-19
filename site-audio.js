(function () {
  if (window.top !== window.self) {
    return;
  }

  const defaults = {
    enabled: true,
    src: "",
    title: "Background Audio",
    artist: "Site soundtrack",
    volume: 0.32,
    loop: true,
    startMuted: false
  };
  const config = Object.assign({}, defaults, window.PAWN_AUDIO_CONFIG || {});
  const src = String(config.src || "").trim();

  if (config.enabled === false || !src) {
    return;
  }

  const PREFS_KEY = "pawn-island-audio-prefs-v1";
  const SESSION_KEY = "pawn-island-audio-session-v1";

  function clamp(value, min, max) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return min;
    }

    return Math.min(max, Math.max(min, number));
  }

  function readStorage(storage, key) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function writeStorage(storage, key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage failures so the player still works in restricted modes.
    }
  }

  const prefs = Object.assign(
    {
      muted: Boolean(config.startMuted),
      volume: clamp(config.volume, 0, 1),
      userStarted: false,
      collapsed: false
    },
    readStorage(window.localStorage, PREFS_KEY)
  );
  const session = Object.assign(
    {
      src,
      currentTime: 0,
      wantedPlaying: true
    },
    readStorage(window.sessionStorage, SESSION_KEY)
  );

  if (session.src !== src) {
    session.src = src;
    session.currentTime = 0;
    session.wantedPlaying = true;
  }

  session.wantedPlaying = true;

  const audio = new Audio(src);
  let resumeApplied = false;
  let autoplayBlocked = false;
  let lastSavedAt = 0;
  let unlockBound = false;

  audio.preload = session.wantedPlaying || prefs.userStarted ? "auto" : "metadata";
  audio.loop = config.loop !== false;
  audio.volume = clamp(prefs.volume, 0, 1);
  audio.muted = Boolean(prefs.muted);
  audio.playsInline = true;

  const dock = document.createElement("section");
  dock.className = "site-audio";
  dock.setAttribute("aria-label", "Background audio controls");
  dock.innerHTML = `
    <div class="site-audio__panel">
      <div class="site-audio__meta">
        <strong class="site-audio__title"></strong>
        <span class="site-audio__status"></span>
      </div>
      <label class="site-audio__volume">
        <span class="site-audio__volume-label">Volume</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value="32"
          aria-label="Background audio volume"
          data-audio-volume
        />
      </label>
      <div class="site-audio__controls">
        <button class="site-audio__button site-audio__button--ghost" type="button" data-audio-mute></button>
        <button
          class="site-audio__button site-audio__button--ghost site-audio__button--caret"
          type="button"
          data-audio-collapse
          aria-label="Hide audio bar"
        >
          <span class="site-audio__caret site-audio__caret--down" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  `;
  const tabButton = document.createElement("button");
  tabButton.className = "site-audio-tab";
  tabButton.type = "button";
  tabButton.setAttribute("aria-label", "Show audio bar");
  tabButton.setAttribute("data-audio-expand", "");
  tabButton.innerHTML = '<span class="site-audio__caret site-audio__caret--up" aria-hidden="true"></span>';
  document.body.append(dock);
  document.body.append(tabButton);
  document.body.classList.add("has-site-audio");

  const titleNode = dock.querySelector(".site-audio__title");
  const statusNode = dock.querySelector(".site-audio__status");
  const muteButton = dock.querySelector("[data-audio-mute]");
  const collapseButton = dock.querySelector("[data-audio-collapse]");
  const volumeInput = dock.querySelector("[data-audio-volume]");

  titleNode.textContent = String(config.title || defaults.title).trim();

  function persistPrefs() {
    writeStorage(window.localStorage, PREFS_KEY, {
      muted: audio.muted,
      volume: clamp(audio.volume, 0, 1),
      userStarted: prefs.userStarted,
      collapsed: Boolean(prefs.collapsed)
    });
  }

  function persistSession(overrides) {
    const next = Object.assign({}, session, overrides, { src });
    session.src = next.src;
    session.currentTime = clamp(next.currentTime, 0, Number.MAX_SAFE_INTEGER);
    session.wantedPlaying = Boolean(next.wantedPlaying);
    writeStorage(window.sessionStorage, SESSION_KEY, next);
  }

  function syncDockHeight() {
    const height = dock.offsetHeight || 104;
    const tabHeight = tabButton.offsetHeight || 36;
    const clearance = (prefs.collapsed ? tabHeight : height) + 12;
    document.documentElement.style.setProperty("--site-audio-height", `${height}px`);
    document.documentElement.style.setProperty("--site-audio-clearance", `${clearance}px`);
  }

  function bindAutoplayUnlock() {
    if (unlockBound) {
      return;
    }

    unlockBound = true;

    const unlock = () => {
      if (autoplayBlocked && session.wantedPlaying) {
        attemptPlay(true);
      }

      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      unlockBound = false;
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
  }

  function safeCurrentTime() {
    return Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  }

  function applyResumePoint() {
    if (resumeApplied || !Number.isFinite(audio.duration)) {
      return;
    }

    const nextTime = clamp(session.currentTime, 0, Math.max(audio.duration - 0.25, 0));

    if (nextTime > 0) {
      try {
        audio.currentTime = nextTime;
      } catch (error) {
        // Ignore resume failures on browsers that gate seeks until later.
      }
    }

    resumeApplied = true;
  }

  function render() {
    const isPlaying = !audio.paused && !audio.ended;
    const isCollapsed = Boolean(prefs.collapsed);

    dock.dataset.state = isPlaying ? "playing" : autoplayBlocked ? "blocked" : "paused";
    dock.dataset.collapsed = isCollapsed ? "true" : "false";
    dock.setAttribute("aria-hidden", isCollapsed ? "true" : "false");
    tabButton.dataset.visible = isCollapsed ? "true" : "false";
    tabButton.setAttribute("aria-hidden", isCollapsed ? "false" : "true");
    tabButton.tabIndex = isCollapsed ? 0 : -1;
    muteButton.tabIndex = isCollapsed ? -1 : 0;
    collapseButton.tabIndex = isCollapsed ? -1 : 0;
    volumeInput.tabIndex = isCollapsed ? -1 : 0;
    muteButton.textContent = audio.muted ? "Unmute" : "Mute";
    volumeInput.value = String(Math.round(clamp(audio.volume, 0, 1) * 100));

    if (isPlaying) {
      statusNode.textContent = audio.muted ? "Muted" : "Playing";
    } else if (autoplayBlocked) {
      statusNode.textContent = "Interact anywhere to start audio";
    } else {
      statusNode.textContent = "Ready";
    }

    syncDockHeight();
  }

  async function attemptPlay(userInitiated) {
    autoplayBlocked = false;

    if (userInitiated) {
      prefs.userStarted = true;
      persistPrefs();
    }

    if (audio.readyState >= 1) {
      applyResumePoint();
    }

    persistSession({
      currentTime: session.currentTime,
      wantedPlaying: true
    });

    try {
      await audio.play();
      persistSession({
        currentTime: safeCurrentTime(),
        wantedPlaying: true
      });
    } catch (error) {
      autoplayBlocked = true;
      bindAutoplayUnlock();
      persistSession({
        currentTime: safeCurrentTime() || session.currentTime,
        wantedPlaying: true
      });
    }

    render();
  }

  function pausePlayback() {
    audio.pause();
    autoplayBlocked = false;
    persistSession({
      currentTime: safeCurrentTime(),
      wantedPlaying: true
    });
    render();
  }

  muteButton.addEventListener("click", () => {
    audio.muted = !audio.muted;
    persistPrefs();
    render();
  });

  collapseButton.addEventListener("click", () => {
    prefs.collapsed = true;
    persistPrefs();
    render();
  });

  tabButton.addEventListener("click", () => {
    prefs.collapsed = false;
    persistPrefs();
    render();
  });

  volumeInput.addEventListener("input", () => {
    audio.volume = clamp(Number(volumeInput.value) / 100, 0, 1);

    if (audio.volume > 0 && audio.muted) {
      audio.muted = false;
    }

    persistPrefs();
    render();
  });

  audio.addEventListener("loadedmetadata", () => {
    applyResumePoint();

    if (session.wantedPlaying) {
      attemptPlay(false);
    } else {
      render();
    }
  });

  audio.addEventListener("timeupdate", () => {
    const now = Date.now();

    if (now - lastSavedAt < 900) {
      return;
    }

    lastSavedAt = now;
    persistSession({
      currentTime: safeCurrentTime(),
      wantedPlaying: !audio.paused && !audio.ended
    });
  });

  audio.addEventListener("volumechange", () => {
    persistPrefs();
    render();
  });

  audio.addEventListener("ended", () => {
    persistSession({
      currentTime: 0,
      wantedPlaying: false
    });
    render();
  });

  window.addEventListener("pagehide", () => {
    persistPrefs();
    persistSession({
      currentTime: safeCurrentTime(),
      wantedPlaying: session.wantedPlaying && !audio.ended
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden") {
      return;
    }

    persistSession({
      currentTime: safeCurrentTime(),
      wantedPlaying: session.wantedPlaying && !audio.ended
    });
  });

  if ("mediaSession" in navigator && typeof window.MediaMetadata === "function") {
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: String(config.title || defaults.title).trim(),
      artist: String(config.artist || defaults.artist).trim()
    });

    navigator.mediaSession.setActionHandler("play", () => attemptPlay(true));
    navigator.mediaSession.setActionHandler("pause", pausePlayback);
  }

  window.addEventListener("resize", syncDockHeight);
  render();
})();
