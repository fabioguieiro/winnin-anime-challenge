import { Suspense } from "react";
import { DetailsSkeleton } from "@/features/anime/components/DetailsSkeleton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimeDetails } from "@/features/anime/AnimeDetails";
import { parseAnimeId } from "@/features/anime/model/details";
import { SiteShell } from "@/shared/ui/SiteShell";

export const metadata: Metadata = { title: "Anime details | BUSCANIME" };

export default async function AnimeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parseAnimeId(rawId);
  if (id === null) notFound();
  return (
    <SiteShell>
      <main id="details" tabIndex={-1} aria-label="Anime details">
        <Suspense fallback={<DetailsSkeleton />}>
          <AnimeDetails id={id} />
        </Suspense>
      </main>
    </SiteShell>
  );
}
