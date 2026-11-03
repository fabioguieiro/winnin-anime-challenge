import Link from "next/link";
import type { ReactNode } from "react";

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

export function SiteShell({
  children,
  home = false,
}: {
  children: ReactNode;
  home?: boolean;
}) {
  return (
    <div className="mx-auto max-w-[1366px] bg-white">
      <a
        href={home ? "#catalog" : "#details"}
        className="sr-only z-50 rounded bg-white p-3 text-brand focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {home ? "Pular para os animes" : "Pular para o conteúdo"}
      </a>
      <header className="flex h-[68px] items-center justify-center bg-brand text-white">
        {home ? (
          <h1>
            <Brand />
          </h1>
        ) : (
          <Link href="/" aria-label="BUSCANIME — página inicial">
            <Brand />
          </Link>
        )}
      </header>
      {children}
      <footer className="flex h-[54px] flex-col items-center justify-center bg-brand text-white">
        <Brand small />
        <p className="text-[10px] leading-[14px] font-light uppercase">
          Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
