import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchAnime } from "../api/fetchAnime";
import type { AnimeFilters } from "../model/anime";

export function useAnimeQuery(filters: AnimeFilters) {
  return useInfiniteQuery({
    queryKey: ["anime", filters],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => fetchAnime(filters, pageParam, signal),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });
}
