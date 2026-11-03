/** @jest-environment node */
import { requestGraphQL } from "./graphql";

const originalFetch = global.fetch;
const mockFetch = jest.fn();

beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
});
afterAll(() => {
  global.fetch = originalFetch;
});

it("sends variables separately and forwards cancellation", async () => {
  const controller = new AbortController();
  const data = { Page: { media: [] } };
  mockFetch.mockResolvedValue(new Response(JSON.stringify({ data })));

  await expect(
    requestGraphQL(
      "query Catalog { Page { media { id } } }",
      { search: "Naruto" },
      controller.signal,
    ),
  ).resolves.toEqual(data);
  expect(mockFetch).toHaveBeenCalledWith(
    "https://graphql.anilist.co",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        query: "query Catalog { Page { media { id } } }",
        variables: { search: "Naruto" },
      }),
      signal: controller.signal,
    }),
  );
});

it("rejects HTTP failures", async () => {
  mockFetch.mockResolvedValue(new Response(null, { status: 429 }));
  await expect(requestGraphQL("query {}")).rejects.toThrow("429");
});

it("rejects GraphQL errors even with HTTP 200 and partial data", async () => {
  mockFetch.mockResolvedValue(
    new Response(
      JSON.stringify({
        data: { Page: null },
        errors: [{ message: "Invalid query" }],
      }),
    ),
  );
  await expect(requestGraphQL("query {}")).rejects.toThrow("Invalid query");
});

it("rejects missing data", async () => {
  mockFetch.mockResolvedValue(new Response(JSON.stringify({ data: null })));
  await expect(requestGraphQL("query {}")).rejects.toThrow("no data");
});

it("retains AniList error status from an HTTP-success GraphQL response", async () => {
  mockFetch.mockResolvedValue(
    new Response(
      JSON.stringify({
        data: { Media: null },
        errors: [{ message: "Not Found.", status: 404 }],
      }),
    ),
  );
  await expect(requestGraphQL("query {}")).rejects.toMatchObject({
    status: 404,
  });
});
