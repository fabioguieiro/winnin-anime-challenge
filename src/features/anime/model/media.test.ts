import { mapTrailer, safeThumbnail } from "./media";
it("normalizes whitespace in real YouTube IDs and builds canonical URLs", () => {
  expect(
    mapTrailer({
      id: "LHtdKWJdif4\t",
      site: "youtube",
      thumbnail: "https://bad.test/invalid",
    }),
  ).toEqual({
    url: "https://www.youtube.com/watch?v=LHtdKWJdif4",
    provider: "YouTube",
    thumbnail: "https://i.ytimg.com/vi/LHtdKWJdif4/hqdefault.jpg",
  });
});
it("supports Dailymotion", () => {
  expect(
    mapTrailer({
      id: "x123abc",
      site: "dailymotion",
      thumbnail: "https://images.test/a.jpg",
    }),
  ).toMatchObject({
    url: "https://www.dailymotion.com/video/x123abc",
    provider: "Dailymotion",
  });
});
it.each([
  null,
  { id: null, site: "youtube", thumbnail: null },
  { id: "javascript:evil", site: "youtube", thumbnail: null },
  { id: "../escape", site: "dailymotion", thumbnail: null },
  { id: "LHtdKWJdif4", site: "unknown", thumbnail: null },
])("omits missing/unsupported trailers %j", (value) =>
  expect(mapTrailer(value)).toBeNull(),
);
it("rejects mixed content and unsafe thumbnails", () => {
  expect(safeThumbnail("http://images.test/a.jpg")).toBeNull();
  expect(safeThumbnail("javascript:alert(1)")).toBeNull();
  expect(safeThumbnail("https://images.test/a.jpg")).toBe(
    "https://images.test/a.jpg",
  );
});
