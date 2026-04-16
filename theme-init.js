(function () {
  const storageKey = "pawn-island-theme";
  const storedTheme = window.localStorage.getItem(storageKey);
  const prefersNight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = storedTheme || (prefersNight ? "night" : "day");

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "night" ? "dark" : "light";
})();
