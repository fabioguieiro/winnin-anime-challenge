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
    screen.getByRole("status", { name: "Carregando animes" }),
  ).toBeInTheDocument();
  resolveFirst(first);
  expect(
    await screen.findByRole("heading", { name: "First anime" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Nota média: 80%")).toHaveClass(
    "bg-score-medium",
  );
  await user.click(screen.getByRole("button", { name: "Ver mais" }));
  expect(
    await screen.findByRole("heading", { name: "Second anime" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "First anime" }),
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Nota indisponível")).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Ver mais" }),
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
  await user.click(screen.getByRole("button", { name: "Buscar" }));
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
    await screen.findByRole("heading", { name: "Nenhum anime encontrado" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
  expect(mockPush).toHaveBeenCalledWith("/", { scroll: false });
});

it("shows rate-limit guidance and recovers on retry", async () => {
  fetchMock
    .mockRejectedValueOnce(new GraphQLRequestError("Rate limited", 429))
    .mockResolvedValueOnce({ ...first, hasNextPage: false });
  const { user } = setup();
  expect(await screen.findByRole("alert")).toHaveTextContent("Muitas buscas");
  await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
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
  await user.click(screen.getByRole("button", { name: "Ver mais" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "resultados anteriores",
  );
  expect(
    screen.getByRole("heading", { name: "First anime" }),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
  await screen.findByRole("heading", { name: "Second anime" });
  expect(fetchMock.mock.calls.map((call) => call[1])).toEqual([1, 2, 2]);
});

it("keeps the same polite status region across result updates", async () => {
  fetchMock.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
  const { user } = setup();
  const status = screen.getByRole("status");
  await screen.findByRole("heading", { name: "First anime" });
  expect(status).toHaveTextContent("1 animes carregados.");
  await user.click(screen.getByRole("button", { name: "Ver mais" }));
  await screen.findByRole("heading", { name: "Second anime" });
  expect(screen.getByRole("status")).toBe(status);
  expect(status).toHaveTextContent("2 animes carregados.");
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "Second anime" })).toHaveFocus(),
  );
});

it("moves focus to recovery controls after a pagination failure", async () => {
  fetchMock
    .mockResolvedValueOnce(first)
    .mockRejectedValueOnce(new Error("offline"));
  const { user } = setup();
  await screen.findByRole("heading", { name: "First anime" });
  await user.click(screen.getByRole("button", { name: "Ver mais" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Tentar novamente" }),
    ).toHaveFocus(),
  );
});
