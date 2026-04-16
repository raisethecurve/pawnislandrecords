(function () {
  const storageKey = "pawn-island-theme";

  function getThemeLabel(theme) {
    return theme === "night" ? "Night mode" : "Day mode";
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "night" ? "dark" : "light";
    window.localStorage.setItem(storageKey, theme);

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", theme === "night" ? "true" : "false");
    });

    document.querySelectorAll("[data-theme-toggle-label]").forEach((label) => {
      label.textContent = getThemeLabel(theme);
    });
  }

  function toggleTheme() {
    const nextTheme =
      document.documentElement.dataset.theme === "night" ? "day" : "night";
    setTheme(nextTheme);
  }

  function initThemeToggle() {
    const currentTheme = document.documentElement.dataset.theme || "day";
    setTheme(currentTheme);

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", toggleTheme);
    });
  }

  window.PawnTheme = {
    getThemeLabel,
    initThemeToggle,
    setTheme
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle, { once: true });
  } else {
    initThemeToggle();
  }
})();
