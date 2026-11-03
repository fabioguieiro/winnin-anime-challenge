"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Anime } from "../model/anime";
import { ScoreBadge } from "./ScoreBadge";

export function AnimeCard({
  anime,
  prominent = false,
  detailsHref = `/anime/${anime.id}`,
}: {
  anime: Anime;
  prominent?: boolean;
  detailsHref?: string;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return (
    <article className="relative isolate min-h-[270px] min-w-0 overflow-hidden rounded-lg bg-neutral-800 text-white">
      {anime.image && failedImage !== anime.image ? (
        <Image
          src={anime.image}
          alt=""
          fill
          sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 33px), (max-width: 1366px) calc(25vw - 24.5px), 317px"
          loading={prominent ? "eager" : "lazy"}
          fetchPriority={prominent ? "high" : "auto"}
          className="object-cover"
          onError={() => setFailedImage(anime.image)}
        />
      ) : (
        <span className="absolute bottom-3 left-3 text-xs text-neutral-300">
          No image
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/5" />
      <div className="relative p-6 pb-16 sm:p-5 sm:pb-16 lg:p-7 lg:pb-16">
        <h2
          id={`anime-title-${anime.id}`}
          tabIndex={-1}
          className="text-2xl break-words leading-7 font-normal [text-shadow:0_1px_3px_#000]"
        >
          {anime.title}
        </h2>
        <ul aria-label="Genres" className="mt-2 flex flex-wrap gap-2">
          {anime.genres.map((genre) => (
            <li
              key={genre}
              className="rounded-sm bg-genre/90 px-2 py-0.5 text-xs leading-4 font-light"
            >
              {genre}
            </li>
          ))}
        </ul>
      </div>
      <div className="absolute right-2 bottom-2">
        <ScoreBadge score={anime.score} />
      </div>
      <Link
        href={detailsHref}
        prefetch={false}
        aria-label={`View details for ${anime.title}`}
        className="anime-card-link absolute inset-0 z-20 rounded-lg hover:bg-white/5"
      />
    </article>
  );
}
