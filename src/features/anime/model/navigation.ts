import type { AnimeFilters } from "./anime";

function catalogQuery(filters: AnimeFilters) {
  const params = new URLSearchParams();
  const search = filters.search.trim();
  if (search) params.set("search", search);
  if (filters.format) params.set("format", filters.format);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getCatalogHref(filters: AnimeFilters) {
  return `/${catalogQuery(filters)}`;
}
export function getDetailsHref(id: number, filters: AnimeFilters) {
  return `/anime/${id}${catalogQuery(filters)}`;
}
