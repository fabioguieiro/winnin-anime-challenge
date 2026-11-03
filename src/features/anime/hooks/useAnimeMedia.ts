import { useQuery } from "@tanstack/react-query";
import { fetchAnimeMedia } from "../api/fetchAnimeMedia";
export function useAnimeMedia(id: number) {
  return useQuery({
    queryKey: ["anime-media", id],
    queryFn: ({ signal }) => fetchAnimeMedia(id, signal),
  });
}
