import Link from "next/link";
import { SiteShell } from "@/shared/ui/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <main id="details" tabIndex={-1} className="px-6 py-24 text-center">
        <h1 className="text-3xl font-medium">Anime não encontrado</h1>
        <p className="mt-3 text-neutral-600">
          O endereço deste título não é válido.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded bg-brand px-6 text-white"
        >
          Voltar para os animes
        </Link>
      </main>
    </SiteShell>
  );
}
