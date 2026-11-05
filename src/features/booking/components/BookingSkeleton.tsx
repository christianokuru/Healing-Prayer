import { Skeleton } from "@/components/ui";

/** Shown while the booking flow loads, in the shape of the day list. */
export function BookingSkeleton() {
  return (
    <div
      className="mx-auto grid max-w-content gap-5 pt-6 gutter pb-16 lg:grid-cols-[1fr_340px]"
      aria-busy="true"
    >
      <span className="sr-only">Loading free times…</span>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64 rounded-full" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="hidden h-56 rounded-lg lg:block" />
    </div>
  );
}
