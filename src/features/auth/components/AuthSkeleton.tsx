import { Skeleton } from "@/components/ui";

/** Shown while an auth form loads, in the same shape as the card. */
export function AuthSkeleton() {
  return (
    <div
      className="flex w-full flex-col gap-5 rounded-lg border border-line bg-surface p-5 md:p-7"
      aria-busy="true"
    >
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-13 w-full rounded-full" />
    </div>
  );
}
