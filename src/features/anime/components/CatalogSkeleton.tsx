export function CatalogSkeleton({ announce = true }: { announce?: boolean }) {
  return (
    <div
      role={announce ? "status" : undefined}
      aria-label={announce ? "Loading anime" : undefined}
    >
      {announce && <span className="sr-only">Loading anime...</span>}
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-x-4 gap-y-[21px] sm:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            className="min-h-[270px] rounded-lg bg-neutral-200 motion-safe:animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
