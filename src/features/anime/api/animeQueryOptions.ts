import { infiniteQueryOptions } from "@tanstack/react-query";
import { fetchAnime } from "./fetchAnime";
import type { AnimeFilters } from "../model/anime";

export function animeQueryOptions(filters: AnimeFilters) {
  return infiniteQueryOptions({
    queryKey: ["anime", filters] as const,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => fetchAnime(filters, pageParam, signal),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });
}
