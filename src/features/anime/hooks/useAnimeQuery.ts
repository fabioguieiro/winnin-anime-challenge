import { useInfiniteQuery } from "@tanstack/react-query";
import { animeQueryOptions } from "../api/animeQueryOptions";
import type { AnimeFilters } from "../model/anime";

export function useAnimeQuery(filters: AnimeFilters) {
  return useInfiniteQuery(animeQueryOptions(filters));
}
