"use client";
import { useRef, useState } from "react";
import { GraphQLRequestError } from "@/shared/api/graphql";
import { useAnimeMedia } from "../hooks/useAnimeMedia";
import type { StreamingEpisode } from "../model/media";
import { MediaThumbnail } from "./MediaThumbnail";

function EpisodeGrid({
  episodes,
  id,
}: {
  episodes: StreamingEpisode[];
  id: number;
}) {
  const [visible, setVisible] = useState(12);
  return (
    <>
      <p role="status" className="mt-2 text-sm text-neutral-300">
        {Math.min(visible, episodes.length)} de {episodes.length} links de
        episódios
      </p>
      <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {episodes.slice(0, visible).map((episode, index) => (
          <li key={episode.url}>
            <a
              id={`episode-link-${id}-${index}`}
              href={episode.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${episode.title} — assistir em ${episode.provider} (abre em nova aba)`}
              className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <MediaThumbnail src={episode.thumbnail} number={episode.number} />
              <span className="mt-3 block text-xs font-medium tracking-wide text-accent">
                {episode.provider} <span aria-hidden="true">↗</span>
              </span>
              <span className="mt-1 block text-sm leading-6 font-medium break-words">
                {episode.title}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {visible < episodes.length && (
        <button
          type="button"
          className="mt-7 min-h-11 w-full rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white hover:bg-white/20"
          onClick={() => {
            const firstNew = visible;
            setVisible(visible + 12);
            requestAnimationFrame(() =>
              document
                .getElementById(`episode-link-${id}-${firstNew}`)
                ?.focus(),
            );
          }}
        >
          Mostrar mais episódios
        </button>
      )}
    </>
  );
}

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
      className="mt-10 rounded-2xl bg-neutral-950 p-5 text-white sm:p-8"
    >
      <p className="text-xs font-medium tracking-[0.18em] text-accent uppercase">
        Sua próxima sessão
      </p>
      <h2
        id="watch-content-heading"
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 text-2xl font-medium sm:text-3xl"
      >
        Explore e dê o play
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-300">
        Escolha um episódio para abrir no provedor. O catálogo informado pelo
        AniList pode ser parcial; disponibilidade e assinatura variam por
        região.
      </p>
      {query.isPending ? (
        <div role="status" className="mt-6">
          <p className="text-sm text-neutral-300">
            Carregando episódios e trailer...
          </p>
          <div
            aria-hidden="true"
            className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-video rounded-xl bg-white/10 motion-safe:animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : query.isError ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-white/20 p-5"
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
          {query.data.trailer && (
            <div className="mt-8 border-b border-white/15 pb-8">
              <h3 className="text-xl font-medium">Trailer</h3>
              <a
                href={query.data.trailer.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Assistir ao trailer em ${query.data.trailer.provider} (abre em nova aba)`}
                className="group mt-4 grid items-center gap-6 rounded-xl border border-white/15 bg-white/5 p-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:grid-cols-2"
              >
                <MediaThumbnail src={query.data.trailer.thumbnail} trailer />
                <span className="block py-2 sm:p-4">
                  <span className="block text-xs font-medium tracking-wide text-accent">
                    {query.data.trailer.provider}
                  </span>
                  <span className="mt-3 block text-xl leading-8 font-medium break-words sm:text-2xl">
                    Trailer de {title}
                  </span>
                  <span className="mt-4 inline-flex min-h-11 items-center gap-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-neutral-950">
                    Assistir ao trailer <span aria-hidden="true">↗</span>
                  </span>
                  <span className="mt-3 block text-xs text-neutral-300">
                    Abre em nova aba no provedor
                  </span>
                </span>
              </a>
            </div>
          )}
          <h3 className="mt-8 text-xl font-medium">Episódios</h3>
          {query.data.episodes.length ? (
            <EpisodeGrid episodes={query.data.episodes} id={id} key={id} />
          ) : (
            <p className="mt-3 text-sm leading-7 text-neutral-300">
              O AniList ainda não informou links de episódios para este título.
              Confira as opções em Onde assistir.
            </p>
          )}
        </>
      )}
    </section>
  );
}
