/** @jest-environment node */
import { renderToString } from "react-dom/server";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/shared/api/queryClient";
import { GraphQLRequestError } from "@/shared/api/graphql";
import { AnimeCatalog } from "../AnimeCatalog";
import { CatalogHydration } from "../components/CatalogHydration";
import { fetchAnime } from "../api/fetchAnime";
import { prefetchCatalog } from "./prefetchCatalog";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("../api/fetchAnime", () => ({ fetchAnime: jest.fn() }));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams("search=Naruto&format=MOVIE"),
}));
const fetchPage = jest.mocked(fetchAnime);
const filters = { search: "Naruto", format: "MOVIE" } as const;

it("includes the filtered first-page title and cover in server-rendered HTML", async () => {
  fetchPage.mockResolvedValue({
    page: 1,
    hasNextPage: true,
    items: [
      {
        id: 1,
        title: "SSR Naruto",
        genres: ["Action"],
        score: 80,
        image:
          "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/example.jpg",
      },
    ],
  });
  const state = JSON.parse(JSON.stringify(await prefetchCatalog(filters)));
  const client = createQueryClient();
  try {
    const html = renderToString(
      <QueryClientProvider client={client}>
        <CatalogHydration state={state}>
          <AnimeCatalog />
        </CatalogHydration>
      </QueryClientProvider>,
    );
    expect(html).toContain("SSR Naruto");
    expect(html).toContain("<img");
    expect(html).toContain("example.jpg");
    expect(html).not.toContain("Carregando animes...");
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith(filters, 1, expect.any(AbortSignal));
  } finally {
    client.clear();
  }
});

it("serializes rate limits without leaking internal errors or retrying on the server", async () => {
  fetchPage.mockRejectedValue(
    new GraphQLRequestError("private upstream diagnostics", 429),
  );
  const state = await prefetchCatalog(filters);
  const serialized = JSON.stringify(state);
  expect(serialized).not.toContain("private upstream diagnostics");
  expect(JSON.parse(serialized).queries[0].state.error.status).toBe(429);
  expect(state.queries[0].state.status).toBe("error");
  expect(fetchPage).toHaveBeenCalledTimes(1);
});

it("isolates prefetched data between requests with different filters", async () => {
  fetchPage.mockResolvedValue({ page: 1, hasNextPage: false, items: [] });
  const first = await prefetchCatalog(filters);
  const second = await prefetchCatalog({ search: "Bleach", format: "TV" });
  expect(first.queries).toHaveLength(1);
  expect(second.queries).toHaveLength(1);
  expect(first.queries[0].queryKey).toEqual(["anime", filters]);
  expect(second.queries[0].queryKey).toEqual([
    "anime",
    { search: "Bleach", format: "TV" },
  ]);
});
