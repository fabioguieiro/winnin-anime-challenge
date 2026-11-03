import { mapTrailer, safeThumbnail, youtubeEmbedUrl } from "./media";
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

it("constructs fixed-origin YouTube embeds and rejects unsupported/spoofed destinations", () => {
  expect(youtubeEmbedUrl("https://www.youtube.com/watch?v=LHtdKWJdif4")).toBe(
    "https://www.youtube-nocookie.com/embed/LHtdKWJdif4?autoplay=1&playsinline=1&rel=0&hl=en",
  );
  for (const url of [
    "https://www.youtube.com.evil.test/watch?v=LHtdKWJdif4",
    "javascript:alert(1)",
    "https://www.youtube.com/watch?v=../bad",
    "https://www.dailymotion.com/video/x123abc",
  ])
    expect(youtubeEmbedUrl(url)).toBeNull();
});
