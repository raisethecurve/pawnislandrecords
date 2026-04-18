(function () {
  if (window.top !== window.self) {
    return;
  }

  const currentFile = window.location.pathname.split("/").pop() || "index.html";

  if (currentFile === "shell.html") {
    return;
  }

  const currentUrl = new URL(window.location.href);

  if (currentUrl.searchParams.get("standalone") === "1") {
    return;
  }

  const pageTarget = `${currentFile}${currentUrl.search}${currentUrl.hash}`;
  const shellUrl = new URL("shell.html", currentUrl.href);
  shellUrl.searchParams.set("page", pageTarget);
  window.location.replace(shellUrl.toString());
})();
