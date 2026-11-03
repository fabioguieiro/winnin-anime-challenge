"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AnimeFilters } from "./components/AnimeFilters";
import { AnimeCard } from "./components/AnimeCard";
import { CatalogSkeleton } from "./components/CatalogSkeleton";
import { useAnimeQuery } from "./hooks/useAnimeQuery";
import { parseFormat, type AnimeFilters as Filters } from "./model/anime";
import { GraphQLRequestError } from "@/shared/api/graphql";

export function AnimeCatalog() {
  const router = useRouter();
  const params = useSearchParams();
  const filters: Filters = {
    search: (params.get("search") ?? "").trim(),
    format: parseFormat(params.get("format")),
  };
  const query = useAnimeQuery(filters);
  const items = [
    ...new Map(
      query.data?.pages
        .flatMap((page) => page.items)
        .map((item) => [item.id, item]),
    ).values(),
  ];

  function updateFilters(next: Filters) {
    const nextParams = new URLSearchParams(params.toString());
    if (next.search) nextParams.set("search", next.search);
    else nextParams.delete("search");
    if (next.format) nextParams.set("format", next.format);
    else nextParams.delete("format");
    const suffix = nextParams.toString();
    router.push(suffix ? `/?${suffix}` : "/", { scroll: false });
  }

  return (
    <>
      <AnimeFilters filters={filters} onChange={updateFilters} />
      {query.isPending ? (
        <CatalogSkeleton />
      ) : (
        <>
          <p role="status" className="sr-only">
            {items.length} animes carregados.
          </p>
          {items.length > 0 && (
            <div className="grid grid-cols-1 gap-x-4 gap-y-[21px] sm:grid-cols-2 lg:grid-cols-4">
              {items.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
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
                  ? "Muitas buscas em pouco tempo. Aguarde um momento e tente novamente."
                  : query.isFetchNextPageError
                    ? "Não foi possível carregar mais animes. Os resultados anteriores continuam disponíveis."
                    : "Não foi possível carregar os animes. Tente novamente."}
              </p>
              <button
                type="button"
                className="mt-4 rounded-sm bg-brand px-5 py-2 text-sm text-white hover:bg-brand-dark disabled:opacity-60"
                disabled={query.isFetching}
                onClick={() => {
                  if (query.isFetchNextPageError) void query.fetchNextPage();
                  else void query.refetch();
                }}
              >
                {query.isFetching ? "Tentando..." : "Tentar novamente"}
              </button>
            </div>
          )}
          {!query.isError && items.length === 0 && (
            <div className="py-20 text-center">
              <h2 className="text-xl font-medium">Nenhum anime encontrado</h2>
              <p className="mt-2 text-neutral-600">
                Tente outro nome ou selecione um formato diferente.
              </p>
              <button
                type="button"
                className="mt-5 text-brand underline underline-offset-4"
                onClick={() => updateFilters({ search: "", format: "" })}
              >
                Limpar filtros
              </button>
            </div>
          )}
          {query.hasNextPage && !query.isFetchNextPageError && (
            <button
              type="button"
              disabled={query.isFetching}
              onClick={() => void query.fetchNextPage()}
              className="mt-6 flex h-12 w-full items-center justify-center gap-6 rounded-lg bg-accent px-5 text-lg text-neutral-950 transition-colors hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
            >
              <span
                aria-hidden="true"
                className="text-3xl leading-none font-light"
              >
                +
              </span>
              {query.isFetchingNextPage ? "Carregando..." : "Ver mais"}
            </button>
          )}
        </>
      )}
    </>
  );
}
