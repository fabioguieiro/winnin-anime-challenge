const ANILIST_ENDPOINT = "https://graphql.anilist.co";

type GraphQLResponse<T> = {
  data?: T | null;
  errors?: { message: string }[];
};

export async function requestGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`AniList request failed (${response.status}).`);
  }

  const result: GraphQLResponse<T> = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join("; "));
  }
  if (result.data == null) {
    throw new Error("AniList returned no data.");
  }
  return result.data;
}
