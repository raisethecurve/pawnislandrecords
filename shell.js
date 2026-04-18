(function () {
  const frame = document.getElementById("site-shell-frame");
  const loadingCard = document.getElementById("shell-loading");
  const fallbackPage = "index.html";

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

      window.history.replaceState({ page: childUrl }, "", childUrl);
    } catch (error) {
      // Ignore sync failures if the frame is between navigations.
    }
  }

  function navigate(target) {
    const nextTarget = sanitizeTarget(target);
    loadingCard.hidden = false;
    frame.src = nextTarget;
  }

  frame.addEventListener("load", () => {
    syncBrowserChrome();
    loadingCard.hidden = true;
  });

  navigate(currentRequestedPage());
})();
