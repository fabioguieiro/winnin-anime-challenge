import type { Anime } from "./anime";

export type FuzzyDate = {
  year: number | null;
  month: number | null;
  day: number | null;
} | null;
export type StreamingProvider = { name: string; url: string };
export type AnimeDetailsData = Anime & {
  englishTitle: string | null;
  nativeTitle: string | null;
  synopsis: string;
  banner: string | null;
  format: string | null;
  status: string | null;
  season: string | null;
  year: number | null;
  episodes: number | null;
  duration: number | null;
  startDate: FuzzyDate;
  endDate: FuzzyDate;
  studios: string[];
  providers: StreamingProvider[];
};

export function parseAnimeId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id <= 2147483647 ? id : null;
}

export function formatDate(date: FuzzyDate): string {
  if (!date?.year) return "Não informado";
  if (!date.month) return String(date.year);
  const month = String(date.month).padStart(2, "0");
  return date.day
    ? `${String(date.day).padStart(2, "0")}/${month}/${date.year}`
    : `${month}/${date.year}`;
}

// Render the result as React text, never as HTML. AniList descriptions can
// contain HTML even when asHtml is false; preserve paragraphs, discard markup.
export function plainSynopsis(value: string | null): string {
  const entities: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    rsquo: "’",
    lsquo: "‘",
    ldquo: "“",
    rdquo: "”",
    ndash: "–",
    mdash: "—",
  };
  return (value ?? "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>|<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (!entity.startsWith("#"))
        return entities[entity.toLowerCase()] ?? match;
      const code =
        entity[1].toLowerCase() === "x"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code)
        : match;
    })
    .replace(/\r/g, "")
    .replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, "\n\n")
    .trim();
}

export function safeExternalUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
