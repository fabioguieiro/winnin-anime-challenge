import { getScoreTone, parseFormat, parseAnimeFilters } from "./anime";

it.each([
  [0, "low"],
  [49, "low"],
  [50, "medium"],
  [80, "medium"],
  [81, "high"],
  [100, "high"],
  [null, "unavailable"],
] as const)("classifies score %s as %s", (score, tone) => {
  expect(getScoreTone(score)).toBe(tone);
});

it("accepts known formats and falls back for invalid URL values", () => {
  expect(parseFormat("TV_SHORT")).toBe("TV_SHORT");
  expect(parseFormat("unknown")).toBe("");
  expect(parseFormat(null)).toBe("");
});

it.each([
  [{}, { search: "", format: "", sort: "popularity" }],
  [
    { search: "  Naruto  ", format: "MOVIE", sort: "popularity" },
    { search: "Naruto", format: "MOVIE", sort: "popularity" },
  ],
  [
    { search: ["  Naruto ", "Bleach"], format: ["TV", "MOVIE"] },
    { search: "Naruto", format: "TV", sort: "popularity" },
  ],
  [
    { search: null, format: "unknown", sort: "popularity" },
    { search: "", format: "", sort: "popularity" },
  ],
])("normalizes catalog URL parameters %j", (params, expected) => {
  expect(parseAnimeFilters(params)).toEqual(expected);
});

it.each([
  [{ sort: "score" }, "score"],
  [{ sort: "popularity" }, "popularity"],
  [{ sort: "invalid" }, "popularity"],
  [{ sort: null }, "popularity"],
  [{ sort: ["score", "popularity"] }, "score"],
])("normalizes sorting from URL parameters %j", (params, expected) => {
  expect(parseAnimeFilters(params).sort).toBe(expected);
});
