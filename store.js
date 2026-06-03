(function () {
  const body = document.body;
  const overlay = document.querySelector("[data-shop-overlay]");
  const cartToggleButtons = document.querySelectorAll("[data-shop-cart-toggle]");
  const filterToggleButtons = document.querySelectorAll("[data-shop-filter-toggle]");
  const headerCartCount = document.getElementById("shop-cart-count");
  const printfulCartCount = document.getElementById("printful-cart-count");
  const searchInput = document.getElementById("printful-product-search");
  const grid = document.getElementById("printful-store-grid");

  function syncOverlay() {
    const open = body.classList.contains("shop-cart-open") || body.classList.contains("shop-filter-open");

    if (overlay) {
      overlay.hidden = !open;
    }
  }

  function setCartOpen(open) {
    body.classList.toggle("shop-cart-open", Boolean(open));
    cartToggleButtons.forEach((button) => {
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
    syncOverlay();
  }

  function setFilterOpen(open) {
    body.classList.toggle("shop-filter-open", Boolean(open));
    filterToggleButtons.forEach((button) => {
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
    syncOverlay();
  }

  function closeDrawers() {
    setCartOpen(false);
    setFilterOpen(false);
  }

  function syncCartCount() {
    if (!headerCartCount || !printfulCartCount) {
      return;
    }

    const value = printfulCartCount.textContent.trim() || "0";
    headerCartCount.textContent = value;
    headerCartCount.hidden = value === "0";
    cartToggleButtons.forEach((button) => {
      button.setAttribute("aria-label", value === "0" ? "Open cart" : `Open cart, ${value} item${value === "1" ? "" : "s"}`);
    });
  }

  cartToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilterOpen(false);
      setCartOpen(!body.classList.contains("shop-cart-open"));
    });
  });

  filterToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCartOpen(false);
      setFilterOpen(!body.classList.contains("shop-filter-open"));
    });
  });

  document.querySelectorAll("[data-shop-cart-close]").forEach((button) => {
    button.addEventListener("click", () => setCartOpen(false));
  });

  document.querySelectorAll("[data-shop-filter-close]").forEach((button) => {
    button.addEventListener("click", () => setFilterOpen(false));
  });

  document.querySelectorAll("[data-shop-search-focus]").forEach((button) => {
    button.addEventListener("click", () => {
      closeDrawers();
      if (searchInput) {
        searchInput.scrollIntoView({ block: "center", behavior: "smooth" });
        window.setTimeout(() => searchInput.focus(), 180);
      }
    });
  });

  document.querySelectorAll("[data-shop-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.shopView || "grid";
      body.classList.toggle("shop-compact-view", mode === "compact");
      document.querySelectorAll("[data-shop-view]").forEach((viewButton) => {
        const active = viewButton === button;
        viewButton.classList.toggle("is-active", active);
        viewButton.setAttribute("aria-pressed", active ? "true" : "false");
      });
    });
  });

  if (overlay) {
    overlay.addEventListener("click", closeDrawers);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawers();
    }
  });

  window.addEventListener("pawnisland:merch-event", (event) => {
    if (event.detail && event.detail.name === "add_to_cart") {
      setCartOpen(true);
    }
  });

  if (printfulCartCount) {
    syncCartCount();
    new MutationObserver(syncCartCount).observe(printfulCartCount, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  if (grid) {
    new MutationObserver(() => {
      if (body.classList.contains("shop-filter-open") && window.matchMedia("(max-width: 820px)").matches) {
        setFilterOpen(false);
      }
    }).observe(grid, { childList: true });
  }
})();
