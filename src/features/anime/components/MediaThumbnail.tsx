"use client";
import Image from "next/image";
import { useState } from "react";
export function MediaThumbnail({
  src,
  number,
  trailer = false,
  external = true,
}: {
  src: string | null;
  number?: number | null;
  trailer?: boolean;
  external?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <span className="relative block aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-brand-dark to-neutral-800">
      {src && failed !== src ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          loading="lazy"
          referrerPolicy="no-referrer"
          className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
          onError={() => setFailed(src)}
        />
      ) : (
        <span className="absolute inset-x-0 top-4 text-center text-xs text-white/70">
          Preview unavailable
        </span>
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="flex size-12 items-center justify-center rounded-full border border-white/40 bg-black/60 pl-1 text-xl text-white shadow-lg transition-colors group-hover:bg-brand">
          ▶
        </span>
      </span>
      {external && (
        <span
          aria-hidden="true"
          className="absolute right-3 bottom-3 text-white"
        >
          ↗
        </span>
      )}
      {trailer ? (
        <span className="absolute bottom-3 left-3 rounded bg-accent px-2 py-1 text-xs font-medium text-neutral-950">
          TRAILER
        </span>
      ) : number !== null && number !== undefined ? (
        <span className="absolute bottom-3 left-3 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
          EP. {number}
        </span>
      ) : null}
    </span>
  );
}
