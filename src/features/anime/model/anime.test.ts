import { getScoreTone, parseFormat } from "./anime";

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
