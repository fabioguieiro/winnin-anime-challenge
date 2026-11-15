import "server-only";

import { dehydrate } from "@tanstack/react-query";
import { createQueryClient } from "@/shared/api/queryClient";
import { GraphQLRequestError } from "@/shared/api/graphql";
import { animeQueryOptions } from "../api/animeQueryOptions";
import { fetchAnime } from "../api/fetchAnime";
import type { AnimeFilters } from "../model/anime";

export async function prefetchCatalog(filters: AnimeFilters) {
  const client = createQueryClient();
  try {
    await client
      .infiniteQuery({
        ...animeQueryOptions(filters),
        queryFn: ({ pageParam, signal }) =>
          fetchAnime(
            filters,
            pageParam,
            AbortSignal.any([signal, AbortSignal.timeout(8_000)]),
          ),
      })
      .catch(() => {
        // Keep the failed query in the cache so its error can be hydrated.
      });
    const state = dehydrate(client, { shouldDehydrateQuery: () => true });
    return {
      ...state,
      queries: state.queries.map((query) => {
        if (!query.state.error) return query;
        // Send only a safe, plain error snapshot across the server boundary.
        const error = {
          name: "GraphQLRequestError",
          message: "Unable to load the anime catalog.",
          status:
            query.state.error instanceof GraphQLRequestError
              ? query.state.error.status
              : undefined,
        };
        return {
          ...query,
          state: { ...query.state, error, fetchFailureReason: error },
        };
      }),
    };
  } finally {
    client.clear();
  }
}
