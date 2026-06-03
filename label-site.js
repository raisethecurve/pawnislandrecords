(function () {
  const ui = window.PAWN_UI || null;
  const data = (ui && ui.data) || window.PAWN_PUBLIC_DATA || {
    label: {},
    artists: [],
    releases: [],
    merch: []
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
      image: "assets/brand/external/x_logo-white.png",
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

  const launchModeValue = ui && ui.effectiveLaunchMode
    ? ui.effectiveLaunchMode(data.label)
    : text(data.label && data.label.launchMode, "full").toLowerCase();
  const isFullLaunchMode = launchModeValue === "full";

  function withLaunchPreview(url) {
    if (ui && ui.withLaunchPreview) {
      return ui.withLaunchPreview(url);
    }

    return url;
  }

  function preservePreviewLinks(root) {
    const scope = root || document;

    if (ui && ui.isLaunchPreview && !ui.isLaunchPreview()) {
      return;
    }

    if (!ui || !ui.withLaunchPreview) {
      return;
    }

    scope.querySelectorAll("a[href]").forEach((link) => {
      link.setAttribute("href", ui.withLaunchPreview(link.getAttribute("href")));
    });
  }

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
      { href: withLaunchPreview("index.html"), label: "Home" },
      { href: withLaunchPreview("roster.html"), label: "Roster" }
    ];

    if (showCatalogPage()) {
      links.push({ href: withLaunchPreview("catalog.html"), label: "Catalog" });
    }

    links.push({ href: withLaunchPreview("connect.html"), label: "Connect" });
    links.push({ href: withLaunchPreview("about.html"), label: "About" });

    if (showPressPages()) {
      links.push({ href: withLaunchPreview("epks.html"), label: "Press" });
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

  function socialIconMarkup(link, options) {
    const settings = options || {};
    const imageMarkup = link.image
      ? `<img src="${escapeHtml(link.image)}" alt="" loading="eager" decoding="async" />`
      : "";

    if (settings.preferImage && imageMarkup) {
      return imageMarkup;
    }

    if (link.icon) {
      return link.icon;
    }

    if (imageMarkup) {
      return imageMarkup;
    }

    return `<span>${escapeHtml(link.label.slice(0, 1))}</span>`;
  }

  function pressContactLink() {
    return (
      socialLinks().find((link) => link.key === "email") ||
      socialLinks().find((link) => /^mailto:/i.test(link.url)) ||
      {
        key: "email",
        label: "Email",
        url: "mailto:pawnisland@outlook.com",
        role: "Contact the label directly."
      }
    );
  }

  function approvedPressAssetRecords(artist) {
    return (Array.isArray(artist && artist.pressAssetRecords) ? artist.pressAssetRecords : [])
      .filter((asset) => {
        return asset &&
          asset.approved === true &&
          (text(asset.path, "") || text(asset.url, "") || text(asset.label, ""));
      });
  }

  function pressAssetLabel(asset) {
    const credit = text(asset && asset.credit, "");
    return [text(asset && asset.label, "Approved press asset"), credit ? `Credit: ${credit}` : ""]
      .filter(Boolean)
      .join(" / ");
  }

  function artistGenreTags(artist) {
    return Array.isArray(artist && artist.spotify && artist.spotify.genres)
      ? artist.spotify.genres.map((genre) => text(genre, "")).filter(Boolean)
      : [];
  }

  function releaseHasSourceBackedMedia(release) {
    return Boolean(
      releaseAction(release) ||
        primaryEmbedFor(release).url ||
        preferredYoutubeIdFor(release) ||
        text(release && release.spotify && release.spotify.url, "")
    );
  }

  function artistReadyForEpk(artist) {
    if (text(artist && artist.epkStatus, "hold").toLowerCase() !== "ready") {
      return false;
    }

    if (!artist || !text(artist.pressBio, "") || !(artist.pressApproval && artist.pressApproval.bioApproved)) {
      return false;
    }

    if (!approvedPressAssetRecords(artist).length) {
      return false;
    }

    if (!text(pressContactLink().url, "")) {
      return false;
    }

    return artistReleases(artist.slug).some((release) => releaseHasSourceBackedMedia(release));
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
            ${socialIconMarkup(link)}
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

  function renderStandaloneHeader() {
    if (window.top !== window.self) {
      return;
    }

    const pageShell = document.querySelector(".label-page");

    if (!pageShell || pageShell.querySelector(".label-header")) {
      return;
    }

    pageShell.insertAdjacentHTML(
      "afterbegin",
      `
        <header class="label-header" aria-label="Site header">
          <a class="brand-mark" href="${escapeHtml(withLaunchPreview("index.html"))}" aria-label="Pawn Island Records home">
            <img
              src="assets/brand/pawnisland-256.jpg"
              alt=""
              width="64"
              height="64"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
            <span class="brand-mark__copy">
              <strong>Pawn Island Records</strong>
              <span>Independent label</span>
            </span>
          </a>
          <nav class="label-nav" aria-label="Primary"></nav>
        </header>
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
    return withLaunchPreview(`catalog.html?artist=${encodeURIComponent(artistSlug)}`);
  }

  function artistPageUrl(artistSlug, releaseSlug) {
    return withLaunchPreview(`artist.html?artist=${encodeURIComponent(artistSlug)}${releaseSlug ? `&release=${encodeURIComponent(releaseSlug)}` : ""}`);
  }

  function epkPageUrl(artistSlug) {
    return withLaunchPreview(`epk.html?artist=${encodeURIComponent(artistSlug)}`);
  }

  function artistReleases(artistSlug) {
    if (ui && ui.getArtistReleases) {
      return ui.getArtistReleases(artistSlug);
    }

    return releases.filter((release) => release.artist === artistSlug);
  }

  function releasePageUrl(slug) {
    return withLaunchPreview(`release.html?release=${encodeURIComponent(slug)}`);
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

  function mediaEmbedFrameMarkup(options) {
    if (ui && ui.mediaEmbedFrameMarkup) {
      return ui.mediaEmbedFrameMarkup(options);
    }

    const settings = options || {};
    const src = text(settings.src, "");
    const className = text(settings.className, "embed-card__frame");
    const title = text(settings.title, "Media embed");
    const allow = text(settings.allow, "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");

    return src
      ? `
          <div class="${escapeHtml(className)}">
            <iframe
              src="${escapeHtml(src)}"
              title="${escapeHtml(title)}"
              loading="${settings.loading === "eager" ? "eager" : "lazy"}"
              allow="${escapeHtml(allow)}"
              ${settings.allowfullscreen || settings.allowFullscreen ? "allowfullscreen" : ""}
            ></iframe>
          </div>
        `
      : "";
  }

  function hydrateMediaEmbeds(root) {
    if (ui && ui.hydrateMediaEmbeds) {
      ui.hydrateMediaEmbeds(root || document);
    }
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

    if (url) {
      return {
        label: releaseCtaLabel(release),
        url,
        external: true
      };
    }

    const platform = ui && ui.getLivePlatforms
      ? ui.getLivePlatforms(release)[0] || null
      : null;

    return platform
      ? {
          label: releaseCtaLabel(release),
          url: platform.url,
          external: true
        }
      : null;
  }

  function sitePath(fileName, params) {
    const query = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
      const resolved = text(value, "");

      if (resolved) {
        query.set(key, resolved);
      }
    });

    const suffix = query.toString();
    return `${fileName}${suffix ? `?${suffix}` : ""}`;
  }

  function siteUrl(pathValue) {
    return new URL(String(pathValue || "").replace(/^\/+/, ""), "https://www.pawnislandrecords.com/").toString();
  }

  function compactDescription(parts, fallback) {
    const value = (Array.isArray(parts) ? parts : [parts])
      .map((part) => text(part, ""))
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return value || fallback;
  }

  function organizationStructuredData() {
    const founderName = text(data.label && data.label.founder, "Matthew H. Freeman");

    return {
      "@type": "Organization",
      "@id": siteUrl("#organization"),
      name: text(data.label && data.label.name, "Pawn Island Records"),
      alternateName: "Pawn Island",
      url: siteUrl("index.html"),
      logo: siteUrl("assets/brand/pawnisland-512.jpg"),
      founder: {
        "@type": "Person",
        "@id": siteUrl("about.html#matthew-h-freeman"),
        name: founderName,
        alternateName: Array.isArray(data.label && data.label.founderAliases)
          ? data.label.founderAliases
          : ["Matthew Freeman", "Matt Freeman"]
      },
      description: text(
        data.label && data.label.entityDescription,
        "The official independent label and project-world home for music written and built by Matthew H. Freeman."
      ),
      sameAs: socialLinks()
        .filter((link) => isExternalUrl(link.url))
        .map((link) => link.url)
    };
  }

  function releaseStructuredData(release, artist) {
    const releasePath = sitePath("release.html", { release: release.slug });
    const type = String(release.type || "").toLowerCase().includes("single")
      ? "MusicRecording"
      : "MusicAlbum";

    return {
      "@type": type,
      "@id": siteUrl(`${releasePath}#release`),
      name: release.title,
      url: siteUrl(releasePath),
      image: siteUrl(release.cover || "assets/brand/pawnisland-1200.jpg"),
      byArtist: artist
        ? {
            "@type": "MusicGroup",
            name: artist.name,
            url: siteUrl(sitePath("artist.html", { artist: artist.slug }))
          }
        : undefined,
      recordLabel: {
        "@id": siteUrl("#organization")
      },
      datePublished: text(release.releaseDate, ""),
      description: text(release.description, artist && artist.summary),
      potentialAction: releaseAction(release)
        ? {
            "@type": "ListenAction",
            target: releaseAction(release).url
          }
        : undefined
    };
  }

  function artistStructuredData(artist, discography, pagePath) {
    const spotifyGenres = artistGenreTags(artist);

    return {
      "@type": "MusicGroup",
      "@id": siteUrl(`${pagePath}#artist`),
      name: artist.name,
      url: siteUrl(pagePath),
      image: siteUrl(artist.image || "assets/brand/pawnisland-1200.jpg"),
      genre: spotifyGenres.length ? spotifyGenres : undefined,
      description: text(artist.pressBio || artist.story || artist.summary, ""),
      memberOf: {
        "@id": siteUrl("#organization")
      },
      album: (discography || []).slice(0, 12).map((release) => releaseStructuredData(release, artist))
    };
  }

  function graphStructuredData(items) {
    return {
      "@context": "https://schema.org",
      "@graph": [organizationStructuredData(), ...(items || [])].filter(Boolean)
    };
  }

  function setRouteMeta(settings) {
    const options = settings || {};

    if (ui && ui.setPageMeta) {
      ui.setPageMeta({
        title: options.title,
        description: options.description,
        canonicalPath: options.canonicalPath,
        image: options.image,
        ogType: options.ogType || "website",
        robots: options.robots || "noindex,follow",
        structuredData: options.structuredData,
        structuredDataId: options.structuredDataId || "pawn-route-structured-data"
      });
      return;
    }

    document.title = options.title;
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
                  <div class="pending-carousel__slide" data-pending-slide="${slideIndex}" aria-hidden="${slideIndex === 0 ? "false" : "true"}"${slideIndex === 0 ? "" : " inert"}>
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
        const isHidden = slideIndex !== currentIndex;
        slide.setAttribute("aria-hidden", String(isHidden));
        slide.toggleAttribute("inert", isHidden);
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
      platformsNode.setAttribute("role", "region");
      platformsNode.setAttribute("tabindex", "0");
      platformsNode.setAttribute("aria-label", "Streaming platform availability");
      platformsNode.innerHTML = homeStreamingPlatforms()
        .map(
          (platform) => `
            <div class="platform-chip platform-chip--${escapeHtml(platform.key || "platform")}">
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
                      artist.lane || "Project profile",
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

    setRouteMeta({
      title: `${artist.name} | Pawn Island Records`,
      description: compactDescription(
        [
          `${artist.name}.`,
          artist.headline || artist.summary,
          discography.length ? `${releaseCountText(discography.length)} in the current catalog.` : ""
        ],
        "Explore the project discography and sample listening embeds."
      ),
      canonicalPath: sitePath("artist.html", { artist: artist.slug }),
      image: artist.image || (latestRelease && latestRelease.cover) || "assets/brand/pawnisland-1200.jpg",
      ogType: "profile",
      structuredData: graphStructuredData([
        artistStructuredData(artist, discography, sitePath("artist.html", { artist: artist.slug }))
      ])
    });

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
            <p>This project page is ready for release context; current catalog details are available through the label contact.</p>
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
              ${mediaEmbedFrameMarkup({
                src: spotifyEmbed.url,
                title: `${spotifySample.title} Spotify embed`,
                provider: "Spotify",
                variant: "audio",
                className: "embed-card__frame embed-card__frame--audio",
                loading: "lazy"
              })}
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
              ${mediaEmbedFrameMarkup({
                src: youtubeEmbedUrl(youtubeId),
                title: `${youtubeSample.title} YouTube embed`,
                provider: "YouTube",
                variant: "video",
                className: "embed-card__frame embed-card__frame--video",
                loading: "lazy",
                allowFullscreen: true
              })}
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

      hydrateMediaEmbeds(mediaStage);
      preservePreviewLinks(mediaStage);
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

    const readyArtists = artists.filter((artist) => artistReadyForEpk(artist));

    setRouteMeta({
      title: "Press | Pawn Island Records",
      description: "Browse source-approved Pawn Island Records project press kits, bios, release context, media previews, and contact paths.",
      canonicalPath: "epks.html",
      image: "assets/brand/pawnisland-1200.jpg",
      structuredData: graphStructuredData([
        {
          "@type": "CollectionPage",
          "@id": siteUrl("epks.html#press"),
          name: "Pawn Island Records Press",
          url: siteUrl("epks.html"),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: readyArtists.map((artist, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: siteUrl(sitePath("epk.html", { artist: artist.slug })),
              name: `${artist.name} Press Kit`
            }))
          }
        }
      ])
    });

    const pressContact = pressContactLink();

    if (!readyArtists.length) {
      collection.innerHTML = `
        <article class="empty-card">
          <p>No press kits are public-ready yet. Current bios, assets, and release facts are available through direct press contact.</p>
          <div class="action-row">
            <a class="button button--ghost button--small" href="${escapeHtml(pressContact.url)}">Email Press</a>
            <a class="button button--ghost button--small" href="${escapeHtml(withLaunchPreview("roster.html"))}">Roster</a>
          </div>
        </article>
      `;
      return;
    }

    collection.innerHTML = readyArtists
      .map((artist, index) => {
        const discography = artistReleases(artist.slug);
        const latestRelease = discography[0] || null;
        const pressAssets = approvedPressAssetRecords(artist);
        const coverSource = artist.image || (latestRelease && latestRelease.cover) || "";
        const facts = [
          `${discography.length} ${discography.length === 1 ? "release" : "releases"}`,
          latestRelease ? `Latest: ${latestRelease.title}` : "",
          `${pressAssets.length} approved ${pressAssets.length === 1 ? "asset" : "assets"}`
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
                <a class="button button--ghost button--small" href="${escapeHtml(pressContact.url)}">
                  Email Press
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

    if (!artistReadyForEpk(artist)) {
      const pressContact = pressContactLink();

      setRouteMeta({
        title: `${artist.name} Press Kit By Request | Pawn Island Records`,
        description: `${artist.name} press materials are available by request while approved public assets and source-backed release details are being finalized.`,
        canonicalPath: sitePath("epk.html", { artist: artist.slug }),
        image: artist.image || "assets/brand/pawnisland-1200.jpg"
      });

      panel.innerHTML = `
        <article class="empty-card">
          <p class="eyebrow">Press Hold</p>
          <h2>Press kit is available by request.</h2>
          <p>
            ${escapeHtml(artist.name)} is not marked public-ready for EPK display yet. Use the press contact for current approved bios, assets, credits, and release details.
          </p>
          <div class="action-row">
            <a class="button button--primary button--small" href="${escapeHtml(pressContact.url)}">Email Press</a>
            <a class="button button--ghost button--small" href="${escapeHtml(artistPageUrl(artist.slug))}">Project Page</a>
            <a class="button button--ghost button--small" href="${escapeHtml(withLaunchPreview("epks.html"))}">All Press</a>
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
    const approvedHighlights = artist.pressApproval && artist.pressApproval.highlightsApproved ? pressHighlights : [];
    const pressAssets = approvedPressAssetRecords(artist);
    const latestReleaseAction = releaseAction(latestRelease);
    const pressContact = pressContactLink();
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
    const spotifyGenres = artistGenreTags(artist);
    const specifics = [
      {
        label: "Spotify Genres",
        value: spotifyGenres.length ? spotifyGenres.join(", ") : "No Spotify artist genres are attached yet."
      },
      {
        label: "Press Approval",
        value: artist.pressApproval && artist.pressApproval.bioApproved
          ? "Bio and listed assets are approved for public EPK use."
          : "Press copy is held for approval."
      },
      {
        label: "Current Release Context",
        value: latestRelease
          ? `${latestRelease.title} is the current catalog anchor for this kit.`
          : "No public release context is attached yet."
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
      overview: "A fast project snapshot built from positioning, story angles, and current campaign status.",
      bio: "Working language for press copy, project framing, and direction-setting notes.",
      catalog: "Current release context plus a scrollable discography strip for quick reference.",
      media: "Available Spotify, YouTube, and cover-art materials for immediate preview.",
      assets: "What is already in the kit and how to request current campaign details."
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
            <p class="embed-card__label">Approved Bio</p>
            <h2>How The Project Lands</h2>
            <p class="epk-panel-card__copy">${escapeHtml(text(artist.pressBio, artist.summary))}</p>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Story Angles</p>
            <h2>Editorial Hooks</h2>
            <ul class="epk-bullet-list">
              ${(approvedHighlights.length ? approvedHighlights : ["No public story angles are approved yet."])
                .slice(0, 4)
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ul>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Availability</p>
            <h2>Status Notes</h2>
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
            <h2>Approved Project Bio</h2>
            <p class="epk-panel-card__copy">${escapeHtml(text(artist.pressBio, artist.story || artist.summary))}</p>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Approved Hooks</p>
            <h2>Story Angles</h2>
            <ul class="epk-bullet-list">
              ${(approvedHighlights.length ? approvedHighlights : ["No public story angles are approved yet."])
                .slice(0, 4)
                .map((item) => `<li>${escapeHtml(item)}</li>`)
                .join("")}
            </ul>
          </article>
          <article class="epk-panel-card">
            <p class="embed-card__label">Source Notes</p>
            <h2>Verified Context</h2>
            <p class="epk-panel-card__copy">${escapeHtml(
              [
                spotifyGenres.length ? `Spotify genres: ${spotifyGenres.join(", ")}.` : "No Spotify artist genres are attached yet.",
                `${pressAssets.length} approved ${pressAssets.length === 1 ? "asset" : "assets"} listed.`
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
              <p>This press kit is ready for release context; current catalog details are available through the label contact.</p>
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
                  : "No Spotify preview is attached yet; use the campaign and catalog links for current listening context."
              )}
            </p>
            ${
              spotifyEmbed.url
                ? `
                  ${mediaEmbedFrameMarkup({
                    src: spotifyEmbed.url,
                    title: `${spotifySample.title} Spotify embed`,
                    provider: "Spotify",
                    variant: "audio",
                    className: "embed-card__frame embed-card__frame--audio",
                    loading: "lazy"
                  })}
                `
                : `
                  <div class="embed-card__placeholder">
                    <p>Spotify preview is not attached to this kit yet.</p>
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
                  : "No YouTube visual is attached yet; artwork and release context remain available below."
              )}
            </p>
            ${
              youtubeId
                ? `
                  ${mediaEmbedFrameMarkup({
                    src: youtubeEmbedUrl(youtubeId),
                    title: `${youtubeSample.title} YouTube embed`,
                    provider: "YouTube",
                    variant: "video",
                    className: "embed-card__frame embed-card__frame--video",
                    loading: "lazy",
                    allowFullscreen: true
                  })}
                `
                : `
                  <div class="embed-card__placeholder embed-card__placeholder--video">
                    <p>YouTube preview is not attached to this kit yet.</p>
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
      const pressContact = pressContactLink();
      const readinessItems = [
        artist.pressApproval && artist.pressApproval.bioApproved ? "Press bio is approved for public use." : "Press bio is held for approval.",
        `${pressAssets.length} approved asset${pressAssets.length === 1 ? "" : "s"} currently listed.`,
        latestRelease ? `Latest release context is tied to ${latestRelease.title}.` : "Release context is not public-ready yet.",
        spotifyEmbed.url ? "Spotify sample is live in the press kit." : "Spotify sample is not attached yet.",
        youtubeId ? "YouTube sample is live in the press kit." : "YouTube sample is not attached yet."
      ];

      stageNode.innerHTML = `
        <div class="epk-overview-grid">
          <article class="epk-panel-card">
            <p class="embed-card__label">Available Assets</p>
            <h2>What Is Listed</h2>
            <ul class="epk-bullet-list">
              ${(pressAssets.length ? pressAssets : [])
                .map((item) => {
                  const href = text(item.url || item.path, "");
                  const label = pressAssetLabel(item);
                  return href
                    ? `<li><a class="inline-link" href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`
                    : `<li>${escapeHtml(label)}</li>`;
                })
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
            <p class="embed-card__label">Contact</p>
            <h2>Request Current Materials</h2>
            <ul class="epk-bullet-list">
              <li>Use ${escapeHtml(pressContact.label)} for current approvals, credits, and photo selections.</li>
              <li>Only approved bios, asset paths, and release facts are surfaced on this public kit.</li>
              <li>Release-specific notes can be requested for playlist, editorial, or booking context.</li>
            </ul>
            <div class="feature-card__actions">
              <a class="button button--ghost button--small" href="${escapeHtml(pressContact.url)}">
                Email Press
              </a>
            </div>
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

      hydrateMediaEmbeds(stageNode);
      preservePreviewLinks(stageNode);
    }

    setRouteMeta({
      title: `${artist.name} Press Kit | Pawn Island Records`,
      description: compactDescription(
        [
          `${artist.name} press kit.`,
          artist.pressBio || artist.summary || artist.headline,
          latestRelease ? `Current release context includes ${latestRelease.title}.` : ""
        ],
        "Press materials, release context, and project positioning."
      ),
      canonicalPath: sitePath("epk.html", { artist: artist.slug }),
      image: artist.image || (latestRelease && latestRelease.cover) || "assets/brand/pawnisland-1200.jpg",
      structuredData: graphStructuredData([
        {
          "@type": "ProfilePage",
          "@id": siteUrl(`${sitePath("epk.html", { artist: artist.slug })}#press-kit`),
          name: `${artist.name} Press Kit`,
          url: siteUrl(sitePath("epk.html", { artist: artist.slug })),
          mainEntity: artistStructuredData(
            artist,
            discography,
            sitePath("artist.html", { artist: artist.slug })
          )
        }
      ])
    });

    titleNode.textContent = artist.name;
    laneNode.textContent = text(artist.lane, "Independent project");
    summaryNode.textContent = text(artist.epkTagline, artist.pressBio || artist.summary);
    bodyNode.textContent = text(artist.pressBio, artist.summary);

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
      `<a class="button button--ghost" href="${escapeHtml(pressContact.url)}">Email Press</a>`,
      `<a class="button button--ghost" href="${escapeHtml(withLaunchPreview("epks.html"))}">All Press</a>`
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
        <strong>${approvedHighlights.length || 0}</strong>
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
    const params = new URLSearchParams(window.location.search);
    const selectedArtistSlug = params.get("artist");
    const selectedArtist = selectedArtistSlug ? artistLookup.get(selectedArtistSlug) || null : null;
    const statusOptions = [
      { key: "all", label: "All" },
      { key: "upcoming", label: "Forthcoming" },
      { key: "live", label: "Out Now" },
      { key: "catalog", label: "Catalog Notes" }
    ];
    const requestedStatus = text(params.get("status"), "all").toLowerCase();
    const selectedStatus = statusOptions.some((option) => option.key === requestedStatus)
      ? requestedStatus
      : "all";
    const normalizeType = (value) =>
      text(value, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const releaseTypes = Array.from(
      new Map(
        releases
          .map((release) => [normalizeType(release.type), text(release.type, "Release")])
          .filter(([key]) => key)
      )
    ).sort((left, right) => left[1].localeCompare(right[1]));
    const requestedType = normalizeType(params.get("type"));
    const selectedType = releaseTypes.some(([key]) => key === requestedType) ? requestedType : "";

    function catalogFilterUrl(overrides) {
      const settings = Object.assign(
        {
          artist: selectedArtist ? selectedArtist.slug : "",
          status: selectedStatus === "all" ? "" : selectedStatus,
          type: selectedType
        },
        overrides || {}
      );
      const nextParams = new URLSearchParams();

      if (settings.artist) {
        nextParams.set("artist", settings.artist);
      }

      if (settings.status && settings.status !== "all") {
        nextParams.set("status", settings.status);
      }

      if (settings.type) {
        nextParams.set("type", settings.type);
      }

      const query = nextParams.toString();
      return withLaunchPreview(`catalog.html${query ? `?${query}` : ""}`);
    }

    function renderCatalogFilters() {
      if (!panel || !collection) {
        return;
      }

      let filters = document.getElementById("catalog-filters");

      if (!filters) {
        collection.insertAdjacentHTML("beforebegin", '<section class="catalog-filters" id="catalog-filters" aria-label="Catalog filters"></section>');
        filters = document.getElementById("catalog-filters");
      }

      filters.innerHTML = `
        <div class="catalog-filters__field">
          <label for="catalog-filter-artist">Project</label>
          <select id="catalog-filter-artist" data-catalog-filter="artist">
            <option value="">All projects</option>
            ${artists
              .map(
                (artist) => `
                  <option value="${escapeHtml(artist.slug)}"${selectedArtist && selectedArtist.slug === artist.slug ? " selected" : ""}>
                    ${escapeHtml(artist.name)}
                  </option>
                `
              )
              .join("")}
          </select>
        </div>
        <div class="catalog-filters__field catalog-filters__field--status">
          <span>Status</span>
          <div class="catalog-filter-tabs" role="group" aria-label="Release status">
            ${statusOptions
              .map(
                (option) => `
                  <a
                    class="catalog-filter-tab${selectedStatus === option.key ? " is-active" : ""}"
                    href="${escapeHtml(catalogFilterUrl({ status: option.key }))}"
                    ${selectedStatus === option.key ? 'aria-current="true"' : ""}
                  >
                    ${escapeHtml(option.label)}
                  </a>
                `
              )
              .join("")}
          </div>
        </div>
        <div class="catalog-filters__field">
          <label for="catalog-filter-type">Type</label>
          <select id="catalog-filter-type" data-catalog-filter="type">
            <option value="">All types</option>
            ${releaseTypes
              .map(
                ([key, label]) => `
                  <option value="${escapeHtml(key)}"${selectedType === key ? " selected" : ""}>
                    ${escapeHtml(label)}
                  </option>
                `
              )
              .join("")}
          </select>
        </div>
      `;

      filters.querySelectorAll("[data-catalog-filter]").forEach((control) => {
        control.addEventListener("change", () => {
          const filter = control.getAttribute("data-catalog-filter");
          const value = control.value || "";

          if (filter === "artist") {
            window.location.assign(catalogFilterUrl({ artist: value }));
          } else if (filter === "type") {
            window.location.assign(catalogFilterUrl({ type: value }));
          }
        });
      });

      preservePreviewLinks(filters);
    }

    if (!showCatalogPage()) {
      renderLaunchHoldState(panel || collection, {
        documentTitle: "Catalog Coming Soon",
        title: "The full catalog page is tucked away for launch.",
        copy:
          "Fans can still use the featured release and roster links while the deeper release copy and catalog pages are still being written."
      });
      return;
    }

    renderCatalogFilters();

    const artistScopedReleases = selectedArtist
      ? releases.filter((release) => release.artist === selectedArtist.slug)
      : releases;
    const visibleReleases = artistScopedReleases.filter((release) => {
      const statusMatches = selectedStatus === "all" || releaseState(release) === selectedStatus;
      const typeMatches = !selectedType || normalizeType(release.type) === selectedType;

      return statusMatches && typeMatches;
    });
    const groupedReleases = splitReleaseGroups(visibleReleases);
    const releasePageVisible = showReleasePages();
    const activeFilterText = [
      selectedArtist ? selectedArtist.name : "",
      selectedStatus !== "all"
        ? (statusOptions.find((option) => option.key === selectedStatus) || {}).label
        : "",
      selectedType ? (releaseTypes.find(([key]) => key === selectedType) || [null, ""])[1] : ""
    ].filter(Boolean);
    const catalogCanonicalPath = sitePath("catalog.html", {
      artist: selectedArtist ? selectedArtist.slug : "",
      status: selectedStatus !== "all" ? selectedStatus : "",
      type: selectedType
    });

    setRouteMeta({
      title: `${activeFilterText.length ? `${activeFilterText.join(" / ")} | ` : ""}Catalog | Pawn Island Records`,
      description: compactDescription(
        [
          activeFilterText.length
            ? `Pawn Island Records catalog filtered by ${activeFilterText.join(", ")}.`
            : "Explore the Pawn Island Records catalog.",
          `${releaseCountText(visibleReleases.length)} visible.`,
          availabilitySummary(groupedReleases)
            ? `Includes ${availabilitySummary(groupedReleases)}.`
            : ""
        ],
        "Explore releases, forthcoming campaigns, out-now records, and project-specific catalog paths."
      ),
      canonicalPath: catalogCanonicalPath,
      image: (visibleReleases[0] && visibleReleases[0].cover) || "assets/brand/pawnisland-1200.jpg",
      structuredData: graphStructuredData([
        {
          "@type": "CollectionPage",
          "@id": siteUrl(`${catalogCanonicalPath}#catalog`),
          name: "Pawn Island Records Catalog",
          url: siteUrl(catalogCanonicalPath),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: visibleReleases.slice(0, 30).map((release, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: siteUrl(sitePath("release.html", { release: release.slug })),
              name: release.title
            }))
          }
        }
      ])
    });

    if (intro) {
      intro.textContent = selectedArtist
        ? `${selectedArtist.name}: ${releaseCountText(visibleReleases.length)}${availabilitySummary(groupedReleases) ? `, with ${availabilitySummary(groupedReleases)}.` : "."}`
        : `${releaseCountText(visibleReleases.length)} across the label${availabilitySummary(groupedReleases) ? `, including ${availabilitySummary(groupedReleases)}.` : "."}`;
    }

    if (resetLink) {
      const hasFilters = Boolean(selectedArtist || selectedStatus !== "all" || selectedType);
      resetLink.classList.toggle("is-hidden", !hasFilters);
      resetLink.href = withLaunchPreview("catalog.html");
      if (hasFilters) {
        resetLink.textContent = "\u2190 All releases";
      }
    }

    if (!collection) {
      return;
    }

    if (!visibleReleases.length) {
      collection.innerHTML = `
        <article class="empty-card">
          <p>No releases match${activeFilterText.length ? ` ${escapeHtml(activeFilterText.join(" / "))}` : " the current filters"}.</p>
          <div class="action-row action-row--center">
            <a class="button button--ghost button--small" href="${escapeHtml(withLaunchPreview("catalog.html"))}">Reset Filters</a>
          </div>
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
                ${socialIconMarkup(link, { preferImage: true })}
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

  const printfulMerchState = {
    initialized: false,
    eventsBound: false,
    controlsBound: false,
    popstateBound: false,
    products: [],
    syncProducts: [],
    catalogProducts: [],
    categories: [],
    categoryTree: [],
    storeViewTracked: false,
    trackedProductViews: new Set(),
    metadata: {
      launchPosture: {},
      familyNotes: {},
      productsById: new Map(),
      productsByName: new Map()
    },
    productDetails: new Map(),
    cart: [],
    selectedProductId: "",
    gallerySelection: new Map(),
    zoomedProductId: "",
    orderNotice: "",
    orderRequestId: "",
    mode: "shop",
    shippingRates: [],
    selectedShipping: "",
    shippingEstimateKey: "",
    filters: {
      query: "",
      category: "all",
      project: "all",
      album: "all",
      sort: "featured"
    }
  };

  const PRINTFUL_FEATURED_LIMIT = 4;
  const MERCH_CART_STORAGE_KEY = "pawnisland:merch-cart:v1";
  const MERCH_ORDER_REQUEST_STORAGE_KEY = "pawnisland:merch-order-request:v1";

  function merchCatalogModeEnabled() {
    const params = new URLSearchParams(window.location.search);
    return params.get("internal") === "catalog" || params.get("designNext") === "1";
  }

  function merchSupportEmail() {
    return text(printfulMerchState.metadata.launchPosture.supportEmail, "pawnisland@outlook.com");
  }

  function merchPaymentCopy() {
    return text(
      printfulMerchState.metadata.launchPosture.paymentCopy,
      "We will email a payment link before production begins."
    );
  }

  function merchSupportResponseCopy() {
    return text(printfulMerchState.metadata.launchPosture.supportResponseWindow, "1-2 business days");
  }

  function merchCancellationCopy() {
    return text(
      printfulMerchState.metadata.launchPosture.cancellationWindow,
      "Order requests can be changed or cancelled until the payment link is paid."
    );
  }

  function merchPolicyCopy() {
    return text(
      printfulMerchState.metadata.launchPosture.returnPolicy,
      "Because items are printed on demand, returns are handled for damaged, misprinted, or incorrect items."
    );
  }

  function merchFamilyNote(product, key, fallback) {
    const meta = product && product.merch ? product.merch : {};
    const family = text(meta.productFamily, "");
    const notes = family ? printfulMerchState.metadata.familyNotes[family] : null;
    return text(meta[key], text(notes && notes[key], fallback));
  }

  function normalizePrintfulMode(mode) {
    const value = text(mode, "").toLowerCase();
    if (value === "featured" || value === "guided") {
      return "featured";
    }

    if ((value === "catalog" || value === "discover" || value === "printful") && merchCatalogModeEnabled()) {
      return "catalog";
    }

    return "shop";
  }

  function apiPath(path) {
    return path.replace(/^\/+/, "");
  }

  function trackMerchEvent(name, properties = {}) {
    const eventName = text(name, "");

    if (!eventName || typeof window === "undefined") {
      return;
    }

    const payload = {
      name: eventName,
      properties: {
        route: "merch",
        checkoutModel: "manual-order-request",
        ...properties
      }
    };

    try {
      window.dispatchEvent(new CustomEvent("pawnisland:merch-event", { detail: payload }));
    } catch (error) {}

    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ...payload.properties });
    } catch (error) {}

    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, payload.properties);
      }
    } catch (error) {}

    try {
      if (typeof window.plausible === "function") {
        window.plausible(eventName, { props: payload.properties });
      }
    } catch (error) {}
  }

  async function merchApiJson(path, options) {
    const response = await fetch(apiPath(path), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options && options.headers ? options.headers : {})
      }
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = text(body && body.message, "Merch API request failed.");
      throw new Error(message);
    }

    return body;
  }

  function printfulMoney(value, currency) {
    const amount = Number.parseFloat(value);

    if (!Number.isFinite(amount)) {
      return "";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: text(currency, "USD")
    }).format(amount);
  }

  function merchSlug(value) {
    return text(value, "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "all";
  }

  function merchMetadataNameKey(value) {
    return text(value, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  async function loadMerchMetadata() {
    if (printfulMerchState.metadata.loaded) {
      return;
    }

    printfulMerchState.metadata.loaded = true;

    try {
      const response = await fetch("data/merch-products.json", { cache: "no-store" });
      const body = response.ok ? await response.json() : {};
      const products = Array.isArray(body.products) ? body.products : [];
      const productsById = new Map();
      const productsByName = new Map();

      products.forEach((entry) => {
        const id = text(entry && entry.id, "");

        if (id) {
          productsById.set(id, entry);
        }

        [entry && entry.rawName, ...(Array.isArray(entry && entry.matchNames) ? entry.matchNames : [])]
          .map(merchMetadataNameKey)
          .filter(Boolean)
          .forEach((nameKey) => {
            if (!productsByName.has(nameKey)) {
              productsByName.set(nameKey, entry);
            }
          });
      });

      printfulMerchState.metadata.launchPosture = body.launchPosture || {};
      printfulMerchState.metadata.familyNotes = body.familyNotes || {};
      printfulMerchState.metadata.productsById = productsById;
      printfulMerchState.metadata.productsByName = productsByName;
    } catch (error) {
      printfulMerchState.metadata.launchPosture = {};
      printfulMerchState.metadata.familyNotes = {};
      printfulMerchState.metadata.productsById = new Map();
      printfulMerchState.metadata.productsByName = new Map();
    }
  }

  function merchMetadataForProduct(product) {
    const id = text(product && product.id, "");
    const nameKey = merchMetadataNameKey(product && (product.name || product.title));

    return (
      (id && printfulMerchState.metadata.productsById.get(id)) ||
      (nameKey && printfulMerchState.metadata.productsByName.get(nameKey)) ||
      null
    );
  }

  function mergeMerchMetadata(product, parsedMeta, metadata) {
    const entry = metadata || {};
    const project = text(entry.artist, parsedMeta.project);
    const album = text(entry.drop, parsedMeta.album);
    const design = text(entry.designName, parsedMeta.design);
    const category = text(entry.category, parsedMeta.category);
    const productFamily = text(entry.productFamily, category);
    const productType = text(entry.productType, parsedMeta.itemNoun);
    const productTitle = text(entry.publicTitle, parsedMeta.productTitle);
    const sortPriority = Number.isFinite(Number(entry.sortPriority)) ? Number(entry.sortPriority) : parsedMeta.sortPriority || 1000;
    const featuredPriority = Number.isFinite(Number(entry.featuredPriority)) ? Number(entry.featuredPriority) : 0;
    const publicStatus = text(entry.publicStatus, product && product.source === "printful-catalog" ? "internal" : "public");
    const supportCopy = text(entry.supportCopy, `Questions before ordering? Email ${merchSupportEmail()}.`);
    const relatedGroup = text(entry.relatedGroup, `${project} ${album}`);

    return {
      ...parsedMeta,
      rawTitle: parsedMeta.title,
      project,
      projectKey: merchSlug(project),
      album,
      albumKey: merchSlug(album),
      design,
      designKey: merchSlug(design),
      productTitle,
      category,
      categoryKey: merchSlug(category),
      productFamily,
      productFamilyKey: merchSlug(productFamily),
      productType,
      itemNoun: text(entry.itemNoun, productType.toLowerCase()),
      categoryPath: text(entry.categoryPath, category),
      sortPriority,
      featuredPriority,
      publicStatus,
      thumbnailStrategy: text(entry.thumbnailStrategy, "artwork"),
      artworkKey: merchMetadataNameKey(entry.artworkKey),
      heroEligible: entry.heroEligible === true,
      imageAlt: text(entry.imageAlt, `${productTitle} product image`),
      productCopy: text(entry.productCopy, ""),
      detailCopy: text(entry.detailCopy, ""),
      fitNotes: text(entry.fitNotes, ""),
      materialCare: text(entry.materialCare, ""),
      productionNote: text(entry.productionNote, ""),
      shippingNote: text(entry.shippingNote, ""),
      returnPolicy: text(entry.returnPolicy, ""),
      supportCopy,
      relatedGroup,
      relatedGroupKey: merchSlug(relatedGroup),
      searchText: [
        product && product.name,
        productTitle,
        project,
        album,
        design,
        category,
        productFamily,
        productType,
        text(entry.tags, "")
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    };
  }

  function inferPrintfulProductCategory(titleValue, product) {
    const title = text(titleValue, "").toLowerCase();
    const catalogCategory = text(product && product.category && product.category.title, "");
    const type = text(product && product.type, "");

    if (/mouse\s*pad|mousepad/.test(title)) {
      return "Mousepads";
    }

    if (/hoodie|sweatshirt|pullover/.test(title)) {
      return "Hoodies & Sweatshirts";
    }

    if (/tee|t-shirt|shirt/.test(title)) {
      return "T-Shirts";
    }

    if (/poster|print|canvas|framed/.test(title)) {
      return "Wall Art";
    }

    if (/mug|tumbler|bottle/.test(title)) {
      return "Drinkware";
    }

    if (/hat|cap|beanie/.test(title)) {
      return "Headwear";
    }

    if (/tote|bag|backpack/.test(title)) {
      return "Bags";
    }

    if (/phone|case/.test(title)) {
      return "Tech Accessories";
    }

    return catalogCategory || type || "Merch";
  }

  function productNounFromCategory(category) {
    const lower = text(category, "").toLowerCase();

    if (lower.includes("mouse")) {
      return "mousepad";
    }

    if (lower.includes("hoodie")) {
      return "hoodie";
    }

    if (lower.includes("shirt") || lower.includes("tee")) {
      return "tee";
    }

    if (lower.includes("poster") || lower.includes("art") || lower.includes("canvas")) {
      return "print";
    }

    if (lower.includes("mug") || lower.includes("drink")) {
      return "mug";
    }

    if (lower.includes("hat") || lower.includes("headwear")) {
      return "hat";
    }

    if (lower.includes("bag")) {
      return "bag";
    }

    return "product";
  }

  function catalogBuyerGroup(product, category) {
    const haystack = [
      category && category.topCategoryTitle,
      category && category.title,
      category && category.pathLabel,
      product && product.type,
      product && product.name
    ]
      .map((value) => text(value, "").toLowerCase())
      .filter(Boolean)
      .join(" ");

    if (/mouse\s*pad|desk\s*mat|desk|laptop|journal|notebook|sticker/.test(haystack)) {
      return "Desk Gear";
    }

    if (/tote|bag|backpack|duffle|pouch|fanny|luggage/.test(haystack)) {
      return "Bags";
    }

    if (/hat|cap|beanie|visor/.test(haystack)) {
      return "Headwear";
    }

    if (/shirt|tee|hoodie|sweatshirt|sweater|jacket|polo|tank|legging|shorts|pants|dress|apron|clothing|apparel/.test(haystack)) {
      return "Apparel";
    }

    if (/poster|canvas|print|frame|wall\s*art/.test(haystack)) {
      return "Wall Art";
    }

    if (/mug|tumbler|bottle|drink/.test(haystack)) {
      return "Drinkware";
    }

    if (/pillow|blanket|towel|home|living|decor/.test(haystack)) {
      return "Home Goods";
    }

    if (/calendar|card|postcard|stationery|invitation|flyer|brochure/.test(haystack)) {
      return "Stationery";
    }

    if (/phone|case|airpod|tech/.test(haystack)) {
      return "Tech Accessories";
    }

    if (/button|pin|patch|magnet|keychain|ornament|coaster|candle|tag|accessor/.test(haystack)) {
      return "Accessories";
    }

    return "Other Blanks";
  }

  function parseCatalogProductMeta(product) {
    const category = product && product.category ? product.category : null;
    const topCategory = text(category && category.topCategoryTitle, text(product && product.type, "Printful Catalog"));
    const categoryTitle = catalogBuyerGroup(product, category);
    const categoryPath = text(category && category.pathLabel, categoryTitle);
    const title = text(product && product.name, "Printful catalog product");
    const techniqueLabels = Array.isArray(product && product.techniques)
      ? product.techniques.map((technique) => text(technique.name || technique.key, "")).filter(Boolean)
      : [];

    return {
      title,
      project: topCategory,
      projectKey: merchSlug(topCategory),
      album: categoryPath,
      albumKey: merchSlug(categoryPath),
      design: title,
      designKey: merchSlug(title),
      productTitle: title,
      category: categoryTitle,
      categoryKey: merchSlug(categoryTitle),
      itemNoun: productNounFromCategory(categoryTitle),
      categoryPath,
      searchText: [
        title,
        product && product.brand,
        product && product.model,
        product && product.type,
        categoryTitle,
        categoryPath,
        topCategory,
        techniqueLabels.join(" ")
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    };
  }

  function parsePrintfulProductName(titleValue, product) {
    if (product && product.source === "printful-catalog") {
      return parseCatalogProductMeta(product);
    }

    const title = text(titleValue, "Pawn Island Records merch").replace(/\s+/g, " ");
    const category = inferPrintfulProductCategory(title, product);
    const itemNoun = productNounFromCategory(category);
    const suffixPattern = /\s+(Tee|T-Shirt|Shirt|Mousepad|Mouse Pad|Poster|Print|Hoodie|Sweatshirt|Mug|Hat|Cap|Tote|Bag)$/i;
    const stem = title.replace(suffixPattern, "");
    const parts = stem.split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean);
    const project = parts[0] || "Pawn Island Records";
    const albumRaw = parts[1] || "Label Store";
    const designRaw = parts.slice(2).join(" - ");
    const edition = albumRaw.match(/^(.*)\s+(\d+)$/);
    const album = edition ? text(edition[1], albumRaw) : albumRaw;
    const design = designRaw || (edition ? `Edition ${edition[2]}` : "Core");
    const productTitle = design === "Core" ? `${album} ${itemNoun}` : `${album}: ${design}`;

    return {
      title,
      project,
      projectKey: merchSlug(project),
      album,
      albumKey: merchSlug(album),
      design,
      designKey: merchSlug(design),
      productTitle,
      category,
      categoryKey: merchSlug(category),
      itemNoun,
      categoryPath: category,
      searchText: [title, project, album, design, category, itemNoun].join(" ").toLowerCase()
    };
  }

  function enrichPrintfulProduct(product, index) {
    const isCatalog = product && product.source === "printful-catalog";
    const parsedMeta = parsePrintfulProductName(product && (product.name || product.title), product);
    const metadata = merchMetadataForProduct(product);
    const merch = mergeMerchMetadata(product, parsedMeta, metadata);

    return {
      ...product,
      merchIndex: Number.isFinite(merch.sortPriority) ? merch.sortPriority : index,
      isPurchasable: isCatalog ? false : product && product.isPurchasable !== false,
      merch
    };
  }

  const MERCH_ARTWORK_ASSETS = {
    "velvet orchard - borrowed brightness 2 tee": {
      src: "media/public/merch/velvet-brightness.webp",
      ground: "light",
      label: "Borrowed Brightness crest"
    },
    "velvet orchard - borrowed brightness tee": {
      src: "media/public/merch/velvet-borrowed.webp",
      ground: "light",
      label: "Borrowed Brightness dusk"
    },
    "velvet orchard - borrowed brightness - ghost tee": {
      src: "media/public/merch/velvet-ghost.webp",
      ground: "dark",
      label: "Ghost"
    },
    "velvet orchard - borrowed brightness - lamplight tee": {
      src: "media/public/merch/velvet-lamp.webp",
      ground: "dark",
      label: "Lamplight"
    },
    "velvet orchard - borrowed brightness - reaching out tee": {
      src: "media/public/merch/velvet-hands.webp",
      ground: "dark",
      label: "Reaching Out"
    },
    "resunant - midnight revival 2 tee": {
      src: "media/public/merch/resunant-revival-03.webp",
      ground: "dark",
      label: "Midnight Revival sigil"
    },
    "resunant - midnight revival tee": {
      src: "media/public/merch/resunant-revival-05.webp",
      ground: "dark",
      label: "Midnight Revival crest"
    },
    "resunant - midnight revival - summoning tee": {
      src: "media/public/merch/resunant-confessional.webp",
      ground: "dark",
      label: "Summoning"
    },
    "resunant - midnight revival - cheap gospel honey tee": {
      src: "media/public/merch/resunant-honey.webp",
      ground: "light",
      label: "Cheap Gospel Honey"
    },
    "resunant - midnight revival - neon communion tee": {
      src: "media/public/merch/resunant-neon-communion.webp",
      ground: "light",
      label: "Neon Communion"
    }
  };

  function printfulProductById(productId) {
    return printfulMerchState.products.find((product) => String(product.id) === String(productId));
  }

  function printfulTrackingProduct(product) {
    const meta = product && product.merch ? product.merch : {};

    return {
      product_id: text(product && product.id, ""),
      product_title: text(meta.productTitle, text(product && product.name, "")),
      project: text(meta.project, ""),
      drop: text(meta.album, ""),
      category: text(meta.category, ""),
      source: text(product && product.source, "printful")
    };
  }

  function trackPrintfulStoreView() {
    if (printfulMerchState.storeViewTracked) {
      return;
    }

    printfulMerchState.storeViewTracked = true;
    trackMerchEvent("view_store", {
      mode: printfulMerchState.mode,
      product_count: activePrintfulProducts().length,
      public_product_count: printfulMerchState.syncProducts.filter((product) => text(product && product.merch && product.merch.publicStatus, "public") === "public").length,
      catalog_enabled: merchCatalogModeEnabled()
    });
  }

  function trackPrintfulProductView(product) {
    const id = text(product && product.id, "");

    if (!id || printfulMerchState.trackedProductViews.has(id)) {
      return;
    }

    printfulMerchState.trackedProductViews.add(id);
    trackMerchEvent("view_item", printfulTrackingProduct(product));
  }

  function printfulArtworkAsset(product) {
    const key = text(product && product.merch && product.merch.artworkKey, "");
    const title = merchMetadataNameKey(product && product.name);
    return (key && MERCH_ARTWORK_ASSETS[key]) || MERCH_ARTWORK_ASSETS[title] || null;
  }

  function printfulArtworkGround(product) {
    const asset = printfulArtworkAsset(product);
    if (!asset) {
      return "image";
    }

    return asset.ground === "dark" ? "dark" : "light";
  }

  function printfulArtworkMarkup(product, size) {
    const asset = printfulArtworkAsset(product);
    const meta = (product && product.merch) || parsePrintfulProductName(product && product.name, product);

    if (!asset) {
      return "";
    }

    return `
      <div class="merch-design-plate merch-design-plate--${escapeHtml(asset.ground === "dark" ? "dark" : "light")} merch-design-plate--${escapeHtml(size || "card")}">
        <img src="${escapeHtml(asset.src)}" alt="${escapeHtml(`${asset.label || meta.design} artwork`)}" loading="${size === "hero" ? "eager" : "lazy"}" decoding="async" />
      </div>
    `;
  }

  function printfulArtworkImageUrl(product) {
    const asset = printfulArtworkAsset(product);
    return text(asset && asset.src, "");
  }

  function printfulProductImageUrl(product) {
    return text(product && (product.thumbnailUrl || product.thumbnail || product.imageUrl || product.image), "");
  }

  function printfulProductImageLabel(product, fallback) {
    const meta = (product && product.merch) || parsePrintfulProductName(product && product.name, product);
    return text(fallback || meta.imageAlt || (product && product.name), `${meta.productTitle} product image`);
  }

  function printfulImageUnavailableMarkup(size) {
    return `
      <span class="merch-image-unavailable merch-image-unavailable--${escapeHtml(size || "card")}">
        Image unavailable
      </span>
    `;
  }

  function printfulProductImageMarkup(product, size, loading) {
    const image = printfulProductImageUrl(product);

    if (!image) {
      return printfulImageUnavailableMarkup(size);
    }

    return `
      <span class="merch-api-image merch-api-image--${escapeHtml(size || "card")}">
        <img
          src="${escapeHtml(image)}"
          alt="${escapeHtml(printfulProductImageLabel(product))}"
          loading="${escapeHtml(loading || (size === "hero" ? "eager" : "lazy"))}"
          decoding="async"
        />
      </span>
    `;
  }

  function printfulPrimaryVisualMarkup(product, size, loading) {
    const strategy = text(product && product.merch && product.merch.thumbnailStrategy, "artwork");

    if (strategy === "product" && printfulProductImageUrl(product)) {
      return printfulProductImageMarkup(product, size, loading);
    }

    return printfulArtworkMarkup(product, size) || printfulProductImageMarkup(product, size, loading);
  }

  function addPrintfulGalleryImage(images, candidate) {
    const url = text(candidate && candidate.url, "");

    if (!url) {
      return;
    }

    const key = url.toLowerCase();

    if (images.some((image) => image.url.toLowerCase() === key)) {
      return;
    }

    images.push({
      id: text(candidate.id, `image-${images.length}`),
      url,
      thumbnailUrl: text(candidate.thumbnailUrl, url),
      label: text(candidate.label, `Product image ${images.length + 1}`),
      type: text(candidate.type, "image"),
      ground: candidate.ground === "light" ? "light" : candidate.ground === "dark" ? "dark" : "image"
    });
  }

  function printfulProductGalleryImages(product, detail) {
    const images = [];
    const detailProduct = detail && detail.product ? detail.product : null;
    const productImage = printfulProductImageUrl(detailProduct) || printfulProductImageUrl(product);
    const artwork = printfulArtworkAsset(product);
    const productFirst = text(product && product.merch && product.merch.thumbnailStrategy, "artwork") === "product";

    const artworkCandidate = artwork
      ? {
          id: "artwork",
          url: artwork.src,
          thumbnailUrl: artwork.src,
          label: `${artwork.label || ((product && product.merch && product.merch.design) || "Design")} artwork`,
          type: "artwork",
          ground: artwork.ground
        }
      : null;
    const productCandidate = {
      id: "product-thumbnail",
      url: productImage,
      thumbnailUrl: productImage,
      label: printfulProductImageLabel(detailProduct || product),
      type: "image",
      ground: "image"
    };

    [productFirst ? productCandidate : artworkCandidate, productFirst ? artworkCandidate : productCandidate]
      .filter(Boolean)
      .forEach((candidate) => addPrintfulGalleryImage(images, candidate));

    [detail && detail.images, detail && detail.product && detail.product.images]
      .filter(Array.isArray)
      .flat()
      .forEach((image) => addPrintfulGalleryImage(images, image));

    return images;
  }

  function printfulSelectedGalleryImage(product, detail) {
    const images = printfulProductGalleryImages(product, detail);
    const selectedId = printfulMerchState.gallerySelection.get(String(product && product.id));

    return {
      images,
      selected: images.find((image) => image.id === selectedId) || images[0]
    };
  }

  function printfulProductUrl(productId) {
    const params = new URLSearchParams(window.location.search);
    params.set("product", productId);
    if (printfulMerchState.mode !== "shop") {
      params.set("view", printfulMerchState.mode);
    } else {
      params.delete("view");
    }
    return `merch.html?${params.toString()}`;
  }

  function isPrintfulShopMode() {
    return printfulMerchState.mode === "shop";
  }

  function isPrintfulCatalogMode() {
    return printfulMerchState.mode === "catalog" && merchCatalogModeEnabled();
  }

  function isPrintfulFeaturedMode() {
    return printfulMerchState.mode === "featured";
  }

  function featuredPrintfulProducts(products) {
    const publicProducts = products.filter((product) => text(product && product.merch && product.merch.publicStatus, "public") === "public");
    const featured = publicProducts
      .filter((product) => Number(product.merch.featuredPriority) > 0 || product.merch.heroEligible)
      .sort((a, b) => {
        const aPriority = Number(a.merch.featuredPriority) || 999;
        const bPriority = Number(b.merch.featuredPriority) || 999;
        return aPriority - bPriority || a.merch.sortPriority - b.merch.sortPriority;
      });
    const fill = publicProducts
      .filter((product) => !featured.includes(product))
      .sort((a, b) => a.merch.sortPriority - b.merch.sortPriority);

    return [...featured, ...fill].slice(0, PRINTFUL_FEATURED_LIMIT);
  }

  function activePrintfulProducts() {
    if (isPrintfulCatalogMode()) {
      return printfulMerchState.catalogProducts;
    }

    return printfulMerchState.syncProducts.filter((product) => text(product && product.merch && product.merch.publicStatus, "public") === "public");
  }

  function printfulFeaturedCopy(meta, index) {
    if (meta.productCopy) {
      return meta.productCopy;
    }

    const fallback = [
      "A clean entry point into the current drop.",
      "A bolder alternate lane from the same store.",
      "Release artwork with enough contrast to carry the product.",
      "A strong visual from the current rack."
    ];

    if (meta.projectKey === "velvet-orchard") {
      const choices = [
        "Luminous release art, soft enough for everyday wear.",
        "A darker visual with more late-night pull.",
        "A bright color-field piece from the softer side of the rack.",
        "A release-world product with a gentler visual tempo."
      ];
      return choices[index % choices.length];
    }

    if (meta.projectKey === "resunant") {
      const choices = [
        "Glam-rock pressure, built for black denim and stage light.",
        "High-contrast revival artwork with a heavier edge.",
        "A loud visual plate from the current performance lane.",
        "A sharp stage-light design from the Resunant rack."
      ];
      return choices[index % choices.length];
    }

    return fallback[index % fallback.length];
  }

  function printfulGalleryMainMarkup(product, image) {
    if (!image) {
      return printfulImageUnavailableMarkup("gallery");
    }

    if (image.type === "artwork") {
      return printfulArtworkMarkup(product, "gallery") || printfulImageUnavailableMarkup("gallery");
    }

    return `
      <span class="merch-gallery-image-shell">
        <img class="merch-gallery-image" src="${escapeHtml(image.url)}" alt="${escapeHtml(image.label)}" loading="eager" decoding="async" />
      </span>
    `;
  }

  function printfulGalleryThumbMarkup(product, image, selected) {
    const ground = image.ground === "light" ? "light" : image.ground === "dark" ? "dark" : "image";
    const isActive = selected && image.id === selected.id;
    const thumb = image.type === "artwork"
      ? printfulArtworkMarkup(product, "thumb")
      : `<img src="${escapeHtml(image.thumbnailUrl || image.url)}" alt="" loading="lazy" decoding="async" />`;

    return `
      <button
        class="merch-gallery-thumb merch-gallery-thumb--${escapeHtml(ground)} ${isActive ? "is-active" : ""}"
        type="button"
        data-printful-gallery-image="${escapeHtml(product.id)}"
        data-printful-gallery-image-id="${escapeHtml(image.id)}"
        aria-pressed="${isActive ? "true" : "false"}"
      >
        ${thumb}
        <span>${escapeHtml(image.label)}</span>
      </button>
    `;
  }

  function printfulProductGalleryMarkup(product, detail) {
    const { images, selected } = printfulSelectedGalleryImage(product, detail);
    const zoomed = printfulMerchState.zoomedProductId === String(product && product.id);
    const ground = selected && selected.ground === "light" ? "light" : selected && selected.ground === "dark" ? "dark" : "image";
    const zoomLabel = zoomed ? "Reset Zoom" : "Zoom";

    return `
      <div class="merch-product-gallery ${zoomed ? "is-zoomed" : ""}" data-printful-gallery="${escapeHtml(product.id)}">
        <button
          class="merch-gallery-stage merch-gallery-stage--${escapeHtml(ground)}"
          type="button"
          data-printful-toggle-zoom="${escapeHtml(product.id)}"
          aria-pressed="${zoomed ? "true" : "false"}"
          aria-label="${escapeHtml(`${zoomLabel} ${selected ? selected.label : "product image"}`)}"
        >
          ${printfulGalleryMainMarkup(product, selected)}
        </button>
        <button class="merch-gallery-zoom" type="button" data-printful-toggle-zoom="${escapeHtml(product.id)}">
          ${escapeHtml(zoomLabel)}
        </button>
        ${
          images.length > 1
            ? `
              <div class="merch-gallery-strip" role="list" aria-label="Product images">
                ${images.map((image) => printfulGalleryThumbMarkup(product, image, selected)).join("")}
              </div>
            `
            : ""
        }
      </div>
    `;
  }

  function printfulVariantSize(variant) {
    const direct = text(variant && (variant.size || variant.color), "");

    if (direct) {
      return direct;
    }

    const name = text(variant && variant.name, "Variant");
    const parts = name.split(/\s+\/\s+/);
    return text(parts[parts.length - 1], name);
  }

  function printfulPriceRange(variants) {
    const synced = Array.isArray(variants) ? variants.filter((variant) => variant.isSynced !== false) : [];
    const prices = synced
      .map((variant) => Number.parseFloat(variant.retailPrice))
      .filter((price) => Number.isFinite(price));

    if (!prices.length) {
      return "";
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const currency = text(synced.find((variant) => variant.currency) && synced.find((variant) => variant.currency).currency, "USD");

    if (min === max) {
      return printfulMoney(min, currency);
    }

    return `${printfulMoney(min, currency)}-${printfulMoney(max, currency)}`;
  }

  function printfulVariantChoicesMarkup(variants) {
    return variants
      .filter((variant) => variant.isSynced !== false)
      .map((variant, index) => {
        const price = printfulMoney(variant.retailPrice, variant.currency);
        const size = printfulVariantSize(variant);
        const label = [size, price].filter(Boolean).join(" ");

        return `
          <label class="printful-size-option">
            <input type="radio" name="variant" value="${index}" ${index === 0 ? "checked" : ""} />
            <span>${escapeHtml(size || `Option ${index + 1}`)}</span>
            <em>${escapeHtml(price || "Ready")}</em>
          </label>
        `;
      })
      .join("");
  }

  function printfulSingleVariantMarkup(variant) {
    const size = printfulVariantSize(variant);
    const price = printfulMoney(variant && variant.retailPrice, variant && variant.currency);
    const label = [size || "Ready option", price].filter(Boolean).join(" | ");

    return `
      <input type="hidden" name="variant" value="0" />
      <p class="printful-single-option">Only option: ${escapeHtml(label || "ready to request")}</p>
    `;
  }

  function printfulQuantityControlMarkup() {
    return `
      <div class="printful-quantity-control" data-printful-quantity-control>
        <button type="button" data-printful-qty-step="-1" aria-label="Decrease quantity">-</button>
        <label>
          <span>Qty</span>
          <input name="quantity" type="number" min="1" max="10" value="1" inputmode="numeric" />
        </label>
        <button type="button" data-printful-qty-step="1" aria-label="Increase quantity">+</button>
      </div>
    `;
  }

  function printfulVariantFormMarkup(productId, detail, mode) {
    const variants = Array.isArray(detail && detail.variants)
      ? detail.variants.filter((variant) => variant.isSynced !== false)
      : [];

    if (!variants.length) {
      return '<p class="merch-inline-status">No purchase options are available for this item.</p>';
    }

    return `
      <form class="printful-variant-form printful-variant-form--${escapeHtml(mode || "card")}" data-printful-add-form="${escapeHtml(productId)}">
        ${
          variants.length === 1
            ? printfulSingleVariantMarkup(variants[0])
            : `
              <fieldset class="printful-size-picker">
                <legend>Option</legend>
                ${printfulVariantChoicesMarkup(variants)}
              </fieldset>
            `
        }
        ${printfulQuantityControlMarkup()}
        <button class="button button--primary button--small" type="submit">Add to Request</button>
        <p class="merch-inline-status" data-printful-add-status></p>
      </form>
    `;
  }

  function printfulProductCardMarkup(product, index) {
    const meta = product.merch || parsePrintfulProductName(product.name, product);
    const detail = printfulMerchState.productDetails.get(String(product.id));
    const variantCount = Number(product && product.variants) || Number(product && product.variantCount) || 0;
    const price = detail ? printfulPriceRange(detail.variants) : "";
    const isSelected = printfulMerchState.selectedProductId === String(product.id);
    const isFeatured = isPrintfulFeaturedMode();
    const isCatalogProduct = product && product.source === "printful-catalog";
    const isPurchasable = product && product.isPurchasable !== false && !isCatalogProduct;
    const hasSingleOption = isPurchasable && variantCount === 1;
    const productCopy = isFeatured
      ? printfulFeaturedCopy(meta, index)
      : isCatalogProduct
        ? `${meta.categoryPath || meta.category} blank from Printful, ready to become a future Pawn Island drop.`
        : text(meta.productCopy, `${meta.design} ${meta.productType} from the ${meta.album} drop, ready for option selection and an order request.`);

    return `
      <article
        class="merch-card merch-card--printful ${isFeatured ? "merch-card--featured" : ""} ${isCatalogProduct ? "merch-card--catalog" : ""} ${isSelected ? "is-selected" : ""}"
        data-printful-product-card="${escapeHtml(product.id)}"
        data-merch-project="${escapeHtml(meta.projectKey)}"
        data-merch-album="${escapeHtml(meta.albumKey)}"
      >
        <div class="merch-card__visual">
          ${printfulPrimaryVisualMarkup(product, "card")}
        </div>
        <div class="merch-card__body">
          <div class="merch-card__meta">
            ${isFeatured ? '<span class="tag tag--ready">Featured</span>' : ""}
            <span class="tag">${escapeHtml(meta.project)}</span>
            <span class="tag tag--muted">${escapeHtml(meta.category)}</span>
            <span class="tag tag--muted">${escapeHtml(meta.productFamily)}</span>
          </div>
          <div class="merch-card__copy">
            <h3>${escapeHtml(meta.productTitle)}</h3>
            <p>${escapeHtml(productCopy)}</p>
          </div>
          <div class="merch-card__facts">
            <span data-printful-card-price="${escapeHtml(product.id)}">${escapeHtml(isCatalogProduct ? "Design next" : price || "Select option for price")}</span>
            <span>${escapeHtml(variantCount ? `${variantCount} option${variantCount === 1 ? "" : "s"}` : meta.productType)}</span>
          </div>
          <div class="action-row merch-card__actions">
            <a class="button button--ghost button--small" href="${escapeHtml(printfulProductUrl(product.id))}" data-printful-product-link="${escapeHtml(product.id)}">
              View
            </a>
            ${
              hasSingleOption
                ? `
                  <button
                    class="button button--primary button--small"
                    type="button"
                    data-printful-direct-add-product="${escapeHtml(product.id)}"
                  >
                    Add to Request
                  </button>
                `
                : isPurchasable
                ? `
                  <button
                    class="button button--primary button--small"
                    type="button"
                    data-printful-load-product="${escapeHtml(product.id)}"
                    aria-expanded="${detail ? "true" : "false"}"
                    ${detail ? "disabled" : ""}
                  >
                    ${detail ? "Options Ready" : "Choose Options"}
                  </button>
                `
                : `<a class="button button--primary button--small" href="connect.html">Design Brief</a>`
            }
          </div>
          <div class="printful-variant-slot" data-printful-variant-slot="${escapeHtml(product.id)}">
            ${detail && isPurchasable && !hasSingleOption ? printfulVariantFormMarkup(product.id, detail, "card") : ""}
          </div>
        </div>
      </article>
    `;
  }

  function printfulVariantOptions(variants) {
    return variants
      .filter((variant) => variant.isSynced !== false)
      .map((variant, index) => {
        const price = printfulMoney(variant.retailPrice, variant.currency);
        const label = [printfulVariantSize(variant), price].filter(Boolean).join(" | ");
        return `<option value="${index}">${escapeHtml(label)}</option>`;
      })
      .join("");
  }

  function renderPrintfulVariantPicker(productId, detail) {
    const slot = document.querySelector(`[data-printful-variant-slot="${CSS.escape(productId)}"]`);

    if (!slot) {
      return;
    }

    slot.innerHTML = printfulVariantFormMarkup(productId, detail, "card");

    const priceNode = document.querySelector(`[data-printful-card-price="${CSS.escape(productId)}"]`);
    const price = printfulPriceRange(detail.variants);

    if (priceNode && price) {
      priceNode.textContent = price;
    }
  }

  async function loadPrintfulProduct(productId) {
    if (printfulMerchState.productDetails.has(productId)) {
      return printfulMerchState.productDetails.get(productId);
    }

    const product = printfulProductById(productId);

    if (product && product.source === "printful-catalog") {
      const detail = {
        product: {
          ...product,
          images: [
            {
              id: "catalog-product-image",
              url: printfulProductImageUrl(product),
              thumbnailUrl: printfulProductImageUrl(product),
              label: printfulProductImageLabel(product),
              type: "image"
            }
          ].filter((image) => image.url)
        },
        variants: [],
        images: []
      };

      printfulMerchState.productDetails.set(productId, detail);
      return detail;
    }

    const detail = await merchApiJson(`api/merch/products/${encodeURIComponent(productId)}`);

    if (product && detail.product) {
      detail.product = {
        ...detail.product,
        thumbnailUrl: text(detail.product.thumbnailUrl, product.thumbnailUrl),
        merch: product.merch
      };
    }

    printfulMerchState.productDetails.set(productId, detail);
    return detail;
  }

  function printfulCartTotal() {
    return printfulMerchState.cart.reduce((total, item) => {
      const amount = Number.parseFloat(item.retailPrice);
      return Number.isFinite(amount) ? total + amount * item.quantity : total;
    }, 0);
  }

  function printfulCartQuantity() {
    return printfulMerchState.cart.reduce((total, item) => total + item.quantity, 0);
  }

  function printfulCartSummaryText() {
    const lines = ["Pawn Island Records merch request", ""];

    printfulMerchState.cart.forEach((item) => {
      const amount = Number.parseFloat(item.retailPrice);
      const linePrice = Number.isFinite(amount) ? printfulMoney(amount * item.quantity, item.currency) : "Price pending";
      lines.push(`- ${item.productName} | ${item.variantName} | Qty ${item.quantity} | ${linePrice}`);
    });

    lines.push("");
    lines.push(`Subtotal: ${printfulCartTotal() ? printfulMoney(printfulCartTotal(), "USD") : "Price pending"}`);
    lines.push(merchPaymentCopy());
    lines.push(`Support: ${merchSupportEmail()} (${merchSupportResponseCopy()})`);

    return lines.join("\n");
  }

  function printfulCartSummaryMailto() {
    const subject = encodeURIComponent("Pawn Island Records merch request");
    const body = encodeURIComponent(printfulCartSummaryText());
    return `mailto:${merchSupportEmail()}?subject=${subject}&body=${body}`;
  }

  async function copyPrintfulCartSummary() {
    const status = document.getElementById("printful-copy-status");
    const summary = printfulCartSummaryText();
    let copied = false;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(summary);
        copied = true;
      }
    } catch (error) {
      copied = false;
    }

    if (!copied) {
      try {
        const node = document.querySelector("[data-printful-cart-summary-text]");
        const selection = window.getSelection();
        const range = document.createRange();

        if (node && selection) {
          range.selectNodeContents(node);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (error) {}
    }

    if (status) {
      status.textContent = copied ? "Copied order snapshot." : "Order snapshot selected for copying.";
    }

    trackMerchEvent("copy_cart_summary", {
      status: copied ? "copied" : "selected",
      item_count: printfulCartQuantity()
    });
  }

  function normalizeStoredCartItem(item) {
    const syncVariantId = Number.parseInt(item && item.syncVariantId, 10);
    const quantity = Math.min(Math.max(Number.parseInt(item && item.quantity, 10) || 1, 1), 10);
    const productName = text(item && item.productName, "").slice(0, 160);
    const variantName = text(item && item.variantName, "").slice(0, 160);

    if (!syncVariantId || !productName || !variantName) {
      return null;
    }

    return {
      productName,
      variantName,
      quantity,
      syncVariantId,
      catalogVariantId: Number.parseInt(item && item.catalogVariantId, 10) || null,
      retailPrice: text(item && item.retailPrice, "").slice(0, 20),
      currency: text(item && item.currency, "USD").slice(0, 8),
      productId: text(item && item.productId, "").slice(0, 80)
    };
  }

  function restorePrintfulCart() {
    try {
      const raw = window.localStorage.getItem(MERCH_CART_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      printfulMerchState.cart = Array.isArray(parsed)
        ? parsed.map(normalizeStoredCartItem).filter(Boolean).slice(0, 20)
        : [];
    } catch (error) {
      printfulMerchState.cart = [];
    }
  }

  function persistPrintfulCart() {
    try {
      if (printfulMerchState.cart.length) {
        window.localStorage.setItem(MERCH_CART_STORAGE_KEY, JSON.stringify(printfulMerchState.cart));
      } else {
        window.localStorage.removeItem(MERCH_CART_STORAGE_KEY);
      }
    } catch (error) {}
  }

  function normalizePrintfulOrderRequestId(value) {
    return text(value, "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 32);
  }

  function printfulRandomHex(length) {
    const size = Math.ceil(length / 2);

    try {
      const bytes = new Uint8Array(size);
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, length);
    } catch (error) {
      return Math.random().toString(16).slice(2).padEnd(length, "0").slice(0, length);
    }
  }

  function createPrintfulOrderRequestId() {
    return normalizePrintfulOrderRequestId(`pir_${Date.now().toString(36)}_${printfulRandomHex(8)}`);
  }

  function clearPrintfulOrderRequestId() {
    printfulMerchState.orderRequestId = "";

    try {
      window.localStorage.removeItem(MERCH_ORDER_REQUEST_STORAGE_KEY);
    } catch (error) {}
  }

  function currentPrintfulOrderRequestId() {
    if (!printfulMerchState.orderRequestId) {
      try {
        printfulMerchState.orderRequestId = normalizePrintfulOrderRequestId(window.localStorage.getItem(MERCH_ORDER_REQUEST_STORAGE_KEY));
      } catch (error) {}
    }

    if (!printfulMerchState.orderRequestId) {
      printfulMerchState.orderRequestId = createPrintfulOrderRequestId();
    }

    try {
      window.localStorage.setItem(MERCH_ORDER_REQUEST_STORAGE_KEY, printfulMerchState.orderRequestId);
    } catch (error) {}

    return printfulMerchState.orderRequestId;
  }

  function resetPrintfulCheckoutState() {
    printfulMerchState.shippingRates = [];
    printfulMerchState.selectedShipping = "";
    printfulMerchState.shippingEstimateKey = "";
    clearPrintfulOrderRequestId();
  }

  function printfulShippingRecipientFromForm(form) {
    const formData = new FormData(form);

    return {
      country_code: text(formData.get("country_code"), "US").toUpperCase(),
      state_code: text(formData.get("state_code"), "").toUpperCase(),
      zip: text(formData.get("zip"), "")
    };
  }

  function printfulShippingRecipientKey(recipient) {
    return [
      text(recipient && recipient.country_code, "US").toUpperCase(),
      text(recipient && recipient.state_code, "").toUpperCase(),
      text(recipient && recipient.zip, "")
    ].join("|");
  }

  function invalidatePrintfulShippingEstimate(message) {
    const status = document.getElementById("printful-cart-status");
    const ratesNode = document.getElementById("printful-shipping-rates");

    printfulMerchState.shippingRates = [];
    printfulMerchState.selectedShipping = "";
    printfulMerchState.shippingEstimateKey = "";

    if (ratesNode) {
      ratesNode.innerHTML = "";
    }

    if (status) {
      status.textContent = text(message, "Estimate shipping again before requesting an invoice.");
    }
  }

  function printfulShippingRateId(rate, index) {
    return text(rate && (rate.id || rate.shipping), `RATE_${index}`);
  }

  function printfulShippingRateLabel(rate) {
    const name = text(rate && (rate.name || rate.shipping || rate.shipping_method_name || rate.id), "Shipping");
    const price = printfulMoney(rate && (rate.rate || rate.price), rate && rate.currency);
    const minDays = Number.parseInt(rate && (rate.minDeliveryDays || rate.min_delivery_days), 10);
    const maxDays = Number.parseInt(rate && (rate.maxDeliveryDays || rate.max_delivery_days), 10);
    const delivery = Number.isFinite(minDays) && Number.isFinite(maxDays)
      ? `${minDays}-${maxDays} business days`
      : "";

    return [name, price, delivery].filter(Boolean).join(" | ");
  }

  function printfulShippingRatesMarkup() {
    if (!printfulMerchState.shippingRates.length) {
      return "";
    }

    const options = printfulMerchState.shippingRates
      .map((rate, index) => {
        const id = printfulShippingRateId(rate, index);
        const selected = printfulMerchState.selectedShipping === id || (!printfulMerchState.selectedShipping && index === 0);
        return `<option value="${escapeHtml(id)}" ${selected ? "selected" : ""}>${escapeHtml(printfulShippingRateLabel(rate))}</option>`;
      })
      .join("");

    return `
      <label class="merch-shipping-select">
        <span>Shipping</span>
        <select id="printful-shipping-select" name="shipping">${options}</select>
      </label>
    `;
  }

  function renderPrintfulCart() {
    const body = document.getElementById("printful-cart-body");
    const count = document.getElementById("printful-cart-count");
    const orderNotice = text(printfulMerchState.orderNotice, "");
    const noticeMarkup = orderNotice ? `<p class="merch-cart__notice">${escapeHtml(orderNotice)}</p>` : "";

    if (!body) {
      return;
    }

    if (count) {
      count.textContent = String(printfulCartQuantity());
    }

    if (!printfulMerchState.cart.length) {
      body.innerHTML = `
        ${noticeMarkup}
        <p class="merch-cart__empty">Order request is empty.</p>
        <p class="merch-cart__note">Choose a product and option, then estimate shipping before requesting an invoice.</p>
        <ul class="merch-cart__assurance" aria-label="Checkout assurances">
          <li>Printed on demand after invoice payment.</li>
          <li>Shipping is estimated before the request leaves the site.</li>
          <li>${escapeHtml(merchPaymentCopy())}</li>
          <li>Support replies within ${escapeHtml(merchSupportResponseCopy())}.</li>
        </ul>
      `;
      return;
    }

    const total = printfulCartTotal();
    const totalLabel = total ? printfulMoney(total, "USD") : "Price pending";
    const summaryText = printfulCartSummaryText();
    const itemsMarkup = printfulMerchState.cart
      .map(
        (item, index) => {
          const amount = Number.parseFloat(item.retailPrice);
          const linePrice = Number.isFinite(amount) ? printfulMoney(amount * item.quantity, item.currency) : "Price pending";

          return `
          <li>
            <div>
              <strong>${escapeHtml(item.productName)}</strong>
              <span>${escapeHtml(item.variantName)} x ${item.quantity}</span>
              <span>${escapeHtml(linePrice)}</span>
              <div class="merch-cart__qty" aria-label="Change quantity for ${escapeHtml(item.productName)}">
                <button type="button" data-printful-cart-qty="${index}" data-printful-cart-qty-step="-1" aria-label="Decrease ${escapeHtml(item.productName)} quantity">-</button>
                <strong>${escapeHtml(String(item.quantity))}</strong>
                <button type="button" data-printful-cart-qty="${index}" data-printful-cart-qty-step="1" aria-label="Increase ${escapeHtml(item.productName)} quantity">+</button>
              </div>
            </div>
            <button type="button" class="merch-cart__remove" data-printful-remove-cart="${index}" aria-label="Remove ${escapeHtml(item.productName)}">Remove</button>
          </li>
        `;
        }
      )
      .join("");

    body.innerHTML = `
      <ul class="merch-cart__items">${itemsMarkup}</ul>
      <div class="merch-cart__total">
        <span>Subtotal</span>
        <strong>${escapeHtml(totalLabel)}</strong>
      </div>
      <details class="merch-cart__snapshot">
        <summary>Order Snapshot</summary>
        <pre data-printful-cart-summary-text>${escapeHtml(summaryText)}</pre>
        <div class="action-row merch-cart__snapshot-actions">
          <button class="button button--ghost button--small" type="button" data-printful-copy-cart>Copy</button>
          <a class="button button--ghost button--small" href="${escapeHtml(printfulCartSummaryMailto())}">Email Support</a>
        </div>
        <p class="merch-inline-status" id="printful-copy-status"></p>
      </details>
      <p class="merch-cart__note">Shipping is estimated here. Final tax and payment are handled in the invoice link sent by email.</p>
      <form class="merch-checkout-form" id="printful-draft-order-form">
        <input class="merch-honey-field" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <label>
          <span>Name</span>
          <input name="name" autocomplete="name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autocomplete="email" required />
        </label>
        <label>
          <span>Phone optional</span>
          <input name="phone" type="tel" autocomplete="tel" />
        </label>
        <label>
          <span>Address</span>
          <input name="address1" autocomplete="address-line1" required />
        </label>
        <label>
          <span>Address 2 optional</span>
          <input name="address2" autocomplete="address-line2" />
        </label>
        <div class="merch-checkout-form__row">
          <label>
            <span>City</span>
            <input name="city" autocomplete="address-level2" required />
          </label>
          <label>
            <span>State</span>
            <input name="state_code" autocomplete="address-level1" maxlength="12" data-printful-shipping-field />
          </label>
        </div>
        <div class="merch-checkout-form__row">
          <label>
            <span>Country</span>
            <select name="country_code" autocomplete="country" required data-printful-shipping-field>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="NL">Netherlands</option>
              <option value="SE">Sweden</option>
              <option value="JP">Japan</option>
            </select>
          </label>
          <label>
            <span>ZIP</span>
            <input name="zip" autocomplete="postal-code" required data-printful-shipping-field />
          </label>
        </div>
        <button class="button button--ghost button--small" type="button" data-printful-estimate-shipping>Estimate Shipping</button>
        <div class="merch-shipping-rates" id="printful-shipping-rates">${printfulShippingRatesMarkup()}</div>
        <label class="merch-policy-check">
          <input name="policy" type="checkbox" required />
          <span>I understand this sends an order request, not a completed payment. ${escapeHtml(merchPaymentCopy())}</span>
        </label>
        <p class="merch-cart__note">Your address is used to estimate shipping and prepare the invoice. ${escapeHtml(merchCancellationCopy())} Support replies within ${escapeHtml(merchSupportResponseCopy())}: <a href="mailto:${escapeHtml(merchSupportEmail())}">${escapeHtml(merchSupportEmail())}</a>.</p>
        <button class="button button--primary button--small" type="submit">Request Invoice</button>
        <p class="merch-inline-status" id="printful-cart-status"></p>
      </form>
    `;
  }

  function addPrintfulCartVariant(detail, variant, quantity) {
    const productName = text(detail.product && detail.product.merch && detail.product.merch.productTitle, detail.product && detail.product.name) || "Pawn Island Records merch";
    const productId = text(detail.product && detail.product.id, "");
    const existing = printfulMerchState.cart.find((item) => item.syncVariantId === variant.syncVariantId);
    const safeQuantity = Math.min(Math.max(Number.parseInt(quantity, 10) || 1, 1), 10);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + safeQuantity, 10);
    } else {
      printfulMerchState.cart.push({
        productName,
        variantName: text(variant.name, "Variant"),
        quantity: safeQuantity,
        productId,
        syncVariantId: variant.syncVariantId,
        catalogVariantId: variant.catalogVariantId,
        retailPrice: variant.retailPrice,
        currency: text(variant.currency, "USD")
      });
    }

    printfulMerchState.orderNotice = "";
    resetPrintfulCheckoutState();
    persistPrintfulCart();
    renderPrintfulCart();
    trackMerchEvent("add_to_cart", {
      product_id: productId,
      product_title: productName,
      variant_id: variant.syncVariantId ? String(variant.syncVariantId) : "",
      quantity: safeQuantity,
      cart_quantity: printfulCartQuantity()
    });
  }

  function addPrintfulCartItem(productId, form) {
    const detail = printfulMerchState.productDetails.get(productId);
    const variants = detail && Array.isArray(detail.variants) ? detail.variants.filter((variant) => variant.isSynced !== false) : [];
    const variant = variants[Number.parseInt(form.variant.value, 10)];
    const quantity = Math.min(Math.max(Number.parseInt(form.quantity.value, 10) || 1, 1), 10);

    if (!detail || !variant) {
      return;
    }

    addPrintfulCartVariant(detail, variant, quantity);

    const status = form.querySelector("[data-printful-add-status]");

    if (status) {
      status.textContent = "Added to request.";
    }
  }

  function addPrintfulSingleOptionProduct(productId, detail) {
    const variants = detail && Array.isArray(detail.variants) ? detail.variants.filter((variant) => variant.isSynced !== false) : [];

    if (variants.length !== 1) {
      return false;
    }

    addPrintfulCartVariant(detail, variants[0], 1);
    return true;
  }

  async function estimatePrintfulShipping(form) {
    const status = document.getElementById("printful-cart-status");
    const ratesNode = document.getElementById("printful-shipping-rates");
    const recipient = printfulShippingRecipientFromForm(form);
    const recipientKey = printfulShippingRecipientKey(recipient);
    const items = printfulMerchState.cart
      .filter((item) => item.catalogVariantId)
      .map((item) => ({
        variant_id: item.catalogVariantId,
        quantity: item.quantity,
        value: item.retailPrice
      }));

    if (!items.length) {
      if (status) {
        status.textContent = "Shipping estimates need catalog-ready items.";
      }
      return;
    }

    printfulMerchState.shippingRates = [];
    printfulMerchState.selectedShipping = "";
    printfulMerchState.shippingEstimateKey = "";

    if (ratesNode) {
      ratesNode.innerHTML = "";
    }

    if (status) {
      status.textContent = "Checking shipping rates.";
    }

    try {
      const response = await merchApiJson("api/merch/shipping-rates", {
        method: "POST",
        body: JSON.stringify({ recipient, items, currency: "USD" })
      });
      const rates = Array.isArray(response.rates) ? response.rates : [];
      printfulMerchState.shippingRates = rates;
      printfulMerchState.selectedShipping = rates.length ? printfulShippingRateId(rates[0], 0) : "";
      printfulMerchState.shippingEstimateKey = rates.length ? recipientKey : "";
      trackMerchEvent("estimate_shipping", {
        status: rates.length ? "ready" : "empty",
        rate_count: rates.length,
        item_count: printfulCartQuantity(),
        country: recipient.country_code
      });

      if (ratesNode) {
        ratesNode.innerHTML = rates.length
          ? printfulShippingRatesMarkup()
          : '<p class="merch-inline-status">No shipping rates came back for that destination.</p>';
      }

      if (status) {
        status.textContent = rates.length ? "Shipping rates ready." : "No shipping rates came back for that destination.";
      }
    } catch (error) {
      printfulMerchState.shippingRates = [];
      printfulMerchState.selectedShipping = "";
      printfulMerchState.shippingEstimateKey = "";
      trackMerchEvent("checkout_error", {
        step: "estimate_shipping",
        message: error.message
      });

      if (ratesNode) {
        ratesNode.innerHTML = `<p class="merch-inline-status">${escapeHtml(error.message)}</p>`;
      }

      if (status) {
        status.textContent = error.message;
      }
    }
  }

  async function submitPrintfulDraftOrder(form) {
    const status = document.getElementById("printful-cart-status");
    const formData = new FormData(form);
    const recipient = {
      name: text(formData.get("name"), ""),
      email: text(formData.get("email"), ""),
      phone: text(formData.get("phone"), ""),
      address1: text(formData.get("address1"), ""),
      address2: text(formData.get("address2"), ""),
      city: text(formData.get("city"), ""),
      state_code: text(formData.get("state_code"), "").toUpperCase(),
      country_code: text(formData.get("country_code"), "US").toUpperCase(),
      zip: text(formData.get("zip"), "")
    };
    const items = printfulMerchState.cart.map((item) => ({
      sync_variant_id: item.syncVariantId,
      quantity: item.quantity,
      retail_price: item.retailPrice,
      name: item.productName
    }));
    const selectedShipping = text(formData.get("shipping"), printfulMerchState.selectedShipping);
    const knownShippingIds = new Set(printfulMerchState.shippingRates.map((rate, index) => printfulShippingRateId(rate, index)));
    const shippingRecipientKey = printfulShippingRecipientKey(recipient);

    if (text(formData.get("website"), "")) {
      return;
    }

    if (printfulMerchState.shippingRates.length && printfulMerchState.shippingEstimateKey !== shippingRecipientKey) {
      if (status) {
        status.textContent = "Shipping destination changed. Estimate shipping again before requesting an invoice.";
      }
      trackMerchEvent("checkout_error", {
        step: "submit_order_request",
        message: "shipping_estimate_stale"
      });
      return;
    }

    if (!printfulMerchState.shippingRates.length || !selectedShipping || !knownShippingIds.has(selectedShipping)) {
      if (status) {
        status.textContent = "Estimate shipping before requesting an invoice.";
      }
      trackMerchEvent("checkout_error", {
        step: "submit_order_request",
        message: "shipping_estimate_required"
      });
      return;
    }

    if (status) {
      status.textContent = "Preparing order request.";
    }

    try {
      trackMerchEvent("begin_checkout", {
        item_count: printfulCartQuantity(),
        subtotal: printfulCartTotal(),
        shipping: selectedShipping
      });
      const response = await merchApiJson("api/merch/draft-order", {
        method: "POST",
        body: JSON.stringify({
          external_id: currentPrintfulOrderRequestId(),
          recipient,
          items,
          shipping: selectedShipping
        })
      });
      const orderId = response && response.order && response.order.id ? ` #${response.order.id}` : "";

      if (status) {
        status.textContent = `Order request created${orderId}.`;
      }

      printfulMerchState.orderNotice = `Order request received${orderId}. ${merchPaymentCopy()}`;
      trackMerchEvent("submit_order_request", {
        status: "created",
        order_id: response && response.order && response.order.id ? String(response.order.id) : "",
        item_count: items.reduce((total, item) => total + item.quantity, 0),
        shipping: selectedShipping
      });
      printfulMerchState.cart = [];
      resetPrintfulCheckoutState();
      persistPrintfulCart();
      renderPrintfulCart();
    } catch (error) {
      trackMerchEvent("checkout_error", {
        step: "submit_order_request",
        message: error.message
      });
      if (status) {
        status.textContent = error.message;
      }
    }
  }

  function countBy(products, keyGetter, labelGetter) {
    const map = new Map();

    products.forEach((product) => {
      const key = keyGetter(product);
      const label = labelGetter(product);

      if (!map.has(key)) {
        map.set(key, { key, label, count: 0 });
      }

      map.get(key).count += 1;
    });

    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }

  function printfulFilterFallbackLabel(value) {
    return text(value, "")
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function printfulFilterLabel(kind, value) {
    if (value === "all") {
      return "All";
    }

    const field = {
      category: "category",
      project: "project",
      album: "album"
    }[kind];
    const key = `${kind}Key`;
    const product = activePrintfulProducts().find((item) => item.merch && item.merch[key] === value);

    return text(product && product.merch && product.merch[field], printfulFilterFallbackLabel(value));
  }

  function printfulSortLabel(value) {
    return (
      {
        featured: "Featured",
        project: "Artist",
        album: "Drop",
        name: "Name"
      }[value] || printfulFilterFallbackLabel(value)
    );
  }

  function hasActivePrintfulFilters() {
    const filters = printfulMerchState.filters;
    return Boolean(
      filters.query ||
        filters.category !== "all" ||
        filters.project !== "all" ||
        filters.album !== "all" ||
        filters.sort !== "featured"
    );
  }

  function syncPrintfulFilterInputs() {
    const search = document.getElementById("printful-product-search");
    const sort = document.getElementById("printful-product-sort");

    if (search && search.value !== printfulMerchState.filters.query) {
      search.value = printfulMerchState.filters.query;
    }

    if (sort && sort.value !== printfulMerchState.filters.sort) {
      sort.value = printfulMerchState.filters.sort;
    }
  }

  function resetPrintfulFilters() {
    printfulMerchState.filters.query = "";
    printfulMerchState.filters.category = "all";
    printfulMerchState.filters.project = "all";
    printfulMerchState.filters.album = "all";
    printfulMerchState.filters.sort = "featured";
    syncPrintfulFilterInputs();
    renderPrintfulStore();
    trackMerchEvent("clear_filters", {
      mode: printfulMerchState.mode
    });
  }

  function renderPrintfulActiveFilters(visibleCount, activeCount) {
    const node = document.getElementById("printful-active-filters");

    if (!node) {
      return;
    }

    if (!hasActivePrintfulFilters()) {
      node.hidden = true;
      node.innerHTML = "";
      return;
    }

    const filters = printfulMerchState.filters;
    const chips = [];

    if (filters.query) {
      chips.push(`Search: "${filters.query}"`);
    }

    if (filters.category !== "all") {
      chips.push(`Category: ${printfulFilterLabel("category", filters.category)}`);
    }

    if (filters.project !== "all") {
      chips.push(`Artist: ${printfulFilterLabel("project", filters.project)}`);
    }

    if (filters.album !== "all") {
      chips.push(`Drop: ${printfulFilterLabel("album", filters.album)}`);
    }

    if (filters.sort !== "featured") {
      chips.push(`Sort: ${printfulSortLabel(filters.sort)}`);
    }

    node.hidden = false;
    node.innerHTML = `
      <div class="merch-active-filters__chips" role="list" aria-label="Active merch filters">
        ${chips.map((chip) => `<span role="listitem">${escapeHtml(chip)}</span>`).join("")}
      </div>
      <p>${escapeHtml(String(visibleCount))} shown from ${escapeHtml(String(activeCount))} available.</p>
      <button class="button button--ghost button--small" type="button" data-printful-clear-filters>Reset Filters</button>
    `;
  }

  function merchFilterButtonMarkup(kind, value, label, count, className) {
    const active = printfulMerchState.filters[kind] === value;

    return `
      <button class="${escapeHtml(className || "merch-filter")} ${active ? "is-active" : ""}" type="button" data-printful-filter="${escapeHtml(kind)}" data-printful-filter-value="${escapeHtml(value)}" aria-pressed="${active ? "true" : "false"}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(count))}</strong>
      </button>
    `;
  }

  function printfulModeButtonMarkup(value, label, count, description) {
    const active = printfulMerchState.mode === value;

    return `
      <button class="merch-category-tab merch-mode-tab ${active ? "is-active" : ""}" type="button" data-printful-mode="${escapeHtml(value)}" aria-pressed="${active ? "true" : "false"}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(count))}</strong>
        <em>${escapeHtml(description)}</em>
      </button>
    `;
  }

  function printfulCategoryTabMarkup(value, label, count, description) {
    const active = isPrintfulShopMode() && printfulMerchState.filters.category === value;

    return `
      <button class="merch-category-tab ${active ? "is-active" : ""}" type="button" data-printful-filter="category" data-printful-filter-value="${escapeHtml(value)}" aria-pressed="${active ? "true" : "false"}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(count))}</strong>
        <em>${escapeHtml(description)}</em>
      </button>
    `;
  }

  function printfulMatchesFilters(product) {
    const meta = product.merch || parsePrintfulProductName(product.name, product);
    const filters = printfulMerchState.filters;
    const query = filters.query.toLowerCase();

    return (
      (filters.category === "all" || meta.categoryKey === filters.category) &&
      (filters.project === "all" || meta.projectKey === filters.project) &&
      (filters.album === "all" || meta.albumKey === filters.album) &&
      (!query || meta.searchText.includes(query))
    );
  }

  function sortPrintfulProducts(products) {
    const sorted = [...products];
    const sort = printfulMerchState.filters.sort;

    if (sort === "project") {
      sorted.sort((a, b) =>
        `${a.merch.project} ${a.merch.album} ${a.merch.design}`.localeCompare(`${b.merch.project} ${b.merch.album} ${b.merch.design}`)
      );
    } else if (sort === "album") {
      sorted.sort((a, b) =>
        `${a.merch.album} ${a.merch.project} ${a.merch.design}`.localeCompare(`${b.merch.album} ${b.merch.project} ${b.merch.design}`)
      );
    } else if (sort === "name") {
      sorted.sort((a, b) => a.merch.productTitle.localeCompare(b.merch.productTitle));
    } else {
      sorted.sort((a, b) => a.merchIndex - b.merchIndex);
    }

    return sorted;
  }

  function filteredPrintfulProducts() {
    return sortPrintfulProducts(activePrintfulProducts().filter(printfulMatchesFilters));
  }

  function renderPrintfulFilterControls() {
    const categoryNode = document.getElementById("printful-category-filters");
    const productCategoryNode = document.getElementById("printful-product-category-filters");
    const projectNode = document.getElementById("printful-project-filters");
    const albumNode = document.getElementById("printful-album-filters");
    const activeProducts = activePrintfulProducts();
    const categoryScoped = activeProducts.filter((product) => {
      return printfulMerchState.filters.category === "all" || product.merch.categoryKey === printfulMerchState.filters.category;
    });
    const projectScoped = categoryScoped.filter((product) => {
      return printfulMerchState.filters.project === "all" || product.merch.projectKey === printfulMerchState.filters.project;
    });

    if (categoryNode) {
      const publicProducts = activePrintfulProducts();
      const categories = countBy(publicProducts, (product) => product.merch.categoryKey, (product) => product.merch.category);
      const tabs = [
        printfulCategoryTabMarkup("all", "All", publicProducts.length, "Curated order-ready goods"),
        ...categories.map((category) => {
          const descriptions = {
            apparel: "Artist tees",
            "desk-gear": "Mats and work surfaces",
            bags: "Carry goods"
          };
          return printfulCategoryTabMarkup(category.key, category.label, category.count, descriptions[category.key] || "Order-ready items");
        }),
        printfulModeButtonMarkup("featured", "Featured", featuredPrintfulProducts(publicProducts).length, "Strong starts")
      ];

      if (merchCatalogModeEnabled()) {
        tabs.push(printfulModeButtonMarkup("catalog", "Design Next", printfulMerchState.catalogProducts.length, "Internal catalog"));
      }

      categoryNode.innerHTML = tabs.join("");
    }

    if (productCategoryNode) {
      const categories = countBy(activeProducts, (product) => product.merch.categoryKey, (product) => product.merch.category);
      productCategoryNode.innerHTML = [
        merchFilterButtonMarkup("category", "all", "All Product Types", activeProducts.length),
        ...categories.map((category) => merchFilterButtonMarkup("category", category.key, category.label, category.count))
      ].join("");
    }

    if (projectNode) {
      const projects = countBy(categoryScoped, (product) => product.merch.projectKey, (product) => product.merch.project);
      projectNode.innerHTML = [
        merchFilterButtonMarkup("project", "all", isPrintfulCatalogMode() ? "All Families" : "All Projects", categoryScoped.length),
        ...projects.map((project) => merchFilterButtonMarkup("project", project.key, project.label, project.count))
      ].join("");
    }

    if (albumNode) {
      const albums = countBy(projectScoped, (product) => product.merch.albumKey, (product) => product.merch.album);
      albumNode.innerHTML = [
        merchFilterButtonMarkup("album", "all", isPrintfulCatalogMode() ? "All Shelves" : "All Albums", projectScoped.length),
        ...albums.map((album) => merchFilterButtonMarkup("album", album.key, album.label, album.count))
      ].join("");
    }
  }

  function renderPrintfulStats(products) {
    const statsNode = document.getElementById("merch-stats");

    if (!statsNode) {
      return;
    }

    const readyProducts = activePrintfulProducts().length ? activePrintfulProducts() : products;
    const categories = new Set(readyProducts.map((product) => product.merch.categoryKey)).size;
    const projects = new Set(readyProducts.map((product) => product.merch.projectKey)).size;
    const options = readyProducts.reduce((total, product) => total + (Number(product.variants) || Number(product.variantCount) || 0), 0);

    statsNode.innerHTML = `
      <dl>
        <div>
          <dt>Ready</dt>
          <dd>${escapeHtml(String(readyProducts.length))}</dd>
        </div>
        <div>
          <dt>Projects</dt>
          <dd>${escapeHtml(String(projects))}</dd>
        </div>
        <div>
          <dt>Types</dt>
          <dd>${escapeHtml(String(categories))}</dd>
        </div>
        <div>
          <dt>Options</dt>
          <dd>${escapeHtml(String(options))}</dd>
        </div>
      </dl>
    `;
  }

  function renderPrintfulHeroShowcase(products) {
    const node = document.getElementById("merch-hero-showcase");

    if (!node) {
      return;
    }

    const featured = featuredPrintfulProducts(printfulMerchState.syncProducts.length ? printfulMerchState.syncProducts : products);

    node.hidden = featured.length === 0;

    node.innerHTML = featured.length
      ? featured
          .map(
            (product) => `
              <a class="merch-showcase-tile merch-showcase-tile--${escapeHtml(printfulArtworkGround(product))}" role="listitem" href="${escapeHtml(printfulProductUrl(product.id))}" data-printful-product-link="${escapeHtml(product.id)}">
                ${printfulPrimaryVisualMarkup(product, "hero", "eager")}
                <span>${escapeHtml(product.merch.design)}</span>
              </a>
            `
          )
          .join("")
      : "";
  }

  function renderPrintfulStore() {
    const grid = document.getElementById("printful-store-grid");
    const summary = document.getElementById("printful-results-summary");
    const status = document.getElementById("printful-store-status");
    const toolbar = document.querySelector(".merch-toolbar");
    const products = filteredPrintfulProducts();
    const activeProducts = activePrintfulProducts();
    const isCatalog = isPrintfulCatalogMode();
    const isFeatured = isPrintfulFeaturedMode();
    const visibleProducts = isFeatured ? featuredPrintfulProducts(products) : products;

    renderPrintfulFilterControls();
    syncPrintfulFilterInputs();
    renderPrintfulActiveFilters(visibleProducts.length, activeProducts.length);

    if (toolbar) {
      toolbar.hidden = false;
    }

    if (summary) {
      if (isCatalog) {
        summary.textContent = `Internal design catalog: ${products.length} of ${activeProducts.length} products shown.`;
      } else if (isFeatured) {
        summary.textContent = `Featured rack: ${visibleProducts.length} of ${products.length} matching products shown.`;
      } else {
        summary.textContent = `Order-ready goods: ${products.length} of ${activeProducts.length} products shown.`;
      }
    }

    if (status) {
      const publicProducts = activePrintfulProducts();
      const projects = new Set(publicProducts.map((product) => product.merch.projectKey)).size;
      const catalogCategories = new Set(printfulMerchState.catalogProducts.map((product) => product.merch.categoryKey)).size;
      status.textContent = isCatalog
        ? `${printfulMerchState.catalogProducts.length} internal Printful products across ${catalogCategories} active categor${catalogCategories === 1 ? "y" : "ies"}.`
        : publicProducts.length
          ? `${publicProducts.length} order-ready product${publicProducts.length === 1 ? "" : "s"} across ${projects} project${projects === 1 ? "" : "s"}.`
          : "No order-ready products are available yet.";
    }

    if (!grid) {
      return;
    }

    grid.classList.toggle("merch-grid--featured", isFeatured);
    grid.classList.toggle("merch-grid--catalog", isCatalog);

    grid.innerHTML = visibleProducts.length
      ? visibleProducts.map((product, index) => printfulProductCardMarkup(product, index)).join("")
      : `
        <article class="empty-card">
          <p>No products match the current filters.</p>
          ${hasActivePrintfulFilters() ? '<button class="button button--ghost button--small" type="button" data-printful-clear-filters>Reset Filters</button>' : ""}
        </article>
      `;
  }

  function relatedPrintfulProducts(product) {
    if (!product) {
      return [];
    }

    const relatedPool = activePrintfulProducts();
    const sameAlbum = relatedPool.filter(
      (item) => item.id !== product.id && item.merch.albumKey === product.merch.albumKey
    );
    const sameProject = relatedPool.filter(
      (item) => item.id !== product.id && item.merch.projectKey === product.merch.projectKey && item.merch.albumKey !== product.merch.albumKey
    );

    return [...sameAlbum, ...sameProject].slice(0, 4);
  }

  function printfulProductDetailMarkup(product, detail) {
    const meta = product.merch;
    const price = printfulPriceRange(detail.variants);
    const related = relatedPrintfulProducts(product);
    const isCatalogProduct = product && product.source === "printful-catalog";
    const backLabel = isPrintfulCatalogMode() ? "Back to Design Next" : isPrintfulFeaturedMode() ? "Back to Featured" : "Back to Store";
    const techniqueLabels = Array.isArray(product && product.techniques)
      ? product.techniques.map((technique) => text(technique.name || technique.key, "")).filter(Boolean).slice(0, 3)
      : [];
    const detailCopy = isCatalogProduct
      ? text(product.description, `${meta.categoryPath || meta.category} is available in Printful's blank catalog for a future label design.`)
      : text(meta.detailCopy, `${meta.design} artwork is shown with current product photos from the store listing. Choose an option to send an order request.`);
    const fitNotes = merchFamilyNote(product, "fitNotes", "Variant details load from the current Printful option set.");
    const materialCare = merchFamilyNote(product, "materialCare", "Care information follows the selected Printful product.");
    const productionNote = merchFamilyNote(product, "productionNote", "Printed on demand after invoice payment.");
    const shippingNote = merchFamilyNote(product, "shippingNote", "Shipping is estimated in the order desk before the request is sent.");
    const returnPolicy = text(meta.returnPolicy, merchPolicyCopy());

    return `
      <div class="merch-product-detail__grid">
        <div class="merch-product-detail__visual">
          ${printfulProductGalleryMarkup(product, detail)}
        </div>
        <div class="merch-product-detail__copy">
          <button class="button button--ghost button--small" type="button" data-printful-clear-product>${escapeHtml(backLabel)}</button>
          <div class="merch-card__meta">
            <span class="tag">${escapeHtml(meta.project)}</span>
            <span class="tag tag--muted">${escapeHtml(meta.category)}</span>
          </div>
          <h3>${escapeHtml(meta.productTitle)}</h3>
          <p>${escapeHtml(detailCopy)}</p>
          <div class="merch-product-price">${escapeHtml(isCatalogProduct ? "Design next" : price || "Price loads with options")}</div>
          ${isCatalogProduct ? '<a class="button button--primary button--small" href="connect.html">Request This Product</a>' : printfulVariantFormMarkup(product.id, detail, "detail")}
          <dl class="merch-product-specs">
            <div>
              <dt>Category</dt>
              <dd>${escapeHtml(meta.categoryPath || meta.category)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(isCatalogProduct ? "Type" : "Project")}</dt>
              <dd>${escapeHtml(isCatalogProduct ? text(product.type, meta.category) : meta.project)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(isCatalogProduct ? "Technique" : "Album")}</dt>
              <dd>${escapeHtml(isCatalogProduct ? text(techniqueLabels.join(", "), "Varies by product") : meta.album)}</dd>
            </div>
            <div>
              <dt>${escapeHtml(isCatalogProduct ? "Options" : "Order")}</dt>
              <dd>${escapeHtml(isCatalogProduct ? `${Number(product.variantCount || product.variants || 0)} blank option${Number(product.variantCount || product.variants || 0) === 1 ? "" : "s"}` : "Invoice follow-up by email")}</dd>
            </div>
          </dl>
          ${
            isCatalogProduct
              ? ""
              : `
                <div class="merch-product-policies">
                  <section>
                    <h4>Fit & Care</h4>
                    <p>${escapeHtml(fitNotes)}</p>
                    <p>${escapeHtml(materialCare)}</p>
                  </section>
                  <section>
                    <h4>Production & Shipping</h4>
                    <p>${escapeHtml(productionNote)}</p>
                    <p>${escapeHtml(shippingNote)}</p>
                    <p>${escapeHtml(merchPaymentCopy())}</p>
                  </section>
                  <section>
                    <h4>Returns & Support</h4>
                    <p>${escapeHtml(returnPolicy)}</p>
                    <p>${escapeHtml(merchCancellationCopy())}</p>
                    <p>${escapeHtml(meta.supportCopy)} Support replies within ${escapeHtml(merchSupportResponseCopy())}: <a href="mailto:${escapeHtml(merchSupportEmail())}">${escapeHtml(merchSupportEmail())}</a></p>
                  </section>
                </div>
              `
          }
        </div>
      </div>
      ${
        related.length
          ? `
            <div class="merch-related">
              <p class="section-kicker">More Designs</p>
              <div class="merch-related-grid">
                ${related
                  .map(
                    (item) => `
                      <a class="merch-related-card merch-related-card--${escapeHtml(printfulArtworkGround(item))}" href="${escapeHtml(printfulProductUrl(item.id))}" data-printful-product-link="${escapeHtml(item.id)}">
                        ${printfulPrimaryVisualMarkup(item, "related")}
                        <span>${escapeHtml(item.merch.design)}</span>
                      </a>
                    `
                  )
                  .join("")}
              </div>
            </div>
          `
          : ""
      }
    `;
  }

  function renderPrintfulProductDetail(productId) {
    const node = document.getElementById("printful-product-detail");

    if (!node) {
      return;
    }

    if (!productId) {
      node.hidden = true;
      node.innerHTML = "";
      return;
    }

    const product = printfulProductById(productId);

    node.hidden = false;

    if (!product) {
      node.innerHTML = '<div class="empty-card"><p>This product is no longer available.</p></div>';
      return;
    }

    trackPrintfulProductView(product);

    const detail = printfulMerchState.productDetails.get(String(productId));

    if (detail) {
      node.innerHTML = printfulProductDetailMarkup(product, detail);
      setRouteMeta({
        title: `${product.merch.productTitle} | Pawn Island Records Merch`,
        description: product.source === "printful-catalog"
          ? `Explore ${product.merch.productTitle} as a future Pawn Island Records merch format.`
          : `Request an invoice for the ${product.merch.productTitle} from ${product.merch.project}.`,
        canonicalPath: sitePath("merch.html", { product: product.id }),
        image: printfulArtworkImageUrl(product) || printfulProductImageUrl(detail.product || product),
        robots: "noindex,follow"
      });
      return;
    }

    node.innerHTML = `
      <div class="merch-product-detail__grid">
        <div class="merch-product-detail__visual">
          ${printfulProductGalleryMarkup(product)}
        </div>
        <div class="merch-product-detail__copy">
          <button class="button button--ghost button--small" type="button" data-printful-clear-product>${escapeHtml(isPrintfulCatalogMode() ? "Back to Design Next" : isPrintfulFeaturedMode() ? "Back to Featured" : "Back to Store")}</button>
          <div class="merch-card__meta">
            <span class="tag">${escapeHtml(product.merch.project)}</span>
            <span class="tag tag--muted">${escapeHtml(product.merch.category)}</span>
          </div>
          <h3>${escapeHtml(product.merch.productTitle)}</h3>
          <p>${escapeHtml(product.source === "printful-catalog" ? "Loading catalog details." : "Loading options and price.")}</p>
        </div>
      </div>
    `;

    loadPrintfulProduct(productId)
      .then(() => {
        if (printfulMerchState.selectedProductId === String(productId)) {
          renderPrintfulProductDetail(productId);
          renderPrintfulStore();
        }
      })
      .catch((error) => {
        if (printfulMerchState.selectedProductId === String(productId)) {
          node.innerHTML = `<div class="empty-card"><p>${escapeHtml(error.message)}</p></div>`;
        }
      });
  }

  function syncPrintfulProductUrl(productId) {
    const next = new URL(window.location.href);

    if (productId) {
      next.searchParams.set("product", productId);
    } else {
      next.searchParams.delete("product");
    }

    if (!isPrintfulShopMode()) {
      next.searchParams.set("view", printfulMerchState.mode);
    } else {
      next.searchParams.delete("view");
    }

    window.history.pushState({}, "", next);
  }

  function setPrintfulMode(mode, pushToHistory) {
    const nextMode = normalizePrintfulMode(mode);

    if (nextMode !== printfulMerchState.mode) {
      printfulMerchState.filters.category = "all";
      printfulMerchState.filters.project = "all";
      printfulMerchState.filters.album = "all";
      printfulMerchState.selectedProductId = "";
      printfulMerchState.zoomedProductId = "";
    }

    printfulMerchState.mode = nextMode;

    if (pushToHistory) {
      syncPrintfulProductUrl(printfulMerchState.selectedProductId);
    }

    if (!printfulMerchState.selectedProductId) {
      setMerchCollectionMeta();
    }

    renderPrintfulProductDetail(printfulMerchState.selectedProductId);
    renderPrintfulStore();
  }

  function selectPrintfulProduct(productId, pushToHistory) {
    printfulMerchState.selectedProductId = String(productId || "");
    printfulMerchState.zoomedProductId = "";

    if (pushToHistory) {
      syncPrintfulProductUrl(printfulMerchState.selectedProductId);
    }

    if (!printfulMerchState.selectedProductId) {
      setMerchCollectionMeta();
    }

    renderPrintfulProductDetail(printfulMerchState.selectedProductId);
    renderPrintfulStore();

    const node = document.getElementById("printful-product-detail");

    if (node && printfulMerchState.selectedProductId) {
      node.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }

  function bindPrintfulMerchEvents(panel) {
    if (!panel || printfulMerchState.eventsBound) {
      return;
    }

    printfulMerchState.eventsBound = true;

    panel.addEventListener("click", async (event) => {
      const filterButton = event.target.closest("[data-printful-filter]");
      const modeButton = event.target.closest("[data-printful-mode]");
      const productLink = event.target.closest("[data-printful-product-link]");
      const clearProduct = event.target.closest("[data-printful-clear-product]");
      const loadButton = event.target.closest("[data-printful-load-product]");
      const directAddButton = event.target.closest("[data-printful-direct-add-product]");
      const removeButton = event.target.closest("[data-printful-remove-cart]");
      const cartQtyButton = event.target.closest("[data-printful-cart-qty]");
      const shippingButton = event.target.closest("[data-printful-estimate-shipping]");
      const supportLink = event.target.closest("#merch-support-link, a[href^='mailto:']");
      const galleryImageButton = event.target.closest("[data-printful-gallery-image]");
      const zoomButton = event.target.closest("[data-printful-toggle-zoom]");
      const qtyStepButton = event.target.closest("[data-printful-qty-step]");
      const clearFiltersButton = event.target.closest("[data-printful-clear-filters]");
      const copyCartButton = event.target.closest("[data-printful-copy-cart]");

      if (supportLink) {
        trackMerchEvent("support_click", {
          href: text(supportLink.getAttribute("href"), "").replace(/^mailto:.*/, "mailto")
        });
      }

      if (clearFiltersButton) {
        resetPrintfulFilters();
        return;
      }

      if (copyCartButton) {
        copyPrintfulCartSummary();
        return;
      }

      if (modeButton) {
        setPrintfulMode(modeButton.dataset.printfulMode, true);
        return;
      }

      if (qtyStepButton) {
        const control = qtyStepButton.closest("[data-printful-quantity-control]");
        const input = control && control.querySelector('input[name="quantity"]');
        const step = Number.parseInt(qtyStepButton.dataset.printfulQtyStep, 10) || 0;

        if (input) {
          const current = Number.parseInt(input.value, 10) || 1;
          input.value = String(Math.min(Math.max(current + step, 1), 10));
        }

        return;
      }

      if (galleryImageButton) {
        const productId = galleryImageButton.dataset.printfulGalleryImage;
        const imageId = galleryImageButton.dataset.printfulGalleryImageId;

        if (productId && imageId) {
          printfulMerchState.gallerySelection.set(String(productId), imageId);
          printfulMerchState.zoomedProductId = "";
          renderPrintfulProductDetail(productId);
        }

        return;
      }

      if (zoomButton) {
        const productId = String(zoomButton.dataset.printfulToggleZoom || "");
        printfulMerchState.zoomedProductId = printfulMerchState.zoomedProductId === productId ? "" : productId;
        renderPrintfulProductDetail(productId);
        return;
      }

      if (filterButton) {
        const kind = filterButton.dataset.printfulFilter;
        const value = filterButton.dataset.printfulFilterValue || "all";

        if (kind && Object.prototype.hasOwnProperty.call(printfulMerchState.filters, kind)) {
          if (kind === "category" && isPrintfulFeaturedMode()) {
            printfulMerchState.mode = "shop";
            printfulMerchState.selectedProductId = "";
            printfulMerchState.zoomedProductId = "";
            syncPrintfulProductUrl("");
          }

          printfulMerchState.filters[kind] = value;
          if (kind === "category") {
            trackMerchEvent("select_category", {
              value,
              mode: printfulMerchState.mode
            });
          }

          if (kind === "category") {
            printfulMerchState.filters.project = "all";
            printfulMerchState.filters.album = "all";
          }

          if (kind === "project") {
            printfulMerchState.filters.album = "all";
          }

          renderPrintfulStore();
        }

        return;
      }

      if (productLink) {
        event.preventDefault();
        selectPrintfulProduct(productLink.dataset.printfulProductLink, true);
        return;
      }

      if (clearProduct) {
        selectPrintfulProduct("", true);
        return;
      }

      if (loadButton) {
        const productId = loadButton.dataset.printfulLoadProduct;
        const slot = document.querySelector(`[data-printful-variant-slot="${CSS.escape(productId)}"]`);
        loadButton.disabled = true;
        loadButton.textContent = "Loading";

        if (slot) {
          slot.innerHTML = '<p class="merch-inline-status">Loading options.</p>';
        }

        try {
          const detail = await loadPrintfulProduct(productId);
          renderPrintfulVariantPicker(productId, detail);
          trackMerchEvent("choose_option", {
            ...printfulTrackingProduct(printfulProductById(productId)),
            option_count: Array.isArray(detail && detail.variants) ? detail.variants.length : 0
          });
          loadButton.textContent = "Options Ready";
          loadButton.setAttribute("aria-expanded", "true");
        } catch (error) {
          if (slot) {
            slot.innerHTML = `<p class="merch-inline-status">${escapeHtml(error.message)}</p>`;
          }
          loadButton.disabled = false;
          loadButton.textContent = "Try Again";
        }
      }

      if (directAddButton) {
        const productId = directAddButton.dataset.printfulDirectAddProduct;
        directAddButton.disabled = true;
        directAddButton.textContent = "Adding";

        try {
          const detail = await loadPrintfulProduct(productId);
          const added = addPrintfulSingleOptionProduct(productId, detail);
          directAddButton.disabled = false;
          directAddButton.textContent = added ? "Add Another" : "Choose Options";

          if (!added) {
            renderPrintfulVariantPicker(productId, detail);
          }
        } catch (error) {
          directAddButton.disabled = false;
          directAddButton.textContent = "Try Again";
        }
      }

      if (shippingButton) {
        const form = shippingButton.closest("#printful-draft-order-form");

        if (form) {
          estimatePrintfulShipping(form);
        }
      }

      if (removeButton) {
        const index = Number.parseInt(removeButton.dataset.printfulRemoveCart, 10);
        printfulMerchState.cart.splice(index, 1);
        resetPrintfulCheckoutState();
        persistPrintfulCart();
        renderPrintfulCart();
      }

      if (cartQtyButton) {
        const index = Number.parseInt(cartQtyButton.dataset.printfulCartQty, 10);
        const step = Number.parseInt(cartQtyButton.dataset.printfulCartQtyStep, 10) || 0;
        const item = printfulMerchState.cart[index];

        if (item) {
          item.quantity = Math.min(Math.max((Number.parseInt(item.quantity, 10) || 1) + step, 1), 10);
          resetPrintfulCheckoutState();
          persistPrintfulCart();
          renderPrintfulCart();
        }
      }
    });

    panel.addEventListener("submit", (event) => {
      const addForm = event.target.closest("[data-printful-add-form]");
      const draftOrderForm = event.target.closest("#printful-draft-order-form");

      if (addForm) {
        event.preventDefault();
        addPrintfulCartItem(addForm.dataset.printfulAddForm, addForm);
      }

      if (draftOrderForm) {
        event.preventDefault();
        submitPrintfulDraftOrder(draftOrderForm);
      }
    });

    panel.addEventListener("change", (event) => {
      const shippingSelect = event.target.closest("#printful-shipping-select");
      const shippingField = event.target.closest("[data-printful-shipping-field]");

      if (shippingSelect) {
        printfulMerchState.selectedShipping = text(shippingSelect.value, "");
      }

      if (shippingField && printfulMerchState.shippingRates.length) {
        const form = shippingField.closest("#printful-draft-order-form");
        const recipient = form ? printfulShippingRecipientFromForm(form) : null;

        if (printfulShippingRecipientKey(recipient) !== printfulMerchState.shippingEstimateKey) {
          invalidatePrintfulShippingEstimate("Shipping destination changed. Estimate shipping again.");
        }
      }
    });

    panel.addEventListener("input", (event) => {
      const shippingField = event.target.closest("[data-printful-shipping-field]");

      if (shippingField && printfulMerchState.shippingRates.length) {
        const form = shippingField.closest("#printful-draft-order-form");
        const recipient = form ? printfulShippingRecipientFromForm(form) : null;

        if (printfulShippingRecipientKey(recipient) !== printfulMerchState.shippingEstimateKey) {
          invalidatePrintfulShippingEstimate("Shipping destination changed. Estimate shipping again.");
        }
      }
    });

    if (!printfulMerchState.controlsBound) {
      const search = document.getElementById("printful-product-search");
      const sort = document.getElementById("printful-product-sort");

      printfulMerchState.controlsBound = true;

      if (search) {
        search.addEventListener("input", (event) => {
          printfulMerchState.filters.query = event.target.value.trim().toLowerCase();
          renderPrintfulStore();
        });
      }

      if (sort) {
        sort.addEventListener("change", (event) => {
          printfulMerchState.filters.sort = event.target.value;
          renderPrintfulStore();
        });
      }
    }

    if (!printfulMerchState.popstateBound) {
      printfulMerchState.popstateBound = true;
      window.addEventListener("popstate", () => {
        const params = new URLSearchParams(window.location.search);
        printfulMerchState.selectedProductId = text(params.get("product"), "");
        printfulMerchState.mode = normalizePrintfulMode(params.get("view"));
        if (printfulMerchState.selectedProductId) {
          const selected = printfulProductById(printfulMerchState.selectedProductId);

          if (merchCatalogModeEnabled() && selected && selected.source === "printful-catalog") {
            printfulMerchState.mode = "catalog";
          }
        }
        if (!printfulMerchState.selectedProductId) {
          setMerchCollectionMeta();
        }
        renderPrintfulProductDetail(printfulMerchState.selectedProductId);
        renderPrintfulStore();
      });
    }
  }

  async function initPrintfulMerchStore(panel) {
    const grid = document.getElementById("printful-store-grid");
    const status = document.getElementById("printful-store-status");

    if (!grid || printfulMerchState.initialized) {
      return;
    }

    printfulMerchState.initialized = true;
    bindPrintfulMerchEvents(panel);
    restorePrintfulCart();
    renderPrintfulCart();

    try {
      await loadMerchMetadata();
      renderPrintfulCart();
      const shouldLoadCatalog = merchCatalogModeEnabled();
      const [storeResult, catalogResult] = await Promise.allSettled([
        merchApiJson("api/merch/products?status=synced"),
        shouldLoadCatalog ? merchApiJson("api/merch/catalog") : Promise.resolve({ products: [], categories: [], categoryTree: [] })
      ]);
      const storeResponse = storeResult.status === "fulfilled" ? storeResult.value : {};
      const catalogResponse = catalogResult.status === "fulfilled" ? catalogResult.value : {};
      const syncProducts = Array.isArray(storeResponse.products)
        ? storeResponse.products.map((product, index) => enrichPrintfulProduct(product, index))
        : [];
      const catalogProducts = Array.isArray(catalogResponse.products)
        ? catalogResponse.products.map((product, index) => enrichPrintfulProduct(product, index))
        : [];
      const products = [...syncProducts, ...catalogProducts];
      const storeUnavailable = storeResult.status === "rejected" && !syncProducts.length;
      const catalogUnavailable = catalogResult.status === "rejected" && shouldLoadCatalog && !catalogProducts.length;

      if (!products.length && (storeUnavailable || catalogUnavailable)) {
        throw storeResult.reason || catalogResult.reason;
      }

      printfulMerchState.syncProducts = syncProducts;
      printfulMerchState.catalogProducts = catalogProducts;
      printfulMerchState.categories = Array.isArray(catalogResponse.categories) ? catalogResponse.categories : [];
      printfulMerchState.categoryTree = Array.isArray(catalogResponse.categoryTree) ? catalogResponse.categoryTree : [];
      printfulMerchState.products = products;
      const params = new URLSearchParams(window.location.search);
      printfulMerchState.selectedProductId = text(params.get("product"), "");
      printfulMerchState.mode = normalizePrintfulMode(params.get("view"));

      if (shouldLoadCatalog && printfulMerchState.mode !== "catalog" && !syncProducts.length && catalogProducts.length) {
        printfulMerchState.mode = "catalog";
      }

      if (printfulMerchState.selectedProductId) {
        const selected = printfulProductById(printfulMerchState.selectedProductId);

        if (shouldLoadCatalog && selected && selected.source === "printful-catalog") {
          printfulMerchState.mode = "catalog";
        }
      }

      renderPrintfulStats(products);
      renderPrintfulHeroShowcase(products);
      renderPrintfulStore();
      renderPrintfulProductDetail(printfulMerchState.selectedProductId);
      trackPrintfulStoreView();
      Promise.all(featuredPrintfulProducts(syncProducts).map((product) => loadPrintfulProduct(String(product.id))))
        .then(() => {
          if (isPrintfulFeaturedMode()) {
            renderPrintfulStore();
          }
        })
        .catch(() => {});

      if (printfulMerchState.selectedProductId) {
        const detailNode = document.getElementById("printful-product-detail");

        if (detailNode) {
          detailNode.scrollIntoView({ block: "start", behavior: "auto" });
        }
      }
    } catch (error) {
      if (status) {
        status.textContent = error.message;
      }

      grid.innerHTML = '<article class="empty-card"><p>Merch inventory is unavailable in this environment.</p></article>';
    }
  }

  function setMerchCollectionMeta() {
    setRouteMeta({
      title: "Merch Desk | Pawn Island Records",
      description: "Browse curated Pawn Island Records artist goods, estimate shipping, and request an invoice before production begins.",
      canonicalPath: "merch.html",
      image: "assets/brand/pawnisland-1200.jpg",
      robots: "noindex,follow",
      structuredData: graphStructuredData([
        {
          "@type": "CollectionPage",
          "@id": siteUrl("merch.html#merch"),
          name: "Pawn Island Records Merch Desk",
          url: siteUrl("merch.html"),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: []
          }
        }
      ])
    });
  }

  function renderMerch() {
    const panel = document.querySelector(".merch-panel");
    const intro = document.getElementById("merch-intro");
    const statsNode = document.getElementById("merch-stats");
    const supportLink = document.getElementById("merch-support-link");
    const support = socialLinks().find((link) => link.key === "tiptopjar");

    setMerchCollectionMeta();

    if (supportLink && support) {
      supportLink.href = support.url;
      supportLink.target = "_blank";
      supportLink.rel = "noreferrer";
    }

    if (intro) {
      intro.textContent = "Curated artist tees, desk mats, and carry goods. Pick options, estimate shipping, and request an invoice before anything goes to production.";
    }

    if (statsNode) {
      statsNode.innerHTML = `
        <dl>
          <div>
            <dt>Desk</dt>
            <dd>Loading</dd>
          </div>
          <div>
            <dt>Browse by</dt>
            <dd>Type</dd>
          </div>
          <div>
            <dt>Display</dt>
            <dd>Product</dd>
          </div>
        </dl>
      `;
    }

    initPrintfulMerchStore(panel);
    preservePreviewLinks(panel);
  }

  function hydrateArtwork() {
    if (ui && ui.hydrateArtwork) {
      ui.hydrateArtwork(document);
    }

    hydrateMediaEmbeds(document);
  }

  function init() {
    syncViewportHeight();
    renderStandaloneHeader();
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
    } else if (page === "merch") {
      renderMerch();
    } else if (page === "connect") {
      renderConnect();
    } else if (page === "about") {
      renderAbout();
    }

    preservePreviewLinks(document);
    hydrateArtwork();
    window.addEventListener("resize", syncViewportHeight);
    window.addEventListener("orientationchange", syncViewportHeight);
  }

  init();
})();
