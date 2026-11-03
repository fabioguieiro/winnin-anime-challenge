import { GraphQLRequestError, requestGraphQL } from "@/shared/api/graphql";
import {
  plainSynopsis,
  safeExternalUrl,
  type AnimeDetailsData,
  type FuzzyDate,
  type StreamingProvider,
} from "../model/details";

export const ANIME_DETAILS_QUERY = `
  query AnimeDetails($id: Int!) {
    Media(id: $id, type: ANIME, isAdult: false) {
      id
      title { romaji english native }
      description(asHtml: false)
      bannerImage
      coverImage { extraLarge }
      genres
      averageScore
      format
      status
      season
      seasonYear
      episodes
      duration
      startDate { year month day }
      endDate { year month day }
      studios(isMain: true) { nodes { name } }
      externalLinks { url site type isDisabled icon color }
    }
  }
`;

type DetailsResponse = {
  Media: {
    id: number;
    title: {
      romaji: string | null;
      english: string | null;
      native: string | null;
    } | null;
    description: string | null;
    bannerImage: string | null;
    coverImage: { extraLarge: string | null } | null;
    genres: (string | null)[] | null;
    averageScore: number | null;
    format: string | null;
    status: string | null;
    season: string | null;
    seasonYear: number | null;
    episodes: number | null;
    duration: number | null;
    startDate: FuzzyDate;
    endDate: FuzzyDate;
    studios: { nodes: ({ name: string } | null)[] | null } | null;
    externalLinks:
      | ({
          url: string | null;
          site: string;
          type: string | null;
          isDisabled: boolean | null;
          icon: string | null;
          color: string | null;
        } | null)[]
      | null;
  } | null;
};

export async function fetchAnimeDetails(
  id: number,
  signal?: AbortSignal,
): Promise<AnimeDetailsData | null> {
  let response: DetailsResponse;
  try {
    response = await requestGraphQL<DetailsResponse>(
      ANIME_DETAILS_QUERY,
      { id },
      signal,
    );
  } catch (error) {
    if (error instanceof GraphQLRequestError && error.status === 404)
      return null;
    throw error;
  }
  const media = response.Media;
  if (!media) return null;
  const providers: StreamingProvider[] = [];
  const seen = new Set<string>();
  for (const link of media.externalLinks ?? []) {
    if (!link || link.type !== "STREAMING" || link.isDisabled) continue;
    const url = safeExternalUrl(link.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const icon = safeExternalUrl(link.icon);
    providers.push({
      name: link.site || new URL(url).hostname,
      url,
      icon: icon?.startsWith("https://") ? icon : null,
      color: /^#[0-9a-f]{6}$/i.test(link.color ?? "") ? link.color : null,
    });
  }
  return {
    id: media.id,
    title:
      media.title?.romaji ||
      media.title?.english ||
      media.title?.native ||
      "Title unavailable",
    englishTitle: media.title?.english || null,
    nativeTitle: media.title?.native || null,
    image: media.coverImage?.extraLarge || null,
    banner: media.bannerImage || null,
    genres: (media.genres ?? []).filter(
      (genre): genre is string => genre !== null,
    ),
    score: media.averageScore,
    synopsis: plainSynopsis(media.description),
    format: media.format,
    status: media.status,
    season: media.season,
    year: media.seasonYear,
    episodes: media.episodes,
    duration: media.duration,
    startDate: media.startDate,
    endDate: media.endDate,
    studios: (media.studios?.nodes ?? []).flatMap((studio) =>
      studio ? [studio.name] : [],
    ),
    providers,
  };
}
