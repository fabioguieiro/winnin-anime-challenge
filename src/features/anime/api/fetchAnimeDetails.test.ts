import { GraphQLRequestError, requestGraphQL } from "@/shared/api/graphql";
import { ANIME_DETAILS_QUERY, fetchAnimeDetails } from "./fetchAnimeDetails";
jest.mock("@/shared/api/graphql", () => {
  const actual = jest.requireActual("@/shared/api/graphql");
  return { ...actual, requestGraphQL: jest.fn() };
});
const request = jest.mocked(requestGraphQL);
beforeEach(() => request.mockReset());

it("maps nullable details and only active, safe streaming links", async () => {
  request.mockResolvedValue({
    Media: {
      id: 1,
      title: { romaji: null, english: "Example", native: null },
      description: "Story<br>More",
      coverImage: null,
      bannerImage: null,
      genres: ["Action", null],
      averageScore: null,
      format: null,
      status: null,
      season: null,
      seasonYear: null,
      episodes: null,
      duration: null,
      startDate: null,
      endDate: null,
      studios: { nodes: [null, { name: "Studio" }] },
      externalLinks: [
        {
          site: "Provider",
          url: "https://example.com/watch",
          type: "STREAMING",
          isDisabled: false,
        },
        {
          site: "Duplicate",
          url: "https://example.com/watch",
          type: "STREAMING",
          isDisabled: false,
        },
        {
          site: "Bad",
          url: "javascript:alert(1)",
          type: "STREAMING",
          isDisabled: false,
        },
        {
          site: "Disabled",
          url: "https://example.org",
          type: "STREAMING",
          isDisabled: true,
        },
        {
          site: "Info",
          url: "https://example.net",
          type: "INFO",
          isDisabled: false,
        },
      ],
    },
  });
  const signal = new AbortController().signal;
  const result = await fetchAnimeDetails(1, signal);
  expect(result).toMatchObject({
    title: "Example",
    image: null,
    score: null,
    synopsis: "Story\n\nMore",
    genres: ["Action"],
    studios: ["Studio"],
    episodes: null,
    providers: [{ name: "Provider", url: "https://example.com/watch" }],
  });
  expect(request).toHaveBeenCalledWith(ANIME_DETAILS_QUERY, { id: 1 }, signal);
});
it("returns null for missing media and upstream 404s", async () => {
  request
    .mockResolvedValueOnce({ Media: null })
    .mockRejectedValueOnce(new GraphQLRequestError("Not Found.", 404));
  await expect(fetchAnimeDetails(999)).resolves.toBeNull();
  await expect(fetchAnimeDetails(999)).resolves.toBeNull();
});
it("preserves rate-limit and network errors for recovery", async () => {
  request.mockRejectedValue(new GraphQLRequestError("Too many requests", 429));
  await expect(fetchAnimeDetails(1)).rejects.toMatchObject({ status: 429 });
});
