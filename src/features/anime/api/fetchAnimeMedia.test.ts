import { requestGraphQL, GraphQLRequestError } from "@/shared/api/graphql";
import { ANIME_MEDIA_QUERY, fetchAnimeMedia } from "./fetchAnimeMedia";
jest.mock("@/shared/api/graphql", () => ({
  ...jest.requireActual("@/shared/api/graphql"),
  requestGraphQL: jest.fn(),
}));
const request = jest.mocked(requestGraphQL);
it("validates, deduplicates and orders supplied episode numbers without filling gaps", async () => {
  request.mockResolvedValue({
    Media: {
      trailer: null,
      streamingEpisodes: [
        null,
        {
          title: "Episode 130 - Journey",
          url: "http://provider.test/130",
          site: "Provider",
          thumbnail: "https://images.test/130.jpg",
        },
        {
          title: "Episode 62 - Arrival",
          url: "https://provider.test/62",
          site: "Provider",
          thumbnail: "http://images.test/62.jpg",
        },
        {
          title: "Duplicate",
          url: "https://provider.test/62",
          site: null,
          thumbnail: null,
        },
        {
          title: "Unsafe",
          url: "javascript:alert(1)",
          site: null,
          thumbnail: null,
        },
        {
          title: null,
          url: "https://other.test/special",
          site: null,
          thumbnail: null,
        },
        {
          title: "Credentials",
          url: "https://user:pass@other.test/episode",
          site: null,
          thumbnail: null,
        },
      ],
    },
  });
  const signal = new AbortController().signal;
  const result = await fetchAnimeMedia(21, signal);
  expect(result.episodes.map((e) => e.number)).toEqual([62, 130, null]);
  expect(result.episodes[0].thumbnail).toBeNull();
  expect(result.episodes[1].thumbnail).toBe("https://images.test/130.jpg");
  expect(result.episodes[2]).toMatchObject({
    title: "Untitled episode",
    provider: "other.test",
  });
  expect(request).toHaveBeenCalledWith(ANIME_MEDIA_QUERY, { id: 21 }, signal);
});
it("handles null data and missing media", async () => {
  request
    .mockResolvedValueOnce({ Media: null })
    .mockResolvedValueOnce({
      Media: { streamingEpisodes: null, trailer: null },
    })
    .mockRejectedValueOnce(new GraphQLRequestError("Missing", 404));
  for (let i = 0; i < 3; i++)
    await expect(fetchAnimeMedia(1)).resolves.toEqual({
      episodes: [],
      trailer: null,
    });
});
it("preserves rate limits for recovery", async () => {
  request.mockRejectedValue(new GraphQLRequestError("Rate limit", 429));
  await expect(fetchAnimeMedia(1)).rejects.toMatchObject({ status: 429 });
});
