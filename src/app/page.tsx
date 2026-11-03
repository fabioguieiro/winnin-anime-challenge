import { Suspense } from "react";
import { AnimeCatalog } from "@/features/anime/AnimeCatalog";
import { CatalogSkeleton } from "@/features/anime/components/CatalogSkeleton";
import { SiteShell } from "@/shared/ui/SiteShell";

export default function Home() {
  return (
    <SiteShell home>
      <main
        id="catalog"
        tabIndex={-1}
        className="px-4 py-6 sm:px-[25px]"
        aria-label="Catálogo de animes"
      >
        <Suspense fallback={<CatalogSkeleton />}>
          <AnimeCatalog />
        </Suspense>
      </main>
    </SiteShell>
  );
}
