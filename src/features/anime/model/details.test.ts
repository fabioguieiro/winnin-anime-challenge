import {
  formatDate,
  parseAnimeId,
  plainSynopsis,
  safeExternalUrl,
} from "./details";

it.each(["0", "-1", "1.5", "1e2", "abc", "2147483648"])(
  "rejects invalid route id %s",
  (value) => expect(parseAnimeId(value)).toBeNull(),
);
it("accepts a positive GraphQL Int id", () =>
  expect(parseAnimeId("16498")).toBe(16498));
it("preserves partial dates without inventing a day or month", () => {
  expect(formatDate(null)).toBe("Não informado");
  expect(formatDate({ year: 2013, month: null, day: null })).toBe("2013");
  expect(formatDate({ year: 2013, month: 4, day: null })).toBe("04/2013");
  expect(formatDate({ year: 2013, month: 4, day: 7 })).toBe("07/04/2013");
});
it("converts synopsis markup to readable paragraphs and text entities", () => {
  expect(plainSynopsis("<b>A &amp; B</b><br><br>It&#39;s spring.")).toBe(
    "A & B\n\nIt's spring.",
  );
  expect(
    plainSynopsis("<script>alert(1)</script><img src=x onerror=alert(1)>Story"),
  ).toBe("Story");
  expect(plainSynopsis(null)).toBe("");
});
it.each([
  "javascript:alert(1)",
  "data:text/html,test",
  "/relative",
  "https://user:secret@example.com",
])("rejects unsafe provider URL %s", (value) =>
  expect(safeExternalUrl(value)).toBeNull(),
);
it("accepts the HTTP and HTTPS links returned by AniList", () => {
  expect(safeExternalUrl("http://www.crunchyroll.com/attack-on-titan")).toBe(
    "http://www.crunchyroll.com/attack-on-titan",
  );
  expect(safeExternalUrl("https://example.com/anime")).toBe(
    "https://example.com/anime",
  );
});
