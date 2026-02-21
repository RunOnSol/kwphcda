const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

const extractVideoId = (url: URL): string | null => {
  if (url.hostname.includes("youtu.be")) {
    const id = url.pathname.slice(1).split("/")[0];
    return id || null;
  }

  if (url.pathname === "/watch") {
    return url.searchParams.get("v");
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const embedIndex = segments.findIndex((segment) => segment === "embed");
  if (embedIndex >= 0 && segments[embedIndex + 1]) {
    return segments[embedIndex + 1];
  }

  const shortsIndex = segments.findIndex((segment) => segment === "shorts");
  if (shortsIndex >= 0 && segments[shortsIndex + 1]) {
    return segments[shortsIndex + 1];
  }

  return null;
};

export const getYouTubeEmbedUrl = (value?: string | null): string | null => {
  if (!value) return null;

  try {
    const parsed = new URL(value.trim());
    if (!YOUTUBE_HOSTS.has(parsed.hostname)) {
      return null;
    }

    const videoId = extractVideoId(parsed);
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
};

export const isValidYouTubeUrl = (value?: string | null): boolean => {
  if (!value) return true;
  return getYouTubeEmbedUrl(value) !== null;
};
