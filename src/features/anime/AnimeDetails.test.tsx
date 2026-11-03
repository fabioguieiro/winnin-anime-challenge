import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimeDetails } from "./AnimeDetails";
import { fetchAnimeDetails } from "./api/fetchAnimeDetails";
import { detailsFixture } from "./test/detailsFixture";
import { GraphQLRequestError } from "@/shared/api/graphql";

let mockParams = new URLSearchParams();
jest.mock("next/navigation", () => ({ useSearchParams: () => mockParams }));

jest.mock("./api/fetchAnimeDetails", () => ({ fetchAnimeDetails: jest.fn() }));
const fetchMock = jest.mocked(fetchAnimeDetails);
beforeEach(() => {
  fetchMock.mockReset();
  mockParams = new URLSearchParams();
});
function setup(id = 1) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const view = (nextId: number) => (
    <QueryClientProvider client={client}>
      <AnimeDetails id={nextId} />
    </QueryClientProvider>
  );
  const result = render(view(id));
  return {
    ...result,
    user: userEvent.setup(),
    changeId: (nextId: number) => result.rerender(view(nextId)),
  };
}
it("renders the title, synopsis, score, and release metadata", async () => {
  fetchMock.mockResolvedValue(detailsFixture);
  setup();
  expect(
    screen.getByRole("status", { name: "Carregando detalhes" }),
  ).toBeInTheDocument();
  expect(
    await screen.findByRole("heading", { level: 1, name: "Example Anime" }),
  ).toBeInTheDocument();
  expect(screen.getByText("A story about a journey.")).toBeInTheDocument();
  expect(screen.getByLabelText("Nota média: 80%")).toBeInTheDocument();
  expect(screen.getByText("25")).toBeInTheDocument();
  expect(screen.getByText("24 min")).toBeInTheDocument();
  expect(screen.getByText("07/04/2013")).toBeInTheDocument();
  expect(screen.getByText("Example Studio")).toBeInTheDocument();
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { level: 1, name: "Example Anime" }),
    ).toHaveFocus(),
  );
});
it("handles unavailable metadata and renders synopsis as escaped text", async () => {
  fetchMock.mockResolvedValue({
    ...detailsFixture,
    synopsis: '<img src=x onerror="alert(1)">',
    episodes: null,
    duration: null,
    studios: [],
    score: null,
  });
  const { container } = setup();
  await screen.findByRole("heading", { level: 1, name: "Example Anime" });
  expect(screen.getByText("A definir")).toBeInTheDocument();
  expect(screen.getByText("Não informada")).toBeInTheDocument();
  expect(screen.getByLabelText("Nota indisponível")).toBeInTheDocument();
  expect(container.querySelector("img")).toBeNull();
});
it("shows not-found state independently of request failures", async () => {
  fetchMock.mockResolvedValue(null);
  setup();
  expect(
    await screen.findByRole("heading", { name: "Anime não encontrado" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Tentar novamente" }),
  ).not.toBeInTheDocument();
});
it("recovers from a rate-limit error", async () => {
  fetchMock
    .mockRejectedValueOnce(new GraphQLRequestError("Limited", 429))
    .mockResolvedValueOnce(detailsFixture);
  const { user } = setup();
  expect(await screen.findByRole("alert")).toHaveTextContent("Muitas buscas");
  await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
  expect(
    await screen.findByRole("heading", { name: "Example Anime" }),
  ).toBeInTheDocument();
});
it("fetches independently when navigating to another title", async () => {
  fetchMock.mockResolvedValueOnce(detailsFixture).mockResolvedValueOnce({
    ...detailsFixture,
    id: 2,
    title: "Another Anime",
  });
  const { changeId } = setup();
  await screen.findByRole("heading", { name: "Example Anime" });
  changeId(2);
  expect(
    await screen.findByRole("heading", { name: "Another Anime" }),
  ).toBeInTheDocument();
  expect(fetchMock).toHaveBeenLastCalledWith(2, expect.any(AbortSignal));
});

it("returns to the originating filters without accepting arbitrary return URLs", async () => {
  mockParams = new URLSearchParams(
    "search=Naruto&format=MOVIE&returnTo=https://example.org",
  );
  fetchMock.mockResolvedValue(detailsFixture);
  setup();
  await screen.findByRole("heading", { level: 1, name: "Example Anime" });
  expect(
    screen.getByRole("link", { name: "Voltar para os animes" }),
  ).toHaveAttribute("href", "/?search=Naruto&format=MOVIE");
});
it("returns focus to retry after another failed details request", async () => {
  fetchMock.mockRejectedValue(new Error("offline"));
  const { user } = setup();
  await user.click(
    await screen.findByRole("button", { name: "Tentar novamente" }),
  );
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Tentar novamente" }),
    ).toHaveFocus(),
  );
});
