import { cn } from "@/lib/cn";

type SkeletonProps = { className?: string };

/** Grey placeholder in the shape of content that is loading. Pair with an sr-only "Loading…" label. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <span aria-hidden="true" className={cn("block animate-pulse rounded-md bg-off", className)} />
  );
}
