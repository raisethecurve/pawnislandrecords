(function () {
  function currentData() {
    return window.PAWN_SITE_DATA || window.PAWN_PUBLIC_DATA || {
      label: {},
      artists: [],
      releases: [],
      merch: []
    };
  }

  const PLATFORM_DEFINITIONS = [
    {
      key: "spotify",
      labels: ["spotify"],
      name: "Spotify",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"></circle><path d="M7.4 9.06c3.92-1.02 7.9-.82 11.58.82" fill="none" stroke="#050812" stroke-linecap="round" stroke-width="1.8"></path><path d="M8.28 12.08c2.9-.78 5.86-.62 8.62.62" fill="none" stroke="#050812" stroke-linecap="round" stroke-width="1.6"></path><path d="M9.18 14.96c2.08-.48 4.12-.38 6.06.42" fill="none" stroke="#050812" stroke-linecap="round" stroke-width="1.4"></path></svg>'
    },
    {
      key: "apple-music",
      labels: ["apple music", "applemusic"],
      name: "Apple Music",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.36 4.4v9.62a2.78 2.78 0 1 1-1.48-2.48V7.34l6-1.44v7.04a2.78 2.78 0 1 1-1.48-2.48V4.4l-3.04.76z" fill="currentColor"></path></svg>'
    },
    {
      key: "youtube",
      labels: ["youtube"],
      name: "YouTube",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.08 7.2a2.8 2.8 0 0 0-1.96-1.98C17.4 4.76 12 4.76 12 4.76s-5.4 0-7.12.46A2.8 2.8 0 0 0 2.92 7.2C2.46 8.92 2.46 12 2.46 12s0 3.08.46 4.8a2.8 2.8 0 0 0 1.96 1.98c1.72.46 7.12.46 7.12.46s5.4 0 7.12-.46a2.8 2.8 0 0 0 1.96-1.98c.46-1.72.46-4.8.46-4.8s0-3.08-.46-4.8ZM10.12 15.18V8.82L15.64 12l-5.52 3.18Z" fill="currentColor"></path></svg>'
    },
    {
      key: "youtube-music",
      labels: ["youtube music", "youtubemusic"],
      name: "YouTube Music",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"></circle><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M11 9.6 15.2 12 11 14.4Z" fill="currentColor"></path></svg>'
    },
    {
      key: "bandcamp",
      labels: ["bandcamp"],
      name: "Bandcamp",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.72 6H19.8l-5.52 12H4.2L9.72 6Z" fill="currentColor"></path></svg>'
    },
    {
      key: "amazon-music",
      labels: ["amazon music", "amazonmusic"],
      name: "Amazon Music",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.46 6.22v8.22a2.12 2.12 0 1 1-1.22-1.92V8.14l4.92-1.16v5.56a2.12 2.12 0 1 1-1.22-1.92V6.22L8.46 6.8Z" fill="currentColor"></path><path d="M5.1 17.72c3.68 1.56 8.22 1.48 12-.24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.4"></path><path d="m16.7 16.4 1.9.18-.94 1.62" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"></path></svg>'
    },
    {
      key: "iheartradio",
      labels: ["iheartradio", "iheart radio", "iheart"],
      name: "iHeartRadio",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 5.6a3.2 3.2 0 0 1 4.8 2.76 3.2 3.2 0 0 1 4.8-2.76 3.54 3.54 0 0 1 0 5.02L12 15.4 7.2 10.62a3.54 3.54 0 0 1 0-5.02Z" fill="currentColor"></path><path d="M4.32 9.84a5.94 5.94 0 0 1 1.8-4.32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.45"></path><path d="M19.68 9.84a5.94 5.94 0 0 0-1.8-4.32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.45"></path><path d="M2.7 9.9a8.22 8.22 0 0 1 2.46-5.88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.25"></path><path d="M21.3 9.9a8.22 8.22 0 0 0-2.46-5.88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.25"></path><path d="M9.9 16.74h4.2v1.56H9.9zM10.44 18.3h3.12v2.46h-3.12z" fill="currentColor"></path></svg>'
    },
    {
      key: "pandora",
      labels: ["pandora"],
      name: "Pandora",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.24 4.2h6.34a5.46 5.46 0 0 1 0 10.92h-3.7v4.68H7.24V4.2Zm2.64 2.48v5.96h3.18a2.98 2.98 0 0 0 0-5.96H9.88Z" fill="currentColor"></path></svg>'
    },
    {
      key: "qqmusic",
      labels: ["qqmusic", "qq music"],
      name: "QQMusic",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.8" fill="none" stroke="currentColor" stroke-width="1.8"></circle><path d="M10.4 8.2v6.44a1.86 1.86 0 1 1-1-.32V9.1l4.44-1.04v5.16a1.86 1.86 0 1 1-1-.32V8.2l-2.44.56Z" fill="currentColor"></path><path d="M16.82 6.9c1.34 1.36 2.18 3.22 2.18 5.28 0 4.16-3.26 7.56-7.38 7.78" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.3"></path></svg>'
    },
    {
      key: "tidal",
      labels: ["tidal"],
      name: "Tidal",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 5.08 3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2Zm-6 6 3.2 3.2L6 17.48l-3.2-3.2L6 11.08Zm12 0 3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2Zm-6 6 3.2 3.2L12 23.48l-3.2-3.2 3.2-3.2Z" fill="currentColor"></path></svg>'
    },
    {
      key: "deezer",
      labels: ["deezer"],
      name: "Deezer",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15.8h2.4V19H3v-3.2Zm3.3-2.4h2.4V19H6.3v-5.6Zm3.3-3h2.4V19H9.6v-8.6Zm3.3 1.6h2.4V19h-2.4v-7Zm3.3-4.8h2.4V19h-2.4V7.2Z" fill="currentColor"></path></svg>'
    },
    {
      key: "soundcloud",
      labels: ["soundcloud"],
      name: "SoundCloud",
      svg:
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.76 10.32A4.5 4.5 0 0 1 17 12h.42a3.58 3.58 0 0 1 0 7.16H8.88a2.92 2.92 0 0 1-.12-5.84Z" fill="currentColor"></path><path d="M3.12 10.92h1.2v8.16h-1.2v-8.16Zm1.92-1.2h1.2v9.36h-1.2V9.72Zm-3.84 2.28h1.2v7.08H1.2V12Z" fill="currentColor"></path></svg>'
    }
  ];

  function normalizePlatformLabel(label) {
    return String(label || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function getPlatformDefinition(label) {
    const normalized = normalizePlatformLabel(label);

    return (
      PLATFORM_DEFINITIONS.find((definition) =>
        definition.labels.some((candidate) => normalizePlatformLabel(candidate) === normalized)
      ) || null
    );
  }

  function getLivePlatforms(release) {
    return (Array.isArray(release && release.platforms) ? release.platforms : [])
      .filter((platform) => String(platform && platform.url || "").trim())
      .map((platform) => {
        const definition = getPlatformDefinition(platform.label);

        return {
          label: definition ? definition.name : String(platform.label || "").trim(),
          key: definition ? definition.key : normalizePlatformLabel(platform.label).replace(/\s+/g, "-"),
          url: String(platform.url || "").trim(),
          icon: definition ? definition.svg : "",
          hasOfficialIcon: Boolean(definition)
        };
      });
  }

  function preferredYoutubeId(release) {
    const direct = String((release && release.youtubeId) || "").trim();

    if (direct) {
      return direct;
    }

    const tracks = Array.isArray(release && release.tracks) ? release.tracks : [];
    const match = tracks.find((track) => String(track && track.youtubeId || "").trim());

    return match ? String(match.youtubeId || "").trim() : "";
  }

  function spotifyEmbedUrl(url) {
    const text = String(url || "").trim();
    const match = text.match(/open\.spotify\.com\/(album|track|playlist|episode|show)\/([A-Za-z0-9]+)/i);

    if (!match) {
      return "";
    }

    return `https://open.spotify.com/embed/${match[1].toLowerCase()}/${match[2]}?utm_source=generator`;
  }

  function primaryEmbed(release) {
    const configuredUrl = String((release && release.primaryEmbedUrl) || "").trim();
    const configuredLabel = String((release && release.primaryEmbedLabel) || "").trim();

    if (configuredUrl) {
      return {
        label: configuredLabel || "Official audio",
        url: configuredUrl
      };
    }

    const spotify = getLivePlatforms(release).find((platform) => platform.key === "spotify");

    if (spotify) {
      const derivedUrl = spotifyEmbedUrl(spotify.url);

      if (derivedUrl) {
        return {
          label: "Spotify",
          url: derivedUrl
        };
      }
    }

    return {
      label: "",
      url: ""
    };
  }

  function getArtist(slug) {
    return currentData().artists.find((artist) => artist.slug === slug) || null;
  }

  function getRelease(slug) {
    return currentData().releases.find((release) => release.slug === slug) || null;
  }

  function getArtistReleases(artistSlug) {
    return currentData().releases.filter((release) => release.artist === artistSlug);
  }

  function getArtistMerch(artistSlug) {
    return currentData().merch.filter((item) => item.artist === artistSlug);
  }

  function getFeaturedRelease() {
    const data = currentData();

    return (
      getRelease(data.label.featuredReleaseSlug) ||
      data.releases[0] ||
      null
    );
  }

  function trackCount() {
    const data = currentData();
    return data.releases.reduce((total, release) => total + release.tracks.length, 0);
  }

  function downloadText(filename, content, type) {
    const blob = new Blob([content], {
      type: type || "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function getSearchParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function normalizeView(value) {
    const validViews = ["public", "industry", "press", "merch"];
    return validViews.includes(value) ? value : "public";
  }

  function updateViewParam(view) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("view", view);
    window.history.replaceState({}, "", nextUrl);
  }

  function normalizeHexColor(value, fallback) {
    const backup = String(fallback || "#d8c7a1").trim() || "#d8c7a1";
    const input = String(value || "").trim();
    const match = input.match(/^#?([a-f0-9]{3}|[a-f0-9]{6})$/i);

    if (!match) {
      return backup.startsWith("#") ? backup : `#${backup}`;
    }

    const normalized = match[1].length === 3
      ? match[1]
          .split("")
          .map((token) => token + token)
          .join("")
      : match[1];

    return `#${normalized.toLowerCase()}`;
  }

  function escapeAttribute(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeSvgText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function stringHash(value) {
    const text = String(value || "");
    let hash = 0;

    for (let index = 0; index < text.length; index += 1) {
      hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
    }

    return hash || 1;
  }

  function hashUnit(hash, offset) {
    const seed = (hash + 1) * (offset + 1) * 12.9898;
    const value = Math.sin(seed) * 43758.5453;
    return value - Math.floor(value);
  }

  function wrapArtworkTitle(value, maxChars, maxLines) {
    const text = String(value || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      return [];
    }

    const words = text.split(" ");
    const lines = [];
    let current = "";

    words.forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;

      if (candidate.length <= maxChars || !current) {
        current = candidate;
        return;
      }

      lines.push(current);
      current = word;
    });

    if (current) {
      lines.push(current);
    }

    const visible = lines.slice(0, maxLines);

    if (lines.length > maxLines) {
      visible[maxLines - 1] = `${visible[maxLines - 1].slice(0, Math.max(0, maxChars - 1)).trimEnd()}...`;
    } else if (visible.length) {
      const lastIndex = visible.length - 1;

      if (visible[lastIndex].length > maxChars) {
        visible[lastIndex] = `${visible[lastIndex].slice(0, Math.max(0, maxChars - 1)).trimEnd()}...`;
      }
    }

    return visible;
  }

  function hexToRgba(hex, alpha) {
    const normalized = normalizeHexColor(hex, "#d8c7a1").replace("#", "");
    const safe = normalized.length === 3
      ? normalized
          .split("")
          .map((value) => value + value)
          .join("")
      : normalized;
    const red = Number.parseInt(safe.slice(0, 2), 16);
    const green = Number.parseInt(safe.slice(2, 4), 16);
    const blue = Number.parseInt(safe.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function placeholderArtworkUrl(options) {
    const settings = options && typeof options === "object" ? options : {};
    const format = settings.format === "landscape" ? "landscape" : "square";
    const width = 1600;
    const height = format === "landscape" ? 900 : 1600;
    const accent = normalizeHexColor(settings.accent, "#d8c7a1");
    const title = String(
      settings.title ||
      settings.name ||
      settings.label ||
      (format === "landscape" ? "Untitled World" : "Untitled Release")
    ).trim();
    const subtitle = String(
      settings.subtitle ||
      settings.context ||
      (format === "landscape" ? "Immersive placeholder artwork" : "Placeholder artwork")
    ).trim();
    const hash = stringHash(`${title}|${subtitle}|${accent}|${format}`);
    const orbAX = (18 + hashUnit(hash, 1) * 60).toFixed(2);
    const orbAY = (12 + hashUnit(hash, 2) * 64).toFixed(2);
    const orbBX = (48 + hashUnit(hash, 3) * 38).toFixed(2);
    const orbBY = (18 + hashUnit(hash, 4) * 66).toFixed(2);
    const beamRotate = (-34 + hashUnit(hash, 5) * 68).toFixed(2);
    const beamY = (height * (0.16 + hashUnit(hash, 6) * 0.52)).toFixed(2);
    const beamHeight = (height * (0.12 + hashUnit(hash, 7) * 0.2)).toFixed(2);
    const curveOne = (height * (0.2 + hashUnit(hash, 8) * 0.22)).toFixed(2);
    const curveTwo = (height * (0.7 + hashUnit(hash, 9) * 0.12)).toFixed(2);
    const curveThree = (height * (0.48 + hashUnit(hash, 10) * 0.18)).toFixed(2);
    const lineStartX = (width * (0.58 + hashUnit(hash, 11) * 0.12)).toFixed(2);
    const lineGap = (28 + hashUnit(hash, 12) * 34).toFixed(2);
    const monoSize = format === "landscape" ? 320 : 420;
    const copyX = 92;
    const copyBaseY = format === "landscape" ? height - 188 : height - 238;
    const titleLines = wrapArtworkTitle(
      title,
      format === "landscape" ? 24 : 15,
      format === "landscape" ? 2 : 3
    );
    const titleLineHeight = format === "landscape" ? 94 : 112;
    const subtitleY = copyBaseY - (titleLines.length * titleLineHeight) - 32;
    const accentSoft = hexToRgba(accent, 0.28);
    const accentWash = hexToRgba(accent, 0.12);
    const mist = "rgba(255, 255, 255, 0.14)";
    const titleMarkup = titleLines
      .map(
        (line, index) => `
          <text
            x="${copyX}"
            y="${copyBaseY - ((titleLines.length - 1 - index) * titleLineHeight)}"
            fill="#f6f0e4"
            font-family="'Cormorant Garamond', Georgia, serif"
            font-size="${format === "landscape" ? 92 : 108}"
            font-weight="600"
            letter-spacing="${format === "landscape" ? "1.4" : "1.8"}"
          >
            ${escapeSvgText(line)}
          </text>
        `
      )
      .join("");
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttribute(`Placeholder artwork for ${title}`)}">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#040812" />
            <stop offset="54%" stop-color="#0b1220" />
            <stop offset="100%" stop-color="#02050c" />
          </linearGradient>
          <radialGradient id="orbA" cx="${orbAX}%" cy="${orbAY}%" r="48%">
            <stop offset="0%" stop-color="${accent}" stop-opacity="0.88" />
            <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="orbB" cx="${orbBX}%" cy="${orbBY}%" r="38%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.24" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
          <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="${format === "landscape" ? "42" : "56"}" />
          </filter>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bg)" />
        <rect width="${width}" height="${height}" fill="${accentWash}" />
        <g opacity="0.84" filter="url(#blur)">
          <circle cx="${width * 0.28}" cy="${height * 0.22}" r="${format === "landscape" ? 240 : 320}" fill="url(#orbA)" />
          <circle cx="${width * 0.76}" cy="${height * 0.18}" r="${format === "landscape" ? 180 : 240}" fill="url(#orbB)" />
        </g>
        <g opacity="0.2" transform="rotate(${beamRotate} ${width / 2} ${height / 2})">
          <rect x="${-width * 0.1}" y="${beamY}" width="${width * 1.24}" height="${beamHeight}" fill="${accent}" opacity="0.18" />
          <rect x="${-width * 0.08}" y="${Number(beamY) + Number(beamHeight) + 26}" width="${width * 1.16}" height="1.4" fill="#ffffff" opacity="0.28" />
          <rect x="${-width * 0.04}" y="${Number(beamY) - 34}" width="${width * 1.08}" height="1.4" fill="#ffffff" opacity="0.16" />
        </g>
        <g fill="none" stroke-linecap="round">
          <path d="M-40 ${curveOne} C ${width * 0.18} ${curveOne - 40}, ${width * 0.42} ${curveOne + 86}, ${width + 40} ${curveOne - 18}" stroke="${mist}" stroke-opacity="0.16" stroke-width="2" />
          <path d="M-40 ${curveTwo} C ${width * 0.14} ${curveTwo - 92}, ${width * 0.54} ${curveTwo + 26}, ${width + 40} ${curveTwo - 56}" stroke="${accentSoft}" stroke-opacity="0.42" stroke-width="3" />
          <path d="M${lineStartX} 0 L ${Number(lineStartX) + Number(lineGap)} ${height}" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.4" />
          <path d="M${Number(lineStartX) + Number(lineGap) * 1.4} 0 L ${Number(lineStartX) + Number(lineGap) * 2.1} ${height}" stroke="${accent}" stroke-opacity="0.22" stroke-width="1.2" />
          <path d="M-20 ${curveThree} C ${width * 0.24} ${curveThree + 34}, ${width * 0.52} ${curveThree - 68}, ${width + 20} ${curveThree + 22}" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1.4" />
        </g>
        <text
          x="${width - 86}"
          y="${format === "landscape" ? 148 : 178}"
          fill="rgba(255, 255, 255, 0.16)"
          font-family="'Cormorant Garamond', Georgia, serif"
          font-size="${monoSize}"
          font-weight="600"
          letter-spacing="6"
          text-anchor="end"
        >
          PI
        </text>
        <text
          x="${copyX}"
          y="${subtitleY}"
          fill="rgba(246, 240, 228, 0.74)"
          font-family="'Space Grotesk', 'Segoe UI', sans-serif"
          font-size="${format === "landscape" ? 24 : 26}"
          font-weight="600"
          letter-spacing="7"
          text-transform="uppercase"
        >
          ${escapeSvgText(subtitle.toUpperCase())}
        </text>
        ${titleMarkup}
      </svg>
    `.replace(/\s+/g, " ").trim();

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function resolveArtwork(source, options) {
    const src = String(source || "").trim();
    return src || placeholderArtworkUrl(options);
  }

  function bindArtworkFallback(image) {
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    if (image.dataset.artworkBound === "true") {
      return;
    }

    image.dataset.artworkBound = "true";
    image.decoding = "async";

    image.addEventListener("error", () => {
      const fallback = String(image.dataset.artworkFallback || "").trim();

      if (!fallback || image.dataset.artworkFallbackApplied === "true") {
        return;
      }

      image.dataset.artworkFallbackApplied = "true";
      image.src = fallback;
    });

    if (!String(image.getAttribute("src") || "").trim() && image.dataset.artworkFallback) {
      image.src = image.dataset.artworkFallback;
      return;
    }

    if (image.complete && image.naturalWidth === 0 && image.dataset.artworkFallback) {
      image.dataset.artworkFallbackApplied = "true";
      image.src = image.dataset.artworkFallback;
    }
  }

  function hydrateArtwork(root) {
    if (!root) {
      root = document;
    }

    if (root instanceof HTMLImageElement) {
      bindArtworkFallback(root);
      return;
    }

    if (typeof root.querySelectorAll !== "function") {
      return;
    }

    root.querySelectorAll("img[data-artwork-fallback]").forEach(bindArtworkFallback);
  }

  function artworkImageMarkup(options) {
    const settings = options && typeof options === "object" ? options : {};
    const fallback = placeholderArtworkUrl(settings);
    const src = resolveArtwork(settings.src, settings);
    const alt = String(settings.alt || settings.title || "Artwork").trim();
    const className = String(settings.className || "").trim();
    const loading = settings.loading === "eager" ? "eager" : "lazy";

    return `
      <img
        ${className ? `class="${escapeAttribute(className)}"` : ""}
        src="${escapeAttribute(src)}"
        alt="${escapeAttribute(alt)}"
        loading="${loading}"
        decoding="async"
        data-artwork-fallback="${escapeAttribute(fallback)}"
      />
    `.replace(/\s+/g, " ").trim();
  }

  function assignArtworkImage(image, options) {
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    const settings = options && typeof options === "object" ? options : {};
    const fallback = placeholderArtworkUrl(settings);

    image.dataset.artworkFallback = fallback;
    image.dataset.artworkFallbackApplied = "false";

    if (settings.alt !== undefined) {
      image.alt = String(settings.alt || "").trim();
    }

    if (settings.loading) {
      image.loading = settings.loading;
    }

    bindArtworkFallback(image);
    image.src = resolveArtwork(settings.src, settings);
  }

  function applyExperienceTheme(options) {
    const settings = options && typeof options === "object" ? options : {};
    const accent = normalizeHexColor(settings.accent, "#d8c7a1");
    const image = resolveArtwork(String(settings.image || "").trim(), {
      title: settings.title || settings.name || "Immersive world",
      subtitle: settings.subtitle || "Atmospheric artwork",
      accent,
      format: settings.format === "square" ? "square" : "landscape"
    });
    const backdropId = String(settings.backdropId || "").trim();
    const backdrop =
      (backdropId && document.getElementById(backdropId)) ||
      document.getElementById("page-backdrop") ||
      document.getElementById("release-backdrop");

    document.documentElement.style.setProperty("--release-accent", accent);
    document.documentElement.style.setProperty("--release-accent-soft", hexToRgba(accent, 0.18));
    document.documentElement.style.setProperty("--release-glow", hexToRgba(accent, 0.18));
    document.documentElement.style.setProperty(
      "--page-backdrop-image",
      image ? `url("${image}")` : "none"
    );

    if (backdrop) {
      backdrop.style.backgroundImage = image ? `url("${image}")` : "";
    }
  }

  function setMetaDescription(content) {
    const meta = document.querySelector('meta[name="description"]');

    if (!meta) {
      return;
    }

    meta.setAttribute("content", String(content || "").trim());
  }

  function revealOnScroll() {
    const items = document.querySelectorAll(".reveal");

    hydrateArtwork(document);

    if (!items.length) {
      requestAnimationFrame(() => document.body.classList.add("is-ready"));
      return;
    }

    if (typeof window.IntersectionObserver !== "function") {
      items.forEach((item) => item.classList.add("is-visible"));
      requestAnimationFrame(() => document.body.classList.add("is-ready"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.16
      }
    );

    items.forEach((item) => observer.observe(item));
    requestAnimationFrame(() => document.body.classList.add("is-ready"));
  }

  const api = {
    getArtist,
    getRelease,
    getArtistReleases,
    getArtistMerch,
    getFeaturedRelease,
    getPlatformDefinition,
    getLivePlatforms,
    preferredYoutubeId,
    primaryEmbed,
    trackCount,
    downloadText,
    getSearchParam,
    normalizeView,
    updateViewParam,
    normalizeHexColor,
    hexToRgba,
    placeholderArtworkUrl,
    resolveArtwork,
    hydrateArtwork,
    artworkImageMarkup,
    assignArtworkImage,
    applyExperienceTheme,
    setMetaDescription,
    revealOnScroll
  };

  Object.defineProperty(api, "data", {
    enumerable: true,
    get: currentData
  });

  window.PAWN_UI = api;
})();
