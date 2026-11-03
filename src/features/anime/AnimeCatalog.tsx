"use client";

import { useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimeFilters } from "./components/AnimeFilters";
import { AnimeCard } from "./components/AnimeCard";
import { CatalogSkeleton } from "./components/CatalogSkeleton";
import { useAnimeQuery } from "./hooks/useAnimeQuery";
import { parseAnimeFilters, type AnimeFilters as Filters } from "./model/anime";
import { getDetailsHref } from "./model/navigation";
import { GraphQLRequestError } from "@/shared/api/graphql";

export function AnimeCatalog() {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const params = useSearchParams();
  const filters = parseAnimeFilters({
    search: params.get("search"),
    format: params.get("format"),
  });
  const query = useAnimeQuery(filters);
  const items = [
    ...new Map(
      query.data?.pages
        .flatMap((page) => page.items)
        .map((item) => [item.id, item]),
    ).values(),
  ];

  const retryRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);

  function focusResult(id?: number) {
    requestAnimationFrame(() => {
      if (id !== undefined)
        document.getElementById(`anime-link-${id}`)?.focus();
      else resetRef.current?.focus();
    });
  }

  async function loadMore() {
    const existingIds = new Set(items.map((item) => item.id));
    const result = await query.fetchNextPage();
    if (result.isError) {
      requestAnimationFrame(() => retryRef.current?.focus());
      return;
    }
    const nextItems = result.data?.pages.flatMap((page) => page.items) ?? [];
    focusResult(
      nextItems.find((item) => !existingIds.has(item.id))?.id ??
        nextItems[0]?.id,
    );
  }

  async function retry() {
    if (query.isFetchNextPageError) {
      await loadMore();
      return;
    }
    const result = await query.refetch();
    if (result.isSuccess) focusResult(result.data.pages[0]?.items[0]?.id);
    else requestAnimationFrame(() => retryRef.current?.focus());
  }

  function updateFilters(next: Filters) {
    const nextParams = new URLSearchParams(params.toString());
    if (next.search) nextParams.set("search", next.search);
    else nextParams.delete("search");
    if (next.format) nextParams.set("format", next.format);
    else nextParams.delete("format");
    const suffix = nextParams.toString();
    startTransition(() => {
      router.push(suffix ? `/?${suffix}` : "/", { scroll: false });
    });
  }

  return (
    <>
      <AnimeFilters
        filters={filters}
        onChange={updateFilters}
        pending={isNavigating}
      />
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={
          isNavigating || query.isPending ? "Loading anime" : undefined
        }
        className="sr-only"
      >
        {isNavigating || query.isPending
          ? "Loading anime..."
          : query.isFetchingNextPage
            ? "Loading more anime..."
            : query.isFetching
              ? "Updating anime..."
              : query.isError
                ? ""
                : items.length === 0
                  ? "No anime found."
                  : `${items.length} anime loaded.`}
      </p>
      {query.isPending ? (
        <CatalogSkeleton announce={false} />
      ) : (
        <>
          {items.length > 0 && (
            <div className="grid grid-cols-1 gap-x-4 gap-y-[21px] sm:grid-cols-2 lg:grid-cols-4">
              {items.map((anime, index) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  prominent={index === 0}
                  detailsHref={getDetailsHref(anime.id, filters)}
                />
              ))}
            </div>
          )}
          {query.isError && (
            <div
              role="alert"
              className="my-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center"
            >
              <p className="font-medium">
                {query.error instanceof GraphQLRequestError &&
                query.error.status === 429
                  ? "Too many requests. Please wait a moment and try again."
                  : query.isFetchNextPageError
                    ? "Could not load more anime. Previous results are still available."
                    : "Could not load anime. Please try again."}
              </p>
              <button
                type="button"
                className="mt-4 rounded-sm bg-brand px-5 py-2 text-sm text-white hover:bg-brand-dark disabled:opacity-60"
                disabled={query.isFetching}
                ref={retryRef}
                onClick={() => void retry()}
              >
                {query.isFetching ? "Retrying..." : "Try again"}
              </button>
            </div>
          )}
          {!query.isError && items.length === 0 && (
            <div className="py-20 text-center">
              <h2 className="text-xl font-medium">No anime found</h2>
              <p className="mt-2 text-neutral-600">
                Try another title or select a different format.
              </p>
              <button
                type="button"
                className="mt-5 text-brand underline underline-offset-4"
                ref={resetRef}
                onClick={() => {
                  document.getElementById("anime-search")?.focus();
                  updateFilters({ search: "", format: "" });
                }}
              >
                Clear filters
              </button>
            </div>
          )}
          {query.hasNextPage && !query.isFetchNextPageError && (
            <button
              type="button"
              disabled={query.isFetching}
              onClick={() => void loadMore()}
              className="mt-6 flex h-12 w-full items-center justify-center gap-6 rounded-lg bg-accent px-5 text-lg text-neutral-950 transition-colors hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
            >
              <span
                aria-hidden="true"
                className="text-3xl leading-none font-light"
              >
                +
              </span>
              {query.isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </>
  );
}
