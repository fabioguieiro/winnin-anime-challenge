import type { StreamingProvider } from "../model/details";
import { ProviderLogo } from "./ProviderLogo";

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
        Where to watch
      </h2>
      {providers.length ? (
        <>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            External links provided by AniList. Availability and subscriptions
            depend on the service and region.
          </p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {providers.map((provider) => (
              <li key={provider.url}>
                <a
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${provider.name} (opens in a new tab)`}
                  title={`${provider.name} (opens in a new tab)`}
                  className="flex min-h-20 min-w-24 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-3 transition-colors hover:border-brand hover:bg-brand/5"
                >
                  <ProviderLogo provider={provider} />
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 leading-7 text-neutral-600">
          AniList has not provided streaming links for this title.
        </p>
      )}
      <a
        href={`https://anilist.co/anime/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4"
      >
        View title on AniList
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </section>
  );
}
