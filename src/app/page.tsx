import { Suspense } from "react";
import { AnimeCatalog } from "@/features/anime/AnimeCatalog";
import { CatalogSkeleton } from "@/features/anime/components/CatalogSkeleton";

function Brand({ small = false }: { small?: boolean }) {
  return (
    <span
      className={
        small ? "text-2xl font-light" : "text-[40px] leading-none font-light"
      }
    >
      BUSC<span className="text-accent">ANIME</span>
    </span>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-[1366px] bg-white">
      <a
        href="#catalog"
        className="sr-only z-50 rounded bg-white p-3 text-brand focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para os animes
      </a>
      <header className="flex h-[68px] items-center justify-center bg-brand text-white">
        <h1>
          <Brand />
        </h1>
      </header>
      <main
        id="catalog"
        className="px-4 py-6 sm:px-6"
        aria-label="Catálogo de animes"
      >
        <Suspense fallback={<CatalogSkeleton />}>
          <AnimeCatalog />
        </Suspense>
      </main>
      <footer className="flex min-h-14 flex-col items-center justify-center bg-brand py-2 text-white">
        <Brand small />
        <p className="text-[10px] font-light uppercase">
          Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
