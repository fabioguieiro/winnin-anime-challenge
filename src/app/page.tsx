import { Suspense } from "react";
import { AnimeCatalog } from "@/features/anime/AnimeCatalog";
import { CatalogSkeleton } from "@/features/anime/components/CatalogSkeleton";
import { CatalogHydration } from "@/features/anime/components/CatalogHydration";
import { prefetchCatalog } from "@/features/anime/server/prefetchCatalog";
import { parseAnimeFilters } from "@/features/anime/model/anime";
import { SiteShell } from "@/shared/ui/SiteShell";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseAnimeFilters(await searchParams);
  const state = await prefetchCatalog(filters);
  return (
    <SiteShell home>
      <main
        id="catalog"
        tabIndex={-1}
        className="px-4 py-6 sm:px-[25px]"
        aria-label="Anime catalog"
      >
        <CatalogHydration state={state}>
          <Suspense fallback={<CatalogSkeleton />}>
            <AnimeCatalog />
          </Suspense>
        </CatalogHydration>
      </main>
    </SiteShell>
  );
}
