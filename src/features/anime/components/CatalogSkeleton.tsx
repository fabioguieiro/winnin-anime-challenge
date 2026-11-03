export function CatalogSkeleton() {
  return (
    <div role="status" aria-label="Carregando animes">
      <span className="sr-only">Carregando animes...</span>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-x-4 gap-y-[21px] sm:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            className="aspect-[317/270] rounded-lg bg-neutral-200 motion-safe:animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
