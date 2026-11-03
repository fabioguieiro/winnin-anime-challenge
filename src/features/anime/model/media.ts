import { safeExternalUrl } from "./details";
export type StreamingEpisode = {
  title: string;
  thumbnail: string | null;
  url: string;
  provider: string;
  number: number | null;
};
export type AnimeTrailer = {
  url: string;
  thumbnail: string | null;
  provider: string;
};
export type AnimeMedia = {
  episodes: StreamingEpisode[];
  trailer: AnimeTrailer | null;
};
export function safeThumbnail(value: string | null): string | null {
  const url = safeExternalUrl(value);
  return url?.startsWith("https://") ? url : null;
}
export function mapTrailer(
  value: {
    id: string | null;
    site: string | null;
    thumbnail: string | null;
  } | null,
): AnimeTrailer | null {
  const id = value?.id?.trim();
  const site = value?.site?.trim().toLowerCase();
  if (!id) return null;
  if (site === "youtube" && /^[a-zA-Z0-9_-]{11}$/.test(id))
    return {
      url: `https://www.youtube.com/watch?v=${id}`,
      provider: "YouTube",
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  if (site === "dailymotion" && /^[a-zA-Z0-9]{1,64}$/.test(id))
    return {
      url: `https://www.dailymotion.com/video/${id}`,
      provider: "Dailymotion",
      thumbnail: safeThumbnail(value?.thumbnail ?? null),
    };
  return null;
}

export function youtubeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const id = url.searchParams.get("v");
    if (
      url.origin !== "https://www.youtube.com" ||
      url.pathname !== "/watch" ||
      !id ||
      !/^[a-zA-Z0-9_-]{11}$/.test(id)
    )
      return null;
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`;
  } catch {
    return null;
  }
}
