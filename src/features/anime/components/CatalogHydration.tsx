"use client";

import {
  HydrationBoundary,
  useQueryClient,
  type DehydratedState,
} from "@tanstack/react-query";
import { useMemo, type ReactNode } from "react";
import { GraphQLRequestError } from "@/shared/api/graphql";

export function CatalogHydration({
  state,
  children,
}: {
  state: DehydratedState;
  children: ReactNode;
}) {
  const client = useQueryClient();
  const initialState = useMemo(
    () => ({
      ...state,
      queries: state.queries
        // A fresh page-one snapshot must not discard pages already loaded in the browser.
        // Existing queries keep their usual freshness and refetch behavior.
        .filter(
          (query) => client.getQueryState(query.queryKey)?.data === undefined,
        )
        .map((query) => {
          const snapshot = query.state.error;
          if (!snapshot) return query;
          const status =
            "status" in snapshot && typeof snapshot.status === "number"
              ? snapshot.status
              : undefined;
          const error = new GraphQLRequestError(snapshot.message, status);
          return {
            ...query,
            state: { ...query.state, error, fetchFailureReason: error },
          };
        }),
    }),
    [client, state],
  );

  return <HydrationBoundary state={initialState}>{children}</HydrationBoundary>;
}
