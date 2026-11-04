import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { RequireUser } from "@/features/auth";

// Private area: never in search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex max-w-dashboard flex-col gap-4 py-12 gutter" aria-busy="true">
          <span className="sr-only">Loading…</span>
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      }
    >
      <RequireUser area="/dashboard">{children}</RequireUser>
    </Suspense>
  );
}
