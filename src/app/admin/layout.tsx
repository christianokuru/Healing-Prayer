import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { ADMIN_LINKS, AreaShell } from "@/features/area-shell";
import { LogoutButton, RequireUser } from "@/features/auth";

// Private area: never in search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AreaShell title="Admin" links={ADMIN_LINKS} logout={<LogoutButton />}>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4 py-10 gutter lg:px-10" aria-busy="true">
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
    </AreaShell>
  );
}
