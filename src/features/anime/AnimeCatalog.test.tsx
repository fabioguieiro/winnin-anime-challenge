import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimeCatalog } from "./AnimeCatalog";
import { fetchAnime } from "./api/fetchAnime";
import type { AnimePage } from "./model/anime";
import { GraphQLRequestError } from "@/shared/api/graphql";

let mockParams = new URLSearchParams();
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockParams,
}));
jest.mock("./api/fetchAnime", () => ({ fetchAnime: jest.fn() }));
const fetchMock = jest.mocked(fetchAnime);
const first: AnimePage = {
  page: 1,
  hasNextPage: true,
  items: [
    { id: 1, title: "First anime", image: null, genres: ["Action"], score: 80 },
  ],
};
const second: AnimePage = {
  page: 2,
  hasNextPage: false,
  items: [
    { id: 2, title: "Second anime", image: null, genres: [], score: null },
  ],
};

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const view = () => (
    <QueryClientProvider client={client}>
      <AnimeCatalog />
    </QueryClientProvider>
  );
  const result = render(view());
  return {
    ...result,
    refresh: () => result.rerender(view()),
    user: userEvent.setup(),
  };
}

beforeEach(() => {
  mockParams = new URLSearchParams();
  fetchMock.mockReset();
  mockPush.mockReset();
});

it("announces loading, appends results, and hides pagination at the end", async () => {
  let resolveFirst!: (page: AnimePage) => void;
  fetchMock
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    )
    .mockResolvedValueOnce(second);
  const { user } = setup();
  expect(
    screen.getByRole("status", { name: "Loading anime" }),
  ).toBeInTheDocument();
  resolveFirst(first);
  expect(
    await screen.findByRole("heading", { name: "First anime" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Average score: 80%")).toHaveClass(
    "bg-score-medium",
  );
  await user.click(screen.getByRole("button", { name: "Load more" }));
  expect(
    await screen.findByRole("heading", { name: "Second anime" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "First anime" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Score unavailable")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Load more" }),
  ).not.toBeInTheDocument();
  expect(fetchMock).toHaveBeenLastCalledWith(
    { search: "", format: "" },
    2,
    expect.any(AbortSignal),
  );
});

it("submits a trimmed search, preserves it with the format, and restarts pagination", async () => {
  fetchMock.mockResolvedValue(first);
  const { user, refresh } = setup();
  await screen.findByRole("heading", { name: "First anime" });
  await user.type(screen.getByRole("searchbox"), "  Naruto  ");
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole("button", { name: "Search" }));
  expect(mockPush).toHaveBeenLastCalledWith("/?search=Naruto", {
    scroll: false,
  });
  mockParams = new URLSearchParams("search=Naruto");
  refresh();
  await waitFor(() =>
    expect(fetchMock).toHaveBeenLastCalledWith(
      { search: "Naruto", format: "" },
      1,
      expect.any(AbortSignal),
    ),
  );
  await user.click(screen.getByRole("button", { name: "Movie" }));
  expect(mockPush).toHaveBeenLastCalledWith("/?search=Naruto&format=MOVIE", {
    scroll: false,
  });
  mockParams = new URLSearchParams("search=Naruto&format=MOVIE");
  refresh();
  await waitFor(() =>
    expect(fetchMock).toHaveBeenLastCalledWith(
      { search: "Naruto", format: "MOVIE" },
      1,
      expect.any(AbortSignal),
    ),
  );
  expect(screen.getByRole("button", { name: "Movie" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

it("offers a reset for empty results", async () => {
  fetchMock.mockResolvedValue({ page: 1, hasNextPage: false, items: [] });
  const { user } = setup();
  expect(
    await screen.findByRole("heading", { name: "No anime found" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(mockPush).toHaveBeenCalledWith("/", { scroll: false });
  expect(screen.getByRole("searchbox")).toHaveFocus();
});

it("shows rate-limit guidance and recovers on retry", async () => {
  fetchMock
    .mockRejectedValueOnce(new GraphQLRequestError("Rate limited", 429))
    .mockResolvedValueOnce({ ...first, hasNextPage: false });
  const { user } = setup();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Too many requests",
  );
  await user.click(screen.getByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("heading", { name: "First anime" }),
  ).toBeInTheDocument();
});

it("preserves loaded cards and retries only the failed next page", async () => {
  fetchMock
    .mockResolvedValueOnce(first)
    .mockRejectedValueOnce(new Error("Network offline"))
    .mockResolvedValueOnce(second);
  const { user } = setup();
  await screen.findByRole("heading", { name: "First anime" });
  await user.click(screen.getByRole("button", { name: "Load more" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Previous results",
  );
  expect(
    screen.getByRole("heading", { name: "First anime" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByRole("heading", { name: "Second anime" });
  expect(fetchMock.mock.calls.map((call) => call[1])).toEqual([1, 2, 2]);
});

it("keeps the same polite status region across result updates", async () => {
  fetchMock.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
  const { user } = setup();
  const status = screen.getByRole("status");
  await screen.findByRole("heading", { name: "First anime" });
  expect(status).toHaveTextContent("1 anime loaded.");
  await user.click(screen.getByRole("button", { name: "Load more" }));
  await screen.findByRole("heading", { name: "Second anime" });
  expect(screen.getByRole("status")).toBe(status);
  expect(status).toHaveTextContent("2 anime loaded.");
  await waitFor(() =>
    expect(
      screen.getByRole("link", { name: "View details for Second anime" }),
    ).toHaveFocus(),
  );
});

it("moves focus to recovery controls after a pagination failure", async () => {
  fetchMock
    .mockResolvedValueOnce(first)
    .mockRejectedValueOnce(new Error("offline"));
  const { user } = setup();
  await screen.findByRole("heading", { name: "First anime" });
  await user.click(screen.getByRole("button", { name: "Load more" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Try again" })).toHaveFocus(),
  );
});

it("returns focus to retry when another initial request fails", async () => {
  fetchMock.mockRejectedValue(new Error("offline"));
  const { user } = setup();
  const retry = await screen.findByRole("button", { name: "Try again" });
  await user.click(retry);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Try again" })).toHaveFocus(),
  );
});

it("makes cards keyboard links carrying the applied catalog filters", async () => {
  mockParams = new URLSearchParams("search=Naruto&format=MOVIE");
  fetchMock.mockResolvedValue(first);
  setup();
  expect(
    await screen.findByRole("link", { name: "View details for First anime" }),
  ).toHaveAttribute("href", "/anime/1?search=Naruto&format=MOVIE");
});
