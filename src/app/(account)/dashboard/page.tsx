import type { Metadata } from "next";
import { Suspense } from "react";
import { MyBookings, MyBookingsSkeleton } from "@/features/my-bookings";

export const metadata: Metadata = { title: "My bookings" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<MyBookingsSkeleton />}>
      <MyBookings />
    </Suspense>
  );
}
