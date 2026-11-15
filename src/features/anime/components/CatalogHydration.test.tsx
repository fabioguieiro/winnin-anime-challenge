import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  dehydrate,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";
import { createQueryClient } from "@/shared/api/queryClient";
import { GraphQLRequestError } from "@/shared/api/graphql";
import { animeQueryOptions } from "../api/animeQueryOptions";
import { fetchAnime } from "../api/fetchAnime";
import { AnimeCatalog } from "../AnimeCatalog";
import { CatalogHydration } from "./CatalogHydration";

let mockParams = new URLSearchParams("search=Naruto&format=MOVIE&sort=score");
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => mockParams,
}));
jest.mock("../api/fetchAnime", () => ({ fetchAnime: jest.fn() }));
const fetchPage = jest.mocked(fetchAnime);
const filters = { search: "Naruto", format: "MOVIE", sort: "score" } as const;
const first = {
  page: 1,
  hasNextPage: true,
  items: [
    { id: 1, title: "First anime", image: null, genres: [], score: null },
  ],
};
const second = {
  page: 2,
  hasNextPage: false,
  items: [
    { id: 2, title: "Second anime", image: null, genres: [], score: null },
  ],
};
let client: ReturnType<typeof createQueryClient>;

beforeEach(() => {
  client = createQueryClient();
  mockParams = new URLSearchParams("search=Naruto&format=MOVIE&sort=score");
  fetchPage.mockReset();
});
afterEach(() => client.clear());

function snapshot(): DehydratedState {
  const server = createQueryClient();
  server.setQueryData(animeQueryOptions(filters).queryKey, {
    pages: [first],
    pageParams: [1],
  });
  const state = JSON.parse(JSON.stringify(dehydrate(server)));
  server.clear();
  return state;
}
function view(state: DehydratedState) {
  return (
    <QueryClientProvider client={client}>
      <CatalogHydration state={state}>
        <AnimeCatalog />
      </CatalogHydration>
    </QueryClientProvider>
  );
}

it("hydrates filtered results without a browser refetch and requests only page two on load more", async () => {
  fetchPage.mockResolvedValue(second);
  render(view(snapshot()));
  expect(
    screen.getByRole("heading", { name: "First anime" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("searchbox")).toHaveValue("Naruto");
  expect(screen.getByRole("button", { name: "Movie" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(fetchPage).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Load more" }));
  expect(
    await screen.findByRole("heading", { name: "Second anime" }),
  ).toBeInTheDocument();
  expect(fetchPage).toHaveBeenCalledTimes(1);
  expect(fetchPage).toHaveBeenCalledWith(filters, 2, expect.any(AbortSignal));
});

it("does not replace browser pagination with a newer server page-one snapshot", async () => {
  client.setQueryData(
    animeQueryOptions(filters).queryKey,
    { pages: [first, second], pageParams: [1, 2] },
    { updatedAt: Date.now() - 1_000 },
  );
  render(view(snapshot()));
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Second anime" }),
    ).toBeInTheDocument(),
  );
  expect(
    screen.queryByRole("button", { name: "Load more" }),
  ).not.toBeInTheDocument();
  expect(fetchPage).not.toHaveBeenCalled();
});

it("uses a separate query for changed URL filters", async () => {
  fetchPage.mockResolvedValue({
    ...first,
    items: [{ ...first.items[0], id: 3, title: "Bleach result" }],
  });
  const state = snapshot();
  const result = render(view(state));
  mockParams = new URLSearchParams("search=Bleach&format=TV");
  result.rerender(view(state));
  expect(
    await screen.findByRole("heading", { name: "Bleach result" }),
  ).toBeInTheDocument();
  expect(fetchPage).toHaveBeenCalledWith(
    { search: "Bleach", format: "TV", sort: "popularity" },
    1,
    expect.any(AbortSignal),
  );
  expect(
    screen.queryByRole("heading", { name: "First anime" }),
  ).not.toBeInTheDocument();
});

it("shows a hydrated rate limit without automatically retrying and recovers on explicit retry", async () => {
  const server = createQueryClient();
  fetchPage.mockRejectedValueOnce(new GraphQLRequestError("Rate limited", 429));
  await server.prefetchInfiniteQuery(animeQueryOptions(filters));
  const state = JSON.parse(
    JSON.stringify(dehydrate(server, { shouldDehydrateQuery: () => true })),
  );
  state.queries[0].state.error = {
    name: "GraphQLRequestError",
    message: "Unable to load the anime catalog.",
    status: 429,
  };
  state.queries[0].state.fetchFailureReason = state.queries[0].state.error;
  server.clear();
  fetchPage.mockClear();
  fetchPage.mockResolvedValueOnce({ ...first, hasNextPage: false });
  render(view(state));
  expect(screen.getByRole("alert")).toHaveTextContent("Too many requests");
  expect(fetchPage).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("heading", { name: "First anime" }),
  ).toBeInTheDocument();
  expect(fetchPage).toHaveBeenCalledTimes(1);
});
