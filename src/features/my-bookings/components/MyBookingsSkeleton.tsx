import { Skeleton } from "@/components/ui";

export function MyBookingsSkeleton() {
  return (
    <div
      className="mx-auto flex max-w-content flex-col gap-6 py-6 gutter md:py-10 lg:px-10 lg:py-12"
      aria-busy="true"
    >
      <span className="sr-only">Loading your bookings…</span>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80 rounded-[200px_200px_18px_18px]" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  );
}
