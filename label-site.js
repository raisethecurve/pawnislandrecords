(function () {
  const ui = window.PAWN_UI || null;
  const data = (ui && ui.data) || window.PAWN_PUBLIC_DATA || {
    label: {},
    artists: [],
    releases: []
  };

  const DEFAULT_TOOFM_URL = "https://too.fm/yn8xx7l";
  const DEFAULT_HOME_STREAMING_PLATFORMS = [
    "Spotify",
    "YouTube Music",
    "Apple Music",
    "Amazon Music",
    "iHeartRadio",
    "Pandora",
    "QQMusic",
    "Tidal"
  ];
  const DEFAULTS = {
    identityLine:
      "A one-person label imprint for songs that do not belong in one lane. Each project gives the writing its own weather, voice, and visual world.",
    featuredCampaignTitle: "Featured Campaign",
    featuredCampaignSummary:
      "Move from discovery to action through the label's live Too.fm campaign hub.",
    aboutText:
      "Pawn Island Records is an independent label built around distinct project identities, clear release worlds, and direct listening paths. New listeners should be able to move from curiosity to sound without friction, so every page is designed to feel immediate and readable. The label treats every project as a separate entry point rather than flattening the roster into one generic style. The result is a catalog that feels unified by intent, not sameness.",
    ethos:
      "One label. Many projects. Every release gets enough room to feel intentional.",
    timeline: [
      {
        label: "01",
        title: "Build Distinct Projects",
        text: "Shape each project like its own world instead of forcing the roster into one narrow lane."
      },
      {
        label: "02",
        title: "Release With Clarity",
        text: "Connect every campaign to direct listening, clear artwork, and a focused path out to Too.fm."
      },
      {
        label: "03",
        title: "Keep Discovery Fast",
        text: "Make the catalog easy to browse so new listeners can move naturally from project to release."
      }
    ]
  };
  const PLATFORM_ASSET_MAP = {
    spotify: "assets/brand/external/Spotify_Primary_Logo_RGB_Green.png",
    youtube: "assets/brand/external/yt_icon_red_digital.png",
    "youtube-music": "assets/brand/platforms/250px-Youtube_Music_icon.svg.png",
    "apple-music": "assets/brand/platforms/Apple_Music_Icon_RGB_sm_073120.svg",
    "amazon-music": "assets/brand/platforms/AM_App_Tile_Charcoal_Cyan_Circle.png",
    iheartradio: "assets/brand/platforms/iHeartRadio_Vertical_Logo_color_white.png",
    pandora: "assets/brand/platforms/Pandora_App_Icon_RBG.png",
    qqmusic: "assets/brand/platforms/QQ_Music2023.svg",
    tidal: "assets/brand/platforms/tidal_icon-white-rgb.png"
  };
  function brandSvg(path) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="currentColor"></path></svg>`;
  }

  const SOCIAL_DEFINITIONS = {
    facebook: {
      label: "Facebook",
      image: "assets/brand/external/Facebook_Logo_Primary.png",
      svg: brandSvg("M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z")
    },
    instagram: {
      label: "Instagram",
      image: "assets/brand/external/Instagram_Glyph_Gradient.png",
      svg: brandSvg("M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077")
    },
    threads: {
      label: "Threads",
      image: "assets/brand/external/threads-logo-white-01.png",
      svg: brandSvg("M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z")
    },
    youtube: {
      label: "YouTube",
      image: "assets/brand/external/yt_icon_red_digital.png",
      svg: brandSvg("M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z")
    },
    spotify: {
      label: "Spotify",
      image: "assets/brand/external/Spotify_Primary_Logo_RGB_Green.png",
      svg: brandSvg("M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z")
    },
    soundcloud: {
      label: "SoundCloud",
      svg: brandSvg("M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z")
    },
    tiptopjar: {
      label: "TipTopJar",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.1 8.2h7.8l-.58 9.72A2.2 2.2 0 0 1 13.12 20h-2.24a2.2 2.2 0 0 1-2.2-2.08L8.1 8.2Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"></path><path d="M9.1 8.2V6.68C9.1 5.2 10.3 4 11.78 4h.44c1.48 0 2.68 1.2 2.68 2.68V8.2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"></path><path d="M12 16.6 9.8 14.52a1.55 1.55 0 0 1 2.2-2.18 1.55 1.55 0 0 1 2.2 2.18L12 16.6Z" fill="currentColor"></path></svg>'
    },
    email: {
      label: "Email",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.8 6.6h14.4a1.8 1.8 0 0 1 1.8 1.8v7.2a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 15.6V8.4a1.8 1.8 0 0 1 1.8-1.8Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"></path><path d="m4.2 7.6 7.8 5.6 7.8-5.6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg>'
    },
    tiktok: {
      label: "TikTok",
      image: "assets/brand/external/TIKTOK_SOCIAL_ICON_SOLO_WHITE.png",
      svg: brandSvg("M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z")
    },
    x: {
      label: "X",
      svg: brandSvg("M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z")
    }
  };

  const page = document.body.dataset.page || "";
  const artistLookup = new Map((data.artists || []).map((artist) => [artist.slug, artist]));
  const releases = Array.isArray(data.releases)
    ? ui && ui.sortReleases
      ? ui.sortReleases(data.releases)
      : [...data.releases]
    : [];
  const artists = Array.isArray(data.artists) ? [...data.artists] : [];
  const featuredRelease = (ui && ui.getFeaturedRelease && ui.getFeaturedRelease()) || releases[0] || null;
  let homePendingCarouselTimer = null;

  function text(value, fallback) {
    const resolved = String(value || "").trim();
    return resolved || String(fallback || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function isExternalUrl(value) {
    return /^https?:\/\//i.test(text(value, ""));
  }

  function requestedView() {
    if (ui && ui.getSearchParam) {
      return text(ui.getSearchParam("view"), "");
    }

    return text(new URLSearchParams(window.location.search).get("view"), "");
  }

  function resolveView(requested, allowed, fallback) {
    const valid = Array.isArray(allowed) ? allowed : [];
    return valid.includes(requested) ? requested : fallback;
  }

  function syncView(view) {
    if (!view) {
      return;
    }

    if (ui && ui.updateViewParam) {
      ui.updateViewParam(view);
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("view", view);
    window.history.replaceState({}, "", nextUrl);
  }

  const launchModeValue = text(data.label && data.label.launchMode, "full").toLowerCase();
  const isFullLaunchMode = launchModeValue === "full";

  function showProjectPages() {
    return isFullLaunchMode;
  }

  function showReleasePages() {
    return isFullLaunchMode;
  }

  function showPressPages() {
    return isFullLaunchMode;
  }

  function showCatalogPage() {
    return isFullLaunchMode;
  }

  function publicNavLinks() {
    const links = [
      { href: "index.html", label: "Home" },
      { href: "roster.html", label: "Roster" }
    ];

    if (showCatalogPage()) {
      links.push({ href: "catalog.html", label: "Catalog" });
    }

    links.push({ href: "connect.html", label: "Connect" });
    links.push({ href: "about.html", label: "About" });

    if (showPressPages()) {
      links.push({ href: "epks.html", label: "Press" });
    }

    return links;
  }

  function renderPrimaryNav() {
    const links = publicNavLinks();

    document.querySelectorAll(".label-nav").forEach((nav) => {
      nav.style.setProperty("--label-nav-columns", String(links.length));
      nav.innerHTML = links
        .map(
          (link) => `
            <a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>
          `
        )
        .join("");
    });
  }

  function socialLinks() {
    const configured = Array.isArray(data.label && data.label.socialLinks) ? data.label.socialLinks : [];

    return configured
      .map((item) => {
        const key = text(item && item.key, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const definition = SOCIAL_DEFINITIONS[key] || null;

        return {
          key,
          label: text(item && item.label, definition ? definition.label : key),
          url: text(item && item.url, ""),
          role: text(item && item.role, ""),
          image: text(item && item.image, definition ? definition.image : ""),
          icon: definition ? definition.svg : ""
        };
      })
      .filter((item) => item.key && item.url);
  }

  function discoveryPlaylists() {
    const configured = Array.isArray(data.label && data.label.discoveryPlaylists)
      ? data.label.discoveryPlaylists
      : [];

    return configured
      .map((item) => ({
        title: text(item && item.title, "Playlist"),
        category: text(item && item.category, "Playlist"),
        platform: text(item && item.platform, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        url: text(item && item.url, ""),
        image: text(item && item.image, ""),
        description: text(item && item.description, "")
      }))
      .filter((item) => item.url);
  }

  function playlistPlatform(playlist) {
    const configured = text(playlist && playlist.platform, "");

    if (configured) {
      return configured;
    }

    const category = text(playlist && playlist.category, "").toLowerCase();
    const url = text(playlist && playlist.url, "").toLowerCase();

    if (category.includes("youtube") || url.includes("youtube.com") || url.includes("youtu.be")) {
      return "youtube";
    }

    if (category.includes("spotify") || url.includes("spotify.com")) {
      return "spotify";
    }

    return "playlist";
  }

  function playlistCardMarkup(playlist) {
    const platform = playlistPlatform(playlist);

    return `
      <a
        class="playlist-card playlist-card--${escapeHtml(platform)}"
        href="${escapeHtml(playlist.url)}"
        target="_blank"
        rel="noreferrer"
      >
        <span class="playlist-card__art">
          ${
            playlist.image
              ? `<img src="${escapeHtml(playlist.image)}" alt="${escapeHtml(playlist.title)} artwork" loading="lazy" decoding="async" />`
              : `<span>${escapeHtml(playlist.title.slice(0, 1))}</span>`
          }
        </span>
        <span class="playlist-card__copy">
          <span class="playlist-card__category">${escapeHtml(playlist.category)}</span>
          <strong>${escapeHtml(playlist.title)}</strong>
          <span>${escapeHtml(playlist.description)}</span>
        </span>
      </a>
    `;
  }

  function playlistSectionMarkup(options) {
    const settings = options || {};
    const items = Array.isArray(settings.items) ? settings.items : [];

    if (!items.length) {
      return "";
    }

    return `
      <section class="playlist-platform-section playlist-platform-section--${escapeHtml(settings.platform || "playlist")}">
        <div class="playlist-platform-section__header">
          <div>
            <p class="section-kicker">${escapeHtml(settings.kicker || "Playlists")}</p>
            <h3>${escapeHtml(settings.title || "Playlist Shelf")}</h3>
          </div>
          <p>${escapeHtml(settings.copy || "")}</p>
        </div>
        <div class="playlist-grid playlist-grid--${escapeHtml(settings.platform || "playlist")}">
          ${items.map(playlistCardMarkup).join("")}
        </div>
      </section>
    `;
  }

  function renderSocialFooter() {
    const links = socialLinks();
    const currentYear = new Date().getFullYear();

    if (!links.length) {
      return;
    }

    const markup = links
      .map(
        (link) => `
          <a
            class="social-icon-link social-icon-link--${escapeHtml(link.key)}"
            href="${escapeHtml(link.url)}"
            target="_blank"
            rel="noreferrer"
            aria-label="${escapeHtml(link.label)}"
            title="${escapeHtml(link.label)}"
          >
            ${
              link.icon ||
              (link.image
                ? `<img src="${escapeHtml(link.image)}" alt="" loading="eager" decoding="async" />`
                : `<span>${escapeHtml(link.label.slice(0, 1))}</span>`)
            }
          </a>
        `
      )
      .join("");

    const pageShell = document.querySelector(".label-page");

    if (!pageShell || pageShell.querySelector(".social-footer")) {
      return;
    }

    pageShell.insertAdjacentHTML(
      "beforeend",
      `
        <footer class="social-footer" aria-label="Social links">
          <div class="social-icon-row">${markup}</div>
          <small class="social-footer__copyright">&copy; ${escapeHtml(currentYear)} Pawn Island Records</small>
        </footer>
      `
    );
  }

  function launchHoldMarkup(options) {
    const settings = options || {};
    const actions = (settings.actions || publicNavLinks())
      .map(
        (link) => `
          <a class="button button--ghost button--small" href="${escapeHtml(link.href)}">
            ${escapeHtml(link.label)}
          </a>
        `
      )
      .join("");

    return `
      <article class="empty-card empty-card--launch">
        <p class="section-kicker">${escapeHtml(text(settings.kicker, "Launch Mode"))}</p>
        <h2>${escapeHtml(text(settings.title, "This page is staying private for now."))}</h2>
        <p>${escapeHtml(
          text(
            settings.copy,
            "We're keeping this section off the public site until the written copy is ready."
          )
        )}</p>
        ${
          actions
            ? `<div class="action-row action-row--center">${actions}</div>`
            : ""
        }
      </article>
    `;
  }

  function renderLaunchHoldState(panel, options) {
    if (!panel) {
      return;
    }

    const settings = options || {};
    const documentTitle = text(
      settings.documentTitle,
      text(settings.title, "Launch Mode")
    );
    const metaDescription = text(
      settings.metaDescription,
      text(
        settings.copy,
        "We're keeping this section off the public site until the written copy is ready."
      )
    );

    document.title = `${documentTitle} | Pawn Island Records`;

    if (ui && ui.setMetaDescription) {
      ui.setMetaDescription(metaDescription);
    }

    panel.innerHTML = launchHoldMarkup(settings);
  }

  function syncViewportHeight() {
    document.documentElement.style.setProperty("--viewport-height", `${window.innerHeight}px`);
  }

  function artistForRelease(release) {
    return release ? artistLookup.get(release.artist) || null : null;
  }

  function latestReleaseForArtist(artistSlug) {
    return artistReleases(artistSlug)[0] || null;
  }

  function artistFilterUrl(artistSlug) {
    return `catalog.html?artist=${encodeURIComponent(artistSlug)}`;
  }

  function artistPageUrl(artistSlug, releaseSlug) {
    return `artist.html?artist=${encodeURIComponent(artistSlug)}${releaseSlug ? `&release=${encodeURIComponent(releaseSlug)}` : ""}`;
  }

  function epkPageUrl(artistSlug) {
    return `epk.html?artist=${encodeURIComponent(artistSlug)}`;
  }

  function artistReleases(artistSlug) {
    if (ui && ui.getArtistReleases) {
      return ui.getArtistReleases(artistSlug);
    }

    return releases.filter((release) => release.artist === artistSlug);
  }

  function releasePageUrl(slug) {
    return `release.html?release=${encodeURIComponent(slug)}`;
  }

  function primaryEmbedFor(release) {
    if (ui && ui.primaryEmbed) {
      return ui.primaryEmbed(release);
    }

    return {
      label: text(release && release.primaryEmbedLabel, ""),
      url: text(release && release.primaryEmbedUrl, "")
    };
  }

  function preferredYoutubeIdFor(release) {
    if (ui && ui.preferredYoutubeId) {
      return ui.preferredYoutubeId(release);
    }

    return text(release && release.youtubeId, "");
  }

  function youtubeEmbedUrl(videoId) {
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }

  function resolveTooFmUrl(release, options) {
    const settings = options || {};
    const directUrl = text(release && (release.tooFmUrl || release.toofmUrl || release.campaignUrl), "");

    if (directUrl) {
      return directUrl;
    }

    if (settings.allowFallback === false) {
      return "";
    }

    return text(data.label && data.label.defaultTooFmUrl, DEFAULT_TOOFM_URL);
  }

  function campaignUrl() {
    return text(
      data.label &&
        (data.label.featuredCampaignUrl ||
          data.label.campaignUrl ||
          data.label.defaultTooFmUrl),
      DEFAULT_TOOFM_URL
    );
  }

  function playlistUrl() {
    return text(
      data.label &&
        (data.label.catalogPlaylistUrl ||
          data.label.playlistUrl ||
          data.label.catalogPlaylistLink),
      "catalog.html"
    );
  }

  function labelIdentityLine() {
    return text(
      data.label && (data.label.identityLine || data.label.intro || data.label.tagline),
      DEFAULTS.identityLine
    );
  }

  function releaseState(release) {
    return ui && ui.releaseState ? ui.releaseState(release) : "catalog";
  }

  function releaseStatusLabel(release) {
    return ui && ui.releaseStatusLabel ? ui.releaseStatusLabel(release) : "Release";
  }

  function releaseAvailability(release) {
    return ui && ui.releaseAvailabilityText ? ui.releaseAvailabilityText(release) : "";
  }

  function formatReleaseDateValue(value) {
    return ui && ui.formatReleaseDate ? ui.formatReleaseDate(value) : text(value, "");
  }

  function releaseCtaLabel(release) {
    return ui && ui.releaseCtaLabel ? ui.releaseCtaLabel(release) : "Play now";
  }

  function splitReleaseGroups(list) {
    if (ui && ui.splitReleases) {
      return ui.splitReleases(list);
    }

    return {
      upcoming: [],
      live: Array.isArray(list) ? [...list] : [],
      catalog: []
    };
  }

  function releaseAction(release) {
    if (!release) {
      return null;
    }

    const url = resolveTooFmUrl(release, { allowFallback: false });

    if (!url) {
      return null;
    }

    return {
      label: releaseCtaLabel(release),
      url,
      external: true
    };
  }

  function releaseCountText(count) {
    return `${count} release${count === 1 ? "" : "s"}`;
  }

  function availabilitySummary(groups) {
    const items = [];

    if (groups.upcoming.length) {
      items.push(`${groups.upcoming.length} forthcoming`);
    }

    if (groups.live.length) {
      items.push(`${groups.live.length} out now`);
    }

    if (groups.catalog.length) {
      items.push(`${groups.catalog.length} in catalog`);
    }

    return items.join(", ");
  }

  function artistFocusLine(artist, release) {
    if (!release) {
      return `${artist.name} is building out its public catalog.`;
    }

    if (releaseState(release) === "upcoming") {
      const date = formatReleaseDateValue(release.releaseDate);
      return date
        ? `Next release: ${release.title} arrives ${date}.`
        : `Next release: ${release.title}.`;
    }

    const date = formatReleaseDateValue(release.releaseDate);
    return date
      ? `Out now: ${release.title}, released ${date}.`
      : `Out now: ${release.title}.`;
  }

  function artistFocusMarkup(artist, release) {
    if (!release) {
      return escapeHtml(artistFocusLine(artist, release));
    }

    const isUpcoming = releaseState(release) === "upcoming";
    const date = formatReleaseDateValue(release.releaseDate);
    const label = isUpcoming ? "Next release" : "Out now";
    const tail = date
      ? isUpcoming
        ? ` arrives ${date}.`
        : ` released ${date}.`
      : ".";

    return `
      <span class="artist-card__status-label">${escapeHtml(label)}:</span>
      <span class="artist-card__status-title">${escapeHtml(release.title)}</span>${escapeHtml(tail)}
    `;
  }

  function chunkItems(list, size) {
    const items = Array.isArray(list) ? list : [];
    const chunkSize = Math.max(1, Number(size) || 1);
    const groups = [];

    for (let index = 0; index < items.length; index += chunkSize) {
      groups.push(items.slice(index, index + chunkSize));
    }

    return groups;
  }

  function pendingReleaseCardMarkup(release) {
    const artist = artistForRelease(release);
    const action = releaseAction(release);

    return `
      <article class="pending-album">
        <div class="pending-album__art">
          <img
            src="${escapeHtml(text(release.cover, "assets/brand/pawnisland-256.jpg"))}"
            alt="${escapeHtml(release.title)} artwork"
            loading="lazy"
          />
        </div>
        <div class="pending-album__body">
          <p class="pending-album__status">${escapeHtml(releaseStatusLabel(release))}</p>
          <h4>${escapeHtml(release.title)}</h4>
          <p class="pending-album__meta">${escapeHtml(artist ? artist.name : "Pawn Island Records")}</p>
          <p class="pending-album__date">${escapeHtml(releaseAvailability(release) || "Release date coming soon")}</p>
          ${
            action
              ? `
                  <a
                    class="pending-album__link"
                    href="${escapeHtml(action.url)}"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ${escapeHtml(action.label)}
                  </a>
                `
              : ""
          }
        </div>
      </article>
    `;
  }

  function pendingCarouselMarkup(list) {
    const slides = chunkItems(list, 3);

    if (!slides.length) {
      return "";
    }

    return `
      <p class="section-kicker pending-carousel__kicker">Pending Releases</p>
      <section class="pending-carousel" aria-label="Pending releases">
        <div class="pending-carousel__header">
          <h3>On deck</h3>
          <p class="pending-carousel__count">${list.length} drop${list.length === 1 ? "" : "s"} pending</p>
        </div>
        <div class="pending-carousel__viewport">
          <div class="pending-carousel__track">
            ${slides
              .map(
                (chunk, slideIndex) => `
                  <div class="pending-carousel__slide" data-pending-slide="${slideIndex}" aria-hidden="${slideIndex === 0 ? "false" : "true"}">
                    ${chunk.map((release) => pendingReleaseCardMarkup(release)).join("")}
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
        ${
          slides.length > 1
            ? `
                <div class="pending-carousel__dots" aria-label="Pending release slider controls">
                  ${slides
                    .map(
                      (_, slideIndex) => `
                        <button
                          class="pending-carousel__dot${slideIndex === 0 ? " is-active" : ""}"
                          type="button"
                          aria-label="Show pending release slide ${slideIndex + 1}"
                          aria-pressed="${slideIndex === 0 ? "true" : "false"}"
                          data-pending-dot="${slideIndex}"
                        ></button>
                      `
                    )
                    .join("")}
                </div>
              `
            : ""
        }
      </section>
    `;
  }

  function setupPendingCarousel(scope) {
    const root = scope || document;
    const carousel = root.querySelector(".pending-carousel");

    if (homePendingCarouselTimer) {
      window.clearInterval(homePendingCarouselTimer);
      homePendingCarouselTimer = null;
    }

    if (!carousel) {
      return;
    }

    const track = carousel.querySelector(".pending-carousel__track");
    const slides = Array.from(carousel.querySelectorAll(".pending-carousel__slide"));
    const dots = Array.from(carousel.querySelectorAll(".pending-carousel__dot"));

    if (!track || slides.length <= 1) {
      return;
    }

    let currentIndex = 0;

    const setSlide = (nextIndex) => {
      currentIndex = (nextIndex + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      slides.forEach((slide, slideIndex) => {
        slide.setAttribute("aria-hidden", String(slideIndex !== currentIndex));
      });

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === currentIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-pressed", String(isActive));
      });
    };

    const startTimer = () => {
      if (homePendingCarouselTimer || slides.length <= 1) {
        return;
      }

      homePendingCarouselTimer = window.setInterval(() => {
        setSlide(currentIndex + 1);
      }, 4200);
    };

    const stopTimer = () => {
      if (!homePendingCarouselTimer) {
        return;
      }

      window.clearInterval(homePendingCarouselTimer);
      homePendingCarouselTimer = null;
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const nextIndex = Number(dot.getAttribute("data-pending-dot")) || 0;
        setSlide(nextIndex);
        stopTimer();
        startTimer();
      });
    });

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    carousel.addEventListener("focusin", stopTimer);
    carousel.addEventListener("focusout", startTimer);

    setSlide(0);
    startTimer();
  }

  function releaseCardMarkup(release, index, options) {
    const settings = options || {};
    const artist = artistForRelease(release);
    const action = releaseAction(release);
    const releasePageVisible = settings.showReleasePage !== false && showReleasePages();
    const metaLine = [
      text(release.type, "Release"),
      text(release.year, ""),
      release.tracks.length
        ? `${release.tracks.length} ${release.tracks.length === 1 ? "track" : "tracks"}`
        : ""
    ].filter(Boolean);
    const vibeLine = text(release.vibe, "");
    const releasePageLabel = text(settings.releasePageLabel, "Release Page");
    const artistLabel = settings.showArtistName === false
      ? escapeHtml(metaLine.slice(0, 2).join(" / "))
      : escapeHtml(artist ? artist.name : "Pawn Island Records");
    const coverMarkup = artworkMarkup(
      release.cover,
      release.title,
      artist ? artist.name : "Release",
      index
    );
    const cardActions = [
      releasePageVisible
        ? `
            <a
              class="button button--ghost button--small"
              href="${escapeHtml(releasePageUrl(release.slug))}"
            >
              ${escapeHtml(releasePageLabel)}
            </a>
          `
        : "",
      action
        ? `
            <a
              class="button button--toofm button--small"
              href="${escapeHtml(action.url)}"
              target="_blank"
              rel="noreferrer"
            >
              ${escapeHtml(action.label)}
            </a>
          `
        : ""
    ]
      .filter(Boolean)
      .join("");

    return `
      <article class="release-card ${settings.cardClass ? escapeHtml(settings.cardClass) : ""}">
        ${
          releasePageVisible
            ? `
                <a
                  class="release-card__cover"
                  href="${escapeHtml(releasePageUrl(release.slug))}"
                  aria-label="Open ${escapeHtml(release.title)} release page"
                >
                  ${coverMarkup}
                </a>
              `
            : `
                <div class="release-card__cover">
                  ${coverMarkup}
                </div>
              `
        }
        <p class="release-card__eyebrow">${escapeHtml(releaseStatusLabel(release))}</p>
        <div>
          <h2>${escapeHtml(release.title)}</h2>
          <p class="release-card__artist">${artistLabel}</p>
        </div>
        <div class="release-card__catalog-meta">
          <p class="release-card__meta-line">${escapeHtml(metaLine.join(" / "))}</p>
          ${
            releaseAvailability(release)
              ? `<p class="release-card__date">${escapeHtml(releaseAvailability(release))}</p>`
              : ""
          }
          ${
            vibeLine
              ? `<p class="release-card__mood">${escapeHtml(vibeLine)}</p>`
              : ""
          }
        </div>
        ${
          cardActions
            ? `<div class="release-card__actions">${cardActions}</div>`
            : ""
        }
      </article>
    `;
  }

  function releaseGroupMarkup(groupKey, title, copy, list, options) {
    const settings = options || {};

    if (!list.length) {
      return "";
    }

    const groupId = `${settings.idPrefix || "group"}-${groupKey}`;

    return `
      <section class="catalog-group catalog-group--${escapeHtml(groupKey)}" aria-labelledby="${escapeHtml(groupId)}">
        <div class="catalog-group__header">
          <div>
            <p class="section-kicker">${escapeHtml(title)}</p>
            <h2 id="${escapeHtml(groupId)}">${escapeHtml(title)}</h2>
          </div>
          ${
            copy
              ? `<p class="catalog-group__copy">${escapeHtml(copy)}</p>`
              : ""
          }
        </div>
        <div class="release-strip catalog-group__strip">
          ${list
            .map((release, index) =>
              releaseCardMarkup(release, index, settings.cardOptions)
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function aboutCopy() {
    return text(
      data.label && (data.label.aboutText || data.label.about || data.label.intro),
      DEFAULTS.aboutText
    );
  }

  function aboutEthos() {
    return text(data.label && data.label.ethos, DEFAULTS.ethos);
  }

  function aboutTimeline() {
    const configured = Array.isArray(data.label && data.label.timeline) ? data.label.timeline : [];

    if (!configured.length) {
      return DEFAULTS.timeline;
    }

    return configured.map((item, index) => {
      if (typeof item === "string") {
        return {
          label: String(index + 1).padStart(2, "0"),
          title: item,
          text: ""
        };
      }

      return {
        label: text(item.label, String(index + 1).padStart(2, "0")),
        title: text(item.title || item.heading || item.name, `Step ${index + 1}`),
        text: text(item.text || item.copy || item.description, "")
      };
    });
  }

  function campaignTitle() {
    return text(data.label && data.label.featuredCampaignTitle, DEFAULTS.featuredCampaignTitle);
  }

  function campaignSummary() {
    return text(
      data.label && data.label.featuredCampaignSummary,
      DEFAULTS.featuredCampaignSummary
    );
  }

  function homeStreamingPlatforms() {
    const configured = Array.isArray(data.label && data.label.streamingPlatforms)
      ? data.label.streamingPlatforms.map((label) => text(label, "")).filter(Boolean)
      : [];
    const selected = configured.length ? configured : DEFAULT_HOME_STREAMING_PLATFORMS;

    return selected.map((label) => {
      const definition = ui && ui.getPlatformDefinition ? ui.getPlatformDefinition(label) : null;

      return {
        key: definition
          ? definition.key
          : text(label, "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, ""),
        label: definition ? definition.name : label,
        icon: definition ? definition.svg : "",
        image: definition && PLATFORM_ASSET_MAP[definition.key] ? PLATFORM_ASSET_MAP[definition.key] : ""
      };
    });
  }

  function artworkMarkup(source, titleValue, subtitleValue, index, options) {
    const settings = options || {};
    const accent = index % 2 === 0 ? "#ffcc00" : "#4169e1";
    const alt = `${titleValue} artwork`;
    const loading = settings.loading === "eager" ? "eager" : "lazy";
    const fetchPriority = settings.fetchPriority || settings.fetchpriority || (loading === "eager" ? "high" : "low");
    const format = settings.format === "landscape" ? "landscape" : "square";
    const width = Number(settings.width) || (format === "landscape" ? 1600 : 1200);
    const height = Number(settings.height) || (format === "landscape" ? 900 : 1200);
    const sizes = String(
      settings.sizes ||
      (format === "landscape"
        ? "(min-width: 1100px) 24rem, (min-width: 720px) 40vw, 92vw"
        : "(min-width: 1100px) 18rem, (min-width: 720px) 30vw, 92vw")
    ).trim();

    if (ui && ui.artworkImageMarkup) {
      return ui.artworkImageMarkup({
        src: source,
        title: titleValue,
        subtitle: subtitleValue,
        accent,
        alt,
        loading,
        fetchPriority,
        format,
        width,
        height,
        sizes
      });
    }

    return `<img src="${escapeHtml(source)}" alt="${escapeHtml(alt)}" loading="${escapeHtml(loading)}" decoding="async" />`;
  }

  function setActiveNav() {
    const pageToHref = {
      home: "index.html",
      roster: "roster.html",
      artists: "roster.html",
      artist: "roster.html",
      releases: "catalog.html",
      connect: "connect.html",
      about: "about.html",
      epks: "epks.html",
      epk: "epks.html"
    };
    const activeHref = pageToHref[page];

    if (!activeHref) {
      return;
    }

    document.querySelectorAll(".label-nav a").forEach((link) => {
      const href = (link.getAttribute("href") || "").replace(/\?.*$/, "");

      if (href === activeHref) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function renderHome() {
    const identityLine = document.getElementById("home-identity-line");
    const platformsNode = document.getElementById("home-platforms");
    const featuredReleaseLink = document.getElementById("home-featured-release-link");
    const featureStack = document.getElementById("home-feature-stack");
    const featuredArtist = artistForRelease(featuredRelease);
    const featuredAction = releaseAction(featuredRelease);
    const featuredState = releaseState(featuredRelease);
    const featuredMetaLabel = featuredState === "upcoming" ? "Next Release" : "Featured Release";
    const featuredReleasePageVisible = Boolean(featuredRelease) && showReleasePages();
    const featuredCardActions = [
      featuredAction
        ? `
            <a
              class="button button--toofm button--small"
              href="${escapeHtml(featuredAction.url)}"
              target="_blank"
              rel="noreferrer"
            >
              ${escapeHtml(featuredAction.label)}
            </a>
          `
        : "",
      featuredReleasePageVisible
        ? `
            <a class="button button--ghost button--small" href="${escapeHtml(releasePageUrl(featuredRelease.slug))}">
              Release Page
            </a>
          `
        : ""
    ]
      .filter(Boolean)
      .join("");

    if (identityLine) {
      identityLine.textContent = labelIdentityLine();
    }

    if (platformsNode) {
      platformsNode.innerHTML = homeStreamingPlatforms()
        .map(
          (platform) => `
            <div class="platform-chip platform-chip--${escapeHtml(platform.key || "platform")}" aria-label="${escapeHtml(platform.label)}">
              <span class="platform-chip__icon" aria-hidden="true">
                ${
                  platform.image
                    ? `<img src="${escapeHtml(platform.image)}" alt="" loading="lazy" decoding="async" />`
                    : platform.icon || `<span>${escapeHtml(platform.label.slice(0, 1))}</span>`
                }
              </span>
            </div>
          `
        )
        .join("");
    }

    if (featuredReleaseLink && featuredRelease) {
      if (!featuredAction && !featuredReleasePageVisible) {
        featuredReleaseLink.classList.add("is-hidden");
      } else {
        const featuredReleaseUrl = featuredAction ? featuredAction.url : releasePageUrl(featuredRelease.slug);

        featuredReleaseLink.classList.remove("is-hidden");
        featuredReleaseLink.href = featuredReleaseUrl;
        featuredReleaseLink.textContent = featuredAction ? featuredAction.label : "Release Page";
        featuredReleaseLink.target = isExternalUrl(featuredReleaseUrl) ? "_blank" : "_self";
        if (isExternalUrl(featuredReleaseUrl)) {
          featuredReleaseLink.rel = "noreferrer";
        } else {
          featuredReleaseLink.removeAttribute("rel");
        }
        featuredReleaseLink.setAttribute(
          "aria-label",
          featuredAction
            ? `Open ${featuredRelease.title} by ${featuredArtist ? featuredArtist.name : "Pawn Island Records"} on Too.fm`
            : `Open the ${featuredRelease.title} release page`
        );
      }
    }

    if (featureStack) {
      const groupedReleases = splitReleaseGroups(releases);
      const pendingReleases = groupedReleases.upcoming.filter(
        (release) => !featuredRelease || release.slug !== featuredRelease.slug
      );
      const featureMarkup = featuredRelease
        ? `
          <p class="section-kicker feature-stack__kicker">${escapeHtml(featuredMetaLabel)}</p>
          <article class="feature-card feature-card--featured">
            <div class="feature-card__visual">
              ${artworkMarkup(
                featuredRelease.cover,
                featuredRelease.title,
                featuredArtist ? featuredArtist.name : "Featured release",
                0,
                {
                  loading: "eager",
                  fetchPriority: "high",
                  sizes: "(min-width: 1100px) 18rem, (min-width: 720px) 38vw, 92vw"
                }
              )}
            </div>
            <div class="feature-card__body">
              <h2>${escapeHtml(featuredRelease.title)}</h2>
              <p>${escapeHtml(
                featuredArtist
                  ? `${featuredArtist.name} / ${featuredRelease.type}`
                  : featuredRelease.type
              )}</p>
              ${
                releaseAvailability(featuredRelease)
                  ? `<p class="feature-card__support">${escapeHtml(releaseAvailability(featuredRelease))}</p>`
                  : ""
              }
              <p class="feature-card__summary">${escapeHtml(text(featuredRelease.description, "Step into the current release world."))}</p>
              ${
                featuredCardActions
                  ? `<div class="feature-card__actions">${featuredCardActions}</div>`
                  : ""
              }
            </div>
          </article>
          ${pendingReleases.length ? pendingCarouselMarkup(pendingReleases) : ""}
        `
        : `
          <p class="section-kicker feature-stack__kicker">Featured Release</p>
          <article class="feature-card">
            <h2>Catalog In Motion</h2>
            <p>The next release world will appear here as soon as the public catalog is updated.</p>
          </article>
          ${pendingReleases.length ? pendingCarouselMarkup(pendingReleases) : ""}
        `;

      featureStack.innerHTML = featureMarkup;
      setupPendingCarousel(featureStack);
    }
  }

  function renderArtists() {
    const collection = document.getElementById("artists-collection");

    if (!collection) {
      return;
    }

    const rosterArtists = [...artists].sort((firstArtist, secondArtist) => {
      const firstName = text(firstArtist.name, "");
      const secondName = text(secondArtist.name, "");
      const firstPinnedLast = firstName.toLowerCase() === "matt freeman";
      const secondPinnedLast = secondName.toLowerCase() === "matt freeman";

      if (firstPinnedLast !== secondPinnedLast) {
        return firstPinnedLast ? 1 : -1;
      }

      return firstName.localeCompare(secondName, undefined, {
        sensitivity: "base"
      });
    });

    collection.dataset.count = String(rosterArtists.length);
    collection.innerHTML = rosterArtists
      .map((artist, index) => {
        const latestRelease = latestReleaseForArtist(artist.slug);
        const focusAction = releaseAction(latestRelease);
        const projectPageVisible = showProjectPages();
        const coverMarkup = artworkMarkup(
          artist.image || (latestRelease && latestRelease.cover) || "",
          artist.name,
          artist.lane || "Project placeholder",
          index,
          {
            format: "square",
            sizes: "(min-width: 1100px) 17rem, (min-width: 720px) 28vw, 80vw"
          }
        );
        const cardActions = [
          projectPageVisible
            ? `
                <a class="button button--ghost button--small" href="${escapeHtml(artistPageUrl(artist.slug, latestRelease && latestRelease.slug))}">
                  Project Page
                </a>
              `
            : "",
          focusAction
            ? `
                <a
                  class="button button--toofm button--small"
                  href="${escapeHtml(focusAction.url)}"
                  target="_blank"
                  rel="noreferrer"
                >
                  ${escapeHtml(focusAction.label)}
                </a>
              `
            : ""
        ]
          .filter(Boolean)
          .join("");

        return `
          <article class="artist-card">
            ${
              projectPageVisible
                ? `
                    <a
                      class="artist-card__cover"
                      href="${escapeHtml(artistPageUrl(artist.slug, latestRelease && latestRelease.slug))}"
                      aria-label="Open ${escapeHtml(artist.name)} project page"
                    >
                      ${coverMarkup}
                    </a>
                  `
                : `
                    <div class="artist-card__cover">
                      ${coverMarkup}
                    </div>
                  `
            }
            <div>
              <h2>${escapeHtml(artist.name)}</h2>
              <p class="artist-card__genre">${escapeHtml(text(artist.lane, "Independent project"))}</p>
            </div>
            <p class="artist-card__description">
              ${escapeHtml(
                text(
                  artist.summary,
                  latestRelease
                    ? `${artist.name} is currently led by ${latestRelease.title}.`
                    : "Project summary coming into focus."
                )
              )}
            </p>
            <p class="artist-card__status">${artistFocusMarkup(artist, latestRelease)}</p>
            ${
              cardActions
                ? `<div class="card-actions">${cardActions}</div>`
                : ""
            }
          </article>
        `;
      })
      .join("");
  }

  function renderArtistPage() {
    const panel = document.getElementById("artist-page-panel");
    const artistSlug = new URLSearchParams(window.location.search).get("artist");
    const artist = artistSlug ? artistLookup.get(artistSlug) || null : null;

    if (!panel) {
      return;
    }

    if (!showProjectPages()) {
      renderLaunchHoldState(panel, {
        documentTitle: "Project Pages Coming Soon",
        title: "Project pages are staying private for launch.",
        copy:
          "The public launch is focused on Home, Roster, and About while the deeper project copy gets written."
      });
      return;
    }

    if (!artist) {
      document.title = "Project Not Found | Pawn Island Records";
      panel.innerHTML = `
        <article class="empty-card">
          <p>That project page is not available yet. Head back to the roster and choose another project.</p>
          <div class="action-row">
            <a class="button button--ghost button--small" href="roster.html">Back to Roster</a>
          </div>
        </article>
      `;
      return;
    }

    const discography = artistReleases(artist.slug);
    const latestRelease = discography[0] || null;
    const groupedDiscography = splitReleaseGroups(discography);
    const focusAction = releaseAction(latestRelease);
    const spotifySample = discography.find((release) => primaryEmbedFor(release).url);
    const youtubeSample = discography.find((release) => preferredYoutubeIdFor(release));
    const galleryReleases = discography.slice(0, 20);
    const releasePageVisible = showReleasePages();
    const titleNode = document.getElementById("artist-page-title");
    const laneNode = document.getElementById("artist-page-lane");
    const headlineNode = document.getElementById("artist-page-headline");
    const bodyNode = document.getElementById("artist-page-body");
    const actionsNode = document.getElementById("artist-page-actions");
    const visualNode = document.getElementById("artist-page-visual");
    const discographyCopyNode = document.getElementById("artist-discography-copy");
    const discographyNode = document.getElementById("artist-discography");
    const embedsNode = document.getElementById("artist-embeds");

    document.title = `${artist.name} | Pawn Island Records`;

    if (ui && ui.setMetaDescription) {
      ui.setMetaDescription(
        `${artist.name}. ${artist.headline || artist.summary || "Explore the project discography and sample listening embeds."}`
      );
    }

    const breadcrumb = document.createElement("nav");
    breadcrumb.setAttribute("aria-label", "Breadcrumb");
    breadcrumb.className = "breadcrumb";
    breadcrumb.innerHTML = `<a href="roster.html">\u2190 Roster</a><span aria-hidden="true"> / </span><span>${escapeHtml(artist.name)}</span>`;
    panel.insertBefore(breadcrumb, panel.firstElementChild);

    titleNode.textContent = artist.name;
    laneNode.textContent = text(artist.lane, "Independent project");
    headlineNode.textContent = text(artist.headline, artist.summary);
    bodyNode.textContent = text(artist.story, artist.summary);

    actionsNode.innerHTML = [
      focusAction
        ? `
            <a
              class="button button--primary"
              href="${escapeHtml(focusAction.url)}"
              target="_blank"
              rel="noreferrer"
            >
              ${escapeHtml(focusAction.label)}
            </a>
          `
        : "",
      latestRelease && releasePageVisible
        ? `
            <a class="button button--ghost" href="${escapeHtml(releasePageUrl(latestRelease.slug))}">
              Release Page
            </a>
          `
        : "",
      showPressPages()
        ? `<a class="button button--ghost" href="${escapeHtml(epkPageUrl(artist.slug))}">Open Press Kit</a>`
        : "",
      `<a class="button button--ghost" href="roster.html">Back to Roster</a>`
    ]
      .filter(Boolean)
      .join("");

    visualNode.innerHTML = `
      <div class="artist-page-visual__cover">
        ${artworkMarkup(
          artist.image || (latestRelease && latestRelease.cover) || "",
          artist.name,
          artist.lane || "Project page",
          0
        )}
      </div>
      <p class="artist-page-visual__caption">
        ${
          latestRelease
            ? escapeHtml(
                releaseState(latestRelease) === "upcoming"
                  ? `${latestRelease.title} arrives ${formatReleaseDateValue(latestRelease.releaseDate) || "soon"} and currently leads the rollout for ${artist.name}.`
                  : `${latestRelease.title} anchors the current out-now focus for ${artist.name}.`
              )
            : escapeHtml(`${artist.name} will populate with release artwork and embeds as the catalog expands.`)
        }
      </p>
    `;

    discographyCopyNode.textContent = discography.length
      ? `${releaseCountText(discography.length)} in the current catalog${availabilitySummary(groupedDiscography) ? `, with ${availabilitySummary(groupedDiscography)}.` : "."}`
      : "No public releases are attached to this project yet.";

    discographyNode.innerHTML = discography.length
      ? [
          releaseGroupMarkup(
            "upcoming",
            "Forthcoming",
            groupedDiscography.upcoming.length
              ? `${releaseCountText(groupedDiscography.upcoming.length)} scheduled for ${artist.name}, ordered by release date.`
              : "",
            groupedDiscography.upcoming,
            {
              idPrefix: `${artist.slug}-artist-upcoming`,
              cardOptions: {
                showArtistName: false,
                releasePageLabel: "Open Release",
                showReleasePage: releasePageVisible
              }
            }
          ),
          releaseGroupMarkup(
            "live",
            "Out Now",
            groupedDiscography.live.length
              ? `${releaseCountText(groupedDiscography.live.length)} already live for ${artist.name}.`
              : "",
            groupedDiscography.live,
            {
              idPrefix: `${artist.slug}-artist-live`,
              cardOptions: {
                showArtistName: false,
                releasePageLabel: "Open Release",
                showReleasePage: releasePageVisible
              }
            }
          ),
          releaseGroupMarkup(
            "catalog",
            "Catalog Notes",
            groupedDiscography.catalog.length
              ? `${releaseCountText(groupedDiscography.catalog.length)} still needs release-state details.`
              : "",
            groupedDiscography.catalog,
            {
              idPrefix: `${artist.slug}-artist-catalog`,
              cardOptions: {
                showArtistName: false,
                releasePageLabel: "Open Release",
                showReleasePage: releasePageVisible
              }
            }
          )
        ]
          .filter(Boolean)
          .join("")
      : `
          <article class="empty-card">
            <p>This project page is ready. Add releases to the catalog and the discography will appear here automatically.</p>
          </article>
        `;

    const spotifyEmbed = spotifySample ? primaryEmbedFor(spotifySample) : { label: "", url: "" };
    const youtubeId = youtubeSample ? preferredYoutubeIdFor(youtubeSample) : "";

    const views = [
      {
        key: "gallery",
        label: `Gallery${galleryReleases.length ? ` (${galleryReleases.length})` : ""}`
      }
    ];

    if (spotifyEmbed.url && spotifySample) {
      views.push({
        key: "spotify",
        label: "Spotify"
      });
    }

    if (youtubeId && youtubeSample) {
      views.push({
        key: "youtube",
        label: "YouTube"
      });
    }

    const initialArtistView = resolveView(
      requestedView(),
      views.map((view) => view.key),
      "gallery"
    );

    embedsNode.innerHTML = `
      <div class="artist-media-panel">
        <div class="artist-media-panel__views" id="artist-media-views">
          ${views
            .map(
              (view) => `
                <button
                  class="button button--ghost button--small ${view.key === initialArtistView ? "is-active" : ""}"
                  type="button"
                  data-artist-view="${escapeHtml(view.key)}"
                  aria-pressed="${view.key === initialArtistView ? "true" : "false"}"
                >
                  ${escapeHtml(view.label)}
                </button>
              `
            )
            .join("")}
        </div>
        <div class="artist-media-panel__stage" id="artist-media-stage"></div>
      </div>
    `;

    const mediaViews = document.getElementById("artist-media-views");
    const mediaStage = document.getElementById("artist-media-stage");
    let activeView = initialArtistView;

    function renderGalleryView() {
      if (!galleryReleases.length) {
        mediaStage.innerHTML = `
          <article class="empty-card">
            <p>No album covers are available for this project yet.</p>
          </article>
        `;
        return;
      }

      mediaStage.innerHTML = `
        <div class="cover-gallery" aria-label="${escapeHtml(artist.name)} album cover gallery">
          ${galleryReleases
            .map(
              (release, index) => `
                ${
                  releasePageVisible
                    ? `
                        <a
                          class="cover-gallery__item"
                          href="${escapeHtml(releasePageUrl(release.slug))}"
                          aria-label="Open ${escapeHtml(release.title)} release page"
                        >
                          <div class="cover-gallery__image">
                            ${artworkMarkup(
                              release.cover,
                              release.title,
                              artist.name,
                              index
                            )}
                          </div>
                          <div class="cover-gallery__copy">
                            <strong>${escapeHtml(release.title)}</strong>
                            <span>${escapeHtml([release.type, release.year].filter(Boolean).join(" / "))}</span>
                          </div>
                        </a>
                      `
                    : `
                        <div class="cover-gallery__item">
                          <div class="cover-gallery__image">
                            ${artworkMarkup(
                              release.cover,
                              release.title,
                              artist.name,
                              index
                            )}
                          </div>
                          <div class="cover-gallery__copy">
                            <strong>${escapeHtml(release.title)}</strong>
                            <span>${escapeHtml([release.type, release.year].filter(Boolean).join(" / "))}</span>
                          </div>
                        </div>
                      `
                }
              `
            )
            .join("")}
        </div>
      `;
    }

    function renderSpotifyView() {
      mediaStage.innerHTML = spotifyEmbed.url && spotifySample
        ? `
            <article class="embed-card">
              <p class="embed-card__label">Spotify Sample</p>
              <h2>${escapeHtml(spotifySample.title)}</h2>
              <p class="embed-card__eyebrow">${escapeHtml(`${spotifyEmbed.label || "Spotify"} embed from the project discography.`)}</p>
              <div class="embed-card__frame embed-card__frame--audio">
                <iframe
                  src="${escapeHtml(spotifyEmbed.url)}"
                  title="${escapeHtml(spotifySample.title)} Spotify embed"
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                ></iframe>
              </div>
              <p class="embed-card__caption">${escapeHtml(text(spotifySample.description, artist.summary))}</p>
            </article>
          `
        : `
            <article class="empty-card">
              <p>No Spotify embed is available in the current project data.</p>
            </article>
          `;
    }

    function renderYoutubeView() {
      mediaStage.innerHTML = youtubeId && youtubeSample
        ? `
            <article class="embed-card">
              <p class="embed-card__label">YouTube Sample</p>
              <h2>${escapeHtml(youtubeSample.title)}</h2>
              <p class="embed-card__eyebrow">Featured visual pulled from the available release media.</p>
              <div class="embed-card__frame embed-card__frame--video">
                <iframe
                  src="${escapeHtml(youtubeEmbedUrl(youtubeId))}"
                  title="${escapeHtml(youtubeSample.title)} YouTube embed"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
              <p class="embed-card__caption">${escapeHtml(text(youtubeSample.description, artist.summary))}</p>
            </article>
          `
        : `
            <article class="empty-card">
              <p>No YouTube embed is available in the current project data.</p>
            </article>
          `;
    }

    function renderActiveArtistMediaView() {
      if (activeView === "spotify") {
        renderSpotifyView();
      } else if (activeView === "youtube") {
        renderYoutubeView();
      } else {
        renderGalleryView();
      }

      if (ui && ui.hydrateArtwork) {
        ui.hydrateArtwork(mediaStage);
      }
    }

    if (mediaViews) {
      mediaViews.addEventListener("click", (event) => {
        const button = event.target.closest("[data-artist-view]");

        if (!button) {
          return;
        }

        activeView = button.getAttribute("data-artist-view") || "gallery";
        mediaViews.querySelectorAll("[data-artist-view]").forEach((node) => {
          const selected = node === button;
          node.classList.toggle("is-active", selected);
          node.setAttribute("aria-pressed", selected ? "true" : "false");
        });
        syncView(activeView);
        renderActiveArtistMediaView();
      });
    }

    syncView(activeView);
    renderActiveArtistMediaView();

    if (ui && ui.applyExperienceTheme) {
      ui.applyExperienceTheme({
        accent: (latestRelease && latestRelease.accent) || artist.accent || "#ffcc00",
        image: artist.image || (latestRelease && latestRelease.cover) || "",
        title: artist.name,
        subtitle: text(artist.lane, "Project page")
      });
    }
  }

  function renderEpkIndex() {
    const panel = document.querySelector(".press-panel");
    const collection = document.getElementById("epk-collection");

    if (!panel && !collection) {
      return;
    }

    if (!showPressPages()) {
      renderLaunchHoldState(panel || collection, {
        documentTitle: "Press Pages Coming Soon",
        title: "Press pages are staying private for launch.",
        copy:
          "Press kits are being finished behind the scenes so the public site can stay focused on discovery tonight."
      });
      return;
    }

    if (!collection) {
      return;
    }

    collection.innerHTML = artists
      .map((artist, index) => {
        const discography = artistReleases(artist.slug);
        const latestRelease = discography[0] || null;
        const pressAssets = Array.isArray(artist.pressAssets)
          ? artist.pressAssets.filter(Boolean)
          : [];
        const coverSource = artist.image || (latestRelease && latestRelease.cover) || "";
        const facts = [
          `${discography.length} ${discography.length === 1 ? "release" : "releases"}`,
          latestRelease ? `Latest: ${latestRelease.title}` : "Catalog in development",
          pressAssets.length ? `${pressAssets.length} press assets` : "Asset list open"
        ].filter(Boolean);

        return `
          <article class="press-card">
            <a
              class="press-card__cover"
              href="${escapeHtml(epkPageUrl(artist.slug))}"
              aria-label="Open ${escapeHtml(artist.name)} press kit"
            >
              ${artworkMarkup(
                coverSource,
                artist.name,
                artist.lane || "Press profile",
                index
              )}
            </a>
            <div class="press-card__body">
              <div class="press-card__header">
                <div>
                  <p class="press-card__eyebrow">Press ${String(index + 1).padStart(2, "0")}</p>
                  <h2>${escapeHtml(artist.name)}</h2>
                </div>
                <p class="press-card__genre">${escapeHtml(text(artist.lane, "Independent project"))}</p>
              </div>
              <p class="press-card__summary">
                ${escapeHtml(text(artist.pressBio, artist.summary))}
              </p>
              <div class="press-card__facts">
                ${facts
                  .slice(0, 3)
                  .map((item) => `<span>${escapeHtml(item)}</span>`)
                  .join("")}
              </div>
              <div class="card-actions">
                <a class="button button--primary button--small" href="${escapeHtml(epkPageUrl(artist.slug))}">
                  Open Press Kit
                </a>
                <a class="button button--ghost button--small" href="${escapeHtml(artistPageUrl(artist.slug, latestRelease && latestRelease.slug))}">
                  Project Page
                </a>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function renderEpkPage() {
    const panel = document.getElementById("epk-page-panel");
    const artistSlug = new URLSearchParams(window.location.search).get("artist");
    const artist = artistSlug ? artistLookup.get(artistSlug) || null : null;

    if (!panel) {
      return;
    }

    if (!showPressPages()) {
      renderLaunchHoldState(panel, {
        documentTitle: "Press Kit Coming Soon",
        title: "Press kits are staying private for launch.",
        copy:
          "We're keeping press-facing pages off the public site until the bios, release notes, and kit copy are ready."
      });
      return;
    }

    if (!artist) {
      document.title = "Press Kit Not Found | Pawn Island Records";
      panel.innerHTML = `
        <article class="empty-card">
          <p>That press kit is not available yet. Return to the press index and choose another project.</p>
          <div class="action-row">
            <a class="button button--ghost button--small" href="epks.html">Back to Press</a>
            <a class="button button--ghost button--small" href="roster.html">Back to Roster</a>
          </div>
        </article>
      `;
      return;
    }

    const discography = artistReleases(artist.slug);
    const latestRelease = discography[0] || null;
    const spotifySample = discography.find((release) => primaryEmbedFor(release).url);
    const youtubeSample = discography.find((release) => preferredYoutubeIdFor(release));
    const galleryReleases = discography.slice(0, 20);
    const pressHighlights = Array.isArray(artist.pressHighlights)
      ? artist.pressHighlights.filter(Boolean)
      : [];
    const pressAssets = Array.isArray(artist.pressAssets)
      ? artist.pressAssets.filter(Boolean)
      : [];
    const priorityMarkets = Array.isArray(artist.priorityMarkets)
      ? artist.priorityMarkets.filter(Boolean)
      : [];
    const latestReleaseAction = releaseAction(latestRelease);
    const spotifyEmbed = spotifySample ? primaryEmbedFor(spotifySample) : { label: "", url: "" };
    const youtubeId = youtubeSample ? preferredYoutubeIdFor(youtubeSample) : "";
    const releasePageVisible = showReleasePages();
    const titleNode = document.getElementById("epk-page-title");
    const laneNode = document.getElementById("epk-page-lane");
    const summaryNode = document.getElementById("epk-page-summary");
    const bodyNode = document.getElementById("epk-page-body");
    const actionsNode = document.getElementById("epk-page-actions");
    const visualNode = document.getElementById("epk-page-visual");
    const statsNode = document.getElementById("epk-page-stats");
    const stageCopyNode = document.getElementById("epk-stage-copy");
    const viewsNode = document.getElementById("epk-page-views");
    const stageNode = document.getElementById("epk-page-stage");
    const specifics = [
      {
        label: "Live History",
        value: text(
          artist.liveShowNote,
          `Add venue history, support slots, festival billing, or session details for ${artist.name}.`
        )
      },
      {
        label: "Press Quote",
        value: text(
          artist.pressQuote,
          "Add an editorial quote, testimonial, or project-approved pull line here."
        )
      },
      {
        label: "Campaign Specifics",
        value: text(
          artist.bookingNote,
          latestRelease
            ? `Add rollout timing, team notes, and campaign specifics for ${latestRelease.title}.`
            : "Add rollout timing, team notes, and campaign specifics here."
        )
      }
    ];
    const views = [
      { key: "overview", label: "Overview" },
      { key: "bio", label: "Bio" },
      { key: "catalog", label: `Catalog${discography.length ? ` (${discography.length})` : ""}` },
      { key: "media", label: "Media" },
      { key: "assets", label: "Assets" }
    ];
    const viewDescriptions = {
      overview: "A fast project snapshot built from positioning, story angles, and open campaign placeholders.",
      bio: "Working language for press copy, project framing, and direction-setting notes.",
      catalog: "Current release context plus a scrollable discography strip for quick reference.",
      media: "Available Spotify, YouTube, and cover-art materials for immediate preview.",
      assets: "What is already in the kit and where specific campaign details can be added next."
    };
    const initialEpkView = resolveView(
      requestedView(),
      views.map((view) => view.key),
      "overview"
    );
    let activeView = initialEpkView;

    function releaseStripMarkup(list) {
      if (!list.length) {
        return `
          <article class="empty-card">
            <p>No public releases are attached to this project yet.</p>
          </article>
        `;
      }

      return `
        <div class="artist-strip epk-release-strip" aria-label="${escapeHtml(artist.name)} press kit release rail">
          ${list
            .map(
              (release, index) => `
                ${
                  releasePageVisible
                    ? `
                        <a class="strip-card" href="${escapeHtml(releasePageUrl(release.slug))}">
                          <div class="strip-card__thumb">
                            ${artworkMarkup(
                              release.cover,
                              release.title,
                              artist.name,
                              index
                            )}
                          </div>
                          <div class="strip-card__content">
                            <strong>${escapeHtml(release.title)}</strong>
                            <p>${escapeHtml(
                              [
                                [release.type, release.year].filter(Boolean).join(" / "),
                                text(release.description, artist.summary)
                              ]
                                .filter(Boolean)
                                .join(" | ")
                            )}</p>
                            <span class="strip-card__link">Open Release</span>
                          </div>
                        </a>
                      `
                    : `
                        <div class="strip-card">
                          <div class="strip-card__thumb">
                            ${artworkMarkup(
                              release.cover,
                              release.title,
                              artist.name,
                              index
                            )}
                          </div>
                          <div class="strip-card__content">
                            <strong>${escapeHtml(release.title)}</strong>
                            <p>${escapeHtml(
                              [
                                [release.type, release.year].filter(Boolean).join(" / "),
                                text(release.description, artist.summary)
                              ]
                                .filter(Boolean)
                                .join(" | ")
                            )}</p>
                          </div>
                        </div>
                      `
                }
              `
            )
            .join("")}
        </div>
      `;
    }

    function galleryMarkup() {
      if (!galleryReleases.length) {
        return `
          <article class="empty-card">
            <p>No cover gallery is available yet.</p>
          </article>
        `;
      }

      return `
        <div class="cover-gallery" aria-label="${escapeHtml(artist.name)} album cover gallery">
          ${galleryReleases
            .map(
              (release, index) => `
                ${
                  releasePageVisible
                    ? `
                        <a
                          class="cover-gallery__item"
                          href="${escapeHtml(releasePageUrl(release.slug))}"
                          aria-label="Open ${escapeHtml(release.title)} release page"
                        >
                          <div class="cover-gallery__image">
                            ${artworkMarkup(
                              release.cover,
                              release.title,
                              artist.name,
                              index
                            )}
                          </div>
                          <div class="cover-gallery__copy">
                            <strong>${escapeHtml(release.title)}</strong>
                            <span>${escapeHtml([release.type, release.year].filter(Boolean).join(" / "))}</span>
                          </div>
                        </a>
                      `
                    : `
                        <div class="cover-gallery__item">
                          <div class="cover-gallery__image">
                            ${artworkMarkup(
                              release.cover,
                              release.title,
                              artist.name,
                              index
                            )}
                          </div>
                          <div class="cover-gallery__copy">
                            <strong>${escapeHtml(release.title)}</strong>
                            <span>${escapeHtml([release.type, release.year].filter(Boolean).join(" / "))}</span>
                          </div>
                        </div>
                      `
                }
              `
            )
            .join("")}
        </div>
      `;
    }

    function renderOverviewView() {
      stageNode.innerHTML = `
        <div class="epk-overview-grid">
          <article class="epk-panel-card">
            <p class="embed-card__label">Industry Pitch</p>
            <h2>How The Project Lands</h2>
            <p class="epk-panel-card__copy">${escapeHtml(text(artist.industryPitch, artist.summary))}</p>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Story Angles</p>
            <h2>Editorial Hooks</h2>
            <ul class="epk-bullet-list">
              ${(pressHighlights.length ? pressHighlights : ["Add press angles and approved talking points."])
                .slice(0, 4)
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ul>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Specifics To Add</p>
            <h2>Open Slots</h2>
            <div class="epk-placeholder-list">
              ${specifics
                .map(
                  (item) => `
                    <article class="epk-mini-card">
                      <strong>${escapeHtml(item.label)}</strong>
                      <span>${escapeHtml(item.value)}</span>
                    </article>
                  `
                )
                .join("")}
            </div>
          </article>
        </div>
      `;
    }

    function renderBioView() {
      stageNode.innerHTML = `
        <div class="epk-detail-grid">
          <article class="epk-panel-card epk-panel-card--wide">
            <p class="embed-card__label">Press Bio</p>
            <h2>Working Project Bio</h2>
            <p class="epk-panel-card__copy">${escapeHtml(text(artist.pressBio, artist.story || artist.summary))}</p>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Current World</p>
            <h2>Project Direction</h2>
            <p class="epk-panel-card__copy">${escapeHtml(text(artist.story, artist.headline || artist.summary))}</p>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Visual &amp; Market Notes</p>
            <h2>Room For Specifics</h2>
            <p class="epk-panel-card__copy">${escapeHtml(
              [
                text(artist.merchIntro, ""),
                priorityMarkets.length
                  ? `Priority markets: ${priorityMarkets.join(", ")}.`
                  : "Add target territories, priority publications, and live-market notes."
              ]
                .filter(Boolean)
                .join(" ")
            )}</p>
          </article>
        </div>
      `;
    }

    function renderCatalogView() {
      stageNode.innerHTML = latestRelease
        ? `
            <div class="epk-catalog-grid">
              <article class="epk-panel-card epk-panel-card--spotlight">
                <p class="embed-card__label">Latest Release</p>
                <h2>${escapeHtml(latestRelease.title)}</h2>
                <div class="epk-spotlight">
                  <div class="epk-spotlight__cover">
                    ${artworkMarkup(
                      latestRelease.cover,
                      latestRelease.title,
                      artist.name,
                      0
                    )}
                  </div>
                  <div class="epk-spotlight__copy">
                    <p class="epk-panel-card__copy">${escapeHtml(text(latestRelease.description, artist.summary))}</p>
                    <div class="release-card__tags">
                      ${[latestRelease.type, latestRelease.year, `${latestRelease.tracks.length} ${latestRelease.tracks.length === 1 ? "track" : "tracks"}`]
                        .filter(Boolean)
                        .map((item) => `<span class="tag">${escapeHtml(item)}</span>`)
                        .join("")}
                    </div>
                    <div class="feature-card__actions">
                      ${
                        [
                          latestReleaseAction
                            ? `
                                <a
                                  class="button button--toofm button--small"
                                  href="${escapeHtml(latestReleaseAction.url)}"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  ${escapeHtml(latestReleaseAction.label)}
                                </a>
                              `
                            : "",
                          releasePageVisible
                            ? `
                                <a class="button button--ghost button--small" href="${escapeHtml(releasePageUrl(latestRelease.slug))}">
                                  Release Page
                                </a>
                              `
                            : ""
                        ]
                          .filter(Boolean)
                          .join("")
                      }
                    </div>
                  </div>
                </div>
              </article>
              <article class="epk-panel-card">
                <p class="embed-card__label">Discography</p>
                <h2>Release Rail</h2>
                ${releaseStripMarkup(discography)}
              </article>
            </div>
          `
        : `
            <article class="empty-card">
              <p>This press kit is ready for release context. Add a public release and the catalog view will populate automatically.</p>
            </article>
          `;
    }

    function renderMediaView() {
      stageNode.innerHTML = `
        <div class="epk-media-grid">
          <article class="embed-card">
            <p class="embed-card__label">Spotify</p>
            <h2>${escapeHtml(spotifySample ? spotifySample.title : "Sample Slot")}</h2>
            <p class="embed-card__eyebrow">
              ${escapeHtml(
                spotifyEmbed.url
                  ? `${spotifyEmbed.label || "Spotify"} embed ready from the public discography.`
                  : "Add a Spotify embed URL to any release and it will appear here."
              )}
            </p>
            ${
              spotifyEmbed.url
                ? `
                  <div class="embed-card__frame embed-card__frame--audio">
                    <iframe
                      src="${escapeHtml(spotifyEmbed.url)}"
                      title="${escapeHtml(spotifySample.title)} Spotify embed"
                      loading="lazy"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    ></iframe>
                  </div>
                `
                : `
                  <div class="embed-card__placeholder">
                    <p>Spotify sample slot ready when a release embed is available.</p>
                  </div>
                `
            }
          </article>
          <article class="embed-card">
            <p class="embed-card__label">YouTube</p>
            <h2>${escapeHtml(youtubeSample ? youtubeSample.title : "Visual Slot")}</h2>
            <p class="embed-card__eyebrow">
              ${escapeHtml(
                youtubeId
                  ? "Release-level YouTube visual pulled from the current catalog."
                  : "Add a YouTube ID to any release and the video slot will appear here."
              )}
            </p>
            ${
              youtubeId
                ? `
                  <div class="embed-card__frame embed-card__frame--video">
                    <iframe
                      src="${escapeHtml(youtubeEmbedUrl(youtubeId))}"
                      title="${escapeHtml(youtubeSample.title)} YouTube embed"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>
                `
                : `
                  <div class="embed-card__placeholder embed-card__placeholder--video">
                    <p>YouTube visual slot ready when release media is attached.</p>
                  </div>
                `
            }
          </article>
          <article class="epk-panel-card epk-panel-card--gallery">
            <p class="embed-card__label">Artwork</p>
            <h2>Cover Gallery</h2>
            ${galleryMarkup()}
          </article>
        </div>
      `;
    }

    function renderAssetsView() {
      const readinessItems = [
        artist.pressBio ? "Working press bio is already populated." : "Add a press bio.",
        `${pressAssets.length} asset${pressAssets.length === 1 ? "" : "s"} currently listed.`,
        latestRelease ? `Latest release context is tied to ${latestRelease.title}.` : "Add a public release for campaign context.",
        spotifyEmbed.url ? "Spotify sample is live in the press kit." : "Spotify sample slot is still open.",
        youtubeId ? "YouTube sample is live in the press kit." : "YouTube sample slot is still open."
      ];

      stageNode.innerHTML = `
        <div class="epk-overview-grid">
          <article class="epk-panel-card">
            <p class="embed-card__label">Available Assets</p>
            <h2>What Is Listed</h2>
            <ul class="epk-bullet-list">
              ${(pressAssets.length ? pressAssets : ["Add high-resolution photos, one-sheets, and approved copy items."])
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ul>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Readiness</p>
            <h2>Current Kit Status</h2>
            <ul class="epk-bullet-list">
              ${readinessItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Next Specifics</p>
            <h2>Still To Add</h2>
            <ul class="epk-bullet-list">
              <li>Add recent press quotes or editorial pull lines.</li>
              <li>Add streaming, ticketing, or campaign metrics when they exist.</li>
              <li>Add live history, personnel credits, and official photo selections.</li>
            </ul>
          </article>
        </div>
      `;
    }

    function renderActiveEpkView() {
      if (stageCopyNode) {
        stageCopyNode.textContent = viewDescriptions[activeView] || viewDescriptions.overview;
      }

      if (activeView === "bio") {
        renderBioView();
      } else if (activeView === "catalog") {
        renderCatalogView();
      } else if (activeView === "media") {
        renderMediaView();
      } else if (activeView === "assets") {
        renderAssetsView();
      } else {
        renderOverviewView();
      }

      if (ui && ui.hydrateArtwork) {
        ui.hydrateArtwork(stageNode);
      }
    }

    document.title = `${artist.name} Press Kit | Pawn Island Records`;

    if (ui && ui.setMetaDescription) {
      ui.setMetaDescription(
        `${artist.name} press kit. ${artist.pressBio || artist.summary || artist.headline || "Press materials, release context, and project positioning."}`
      );
    }

    titleNode.textContent = artist.name;
    laneNode.textContent = text(artist.lane, "Independent project");
    summaryNode.textContent = text(
      artist.epkTagline,
      artist.headline || artist.summary || artist.pressBio
    );
    bodyNode.textContent = text(artist.pressBio, artist.story || artist.summary);

    actionsNode.innerHTML = [
      latestReleaseAction
        ? `
            <a
              class="button button--toofm"
              href="${escapeHtml(latestReleaseAction.url)}"
              target="_blank"
              rel="noreferrer"
            >
              ${escapeHtml(latestReleaseAction.label)}
            </a>
          `
        : "",
      showProjectPages()
        ? `
            <a class="button button--ghost" href="${escapeHtml(artistPageUrl(artist.slug, latestRelease && latestRelease.slug))}">
              Project Page
            </a>
          `
        : "",
      `<a class="button button--ghost" href="epks.html">All Press</a>`
    ]
      .filter(Boolean)
      .join("");

    visualNode.innerHTML = `
      <div class="epk-page-visual__cover">
        ${artworkMarkup(
          artist.image || (latestRelease && latestRelease.cover) || "",
          artist.name,
          artist.lane || "Press profile",
          0
        )}
      </div>
      <p class="epk-page-visual__caption">
        ${escapeHtml(
          latestRelease
            ? `${latestRelease.title} currently anchors the press-facing world for ${artist.name}.`
            : `${artist.name} is ready for more release, live, and press-specific detail as it becomes available.`
        )}
      </p>
    `;

    statsNode.innerHTML = `
      <article class="metric-pill">
        <strong>${discography.length}</strong>
        <span>${discography.length === 1 ? "Release" : "Releases"}</span>
      </article>
      <article class="metric-pill">
        <strong>${pressAssets.length}</strong>
        <span>${pressAssets.length === 1 ? "Asset" : "Assets"}</span>
      </article>
      <article class="metric-pill">
        <strong>${spotifyEmbed.url || youtubeId ? "Live" : "Open"}</strong>
        <span>Media Slots</span>
      </article>
      <article class="metric-pill">
        <strong>${pressHighlights.length || 0}</strong>
        <span>Story Angles</span>
      </article>
    `;

    viewsNode.innerHTML = views
      .map(
        (view) => `
          <button
            class="button button--ghost button--small ${view.key === initialEpkView ? "is-active" : ""}"
            type="button"
            data-epk-view="${escapeHtml(view.key)}"
            aria-pressed="${view.key === initialEpkView ? "true" : "false"}"
          >
            ${escapeHtml(view.label)}
          </button>
        `
      )
      .join("");

    viewsNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-epk-view]");

      if (!button) {
        return;
      }

      activeView = button.getAttribute("data-epk-view") || "overview";
      viewsNode.querySelectorAll("[data-epk-view]").forEach((node) => {
        const selected = node === button;
        node.classList.toggle("is-active", selected);
        node.setAttribute("aria-pressed", selected ? "true" : "false");
      });
      syncView(activeView);
      renderActiveEpkView();
    });

    syncView(activeView);
    renderActiveEpkView();

    if (ui && ui.hydrateArtwork) {
      ui.hydrateArtwork(panel);
    }

    if (ui && ui.applyExperienceTheme) {
      ui.applyExperienceTheme({
        accent: (latestRelease && latestRelease.accent) || artist.accent || "#ffcc00",
        image: artist.image || (latestRelease && latestRelease.cover) || "",
        title: `${artist.name} Press Kit`,
        subtitle: text(artist.lane, "Press profile")
      });
    }
  }

  function renderReleases() {
    const panel = document.querySelector(".releases-panel");
    const collection = document.getElementById("releases-collection");
    const intro = document.getElementById("releases-intro");
    const resetLink = document.getElementById("release-filter-reset");
    const selectedArtistSlug = new URLSearchParams(window.location.search).get("artist");
    const selectedArtist = selectedArtistSlug ? artistLookup.get(selectedArtistSlug) || null : null;

    if (!showCatalogPage()) {
      renderLaunchHoldState(panel || collection, {
        documentTitle: "Catalog Coming Soon",
        title: "The full catalog page is tucked away for launch.",
        copy:
          "Fans can still use the featured release and roster links while the deeper release copy and catalog pages are still being written."
      });
      return;
    }

    const visibleReleases = selectedArtist
      ? releases.filter((release) => release.artist === selectedArtist.slug)
      : releases;
    const groupedReleases = splitReleaseGroups(visibleReleases);
    const releasePageVisible = showReleasePages();

    if (intro) {
      intro.textContent = selectedArtist
        ? `${selectedArtist.name}: ${releaseCountText(visibleReleases.length)}${availabilitySummary(groupedReleases) ? `, with ${availabilitySummary(groupedReleases)}.` : "."}`
        : `${releaseCountText(releases.length)} across the label${availabilitySummary(groupedReleases) ? `, including ${availabilitySummary(groupedReleases)}.` : "."}`;
    }

    if (resetLink) {
      resetLink.classList.toggle("is-hidden", !selectedArtist);
      if (selectedArtist) {
        resetLink.textContent = "\u2190 All releases";
      }
    }

    if (!collection) {
      return;
    }

    if (!visibleReleases.length) {
      collection.innerHTML = `
        <article class="empty-card">
          <p>No releases are attached to this project filter yet.</p>
        </article>
      `;
      return;
    }

    collection.innerHTML = [
      releaseGroupMarkup(
        "upcoming",
        "Forthcoming Releases",
        groupedReleases.upcoming.length
          ? "Exact release dates are listed here so fans can see what is landing next."
          : "",
        groupedReleases.upcoming,
        {
          idPrefix: selectedArtist ? `${selectedArtist.slug}-catalog-upcoming` : "catalog-upcoming",
          cardOptions: {
            cardClass: "release-card--catalog",
            releasePageLabel: "Release Page",
            showReleasePage: releasePageVisible
          }
        }
      ),
      releaseGroupMarkup(
        "live",
        "Out Now",
        groupedReleases.live.length
          ? "These releases are already live and linked directly into their current Too.fm pages."
          : "",
        groupedReleases.live,
        {
          idPrefix: selectedArtist ? `${selectedArtist.slug}-catalog-live` : "catalog-live",
          cardOptions: {
            cardClass: "release-card--catalog",
            releasePageLabel: "Release Page",
            showReleasePage: releasePageVisible
          }
        }
      ),
      releaseGroupMarkup(
        "catalog",
        "Catalog Notes",
        groupedReleases.catalog.length
          ? "These entries are part of the public catalog but still need release-state detail."
          : "",
        groupedReleases.catalog,
        {
          idPrefix: selectedArtist ? `${selectedArtist.slug}-catalog-notes` : "catalog-notes",
          cardOptions: {
            cardClass: "release-card--catalog",
            releasePageLabel: "Release Page",
            showReleasePage: releasePageVisible
          }
        }
      )
    ]
      .filter(Boolean)
      .join("");
  }

  function renderAbout() {
    const bodyCopy = document.getElementById("about-body-copy");
    const ethosLine = document.getElementById("about-ethos-line");
    const campaignLinkNode = document.getElementById("about-campaign-link");
    const secondaryLinkNode = document.getElementById("about-secondary-link");
    const youtubeLinkNode = document.getElementById("about-youtube-link");
    const timelineNode = document.getElementById("about-timeline");

    if (bodyCopy) {
      bodyCopy.textContent = aboutCopy();
    }

    if (ethosLine) {
      ethosLine.textContent = aboutEthos();
    }

    if (campaignLinkNode) {
      campaignLinkNode.href = campaignUrl();
    }

    if (secondaryLinkNode) {
      secondaryLinkNode.href = showCatalogPage() ? "catalog.html" : "roster.html";
      secondaryLinkNode.textContent = showCatalogPage() ? "Browse Releases" : "View Roster";
    }

    if (youtubeLinkNode) {
      const youtubeLink = socialLinks().find((link) => link.key === "youtube");

      if (youtubeLink) {
        youtubeLinkNode.href = youtubeLink.url;
      }
    }

    if (timelineNode) {
      timelineNode.innerHTML = aboutTimeline()
        .slice(0, 3)
        .map(
          (item) => `
            <article class="timeline-item">
              <div class="timeline-item__marker">${escapeHtml(text(item.label, "00"))}</div>
              <div>
                <h2>${escapeHtml(text(item.title, "Label Motion"))}</h2>
                <p>${escapeHtml(text(item.text, ""))}</p>
              </div>
            </article>
          `
        )
        .join("");
    }
  }

  function renderConnect() {
    const socialGrid = document.getElementById("connect-socials");
    const playlistGrid = document.getElementById("connect-playlists");
    const supportLink = document.getElementById("connect-support-link");
    const links = socialLinks();
    const playlists = discoveryPlaylists();

    if (socialGrid) {
      socialGrid.innerHTML = links
        .map(
          (link) => `
            <a
              class="signal-card signal-card--${escapeHtml(link.key)}"
              href="${escapeHtml(link.url)}"
              target="_blank"
              rel="noreferrer"
            >
              <span class="signal-card__icon" aria-hidden="true">
                ${
                  link.image
                    ? `<img src="${escapeHtml(link.image)}" alt="" loading="eager" decoding="async" />`
                    : link.icon || `<span>${escapeHtml(link.label.slice(0, 1))}</span>`
                }
              </span>
              <span class="signal-card__copy">
                <strong>${escapeHtml(link.label)}</strong>
              </span>
            </a>
          `
        )
        .join("");
    }

    if (playlistGrid) {
      const spotifyPlaylists = playlists.filter((playlist) => playlistPlatform(playlist) === "spotify");
      const youtubePlaylists = playlists.filter((playlist) => playlistPlatform(playlist) === "youtube");
      const otherPlaylists = playlists.filter((playlist) => {
        const platform = playlistPlatform(playlist);
        return platform !== "spotify" && platform !== "youtube";
      });

      playlistGrid.innerHTML = [
        playlistSectionMarkup({
          platform: "spotify",
          kicker: "Spotify",
          title: "Influence Maps",
          copy: "Curated shelves that mix references, world-building, and label tracks in context.",
          items: spotifyPlaylists
        }),
        playlistSectionMarkup({
          platform: "youtube",
          kicker: "YouTube",
          title: "Catalog Rooms",
          copy: "Full-catalog and project discography playlists built for video-first listening.",
          items: youtubePlaylists
        }),
        playlistSectionMarkup({
          platform: "playlist",
          kicker: "More",
          title: "More Playlists",
          copy: "Additional discovery shelves.",
          items: otherPlaylists
        })
      ].join("");
    }

    if (supportLink) {
      const support = links.find((link) => link.key === "tiptopjar");

      if (support) {
        supportLink.href = support.url;
        supportLink.target = "_blank";
        supportLink.rel = "noreferrer";
      }
    }
  }

  function hydrateArtwork() {
    if (ui && ui.hydrateArtwork) {
      ui.hydrateArtwork(document);
    }
  }

  function init() {
    syncViewportHeight();
    renderPrimaryNav();
    renderSocialFooter();
    setActiveNav();

    if (page === "home") {
      renderHome();
    } else if (page === "roster" || page === "artists") {
      renderArtists();
    } else if (page === "artist") {
      renderArtistPage();
    } else if (page === "epks") {
      renderEpkIndex();
    } else if (page === "epk") {
      renderEpkPage();
    } else if (page === "releases") {
      renderReleases();
    } else if (page === "connect") {
      renderConnect();
    } else if (page === "about") {
      renderAbout();
    }

    hydrateArtwork();
    window.addEventListener("resize", syncViewportHeight);
    window.addEventListener("orientationchange", syncViewportHeight);
  }

  init();
})();
