"use client";
import { useRef } from "react";
import { GraphQLRequestError } from "@/shared/api/graphql";
import { useAnimeMedia } from "../hooks/useAnimeMedia";
import { EpisodeRail } from "./EpisodeRail";
import { TrailerPlayer } from "./TrailerPlayer";
export function WatchMedia({
  id,
  title = "este anime",
}: {
  id: number;
  title?: string;
}) {
  const query = useAnimeMedia(id);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  async function retry() {
    const result = await query.refetch();
    requestAnimationFrame(() => {
      if (result.isError) retryRef.current?.focus();
      else headingRef.current?.focus();
    });
  }
  return (
    <section
      id="watch-content"
      tabIndex={-1}
      aria-labelledby="watch-content-heading"
      className="mt-4 rounded-2xl bg-neutral-950 p-4 text-white sm:p-5"
    >
      <h2
        id="watch-content-heading"
        ref={headingRef}
        tabIndex={-1}
        className="text-xl font-medium"
      >
        Episódios
      </h2>

      {query.isPending ? (
        <div role="status" className="mt-3">
          <p className="text-sm text-neutral-300">
            Carregando episódios e trailer...
          </p>
          <div aria-hidden="true" className="mt-3 flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-video w-64 shrink-0 rounded-xl bg-white/10 motion-safe:animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : query.isError ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-white/20 p-4"
        >
          <p>
            {query.error instanceof GraphQLRequestError &&
            query.error.status === 429
              ? "Muitas solicitações. Aguarde um momento para carregar os episódios."
              : "Não foi possível carregar episódios e trailer."}
          </p>
          <button
            type="button"
            disabled={query.isFetching}
            ref={retryRef}
            className="mt-4 min-h-11 rounded bg-accent px-5 py-2 text-sm font-medium text-neutral-950 disabled:opacity-60"
            onClick={() => void retry()}
          >
            {query.isFetching
              ? "Tentando..."
              : "Tentar carregar episódios novamente"}
          </button>
        </div>
      ) : (
        <>
          {query.data.episodes.length ? (
            <EpisodeRail episodes={query.data.episodes} id={id} key={id} />
          ) : (
            <p className="mt-3 text-sm leading-7 text-neutral-300">
              O AniList ainda não informou links de episódios para este título.
              Confira as opções em Onde assistir.
            </p>
          )}
          <p className="mt-2 text-xs leading-5 text-neutral-300">
            Abra no provedor. Catálogo parcial; disponibilidade e assinatura
            variam por região.
          </p>
          {query.data.trailer && (
            <TrailerPlayer
              trailer={query.data.trailer}
              title={title}
              key={`${id}-${query.data.trailer.url}`}
            />
          )}
        </>
      )}
    </section>
  );
}
