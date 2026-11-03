"use client";

import { type FormEvent } from "react";
import { FORMATS, type AnimeFilters as Filters } from "../model/anime";

export function AnimeFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = String(
      new FormData(event.currentTarget).get("search") ?? "",
    ).trim();
    onChange({ ...filters, search });
  }
  return (
    <div className="mx-auto mb-6 max-w-[1010px]">
      <div
        role="group"
        aria-label="Filtrar por formato"
        className="mb-6 flex flex-wrap justify-center gap-3 sm:gap-4"
      >
        {FORMATS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filters.format === value}
            onClick={() => onChange({ ...filters, format: value })}
            className={`min-h-9 min-w-16 rounded-sm border border-brand px-5 py-1.5 text-sm transition-colors hover:bg-brand/10 sm:min-h-8 ${filters.format === value ? "bg-brand text-white hover:bg-brand-dark" : "bg-white text-brand"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <form role="search" onSubmit={submit} className="flex gap-2">
        <label className="sr-only" htmlFor="anime-search">
          Buscar anime
        </label>
        <input
          key={filters.search}
          id="anime-search"
          name="search"
          type="search"
          defaultValue={filters.search}
          placeholder="Digite algo aqui..."
          autoComplete="off"
          maxLength={200}
          className="min-w-0 flex-1 rounded-sm border border-neutral-300 bg-white px-3 py-2 text-base placeholder:text-neutral-400"
        />
        <button
          type="submit"
          className="rounded-sm bg-brand px-6 py-2 text-sm text-white transition-colors hover:bg-brand-dark"
        >
          Buscar
        </button>
      </form>
    </div>
  );
}
