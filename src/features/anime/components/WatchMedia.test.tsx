import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/shared/api/queryClient";
import { GraphQLRequestError } from "@/shared/api/graphql";
import { fetchAnimeMedia } from "../api/fetchAnimeMedia";
import type { AnimeMedia } from "../model/media";
import { WatchMedia } from "./WatchMedia";
jest.mock("../api/fetchAnimeMedia", () => ({ fetchAnimeMedia: jest.fn() }));
const fetchMedia = jest.mocked(fetchAnimeMedia);
const media: AnimeMedia = {
  trailer: {
    url: "https://www.youtube.com/watch?v=LHtdKWJdif4",
    thumbnail: "https://i.ytimg.com/vi/LHtdKWJdif4/hqdefault.jpg",
    provider: "YouTube",
  },
  episodes: Array.from({ length: 26 }, (_, index) => ({
    title: `Episode ${index + 1} - Journey`,
    number: index + 1,
    url: `https://provider.test/watch/${index + 1}`,
    provider: "Provider",
    thumbnail: `https://images.test/${index + 1}.jpg`,
  })),
};
let client: ReturnType<typeof createQueryClient>;
beforeEach(() => {
  client = createQueryClient();
  fetchMedia.mockReset();
});
afterEach(() => client.clear());
function setup() {
  const view = (id: number) => (
    <QueryClientProvider client={client}>
      <WatchMedia id={id} />
    </QueryClientProvider>
  );
  const result = render(view(21));
  return {
    ...result,
    changeId: (id: number) => result.rerender(view(id)),
    user: userEvent.setup(),
  };
}
it("shows loading, external thumbnail links and trailer without an embedded player", async () => {
  let resolve!: (data: AnimeMedia) => void;
  fetchMedia.mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const { container } = setup();
  expect(screen.getByRole("status")).toHaveTextContent("Carregando episódios");
  resolve(media);
  const trailer = await screen.findByRole("link", {
    name: /Assistir ao trailer em YouTube/,
  });
  expect(trailer).toHaveAttribute("href", media.trailer!.url);
  const episode = screen.getByRole("link", {
    name: /Episode 1 - Journey — assistir em Provider/,
  });
  expect(episode).toHaveAttribute("target", "_blank");
  expect(episode).toHaveAttribute("rel", "noopener noreferrer");
  expect(episode.querySelector("img")).toHaveAttribute(
    "src",
    "https://images.test/1.jpg",
  );
  expect(screen.getByRole("status")).toHaveTextContent("12 de 26");
  expect(container.querySelector("iframe,video")).not.toBeInTheDocument();
});
it("reveals cached episodes in batches, focuses the new link, and resets the list for another title", async () => {
  fetchMedia.mockResolvedValue(media);
  const { user, changeId } = setup();
  await screen.findByRole("link", { name: /Episode 1 - Journey —/ });
  await user.click(
    screen.getByRole("button", { name: "Mostrar mais episódios" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("link", { name: /Episode 13 - Journey —/ }),
    ).toHaveFocus(),
  );
  expect(screen.getByRole("status")).toHaveTextContent("24 de 26");
  await user.click(
    screen.getByRole("button", { name: "Mostrar mais episódios" }),
  );
  expect(
    screen.queryByRole("button", { name: "Mostrar mais episódios" }),
  ).not.toBeInTheDocument();
  expect(fetchMedia).toHaveBeenCalledTimes(1);
  changeId(16498);
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent("12 de 26"),
  );
  expect(fetchMedia).toHaveBeenLastCalledWith(16498, expect.any(AbortSignal));
});
it("handles absent episodes/trailer and failed image previews", async () => {
  fetchMedia
    .mockResolvedValueOnce({ episodes: [], trailer: null })
    .mockResolvedValueOnce({ ...media, trailer: null });
  const { changeId } = setup();
  expect(
    await screen.findByText(/ainda não informou links de episódios/),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Trailer" }),
  ).not.toBeInTheDocument();
  changeId(16498);
  const link = await screen.findByRole("link", {
    name: /Episode 1 - Journey —/,
  });
  fireEvent.error(link.querySelector("img")!);
  expect(link).toHaveTextContent("Prévia indisponível");
  expect(link).toHaveAttribute("href", "https://provider.test/watch/1");
});
it("keeps media errors isolated and recovers with keyboard focus on explicit retry", async () => {
  fetchMedia
    .mockRejectedValueOnce(new GraphQLRequestError("Rate limited", 429))
    .mockResolvedValueOnce({ episodes: [], trailer: null });
  const { user } = setup();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Muitas solicitações",
  );
  await user.click(
    screen.getByRole("button", { name: "Tentar carregar episódios novamente" }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: "Explore e dê o play" }),
    ).toHaveFocus(),
  );
  expect(fetchMedia).toHaveBeenCalledTimes(2);
});
