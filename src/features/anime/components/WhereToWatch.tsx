import type { StreamingProvider } from "../model/details";

export function WhereToWatch({
  providers,
  id,
}: {
  providers: StreamingProvider[];
  id: number;
}) {
  return (
    <section
      aria-labelledby="watch-heading"
      className="mt-10 border-t border-neutral-200 pt-8"
    >
      <h2 id="watch-heading" className="text-2xl font-medium">
        Onde assistir
      </h2>
      {providers.length ? (
        <>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Links externos informados pelo AniList. A disponibilidade e a
            assinatura dependem do serviço e da região.
          </p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {providers.map((provider) => (
              <li key={provider.url}>
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-4 rounded border border-brand px-4 py-2 text-sm text-brand hover:bg-brand/10"
                >
                  {provider.name}
                  <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 leading-7 text-neutral-600">
          O AniList não informou links de streaming para este título.
        </p>
      )}
      <a
        href={`https://anilist.co/anime/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4"
      >
        Ver título no AniList
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    </section>
  );
}
