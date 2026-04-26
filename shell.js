(function () {
  const frame = document.getElementById("site-shell-frame");
  const loadingCard = document.getElementById("shell-loading");
  const fallbackPage = "index.html";

  // Track whether the next load event is from a browser history traversal
  // (back/forward) vs. a user-initiated navigation, so we know whether to
  // push a new history entry or leave the browser URL alone.
  let isInitialLoad = true;
  let isHistoryTraversal = false;
  let navigationToken = 0;
  let completedNavigationToken = 0;
  let expectedTarget = "";
  let frameResizeObserver = null;
  let frameMutationObserver = null;
  let frameHeightRaf = 0;
  let gestureAccumulatedX = 0;
  let gestureAccumulatedY = 0;
  let gestureIntent = "";
  let gestureConsumed = false;
  let gestureResetTimer = 0;
  let lastGestureNavigationAt = 0;
  let gestureNavigationLockedUntil = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchLastY = 0;
  let touchIntent = "";
  let touchStartTime = 0;
  const shellPages = Array.from(
    new Set(
      Array.from(document.querySelectorAll(".shell-nav [data-shell-page]"))
        .map((link) => sanitizeTarget(link.dataset.shellPage || link.getAttribute("href")))
        .filter(Boolean)
    )
  );
  const gestureThreshold = 86;
  const gestureDominance = 1.45;
  const gestureCooldown = 1500;

  function sanitizeTarget(rawValue) {
    const raw = String(rawValue || fallbackPage).trim();

    if (!raw) {
      return fallbackPage;
    }

    let decoded = raw;

    try {
      decoded = decodeURIComponent(raw);
    } catch (error) {
      decoded = raw;
    }

    if (/^[a-z]+:/i.test(decoded) || decoded.startsWith("//")) {
      return fallbackPage;
    }

    const url = new URL(decoded, window.location.href);
    const file = url.pathname.split("/").pop() || fallbackPage;

    if (!/\.html$/i.test(file) || file === "shell.html") {
      return fallbackPage;
    }

    return `${file}${url.search}${url.hash}`;
  }

  function currentRequestedPage() {
    const currentFile = window.location.pathname.split("/").pop() || "";

    if (currentFile && currentFile !== "shell.html" && /\.html$/i.test(currentFile)) {
      return `${currentFile}${window.location.search}${window.location.hash}`;
    }

    const requested = new URLSearchParams(window.location.search).get("page");
    return sanitizeTarget(requested);
  }

  function syncBrowserChrome() {
    try {
      const childWindow = frame.contentWindow;
      const childDocument = frame.contentDocument;

      if (!childWindow || !childDocument) {
        return;
      }

      const childFile = childWindow.location.pathname.split("/").pop() || fallbackPage;
      const childUrl = `${childFile}${childWindow.location.search}${childWindow.location.hash}`;

      if (childDocument.title) {
        document.title = childDocument.title;
      }

      if (isInitialLoad) {
        // Replace the shell.html entry so the initial page is addressable.
        window.history.replaceState({ page: childUrl }, "", childUrl);
        isInitialLoad = false;
      } else if (isHistoryTraversal) {
        // The URL is already correct from the popstate event; just sync the title.
        isHistoryTraversal = false;
      } else {
        // User-initiated navigation: push a new history entry so back works.
        window.history.pushState({ page: childUrl }, "", childUrl);
      }
    } catch (error) {
      // Ignore sync failures if the frame is between navigations.
    }
  }

  function expectedPageMatchesFrame() {
    try {
      const childWindow = frame.contentWindow;

      if (!childWindow) {
        return false;
      }

      const childFile = childWindow.location.pathname.split("/").pop() || fallbackPage;
      const childUrl = `${childFile}${childWindow.location.search}${childWindow.location.hash}`;
      return childUrl === expectedTarget;
    } catch (error) {
      return false;
    }
  }

  function activeShellPage() {
    const targetFile = sanitizeTarget(expectedTarget || currentRequestedPage()).replace(/[?#].*$/, "");
    const index = shellPages.findIndex((page) => page.replace(/[?#].*$/, "") === targetFile);
    return index >= 0 ? index : 0;
  }

  function resetGesture() {
    gestureAccumulatedX = 0;
    gestureAccumulatedY = 0;
    gestureIntent = "";
    gestureConsumed = false;

    if (gestureResetTimer) {
      window.clearTimeout(gestureResetTimer);
      gestureResetTimer = 0;
    }
  }

  function scheduleGestureReset() {
    if (gestureResetTimer) {
      window.clearTimeout(gestureResetTimer);
    }

    gestureResetTimer = window.setTimeout(resetGesture, 180);
  }

  function navigateByDirection(direction) {
    const now = Date.now();

    if (
      !shellPages.length ||
      now < gestureNavigationLockedUntil ||
      now - lastGestureNavigationAt < gestureCooldown
    ) {
      gestureConsumed = true;
      gestureAccumulatedX = 0;
      gestureAccumulatedY = 0;
      scheduleGestureReset();
      return false;
    }

    const currentIndex = activeShellPage();
    const nextIndex = Math.min(
      shellPages.length - 1,
      Math.max(0, currentIndex + (direction === "next" ? 1 : -1))
    );

    if (nextIndex === currentIndex) {
      gestureConsumed = true;
      gestureAccumulatedX = 0;
      gestureAccumulatedY = 0;
      scheduleGestureReset();
      return false;
    }

    lastGestureNavigationAt = now;
    gestureNavigationLockedUntil = now + gestureCooldown;
    gestureConsumed = true;
    gestureAccumulatedX = 0;
    gestureAccumulatedY = 0;
    gestureIntent = "horizontal";
    scheduleGestureReset();
    navigate(shellPages[nextIndex]);
    return true;
  }

  function handleGestureWheel(event) {
    const isChildFrameEvent = event.currentTarget !== window;
    const absX = Math.abs(event.deltaX);
    const absY = Math.abs(event.deltaY);

    if (!absX && !absY) {
      return;
    }

    if (!gestureIntent) {
      if (absX > 18 && absX > absY * gestureDominance) {
        gestureIntent = "horizontal";
      } else if (absY > 10 && absY >= absX) {
        gestureIntent = "vertical";
      }
    }

    if (gestureIntent !== "horizontal") {
      if (isChildFrameEvent && absY > 0) {
        event.preventDefault();
        window.scrollBy({
          left: 0,
          top: event.deltaY,
          behavior: "auto"
        });
      }

      scheduleGestureReset();
      return;
    }

    event.preventDefault();
    scheduleGestureReset();

    if (gestureConsumed) {
      return;
    }

    gestureAccumulatedX += event.deltaX;
    gestureAccumulatedY += event.deltaY;

    if (
      Math.abs(gestureAccumulatedX) >= gestureThreshold &&
      Math.abs(gestureAccumulatedX) > Math.abs(gestureAccumulatedY) * gestureDominance
    ) {
      navigateByDirection(gestureAccumulatedX > 0 ? "next" : "previous");
    }
  }

  function handleGestureTouchStart(event) {
    if (event.touches.length !== 1) {
      resetGesture();
      return;
    }

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchLastY = touchStartY;
    touchIntent = "";
    touchStartTime = Date.now();
  }

  function handleGestureTouchMove(event) {
    const touch = event.touches[0];

    if (!touch || !touchStartTime || event.currentTarget === window) {
      return;
    }

    const totalX = touch.clientX - touchStartX;
    const totalY = touch.clientY - touchStartY;

    if (!touchIntent) {
      if (Math.abs(totalX) > 18 && Math.abs(totalX) > Math.abs(totalY) * gestureDominance) {
        touchIntent = "horizontal";
      } else if (Math.abs(totalY) > 10 && Math.abs(totalY) >= Math.abs(totalX)) {
        touchIntent = "vertical";
      }
    }

    if (touchIntent === "vertical") {
      event.preventDefault();
      window.scrollBy({
        left: 0,
        top: touchLastY - touch.clientY,
        behavior: "auto"
      });
      touchLastY = touch.clientY;
    }
  }

  function handleGestureTouchEnd(event) {
    const touch = event.changedTouches[0];

    if (!touch || !touchStartTime) {
      return;
    }

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const elapsed = Date.now() - touchStartTime;
    touchStartTime = 0;
    touchIntent = "";

    if (
      elapsed <= 900 &&
      Math.abs(deltaX) >= 64 &&
      Math.abs(deltaX) > Math.abs(deltaY) * gestureDominance
    ) {
      navigateByDirection(deltaX < 0 ? "next" : "previous");
    }
  }

  function bindGestureTarget(targetWindow) {
    if (!targetWindow || targetWindow.__pawnShellGesturesBound) {
      return;
    }

    targetWindow.__pawnShellGesturesBound = true;
    targetWindow.addEventListener("wheel", handleGestureWheel, { passive: false });
    targetWindow.addEventListener("touchstart", handleGestureTouchStart, { passive: true });
    targetWindow.addEventListener("touchmove", handleGestureTouchMove, { passive: false });
    targetWindow.addEventListener("touchend", handleGestureTouchEnd, { passive: true });
  }

  function bindPageGestures() {
    bindGestureTarget(window);
  }

  function disconnectFrameSizing() {
    if (frameResizeObserver) {
      frameResizeObserver.disconnect();
      frameResizeObserver = null;
    }

    if (frameMutationObserver) {
      frameMutationObserver.disconnect();
      frameMutationObserver = null;
    }

    if (frameHeightRaf) {
      window.cancelAnimationFrame(frameHeightRaf);
      frameHeightRaf = 0;
    }
  }

  function shellHeaderHeight() {
    const header = document.querySelector(".shell-header");
    const height = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty("--shell-header-height", `${height}px`);
    return height;
  }

  function audioClearance() {
    const rawValue = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--site-audio-height");
    const parsedValue = Number.parseFloat(rawValue);
    return Number.isFinite(parsedValue) ? parsedValue : 92;
  }

  function minimumFrameHeight() {
    return Math.max(320, Math.ceil(window.innerHeight - shellHeaderHeight() - audioClearance()));
  }

  function childPageHeight(childDocument) {
    const body = childDocument.body;
    const root = childDocument.documentElement;

    return Math.ceil(
      Math.max(
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        root ? root.scrollHeight : 0,
        root ? root.offsetHeight : 0,
        root ? root.clientHeight : 0
      )
    );
  }

  function markChildAsShellFramed(childDocument) {
    childDocument.documentElement.classList.add("is-shell-framed");

    if (childDocument.body) {
      childDocument.body.classList.add("is-shell-framed-body");
    }

    bindGestureTarget(childDocument.defaultView);
  }

  function scheduleFrameHeightSync() {
    if (frameHeightRaf) {
      return;
    }

    frameHeightRaf = window.requestAnimationFrame(() => {
      frameHeightRaf = 0;

      try {
        const childDocument = frame.contentDocument;

        if (!childDocument || !expectedPageMatchesFrame()) {
          return;
        }

        markChildAsShellFramed(childDocument);
        frame.style.height = `${Math.max(childPageHeight(childDocument), minimumFrameHeight())}px`;
      } catch (error) {
        // If the iframe is between states, the next load/ready pass will resize it.
      }
    });
  }

  function observeFrameSizing() {
    try {
      const childDocument = frame.contentDocument;

      if (!childDocument || !childDocument.documentElement) {
        return;
      }

      disconnectFrameSizing();
      markChildAsShellFramed(childDocument);
      scheduleFrameHeightSync();

      if ("ResizeObserver" in window) {
        frameResizeObserver = new ResizeObserver(scheduleFrameHeightSync);
        frameResizeObserver.observe(childDocument.documentElement);

        if (childDocument.body) {
          frameResizeObserver.observe(childDocument.body);
        }
      }

      if ("MutationObserver" in window && childDocument.body) {
        frameMutationObserver = new MutationObserver(scheduleFrameHeightSync);
        frameMutationObserver.observe(childDocument.body, {
          attributes: true,
          childList: true,
          subtree: true
        });
      }
    } catch (error) {
      // Same-origin iframe should be readable once stable; wait for the next ready pass.
    }
  }

  function completeNavigation(token) {
    if (token !== navigationToken || completedNavigationToken === token || !expectedPageMatchesFrame()) {
      return;
    }

    completedNavigationToken = token;
    observeFrameSizing();
    syncBrowserChrome();
    syncShellNav();
    loadingCard.hidden = true;
  }

  function watchFrameReady(token) {
    window.setTimeout(() => {
      if (token !== navigationToken || completedNavigationToken === token) {
        return;
      }

      try {
        const childDocument = frame.contentDocument;

        if (
          childDocument &&
          childDocument.readyState !== "loading" &&
          expectedPageMatchesFrame()
        ) {
          completeNavigation(token);
          return;
        }
      } catch (error) {
        // The iframe should stay same-origin, but wait for load if it is between states.
      }

      watchFrameReady(token);
    }, 80);
  }

  function navigate(target) {
    const nextTarget = sanitizeTarget(target);
    const token = navigationToken + 1;
    navigationToken = token;
    completedNavigationToken = 0;
    expectedTarget = nextTarget;
    disconnectFrameSizing();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    frame.style.height = `${minimumFrameHeight()}px`;
    loadingCard.hidden = false;
    frame.src = nextTarget;
    watchFrameReady(token);
  }

  // Sync aria-current on shell nav links to match the active iframe page.
  function syncShellNav() {
    try {
      const childFile = frame.contentWindow.location.pathname.split("/").pop() || "index.html";
      const navParentMap = { "artist.html": "roster.html", "epk.html": "epks.html" };
      const activeFile = navParentMap[childFile] || childFile;
      document.querySelectorAll("[data-shell-page]").forEach((link) => {
        if (link.dataset.shellPage === activeFile) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    } catch (e) {
      // Cross-origin or between navigations — ignore.
    }
  }

  frame.addEventListener("load", () => {
    completeNavigation(navigationToken);
  });

  window.addEventListener("resize", scheduleFrameHeightSync);

  // Handle browser back/forward: navigate the iframe to the recorded page.
  window.addEventListener("popstate", (event) => {
    const target = (event.state && event.state.page) || currentRequestedPage();
    isHistoryTraversal = true;
    navigate(sanitizeTarget(target));
  });

  // Shell nav: intercept link clicks to navigate inside the iframe instead of the parent.
  document.querySelectorAll("[data-shell-page]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.dataset.shellPage);
    });
  });

  bindPageGestures();
  navigate(currentRequestedPage());
})();
