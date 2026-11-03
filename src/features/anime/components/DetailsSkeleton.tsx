export function DetailsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando detalhes"
      className="px-4 pb-12 sm:px-6"
    >
      <span className="sr-only">Carregando detalhes do anime...</span>
      <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
        <div className="h-52 rounded-lg bg-neutral-200 sm:h-72" />
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-10 w-2/3 rounded bg-neutral-200" />
          <div className="h-5 w-1/3 rounded bg-neutral-200" />
          <div className="h-36 rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}
