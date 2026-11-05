import type { Metadata } from "next";
import { Suspense } from "react";
import { AreaShell, MEMBER_LINKS } from "@/features/area-shell";
import { LogoutButton, RequireUser } from "@/features/auth";
import { MyBookingsSkeleton } from "@/features/my-bookings";

// Private area: never in search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <AreaShell title="My account" links={MEMBER_LINKS} logout={<LogoutButton />}>
      <Suspense fallback={<MyBookingsSkeleton />}>
        <RequireUser area="/dashboard">{children}</RequireUser>
      </Suspense>
    </AreaShell>
  );
}
