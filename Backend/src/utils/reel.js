const ALLOWED_HOSTS = ["pixabay.com"];

const isAllowedUrl = (value) => {
  try {
    const { protocol, hostname } = new URL(value);
    if (protocol !== "https:") return false;
    return ALLOWED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
};

const sanitizeReel = (input) => {
  if (!input || typeof input !== "object") return null;
  const { externalId, videoUrl, posterUrl, pageUrl, duration, credit } = input;

  if (!externalId || !isAllowedUrl(videoUrl)) return null;

  return {
    source: "pixabay",
    externalId: String(externalId),
    videoUrl,
    posterUrl: isAllowedUrl(posterUrl) ? posterUrl : "",
    pageUrl: isAllowedUrl(pageUrl) ? pageUrl : "",
    duration: Number(duration) || 0,
    credit: {
      name: String(credit?.name || "Pixabay").slice(0, 80),
      url: isAllowedUrl(credit?.url) ? credit.url : "",
    },
  };
};

module.exports = { isAllowedUrl, sanitizeReel };