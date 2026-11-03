export const FORMATS = [
  { value: "", label: "All Formats" },
  { value: "TV", label: "TV Show" },
  { value: "MOVIE", label: "Movie" },
  { value: "TV_SHORT", label: "TV Short" },
  { value: "SPECIAL", label: "Special" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "MUSIC", label: "Music" },
] as const;

export type AnimeFormat = (typeof FORMATS)[number]["value"];
export type AnimeFilters = { search: string; format: AnimeFormat };
export type Anime = {
  id: number;
  title: string;
  image: string | null;
  genres: string[];
  score: number | null;
};
export type AnimePage = { items: Anime[]; page: number; hasNextPage: boolean };

export function parseFormat(value: string | null): AnimeFormat {
  return FORMATS.find((format) => format.value === value)?.value ?? "";
}

export function getScoreTone(score: number | null) {
  if (score === null) return "unavailable";
  if (score < 50) return "low";
  if (score <= 80) return "medium";
  return "high";
}

type SearchParamValue = string | string[] | null | undefined;

export function parseAnimeFilters(params: {
  search?: SearchParamValue;
  format?: SearchParamValue;
}): AnimeFilters {
  const search = Array.isArray(params.search)
    ? params.search[0]
    : params.search;
  const format = Array.isArray(params.format)
    ? params.format[0]
    : params.format;
  return { search: (search ?? "").trim(), format: parseFormat(format ?? null) };
}
