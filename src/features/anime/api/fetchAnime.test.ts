import { requestGraphQL } from "@/shared/api/graphql";
import { fetchAnime, ANIME_QUERY } from "./fetchAnime";

jest.mock("@/shared/api/graphql", () => ({ requestGraphQL: jest.fn() }));
const request = jest.mocked(requestGraphQL);

it("maps nullable API fields and uses title fallbacks", async () => {
  request.mockResolvedValue({
    Page: {
      pageInfo: { currentPage: 2, hasNextPage: true },
      media: [
        null,
        {
          id: 1,
          title: { romaji: null, english: "Example", native: null },
          coverImage: null,
          genres: ["Action", null],
          averageScore: null,
        },
        { id: 2, title: null, coverImage: null, genres: null, averageScore: 0 },
      ],
    },
  });
  const signal = new AbortController().signal;
  await expect(
    fetchAnime({ search: "Example", format: "MOVIE" }, 2, signal),
  ).resolves.toEqual({
    page: 2,
    hasNextPage: true,
    items: [
      { id: 1, title: "Example", image: null, genres: ["Action"], score: null },
      {
        id: 2,
        title: "Título indisponível",
        image: null,
        genres: [],
        score: 0,
      },
    ],
  });
  expect(request).toHaveBeenCalledWith(
    ANIME_QUERY,
    { page: 2, search: "Example", format: "MOVIE" },
    signal,
  );
});

it("omits unused filters and stops when pagination metadata is absent", async () => {
  request.mockResolvedValue({ Page: { pageInfo: null, media: null } });
  await expect(fetchAnime({ search: "", format: "" }, 1)).resolves.toEqual({
    page: 1,
    hasNextPage: false,
    items: [],
  });
  expect(request).toHaveBeenCalledWith(ANIME_QUERY, { page: 1 }, undefined);
});

it("rejects a missing catalog instead of presenting a false empty result", async () => {
  request.mockResolvedValue({ Page: null });
  await expect(fetchAnime({ search: "", format: "" }, 1)).rejects.toThrow(
    "no catalog",
  );
});
