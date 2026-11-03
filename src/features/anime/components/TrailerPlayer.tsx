"use client";
import { useEffect, useRef, useState } from "react";
import { youtubeEmbedUrl, type AnimeTrailer } from "../model/media";
import { MediaThumbnail } from "./MediaThumbnail";
export function TrailerPlayer({
  trailer,
  title,
}: {
  trailer: AnimeTrailer;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const playRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const embedUrl = youtubeEmbedUrl(trailer.url);
  useEffect(() => {
    if (playing) closeRef.current?.focus();
  }, [playing]);
  function close() {
    setPlaying(false);
    requestAnimationFrame(() => playRef.current?.focus());
  }
  const caption = (
    <span className="block py-2 sm:p-4">
      <span className="block text-xs font-medium tracking-wide text-accent">
        {trailer.provider}
      </span>
      <span className="mt-2 block text-xl leading-8 font-medium break-words">
        Trailer for {title}
      </span>
      <span className="mt-3 inline-flex min-h-11 items-center gap-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-neutral-950">
        {embedUrl ? "Play here" : "Open on provider"}{" "}
        <span aria-hidden="true">▶</span>
      </span>
    </span>
  );
  const cardClass =
    "group mt-3 grid w-full items-center gap-5 rounded-xl border border-white/15 bg-white/5 p-3 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:grid-cols-2";
  return (
    <div className="mt-5 border-t border-white/15 pt-5">
      <h3 className="text-xl font-medium">Trailer</h3>
      {embedUrl ? (
        playing ? (
          <div className={cardClass}>
            <iframe
              src={embedUrl}
              title={`Trailer for ${title}`}
              className="aspect-video min-h-[200px] w-full rounded-lg border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <div className="sm:p-4">
              <p className="text-xs font-medium text-accent">
                {trailer.provider}
              </p>
              <p className="mt-2 text-xl font-medium">Trailer for {title}</p>
              <button
                type="button"
                ref={closeRef}
                onClick={close}
                className="mt-4 min-h-11 rounded-lg border border-white/40 px-4 py-2 text-sm hover:bg-white/10"
              >
                Close trailer
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            ref={playRef}
            aria-label={`Play trailer for ${title}`}
            onClick={() => setPlaying(true)}
            className={cardClass}
          >
            <MediaThumbnail src={trailer.thumbnail} trailer external={false} />
            {caption}
          </button>
        )
      ) : (
        <a
          href={trailer.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch trailer on ${trailer.provider} (opens in a new tab)`}
          className={cardClass}
        >
          <MediaThumbnail src={trailer.thumbnail} trailer />
          {caption}
        </a>
      )}
      <a
        href={trailer.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
      >
        Open on {trailer.provider}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      {embedUrl && (
        <p className="text-xs leading-5 text-neutral-400">
          YouTube may block playback or ask you to verify your account. If this
          happens, use Open on YouTube to watch the trailer directly. Signing in
          in a separate window may not unlock this embedded player.
        </p>
      )}
    </div>
  );
}
