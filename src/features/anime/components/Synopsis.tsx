"use client";
import { useState } from "react";
export function Synopsis({ id, text }: { id: number; text: string }) {
  const [expanded, setExpanded] = useState(false);
  const collapsible = text.length > 240;
  return (
    <section aria-labelledby="synopsis-heading">
      <div className="flex min-h-11 items-center justify-between gap-4">
        <h2 id="synopsis-heading" className="text-xl font-medium">
          Synopsis
        </h2>
        {collapsible && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={`synopsis-${id}`}
            onClick={() => setExpanded(!expanded)}
            className="min-h-11 text-sm font-medium text-brand underline underline-offset-4"
          >
            {expanded ? "Collapse synopsis" : "Read full synopsis"}
          </button>
        )}
      </div>
      <p
        id={`synopsis-${id}`}
        className={`mt-2 text-sm leading-6 whitespace-pre-line break-words text-neutral-700 ${collapsible && !expanded ? "line-clamp-3" : ""}`}
      >
        {text || "No synopsis is available for this title."}
      </p>
    </section>
  );
}
