"use client";
import { useEffect, useRef, useState } from "react";
import type { StreamingEpisode } from "../model/media";
import { MediaThumbnail } from "./MediaThumbnail";
export function EpisodeRail({
  episodes,
  id,
}: {
  episodes: StreamingEpisode[];
  id: number;
}) {
  const rowRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ previous: false, next: false });
  function updateEdges() {
    const row = rowRef.current;
    if (row)
      setEdges({
        previous: row.scrollLeft > 1,
        next: row.scrollLeft + row.clientWidth < row.scrollWidth - 1,
      });
  }
  useEffect(() => {
    updateEdges();
    const row = rowRef.current;
    const observer =
      typeof ResizeObserver !== "undefined" && row
        ? new ResizeObserver(updateEdges)
        : null;
    if (row) observer?.observe(row);
    return () => observer?.disconnect();
  }, [episodes]);
  function scroll(direction: number) {
    const row = rowRef.current;
    if (row)
      row.scrollBy({
        left: direction * row.clientWidth,
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")
          .matches
          ? "instant"
          : "smooth",
      });
  }
  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p role="status" className="text-xs text-neutral-300">
          {episodes.length} episode links available
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Previous episodes"
            aria-controls={`episodes-${id}`}
            disabled={!edges.previous}
            onClick={() => scroll(-1)}
            className="flex size-11 items-center justify-center rounded-full border border-white/30 text-xl text-white hover:bg-white/15 disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next episodes"
            aria-controls={`episodes-${id}`}
            disabled={!edges.next}
            onClick={() => scroll(1)}
            className="flex size-11 items-center justify-center rounded-full border border-white/30 text-xl text-white hover:bg-white/15 disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
      <ul
        ref={rowRef}
        id={`episodes-${id}`}
        tabIndex={0}
        aria-label="Available episodes"
        onScroll={updateEdges}
        className="-mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden p-2 pb-4 [scrollbar-width:thin]"
      >
        {episodes.map((episode, index) => (
          <li
            key={episode.url}
            className="w-[min(76vw,272px)] shrink-0 snap-start"
          >
            <a
              id={`episode-link-${id}-${index}`}
              href={episode.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${episode.title} — watch on ${episode.provider} (opens in a new tab)`}
              className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <MediaThumbnail src={episode.thumbnail} number={episode.number} />
              <span className="mt-2 block text-xs font-medium text-accent">
                {episode.provider} <span aria-hidden="true">↗</span>
              </span>
              <span className="mt-1 block text-sm leading-6 font-medium break-words">
                {episode.title}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
