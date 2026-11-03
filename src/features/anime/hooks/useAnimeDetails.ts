import { useQuery } from "@tanstack/react-query";
import { fetchAnimeDetails } from "../api/fetchAnimeDetails";

export function useAnimeDetails(id: number) {
  return useQuery({
    queryKey: ["anime-details", id],
    queryFn: ({ signal }) => fetchAnimeDetails(id, signal),
  });
}
