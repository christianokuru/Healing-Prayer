import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { RequireUser } from "@/features/auth";
import { SiteHeader } from "@/features/site-shell";

// Temporary shell. The admin sidebar layout (UI.md section 4.3) comes with the admin screens.
// Private area: never in search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto flex max-w-admin flex-col gap-4 py-12 gutter" aria-busy="true">
              <span className="sr-only">Loading…</span>
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          }
        >
          <RequireUser area="/admin" role="admin">
            {children}
          </RequireUser>
        </Suspense>
      </main>
    </div>
  );
}
