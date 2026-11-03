import { GraphQLRequestError, requestGraphQL } from "@/shared/api/graphql";
import { safeExternalUrl } from "../model/details";
import {
  mapTrailer,
  safeThumbnail,
  type AnimeMedia,
  type StreamingEpisode,
} from "../model/media";
export const ANIME_MEDIA_QUERY = `
  query AnimeMedia($id: Int!) {
    Media(id: $id, type: ANIME, isAdult: false) {
      trailer { id site thumbnail }
      streamingEpisodes { title thumbnail url site }
    }
  }
`;
type MediaResponse = {
  Media: {
    trailer: {
      id: string | null;
      site: string | null;
      thumbnail: string | null;
    } | null;
    streamingEpisodes:
      | ({
          title: string | null;
          thumbnail: string | null;
          url: string | null;
          site: string | null;
        } | null)[]
      | null;
  } | null;
};
export async function fetchAnimeMedia(
  id: number,
  signal?: AbortSignal,
): Promise<AnimeMedia> {
  let response: MediaResponse;
  try {
    response = await requestGraphQL<MediaResponse>(
      ANIME_MEDIA_QUERY,
      { id },
      signal,
    );
  } catch (error) {
    if (error instanceof GraphQLRequestError && error.status === 404)
      return { episodes: [], trailer: null };
    throw error;
  }
  const episodes: StreamingEpisode[] = [];
  const seen = new Set<string>();
  for (const entry of response.Media?.streamingEpisodes ?? []) {
    if (!entry) continue;
    const url = safeExternalUrl(entry.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const title = entry.title?.trim() || "Untitled episode";
    const number = title.match(/^Episode\s+(\d+)\b/i)?.[1];
    episodes.push({
      title,
      url,
      provider: entry.site?.trim() || new URL(url).hostname,
      thumbnail: safeThumbnail(entry.thumbnail),
      number: number ? Number(number) : null,
    });
  }
  episodes.sort((a, b) => (a.number ?? Infinity) - (b.number ?? Infinity));
  return { episodes, trailer: mapTrailer(response.Media?.trailer ?? null) };
}
