import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createQueryClient } from "@/shared/api/queryClient";
import { fetchAnime } from "../api/fetchAnime";
import { useAnimeQuery } from "./useAnimeQuery";

jest.mock("../api/fetchAnime", () => ({ fetchAnime: jest.fn() }));
const fetchPage = jest.mocked(fetchAnime);
const filters = { search: "", format: "", sort: "popularity" } as const;
let client: ReturnType<typeof createQueryClient>;

beforeEach(() => {
  client = createQueryClient();
  fetchPage.mockImplementation(async (_filters, page) => ({
    page,
    hasNextPage: true,
    items: [
      {
        id: page,
        title: `Title ${page}`,
        image: null,
        genres: [],
        score: null,
      },
    ],
  }));
});

afterEach(() => {
  client.clear();
  jest.restoreAllMocks();
});

function mountCatalog() {
  return renderHook(() => useAnimeQuery(filters), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}

it("reuses all loaded pages after a 90-second details visit", async () => {
  const clock = jest.spyOn(Date, "now");
  const catalog = mountCatalog();
  await waitFor(() => expect(catalog.result.current.isSuccess).toBe(true));
  await act(async () => {
    await catalog.result.current.fetchNextPage();
  });
  const updatedAt = catalog.result.current.dataUpdatedAt;
  catalog.unmount();
  clock.mockReturnValue(updatedAt + 90_000);

  const returned = mountCatalog();
  expect(returned.result.current.data?.pages.map((page) => page.page)).toEqual([
    1, 2,
  ]);
  expect(returned.result.current.isFetching).toBe(false);
  expect(fetchPage).toHaveBeenCalledTimes(2);
});

it("refreshes expired pages in order when revisiting after six minutes", async () => {
  const clock = jest.spyOn(Date, "now");
  const catalog = mountCatalog();
  await waitFor(() => expect(catalog.result.current.isSuccess).toBe(true));
  await act(async () => {
    await catalog.result.current.fetchNextPage();
  });
  const updatedAt = catalog.result.current.dataUpdatedAt;
  catalog.unmount();
  clock.mockReturnValue(updatedAt + 6 * 60_000);

  const returned = mountCatalog();
  await waitFor(() => expect(returned.result.current.isFetching).toBe(false));
  expect(fetchPage.mock.calls.map((call) => call[1])).toEqual([1, 2, 1, 2]);
  expect(returned.result.current.data?.pages).toHaveLength(2);
});

it("aborts an in-flight request when leaving its filter results", () => {
  let signal: AbortSignal | undefined;
  fetchPage.mockImplementation((_filters, _page, requestSignal) => {
    signal = requestSignal;
    return new Promise(() => {});
  });
  const catalog = mountCatalog();
  expect(signal?.aborted).toBe(false);
  catalog.unmount();
  expect(signal?.aborted).toBe(true);
});
