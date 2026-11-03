"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GraphQLRequestError } from "@/shared/api/graphql";
import { useAnimeDetails } from "./hooks/useAnimeDetails";
import { getCatalogHref } from "./model/navigation";
import { FORMATS, parseFormat } from "./model/anime";
import { formatDate } from "./model/details";
import { ScoreBadge } from "./components/ScoreBadge";
import { DetailsSkeleton } from "./components/DetailsSkeleton";
import { Synopsis } from "./components/Synopsis";
import { WatchMedia } from "./components/WatchMedia";
import { WhereToWatch } from "./components/WhereToWatch";

const statuses: Record<string, string> = {
  FINISHED: "Finalizado",
  RELEASING: "Em exibição",
  NOT_YET_RELEASED: "Em breve",
  CANCELLED: "Cancelado",
  HIATUS: "Em pausa",
};
const seasons: Record<string, string> = {
  WINTER: "Inverno",
  SPRING: "Primavera",
  SUMMER: "Verão",
  FALL: "Outono",
};

function Artwork({
  src,
  sizes,
  prominent = false,
}: {
  src: string | null;
  sizes: string;
  prominent?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src)
    return (
      <span className="absolute inset-0 flex items-center justify-center text-sm text-neutral-300">
        Sem imagem
      </span>
    );
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      loading={prominent ? "eager" : "lazy"}
      fetchPriority={prominent ? "high" : "auto"}
      className="object-cover"
      onError={() => setFailed(src)}
    />
  );
}

export function AnimeDetails({ id }: { id: number }) {
  const params = useSearchParams();
  const backHref = getCatalogHref({
    search: params.get("search") ?? "",
    format: parseFormat(params.get("format")),
  });
  const query = useAnimeDetails(id);
  const anime = query.data;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const ready = query.isSuccess;
  const loadedId = anime?.id;
  useEffect(() => {
    if (ready) headingRef.current?.focus({ preventScroll: true });
  }, [ready, loadedId]);

  async function retry() {
    const result = await query.refetch();
    if (result.isError) requestAnimationFrame(() => retryRef.current?.focus());
  }

  return (
    <>
      <nav
        aria-label="Navegação do anime"
        className="mx-auto max-w-6xl px-4 sm:px-6"
      >
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-2 text-sm text-brand underline-offset-4 hover:underline"
        >
          <span aria-hidden="true">←</span> Voltar para os animes
        </Link>
      </nav>
      {query.isPending ? (
        <DetailsSkeleton />
      ) : query.isError ? (
        <section
          role="alert"
          className="mx-auto max-w-3xl px-6 py-20 text-center"
        >
          <h1 className="text-2xl font-medium">
            Não foi possível carregar os detalhes
          </h1>
          <p className="mt-3 text-neutral-600">
            {query.error instanceof GraphQLRequestError &&
            query.error.status === 429
              ? "Muitas buscas em pouco tempo. Aguarde um momento e tente novamente."
              : "Confira sua conexão e tente novamente."}
          </p>
          <button
            type="button"
            disabled={query.isFetching}
            ref={retryRef}
            onClick={() => void retry()}
            className="mt-6 min-h-11 rounded bg-brand px-6 py-2 text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {query.isFetching ? "Tentando..." : "Tentar novamente"}
          </button>
        </section>
      ) : !anime ? (
        <section className="px-6 py-20 text-center">
          <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-medium">
            Anime não encontrado
          </h1>
          <p className="mt-3 text-neutral-600">
            Este título não está disponível no catálogo.
          </p>
        </section>
      ) : (
        <article className="pb-12">
          <div
            className={`relative bg-brand-dark ${anime.banner ? "h-36" : "h-24 sm:h-28"}`}
          >
            {anime.banner && (
              <Artwork
                src={anime.banner}
                prominent
                sizes="(max-width:1366px) 100vw, 1366px"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="-mt-14 flex items-end gap-4 sm:gap-6">
              <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-800 shadow-lg sm:w-28">
                <Artwork
                  src={anime.image}
                  sizes="(max-width:639px) 96px, 112px"
                />
              </div>
              <div className="min-w-0 flex-1 pt-14">
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-3xl leading-tight font-medium break-words sm:text-3xl"
                >
                  {anime.title}
                </h1>
                {[
                  ...new Set(
                    [anime.englishTitle, anime.nativeTitle].filter(
                      (title): title is string =>
                        !!title && title !== anime.title,
                    ),
                  ),
                ].map((title) => (
                  <p
                    key={title}
                    className="mt-1 text-xs break-words text-neutral-600"
                  >
                    {title}
                  </p>
                ))}
                {anime.genres.length > 0 && (
                  <ul
                    aria-label="Gêneros"
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    {anime.genres.map((genre) => (
                      <li
                        key={genre}
                        className="rounded bg-brand/10 px-3 py-1 text-xs text-brand-dark"
                      >
                        {genre}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <ScoreBadge score={anime.score} />
                  <span className="text-sm text-neutral-600">Nota média</span>
                </div>
              </div>
            </div>
            <Synopsis id={anime.id} text={anime.synopsis} key={anime.id} />
            <WatchMedia id={anime.id} title={anime.title} key={anime.id} />
            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="min-w-0">
                <WhereToWatch providers={anime.providers} id={anime.id} />
              </div>
              <section
                aria-labelledby="information-heading"
                className="self-start rounded-lg border border-neutral-200 bg-neutral-50 p-5"
              >
                <h2 id="information-heading" className="text-xl font-medium">
                  Informações
                </h2>
                <dl className="mt-4 divide-y divide-neutral-200 text-sm">
                  {[
                    [
                      "Formato",
                      FORMATS.find((format) => format.value === anime.format)
                        ?.label ?? "Não informado",
                    ],
                    ["Status", statuses[anime.status ?? ""] ?? "Não informado"],
                    ["Episódios", anime.episodes ?? "A definir"],
                    [
                      "Duração por episódio",
                      anime.duration === null
                        ? "Não informada"
                        : `${anime.duration} min`,
                    ],
                    ["Início", formatDate(anime.startDate)],
                    ["Fim", formatDate(anime.endDate)],
                    [
                      "Temporada (Japão)",
                      anime.season && seasons[anime.season]
                        ? `${seasons[anime.season]}${anime.year ? ` de ${anime.year}` : ""}`
                        : (anime.year ?? "Não informada"),
                    ],
                    ["Estúdios", anime.studios.join(", ") || "Não informado"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between gap-4 py-3"
                    >
                      <dt className="text-neutral-600">{label}</dt>
                      <dd className="max-w-[60%] text-right font-medium break-words">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
