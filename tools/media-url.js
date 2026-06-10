const siteOrigin = "https://www.pawnislandrecords.com";
const defaultMediaOrigin = "https://media.pawnislandrecords.com";

function text(value) {
  return String(value || "").trim();
}

function trimTrailingSlash(value) {
  return text(value).replace(/\/+$/g, "");
}

function configuredMediaOrigin() {
  return trimTrailingSlash(process.env.PAWN_MEDIA_ORIGIN || "");
}

function mediaObjectKey(value) {
  const raw = text(value);

  if (!raw || /^(?:data:|blob:|mailto:|tel:|javascript:)/i.test(raw)) {
    return "";
  }

  let pathname = raw;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      const origin = trimTrailingSlash(url.origin);

      if (origin === configuredMediaOrigin()) {
        return url.pathname.replace(/^\/+/, "");
      }

      pathname = url.pathname;
    } catch (error) {
      return "";
    }
  }

  const cleanPath = pathname.split(/[?#]/)[0].replace(/^\/+/, "");
  return cleanPath.startsWith("media/") ? cleanPath.slice("media/".length) : "";
}

function mediaUrl(value) {
  const key = mediaObjectKey(value);

  if (!key) {
    return text(value);
  }

  const mediaOrigin = configuredMediaOrigin();
  return mediaOrigin ? new URL(key, `${mediaOrigin}/`).toString() : text(value);
}

function publicAssetUrl(value) {
  const raw = text(value);
  const media = mediaUrl(raw);

  if (media && media !== raw) {
    return media;
  }

  if (!raw) {
    return `${siteOrigin}/`;
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  return new URL(raw.replace(/^\/+/, ""), `${siteOrigin}/`).toString();
}

module.exports = {
  defaultMediaOrigin,
  siteOrigin,
  configuredMediaOrigin,
  mediaObjectKey,
  mediaUrl,
  publicAssetUrl
};
