const ANILIST_ENDPOINT = "https://graphql.anilist.co";

type GraphQLResponse<T> = {
  data?: T | null;
  errors?: { message: string; status?: number }[];
};

export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "GraphQLRequestError";
  }
}

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
    throw new GraphQLRequestError(
      `AniList request failed (${response.status}).`,
      response.status,
    );
  }

  const result: GraphQLResponse<T> = await response.json();
  if (result.errors?.length) {
    throw new GraphQLRequestError(
      result.errors.map((error) => error.message).join("; "),
      result.errors[0].status,
    );
  }
  if (result.data == null) {
    throw new Error("AniList returned no data.");
  }
  return result.data;
}
