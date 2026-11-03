export function DetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading details" className="pb-12">
      <span className="sr-only">Loading anime details...</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="h-36 bg-neutral-200" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="-mt-14 flex items-end gap-4 sm:gap-6">
            <div className="relative aspect-[2/3] w-24 shrink-0 rounded-lg bg-neutral-300 sm:w-28" />
            <div className="min-w-0 flex-1 space-y-2 pt-14">
              <div className="h-9 w-2/3 rounded bg-neutral-200" />
              <div className="h-6 w-1/2 rounded bg-neutral-100" />
              <div className="h-9 w-24 rounded bg-neutral-200" />
            </div>
          </div>
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
            <div>
              <div className="flex h-11 items-center">
                <div className="h-6 w-24 rounded bg-neutral-200" />
              </div>
              <div className="mt-2 h-18 rounded bg-neutral-100" />
            </div>
            <div className="h-[430px] rounded-lg bg-neutral-100 p-5">
              <div className="h-7 w-32 rounded bg-neutral-200" />
              <div className="mt-6 space-y-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-5 rounded bg-neutral-200" />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl bg-neutral-100 p-4 sm:p-5">
            <div className="h-7 w-28 rounded bg-neutral-200" />
            <div className="my-2 h-11 w-1/3 rounded bg-neutral-200" />
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video w-68 shrink-0 rounded-xl bg-neutral-200"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
