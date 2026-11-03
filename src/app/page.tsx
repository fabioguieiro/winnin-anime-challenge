import { Suspense } from "react";
import { AnimeCatalog } from "@/features/anime/AnimeCatalog";
import { CatalogSkeleton } from "@/features/anime/components/CatalogSkeleton";

function Brand({ small = false }: { small?: boolean }) {
  return (
    <span
      className={
        small
          ? "block text-2xl leading-7 font-light tracking-[0.045em]"
          : "block text-[40px] leading-7 font-light tracking-[0.045em]"
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
        tabIndex={-1}
        className="px-4 py-6 sm:px-[25px]"
        aria-label="Catálogo de animes"
      >
        <Suspense fallback={<CatalogSkeleton />}>
          <AnimeCatalog />
        </Suspense>
      </main>
      <footer className="flex h-[54px] flex-col items-center justify-center bg-brand text-white">
        <Brand small />
        <p className="text-[10px] leading-[14px] font-light uppercase">
          Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
