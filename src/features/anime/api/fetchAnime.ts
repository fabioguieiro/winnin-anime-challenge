import { requestGraphQL } from "@/shared/api/graphql";
import type { AnimeFilters, AnimePage } from "../model/anime";

export const ANIME_QUERY = `
  query AnimeCatalog($page: Int!, $search: String, $format: MediaFormat, $sort: [MediaSort!]!) {
    Page(page: $page, perPage: 12) {
      pageInfo { currentPage hasNextPage }
      media(type: ANIME, isAdult: false, search: $search, format: $format,
            sort: $sort) {
        id
        title { romaji english native }
        coverImage { extraLarge }
        genres
        averageScore
      }
    }
  }
`;

type AnimeResponse = {
  Page: {
    pageInfo: {
      currentPage: number | null;
      hasNextPage: boolean | null;
    } | null;
    media:
      | ({
          id: number;
          title: {
            romaji: string | null;
            english: string | null;
            native: string | null;
          } | null;
          coverImage: { extraLarge: string | null } | null;
          genres: (string | null)[] | null;
          averageScore: number | null;
        } | null)[]
      | null;
  } | null;
};

export async function fetchAnime(
  filters: AnimeFilters,
  page: number,
  signal?: AbortSignal,
): Promise<AnimePage> {
  const result = await requestGraphQL<AnimeResponse>(
    ANIME_QUERY,
    {
      page,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.format ? { format: filters.format } : {}),
      sort:
        filters.sort === "score"
          ? ["SCORE_DESC", "ID_DESC"]
          : ["POPULARITY_DESC", "ID_DESC"],
    },
    signal,
  );
  if (!result.Page) throw new Error("AniList returned no catalog.");
  return {
    page: result.Page.pageInfo?.currentPage ?? page,
    hasNextPage: result.Page.pageInfo?.hasNextPage === true,
    items: (result.Page.media ?? []).flatMap((item) =>
      item
        ? [
            {
              id: item.id,
              title:
                item.title?.romaji ||
                item.title?.english ||
                item.title?.native ||
                "Title unavailable",
              image: item.coverImage?.extraLarge || null,
              genres: (item.genres ?? []).filter(
                (genre): genre is string => genre !== null,
              ),
              score: item.averageScore,
            },
          ]
        : [],
    ),
  };
}
